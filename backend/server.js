const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const healthRoutes = require("./routes/healthRoutes");
const alertRoutes = require("./routes/alertRoutes");
const planRoutes = require("./routes/planRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.set("io", io);
app.set("upload", upload);

// Middleware
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint (no auth required)
app.get("/api/health-check", (req, res) => {
  res.json({ status: "OK", message: "Backend is running" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/chat", chatRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Elderly Care System Backend API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth/login, /api/auth/register",
      health: "/api/health",
      alerts: "/api/alerts",
      healthCheck: "/api/health-check",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Remove duplicate users (same name) — keeps earliest, deletes rest
const removeDuplicateUsers = async () => {
  try {
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 1) return;
    const User = require("./models/User");
    const all = await User.find({}).sort({ createdAt: 1 }).lean();
    const seen = {};
    const toDelete = [];
    all.forEach((u) => {
      const key = u.name.trim().toLowerCase();
      if (seen[key]) { toDelete.push(u._id); }
      else { seen[key] = true; }
    });
    if (toDelete.length > 0) {
      await User.deleteMany({ _id: { $in: toDelete } });
      console.log(`✓ Removed ${toDelete.length} duplicate user(s) from database`);
    }
  } catch (e) {
    console.log("⚠️  Could not run duplicate cleanup:", e.message);
  }
};

// Connect to database and start server
const startServer = async () => {
  const dbConnected = await connectDB();

  if (dbConnected || process.env.NODE_ENV === "development") {
      if (dbConnected) await removeDuplicateUsers();

      const tryListen = (port, attemptsLeft = 5) => {
        // Remove previous error listeners to avoid duplicate handling
        server.removeAllListeners('error');

        server.listen(port, () => {
          console.log(`\n✓ Server is running on http://localhost:${port}`);
          console.log(`✓ API base URL: http://localhost:${port}/api`);
          console.log(`✓ Health check: http://localhost:${port}/api/health-check`);
          console.log(`✓ Socket.IO is running`);
          if (!dbConnected) {
            console.log(`⚠️  MongoDB not connected - using mock data mode`);
          }
          console.log('\n');
        });

        server.once('error', (err) => {
          if (err && err.code === 'EADDRINUSE') {
            console.warn(`Port ${port} is already in use.`);
            if (attemptsLeft > 0) {
              const nextPort = Number(port) + 1;
              console.log(`Trying port ${nextPort}... (${attemptsLeft} attempts left)`);
              setTimeout(() => tryListen(nextPort, attemptsLeft - 1), 300);
            } else {
              console.error('All retry attempts failed. Exiting.');
              process.exit(1);
            }
          } else {
            console.error('Server error:', err);
            process.exit(1);
          }
        });
      };

      tryListen(PORT);
  } else {
    console.error("Failed to connect to database. Server not started.");
    process.exit(1);
  }
};

startServer();

module.exports = app;
