import { numberToWords } from '../utils/numberToWords';

export default function InvoiceTemplate2({ company, formData, getSubtotal, getTotalGst, getGrandTotal, getTotalForWords, calculateExclTax, calculateGst, calculateInclTax }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const subtotal = getSubtotal();
  const totalGst = getTotalGst();
  const grandTotal = getGrandTotal();
  const totalForWords = getTotalForWords();

  const refNo = formData.refNo || 'PCSS/LHR/5972';
  const date = formData.date;
  const clientName = formData.clientName || 'Gas & Oil pakistan ltd.';
  const attn = formData.attn || 'Mr. Qasim Jamil sb';
  const address = formData.address || '23-T Gulberg II Lahore.';
  const quotation = formData.subject || 'Quotation for Diesel Generator Parts';
  const additionalLabel = formData.additionalChargesLabel || 'Software Charges / Overhead';
  const additionalAmount = formData.additionalCharges || 0;
  const note = formData.note || 'Our Quotation is valid for 01 week from the quotation issue date.';

  return (
    <div className="invoice-template p-4" style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', background: '#fff' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
        <img 
          src={company.logo} 
          alt={company.name} 
          style={{ width: '90px', height: '90px', objectFit: 'contain' }}
        />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#000' }}>POWER CONTROL</div>
            <div style={{ fontSize: '10px', color: '#333' }}>SALES & SERVICES</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#000', marginBottom: '6px' }}>
            {company.name}
          </h1>
          <p style={{ fontSize: '10px', color: '#333', marginBottom: '2px' }}>{company.address}</p>
          <p style={{ fontSize: '10px', color: '#333', marginBottom: '2px' }}>
            Tel: <a href={company.phoneLink} style={{ color: '#000', textDecoration: 'none' }}>{company.phone}</a>
          </p>
          <p style={{ fontSize: '10px', color: '#333' }}>
            E-mail: <a href={company.emailLink} style={{ color: '#000', textDecoration: 'none' }}>{company.email}</a>
          </p>
        </div>
      </div>

      <table className="w-full mb-3" style={{ borderCollapse: 'collapse', border: '1px solid #000' }}>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #000', padding: '5px', width: '12%', fontWeight: 'bold' }}>Ref #</td>
            <td style={{ border: '1px solid #000', padding: '5px', width: '21%' }}>{refNo}</td>
            <td style={{ border: '1px solid #000', padding: '5px', width: '12%', fontWeight: 'bold' }}>Date:</td>
            <td style={{ border: '1px solid #000', padding: '5px', width: '21%' }}>{date}</td>
            <td style={{ border: '1px solid #000', padding: '5px', width: '12%', fontWeight: 'bold' }}>M/S:</td>
            <td style={{ border: '1px solid #000', padding: '5px', width: '22%' }}>{clientName}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '5px', width: '12%', fontWeight: 'bold' }}>Attn:</td>
            <td style={{ border: '1px solid #000', padding: '5px', width: '21%' }}>{attn}</td>
            <td style={{ border: '1px solid #000', padding: '5px', width: '12%', fontWeight: 'bold' }}>Add:</td>
            <td style={{ border: '1px solid #000', padding: '5px', width: '21%' }}>{address}</td>
            <td style={{ border: '1px solid #000', padding: '5px', width: '12%', fontWeight: 'bold' }}>Quotation:</td>
            <td style={{ border: '1px solid #000', padding: '5px', width: '22%' }}>{quotation}</td>
          </tr>
        </tbody>
      </table>

      <table style={{ fontSize: '10px', marginBottom: '12px', borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #000', padding: '5px', width: '6%', background: '#f0f0f0' }}>S. NO</th>
            <th style={{ border: '1px solid #000', padding: '5px', width: '32%', background: '#f0f0f0', textAlign: 'left' }}>DESCRIPTION</th>
            <th style={{ border: '1px solid #000', padding: '5px', width: '8%', background: '#f0f0f0', textAlign: 'center' }}>QTY</th>
            <th style={{ border: '1px solid #000', padding: '5px', width: '12%', background: '#f0f0f0', textAlign: 'right' }}>UNIT PRICE</th>
            <th style={{ border: '1px solid #000', padding: '5px', width: '14%', background: '#f0f0f0', textAlign: 'right' }}>VALUE EXCLUDING SALES TAX</th>
            <th style={{ border: '1px solid #000', padding: '5px', width: '14%', background: '#f0f0f0', textAlign: 'right' }}>GST 18%</th>
            <th style={{ border: '1px solid #000', padding: '5px', width: '14%', background: '#f0f0f0', textAlign: 'right' }}>VALUE INCLUDING SAIFS TAX</th>
          </tr>
        </thead>
        <tbody>
          {formData.items.map((item, index) => {
            const exclTax = calculateExclTax(item);
            const gst = calculateGst(item);
            const inclTax = calculateInclTax(item);
            return (
              <tr key={index}>
                <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', width: '6%' }}>{index + 1}</td>
                <td style={{ border: '1px solid #000', padding: '4px', width: '32%' }}>{item.description || 'Item Description'}</td>
                <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', width: '8%' }}>{item.qty || 1}</td>
                <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', width: '12%' }}>{formatCurrency(item.unitPrice || 0)}</td>
                <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', width: '14%' }}>{formatCurrency(exclTax)}</td>
                <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', width: '14%' }}>{formatCurrency(gst)}</td>
                <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', width: '14%' }}>{formatCurrency(inclTax)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '6px 0' }}>
        <div style={{ width: '220px' }}>
          <div style={{ border: '1px solid #000', padding: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
            <span>Total with Tax (A)</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '4px 0' }}>
        <div style={{ width: '220px' }}>
          <div style={{ border: '1px solid #000', padding: '6px', display: 'flex', justifyContent: 'space-between' }}>
            <span>{additionalLabel}</span>
            <span>{formatCurrency(additionalAmount)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '6px 0' }}>
        <div style={{ width: '220px' }}>
          <div style={{ border: '1px solid #000', padding: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
            <span>Grand Total A+B with Taxes</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <p><strong>In Words:</strong> {totalForWords > 0 ? numberToWords(Math.round(totalForWords)) : ''}</p>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <p style={{ color: '#c0392b', fontWeight: 'bold', fontSize: '10px' }}>GENERAL TERMS & CONDITIONS</p>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <p><strong>VALIDITY:</strong> {note}</p>
        <p style={{ marginTop: '4px' }}><strong>TAXES:</strong> Inclusive of All Govt Taxes</p>
        <p style={{ marginTop: '4px' }}><strong>PAYMENT:</strong> 100% advance with Confirm Purchase order.</p>
        <p style={{ marginTop: '4px' }}><strong>PERIOD:</strong> 07 working Days.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '220px', textAlign: 'center' }}>
          {company.signature && (
            <img 
              src={company.signature} 
              alt="signature" 
              style={{ width: '140px', height: '70px', objectFit: 'contain', marginBottom: '10px' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
