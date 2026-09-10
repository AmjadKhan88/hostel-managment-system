import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal.jsx';
import { usePermissionsCatalog } from '../hooks/usePermissionsCatalog';
import { useCreateRole, useUpdateRole } from '../hooks/useRoles';

export default function RoleFormModal({ open, onClose, hostelId, role }) {
  const isEdit = Boolean(role);
  const { data } = usePermissionsCatalog();
  const groups = data?.data?.groups ?? [];
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const mutation = isEdit ? updateRole : createRole;

  const [name, setName] = useState('');
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    if (open) {
      setName(role?.name ?? '');
      setSelected(new Set(role?.permissions ?? []));
    }
  }, [open, role]);

  const togglePermission = (key) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const permissions = Array.from(selected);
    if (!name.trim() || permissions.length === 0) return;

    if (isEdit) {
      await mutation.mutateAsync({ id: role._id, data: { name: name.trim(), permissions } });
    } else {
      await mutation.mutateAsync({ hostelId, name: name.trim(), permissions });
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Role' : 'Add Role'} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Role name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Warden, Receptionist"
            className="w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-ink">Permissions</label>
          <div className="max-h-72 space-y-3 overflow-y-auto rounded-control border border-border p-3">
            {groups.map((group) => (
              <div key={group.category}>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-subtle">
                  {group.label}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {group.permissions.map((p) => (
                    <label key={p.key} className="flex items-center gap-2 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={selected.has(p.key)}
                        onChange={() => togglePermission(p.key)}
                        className="rounded border-border text-brand-500 focus:ring-brand-500"
                      />
                      <span className="capitalize">{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {selected.size === 0 && (
            <p className="mt-1 text-xs text-ink-subtle">Select at least one permission.</p>
          )}
        </div>

        {mutation.isError && (
          <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">
            {mutation.error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={mutation.isPending || !name.trim() || selected.size === 0}
          className="w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create role'}
        </button>
      </form>
    </Modal>
  );
}