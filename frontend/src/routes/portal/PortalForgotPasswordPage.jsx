import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRequestPasswordReset } from '@/features/portalAuth/hooks/usePortalAuth';

export default function PortalForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const requestReset = useRequestPasswordReset();
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await requestReset.mutateAsync(email, { onSuccess: () => setSent(true) });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="surface-card w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <p className="text-sm font-medium text-brand-600">Resident Portal</p>
          <h1 className="mt-1 text-xl font-semibold text-ink">Reset your password</h1>
        </div>

        {sent ? (
          <p className="text-center text-sm text-ink-muted">
            If an account exists for that email, a reset link has been sent. Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500"
              />
            </div>
            <button
              type="submit"
              disabled={requestReset.isPending}
              className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {requestReset.isPending ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
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