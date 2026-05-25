const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    try {
      const user = await User.findById(decoded.userId).select("-password");
      if (user) {
        req.user = {
          userId: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
        return next();
      }
      // User not found in DB but token is valid — use JWT-encoded values (mock mode)
      if (decoded.role) {
        req.user = { userId: decoded.userId, role: decoded.role };
        return next();
      }
      return res.status(404).json({ message: "User not found" });
    } catch {
      // DB unavailable — fall back to JWT-encoded role
      if (decoded.role) {
        req.user = { userId: decoded.userId, role: decoded.role };
        return next();
      }
      return res.status(500).json({ message: "Server error during authentication" });
    }
  });
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }
    next();
  };
};

const requireAdmin = authorizeRoles("admin");
const requireMedicalStaff = authorizeRoles("doctor", "nurse", "admin");
const requireCaregiverOrHigher = authorizeRoles("caregiver", "doctor", "nurse", "admin");

module.exports = {
  authenticateToken,
  authorizeRoles,
  requireAdmin,
  requireMedicalStaff,
  requireCaregiverOrHigher,
};
