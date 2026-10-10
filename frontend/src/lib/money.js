import { create } from 'zustand';

/**
 * All money in this app is stored/transmitted as integer minor units
 * (paisa/cents) — see docs/ARCHITECTURE.md. These helpers are the only
 * place the major<->minor conversion should happen on the frontend.
 */

// Which currency formatMoney uses when none is passed. useCurrencySync sets
// it from the hostel's Settings. It lives in a store (not a plain variable)
// so the app re-renders when it changes.
export const useCurrencyStore = create((set) => ({
  currency: 'PKR',
  setCurrency: (currency) => set({ currency }),
}));

export function formatMoney(minorUnits, currency = useCurrencyStore.getState().currency) {
  const amount = (minorUnits ?? 0) / 100;
  try {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency }).format(amount);
  } catch {
    // An invalid code typed into Settings shouldn't break every page.
    return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

export function toMinorUnits(majorUnitsString) {
  return Math.round(Number(majorUnitsString || 0) * 100);
}
