const AppError = require('../utils/appError');

// CSRF guard — Docs/Architecture.md §3.2
// State-changing requests (POST/PUT/PATCH/DELETE) must carry the
// X-Requested-With: XMLHttpRequest header. The browser sets it automatically
// for axios-based clients; it's not auto-added by HTML forms, so its presence
// proves the request originated from the SPA (which sends it explicitly per
// src/shared/lib/api-client.ts).
//
// Note: this is "double-submit-style" custom-header protection — appropriate
// because we control both sides (Vite SPA + Express API). Browsers do not
// allow cross-origin scripts to set arbitrary headers without a successful
// preflight, so the header's presence rules out the simple-CSRF case.
const STATE_CHANGING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

module.exports = function csrf(req, res, next) {
  if (!STATE_CHANGING.has(req.method)) return next();

  const header = req.headers['x-requested-with'];
  if (header === 'XMLHttpRequest') return next();

  return next(
    new AppError({
      code: 'AUTH',
      error: 'errors.csrfDetected',
      statusCode: 403,
    })
  );
};