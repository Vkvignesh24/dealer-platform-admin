import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import ProductEdit from './pages/ProductEdit';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import Leads from './pages/Leads';
import LeadDetails from './pages/LeadDetails';
import Loans from './pages/Loans';
import LoanDetails from './pages/LoanDetails';
import Dealers from './pages/Dealers';
import Analytics from './pages/Analytics';
import NotificationsInbox from './pages/NotificationsInbox';
import NotificationsSend from './pages/NotificationsSend';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />

          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="products/:id/edit" element={<ProductEdit />} />

          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<CustomerDetails />} />

          <Route path="leads" element={<Leads />} />
          <Route path="leads/:id" element={<LeadDetails />} />

          <Route path="loans" element={<Loans />} />
          <Route path="loans/:id" element={<LoanDetails />} />

          <Route path="dealers" element={<Dealers />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="notifications" element={<NotificationsInbox />} />
          <Route path="notifications/send" element={<NotificationsSend />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
