import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/auth/Login';
import { OnboardingDashboard } from './pages/onboarding/Dashboard';
import { KYCQueue } from './pages/onboarding/KYCQueue';
import { KYCReview } from './pages/onboarding/KYCReview';
import { CreateUser } from './pages/onboarding/CreateUser';
import { UserList } from './pages/onboarding/UserList';
import { ReconciliationDashboard } from './pages/reconciliation/Dashboard';
import { TransactionsList } from './pages/reconciliation/TransactionsList';
import { TransactionDetail } from './pages/reconciliation/TransactionDetail';
import { EventsList } from './pages/reconciliation/EventsList';
import { EventDetail } from './pages/reconciliation/EventDetail';
import { WithdrawRequestsQueue } from './pages/reconciliation/WithdrawRequestsQueue';
import { WithdrawRequestDetail } from './pages/reconciliation/WithdrawRequestDetail';
import { UserHistory } from './pages/reconciliation/UserHistory';
import { GlobalDashboard } from './pages/admin/Dashboard';
import { AdsList } from './pages/admin/AdsList';
import { AgentsList } from './pages/admin/AgentsList';
import { ConfigPage } from './pages/admin/ConfigPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const RoleGuard: React.FC<{ allowedRoles: string[]; children: React.ReactNode }> = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  // Helper to render the correct dashboard based on role
  const renderDashboard = () => {
    if (user?.role === 'OnboardingAgent') return <OnboardingDashboard />;
    if (user?.role === 'ReconciliationAgent') return <ReconciliationDashboard />;
    if (user?.role === 'SuperAdmin') return <GlobalDashboard />;
    return <OnboardingDashboard />;
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={renderDashboard()} />

        {/* Protected Routes for Onboarding Agent & Super Admin */}
        <Route element={<RoleGuard allowedRoles={['OnboardingAgent', 'SuperAdmin']}><Outlet /></RoleGuard>}>
          <Route path="kyc-queue" element={<KYCQueue />} />
          <Route path="kyc-review/:userId" element={<KYCReview />} />
          <Route path="users" element={<UserList />} />
          <Route path="users/new" element={<CreateUser />} />

        </Route>

        {/* Protected Routes for Reconciliation Agent & Super Admin */}
        <Route element={<RoleGuard allowedRoles={['ReconciliationAgent', 'SuperAdmin']}><Outlet /></RoleGuard>}>
          <Route path="user-history" element={<UserHistory />} />
        </Route>

        <Route path="transactions" element={<TransactionsList />} />
        <Route path="transactions/:transactionId" element={<TransactionDetail />} />
        <Route path="events" element={<EventsList />} />
        <Route path="events/:eventId" element={<EventDetail />} />
        <Route path="withdrawals" element={<WithdrawRequestsQueue />} />
        <Route path="withdrawals/:requestId" element={<WithdrawRequestDetail />} />

        <Route path="ads" element={<AdsList />} />
        <Route path="agents" element={<AgentsList />} />
        <Route path="config" element={<ConfigPage />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
