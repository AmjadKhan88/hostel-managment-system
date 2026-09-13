import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { useAuthStore } from '@/store/authStore';
import { useHostelStore } from '@/store/hostelStore';
import { formatMoney } from '@/lib/money';
import { useAdmissionsReport, useComplaintsReport, useMaintenanceReport } from '@/features/reports/hooks/useReports';
import OccupancyReportPanel from '@/features/reports/components/OccupancyReportPanel.jsx';
import FeeCollectionReportPanel from '@/features/reports/components/FeeCollectionReportPanel.jsx';
import OutstandingDuesReportPanel from '@/features/reports/components/OutstandingDuesReportPanel.jsx';
import StatusReportPanel from '@/features/reports/components/StatusReportPanel.jsx';
import StatusBreakdownChart from '@/features/reports/components/StatusBreakdownChart.jsx';
import VisitorsReportPanel from '@/features/reports/components/VisitorsReportPanel.jsx';

const TABS = [
  { key: 'occupancy', label: 'Occupancy' },
  { key: 'fees', label: 'Fee Collection' },
  { key: 'dues', label: 'Outstanding Dues' },
  { key: 'admissions', label: 'Admissions' },
  { key: 'complaints', label: 'Complaints' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'visitors', label: 'Visitors' },
];

export default function ReportsPage() {
  const user = useAuthStore((s) => s.user);
  const selectedHostelId = useHostelStore((s) => s.selectedHostelId);
  const effectiveHostelId = user?.hostelId ?? selectedHostelId;

  const [activeTab, setActiveTab] = useState('occupancy');

  if (!effectiveHostelId) {
    return (
      <EmptyState
        title="Select a hostel to get started"
        description="Use the hostel switcher in the top bar to pick or create a hostel before viewing reports."
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Reports" description="Occupancy, fees, and activity across your hostel." />

      <div className="mb-4 flex flex-wrap gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`border-b-2 px-3 py-2 text-sm font-medium transition ${
              activeTab === tab.key
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'occupancy' && <OccupancyReportPanel hostelId={effectiveHostelId} />}
      {activeTab === 'fees' && <FeeCollectionReportPanel hostelId={effectiveHostelId} />}
      {activeTab === 'dues' && <OutstandingDuesReportPanel hostelId={effectiveHostelId} />}

      {activeTab === 'admissions' && (
        <StatusReportPanel
          hostelId={effectiveHostelId}
          title="Admissions by status"
          useReportQuery={useAdmissionsReport}
          exportPath="/reports/admissions"
        />
      )}

      {activeTab === 'complaints' && (
        <StatusReportPanel
          hostelId={effectiveHostelId}
          title="Complaints by status"
          useReportQuery={useComplaintsReport}
          exportPath="/reports/complaints"
          extra={(report) => (
            <div className="mt-4">
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-subtle">By category</h3>
              <StatusBreakdownChart data={report.byCategory} />
            </div>
          )}
        />
      )}

      {activeTab === 'maintenance' && (
        <StatusReportPanel
          hostelId={effectiveHostelId}
          title="Maintenance by status"
          useReportQuery={useMaintenanceReport}
          exportPath="/reports/maintenance"
          extra={(report) => (
            <p className="mt-3 text-sm text-ink-muted">
              Total cost: <span className="font-semibold text-ink">{formatMoney(report.totalCostMinorUnits)}</span>
            </p>
          )}
        />
      )}

      {activeTab === 'visitors' && <VisitorsReportPanel hostelId={effectiveHostelId} />}
    </div>
  );
}