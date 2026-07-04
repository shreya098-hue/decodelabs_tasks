const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

// Database Connection
const connectDB = require("./db/index");

// API Routes
const routes = require("./routes/index");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Security Middleware
app.use(helmet());

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://localhost:5000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy: Origin not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Logging
app.use(morgan("dev"));

// Body Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ============================================
// SERVE FRONTEND FILES
// ============================================
// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

// Serve index.html at root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ============================================
// API Routes
// ============================================
app.use("/api", routes);

// ============================================
// Health Check
// ============================================
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "🚀 AI Learn Platform API is running",
    version: "2.0.0",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// ============================================
// Global Error Handler
// ============================================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ============================================
// Start Server
// ============================================
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log("===================================");
      console.log(`🚀 Server Running on port ${PORT}`);
      console.log(`🌐 http://localhost:${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log("===================================");
    });
  } catch (error) {
    console.error("Server Failed:", error.message);
    process.exit(1);
  }
};

startServer();

// Graceful Shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Server Stopped");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Process Terminated");
  process.exit(0);
});