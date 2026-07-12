const jwt = require("jsonwebtoken");
const { hashPassword } = require("../utils/password");
const crypto = require("crypto");
const zod = require("zod");
const z = zod.z || zod;
const User = require("../models/User");
const AnalyticsEvent = require("../models/AnalyticsEvent");
const Email = require("../utils/sendEmail");
const catchAsync = require("../utils/catchAsync");

// Zod schemas for validation
const registerSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  name: z.string().min(1, "Name is required").optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
});

const exchangeResetTokenSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

// Helper to sign JWT access token
const signAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

// Helper to generate a secure random refresh token
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString("hex");
};

// Hash helper to hash token
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Cookie options helper
// The app and API are served same-origin (dev: Vite proxies /api → Express;
// prod: one origin behind a reverse proxy / static-serve). So `sameSite: "lax"`
// works everywhere and cross-site `"none"` is unnecessary. `secure` must be off
// in dev (plain HTTP localhost drops Secure cookies) and on in prod (HTTPS).
const isProd = process.env.NODE_ENV === "production";
const getCookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  maxAge: maxAgeMs,
});

// Helper to set tokens in response cookies
const sendTokens = async (user, res) => {
  const accessToken = signAccessToken(user._id);
  const rawRefreshToken = generateRefreshToken();
  const hashedRefreshToken = hashToken(rawRefreshToken);

  // Store hashed refresh token and expiry (7 days)
  user.refreshToken = hashedRefreshToken;
  user.refreshTokenExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await user.save();

  // Set cookies
  res.cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000));
  res.cookie("refreshToken", rawRefreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

  return { accessToken, rawRefreshToken };
};

// Register
exports.register = catchAsync(async (req, res, next) => {
  // 1) Validate with Zod
  const validation = registerSchema.safeParse(req.body);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: firstError.message,
      field: firstError.path[0],
    });
  }

  const { email, name, password } = validation.data;

  // 2) Check if email exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: "auth.errors.emailExists",
      field: "email",
    });
  }

  // 3) Hash password, generate verifyToken, and create user
  const passwordHash = await hashPassword(password);
  const verifyToken = crypto.randomBytes(32).toString("hex");

  const newUser = await User.create({
    email,
    name,
    passwordHash,
    verifyToken,
    isVerified: true,
  });

  // 4) Log analytics event
  await AnalyticsEvent.create({
    userId: newUser._id,
    eventType: "register",
    eventData: { email },
  });

  // // 5) Send verification email asynchronously
  // const verifyURL = `${req.protocol}://${req.get("host")}/api/auth/verify/${verifyToken}`;
  // new Email(newUser, verifyURL)
  //   .sendVerificationEmail()
  //   .then(() => {
  //     console.log("Verification email sent successfully");
  //   })
  //   .catch((err) => {
  //     console.error("Error sending verification email:", err);
  //   });

  // 6) Issue tokens so the client can treat registration as an immediate
  // login (matches the frontend's onRegister, which never calls /login).
  const { accessToken } = await sendTokens(newUser, res);

  res.status(201).json({
    success: true,
    data: {
      accessToken,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        isVerified: newUser.isVerified,
        onboardingCompleted: newUser.onboardingCompleted,
        settings: newUser.settings,
      },
    },
  });
});

// Login
exports.login = catchAsync(async (req, res, next) => {
  // 1) Validate with Zod
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: firstError.message,
      field: firstError.path[0],
    });
  }

  const { email, password } = validation.data;

  // 2) Find user and verify password
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      errorCode: "AUTH",
      error: "auth.errors.invalidCredentials",
    });
  }

  // 3) Email verification is bypassed for MVP (register sets isVerified: true
  // and verification emails are disabled). Gating login on it only locks out
  // accounts created before the bypass. Re-enable together with the
  // verification email flow post-MVP.
  // if (!user.isVerified) {
  //   return res.status(401).json({
  //     success: false,
  //     errorCode: "AUTH",
  //     error: "auth.errors.pleaseVerifyEmail",
  //   });
  // }

  // 4) Log login event
  await AnalyticsEvent.create({
    userId: user._id,
    eventType: "login",
  });

  // 5) Issue new tokens
  const { accessToken } = await sendTokens(user, res);

  res.status(200).json({
    success: true,
    data: {
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        onboardingCompleted: user.onboardingCompleted,
        settings: user.settings,
      },
    },
  });
});

// Verify email
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  const user = await User.findOneAndUpdate(
    { verifyToken: token },
    { isVerified: true, verifyToken: null },
    { new: true }
  );

  if (!user) {
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: "auth.errors.invalidOrExpiredVerificationToken",
    });
  }

  // Redirect to frontend success page
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  res.redirect(`${frontendUrl}/verify-success`);
});

// Logout
exports.logout = catchAsync(async (req, res, next) => {
  const rawRefreshToken = req.cookies.refreshToken;

  if (rawRefreshToken) {
    const hashedRefreshToken = hashToken(rawRefreshToken);
    // Remove the refresh token from user record
    await User.updateOne(
      { refreshToken: hashedRefreshToken },
      { $unset: { refreshToken: "", refreshTokenExp: "" } }
    );
  }

  // Clear cookies
  res.clearCookie("accessToken", getCookieOptions(0));
  res.clearCookie("refreshToken", getCookieOptions(0));

  res.status(200).json({
    success: true,
    data: null,
  });
});

// Refresh token rotation
exports.refreshToken = catchAsync(async (req, res, next) => {
  const rawRefreshToken = req.cookies.refreshToken;

  if (!rawRefreshToken) {
    return res.status(401).json({
      success: false,
      errorCode: "AUTH",
      error: "auth.errors.noRefreshToken",
    });
  }

  const hashedRefreshToken = hashToken(rawRefreshToken);

  // Find user by current refresh token
  const user = await User.findOne({
    refreshToken: hashedRefreshToken,
    refreshTokenExp: { $gt: new Date() },
  });

  if (!user) {
    // Attempted reuse or invalid token: clear all cookies
    res.clearCookie("accessToken", getCookieOptions(0));
    res.clearCookie("refreshToken", getCookieOptions(0));
    return res.status(401).json({
      success: false,
      errorCode: "AUTH",
      error: "auth.errors.invalidRefreshToken",
    });
  }

  // Rotate to a new pair of tokens
  const { accessToken } = await sendTokens(user, res);

  res.status(200).json({
    success: true,
    data: {
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        onboardingCompleted: user.onboardingCompleted,
        settings: user.settings,
      },
    },
  });
});

// Forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Validate input with Zod
  const validation = forgotPasswordSchema.safeParse(req.body);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: firstError.message,
      field: firstError.path[0],
    });
  }

  const { email } = validation.data;

  // 2) Find user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      errorCode: "VALIDATION",
      error: "auth.errors.noUserWithEmail",
    });
  }

  // 3) Create password reset token
  const resetToken = user.createPasswordResetToken();
  await user.save();

  // 4) Send email
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const resetURL = `${frontendUrl}/reset-token/${resetToken}`;

  try {
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      success: true,
      data: null,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(500).json({
      success: false,
      errorCode: "UNKNOWN",
      error: "auth.errors.emailSendError",
    });
  }
});

// Exchange reset token for a cookie-based reset session
exports.exchangeResetToken = catchAsync(async (req, res, next) => {
  // 1) Validate with Zod
  const validation = exchangeResetTokenSchema.safeParse(req.body);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: firstError.message,
      field: firstError.path[0],
    });
  }

  const { token } = validation.data;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // 2) Find user with valid reset token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: "auth.errors.invalidOrExpiredResetToken",
    });
  }

  // 3) Set HttpOnly cookie with the token
  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
  };

  res.cookie("resetToken", token, cookieOptions);

  res.status(200).json({
    success: true,
    data: null,
  });
});

// Reset Password using the cookie-based token
exports.resetPassword = catchAsync(async (req, res, next) => {
  const token = req.cookies.resetToken;
  if (!token) {
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: "auth.errors.resetTokenRequired",
    });
  }

  // 1) Validate body with Zod
  const validation = resetPasswordSchema.safeParse(req.body);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: firstError.message,
      field: firstError.path[0],
    });
  }

  const { password } = validation.data;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // 2) Find user
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: "auth.errors.invalidOrExpiredResetToken",
    });
  }

  // 3) Hash and update password, clear reset fields
  user.passwordHash = await hashPassword(password);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 4) Clear the reset token cookie
  res.cookie("resetToken", "", {
    expires: new Date(Date.now() - 10 * 1000),
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
  });

  // 5) Log in user and send tokens
  await sendTokens(user, res);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        onboardingCompleted: user.onboardingCompleted,
        settings: user.settings,
      },
    },
  });
});

// Update password (protected route, requires auth)
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Validate with Zod
  const validation = updatePasswordSchema.safeParse(req.body);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION",
      error: firstError.message,
      field: firstError.path[0],
    });
  }

  const { currentPassword, newPassword } = validation.data;

  // 2) Check if current password is correct
  const user = await User.findById(req.user.id);
  if (!user || !(await user.comparePassword(currentPassword))) {
    return res.status(401).json({
      success: false,
      errorCode: "AUTH",
      error: "auth.errors.incorrectCurrentPassword",
    });
  }

  // 3) Hash and save new password
  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  // 4) Send new access and refresh tokens
  await sendTokens(user, res);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        onboardingCompleted: user.onboardingCompleted,
        settings: user.settings,
      },
    },
  });
});
