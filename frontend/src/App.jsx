import { Routes, Route } from 'react-router-dom';
import { useSessionHydration } from '@/features/auth/hooks/useSessionHydration';
import LoginPage from '@/routes/LoginPage.jsx';
import ProtectedRoute from '@/components/common/ProtectedRoute.jsx';
import AppShell from '@/components/layout/AppShell.jsx';
import DashboardPage from '@/routes/DashboardPage.jsx';

/**
 * Route tree grows here as each module is implemented on its own DAY.
 * New authenticated pages nest under the AppShell route below.
 */
export default function App() {
  useSessionHydration();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
        </Route>
      </Route>
    </Routes>
  );
}