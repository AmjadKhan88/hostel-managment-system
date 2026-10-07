import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Mail, CheckCircle2, Clock } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader.jsx';
import StatusBadge from '@/components/ui/StatusBadge.jsx';
import { useResident, useInvitePortalAccount } from '@/features/residents/hooks/useResident';
import ResidentFormModal from '@/features/residents/components/ResidentFormModal.jsx';
import { useAllocationHistory } from '@/features/allocations/hooks/useAllocationHistory';
import CurrentAllocationCard from '@/features/allocations/components/CurrentAllocationCard.jsx';
import AllocationHistory from '@/features/allocations/components/AllocationHistory.jsx';
import DocumentsPanel from '@/features/documents/components/DocumentsPanel.jsx';

export default function ResidentDetailPage() {
  const { residentId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useResident(residentId);
  const { data: historyData } = useAllocationHistory(residentId);
  const [editOpen, setEditOpen] = useState(false);

  const invitePortal = useInvitePortalAccount(residentId);

  const resident = data?.data?.resident;
  const activeAllocation = (historyData?.data?.allocations ?? []).find((a) => a.status === 'active') ?? null;

  if (isLoading) return <p className="text-sm text-ink-muted">Loading resident…</p>;
  if (isError) {
    return (
      <div className="rounded-control bg-danger-bg px-4 py-3 text-sm text-danger">
        {error?.message ?? 'Failed to load resident'}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate('/residents')}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to Residents
      </button>

      <PageHeader
        title={resident.name}
        description={`Reg. No. ${resident.registrationNumber}`}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge status={resident.status} />
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 rounded-control border border-border px-3 py-1.5 text-sm font-medium text-ink hover:bg-canvas"
            >
              <Pencil size={14} /> Edit
            </button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="surface-card p-6">
          <h2 className="text-sm font-semibold text-ink">Contact</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Phone" value={resident.phone} />
            <Row label="Email" value={resident.email || '—'} />
            <Row label="Institution" value={resident.institution || '—'} />
            <Row label="Department" value={resident.department || '—'} />
          </dl>
        </section>

        <section className="surface-card p-6">
          <h2 className="text-sm font-semibold text-ink">Guardian / Emergency contact</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Name" value={resident.guardian?.name} />
            <Row label="Relationship" value={resident.guardian?.relationship || '—'} />
            <Row label="Phone" value={resident.guardian?.phone} />
          </dl>
        </section>
      </div>

      <section className="surface-card mt-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink">Resident Portal Access</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
              {resident.portalAccount?.status === 'active' && (
                <>
                  <CheckCircle2 size={14} className="text-success" />
                  Active
                  {resident.portalAccount.lastLoginAt &&
                    ` — last signed in ${new Date(resident.portalAccount.lastLoginAt).toLocaleString()}`}
                </>
              )}
              {resident.portalAccount?.status === 'invited' && (
                <>
                  <Clock size={14} className="text-warning" />
                  Invited
                  {resident.portalAccount.invitedAt && ` on ${new Date(resident.portalAccount.invitedAt).toLocaleDateString()}`}
                  {' — waiting for them to set a password'}
                </>
              )}
              {(!resident.portalAccount || resident.portalAccount.status === 'not_invited') && 'Not invited yet'}
              {resident.portalAccount?.status === 'disabled' && 'Disabled'}
            </p>
          </div>

          {resident.portalAccount?.status !== 'active' && (
            <button
              onClick={() => invitePortal.mutate()}
              disabled={invitePortal.isPending || !resident.email}
              className="flex items-center gap-1.5 rounded-control border border-border px-3 py-1.5 text-sm font-medium text-ink hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50"
              title={!resident.email ? 'Add an email address first' : undefined}
            >
              <Mail size={14} />
              {invitePortal.isPending
                ? 'Sending…'
                : resident.portalAccount?.status === 'invited'
                  ? 'Resend Invite'
                  : 'Invite to Portal'}
            </button>
          )}
        </div>

        {!resident.email && (
          <p className="mt-2 text-xs text-danger">This resident has no email on file — add one (Edit) before inviting them.</p>
        )}
        {invitePortal.isError && <p className="mt-2 text-xs text-danger">{invitePortal.error.message}</p>}
        {invitePortal.isSuccess && <p className="mt-2 text-xs text-success">Invite sent to {resident.email}.</p>}
      </section>

      <div className="mt-4">
        <CurrentAllocationCard resident={resident} hostelId={resident.hostelId} activeAllocation={activeAllocation} />
      </div>

      <div className="mt-4">
        <DocumentsPanel residentId={resident._id} />
      </div>

      <AllocationHistory residentId={resident._id} />

      <ResidentFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        hostelId={resident.hostelId}
        resident={resident}
      />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}