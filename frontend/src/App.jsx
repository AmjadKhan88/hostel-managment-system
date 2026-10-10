import { Routes, Route } from 'react-router-dom';
import { useSessionHydration } from '@/features/auth/hooks/useSessionHydration';
import { useRealtimeNotifications } from '@/features/realtime/hooks/useRealtimeNotifications';
import LoginPage from '@/routes/LoginPage.jsx';
import ProtectedRoute from '@/components/common/ProtectedRoute.jsx';
import AppShell from '@/components/layout/AppShell.jsx';
import DashboardPage from '@/routes/DashboardPage.jsx';
import RoomsPage from '@/routes/RoomsPage.jsx';
import RoomDetailPage from '@/routes/RoomDetailPage.jsx';
import ResidentsPage from '@/routes/ResidentsPage.jsx';
import ResidentDetailPage from '@/routes/ResidentDetailPage.jsx';
import StaffPage from '@/routes/StaffPage.jsx';
import ComplaintsPage from '@/routes/ComplaintsPage.jsx';
import ComplaintDetailPage from '@/routes/ComplaintDetailPage.jsx';
import VisitorsPage from '@/routes/VisitorsPage.jsx';
import MaintenancePage from '@/routes/MaintenancePage.jsx';
import MaintenanceDetailPage from '@/routes/MaintenanceDetailPage.jsx';
import NoticesPage from '@/routes/NoticesPage.jsx';
import AdmissionsPage from '@/routes/AdmissionsPage.jsx';
import AdmissionDetailPage from '@/routes/AdmissionDetailPage.jsx';
import FeesPage from '@/routes/FeesPage.jsx';
import InvoiceDetailPage from '@/routes/InvoiceDetailPage.jsx';
import ReportsPage from '@/routes/ReportsPage.jsx';
import ToastContainer from '@/components/ui/ToastContainer.jsx';
import SettingsPage from '@/routes/SettingsPage.jsx';
import AuditLogPage from '@/routes/AuditLogPage.jsx';
import AIAssistantPage from '@/routes/AIAssistantPage.jsx';
import FinancePage from '@/routes/FinancePage.jsx';
import AutomationPage from '@/routes/AutomationPage.jsx';
import PaymentApprovalsPage from '@/routes/PaymentApprovalsPage.jsx';

import { useResidentSessionHydration } from '@/features/portalAuth/hooks/useResidentSessionHydration';
import PortalLoginPage from '@/routes/portal/PortalLoginPage.jsx';
import PortalSetupPasswordPage from '@/routes/portal/PortalSetupPasswordPage.jsx';
import PortalForgotPasswordPage from '@/routes/portal/PortalForgotPasswordPage.jsx';
import PortalResetPasswordPage from '@/routes/portal/PortalResetPasswordPage.jsx';
import PortalProtectedRoute from '@/components/portal/PortalProtectedRoute.jsx';
import PortalLayout from '@/components/portal/PortalLayout.jsx';
import PortalDashboardPage from '@/routes/portal/PortalDashboardPage.jsx';
import PortalInvoicesPage from '@/routes/portal/PortalInvoicesPage.jsx';
import PortalInvoiceDetailPage from '@/routes/portal/PortalInvoiceDetailPage.jsx';
import PortalPaymentsPage from '@/routes/portal/PortalPaymentsPage.jsx';
import PortalComplaintsPage from '@/routes/portal/PortalComplaintsPage.jsx';
import PortalComplaintDetailPage from '@/routes/portal/PortalComplaintDetailPage.jsx';
import PortalNoticesPage from '@/routes/portal/PortalNoticesPage.jsx';
import PortalProfilePage from '@/routes/portal/PortalProfilePage.jsx';

import PortalMaintenancePage from '@/routes/portal/PortalMaintenancePage.jsx';
import PortalMaintenanceDetailPage from '@/routes/portal/PortalMaintenanceDetailPage.jsx';
import PortalVisitorsPage from '@/routes/portal/PortalVisitorsPage.jsx';
import ErrorBoundary from '@/components/common/ErrorBoundary.jsx';
import LandingPage from '@/routes/LandingPage.jsx';
import { useResidentRealtime } from '@/features/realtime/hooks/useResidentRealtime';

import ForgotPasswordPage from '@/routes/ForgotPasswordPage.jsx';
import ResetPasswordPage from '@/routes/ResetPasswordPage.jsx';

import { useCurrencySync } from '@/features/settings/hooks/useCurrencySync';

export default function App() {
  useSessionHydration();
  useRealtimeNotifications();
  useResidentSessionHydration();
  useResidentRealtime();
  useCurrencySync();

  return (
    <>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/rooms/:roomId" element={<RoomDetailPage />} />
              <Route path="/residents" element={<ResidentsPage />} />
              <Route path="/residents/:residentId" element={<ResidentDetailPage />} />
              <Route path="/staff" element={<StaffPage />} />
              <Route path="/complaints" element={<ComplaintsPage />} />
              <Route path="/complaints/:complaintId" element={<ComplaintDetailPage />} />
              <Route path="/visitors" element={<VisitorsPage />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/maintenance/:ticketId" element={<MaintenanceDetailPage />} />
              <Route path="/notices" element={<NoticesPage />} />
              <Route path="/admissions" element={<AdmissionsPage />} />
              <Route path="/admissions/:admissionId" element={<AdmissionDetailPage />} />
              <Route path="/fees" element={<FeesPage />} />
              <Route path="/fees/invoices/:invoiceId" element={<InvoiceDetailPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/ai-assistant" element={<AIAssistantPage />} />
              <Route path="/finance" element={<FinancePage />} />
              <Route path="/audit-log" element={<AuditLogPage />} />
              <Route path="/automation" element={<AutomationPage />} />
              <Route path="/payment-approvals" element={<PaymentApprovalsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Resident Portal — completely separate auth/layout tree from staff */}
          <Route path="/portal/login" element={<PortalLoginPage />} />
          <Route path="/portal/set-password" element={<PortalSetupPasswordPage />} />
          <Route path="/portal/forgot-password" element={<PortalForgotPasswordPage />} />
          <Route path="/portal/reset-password" element={<PortalResetPasswordPage />} />
          <Route element={<PortalProtectedRoute />}>
            <Route element={<PortalLayout />}>
              <Route path="/portal" element={<PortalDashboardPage />} />
              <Route path="/portal/invoices" element={<PortalInvoicesPage />} />
              <Route path="/portal/invoices/:invoiceId" element={<PortalInvoiceDetailPage />} />
              <Route path="/portal/payments" element={<PortalPaymentsPage />} />
              <Route path="/portal/complaints" element={<PortalComplaintsPage />} />
              <Route path="/portal/complaints/:complaintId" element={<PortalComplaintDetailPage />} />
              <Route path="/portal/notices" element={<PortalNoticesPage />} />
              <Route path="/portal/profile" element={<PortalProfilePage />} />
              <Route path="/portal/maintenance" element={<PortalMaintenancePage />} />
              <Route path="/portal/maintenance/:ticketId" element={<PortalMaintenanceDetailPage />} />
              <Route path="/portal/visitors" element={<PortalVisitorsPage />} />
            </Route>
          </Route>

        </Routes>

      </ErrorBoundary>
      <ToastContainer />
    </>
  );
}