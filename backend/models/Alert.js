const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["health", "medication", "appointment", "emergency", "general"],
    default: "general",
  },
  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "low",
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  conditions: [{
    type: {
      type: String,
      enum: ["heartRate", "bloodPressure", "temperature", "bloodOxygen", "glucose", "activity", "medication"],
    },
    operator: {
      type: String,
      enum: ["gt", "lt", "eq", "gte", "lte"],
    },
    value: mongoose.Schema.Types.Mixed,
    description: String,
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdByRole: {
    type: String,
    enum: ["doctor", "nurse", "admin", "user", "caregiver"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: Date,
});

// Index for efficient querying
alertSchema.index({ userId: 1, createdAt: -1 });
alertSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model("Alert", alertSchema);
