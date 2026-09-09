import { Routes, Route } from 'react-router-dom';
import SetupStatusPage from '@/routes/SetupStatusPage.jsx';

/**
 * Route tree grows here as each module is implemented on its own DAY.
 * Day 1 only has a setup-verification page — the real dashboard layout,
 * sidebar, and auth-guarded routes are built starting the days those
 * modules are scoped.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SetupStatusPage />} />
    </Routes>
  );
}
