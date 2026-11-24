import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import api, {
  errorMessage,
  filenameFromDisposition,
  getToken,
  onUnauthorized,
  sessionCheckFailure,
  setToken,
} from './api';

describe('errorMessage', () => {
  it('uses the backend detail string', () => {
    const error = { response: { status: 404, data: { detail: 'No schedule generated yet' } } };
    expect(errorMessage(error, 'Failed to export schedule')).toBe(
      'Failed to export schedule: No schedule generated yet',
    );
  });

  it('joins validation messages', () => {
    const error = {
      response: { status: 422, data: { detail: [{ msg: 'Value error, end_date must be on or after start_date' }] } },
    };
    expect(errorMessage(error, 'Failed to generate schedule')).toBe(
      'Failed to generate schedule: end_date must be on or after start_date',
    );
  });

  it('reports unreachable servers and bare statuses', () => {
    expect(errorMessage({ request: {} }, 'Failed')).toBe('Failed: the server could not be reached');
    expect(errorMessage({ response: { status: 500, data: '' } }, 'Failed')).toBe('Failed (HTTP 500)');
  });
});

describe('filenameFromDisposition', () => {
  it('reads the quoted filename', () => {
    expect(filenameFromDisposition('attachment; filename="escalas_2026-12-07_2026-12-20.csv"', 'x.csv')).toBe(
      'escalas_2026-12-07_2026-12-20.csv',
    );
    expect(filenameFromDisposition(undefined, 'x.csv')).toBe('x.csv');
  });
});

describe('sessionCheckFailure', () => {
  it('signs out only when the server rejects the token', () => {
    expect(sessionCheckFailure({ response: { status: 401 } })).toBe('signed-out');
    expect(sessionCheckFailure({ response: { status: 503 } })).toBe('retry');
    expect(sessionCheckFailure({ request: {} })).toBe('retry');
  });
});

describe('the 401 interceptor', () => {
  const respondWith = (status) => async (config) => {
    throw new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, {}, {
      status,
      statusText: '',
      data: {},
      headers: {},
      config,
    });
  };

  let listener;
  let unsubscribe;

  beforeEach(() => {
    const store = new Map();
    vi.stubGlobal('localStorage', {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key),
    });
    setToken('a-stored-token');
    listener = vi.fn();
    unsubscribe = onUnauthorized(listener);
  });

  afterEach(() => {
    unsubscribe();
    vi.unstubAllGlobals();
  });

  it('signs the user out when the server rejects the token', async () => {
    await expect(api.get('/api/professionals', { adapter: respondWith(401) })).rejects.toThrow();
    expect(getToken()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('keeps the session on a failed login or another error', async () => {
    await expect(api.post('/api/auth/login', {}, { adapter: respondWith(401) })).rejects.toThrow();
    await expect(api.get('/api/professionals', { adapter: respondWith(503) })).rejects.toThrow();
    expect(getToken()).toBe('a-stored-token');
    expect(listener).not.toHaveBeenCalled();
  });
});
