const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env.local") });

const express = require("express");
const cookieParser = require("cookie-parser");
const connectdb = require("./config/db");
const errorHandler = require("./utils/errorHandler");
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

    const error = new Error("Not allowed by CORS");
    error.statusCode = 403;
    return callback(error);
  },
  credentials: true,
};

//middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/upload", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("API is running");
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
