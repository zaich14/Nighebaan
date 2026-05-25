const express = require("express");
const { authenticateToken, requireMedicalStaff } = require("../middleware/auth");
const {
  getHealthData,
  createHealthData,
  getLatestHealthData,
  getHealthHistory,
  getPatientHealthData,
  getAllHealthRecords,
} = require("../controllers/healthController");

const router = express.Router();

router.use(authenticateToken);

router.get("/", getHealthData);
router.post("/", createHealthData);
router.get("/latest", getLatestHealthData);
router.get("/history", getHealthHistory);
router.get("/patient/:patientId", requireMedicalStaff, getPatientHealthData);
router.get("/all-records", requireMedicalStaff, getAllHealthRecords);

module.exports = router;
