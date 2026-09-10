import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader.jsx';
import StatusBadge from '@/components/ui/StatusBadge.jsx';
import { useResident } from '@/features/residents/hooks/useResident';
import ResidentFormModal from '@/features/residents/components/ResidentFormModal.jsx';
import { useAllocationHistory } from '@/features/allocations/hooks/useAllocationHistory';
import CurrentAllocationCard from '@/features/allocations/components/CurrentAllocationCard.jsx';
import AllocationHistory from '@/features/allocations/components/AllocationHistory.jsx';

export default function ResidentDetailPage() {
  const { residentId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useResident(residentId);
  const { data: historyData } = useAllocationHistory(residentId);
  const [editOpen, setEditOpen] = useState(false);

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

      <div className="mt-4">
        <CurrentAllocationCard resident={resident} hostelId={resident.hostelId} activeAllocation={activeAllocation} />
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