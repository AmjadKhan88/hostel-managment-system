import { X } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';

const VARIANT_STYLES = {
  info: 'bg-brand-50 text-brand-700 border-brand-200',
  success: 'bg-success-bg text-success border-success',
};

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-control border px-4 py-3 text-sm shadow-popover ${
            VARIANT_STYLES[toast.variant] ?? VARIANT_STYLES.info
          }`}
        >
          <span>{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="ml-2 opacity-60 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}