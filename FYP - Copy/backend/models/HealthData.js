const mongoose = require("mongoose");

const healthDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  heartRate: {
    type: Number,
    required: true,
    min: 0,
    max: 300,
  },
  bloodPressure: {
    systolic: Number,
    diastolic: Number,
  },
  temperature: {
    type: Number,
    min: 35,
    max: 42,
  },
  bloodOxygen: {
    type: Number,
    min: 0,
    max: 100,
  },
  bloodGlucose: {
    type: Number,
    min: 0,
  },
  weight: {
    type: Number,
    min: 0,
  },
  respiratoryRate: {
    type: Number,
    min: 0,
  },
  steps: {
    type: Number,
    default: 0,
  },
  medication: String,
  notes: String,
  recordedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

healthDataSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("HealthData", healthDataSchema);
