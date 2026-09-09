import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '@/features/auth/components/LoginForm.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from ?? '/';

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="surface-card w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <p className="text-sm font-medium text-brand-600">Hostel Management System</p>
          <h1 className="mt-1 text-xl font-semibold text-ink">Sign in to your account</h1>
        </div>
        <LoginForm onSuccess={() => navigate(redirectTo, { replace: true })} />
      </div>
    </div>
  );
}