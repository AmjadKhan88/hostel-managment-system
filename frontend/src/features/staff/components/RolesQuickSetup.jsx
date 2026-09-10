import { useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { useRoles } from '../hooks/useRoles';
import RoleFormModal from './RoleFormModal.jsx';

export default function RolesQuickSetup({ hostelId }) {
  const { data } = useRoles(hostelId);
  const roles = data?.data?.roles ?? [];
  const [modalState, setModalState] = useState({ open: false, role: null });

  return (
    <div className="surface-card mb-4 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">Roles &amp; Permissions</h2>
        <button
          onClick={() => setModalState({ open: true, role: null })}
          className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          <Plus size={14} /> Add role
        </button>
      </div>

      {roles.length === 0 && (
        <p className="text-sm text-ink-muted">No roles yet — add one before creating staff.</p>
      )}

      <div className="flex flex-wrap gap-2">
        {roles.map((role) => (
          <button
            key={role._id}
            onClick={() => setModalState({ open: true, role })}
            className="flex items-center gap-1.5 rounded-control border border-border px-3 py-1.5 text-sm text-ink hover:bg-canvas"
          >
            {role.name}
            <span className="text-xs text-ink-subtle">({role.permissions.length})</span>
            <Pencil size={12} className="text-ink-subtle" />
          </button>
        ))}
      </div>

      <RoleFormModal
        open={modalState.open}
        onClose={() => setModalState({ open: false, role: null })}
        hostelId={hostelId}
        role={modalState.role}
      />
    </div>
  );
}