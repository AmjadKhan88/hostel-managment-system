import { useState } from 'react';
import { Check, X, ZoomIn } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import Modal from '@/components/ui/Modal.jsx';
import { useAuthStore } from '@/store/authStore';
import { useHostelStore } from '@/store/hostelStore';
import { formatMoney } from '@/lib/money';
import { usePaymentSubmissions, useApproveSubmission, useRejectSubmission } from '@/features/paymentApprovals/hooks/usePaymentApprovals';

export default function PaymentApprovalsPage() {
  const user = useAuthStore((s) => s.user);
  const selectedHostelId = useHostelStore((s) => s.selectedHostelId);
  const effectiveHostelId = user?.hostelId ?? selectedHostelId;

  const [statusFilter, setStatusFilter] = useState('pending');
  const [zoomUrl, setZoomUrl] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = usePaymentSubmissions({ hostelId: effectiveHostelId, status: statusFilter, limit: 30 });
  const approve = useApproveSubmission();
  const reject = useRejectSubmission();

  const submissions = data?.data?.items ?? [];

  if (!effectiveHostelId) {
    return (
      <EmptyState
        title="Select a hostel to get started"
        description="Use the hostel switcher in the top bar to pick or create a hostel before reviewing payments."
      />
    );
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    await reject.mutateAsync({ id: rejecting._id, reason: rejectReason.trim() });
    setRejecting(null);
    setRejectReason('');
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Payment Approvals" description="Review resident-submitted payment proof before applying it to an invoice." />

      <div className="mb-4 flex gap-2">
        {['pending', 'approved', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-control px-3 py-1.5 text-sm font-medium capitalize ${statusFilter === s ? 'bg-brand-500 text-white' : 'border border-border text-ink-muted hover:bg-canvas'
              }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-ink-muted">Loading…</p>}

      {!isLoading && submissions.length === 0 && (
        <EmptyState title={`No ${statusFilter} submissions`} description="Nothing here right now." />
      )}

      <div className="space-y-3">
        {submissions.map((s) => (
          <div key={s._id} className="surface-card flex gap-4 p-5">
            <button onClick={() => setZoomUrl(s.screenshotUrl)} className="group relative shrink-0">
              <img src={s.screenshotUrl} alt="Payment proof" className="h-24 w-24 rounded-control border border-border object-cover" />
              <span className="absolute inset-0 flex items-center justify-center rounded-control bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
                <ZoomIn size={18} className="text-white" />
              </span>
            </button>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">{s.residentId?.name ?? 'Unknown resident'}</p>
                  <p className="text-xs text-ink-subtle">
                    Invoice {s.invoiceId?.invoiceNumber} · {s.method.replace('_', ' ')}
                    {s.transactionReference && ` · Ref: ${s.transactionReference}`}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-ink">{formatMoney(s.amountMinorUnits)}</p>
                  <p className="text-xs text-ink-subtle">Submitted {new Date(s.createdAt).toLocaleString()}</p>
                </div>

                {s.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => approve.mutate(s._id)}
                      disabled={approve.isPending}
                      className="flex items-center gap-1 rounded-control bg-success px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      onClick={() => setRejecting(s)}
                      className="flex items-center gap-1 rounded-control border border-danger px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger-bg"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                )}
                {s.status === 'rejected' && <p className="text-xs text-danger">Rejected: {s.rejectionReason}</p>}
                {s.status === 'approved' && <p className="text-xs text-success">Approved — applied to invoice</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={Boolean(zoomUrl)} onClose={() => setZoomUrl(null)} title="Payment Screenshot">
        {zoomUrl && <img src={zoomUrl} alt="Payment proof (full size)" className="w-full rounded-control" />}
      </Modal>

      <Modal open={Boolean(rejecting)} onClose={() => setRejecting(null)} title="Reject Payment Submission">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Reason (shown to the resident)</label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Screenshot doesn't show the account name, please resubmit"
              className="w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500"
            />
          </div>
          <button
            onClick={handleReject}
            disabled={!rejectReason.trim() || reject.isPending}
            className="w-full rounded-control bg-danger py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {reject.isPending ? 'Rejecting…' : 'Reject submission'}
          </button>
        </div>
      </Modal>
    </div>
  );
}