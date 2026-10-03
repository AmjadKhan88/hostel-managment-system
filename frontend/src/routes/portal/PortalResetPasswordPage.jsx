import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useResetPassword } from '@/features/portalAuth/hooks/usePortalAuth';
import SetPasswordForm from '@/features/portalAuth/components/SetPasswordForm.jsx';

export default function PortalResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resetPassword = useResetPassword();
  const [done, setDone] = useState(false);

  const token = searchParams.get('token');
  const residentId = searchParams.get('residentId');

  const handleSubmit = async (password) => {
    await resetPassword.mutateAsync({ residentId, token, password }, { onSuccess: () => setDone(true) });
  };

  if (!token || !residentId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
        <div className="surface-card w-full max-w-sm p-8 text-center text-sm text-danger">
          This link is missing required information. Request a new one.
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="surface-card w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <p className="text-sm font-medium text-brand-600">Resident Portal</p>
          <h1 className="mt-1 text-xl font-semibold text-ink">Reset your password</h1>
        </div>

        {done ? (
          <div className="text-center">
            <p className="mb-4 text-sm text-ink-muted">Your password has been reset.</p>
            <button
              onClick={() => navigate('/portal/login')}
              className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
            >
              Go to sign in
            </button>
          </div>
        ) : (
          <SetPasswordForm
            onSubmit={handleSubmit}
            isPending={resetPassword.isPending}
            isError={resetPassword.isError}
            errorMessage={resetPassword.error?.message}
            submitLabel="Reset password"
          />
        )}

        <p className="mt-4 text-center text-sm text-ink-muted">
          <Link to="/portal/login" className="font-medium text-brand-600 hover:text-brand-700">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}