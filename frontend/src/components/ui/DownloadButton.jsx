import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { downloadFile } from '@/lib/downloadFile';

const VARIANTS = {
  button:
    'rounded-control border border-border px-3 py-1.5 text-sm font-medium text-ink hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-60',
  link: 'text-xs font-medium text-brand-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60',
};

export default function DownloadButton({ path, filename, label = 'Download PDF', variant = 'button' }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setBusy(true);
    setError('');
    try {
      await downloadFile(path, filename);
    } catch (err) {
      setError(err?.message ?? 'Download failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className={`inline-flex items-center gap-1.5 ${VARIANTS[variant]}`}
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        {busy ? 'Preparing…' : label}
      </button>
      {error && <span className="mt-1 text-xs text-danger">{error}</span>}
    </span>
  );
}