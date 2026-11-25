// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { initialConfig } from '../utils/scheduleConfig';
import { cleanup, render } from '../testing/dom';
import ScheduleConfigTab from './ScheduleConfigTab';

describe('ScheduleConfigTab staffing fields', () => {
  afterEach(cleanup);

  // The API drops unknown keys silently, so a misspelt field would never reach the scheduler.
  it('are named after the staffing keys of initialConfig', async () => {
    const config = initialConfig();
    const container = await render(<ScheduleConfigTab config={config} setConfig={vi.fn()} />);
    const fields = [...container.querySelectorAll('input[type="number"]')].map((input) => input.id);
    const staffingKeys = Object.keys(config).filter((key) => key !== 'start_date' && key !== 'end_date');
    expect(fields.sort()).toEqual(staffingKeys.sort());
  });
});
