// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../utils/api';
import { initialConfig } from '../utils/scheduleConfig';
import { cleanup, click, render } from '../testing/dom';
import ScheduleViewTab from './ScheduleViewTab';

vi.mock('../utils/api', async (importOriginal) => ({
  ...(await importOriginal()),
  default: { post: vi.fn() },
}));

const generateButtons = (container) =>
  [...container.querySelectorAll('button')].filter((b) => b.textContent.startsWith('Generate'));

const clickGenerate = async (config) => {
  const container = await render(<ScheduleViewTab config={config} schedule={null} setSchedule={vi.fn()} />);
  const buttons = generateButtons(container);
  expect(buttons).toHaveLength(2);
  for (const button of buttons) await click(button);
};

describe('ScheduleViewTab generate', () => {
  beforeEach(() => {
    api.post.mockReset();
    api.post.mockResolvedValue({ data: null });
  });
  afterEach(cleanup);

  // Shows that a click reaches the request, so the blocked cases below are not passing by default.
  it('sends the request when both dates are set', async () => {
    await clickGenerate(initialConfig());
    expect(api.post).toHaveBeenCalledTimes(2);
  });

  it.each(['start_date', 'end_date'])('sends no request when %s is cleared', async (field) => {
    await clickGenerate({ ...initialConfig(), [field]: '' });
    expect(api.post, `Generate posted a config with an empty ${field}`).not.toHaveBeenCalled();
  });
});
