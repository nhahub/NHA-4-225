const AppError = require("./appError");

const handleCastErrorDB = (err) =>
  new AppError({
    code: "VALIDATION",
    error: "errors.validationFailed",
    statusCode: 400,
    field: err.path,
  });

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError({
    code: "VALIDATION",
    error: `auth.errors.${field}Exists`,
    statusCode: 400,
    field,
  });
};

const handleValidationErrorDB = (err) => {
  const field = Object.keys(err.errors)[0];
  return new AppError({
    code: "VALIDATION",
    error: err.errors[field].message || "errors.validationFailed",
    statusCode: 400,
    field,
  });
};

const handleJWTError = () =>
  new AppError({ code: "AUTH", error: "auth.errors.tokenInvalid", statusCode: 401 });

const handleJWTExpiredError = () =>
  new AppError({ code: "AUTH", error: "auth.errors.tokenExpired", statusCode: 401 });

/**
 * Global Express Error Handler Middleware
 * Formats all exceptions into the standardized API contract.
 */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  let error = err;
  if (error.name === "CastError") error = handleCastErrorDB(error);
  else if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  else if (error.name === "ValidationError") error = handleValidationErrorDB(error);
  else if (error.name === "JsonWebTokenError") error = handleJWTError();
  else if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

  if (error.isOperational) {
    return res.status(error.statusCode).json({
      success: false,
      errorCode: error.errorCode || "UNKNOWN",
      error: error.errorKey || error.message,
      ...(error.field ? { field: error.field } : {}),
    });
  }

  // Programming or other unknown exceptions — don't leak details
  console.error("ERROR 💥", err);
  return res.status(500).json({
    success: false,
    errorCode: "UNKNOWN",
    error: "errors.internalServer",
  });
};
