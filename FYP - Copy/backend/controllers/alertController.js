const Alert = require("../models/Alert");
const mongoose = require("mongoose");

// Mock alerts for testing
const mockAlerts = [
  {
    _id: "mock-alert-1",
    userId: "mock-user-1",
    message: "Check heart rate monitor battery",
    type: "health",
    severity: "low",
    isRead: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    _id: "mock-alert-2",
    userId: "mock-user-1",
    message: "Medication reminder: Take blood pressure medication",
    type: "medication",
    severity: "high",
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    _id: "mock-alert-3",
    userId: "mock-user-1",
    message: "Upcoming appointment tomorrow at 10:00 AM with Dr. Smith",
    type: "appointment",
    severity: "medium",
    isRead: true,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
  },
];

const getAlerts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 50, skip = 0, unreadOnly = false } = req.query;

    let alerts = [];
    try {
      const filter = { userId };
      if (unreadOnly === "true") {
        filter.isRead = false;
      }

      alerts = await Alert.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

      if (alerts.length === 0) {
        // If no data in DB, use mock data
        alerts = mockAlerts.filter(a => a.userId === userId);
        if (unreadOnly === "true") {
          alerts = alerts.filter(a => !a.isRead);
        }
      }
    } catch (dbError) {
      console.log("Database not available, using mock alerts");
      alerts = mockAlerts.filter(a => a.userId === userId);
      if (unreadOnly === "true") {
        alerts = alerts.filter(a => !a.isRead);
      }
    }

    const total = alerts.length;

    res.json({
      data: alerts.slice(skip, skip + parseInt(limit)),
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createAlert = async (req, res) => {
  try {
    const { message, type = "health", severity = "medium", conditions = [] } = req.body;
    const alertUserId = req.body.userId || req.body.targetUserId || req.user.userId;
    const userRole = req.user.role;
    const isEmergency = type === "emergency";

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (!isEmergency && !['doctor', 'nurse', 'admin'].includes(userRole)) {
      return res.status(403).json({
        message: "Only medical staff (doctors, nurses) or administrators can create medical alerts"
      });
    }

    if (isEmergency && !mongoose.Types.ObjectId.isValid(alertUserId)) {
      const mockEmergencyAlert = {
        _id: `mock-emergency-${Date.now()}`,
        userId: alertUserId,
        message,
        type,
        severity,
        isRead: false,
        conditions: [],
        createdBy: req.user.userId,
        createdByRole: userRole,
        createdAt: new Date(),
      };

      const io = req.app.get("io");
      if (io) io.emit("newAlert", mockEmergencyAlert);

      return res.status(201).json({
        ...mockEmergencyAlert,
        savedToDatabase: false,
        note: "Emergency alert accepted for mock user session.",
      });
    }

    let validatedConditions = { allMet: true, unmet: [] };
    if (!isEmergency) {
      if (!conditions || conditions.length === 0) {
        return res.status(400).json({
          message: "Alert conditions must be specified and met before creating an alert"
        });
      }

      validatedConditions = await validateAlertConditions(conditions, alertUserId);

      if (!validatedConditions.allMet) {
        const onlyMissingData = validatedConditions.unmet.length > 0 && validatedConditions.unmet.every((issue) =>
          issue.toLowerCase().includes('no health data')
        );

        if (!onlyMissingData) {
          return res.status(400).json({
            message: "Alert conditions not met. Cannot create alert.",
            unmetConditions: validatedConditions.unmet
          });
        }
      }
    }

    const newAlert = new Alert({
      userId: alertUserId,
      message,
      type,
      severity,
      conditions: isEmergency ? [] : conditions,
      createdBy: req.user.userId,
      createdByRole: userRole
    });

    await newAlert.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("newAlert", newAlert);
    }

    res.status(201).json({
      ...newAlert.toObject(),
      conditionsMet: validatedConditions.allMet
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user.userId;

    const alert = await Alert.findOneAndUpdate(
      { _id: alertId, userId },
      { isRead: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const resolveAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user.userId;

    const alert = await Alert.findOneAndUpdate(
      { _id: alertId, userId },
      { isRead: true, resolvedAt: new Date() },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Validate alert conditions against current health data
const validateAlertConditions = async (conditions, userId) => {
  const HealthData = require("../models/HealthData");

  try {
    // Get the latest health data for the user
    const latestHealthData = await HealthData.findOne({ userId }).sort({ createdAt: -1 });

    if (!latestHealthData) {
      return {
        allMet: false,
        unmet: ["No health data available for validation"]
      };
    }

    const unmet = [];

    for (const condition of conditions) {
      const { type, operator, value } = condition;
      let currentValue;

      // Map condition type to health data field
      switch (type) {
        case "heartRate":
          currentValue = latestHealthData.heartRate;
          break;
        case "bloodPressure":
          currentValue = latestHealthData.bloodPressure?.systolic;
          break;
        case "temperature":
          currentValue = latestHealthData.temperature;
          break;
        case "bloodOxygen":
          currentValue = latestHealthData.bloodOxygen;
          break;
        case "glucose":
          currentValue = latestHealthData.glucose;
          break;
        default:
          unmet.push(`Unknown condition type: ${type}`);
          continue;
      }

      if (currentValue === undefined || currentValue === null) {
        unmet.push(`No ${type} data available`);
        continue;
      }

      // Check condition based on operator
      let conditionMet = false;
      switch (operator) {
        case "gt":
          conditionMet = currentValue > value;
          break;
        case "lt":
          conditionMet = currentValue < value;
          break;
        case "eq":
          conditionMet = currentValue === value;
          break;
        case "gte":
          conditionMet = currentValue >= value;
          break;
        case "lte":
          conditionMet = currentValue <= value;
          break;
        default:
          unmet.push(`Unknown operator: ${operator}`);
          continue;
      }

      if (!conditionMet) {
        unmet.push(`${type} ${operator} ${value} (current: ${currentValue})`);
      }
    }

    return {
      allMet: unmet.length === 0,
      unmet
    };
  } catch (error) {
    console.error("Error validating alert conditions:", error);
    return {
      allMet: false,
      unmet: ["Error validating conditions"]
    };
  }
};

module.exports = {
  getAlerts,
  createAlert,
  markAsRead,
  resolveAlert,
};
