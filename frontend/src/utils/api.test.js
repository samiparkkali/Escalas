import { describe, expect, it } from 'vitest';
import { errorMessage, filenameFromDisposition, sessionCheckFailure } from './api';

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
