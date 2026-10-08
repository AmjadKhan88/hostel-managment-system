import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPassword } from '@/features/auth/hooks/usePasswordReset';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const forgot = useForgotPassword();

  const handleSubmit = (e) => {
    e.preventDefault();
    forgot.mutate(email.trim(), { onSuccess: () => setSent(true) });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="surface-card w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <p className="text-sm font-medium text-brand-600">Hostel Management System</p>
          <h1 className="mt-1 text-xl font-semibold text-ink">Reset your password</h1>
        </div>

        {sent ? (
          <p className="text-center text-sm text-ink-muted">
            If an account exists for that email, a reset link is on its way. It expires in 60 minutes — check your spam
            folder if it doesn't arrive.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <p className="text-sm text-ink-muted">Enter your account email and we'll send you a link to choose a new password.</p>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500"
            />
            {forgot.isError && (
              <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">{forgot.error.message}</div>
            )}
            <button
              type="submit"
              disabled={forgot.isPending || !email.trim()}
              className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {forgot.isPending ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-ink-muted">
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}