import { Routes, Route } from 'react-router-dom';
import { useSessionHydration } from '@/features/auth/hooks/useSessionHydration';
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

export default function App() {
  useSessionHydration();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
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
        </Route>
      </Route>
    </Routes>
  );
}