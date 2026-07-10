const AppError = require("./appError");

/**
 * Global Express Error Handler Middleware
 * Formats all exceptions into the standardized API contract.
 */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  // 1) Mongoose validation errors
  if (err.name === "ValidationError") {
    const field = Object.keys(err.errors)[0];
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: err.errors[field].message || "errors.validationFailed",
      field,
    });
  }

  // 2) MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: `auth.errors.${field}Exists`, // e.g., auth.errors.emailExists
      field,
    });
  }

  // 3) JWT validation exceptions
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      errorCode: "AUTH",
      error: "errors.unauthenticated",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      errorCode: "AUTH",
      error: "errors.tokenExpired",
    });
  }

  // 4) Custom operational errors (thrown via next(new AppError))
  if (err.isOperational) {
    // Map status code to appropriate errorCode
    let errorCode = "UNKNOWN";
    if (err.statusCode === 400) errorCode = "VALIDATION";
    else if (err.statusCode === 401 || err.statusCode === 403) errorCode = "AUTH";

    return res.status(err.statusCode).json({
      success: false,
      errorCode,
      error: err.message,
    });
  }

  // 5) Programming or other unknown exceptions
  console.error("ERROR 💥", err);
  return res.status(500).json({
    success: false,
    errorCode: "UNKNOWN",
    error: "errors.internalServer",
  });
};