const express = require("express");
const { chat } = require("../controllers/chatController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.post("/", authenticateToken, chat);

module.exports = router;
