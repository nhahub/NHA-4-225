// AppError — Express-facing glue living in utils/ per the grandfathered
// exception in Docs/AGENT-OPERATING-INSTRUCTIONS.md §5. Carries a
// structured payload so the global error handler can emit the documented
// {success: false, error, errorCode, field} contract from
// Docs/Architecture.md §3.3 without the handler having to know about HTTP.
//
// `error` is an i18n dictionary key (e.g. "auth.errors.emailExists") —
// the client translates it through its dictionaries before displaying.
class AppError extends Error {
  constructor({ code, error, statusCode, field } = {}) {
    super(error || 'errors.internalServer');
    this.statusCode = statusCode || 500;
    this.errorCode = code || 'UNKNOWN';
    this.errorKey = error || 'errors.internalServer';
    this.field = field;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;