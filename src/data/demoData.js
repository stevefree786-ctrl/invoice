export const demoData = {
  simple: {
    refNo: 'SES/LHR/4634',
    date: '2026-05-31',
    clientName: 'Six B Foods Inds.',
    attn: 'Mr. Abid sb',
    address: '',
    subject: '',
    items: [
      { description: 'AMC Visit of Month of May 2026', qty: 1, unit: 'Nos', unitPrice: 25000 }
    ],
    note: ''
  },
  tax: {
    refNo: 'PCSS/LHR/5972',
    date: '2026-07-26',
    clientName: 'Gas & Oil pakistan ltd.',
    attn: 'Mr. Qasim Jamil sb',
    address: '',
    subject: '',
    items: [
      { description: 'HMI 211 Used', qty: 1, unitPrice: 85000, gstPercent: 18 },
      { description: 'Oil Pressure Sensor QST9 New', qty: 1, unitPrice: 45000, gstPercent: 18 },
      { description: 'Actuator', qty: 1, unitPrice: 4700, gstPercent: 18 }
    ],
    additionalChargesLabel: '',
    additionalCharges: 0,
    note: ''
  }
};

export const getDemoData = (template) => demoData[template] || demoData.simple;

export const getHistory = () => {
  try {
    const history = localStorage.getItem('invoiceHistory');
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

export const saveToHistory = (entry) => {
  try {
    const history = getHistory();
    const newEntry = {
      ...entry,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    history.unshift(newEntry);
    localStorage.setItem('invoiceHistory', JSON.stringify(history.slice(0, 50)));
  } catch (e) {
    console.error('Failed to save history:', e);
  }
};

export const clearHistory = () => {
  localStorage.removeItem('invoiceHistory');
};
