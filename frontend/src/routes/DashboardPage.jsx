import { BedDouble, DoorOpen, Home, Users, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState.jsx';
import StatCard from '@/components/ui/StatCard.jsx';
import { useAuthStore } from '@/store/authStore';
import { useHostelStore } from '@/store/hostelStore';
import { formatMoney } from '@/lib/money';
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary';
import AdmissionsTrendChart from '@/features/dashboard/components/AdmissionsTrendChart.jsx';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const selectedHostelId = useHostelStore((s) => s.selectedHostelId);
  const effectiveHostelId = user?.hostelId ?? selectedHostelId;

  const { data, isLoading, isError, error } = useDashboardSummary(effectiveHostelId);

  if (!effectiveHostelId) {
    return (
      <EmptyState
        title="Select a hostel to get started"
        description="Use the hostel switcher in the top bar to pick or create a hostel to see its dashboard."
      />
    );
  }

  if (isLoading) return <p className="text-sm text-ink-muted">Loading dashboard…</p>;
  if (isError) {
    return (
      <div className="rounded-control bg-danger-bg px-4 py-3 text-sm text-danger">
        {error?.message ?? 'Failed to load dashboard'}
      </div>
    );
  }

  const { occupancy, rooms, residents, admissionsTrend, fees } = data.data;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-muted">Live occupancy, resident, and fee overview for this hostel.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Occupancy Rate"
          value={`${occupancy.occupancyRate}%`}
          icon={BedDouble}
          hint={`${occupancy.occupiedBeds} of ${occupancy.totalBeds} beds occupied`}
        />
        <StatCard
          label="Available Beds"
          value={occupancy.availableBeds}
          icon={DoorOpen}
          hint={`${occupancy.maintenanceBeds} under maintenance`}
        />
        <StatCard
          label="Total Rooms"
          value={rooms.total}
          icon={Home}
          hint={`${rooms.available} available · ${rooms.occupied} occupied`}
        />
        <StatCard
          label="Total Residents"
          value={residents.total}
          icon={Users}
          hint={`${residents.active} active · ${residents.pending} pending · ${residents.checkedOut} checked out`}
        />
      </div>

      <h2 className="mb-3 mt-6 text-sm font-semibold text-ink">Fees</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Fees Collected"
          value={formatMoney(fees.totalCollectedMinorUnits)}
          icon={Wallet}
          hint={`of ${formatMoney(fees.totalBilledMinorUnits)} billed`}
        />
        <StatCard
          label="Fees Pending"
          value={formatMoney(fees.totalPendingMinorUnits)}
          icon={AlertCircle}
          hint={`${fees.residentsWithOutstandingFees} resident(s) owe money`}
        />
        <StatCard
          label="Residents Paid Up"
          value={fees.residentsPaidUp}
          icon={CheckCircle2}
          hint={`of ${residents.total} total residents`}
        />
      </div>

      <div className="mt-4">
        <AdmissionsTrendChart data={admissionsTrend} />
      </div>
    </div>
  );
}