import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useHostelStore } from '@/store/hostelStore';
import { useResidentAuthStore } from '@/store/residentAuthStore';
import { useCurrencyStore } from '@/lib/money';
import { useHostelSettings } from './useHostelSettings';

/**
 * Keeps formatMoney's currency in step with the hostel being viewed. Staff
 * and residents can both be signed in in one browser, so the URL decides
 * which session's hostel applies. Returning the currency makes the App
 * re-render when it changes, which refreshes every price on screen. If the
 * hostel can't be loaded, it stays on the PKR default.
 */
export function useCurrencySync() {
  const { pathname } = useLocation();
  const inPortal = pathname.startsWith('/portal');

  const user = useAuthStore((s) => s.user);
  const selectedHostelId = useHostelStore((s) => s.selectedHostelId);
  const resident = useResidentAuthStore((s) => s.resident);

  const hostelId = inPortal ? null : (user?.hostelId ?? selectedHostelId);
  const { data } = useHostelSettings(hostelId);

  const nextCurrency = inPortal ? resident?.currency : data?.data?.hostel?.currency;
  const setCurrency = useCurrencyStore((s) => s.setCurrency);

  useEffect(() => {
    if (nextCurrency) setCurrency(String(nextCurrency).toUpperCase());
  }, [nextCurrency, setCurrency]);

  return useCurrencyStore((s) => s.currency);
}
