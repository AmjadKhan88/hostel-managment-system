const DAY_MS = 24 * 60 * 60 * 1000;

export function isValidTimeZone(tz) {
  if (!tz) return false;
  try {
    // eslint-disable-next-line no-new
    new Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Decomposes an instant into its local date/time parts in `timezone`,
 * using the Intl API already built into Node — no date library needed.
 */
export function getLocalDateParts(timezone, date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month), // 1-12
    day: Number(parts.day),
    hour: Number(parts.hour === '24' ? '0' : parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

/** e.g. "2026-09" — the local year-month for `date` in `timezone`. */
export function getLocalMonthKey(timezone, date = new Date()) {
  const { year, month } = getLocalDateParts(timezone, date);
  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Whole calendar days between two instants, AS OBSERVED IN `timezone` —
 * not elapsed hours. 23:00 and 01:00 two hours apart can be 0 or 1
 * calendar days apart depending on the timezone; comparing raw elapsed
 * time gets this wrong right around local midnight.
 */
export function calendarDaysBetweenInTz(earlier, later, timezone) {
  const a = getLocalDateParts(timezone, earlier);
  const b = getLocalDateParts(timezone, later);
  const aUtc = Date.UTC(a.year, a.month - 1, a.day);
  const bUtc = Date.UTC(b.year, b.month - 1, b.day);
  return Math.round((bUtc - aUtc) / DAY_MS);
}
