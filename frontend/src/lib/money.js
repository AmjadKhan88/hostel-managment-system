/**
 * All money in this app is stored/transmitted as integer minor units
 * (paisa/cents) — see docs/ARCHITECTURE.md. These helpers are the only
 * place the major<->minor conversion should happen on the frontend.
 */
export function formatMoney(minorUnits) {
  return (minorUnits / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function toMinorUnits(majorUnitsString) {
  return Math.round(Number(majorUnitsString || 0) * 100);
}