// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import api from './utils/api';
import { initialConfig } from './utils/scheduleConfig';
import { buttonNamed, cleanup, click, render, waitFor } from './testing/dom';
import App from './App';

vi.mock('./utils/api', async (importOriginal) => ({
  ...(await importOriginal()),
  default: { get: vi.fn() },
  getToken: () => 'synthetic-token',
  logout: vi.fn(),
}));

// Signs the next user in without a login request.
vi.mock('./components/Login', () => ({
  default: ({ onSuccess }) => <button onClick={() => onSuccess('scheduler.two')}>Stub sign in</button>,
}));

// Counts differ from the defaults, so a config carried over from this user is caught.
const SAVED_CONFIG = {
  start_date: '2027-03-01',
  end_date: '2027-03-14',
  is_24h: false,
  morning_weekday_specialist: 5,
  night_weekday_specialist: 4,
  morning_weekend_specialist: 3,
  night_weekend_specialist: 0,
  morning_weekday_intern: 6,
  night_weekday_intern: 0,
  morning_weekend_intern: 7,
  night_weekend_intern: 8,
};

const SAVED_SCHEDULE = {
  start_date: SAVED_CONFIG.start_date,
  end_date: SAVED_CONFIG.end_date,
  is_24h: false,
  config: SAVED_CONFIG,
  assignments: [],
  unassigned_shifts: [],
  success: true,
  message: 'Schedule generated',
};

const shownConfig = (container) => {
  const value = (id) => container.querySelector(`#${id}`).value;
  const shown = { start_date: value('start-date'), end_date: value('end-date') };
  for (const input of container.querySelectorAll('input[type="number"]')) shown[input.id] = Number(input.value);
  return shown;
};

const openConfigTab = async (container) => {
  await waitFor(() => buttonNamed(container, 'Schedule Config'));
  await click(buttonNamed(container, 'Schedule Config'));
};

describe('App signOut', () => {
  let saved;

  beforeEach(() => {
    saved = SAVED_SCHEDULE;
    api.get.mockReset();
    api.get.mockImplementation(async (url) => {
      if (url === '/api/auth/me') return { data: { username: 'scheduler.one' } };
      if (url === '/api/schedule') return { data: saved };
      return { data: [] };
    });
  });
  afterEach(cleanup);

  it('resets the schedule config so the next user starts from initialConfig', async () => {
    const container = await render(<App />);
    await openConfigTab(container);
    await waitFor(() => container.querySelector('#start-date')?.value === SAVED_CONFIG.start_date);
    const savedShown = { ...SAVED_CONFIG };
    delete savedShown.is_24h;
    expect(shownConfig(container)).toEqual(savedShown);

    await click(buttonNamed(container, 'Log out'));
    // The next user has no saved schedule, so only signOut can clear the first user's config.
    saved = null;
    await click(buttonNamed(container, 'Stub sign in'));
    await waitFor(() => api.get.mock.calls.filter(([url]) => url === '/api/schedule').length === 2);
    await openConfigTab(container);

    expect(shownConfig(container), 'the next user sees the previous user\'s period and staffing').toEqual(
      initialConfig(),
    );
  });
});
