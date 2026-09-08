export const companies = {
  sabir: {
    id: 'sabir',
    name: 'SABIR ENGINEERING SERVICES',
    logo: '/src/assets/sabir-logo.png',
    signature: '/src/assets/sign-sabir.png',
    address: 'H.M.A Plaza, 22 Shahra Fatima Jinnah Road, Lahore.',
    phone: '0300-8402452, 0333-4272452',
    phoneLink: 'tel:03008402452',
    email: 'sabirengineeringservices@gmail.com',
    emailLink: 'mailto:sabirengineeringservices@gmail.com',
    template: 'simple',
    templateLabel: 'Simple Invoice',
  },
  powerControl: {
    id: 'powerControl',
    name: 'Power Control Sales and Services',
    logo: '/src/assets/power-control-logo.png',
    signature: '/src/assets/sign-powercontrol.png',
    address: '364 Rose Block Park View Villas 17 KM Multan Road Lahore.',
    phone: '03008402452, 0333-4272452',
    phoneLink: 'tel:03008402452',
    email: 'info@pcss.pk',
    emailLink: 'mailto:info@pcss.pk',
    template: 'tax',
    templateLabel: 'Tax Invoice / Quotation',
  },
};

export const getCompany = (id) => companies[id];
export const getCompanies = () => Object.values(companies);

export const getEmptyItem = (template) => {
  if (template === 'simple') {
    return { description: '', qty: 1, unit: 'Nos', unitPrice: 0 };
  }
  return { description: '', qty: 1, unitPrice: 0, gstPercent: 18 };
};

export const getEmptyFormData = (template) => ({
  refNo: '',
  date: new Date().toISOString().split('T')[0],
  clientName: '',
  attn: '',
  address: '',
  subject: '',
  items: [getEmptyItem(template)],
  note: '',
  showGst: template === 'tax',
  additionalCharges: template === 'tax' ? undefined : undefined,
  additionalChargesLabel: template === 'tax' ? '' : undefined,
});
