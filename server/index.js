const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));

const PROJECT_ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const SRC_ASSETS = path.join(PROJECT_ROOT, 'src', 'assets');
const DATA_DIR = path.join(PROJECT_ROOT, 'data');
const INVOICES_FILE = path.join(DATA_DIR, 'invoices.json');
const BUILD_DIR = path.join(PROJECT_ROOT, 'dist');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readInvoices() {
  try {
    if (fs.existsSync(INVOICES_FILE)) {
      const data = fs.readFileSync(INVOICES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to read invoices:', e);
  }
  return {};
}

function writeInvoices(invoices) {
  try {
    fs.writeFileSync(INVOICES_FILE, JSON.stringify(invoices, null, 2));
  } catch (e) {
    console.error('Failed to write invoices:', e);
  }
}

function readAssetAsBase64(filename) {
  const filePath = path.join(SRC_ASSETS, filename);
  if (!fs.existsSync(filePath)) {
    const publicPath = path.join(PUBLIC_DIR, filename);
    if (fs.existsSync(publicPath)) {
      const content = fs.readFileSync(publicPath);
      const ext = path.extname(publicPath).slice(1);
      return `data:image/${ext};base64,${content.toString('base64')}`;
    }
    return '';
  }
  const content = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1);
  return `data:image/${ext};base64,${content.toString('base64')}`;
}

const ASSETS = {
  sabirLogo: readAssetAsBase64('sabir-logo.png'),
  sabirSign: readAssetAsBase64('sign-sabir.png'),
  powerControlLogo: readAssetAsBase64('power-control-logo.png'),
  powerControlSign: readAssetAsBase64('sign-powercontrol.png')
};

const COMPANY_DEFAULTS = {
  sabir: {
    id: 'sabir',
    name: 'SABIR ENGINEERING SERVICES',
    address: 'H.M.A Plaza, 22 Shahra Fatima Jinnah Road, Lahore.',
    phone: '0300-8402452, 0333-4272452',
    email: 'sabirengineeringservices@gmail.com',
    signatureImage: ASSETS.sabirSign
  },
  powerControl: {
    id: 'powerControl',
    name: 'Power Control Sales and Services',
    address: '364 Rose Block Park View Villas 17 KM Multan Road Lahore.',
    phone: '03008402452, 0333-4272452',
    email: 'info@pcss.pk',
    signatureImage: ASSETS.powerControlSign
  }
};

function numberToWords(n) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (n === 0) return 'Zero';
  
  const convertLessThanThousand = (num) => {
    if (num === 0) return '';
    if (num < 20) return ones[num] + ' ';
    if (num < 100) return tens[Math.floor(num / 10)] + ' ' + convertLessThanThousand(num % 10);
    return ones[Math.floor(num / 100)] + ' Hundred ' + convertLessThanThousand(num % 100);
  };
  
  let result = '';
  if (n >= 10000000) {
    result += convertLessThanThousand(Math.floor(n / 10000000)) + ' Crore ';
    n %= 10000000;
  }
  if (n >= 100000) {
    result += convertLessThanThousand(Math.floor(n / 100000)) + ' Lac ';
    n %= 100000;
  }
  if (n >= 1000) {
    result += convertLessThanThousand(Math.floor(n / 1000)) + ' Thousand ';
    n %= 1000;
  }
  result += convertLessThanThousand(n);
  
  return result.trim() + ' Rupees Only';
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function getCompanyInfo(companyId) {
  return COMPANY_DEFAULTS[companyId] || COMPANY_DEFAULTS.sabir;
}

function renderTemplate1(company, formData) {
  const companyInfo = getCompanyInfo(company.id);
  const subtotal = formData.items.reduce((sum, item) => sum + (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0), 0);
  const totalForWords = subtotal;
  const logo = ASSETS.sabirLogo || company.logo || '';
  const sign = companyInfo.signatureImage || '';
  
  const refNo = formData.refNo || 'SES/LHR/4634';
  const date = formData.date || '';
  const clientName = formData.clientName || 'Six B Foods Inds.';
  const attn = formData.attn || 'Mr. Abid sb';
  const address = formData.address || '';
  const subject = formData.subject || 'Invoice for Month of May 2026.';
  
  const rows = formData.items.map((item, index) => {
    const amount = (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0);
    const description = item.description || `AMC Visit of Month of ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    return `<tr>
      <td style="border:1px solid #000;padding:5px;text-align:center;width:10%">${index + 1}</td>
      <td style="border:1px solid #000;padding:5px;width:45%;text-align:left;">${description}</td>
      <td style="border:1px solid #000;padding:5px;text-align:center;width:10%">${item.qty || 1}</td>
      <td style="border:1px solid #000;padding:5px;text-align:center;width:10%">${item.unit || 'Nos'}</td>
      <td style="border:1px solid #000;padding:5px;text-align:right;width:12.5%">${formatCurrency(item.unitPrice || 0)}</td>
      <td style="border:1px solid #000;padding:5px;text-align:right;width:12.5%">${formatCurrency(amount)}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #000; background: #fff; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #000; padding: 5px; }
    th { background-color: #f0f0f0; }
    a { color: #000; text-decoration: none; }
  </style>
</head>
<body>
  <div style="padding: 20px; background: #fff;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;">
      <div style="display:flex;align-items:flex-start;gap:12px;">
        <img src="${logo}" alt="logo" style="width:85px;height:85px;object-fit:contain;" />
        <div>
          <div style="font-weight:bold;font-size:16px;color:#000;">SABIR ENGINEERING</div>
          <div style="font-size:11px;color:#333;">SERVICES</div>
        </div>
      </div>
      <div style="text-align:right;">
        <h1 style="font-size:22px;font-weight:bold;color:#000;margin-bottom:8px;">${companyInfo.name}</h1>
        <p style="font-size:11px;color:#333;margin-bottom:3px;">${companyInfo.address}</p>
        <p style="font-size:11px;color:#333;margin-bottom:3px;">Tel: <a href="tel:${companyInfo.phone}">${companyInfo.phone}</a></p>
        <p style="font-size:11px;color:#333;">E-mail: <a href="mailto:${companyInfo.email}">${companyInfo.email}</a></p>
      </div>
    </div>

    <table style="width:100%;border:1px solid #000;margin-bottom:16px;">
      <tr>
        <td style="border:1px solid #000;padding:5px;width:12%;font-weight:bold;">Ref #</td>
        <td style="border:1px solid #000;padding:5px;width:21%">${refNo}</td>
        <td style="border:1px solid #000;padding:5px;width:12%;font-weight:bold;">Date:</td>
        <td style="border:1px solid #000;padding:5px;width:21%">${date}</td>
        <td style="border:1px solid #000;padding:5px;width:12%;font-weight:bold;">M/S:</td>
        <td style="border:1px solid #000;padding:5px;width:22%">${clientName}</td>
      </tr>
      <tr>
        <td style="border:1px solid #000;padding:5px;width:12%;font-weight:bold;">Attn:</td>
        <td style="border:1px solid #000;padding:5px;width:21%">${attn}</td>
        <td style="border:1px solid #000;padding:5px;width:12%;font-weight:bold;">Add:</td>
        <td style="border:1px solid #000;padding:5px;width:21%">${address}</td>
        <td style="border:1px solid #000;padding:5px;width:12%;font-weight:bold;">SUB:</td>
        <td style="border:1px solid #000;padding:5px;width:22%">${subject}</td>
      </tr>
    </table>

    <table style="margin-bottom:16px;border-collapse:collapse;width:100%;">
      <thead>
        <tr>
          <th style="border:1px solid #000;padding:6px;width:10%;background:#f0f0f0;">S.NO.</th>
          <th style="border:1px solid #000;padding:6px;width:45%;background:#f0f0f0;text-align:left;">Description</th>
          <th style="border:1px solid #000;padding:6px;width:10%;background:#f0f0f0;text-align:center;">Qty</th>
          <th style="border:1px solid #000;padding:6px;width:10%;background:#f0f0f0;text-align:center;">Unit</th>
          <th style="border:1px solid #000;padding:6px;width:12.5%;background:#f0f0f0;text-align:right;">Unit Price</th>
          <th style="border:1px solid #000;padding:6px;width:12.5%;background:#f0f0f0;text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div style="display:flex;justify-content:flex-end;margin:16px 0;">
      <div style="width:200px;">
        <div style="border:1px solid #000;padding:8px;display:flex;justify-content:space-between;font-weight:bold;">
          <span>Total Amount</span>
          <span>${formatCurrency(subtotal)}</span>
        </div>
      </div>
    </div>

    <div style="margin-bottom:16px;">
      <p><strong>Amount In Word:</strong> ${totalForWords > 0 ? numberToWords(Math.round(totalForWords)) : ''}</p>
    </div>

    ${formData.note ? `<div style="margin-bottom:16px;"><p><strong>Note:</strong> ${formData.note}</p></div>` : ''}

    <div style="margin-bottom:24px;">
      <p style="color:#c0392b;font-weight:bold;font-size:11px;">GENERAL TERMS & CONDITIONS</p>
    </div>

    <div style="display:flex;justify-content:flex-end;">
      <div style="width:220px;text-align:center;">
        ${sign ? `<img src="${sign}" alt="signature" style="width:120px;height:60px;object-fit:contain;margin-bottom:8px;" />` : '<div style="height:50px;border-bottom:1px solid #333;margin-bottom:5px;"></div>'}
        <p style="font-size:11px;font-weight:bold;">Authorized Signature</p>
        <p style="font-size:10px;color:#333;">For ${companyInfo.name}</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function renderTemplate2(company, formData) {
  const companyInfo = getCompanyInfo(company.id);
  const subtotal = formData.items.reduce((sum, item) => sum + (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0), 0);
  const totalGst = formData.items.reduce((sum, item) => sum + ((parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0) * (parseFloat(item.gstPercent) || 18) / 100), 0);
  const grandTotal = subtotal + totalGst + (parseFloat(formData.additionalCharges) || 0);
  const totalForWords = grandTotal;
  const logo = ASSETS.powerControlLogo || company.logo || '';
  const sign = companyInfo.signatureImage || '';
  
  const refNo = formData.refNo || 'PCSS/LHR/5972';
  const date = formData.date || '';
  const clientName = formData.clientName || 'Gas & Oil pakistan ltd.';
  const attn = formData.attn || 'Mr. Qasim Jamil sb';
  const address = formData.address || '23-T Gulberg II Lahore.';
  const quotation = formData.subject || 'Quotation for Diesel Generator Parts';
  const additionalLabel = formData.additionalChargesLabel || 'Software Charges / Overhead';
  const additionalAmount = formData.additionalCharges || 0;
  const note = formData.note || 'Our Quotation is valid for 01 week from the quotation issue date.';

  const rows = formData.items.map((item, index) => {
    const exclTax = (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0);
    const gst = exclTax * (parseFloat(item.gstPercent) || 18) / 100;
    const inclTax = exclTax + gst;
    return `<tr>
      <td style="border:1px solid #000;padding:4px;text-align:center;width:6%">${index + 1}</td>
      <td style="border:1px solid #000;padding:4px;width:32%">${item.description || 'Item Description'}</td>
      <td style="border:1px solid #000;padding:4px;text-align:center;width:8%">${item.qty || 1}</td>
      <td style="border:1px solid #000;padding:4px;text-align:right;width:12%">${formatCurrency(item.unitPrice || 0)}</td>
      <td style="border:1px solid #000;padding:4px;text-align:right;width:14%">${formatCurrency(exclTax)}</td>
      <td style="border:1px solid #000;padding:4px;text-align:right;width:14%">${formatCurrency(gst)}</td>
      <td style="border:1px solid #000;padding:4px;text-align:right;width:14%">${formatCurrency(inclTax)}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #000; background: #fff; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #000; padding: 4px; }
    th { background-color: #f0f0f0; }
    a { color: #000; text-decoration: none; }
  </style>
</head>
<body>
  <div style="padding: 20px; background: #fff;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
      <div style="display:flex;align-items:flex-start;gap:12px;">
        <img src="${logo}" alt="logo" style="width:75px;height:75px;object-fit:contain;" />
        <div>
          <div style="font-weight:bold;font-size:14px;color:#000;">POWER CONTROL</div>
          <div style="font-size:10px;color:#333;">SALES & SERVICES</div>
        </div>
      </div>
      <div style="text-align:right;">
        <h1 style="font-size:20px;font-weight:bold;color:#000;margin-bottom:6px;">${companyInfo.name}</h1>
        <p style="font-size:10px;color:#333;margin-bottom:2px;">${companyInfo.address}</p>
        <p style="font-size:10px;color:#333;margin-bottom:2px;">Tel: <a href="tel:${companyInfo.phone}">${companyInfo.phone}</a></p>
        <p style="font-size:10px;color:#333;">E-mail: <a href="mailto:${companyInfo.email}">${companyInfo.email}</a></p>
      </div>
    </div>

    <table style="width:100%;border:1px solid #000;margin-bottom:12px;">
      <tr>
        <td style="border:1px solid #000;padding:5px;width:12%;font-weight:bold;">Ref #</td>
        <td style="border:1px solid #000;padding:5px;width:21%">${refNo}</td>
        <td style="border:1px solid #000;padding:5px;width:12%;font-weight:bold;">Date:</td>
        <td style="border:1px solid #000;padding:5px;width:21%">${date}</td>
        <td style="border:1px solid #000;padding:5px;width:12%;font-weight:bold;">M/S:</td>
        <td style="border:1px solid #000;padding:5px;width:22%">${clientName}</td>
      </tr>
      <tr>
        <td style="border:1px solid #000;padding:5px;width:12%;font-weight:bold;">Attn:</td>
        <td style="border:1px solid #000;padding:5px;width:21%">${attn}</td>
        <td style="border:1px solid #000;padding:5px;width:12%;font-weight:bold;">Add:</td>
        <td style="border:1px solid #000;padding:5px;width:21%">${address}</td>
        <td style="border:1px solid #000;padding:5px;width:12%;font-weight:bold;">Quotation:</td>
        <td style="border:1px solid #000;padding:5px;width:22%">${quotation}</td>
      </tr>
    </table>

    <table style="font-size:10px;margin-bottom:12px;border-collapse:collapse;width:100%;">
      <thead>
        <tr>
          <th style="border:1px solid #000;padding:5px;width:6%;background:#f0f0f0;">S. NO</th>
          <th style="border:1px solid #000;padding:5px;width:32%;background:#f0f0f0;text-align:left;">DESCRIPTION</th>
          <th style="border:1px solid #000;padding:5px;width:8%;background:#f0f0f0;text-align:center;">QTY</th>
          <th style="border:1px solid #000;padding:5px;width:12%;background:#f0f0f0;text-align:right;">UNIT PRICE</th>
          <th style="border:1px solid #000;padding:5px;width:14%;background:#f0f0f0;text-align:right;">VALUE EXCLUDING SALES TAX</th>
          <th style="border:1px solid #000;padding:5px;width:14%;background:#f0f0f0;text-align:right;">GST 18%</th>
          <th style="border:1px solid #000;padding:5px;width:14%;background:#f0f0f0;text-align:right;">VALUE INCLUDING SAIFS TAX</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div style="display:flex;justify-content:flex-end;margin:6px 0;">
      <div style="width:220px;">
        <div style="border:1px solid #000;padding:6px;display:flex;justify-content:space-between;font-weight:bold;">
          <span>Total with Tax (A)</span>
          <span>${formatCurrency(subtotal)}</span>
        </div>
      </div>
    </div>

    <div style="display:flex;justify-content:flex-end;margin:4px 0;">
      <div style="width:220px;">
        <div style="border:1px solid #000;padding:6px;display:flex;justify-content:space-between;">
          <span>${additionalLabel}</span>
          <span>${formatCurrency(additionalAmount)}</span>
        </div>
      </div>
    </div>

    <div style="display:flex;justify-content:flex-end;margin:6px 0;">
      <div style="width:220px;">
        <div style="border:1px solid #000;padding:6px;display:flex;justify-content:space-between;font-weight:bold;">
          <span>Grand Total A+B with Taxes</span>
          <span>${formatCurrency(grandTotal)}</span>
        </div>
      </div>
    </div>

    <div style="margin-bottom:10px;">
      <p><strong>In Words:</strong> ${totalForWords > 0 ? numberToWords(Math.round(totalForWords)) : ''}</p>
    </div>

    <div style="margin-bottom:12px;">
      <p style="color:#c0392b;font-weight:bold;font-size:10px;">GENERAL TERMS & CONDITIONS</p>
    </div>

    <div style="margin-bottom:10px;">
      <p><strong>VALIDITY:</strong> ${note}</p>
      <p style="margin-top:4px;"><strong>TAXES:</strong> Inclusive of All Govt Taxes</p>
      <p style="margin-top:4px;"><strong>PAYMENT:</strong> 100% advance with Confirm Purchase order.</p>
      <p style="margin-top:4px;"><strong>PERIOD:</strong> 07 working Days.</p>
    </div>

    <div style="display:flex;justify-content:flex-end;">
      <div style="width:200px;text-align:center;">
        ${sign ? `<img src="${sign}" alt="signature" style="width:120px;height:60px;object-fit:contain;margin-bottom:8px;" />` : '<div style="height:45px;border-bottom:1px solid #333;margin-bottom:5px;"></div>'}
        <p style="font-size:10px;font-weight:bold;">Authorized Signature</p>
        <p style="font-size:9px;color:#777;">${companyInfo.signatureText || 'For Power Control Sales & Services'}</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function generatePDF(html) {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/invoice/save', (req, res) => {
  try {
    const { company, templateMode, formData } = req.body;
    const invoices = readInvoices();
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    invoices[id] = { company, templateMode, formData, createdAt: new Date().toISOString() };
    writeInvoices(invoices);
    res.json({ id });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: 'Failed to save invoice' });
  }
});

app.get('/api/invoice/:id', (req, res) => {
  try {
    const invoices = readInvoices();
    const invoice = invoices[req.params.id];
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    console.error('Load error:', error);
    res.status(500).json({ error: 'Failed to load invoice' });
  }
});

app.delete('/api/invoice/:id', (req, res) => {
  try {
    const invoices = readInvoices();
    delete invoices[req.params.id];
    writeInvoices(invoices);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

app.post('/api/invoice/preview', async (req, res) => {
  try {
    const { company, templateMode, formData } = req.body;
    const html = templateMode === 'simple' ? renderTemplate1(company, formData) : renderTemplate2(company, formData);
    res.json({ html });
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

app.post('/api/invoice/pdf', async (req, res) => {
  try {
    const { company, templateMode, formData } = req.body;
    const html = templateMode === 'simple' ? renderTemplate1(company, formData) : renderTemplate2(company, formData);
    const pdfBuffer = await generatePDF(html);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_${formData.refNo || 'Draft'}_${formData.date}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

if (fs.existsSync(BUILD_DIR)) {
  app.use(express.static(BUILD_DIR));
  
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(BUILD_DIR, 'index.html'));
  });
}

if (require.main === module) {
  const resolvedPort = process.env.PORT ? parseInt(process.env.PORT, 10) : PORT;
  app.listen(resolvedPort, () => {
    console.log(`Server running on http://localhost:${resolvedPort}`);
    console.log(`Frontend build: ${fs.existsSync(BUILD_DIR) ? BUILD_DIR : 'not found - run npm run build first'}`);
  });
}

module.exports = { app, PORT };
