import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmptyItem, getEmptyFormData } from '../data/companies';
import { getDemoData, getHistory, saveToHistory, clearHistory } from '../data/demoData';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function InvoiceForm({ company, templateMode }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(getEmptyFormData(templateMode));
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setFormData(getEmptyFormData(templateMode));
    setHistory(getHistory());
  }, [templateMode]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, getEmptyItem(templateMode)]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const loadDemoData = () => {
    const demo = getDemoData(templateMode);
    setFormData({
      ...getEmptyFormData(templateMode),
      ...demo,
      items: demo.items.map(item => ({ ...getEmptyItem(templateMode), ...item }))
    });
  };

  const loadFromHistory = (entry) => {
    setFormData(entry.formData);
    setShowHistory(false);
  };

  const calculateItemAmount = (item) => {
    return (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0);
  };

  const calculateExclTax = (item) => calculateItemAmount(item);

  const calculateGst = (item) => {
    return calculateExclTax(item) * (parseFloat(item.gstPercent) || 18) / 100;
  };

  const calculateInclTax = (item) => calculateExclTax(item) + calculateGst(item);

  const getSubtotal = () => formData.items.reduce((sum, item) => sum + calculateExclTax(item), 0);

  const getTotalGst = () => formData.items.reduce((sum, item) => sum + calculateGst(item), 0);

  const getGrandTotal = () => getSubtotal() + getTotalGst() + (parseFloat(formData.additionalCharges) || 0);

  const getTotalForWords = () => templateMode === 'simple' ? getSubtotal() : getGrandTotal();

  const handlePreview = async () => {
    setIsLoadingPreview(true);
    setPreviewError(null);
    try {
      const saveResponse = await fetch(`${API_BASE}/invoice/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, templateMode, formData })
      });
      if (!saveResponse.ok) throw new Error('Failed to save invoice');
      const { id } = await saveResponse.json();
      saveToHistory({ company: company.id, templateMode, formData, invoiceId: id });
      setHistory(getHistory());
      navigate(`/preview/${id}`);
    } catch (error) {
      setPreviewError(error.message);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsLoadingPdf(true);
    setPdfError(null);
    try {
      const response = await fetch(`${API_BASE}/invoice/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, templateMode, formData })
      });
      if (!response.ok) throw new Error('PDF generation failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${formData.refNo || 'Draft'}_${formData.date}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      saveToHistory({ company: company.id, templateMode, formData });
      setHistory(getHistory());
    } catch (error) {
      setPdfError(error.message);
    } finally {
      setIsLoadingPdf(false);
    }
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
    setShowHistory(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg shadow-blue-100/60 border border-blue-50 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Invoice Details
          </h2>
          <p className="text-blue-100 text-sm mt-1">Enter the main invoice information</p>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <p className="text-gray-600 text-sm">Fill in the invoice information below</p>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={loadDemoData}
                className="flex-1 sm:flex-none px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium shadow-md shadow-purple-200"
              >
                Load Demo Data
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium shadow-md shadow-indigo-200"
              >
                History ({history.length})
              </button>
            </div>
          </div>
          
          {showHistory && (
            <div className="mb-6 border border-gray-200 rounded-xl p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-700">Invoice History</h3>
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Clear History
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <p className="text-gray-500 text-sm">No history yet. Preview or download an invoice to see it here.</p>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {history.map((entry) => (
                    <div key={entry.id} className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md hover:border-blue-300 transition cursor-pointer"
                         onClick={() => {
                           loadFromHistory(entry);
                           if (entry.invoiceId) {
                             navigate(`/preview/${entry.invoiceId}`);
                           }
                         }}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">{entry.formData.refNo || 'No Ref #'}</p>
                          <p className="text-sm text-gray-600">{entry.formData.clientName || 'Unknown Client'}</p>
                          <p className="text-xs text-gray-500">{entry.formData.date}</p>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {entry.templateMode === 'simple' ? 'Invoice' : 'Quotation'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ref #</label>
              <input
                type="text"
                value={formData.refNo}
                onChange={(e) => handleChange('refNo', e.target.value)}
                placeholder="e.g. SES/LHR/4634"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">M/S (Client Company)</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => handleChange('clientName', e.target.value)}
                placeholder="e.g. Six B Foods Inds."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Attn (Attention)</label>
              <input
                type="text"
                value={formData.attn}
                onChange={(e) => handleChange('attn', e.target.value)}
                placeholder="e.g. Mr. Abid sb"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="form-group mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              rows="2"
              placeholder="Client full address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="form-group mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {templateMode === 'simple' ? 'Subject' : 'Quotation'}
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              placeholder={templateMode === 'simple' ? 'e.g. Invoice for Month of May 2026.' : 'e.g. Quotation for Diesel Generator Parts'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg shadow-blue-100/60 border border-blue-50 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Items
          </h2>
          <p className="text-emerald-100 text-sm mt-1">Add products or services with quantities and prices</p>
        </div>
        <div className="p-6">
          {formData.items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-4 mb-4 hover:border-blue-300 hover:shadow-md transition-all duration-300 bg-white">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-700 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">{index + 1}</span>
                  Item {index + 1}
                </h3>
                {formData.items.length > 1 && (
                  <button
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="e.g. AMC Visit of Month of May 2026"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qty</label>
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                    placeholder="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
                
                {templateMode === 'simple' ? (
                  <>
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        placeholder="e.g. Nos, Pcs, Hours"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (PKR)</label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                  </>
                ) : (
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (PKR)</label>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                )}
                
                {templateMode === 'tax' && (
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST %</label>
                    <input
                      type="number"
                      value={item.gstPercent}
                      onChange={(e) => handleItemChange(index, 'gstPercent', e.target.value)}
                      placeholder="18"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                  </div>
                )}
              </div>
              
              <div className="mt-3 text-right text-sm text-gray-600">
                Amount: {templateMode === 'simple' 
                  ? (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0)
                  : calculateInclTax(item)
                } PKR
              </div>
            </div>
          ))}
          
          <button
            onClick={addItem}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-500 hover:text-blue-600 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Item
          </button>
        </div>
      </div>

      {templateMode === 'tax' && (
        <div className="bg-white rounded-2xl shadow-lg shadow-blue-100/60 border border-blue-50 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Additional Charges
            </h2>
            <p className="text-amber-100 text-sm mt-1">Optional overhead or software charges</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                <input
                  type="text"
                  value={formData.additionalChargesLabel}
                  onChange={(e) => handleChange('additionalChargesLabel', e.target.value)}
                  placeholder="e.g. Software Charges / Overhead"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (PKR)</label>
                <input
                  type="number"
                  value={formData.additionalCharges}
                  onChange={(e) => handleChange('additionalCharges', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg shadow-blue-100/60 border border-blue-50 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            Additional Information
          </h2>
          <p className="text-gray-300 text-sm mt-1">Terms, validity, payment, and delivery notes</p>
        </div>
        <div className="p-6">
          <div className="form-group mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Note / Terms</label>
            <textarea
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              rows="4"
              placeholder="e.g. Our Quotation is valid for 01 week from the quotation issue date.&#10;Payment: 100% advance with Confirm Purchase order.&#10;Period: 07 working Days."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={handlePreview}
          disabled={isLoadingPreview}
          className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {isLoadingPreview ? 'Generating Preview...' : 'Preview Invoice'}
        </button>
        <button
          onClick={handleDownloadPDF}
          disabled={isLoadingPdf}
          className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {isLoadingPdf ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>

      {previewError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800">Preview Error: {previewError}</p>
          <p className="text-red-600 text-sm mt-1">Make sure the backend server is running on port 3001</p>
        </div>
      )}

      {pdfError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800">PDF Error: {pdfError}</p>
          <p className="text-red-600 text-sm mt-1">Make sure the backend server is running on port 3001</p>
        </div>
      )}
    </div>
  );
}
