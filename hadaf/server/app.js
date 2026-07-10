const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env.local") });

const express = require("express");
const cookieParser = require("cookie-parser");
const connectdb = require("./config/db");
const errorHandler = require("./utils/errorHandler");
const authRoutes = require("./routes/authRoutes");
const goalsRoutes = require("./routes/goalRoutes");
const milestonesRoutes = require("./routes/milestoneRoutes");
const csrf = require("./middleware/csrf");
const rateLimiter = require("./middleware/rate-limiter");
const AppError = require("./utils/appError");
const cors = require("cors");

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS || "").split(","),
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]
  .map((origin) => origin && origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Surface CORS rejections via AppError so the errorHandler classifies
    // them as AUTH (not a raw Error → 500 leak).
    return callback(
      new AppError({
        code: "AUTH",
        error: "errors.corsBlocked",
        statusCode: 403,
      })
    );
  },
  credentials: true,
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(rateLimiter);

// CSRF guard: state-changing requests must carry the X-Requested-With
// header (Architecture.md §3.2). Must run after CORS + cookie-parser and
// before route handlers.
app.use(csrf);

// Static uploads (placeholder; real uploads land in E1+).
app.use("/upload", express.static(path.join(__dirname, "uploads")));

// Health probe
app.get("/", (req, res) => {
  res.send("API is running");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/milestones", milestonesRoutes);

// 404 fallback — must precede the error handler so unknown routes return
// the documented contract shape, not Express's default HTML.
app.use((req, res, next) => {
  next(
    new AppError({
      code: "UNKNOWN",
      error: "errors.routeNotFound",
      statusCode: 404,
    })
  );
});

app.use(errorHandler);

const port = process.env.PORT || 5000;

const startServer = async () => {
  await connectdb();

  app.listen(port, () => {
    console.log(`server is running on ${port}`);
  });
};

startServer();
