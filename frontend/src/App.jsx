import { Routes, Route } from 'react-router-dom';
import { useSessionHydration } from '@/features/auth/hooks/useSessionHydration';
import LoginPage from '@/routes/LoginPage.jsx';
import ProtectedRoute from '@/components/common/ProtectedRoute.jsx';
import SetupStatusPage from '@/routes/SetupStatusPage.jsx';

/**
 * Route tree grows here as each module is implemented on its own DAY.
 * The real dashboard layout (sidebar/topbar) replaces SetupStatusPage
 * once the Hostel Management / Dashboard day is scoped.
 */
export default function App() {
  useSessionHydration();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<SetupStatusPage />} />
      </Route>
    </Routes>
  );
}