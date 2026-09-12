import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader.jsx';
import StatusBadge from '@/components/ui/StatusBadge.jsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';
import { useAdmission } from '@/features/admissions/hooks/useAdmissions';
import {
  useApproveAdmission,
  useRejectAdmission,
  useWaitlistAdmission,
  useVerifyDocuments,
  useCancelAdmission,
} from '@/features/admissions/hooks/useAdmissionMutations';
import AdmissionCheckInModal from '@/features/admissions/components/AdmissionCheckInModal.jsx';

export default function AdmissionDetailPage() {
  const { admissionId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useAdmission(admissionId);

  const approve = useApproveAdmission(admissionId);
  const reject = useRejectAdmission(admissionId);
  const waitlist = useWaitlistAdmission(admissionId);
  const verifyDocuments = useVerifyDocuments(admissionId);
  const cancelAdmission = useCancelAdmission(admissionId);

  const [decisionNotes, setDecisionNotes] = useState('');
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const admission = data?.data?.admission;

  if (isLoading) return <p className="text-sm text-ink-muted">Loading admission…</p>;
  if (isError) {
    return (
      <div className="rounded-control bg-danger-bg px-4 py-3 text-sm text-danger">
        {error?.message ?? 'Failed to load admission'}
      </div>
    );
  }

  const resident = admission.residentId;
  const canDecide = ['applied', 'waitlisted'].includes(admission.status);
  const canCheckIn = admission.status === 'approved';
  const canCancel = !['rejected', 'checked_in', 'cancelled'].includes(admission.status);

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate('/admissions')}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to Admissions
      </button>

      <PageHeader
        title={resident?.name ?? 'Admission'}
        description={`Reg. No. ${resident?.registrationNumber ?? '—'} · Requested: ${
          admission.requestedCategory || 'no preference'
        }`}
        action={<StatusBadge status={admission.status} />}
      />

      <section className="surface-card p-6">
        <h2 className="text-sm font-semibold text-ink">Applicant contact</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Phone</dt>
            <dd className="font-medium text-ink">{resident?.phone ?? '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Email</dt>
            <dd className="font-medium text-ink">{resident?.email || '—'}</dd>
          </div>
        </dl>
      </section>

      <section className="surface-card mt-4 p-6">
        <h2 className="text-sm font-semibold text-ink">Documents</h2>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-ink-muted">
            {admission.documentsVerified ? 'Verified' : 'Not yet verified'}
          </span>
          {!admission.documentsVerified && (
            <button
              onClick={() => verifyDocuments.mutate()}
              disabled={verifyDocuments.isPending}
              className="rounded-control border border-border px-3 py-1.5 text-sm font-medium text-ink hover:bg-canvas"
            >
              Mark verified
            </button>
          )}
        </div>
        <p className="mt-1 text-xs text-ink-subtle">
          File upload/review isn&apos;t built yet — this is a manual confirmation for now.
        </p>
      </section>

      {canDecide && (
        <section className="surface-card mt-4 p-6">
          <h2 className="text-sm font-semibold text-ink">Decision</h2>
          <textarea
            rows={2}
            value={decisionNotes}
            onChange={(e) => setDecisionNotes(e.target.value)}
            placeholder="Notes for this decision (optional)"
            className="mt-2 w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand-500"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => approve.mutate({ decisionNotes })}
              disabled={approve.isPending}
              className="rounded-control bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Approve
            </button>
            {admission.status === 'applied' && (
              <button
                onClick={() => waitlist.mutate({ decisionNotes })}
                disabled={waitlist.isPending}
                className="rounded-control border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-canvas"
              >
                Waitlist
              </button>
            )}
            <button
              onClick={() => reject.mutate({ decisionNotes })}
              disabled={reject.isPending}
              className="rounded-control border border-border px-4 py-2 text-sm font-medium text-danger hover:bg-danger-bg"
            >
              Reject
            </button>
          </div>
          {(approve.isError || reject.isError || waitlist.isError) && (
            <p className="mt-2 text-sm text-danger">{(approve.error || reject.error || waitlist.error)?.message}</p>
          )}
        </section>
      )}

      {canCheckIn && (
        <section className="surface-card mt-4 p-6">
          <h2 className="text-sm font-semibold text-ink">Ready for check-in</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Assign a bed to complete the admission — this uses the same allocation logic as Room Allocation.
          </p>
          <button
            onClick={() => setCheckInOpen(true)}
            className="mt-3 rounded-control bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Check in resident
          </button>
        </section>
      )}

      {admission.status === 'checked_in' && (
        <section className="surface-card mt-4 p-6">
          <h2 className="text-sm font-semibold text-ink">Checked in</h2>
          <dl className="mt-2 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Checked in at</dt>
              <dd className="text-ink">{new Date(admission.checkedInAt).toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Security deposit</dt>
              <dd className="text-ink">{(admission.securityDepositMinorUnits / 100).toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Initial payment</dt>
              <dd className="text-ink">{(admission.initialPaymentMinorUnits / 100).toFixed(2)}</dd>
            </div>
          </dl>
        </section>
      )}

      {canCancel && (
        <div className="mt-4">
          <button onClick={() => setConfirmCancel(true)} className="text-sm font-medium text-danger hover:underline">
            Cancel this admission
          </button>
        </div>
      )}

      <AdmissionCheckInModal
        open={checkInOpen}
        onClose={() => setCheckInOpen(false)}
        hostelId={admission.hostelId}
        admissionId={admission._id}
      />

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={() => cancelAdmission.mutate(undefined, { onSuccess: () => setConfirmCancel(false) })}
        title="Cancel admission"
        description="This marks the application as cancelled/withdrawn. This can't be undone from here."
        confirmLabel="Cancel admission"
        danger
        isLoading={cancelAdmission.isPending}
      />
    </div>
  );
}