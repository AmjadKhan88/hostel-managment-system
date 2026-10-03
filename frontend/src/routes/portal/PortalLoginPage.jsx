import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { usePortalLogin } from '@/features/portalAuth/hooks/usePortalAuth';

export default function PortalLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from ?? '/portal';
  const login = usePortalLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login.mutateAsync({ email, password }, { onSuccess: () => navigate(redirectTo, { replace: true }) });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="surface-card w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <p className="text-sm font-medium text-brand-600">Resident Portal</p>
          <h1 className="mt-1 text-xl font-semibold text-ink">Sign in</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500"
            />
          </div>

          {login.isError && (
            <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">{login.error.message}</div>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {login.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-ink-muted">
          <Link to="/portal/forgot-password" className="font-medium text-brand-600 hover:text-brand-700">
            Forgot your password?
          </Link>
        </p>
      </div>
    </div>
  );
}