import { useEffect } from 'react';
import { portalAuthApi } from '../api/portalAuthApi';
import { useResidentAuthStore } from '@/store/residentAuthStore';

export function useResidentSessionHydration() {
  const status = useResidentAuthStore((s) => s.status);
  const setResident = useResidentAuthStore((s) => s.setResident);
  const clearResident = useResidentAuthStore((s) => s.clearResident);
  const setStatus = useResidentAuthStore((s) => s.setStatus);

  useEffect(() => {
    if (status !== 'idle') return;
    setStatus('loading');
    portalAuthApi
      .me()
      .then((res) => setResident(res.data.resident))
      .catch(() => clearResident());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
}
