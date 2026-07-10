const jwt = require("jsonwebtoken");
const User = require("../models/User");

// JWT authorization check
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        errorCode: "AUTH",
        error: "errors.unauthenticated",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user and ensure user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        errorCode: "AUTH",
        error: "errors.userNotExist",
      });
    }

    // Grant access
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        errorCode: "AUTH",
        error: "errors.tokenExpired",
      });
    }
    return res.status(401).json({
      success: false,
      errorCode: "AUTH",
      error: "errors.unauthenticated",
    });
  }
};

// CSRF Mitigation (Custom Headers check)
exports.csrfGuard = (req, res, next) => {
  const isStateChanging = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
  if (isStateChanging && req.headers["x-requested-with"] !== "XMLHttpRequest") {
    return res.status(403).json({
      success: false,
      errorCode: "AUTH",
      error: "errors.csrfDetected",
    });
  }
  next();
};
