import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from '@/modules/landing/LandingPage';
import LoginPage from '@/modules/auth/LoginPage';
import DashboardPage from '@/modules/dashboard/DashboardPage';
import OrderCreatePage from '@/modules/dashboard/OrderCreatePage';
import BackofficeLayout from '@/layouts/BackofficeLayout';
import BackofficeDashboard from '@/modules/dashboard/BackofficeDashboard';
import BackofficeOrders from '@/modules/dashboard/BackofficeOrders';
import BackofficeOrderDetail from '@/modules/dashboard/BackofficeOrderDetail';
import BackofficeCustomers from '@/modules/dashboard/BackofficeCustomers';
import BackofficeParameters from '@/modules/dashboard/BackofficeParameters';
import BackofficeUsers from '@/modules/dashboard/BackofficeUsers';
import BackofficeAudit from '@/modules/dashboard/BackofficeAudit';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { Toaster } from '@/components/ui/use-toast';
import RegisterPage from './modules/auth/RegisterPage';
import OrderDetailPage from './modules/dashboard/OrderDetailPage';
import ProfilePage from '@/modules/profile/ProfilePage';
import NotFoundPage from '@/modules/error/NotFoundPage';

function App() {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/order/create" 
            element={
              <ProtectedRoute>
                <OrderCreatePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/order/:id" 
            element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />

          {/* Backoffice Routes */}
          <Route 
            path="/backoffice" 
            element={
              <ProtectedRoute>
                <BackofficeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<BackofficeDashboard />} />
            <Route path="orders" element={<BackofficeOrders />} />
            <Route path="orders/:id" element={<BackofficeOrderDetail />} />
            <Route path="customers" element={<BackofficeCustomers />} />
            <Route path="audit" element={<BackofficeAudit />} />
            <Route path="parameters" element={<BackofficeParameters />} />
            <Route path="users" element={<BackofficeUsers />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>
      <Toaster />
    </Router>
  );
}

export default App;
