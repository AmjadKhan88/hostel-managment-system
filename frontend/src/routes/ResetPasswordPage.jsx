import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useResetPassword } from '@/features/auth/hooks/usePasswordReset';
import SetPasswordForm from '@/features/portalAuth/components/SetPasswordForm.jsx';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const reset = useResetPassword();
  const [done, setDone] = useState(false);

  const handleSubmit = (password) => {
    reset.mutate({ token, password }, { onSuccess: () => setDone(true) });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="surface-card w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <p className="text-sm font-medium text-brand-600">Hostel Management System</p>
          <h1 className="mt-1 text-xl font-semibold text-ink">Choose a new password</h1>
        </div>

        {!token ? (
          <p className="text-center text-sm text-danger">
            This link is missing its reset token. Open the link from your email again, or request a new one.
          </p>
        ) : done ? (
          <div className="text-center">
            <p className="mb-4 text-sm text-ink-muted">Your password has been reset. Sign in with your new password.</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
            >
              Go to sign in
            </button>
          </div>
        ) : (
          <SetPasswordForm
            onSubmit={handleSubmit}
            isPending={reset.isPending}
            isError={reset.isError}
            errorMessage={reset.error?.message}
            submitLabel="Reset password"
          />
        )}

        <p className="mt-4 text-center text-sm text-ink-muted">
          <Link to="/forgot-password" className="font-medium text-brand-600 hover:text-brand-700">
            Request a new link
          </Link>
        </p>
      </div>
    </div>
  );
}