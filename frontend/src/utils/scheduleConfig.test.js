import { describe, expect, it } from 'vitest';
import { initialConfig, restoreConfig } from './scheduleConfig';

describe('restoreConfig', () => {
  it('restores the period and staffing of the saved schedule', () => {
    const saved = {
      start_date: '2026-12-07',
      end_date: '2026-12-20',
      is_24h: true,
      morning_weekday_specialist: 2,
      night_weekday_specialist: 0,
      morning_weekend_specialist: 3,
      night_weekend_specialist: 0,
      morning_weekday_intern: 0,
      night_weekday_intern: 3,
      morning_weekend_intern: 1,
      night_weekend_intern: 4,
    };
    expect(restoreConfig(initialConfig(), { start_date: '2026-12-07', config: saved })).toEqual(saved);
  });

  it('keeps the current config when there is no saved schedule', () => {
    const current = initialConfig();
    expect(restoreConfig(current, null)).toBe(current);
  });
});
