import { useState, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';
import { useDocuments, useUploadDocument, useDeleteDocument } from '../hooks/useDocuments';

const DOCUMENT_TYPES = ['id_card', 'guardian_id', 'photo', 'admission_form', 'other'];

export default function DocumentsPanel({ residentId }) {
  const { data, isLoading } = useDocuments(residentId);
  const upload = useUploadDocument(residentId);
  const deleteDoc = useDeleteDocument(residentId);
  const fileInputRef = useRef(null);

  const [fileType, setFileType] = useState('id_card');
  const [selectedFile, setSelectedFile] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const documents = data?.data?.documents ?? [];

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('fileType', fileType);

    await upload.mutateAsync(formData);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isImage = (mimeType) => mimeType.startsWith('image/');

  return (
    <section className="surface-card p-6">
      <h2 className="text-sm font-semibold text-ink">Documents</h2>

      {isLoading && <p className="mt-2 text-sm text-ink-muted">Loading documents…</p>}

      {!isLoading && documents.length === 0 && (
        <p className="mt-2 text-sm text-ink-muted">No documents uploaded yet.</p>
      )}

      <ul className="mt-3 space-y-2">
        {documents.map((doc) => (
          <li
            key={doc._id}
            className="flex items-center justify-between rounded-control border border-border px-3.5 py-2.5"
          >
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-ink hover:text-brand-600"
            >
              {isImage(doc.mimeType) ? (
                <ImageIcon size={16} className="text-ink-subtle" />
              ) : (
                <FileText size={16} className="text-ink-subtle" />
              )}
              <span className="font-medium">{doc.originalFileName}</span>
              <span className="text-xs capitalize text-ink-subtle">({doc.fileType.replace('_', ' ')})</span>
            </a>
            <button
              onClick={() => setDeleting(doc)}
              className="rounded-control p-1.5 text-danger hover:bg-danger-bg"
              aria-label="Delete document"
            >
              <Trash2 size={15} />
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleUpload} className="mt-4 flex flex-wrap items-center gap-2">
        <select
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          className="rounded-control border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-brand-500"
        >
          {DOCUMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace('_', ' ')}
            </option>
          ))}
        </select>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          className="text-sm text-ink-muted file:mr-2 file:rounded-control file:border-0 file:bg-canvas file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink hover:file:bg-border"
        />
        <button
          type="submit"
          disabled={!selectedFile || upload.isPending}
          className="flex items-center gap-1.5 rounded-control bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload size={14} /> {upload.isPending ? 'Uploading…' : 'Upload'}
        </button>
      </form>
      <p className="mt-1 text-xs text-ink-subtle">JPEG, PNG, or PDF — up to 5MB.</p>
      {upload.isError && <p className="mt-2 text-sm text-danger">{upload.error.message}</p>}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          await deleteDoc.mutateAsync(deleting._id);
          setDeleting(null);
        }}
        title="Delete document"
        description={deleting ? `Delete "${deleting.originalFileName}"? This can't be undone.` : ''}
        confirmLabel="Delete"
        danger
        isLoading={deleteDoc.isPending}
      />
    </section>
  );
}