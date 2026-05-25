const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const User = require("./models/User");

async function cleanup() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected.\n");

    // Find all users
    const allUsers = await User.find({}).sort({ createdAt: 1 });
    console.log(`Total users in DB: ${allUsers.length}`);
    allUsers.forEach((u) => console.log(`  [${u.status}] ${u.name} | ${u.email} | ${u.role}`));

    // Group by name to find duplicates
    const byName = {};
    allUsers.forEach((u) => {
      const key = u.name.trim().toLowerCase();
      if (!byName[key]) byName[key] = [];
      byName[key].push(u);
    });

    const duplicates = Object.entries(byName).filter(([, arr]) => arr.length > 1);

    if (duplicates.length === 0) {
      console.log("\nNo duplicate names found.");
    } else {
      console.log(`\nFound ${duplicates.length} name(s) with duplicates:`);
      for (const [name, users] of duplicates) {
        console.log(`\n  "${name}" appears ${users.length} times:`);
        users.forEach((u) => console.log(`    - ${u.email} | ${u.role} | ${u.status} | created: ${u.createdAt}`));

        // Keep the first (earliest) one, delete the rest
        const toDelete = users.slice(1);
        for (const u of toDelete) {
          await User.findByIdAndDelete(u._id);
          console.log(`    DELETED: ${u.email}`);
        }
        console.log(`    KEPT: ${users[0].email}`);
      }
    }

    console.log("\nCleanup complete.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

cleanup();
