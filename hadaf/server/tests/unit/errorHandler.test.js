import { describe, it, expect, vi } from 'vitest';
import errorHandler from '../../utils/errorHandler.js';
import AppError from '../../utils/appError.js';

// Minimal res/req mock — only what errorHandler touches.
function mockRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('errorHandler', () => {
  it('emits the documented contract for a structured AppError', () => {
    const err = new AppError({
      code: 'VALIDATION',
      error: 'auth.errors.emailExists',
      field: 'email',
      statusCode: 400,
    });
    const res = mockRes();
    errorHandler(err, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'auth.errors.emailExists',
      errorCode: 'VALIDATION',
      field: 'email',
    });
  });

  it('classifies Mongoose CastError as VALIDATION with field', () => {
    const err = Object.assign(new Error('Cast to ObjectId failed'), {
      name: 'CastError',
      path: 'userId',
      value: 'not-an-objectid',
    });
    const res = mockRes();
    errorHandler(err, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'errors.validationFailed',
      errorCode: 'VALIDATION',
      field: 'userId',
    });
  });

  it('classifies duplicate-key (11000) on email as auth.errors.emailExists', () => {
    const err = Object.assign(new Error('duplicate'), {
      code: 11000,
      keyValue: { email: 'x@y.com' },
    });
    const res = mockRes();
    errorHandler(err, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'auth.errors.emailExists',
      errorCode: 'VALIDATION',
      field: 'email',
    });
  });

  it('classifies JsonWebTokenError as AUTH tokenInvalid', () => {
    const err = Object.assign(new Error('invalid token'), {
      name: 'JsonWebTokenError',
    });
    const res = mockRes();
    errorHandler(err, {}, res, () => {});
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'auth.errors.tokenInvalid',
      errorCode: 'AUTH',
    });
  });

  it('classifies TokenExpiredError as AUTH tokenExpired', () => {
    const err = Object.assign(new Error('jwt expired'), {
      name: 'TokenExpiredError',
    });
    const res = mockRes();
    errorHandler(err, {}, res, () => {});
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'auth.errors.tokenExpired',
      errorCode: 'AUTH',
    });
  });

  it('redacts unknown errors to UNKNOWN internalServer (no leak)', () => {
    const err = new Error('connection refused on internal host x.y.z');
    const res = mockRes();
    errorHandler(err, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'errors.internalServer',
      errorCode: 'UNKNOWN',
    });
  });
});