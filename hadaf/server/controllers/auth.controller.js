const jwt = require("jsonwebtoken");
const { hashPassword } = require("../utils/password");
const crypto = require("crypto");
const { z } = require("zod");
const User = require("../models/User");
const AnalyticsEvent = require("../models/AnalyticsEvent");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Zod schemas for validation
const registerSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  name: z.string().min(1, "Name is required").optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  passwordConfirm: z.string()
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords do not match",
  path: ["passwordConfirm"],
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
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
const getCookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: true, // required for sameSite: "none"
  sameSite: "none",
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
    const firstError = validation.error.errors[0];
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

  // 3) Hash password and create user
  const passwordHash = await hashPassword(password);
  const newUser = await User.create({
    email,
    name,
    passwordHash,
  });

  // 4) Log analytics event
  await AnalyticsEvent.create({
    userId: newUser._id,
    eventType: "register",
    eventData: { email },
  });

  // 5) Issue tokens and login
  await sendTokens(newUser, res);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
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
    const firstError = validation.error.errors[0];
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

  // 3) Log login event
  await AnalyticsEvent.create({
    userId: user._id,
    eventType: "login",
  });

  // 4) Issue new tokens
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
