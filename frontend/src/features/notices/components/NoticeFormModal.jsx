import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles } from 'lucide-react';
import Modal from '@/components/ui/Modal.jsx';
import { aiApi } from '@/features/ai/api/aiApi';
import { useCreateNotice, useUpdateNotice } from '../hooks/useNotices';

const AUDIENCES = ['everyone', 'staff', 'residents'];
const DRAFT_TYPES = ['announcement', 'payment_reminder', 'maintenance', 'emergency'];

const schema = z.object({
  title: z.string().min(3, 'Title is required'),
  body: z.string().min(3, 'Body is required'),
  audience: z.enum(AUDIENCES),
  publishAt: z.string().optional(),
  expiresAt: z.string().optional(),
});

function toFormValues(notice) {
  if (!notice) return { audience: 'everyone' };
  return {
    title: notice.title,
    body: notice.body,
    audience: notice.audience,
    publishAt: notice.publishAt ? notice.publishAt.slice(0, 16) : '',
    expiresAt: notice.expiresAt ? notice.expiresAt.slice(0, 16) : '',
  };
}

export default function NoticeFormModal({ open, onClose, hostelId, notice }) {
  const isEdit = Boolean(notice);
  const createNotice = useCreateNotice();
  const updateNotice = useUpdateNotice();
  const mutation = isEdit ? updateNotice : createNotice;

  const [draftType, setDraftType] = useState('announcement');
  const [draftPrompt, setDraftPrompt] = useState('');
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftError, setDraftError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: toFormValues(notice) });

  useEffect(() => {
    if (open) {
      reset(toFormValues(notice));
      setDraftPrompt('');
      setDraftError(null);
    }
  }, [open, notice, reset]);

  const handleGenerateDraft = async () => {
    if (!draftPrompt.trim()) return;
    setDraftLoading(true);
    setDraftError(null);
    try {
      const res = await aiApi.generateNoticeDraft(hostelId, draftType, draftPrompt.trim());
      setValue('title', res.data.draft.title, { shouldValidate: true });
      setValue('body', res.data.draft.body, { shouldValidate: true });
    } catch (err) {
      setDraftError(err.message ?? 'Could not generate a draft');
    } finally {
      setDraftLoading(false);
    }
  };

  const onSubmit = async (values) => {
    const payload = {
      title: values.title,
      body: values.body,
      audience: values.audience,
      publishAt: values.publishAt || undefined,
      expiresAt: values.expiresAt || null,
    };

    if (isEdit) {
      await mutation.mutateAsync({ id: notice._id, data: payload });
    } else {
      await mutation.mutateAsync({ ...payload, hostelId });
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Notice' : 'New Notice'}>
      {!isEdit && (
        <div className="mb-4 rounded-control border border-dashed border-brand-200 bg-brand-50 p-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-brand-700">
            <Sparkles size={13} /> Draft with AI (optional)
          </p>
          <div className="flex flex-wrap gap-2">
            <select
              value={draftType}
              onChange={(e) => setDraftType(e.target.value)}
              className="rounded-control border border-border bg-surface px-2.5 py-1.5 text-xs outline-none focus:border-brand-500"
            >
              {DRAFT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace('_', ' ')}
                </option>
              ))}
            </select>
            <input
              value={draftPrompt}
              onChange={(e) => setDraftPrompt(e.target.value)}
              placeholder="e.g. water will be shut off tomorrow 10am-2pm for maintenance"
              className="min-w-[12rem] flex-1 rounded-control border border-border bg-surface px-2.5 py-1.5 text-xs outline-none focus:border-brand-500"
            />
            <button
              type="button"
              onClick={handleGenerateDraft}
              disabled={!draftPrompt.trim() || draftLoading}
              className="rounded-control bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {draftLoading ? 'Drafting…' : 'Generate'}
            </button>
          </div>
          {draftError && <p className="mt-1.5 text-xs text-danger">{draftError}</p>}
          <p className="mt-1.5 text-xs text-ink-subtle">
            Fills the title and body below — review and edit before publishing.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Title</label>
          <input {...register('title')} className={inputClass} />
          {errors.title && <p className="mt-1 text-xs text-danger">{errors.title.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Body</label>
          <textarea rows={4} {...register('body')} className={inputClass} />
          {errors.body && <p className="mt-1 text-xs text-danger">{errors.body.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Audience</label>
          <select {...register('audience')} className={inputClass}>
            {AUDIENCES.map((a) => (
              <option key={a} value={a}>
                {a[0].toUpperCase() + a.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Publish at (optional)</label>
            <input type="datetime-local" {...register('publishAt')} className={inputClass} />
            <p className="mt-1 text-xs text-ink-subtle">Leave blank to publish immediately.</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Expires at (optional)</label>
            <input type="datetime-local" {...register('expiresAt')} className={inputClass} />
          </div>
        </div>

        {mutation.isError && (
          <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">
            {mutation.error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Publish notice'}
        </button>
      </form>
    </Modal>
  );
}

const inputClass =
  'w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500';