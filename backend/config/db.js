const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/elderly-care";
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("✓ MongoDB connected successfully");
    return true;
  } catch (error) {
    console.error("✗ MongoDB connection failed:", error.message);
    return false;
  }
};

module.exports = connectDB;
