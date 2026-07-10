import { describe, it, expect } from 'vitest';
import AppError from '../../utils/appError.js';

describe('AppError', () => {
  it('accepts the structured {code, error, statusCode, field} shape', () => {
    const e = new AppError({
      code: 'AUTH',
      error: 'auth.errors.tokenInvalid',
      statusCode: 401,
      field: 'token',
    });
    expect(e.statusCode).toBe(401);
    expect(e.errorCode).toBe('AUTH');
    expect(e.errorKey).toBe('auth.errors.tokenInvalid');
    expect(e.field).toBe('token');
    expect(e.isOperational).toBe(true);
    expect(e).toBeInstanceOf(Error);
  });

  it('accepts an empty object with sensible defaults', () => {
    const e = new AppError({});
    expect(e.statusCode).toBe(500);
    expect(e.errorCode).toBe('UNKNOWN');
    expect(e.errorKey).toBe('errors.internalServer');
  });
});