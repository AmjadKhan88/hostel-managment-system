import { BedDouble, DoorOpen, Home, Users } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState.jsx';
import StatCard from '@/components/ui/StatCard.jsx';
import { useAuthStore } from '@/store/authStore';
import { useHostelStore } from '@/store/hostelStore';
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

  const { occupancy, rooms, residents, admissionsTrend } = data.data;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-muted">Live occupancy and resident overview for this hostel.</p>
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
          label="Active Residents"
          value={residents.active}
          icon={Users}
          hint={`${residents.pending} pending · ${residents.checkedOut} checked out`}
        />
      </div>

      <div className="mt-4">
        <AdmissionsTrendChart data={admissionsTrend} />
      </div>
    </div>
  );
}