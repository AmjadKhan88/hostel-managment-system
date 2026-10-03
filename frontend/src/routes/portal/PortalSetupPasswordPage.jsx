import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useSetupAccount } from '@/features/portalAuth/hooks/usePortalAuth';
import SetPasswordForm from '@/features/portalAuth/components/SetPasswordForm.jsx';

export default function PortalSetupPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setupAccount = useSetupAccount();
  const [done, setDone] = useState(false);

  const token = searchParams.get('token');
  const residentId = searchParams.get('residentId');

  const handleSubmit = async (password) => {
    await setupAccount.mutateAsync({ residentId, token, password }, { onSuccess: () => setDone(true) });
  };

  if (!token || !residentId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
        <div className="surface-card w-full max-w-sm p-8 text-center text-sm text-danger">
          This link is missing required information. Ask staff to resend your invite.
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="surface-card w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <p className="text-sm font-medium text-brand-600">Resident Portal</p>
          <h1 className="mt-1 text-xl font-semibold text-ink">Set up your account</h1>
        </div>

        {done ? (
          <div className="text-center">
            <p className="mb-4 text-sm text-ink-muted">Your account is ready. You can now sign in.</p>
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
            isPending={setupAccount.isPending}
            isError={setupAccount.isError}
            errorMessage={setupAccount.error?.message}
            submitLabel="Activate account"
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