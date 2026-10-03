import { useState } from 'react';

export default function SetPasswordForm({ onSubmit, isPending, isError, errorMessage, submitLabel }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [mismatch, setMismatch] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
    onSubmit(password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">New password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
          className="w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Confirm password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          minLength={8}
          required
          className="w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500"
        />
      </div>

      {mismatch && (
        <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">Passwords don't match.</div>
      )}
      {isError && <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">{errorMessage}</div>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}