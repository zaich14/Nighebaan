require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const HealthData = require("./models/HealthData");
const Alert = require("./models/Alert");

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/elderly-care", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✓ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await HealthData.deleteMany({});
    await Alert.deleteMany({});
    console.log("✓ Cleared existing data");

    // Create test users
    const users = await User.create([
      {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "user",
      },
      {
        name: "Fatima Ali",
        email: "fatima.ali@example.com",
        password: "patient123",
        role: "user",
      },
      {
        name: "Mohsin Riaz",
        email: "mohsin.riaz@example.com",
        password: "patient123",
        role: "user",
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "password123",
        role: "caregiver",
      },
      {
        name: "Ayesha Khan",
        email: "ayesha.khan@example.com",
        password: "caregiver123",
        role: "caregiver",
      },
      {
        name: "Dr. Ahmed Khan",
        email: "doctor@example.com",
        password: "doctor123",
        role: "doctor",
      },
      {
        name: "Dr. Sara Malik",
        email: "sara.malik@example.com",
        password: "doctor123",
        role: "doctor",
      },
      {
        name: "Nurse Sarah",
        email: "nurse@example.com",
        password: "nurse123",
        role: "nurse",
      },
      {
        name: "Nurse Aliya",
        email: "aliya.nurse@example.com",
        password: "nurse123",
        role: "nurse",
      },
      {
        name: "Admin User",
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
      },
    ]);

    console.log("✓ Created 10 test users");

    // Create health data
    const healthDataArray = [
      {
        userId: users[0]._id,
        heartRate: 72,
        bloodPressure: { systolic: 120, diastolic: 80 },
        temperature: 37.0,
        bloodOxygen: 98,
        steps: 8500,
      },
      {
        userId: users[0]._id,
        heartRate: 75,
        bloodPressure: { systolic: 122, diastolic: 82 },
        temperature: 37.1,
        bloodOxygen: 97,
        steps: 9200,
      },
      {
        userId: users[0]._id,
        heartRate: 68,
        bloodPressure: { systolic: 118, diastolic: 78 },
        temperature: 36.9,
        bloodOxygen: 99,
        steps: 7800,
      },
    ];

    await HealthData.create(healthDataArray);
    console.log("✓ Created 3 health data records");

    // Create alerts
    const alertsArray = [
      {
        userId: users[0]._id,
        message: "Check heart rate monitor battery",
        type: "health",
        severity: "low",
        isRead: false,
        createdBy: users[2]._id,
        createdByRole: "doctor",
      },
      {
        userId: users[0]._id,
        message: "Medication reminder: Take blood pressure medication",
        type: "medication",
        severity: "high",
        isRead: false,
        createdBy: users[3]._id,
        createdByRole: "nurse",
      },
      {
        userId: users[0]._id,
        message: "Upcoming appointment tomorrow at 10:00 AM with Dr. Smith",
        type: "appointment",
        severity: "medium",
        isRead: true,
        createdBy: users[2]._id,
        createdByRole: "doctor",
      },
      {
        userId: users[1]._id,
        message: "Emergency contact needed for patient John Doe",
        type: "emergency",
        severity: "critical",
        isRead: false,
        createdBy: users[4]._id,
        createdByRole: "admin",
      },
    ];

    await Alert.create(alertsArray);
    console.log("✓ Created 4 alert records");

    console.log("\n✓ Database seeded successfully!");
    console.log("\nTest credentials:");
    console.log("  Patient: john@example.com / password123");
    console.log("  Patient: fatima.ali@example.com / patient123");
    console.log("  Patient: mohsin.riaz@example.com / patient123");
    console.log("  Caregiver: jane@example.com / password123");
    console.log("  Caregiver: ayesha.khan@example.com / caregiver123");
    console.log("  Doctor: doctor@example.com / doctor123");
    console.log("  Doctor: sara.malik@example.com / doctor123");
    console.log("  Nurse: nurse@example.com / nurse123");
    console.log("  Nurse: aliya.nurse@example.com / nurse123");
    console.log("  Admin: admin@example.com / admin123");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("✗ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedDatabase();
