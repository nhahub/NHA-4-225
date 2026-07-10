import { describe, it, expect } from 'vitest';
import csrf from '../../middleware/csrf.js';

function mockReq(method, header) {
  return {
    method,
    headers: header ? { 'x-requested-with': header } : {},
  };
}

describe('csrf middleware', () => {
  it('passes GETs through without inspecting the header', () => {
    let called = false;
    csrf(mockReq('GET', undefined), {}, () => {
      called = true;
    });
    expect(called).toBe(true);
  });

  it('rejects POST without X-Requested-With', () => {
    let nextErr;
    csrf(mockReq('POST', undefined), {}, (err) => {
      nextErr = err;
    });
    expect(nextErr).toBeTruthy();
    expect(nextErr.statusCode).toBe(403);
    expect(nextErr.errorKey).toBe('errors.csrfDetected');
    expect(nextErr.errorCode).toBe('AUTH');
  });

  it('rejects DELETE without X-Requested-With', () => {
    let nextErr;
    csrf(mockReq('DELETE', undefined), {}, (err) => {
      nextErr = err;
    });
    expect(nextErr).toBeTruthy();
    expect(nextErr.errorCode).toBe('AUTH');
  });

  it('passes POST with X-Requested-With: XMLHttpRequest', () => {
    let called = false;
    csrf(mockReq('POST', 'XMLHttpRequest'), {}, () => {
      called = true;
    });
    expect(called).toBe(true);
  });

  it('rejects POST with the wrong header value', () => {
    let nextErr;
    csrf(mockReq('POST', 'something-else'), {}, (err) => {
      nextErr = err;
    });
    expect(nextErr).toBeTruthy();
    expect(nextErr.errorCode).toBe('AUTH');
  });

  it('rejects PATCH without X-Requested-With', () => {
    let nextErr;
    csrf(mockReq('PATCH', undefined), {}, (err) => {
      nextErr = err;
    });
    expect(nextErr).toBeTruthy();
  });
});