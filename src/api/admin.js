import client from './client';

const unwrap = (res) => res.data?.data ?? res.data;

export const adminApi = {
  // Dashboard
  dashboard: () => client.get('/admin/dashboard').then(unwrap),

  // Products
  products: (params) => client.get('/admin/products', { params }).then(unwrap),
  product: (id) => client.get(`/admin/products/${id}`).then(unwrap),
  updateProduct: (id, payload) => client.put(`/admin/products/${id}`, payload).then(unwrap),
  archiveProduct: (id) => client.patch(`/admin/products/${id}/archive`).then(unwrap),
  setProductStatus: (id, status) => client.patch(`/admin/products/${id}/status`, { status }).then(unwrap),
  deleteProduct: (id) => client.delete(`/admin/products/${id}`).then(unwrap),

  // Customers
  customers: (params) => client.get('/admin/customers', { params }).then(unwrap),
  customer: (id) => client.get(`/admin/customers/${id}`).then(unwrap),

  // Leads
  leads: (params) => client.get('/admin/leads', { params }).then(unwrap),
  lead: (id) => client.get(`/admin/leads/${id}`).then(unwrap),
  updateLead: (id, payload) => client.patch(`/admin/leads/${id}`, payload).then(unwrap),
  leadAnalytics: () => client.get('/admin/leads/analytics').then(unwrap),

  // Loans
  loans: (params) => client.get('/admin/loans', { params }).then(unwrap),
  loan: (id) => client.get(`/admin/loans/${id}`).then(unwrap),
  updateLoan: (id, payload) => client.patch(`/admin/loans/${id}`, payload).then(unwrap),
  loanAnalytics: () => client.get('/admin/loans/analytics').then(unwrap),

  // Dealers (team members with the 'dealer' role — see Dealers.jsx note)
  dealers: (params) => client.get('/admin/dealers', { params }).then(unwrap),
  dealer: (id) => client.get(`/admin/dealers/${id}`).then(unwrap),

  // Analytics
  inventoryAnalytics: () => client.get('/admin/analytics/inventory').then(unwrap),
  revenueAnalytics: () => client.get('/admin/analytics/revenue').then(unwrap),
  aging: () => client.get('/admin/analytics/aging').then(unwrap),

  // Notifications
  notifications: () => client.get('/admin/notifications').then(unwrap),
  sendNotification: (payload) => client.post('/admin/notifications', payload).then(unwrap),

  // Business settings — real endpoint already used by the customer app
  // (GET is public, PUT requires dealer/admin role, which this console's
  // Firebase admin user already satisfies). Mounted at the API root,
  // not under /admin.
  settings: () => client.get('/settings').then(unwrap),
  updateSettings: (payload) => client.put('/settings', payload).then(unwrap),
};
