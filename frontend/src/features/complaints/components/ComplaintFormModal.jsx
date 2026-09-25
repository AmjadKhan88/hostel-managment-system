import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles } from 'lucide-react';
import Modal from '@/components/ui/Modal.jsx';
import { useResidents } from '@/features/residents/hooks/useResidents';
import { aiApi } from '@/features/ai/api/aiApi';
import { useCreateComplaint } from '../hooks/useComplaintMutations';

const CATEGORIES = ['plumbing', 'electrical', 'cleanliness', 'noise', 'security', 'internet', 'other'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const schema = z.object({
  subject: z.string().min(3, 'Subject is required'),
  description: z.string().min(5, 'Description is required'),
  category: z.string().min(1, 'Select a category'),
  priority: z.enum(PRIORITIES),
});

export default function ComplaintFormModal({ open, onClose, hostelId }) {
  const createComplaint = useCreateComplaint();
  const [residentSearch, setResidentSearch] = useState('');
  const [selectedResident, setSelectedResident] = useState(null);
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageError, setTriageError] = useState(null);
  const [aiSuggested, setAiSuggested] = useState(false);

  const { data: residentsData } = useResidents({
    hostelId,
    limit: 5,
    search: residentSearch || undefined,
  });
  const residents = residentSearch ? residentsData?.data?.items ?? [] : [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { priority: 'medium' } });

  const description = watch('description');

  const handleTriage = async () => {
    if (!description || description.trim().length < 5) return;
    setTriageLoading(true);
    setTriageError(null);
    setAiSuggested(false);
    try {
      const res = await aiApi.triageComplaint(hostelId, description.trim());
      setValue('category', res.data.suggestion.category, { shouldValidate: true });
      setValue('priority', res.data.suggestion.priority, { shouldValidate: true });
      setAiSuggested(true);
    } catch (err) {
      setTriageError(err.message ?? 'Could not classify this complaint');
    } finally {
      setTriageLoading(false);
    }
  };

  const onSubmit = async (values) => {
    await createComplaint.mutateAsync({
      ...values,
      hostelId,
      residentId: selectedResident?._id,
    });
    reset();
    setSelectedResident(null);
    setResidentSearch('');
    setAiSuggested(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New Complaint">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Subject</label>
          <input {...register('subject')} className={inputClass} />
          {errors.subject && <p className="mt-1 text-xs text-danger">{errors.subject.message}</p>}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm font-medium text-ink">Description</label>
            <button
              type="button"
              onClick={handleTriage}
              disabled={!description || description.trim().length < 5 || triageLoading}
              className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles size={12} /> {triageLoading ? 'Analyzing…' : 'Suggest with AI'}
            </button>
          </div>
          <textarea rows={3} {...register('description')} className={inputClass} />
          {errors.description && <p className="mt-1 text-xs text-danger">{errors.description.message}</p>}
          {triageError && <p className="mt-1 text-xs text-danger">{triageError}</p>}
          {aiSuggested && (
            <p className="mt-1 text-xs text-ink-subtle">Category and priority below are AI suggestions — feel free to change them.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Category</label>
            <select {...register('category')} className={inputClass}>
              <option value="">Select…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c[0].toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-xs text-danger">{errors.category.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Priority</label>
            <select {...register('priority')} className={inputClass}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p[0].toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Reported by resident (optional)</label>
          {selectedResident ? (
            <div className="flex items-center justify-between rounded-control border border-border px-3 py-2 text-sm">
              <span>{selectedResident.name}</span>
              <button
                type="button"
                onClick={() => setSelectedResident(null)}
                className="text-xs font-medium text-danger hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              <input
                value={residentSearch}
                onChange={(e) => setResidentSearch(e.target.value)}
                placeholder="Search resident by name…"
                className={inputClass}
              />
              {residents.length > 0 && (
                <ul className="mt-1 max-h-32 overflow-y-auto rounded-control border border-border">
                  {residents.map((r) => (
                    <li key={r._id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedResident(r);
                          setResidentSearch('');
                        }}
                        className="block w-full px-3 py-1.5 text-left text-sm hover:bg-canvas"
                      >
                        {r.name} <span className="text-xs text-ink-subtle">({r.registrationNumber})</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {createComplaint.isError && (
          <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">
            {createComplaint.error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={createComplaint.isPending}
          className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {createComplaint.isPending ? 'Submitting…' : 'Submit complaint'}
        </button>
      </form>
    </Modal>
  );
}

const inputClass =
  'w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500';