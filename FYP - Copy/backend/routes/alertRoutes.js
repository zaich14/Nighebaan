const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  getAlerts,
  createAlert,
  markAsRead,
  resolveAlert,
} = require("../controllers/alertController");

const router = express.Router();

// All alert routes require authentication
router.use(authenticateToken);

// Get alerts (all authenticated users can view alerts)
router.get("/", getAlerts);

// Create alerts: emergency alerts can be created by any authenticated user;
// non-emergency medical alerts require doctor/nurse/admin.
router.post("/", createAlert);

// Mark alert as read (all authenticated users)
router.put("/:alertId/read", markAsRead);

// Resolve alert (all authenticated users)
router.put("/:alertId/resolve", resolveAlert);

module.exports = router;
