const express = require("express");
const { login, register, getUsers, getPublicUsers, getPendingUsers, updateUserStatus, deleteUser, updateUser, cleanupDuplicates } = require("../controllers/authController");
const { authenticateToken, requireAdmin, requireMedicalStaff } = require("../middleware/auth");

const router = express.Router();

const getUpload = (req, res, next) => { req.upload = req.app.get("upload"); next(); };

// Public
router.post("/login", login);
router.post("/register", getUpload, (req, res, next) => {
  req.app.get("upload").fields([
    { name: "photo", maxCount: 1 },
    { name: "certificate", maxCount: 1 },
  ])(req, res, next);
}, register);

// Public listing for doctors/nurses (used by patient booking UI)
router.get("/public-users", getPublicUsers);

// Medical staff — fetch active users (for nurse patient selector etc.)
router.get("/users", authenticateToken, requireMedicalStaff, getUsers);

// Admin only
router.delete("/cleanup-duplicates", cleanupDuplicates);
router.get("/pending", authenticateToken, requireAdmin, getPendingUsers);
router.put("/:userId/status", authenticateToken, requireAdmin, updateUserStatus);
router.put("/:userId", authenticateToken, requireAdmin, updateUser);
router.delete("/:userId", authenticateToken, requireAdmin, deleteUser);
router.post("/register/admin", authenticateToken, requireAdmin, getUpload, (req, res, next) => {
  req.app.get("upload").fields([
    { name: "photo", maxCount: 1 },
    { name: "certificate", maxCount: 1 },
  ])(req, res, next);
}, register);

module.exports = router;
