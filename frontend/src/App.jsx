import { Routes, Route } from 'react-router-dom';
import { useSessionHydration } from '@/features/auth/hooks/useSessionHydration';
import LoginPage from '@/routes/LoginPage.jsx';
import ProtectedRoute from '@/components/common/ProtectedRoute.jsx';
import AppShell from '@/components/layout/AppShell.jsx';
import DashboardPage from '@/routes/DashboardPage.jsx';
import RoomsPage from '@/routes/RoomsPage.jsx';
import RoomDetailPage from '@/routes/RoomDetailPage.jsx';

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
        </Route>
      </Route>
    </Routes>
  );
}