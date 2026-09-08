import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function PreviewPage() {
  const [previewHtml, setPreviewHtml] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const response = await fetch(`${API_BASE}/invoice/${id}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error('Invoice not found');
          throw new Error('Failed to load invoice');
        }
        const invoice = await response.json();
        const previewResponse = await fetch(`${API_BASE}/invoice/preview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invoice)
        });
        if (!previewResponse.ok) throw new Error('Preview generation failed');
        const result = await previewResponse.json();
        setPreviewHtml(result.html);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Invoice Preview</h1>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => window.print()}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
            >
              Print
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
            >
              ← Back
            </button>
            <button
              onClick={async () => {
                try {
                  const response = await fetch(`${API_BASE}/invoice/${id}`);
                  if (!response.ok) throw new Error('Invoice not found');
                  const invoice = await response.json();
                  const pdfResponse = await fetch(`${API_BASE}/invoice/pdf`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(invoice)
                  });
                  if (!pdfResponse.ok) throw new Error('PDF generation failed');
                  const blob = await pdfResponse.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Invoice_${invoice.formData.refNo || 'Draft'}_${invoice.formData.date}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                } catch (err) {
                  alert('PDF download failed: ' + err.message);
                }
              }}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">Error: {error}</p>
            <button onClick={() => navigate('/')} className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline">
              Go to Home
            </button>
          </div>
        )}
        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading preview...</p>
          </div>
        ) : (
          <div 
            className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm"
            style={{ minHeight: '800px' }}
            dangerouslySetInnerHTML={{ __html: previewHtml || '' }}
          />
        )}
      </div>
    </div>
  );
}
