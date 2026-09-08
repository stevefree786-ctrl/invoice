import { useState, useEffect } from 'react';
import { useNavigate, BrowserRouter, Routes, Route } from 'react-router-dom';
import { getCompanies, getCompany } from './data/companies';
import { getHistory, clearHistory, saveToHistory } from './data/demoData';
import InvoiceForm from './components/InvoiceForm';
import PreviewPage from './pages/PreviewPage';

function HomePage() {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleCompanySelect = (companyId) => {
    const companyData = getCompany(companyId);
    setSelectedCompany(companyData);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setIsFormOpen(false);
    setSelectedCompany(null);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const handleHistoryItemClick = async (entry) => {
    if (entry.invoiceId) {
      navigate(`/preview/${entry.invoiceId}`);
    } else {
      const company = getCompany(entry.company);
      if (company) {
        setSelectedCompany(company);
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const filteredHistory = history.filter(entry => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (entry.formData?.refNo || '').toLowerCase().includes(query) ||
      (entry.formData?.clientName || '').toLowerCase().includes(query) ||
      (entry.formData?.date || '').includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <header className="mb-8 sm:mb-10">
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-600 text-white mb-4 sm:mb-6 shadow-lg shadow-blue-200">
              <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">Professional Invoice Generator</h1>
            <p className="text-gray-600 text-sm sm:text-base px-4 max-w-2xl mx-auto">Select a company template, fill in the details, preview fullscreen with a shareable link, and download your invoice as PDF</p>
          </div>
          
          {!isFormOpen ? (
            <div className="space-y-6 sm:space-y-8">
              <div className="bg-white rounded-2xl shadow-xl shadow-blue-100/60 p-4 sm:p-8 border border-blue-50">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800 text-center">Select Company Template</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
                  {getCompanies().map(company => (
                    <div 
                      key={company.id} 
                      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 cursor-pointer"
                      onClick={() => handleCompanySelect(company.id)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-center gap-3 sm:gap-4 mb-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                          <img 
                            src={company.logo} 
                            alt={company.name} 
                            className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-1 group-hover:text-blue-700 transition-colors">{company.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-500 mb-1 line-clamp-2">{company.address}</p>
                          <p className="text-xs text-gray-500">Tel: {company.phone}</p>
                          <p className="text-xs text-gray-500">Email: {company.email}</p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompanySelect(company.id);
                        }}
                        className="relative w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm sm:text-base shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300"
                      >
                        Select {company.templateLabel}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {history.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl shadow-blue-100/60 p-4 sm:p-8 border border-blue-50">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Recent Invoices</h2>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">Click any card to open its preview</p>
                    </div>
                    <button
                      onClick={handleClearHistory}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm w-full sm:w-auto shadow-md shadow-red-200"
                    >
                      Clear History
                    </button>
                  </div>
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Search by Ref #, client name, or date..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  {filteredHistory.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">No matching invoices found</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {filteredHistory.slice(0, 9).map((entry) => (
                        <div 
                          key={entry.id} 
                          onClick={() => handleHistoryItemClick(entry)}
                          className="group border border-gray-200 rounded-xl p-3 sm:p-4 hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-white"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate pr-2 group-hover:text-blue-700 transition-colors">{entry.formData?.refNo || 'No Ref #'}</h3>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex-shrink-0">
                              {entry.templateMode === 'simple' ? 'Invoice' : 'Quotation'}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">{entry.formData?.clientName || 'Unknown Client'}</p>
                          <p className="text-xs text-gray-500 mb-3">{entry.formData?.date}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleHistoryItemClick(entry);
                              }}
                              className="flex-1 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                            >
                              Open Preview
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const company = getCompany(entry.company);
                                if (company) {
                                  setSelectedCompany(company);
                                  setIsFormOpen(true);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                              }}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <button 
                  onClick={handleBack}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm sm:text-base shadow-md"
                >
                  ← Back to Company Selection
                </button>
              </div>
              <InvoiceForm 
                company={selectedCompany} 
                templateMode={selectedCompany.template}
              />
            </div>
          )}
        </header>
        
        <footer className="mt-12 sm:mt-16 text-center text-gray-500 text-xs sm:text-sm">
          <p>Professional Invoice Generator | Built with React & Tailwind CSS</p>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/preview/:id" element={<PreviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
