import { numberToWords } from '../utils/numberToWords';

export default function InvoiceTemplate1({ company, formData, getSubtotal, getTotalForWords }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const subtotal = getSubtotal();
  const totalForWords = getTotalForWords();
  
  const refNo = formData.refNo || 'SES/LHR/4634';
  const date = formData.date;
  const clientName = formData.clientName || 'Six B Foods Inds.';
  const attn = formData.attn || 'Mr. Abid sb';
  const address = formData.address;
  const subject = formData.subject || 'Invoice for Month of May 2026.';

  return (
    <div className="invoice-template p-4" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', background: '#fff' }}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
        <img 
          src={company.logo} 
          alt={company.name} 
          style={{ width: '100px', height: '100px', objectFit: 'contain' }}
        />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#000' }}>SABIR ENGINEERING</div>
            <div style={{ fontSize: '11px', color: '#333' }}>SERVICES</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#000', marginBottom: '6px' }}>
            {company.name}
          </h1>
          <p style={{ fontSize: '11px', color: '#333', marginBottom: '3px' }}>{company.address}</p>
          <p style={{ fontSize: '11px', color: '#333', marginBottom: '3px' }}>
            Tel: <a href={company.phoneLink} style={{ color: '#000', textDecoration: 'none' }}>{company.phone}</a>
          </p>
          <p style={{ fontSize: '11px', color: '#333' }}>
            E-mail: <a href={company.emailLink} style={{ color: '#000', textDecoration: 'none' }}>{company.email}</a>
          </p>
        </div>
      </div>

      <table className="w-full mb-4" style={{ borderCollapse: 'collapse', border: '1px solid #000' }}>
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
            <td style={{ border: '1px solid #000', padding: '5px', width: '12%', fontWeight: 'bold' }}>SUB:</td>
            <td style={{ border: '1px solid #000', padding: '5px', width: '22%' }}>{subject}</td>
          </tr>
        </tbody>
      </table>

      <table className="w-full mb-4" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #000', padding: '6px', width: '10%', background: '#f0f0f0' }}>S.NO.</th>
            <th style={{ border: '1px solid #000', padding: '6px', width: '45%', background: '#f0f0f0', textAlign: 'left' }}>Description</th>
            <th style={{ border: '1px solid #000', padding: '6px', width: '10%', background: '#f0f0f0', textAlign: 'center' }}>Qty</th>
            <th style={{ border: '1px solid #000', padding: '6px', width: '10%', background: '#f0f0f0', textAlign: 'center' }}>Unit</th>
            <th style={{ border: '1px solid #000', padding: '6px', width: '12.5%', background: '#f0f0f0', textAlign: 'right' }}>Unit Price</th>
            <th style={{ border: '1px solid #000', padding: '6px', width: '12.5%', background: '#f0f0f0', textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {formData.items.map((item, index) => {
            const amount = (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0);
            const description = item.description || `AMC Visit of Month of ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
            return (
              <tr key={index}>
                <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center', width: '10%' }}>{index + 1}</td>
                <td style={{ border: '1px solid #000', padding: '5px', width: '45%' }}>{description}</td>
                <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center', width: '10%' }}>{item.qty || 1}</td>
                <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center', width: '10%' }}>{item.unit || 'Nos'}</td>
                <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'right', width: '12.5%' }}>{formatCurrency(item.unitPrice || 0)}</td>
                <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'right', width: '12.5%' }}>{formatCurrency(amount)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '16px 0' }}>
        <div style={{ width: '200px' }}>
          <div style={{ border: '1px solid #000', padding: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
            <span>Total Amount</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <p><strong>Amount In Word:</strong> {totalForWords > 0 ? numberToWords(Math.round(totalForWords)) : ''}</p>
      </div>

      {formData.note && (
        <div style={{ marginBottom: '16px' }}>
          <p><strong>Note:</strong> {formData.note}</p>
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <p style={{ color: '#c0392b', fontWeight: 'bold', fontSize: '11px' }}>GENERAL TERMS & CONDITIONS</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '240px', textAlign: 'center' }}>
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
