import { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { useAuthStore } from '@/store/authStore';
import { useHostelStore } from '@/store/hostelStore';
import { useAssistantHistory, useAskAssistant } from '@/features/ai/hooks/useAIAssistant';

const SUGGESTIONS = [
  'How many beds are currently empty?',
  'Which residents have unpaid fees?',
  "What's this month's fee collection so far?",
  'How many complaints are still open?',
];

export default function AIAssistantPage() {
  const user = useAuthStore((s) => s.user);
  const selectedHostelId = useHostelStore((s) => s.selectedHostelId);
  const effectiveHostelId = user?.hostelId ?? selectedHostelId;

  const [question, setQuestion] = useState('');
  const { data, isLoading } = useAssistantHistory(effectiveHostelId);
  const ask = useAskAssistant(effectiveHostelId);

  const history = data?.data?.history ?? [];

  if (!effectiveHostelId) {
    return (
      <EmptyState
        title="Select a hostel to get started"
        description="Use the hostel switcher in the top bar to ask the assistant about a specific hostel."
      />
    );
  }

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    await ask.mutateAsync(question.trim());
    setQuestion('');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="AI Admin Assistant"
        description="Ask questions about occupancy, residents, fees, complaints, and maintenance — answered from real data, never guessed."
      />

      <div className="surface-card p-6">
        <form onSubmit={handleAsk} className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question…"
            className="w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={!question.trim() || ask.isPending}
            className="flex shrink-0 items-center gap-1.5 rounded-control bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={15} /> {ask.isPending ? 'Thinking…' : 'Ask'}
          </button>
        </form>

        {history.length === 0 && !isLoading && (
          <div className="mt-4 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setQuestion(s)}
                className="rounded-pill border border-border px-3 py-1.5 text-xs text-ink-muted hover:bg-canvas"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {ask.isError && (
          <p className="mt-3 text-sm text-danger">{ask.error.message}</p>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {isLoading && <p className="text-sm text-ink-muted">Loading conversation history…</p>}
        {history.map((entry) => (
          <div key={entry._id} className="surface-card p-5">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-canvas text-ink-subtle">
                ?
              </span>
              <p className="text-sm font-medium text-ink">{entry.question}</p>
            </div>
            <div className="mt-2 flex items-start gap-2">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Sparkles size={13} />
              </span>
              <p className="text-sm text-ink-muted">{entry.answer}</p>
            </div>
            <p className="mt-2 pl-8 text-xs text-ink-subtle">{new Date(entry.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}