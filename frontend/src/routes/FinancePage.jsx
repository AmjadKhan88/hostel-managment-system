import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, Wallet, Sparkles, Trash2, Pencil, Repeat } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import PageHeader from '@/components/ui/PageHeader.jsx';
import StatCard from '@/components/ui/StatCard.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';
import { useAuthStore } from '@/store/authStore';
import { useHostelStore } from '@/store/hostelStore';
import { formatMoney } from '@/lib/money';
import { useFinancialOverview, useExpenses, useDeleteExpense } from '@/features/finance/hooks/useFinance';
import ExpenseFormModal from '@/features/finance/components/ExpenseFormModal.jsx';

const CATEGORY_COLORS = ['#2F6FED', '#12A150', '#F5A524', '#F0416C', '#8FB3FF', '#5C8DFB', '#9AA1B1', '#1E56D6'];

export default function FinancePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const selectedHostelId = useHostelStore((s) => s.selectedHostelId);
  const effectiveHostelId = user?.hostelId ?? selectedHostelId;

  const [modalState, setModalState] = useState({ open: false, expense: null });
  const [deleting, setDeleting] = useState(null);

  const { data: overviewData, isLoading } = useFinancialOverview(effectiveHostelId);
  const { data: expensesData } = useExpenses({ hostelId: effectiveHostelId, limit: 10 });
  const deleteExpense = useDeleteExpense();

  const overview = overviewData?.data;
  const expenses = expensesData?.data?.items ?? [];

  if (!effectiveHostelId) {
    return (
      <EmptyState
        title="Select a hostel to get started"
        description="Use the hostel switcher in the top bar to pick or create a hostel before viewing finances."
      />
    );
  }

  if (isLoading || !overview) return <p className="text-sm text-ink-muted">Loading financial overview…</p>;

  const pieData = overview.expensesByCategory.map((e) => ({
    name: e.category.replace('_', ' '),
    value: e.totalMinorUnits / 100,
  }));

  const isProfit = overview.netThisMonthMinorUnits >= 0;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Finances"
        description={`Income vs. expenses for ${overview.month}.`}
        action={
          <button
            onClick={() => setModalState({ open: true, expense: null })}
            className="flex items-center gap-1.5 rounded-control bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            <Plus size={16} /> Record Expense
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Income (all time)" value={formatMoney(overview.totalIncomeMinorUnits)} icon={Wallet} />
        <StatCard
          label="This Month's Income"
          value={formatMoney(overview.thisMonthIncomeMinorUnits)}
          icon={TrendingUp}
        />
        <StatCard
          label="This Month's Expenses"
          value={formatMoney(overview.thisMonthExpensesMinorUnits)}
          icon={TrendingDown}
        />
        <StatCard
          label={isProfit ? 'Net Profit (this month)' : 'Net Loss (this month)'}
          value={formatMoney(Math.abs(overview.netThisMonthMinorUnits))}
          icon={isProfit ? TrendingUp : TrendingDown}
          hint={isProfit ? 'Income exceeds expenses' : 'Expenses exceed income'}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-6">
          <h2 className="mb-3 text-sm font-semibold text-ink">Expenses by category (this month)</h2>
          {pieData.length === 0 ? (
            <p className="text-sm text-ink-muted">No expenses recorded this month yet.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatMoney(Math.round(value * 100))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="surface-card p-6">
          <h2 className="mb-3 text-sm font-semibold text-ink">Recent expenses</h2>
          {expenses.length === 0 ? (
            <p className="text-sm text-ink-muted">No expenses recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {expenses.map((e) => (
                <li
                  key={e._id}
                  className="flex items-center justify-between rounded-control border border-border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="flex items-center gap-1.5 font-medium text-ink">
                      {e.title}
                      {e.recurrence === 'monthly' && (
                        <span title="Recurs automatically each month">
                          <Repeat size={12} className="text-brand-600" />
                        </span>
                      )}
                      {!e.recordedBy && (
                        <span className="rounded-pill bg-canvas px-1.5 py-0.5 text-[10px] font-medium text-ink-subtle">
                          auto
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-ink-subtle">
                      {e.category.replace('_', ' ')} · {new Date(e.incurredAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink">{formatMoney(e.amountMinorUnits)}</span>
                    <button
                      onClick={() => setModalState({ open: true, expense: e })}
                      className="rounded-control p-1 text-ink-muted hover:bg-canvas"
                      aria-label="Edit expense"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleting(e)}
                      className="rounded-control p-1 text-danger hover:bg-danger-bg"
                      aria-label="Delete expense"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="surface-card mt-4 flex items-center justify-between p-5">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
            <Sparkles size={15} className="text-brand-600" /> Want to know where you're losing money?
          </p>
          <p className="mt-0.5 text-xs text-ink-muted">
            Ask the AI Assistant — it reads this exact expense/income data and can suggest where to cut costs.
          </p>
        </div>
        <button
          onClick={() => navigate('/ai-assistant')}
          className="shrink-0 rounded-control border border-border px-3 py-1.5 text-sm font-medium text-ink hover:bg-canvas"
        >
          Open AI Assistant
        </button>
      </div>

      <ExpenseFormModal
        open={modalState.open}
        onClose={() => setModalState({ open: false, expense: null })}
        hostelId={effectiveHostelId}
        expense={modalState.expense}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          await deleteExpense.mutateAsync(deleting._id);
          setDeleting(null);
        }}
        title="Delete expense"
        description={deleting ? `Delete "${deleting.title}"? This can't be undone.` : ''}
        confirmLabel="Delete"
        danger
        isLoading={deleteExpense.isPending}
      />
    </div>
  );
}