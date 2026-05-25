const express = require("express");
const { login, register, getUsers, getPendingUsers, updateUserStatus, deleteUser, updateUser, cleanupDuplicates } = require("../controllers/authController");
const { authenticateToken, requireAdmin, requireMedicalStaff } = require("../middleware/auth");

const router = express.Router();

const getUpload = (req, res, next) => { req.upload = req.app.get("upload"); next(); };

// Public
router.post("/login", login);
router.post("/register", getUpload, (req, res, next) => {
  req.app.get("upload").single("photo")(req, res, next);
}, register);

// Medical staff — fetch active users (for nurse patient selector etc.)
router.get("/users", authenticateToken, requireMedicalStaff, getUsers);

// Admin only
router.delete("/cleanup-duplicates", cleanupDuplicates);
router.get("/pending", authenticateToken, requireAdmin, getPendingUsers);
router.put("/:userId/status", authenticateToken, requireAdmin, updateUserStatus);
router.put("/:userId", authenticateToken, requireAdmin, updateUser);
router.delete("/:userId", authenticateToken, requireAdmin, deleteUser);
router.post("/register/admin", authenticateToken, requireAdmin, getUpload, (req, res, next) => {
  req.app.get("upload").single("photo")(req, res, next);
}, register);

module.exports = router;
