import { describe, it, expect } from 'vitest';
import {
  isValidTimeZone,
  getLocalDateParts,
  getLocalMonthKey,
  calendarDaysBetweenInTz,
} from './timezone.js';

describe('isValidTimeZone', () => {
  it('accepts valid IANA timezones', () => {
    expect(isValidTimeZone('Asia/Karachi')).toBe(true);
    expect(isValidTimeZone('America/New_York')).toBe(true);
    expect(isValidTimeZone('UTC')).toBe(true);
  });

  it('rejects invalid or empty timezone strings', () => {
    expect(isValidTimeZone('Not/A/Zone')).toBe(false);
    expect(isValidTimeZone('')).toBe(false);
  });
});

describe('getLocalDateParts', () => {
  it('resolves a UTC instant to the PREVIOUS local date in a timezone behind UTC', () => {
    // 2026-01-01T00:30 UTC is still 2025-12-31 evening in New York (UTC-5)
    const parts = getLocalDateParts('America/New_York', new Date('2026-01-01T00:30:00Z'));
    expect(parts).toMatchObject({ year: 2025, month: 12, day: 31 });
  });

  it('resolves the same instant to the NEXT local date in a timezone ahead of UTC', () => {
    const parts = getLocalDateParts('Asia/Karachi', new Date('2026-01-01T20:30:00Z')); // UTC+5
    expect(parts).toMatchObject({ year: 2026, month: 1, day: 2 });
  });
});

describe('getLocalMonthKey', () => {
  it('returns the PREVIOUS month just after UTC midnight on the 1st, for a timezone behind UTC', () => {
    const instant = new Date('2026-03-01T02:00:00Z'); // 02:00 UTC, March 1st
    expect(getLocalMonthKey('America/Los_Angeles', instant)).toBe('2026-02'); // still Feb 28 there
  });

  it('returns the CURRENT month at the same instant for a timezone at/ahead of UTC', () => {
    const instant = new Date('2026-03-01T02:00:00Z');
    expect(getLocalMonthKey('Asia/Karachi', instant)).toBe('2026-03');
  });
});

describe('calendarDaysBetweenInTz', () => {
  it('counts calendar days apart, not elapsed hours', () => {
    const earlier = new Date('2026-06-10T23:00:00Z');
    const later = new Date('2026-06-11T01:00:00Z'); // 2h later, next UTC calendar day
    expect(calendarDaysBetweenInTz(earlier, later, 'UTC')).toBe(1);
  });

  it('returns 0 for two instants on the same local calendar day', () => {
    const earlier = new Date('2026-06-10T01:00:00Z');
    const later = new Date('2026-06-10T23:00:00Z');
    expect(calendarDaysBetweenInTz(earlier, later, 'UTC')).toBe(0);
  });
});
