import client from './client';

const unwrap = (res) => res.data?.data ?? res.data;

export const adminApi = {
  // Dashboard
  dashboard: () => client.get('/admin/dashboard').then(unwrap),

  // Products
  products: (params) => client.get('/admin/products', { params }).then(unwrap),
  product: (id) => client.get(`/admin/products/${id}`).then(unwrap),
  updateProduct: (id, payload) => client.put(`/admin/products/${id}`, payload).then(unwrap),
  duplicateProduct: (id) => client.post(`/admin/products/${id}/duplicate`).then(unwrap),
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
  addLoanDocument: (id, payload) => client.post(`/admin/loans/${id}/documents`, payload).then(unwrap),
  removeLoanDocument: (id, docId) => client.delete(`/admin/loans/${id}/documents/${docId}`).then(unwrap),
  loanAnalytics: () => client.get('/admin/loans/analytics').then(unwrap),

  // Dealers (team members with the 'dealer' role — see Dealers.jsx note)
  dealers: (params) => client.get('/admin/dealers', { params }).then(unwrap),
  dealer: (id) => client.get(`/admin/dealers/${id}`).then(unwrap),

  // Analytics
  inventoryAnalytics: () => client.get('/admin/analytics/inventory').then(unwrap),
  revenueAnalytics: () => client.get('/admin/analytics/revenue').then(unwrap),
  aging: () => client.get('/admin/analytics/aging').then(unwrap),

  // Notifications
  // Backend user record for the signed-in admin/dealer (role, createdAt,
  // lastLoginAt) — same /auth/me endpoint the customer/dealer apps use.
  me: () => client.get('/auth/me').then(unwrap),
  recentActivity: () => client.get('/admin/audit-logs/recent').then(unwrap),

  notifications: () => client.get('/admin/notifications').then(unwrap),
  sendNotification: (payload) => client.post('/admin/notifications', payload).then(unwrap),

  // Personal inbox — powers the header bell. Separate from the broadcast
  // management list above: this only returns notifications relevant to
  // the signed-in admin/dealer (global + dealer-audience + targeted).
  myNotifications: (params) => client.get('/notifications', { params }).then(unwrap),
  unreadNotificationCount: () => client.get('/notifications/unread-count').then(unwrap),
  markNotificationRead: (id) => client.patch(`/notifications/${id}/read`).then(unwrap),
  markAllNotificationsRead: () => client.patch('/notifications/read-all').then(unwrap),

  // Business settings — real endpoint already used by the customer app
  // (GET is public, PUT requires dealer/admin role, which this console's
  // Firebase admin user already satisfies). Mounted at the API root,
  // not under /admin.
  settings: () => client.get('/settings').then(unwrap),
  updateSettings: (payload) => client.put('/settings', payload).then(unwrap),

  // Sales & Reservations — the only endpoints allowed to move a product to
  // sold/reserved. Mounted at the API root (not /admin), same pattern as
  // settings above; this console's Firebase user already has the
  // dealer/admin role these routes require.
  createSale: (payload) => client.post('/sales', payload).then(unwrap),
  reverseSale: (id, payload) => client.patch(`/sales/${id}/reverse`, payload).then(unwrap),
  sales: (params) => client.get('/sales', { params }).then(unwrap),
  createReservation: (payload) => client.post('/reservations', payload).then(unwrap),
  releaseReservation: (id) => client.patch(`/reservations/${id}/release`).then(unwrap),
  reservations: (params) => client.get('/reservations', { params }).then(unwrap),

  // Customer search, used by the Sale/Reserve dialogs to pick an "Existing
  // Customer" without needing a full customer list page load.
  customerSearch: (search) => client.get('/admin/customers', { params: { search, limit: 8 } }).then(unwrap),
  dealerSearch: (search) => client.get('/admin/dealers', { params: { search } }).then(unwrap),
};
