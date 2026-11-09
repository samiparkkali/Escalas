import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatDisplayDate, getNextMonthRange, toIsoDate } from './dateUtils';

describe('dateUtils', () => {
  afterEach(() => vi.useRealTimers());

  it('formats ISO dates as day-month-year', () => {
    expect(formatDisplayDate('2026-12-07')).toBe('07-12-2026');
    expect(formatDisplayDate('')).toBe('');
  });

  it('converts dates and display strings to ISO', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toIsoDate('05-01-2026')).toBe('2026-01-05');
    expect(toIsoDate('2026-01-05')).toBe('2026-01-05');
    expect(toIsoDate(null)).toBeNull();
  });

  it('defaults to the whole of next month, across a year end', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 11, 31, 23, 30));
    expect(getNextMonthRange()).toEqual({ startDate: '2027-01-01', endDate: '2027-01-31' });
    vi.setSystemTime(new Date(2027, 0, 15));
    expect(getNextMonthRange()).toEqual({ startDate: '2027-02-01', endDate: '2027-02-28' });
  });
});
