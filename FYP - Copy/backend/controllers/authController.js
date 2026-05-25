const mongoose = require("mongoose");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (userId, role = "user") => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const allowedAdminEmails = (process.env.ADMIN_EMAILS || "admin@example.com,superadmin@example.com")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

const activeOrLegacyStatus = {
  $or: [
    { status: "active" },
    { status: { $exists: false } },
    { status: null },
  ],
};

const uploadedFile = (req, field) => req.files?.[field]?.[0] || null;

const cleanupUploads = (req) => {
  const fs = require("fs");
  Object.values(req.files || {}).flat().forEach((file) => {
    if (file?.path) fs.unlink(file.path, () => {});
  });
  if (req.file?.path) fs.unlink(req.file.path, () => {});
};

const requiredByRole = {
  user: ["name", "email", "password", "dob", "gender", "patientId", "address", "emergencyContact", "primaryDoctor", "phone"],
  caregiver: ["name", "email", "password", "phone", "address"],
  doctor: ["name", "email", "password", "dob", "gender", "designation", "hospital", "specialization", "experience", "workplaceHistory", "phone", "license"],
  nurse: ["name", "email", "password", "dob", "gender", "hospital", "department", "experience", "workplaceHistory", "phone", "license"],
  admin: ["name", "email", "password", "dob", "gender", "adminId", "organization", "phone", "roleDescription"],
};

// ── Active mock users (can log in) ───────────────────────────────────────────
const mockUsers = [
  { _id:"mock-user-1",  name:"Amna Javed",     email:"amna.javed@example.com",    password:"patient123", role:"user",      status:"active", age:78, gender:"Female", bloodType:"B+",  conditions:["Type 2 Diabetes","Hypertension","Arthritis"],               allergies:["Penicillin"],    createdAt:new Date("2024-01-10") },
  { _id:"mock-user-2",  name:"Abdul Rehman",   email:"abdul.rehman@example.com",  password:"patient123", role:"user",      status:"active", age:72, gender:"Male",   bloodType:"O+",  conditions:["Ischemic Heart Disease","Hyperlipidemia"],                  allergies:["Sulfa drugs"],   createdAt:new Date("2024-02-05") },
  { _id:"mock-user-3",  name:"Fatima Malik",   email:"fatima.malik@example.com",  password:"patient123", role:"user",      status:"active", age:65, gender:"Female", bloodType:"A+",  conditions:["Osteoporosis","Mild Hypertension"],                         allergies:[],                createdAt:new Date("2024-03-12") },
  { _id:"mock-user-4",  name:"Mohsin Riaz",    email:"mohsin.riaz@example.com",   password:"patient123", role:"user",      status:"active", age:70, gender:"Male",   bloodType:"AB+", conditions:["COPD","Type 2 Diabetes"],                                  allergies:["NSAIDs"],        createdAt:new Date("2024-01-20") },
  { _id:"mock-user-5",  name:"Nadia Hassan",   email:"nadia.hassan@example.com",  password:"patient123", role:"user",      status:"active", age:68, gender:"Female", bloodType:"B-",  conditions:["Congestive Heart Failure","Atrial Fibrillation"],           allergies:["Aspirin"],       createdAt:new Date("2024-02-18") },
  { _id:"mock-user-6",  name:"Tariq Mahmood",  email:"tariq.mahmood@example.com", password:"patient123", role:"user",      status:"active", age:74, gender:"Male",   bloodType:"O-",  conditions:["Parkinson's Disease","Hypertension"],                       allergies:[],                createdAt:new Date("2024-04-01") },
  { _id:"mock-user-7",  name:"Ayesha Khan",    email:"ayesha.khan@example.com",   password:"caregiver123",role:"caregiver",status:"active", createdAt:new Date("2024-01-15") },
  { _id:"mock-user-8",  name:"Bilal Siddiqui", email:"bilal.siddiqui@example.com",password:"caregiver123",role:"caregiver",status:"active", createdAt:new Date("2024-02-10") },
  { _id:"mock-user-9",  name:"Dr. Ahmed Khan", email:"doctor@example.com",        password:"doctor123",  role:"doctor",   status:"active", createdAt:new Date("2023-11-01") },
  { _id:"mock-user-10", name:"Dr. Sara Malik", email:"sara.malik@example.com",    password:"doctor123",  role:"doctor",   status:"active", createdAt:new Date("2023-12-01") },
  { _id:"mock-user-11", name:"Nurse Sarah",    email:"nurse@example.com",         password:"nurse123",   role:"nurse",    status:"active", createdAt:new Date("2024-01-05") },
  { _id:"mock-user-12", name:"Nurse Aliya",    email:"aliya.nurse@example.com",   password:"nurse123",   role:"nurse",    status:"active", createdAt:new Date("2024-01-05") },
  { _id:"mock-user-13", name:"Admin User",     email:"admin@example.com",         password:"admin123",   role:"admin",    status:"active", createdAt:new Date("2023-10-01") },
];

// ── Pending registrations (awaiting admin approval) ───────────────────────────
const mockPendingUsers = [];

// ─────────────────────────────────────────────────────────────────────────────

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    // Always check mock users first — works regardless of DB state
    const mockActive  = mockUsers.find((u) => u.email === email && u.password === password);
    const mockPending = mockPendingUsers.find((u) => u.email === email);

    if (mockActive) {
      const token = generateToken(mockActive._id, mockActive.role);
      return res.json({
        token,
        user: { id: mockActive._id, name: mockActive.name, email: mockActive.email, role: mockActive.role },
      });
    }

    if (mockPending) {
      if (mockPending.password !== password)
        return res.status(401).json({ message: "Invalid email or password" });
      if (mockPending.status === "pending")
        return res.status(403).json({ message: "pending_approval", name: mockPending.name });
      if (mockPending.status === "rejected")
        return res.status(403).json({ message: "rejected" });
    }

    // Not a mock user — check DB
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: "Invalid email or password" });
      if (!(await user.matchPassword(password)))
        return res.status(401).json({ message: "Invalid email or password" });
      if (user.status === "pending")
        return res.status(403).json({ message: "pending_approval", name: user.name });
      if (user.status === "rejected")
        return res.status(403).json({ message: "rejected" });

      const token = generateToken(user._id, user.role);
      return res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { name, fullName, email, password, role, ...profileData } = req.body;
    const userName = name || fullName || profileData.fullName;

    if (!userName || !email || !password) {
      cleanupUploads(req);
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    let assignedRole = "user";
    const normalizedRole = role === "patient" ? "user" : role;
    const allowedPublicRoles = ["user", "caregiver", "doctor", "nurse"];
    if (normalizedRole && allowedPublicRoles.includes(normalizedRole)) assignedRole = normalizedRole;

    // Admin registration logic
    if (normalizedRole === "admin") {
      const isAllowed = allowedAdminEmails.includes(email.toLowerCase());
      const adminExists =
        mongoose.connection.readyState === 1
          ? await User.exists({ role: "admin" })
          : mockUsers.some((u) => u.role === "admin");
      if (req.user?.role === "admin") {
        assignedRole = "admin";
      } else if (!adminExists && isAllowed) {
        assignedRole = "admin";
      } else {
        cleanupUploads(req);
        return res.status(403).json({ message: "Cannot assign administrator role without administrator privileges" });
      }
    }

    const isAdmin = assignedRole === "admin";
    const photoPath = uploadedFile(req, "photo")?.path || req.file?.path || null;
    const certificatePath = uploadedFile(req, "certificate")?.path || null;
    const requiredFields = requiredByRole[assignedRole] || requiredByRole.user;
    const fieldValues = { name: userName, email, password, ...profileData };
    const missingFields = requiredFields.filter((field) => !String(fieldValues[field] || "").trim());
    if ((assignedRole === "doctor" || assignedRole === "nurse") && !certificatePath) {
      missingFields.push("certificate");
    }
    if (missingFields.length > 0) {
      cleanupUploads(req);
      return res.status(400).json({
        message: `Please complete required registration fields: ${missingFields.join(", ")}`,
      });
    }

    // Reject mock emails — they are pre-seeded demo accounts
    const mockConflict = [...mockUsers, ...mockPendingUsers].find(
      (u) => u.email === email.toLowerCase()
    );
    if (mockConflict) {
      cleanupUploads(req);
      return res.status(400).json({ message: "User already exists" });
    }

    // ── Database path ──
    if (mongoose.connection.readyState === 1) {
      const existing = await User.findOne({ email });
      if (existing) {
        cleanupUploads(req);
        return res.status(400).json({ message: "User already exists" });
      }
      const newUser = new User({
        name: userName, email, password, role: assignedRole,
        status: isAdmin ? "active" : "pending",
        photo: photoPath,
        certificate: certificatePath,
        ...profileData,
      });
      await newUser.save();
      if (isAdmin) {
        const token = generateToken(newUser._id, newUser.role);
        return res.status(201).json({
          token,
          user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
        });
      }
      return res.status(201).json({ message: "pending_approval", name: newUser.name });
    }

    cleanupUploads(req);
    return res.status(503).json({
      message: "Database is not connected. Registration was not saved. Please try again after the backend reconnects to MongoDB Atlas.",
    });
  } catch (error) {
    cleanupUploads(req);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = { ...activeOrLegacyStatus };

    if (role) {
      if (role === "patient") query.role = { $in: ["user", "caregiver"] };
      else if (["doctor", "nurse", "user", "caregiver", "admin"].includes(role)) query.role = role;
      else return res.status(400).json({ message: "Invalid role filter" });
    }

    let users;
    if (mongoose.connection.readyState === 1) {
      users = await User.find(query).select("-password").sort({ createdAt: -1 });
      if (users.length === 0) {
        const shouldFallback = !role || ["doctor", "nurse", "patient"].includes(role);
        if (shouldFallback) {
          users = mockUsers
            .filter((u) => {
              if (u.status !== "active") return false;
              if (!role) return true;
              if (role === "patient") return u.role === "user" || u.role === "caregiver";
              return u.role === role;
            })
            .map(({ password: _pw, ...u }) => u);
        }
      }
    } else {
      // Atlas is down — use mock data
      users = mockUsers
        .filter((u) => {
          if (u.status !== "active") return false;
          if (!role) return true;
          if (role === "patient") return u.role === "user" || u.role === "caregiver";
          return u.role === role;
        })
        .map(({ password: _pw, ...u }) => u);
    }

    res.json({ users, total: users.length });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Public version: allow unauthenticated requests for listing certain roles (doctors/nurses)
const getPublicUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = { ...activeOrLegacyStatus };

    if (role) {
      if (role === "patient") query.role = { $in: ["user", "caregiver"] };
      else if (["doctor", "nurse", "user", "caregiver", "admin"].includes(role)) query.role = role;
      else return res.status(400).json({ message: "Invalid role filter" });
    }

    let users;
    if (mongoose.connection.readyState === 1) {
      users = await User.find(query).select("-password").sort({ createdAt: -1 });
      if (users.length === 0 && (role === "doctor" || role === "nurse")) {
        users = mockUsers
          .filter((u) => {
            if (u.status !== "active") return false;
            return u.role === role;
          })
          .map(({ password: _pw, ...u }) => u);
      }
    } else {
      users = mockUsers
        .filter((u) => {
          if (u.status !== "active") return false;
          if (!role) return true;
          if (role === "patient") return u.role === "user" || u.role === "caregiver";
          return u.role === role;
        })
        .map(({ password: _pw, ...u }) => u);
    }

    res.json({ users, total: users.length });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getPendingUsers = async (req, res) => {
  try {
    let pending;
    if (mongoose.connection.readyState === 1) {
      pending = await User.find({ status: "pending" }).select("-password").sort({ createdAt: -1 });
    } else {
      pending = mockPendingUsers
        .filter((u) => u.status === "pending")
        .map(({ password: _pw, ...u }) => u);
    }
    res.json({ users: pending, total: pending.length });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!["active", "rejected"].includes(status))
      return res.status(400).json({ message: "Status must be 'active' or 'rejected'" });

    try {
      const user = await User.findByIdAndUpdate(userId, { status }, { new: true }).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json({ user, message: `User ${status === "active" ? "approved" : "rejected"} successfully` });
    } catch {
      // Mock fallback
      const idx = mockPendingUsers.findIndex((u) => u._id === userId);
      if (idx === -1) return res.status(404).json({ message: "User not found" });

      mockPendingUsers[idx].status = status;
      if (status === "active") {
        const { password: _pw, ...safeUser } = mockPendingUsers[idx];
        mockUsers.push(mockPendingUsers[idx]);
        return res.json({ user: safeUser, message: "User approved successfully" });
      }
      const { password: _pw, ...safeUser } = mockPendingUsers[idx];
      return res.json({ user: safeUser, message: "User rejected successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    try {
      const user = await User.findByIdAndDelete(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json({ message: "User deleted successfully" });
    } catch {
      const idx = mockUsers.findIndex((u) => u._id === userId);
      if (idx === -1) return res.status(404).json({ message: "User not found" });
      mockUsers.splice(idx, 1);
      return res.json({ message: "User deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, designation, hospital, specialization, experience, license, department, address, gender, dob } = req.body;
    const updates = {};
    if (name)           updates.name           = name;
    if (email)          updates.email          = email;
    if (phone)          updates.phone          = phone;
    if (designation)    updates.designation    = designation;
    if (hospital)       updates.hospital       = hospital;
    if (specialization) updates.specialization = specialization;
    if (experience)     updates.experience     = experience;
    if (license)        updates.license        = license;
    if (department)     updates.department     = department;
    if (address)        updates.address        = address;
    if (gender)         updates.gender         = gender;
    if (dob)            updates.dob            = dob;

    try {
      const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json({ user, message: "User updated successfully" });
    } catch {
      const idx = mockUsers.findIndex((u) => u._id === userId);
      if (idx === -1) return res.status(404).json({ message: "User not found" });
      mockUsers[idx] = { ...mockUsers[idx], ...updates };
      const { password: _pw, ...safe } = mockUsers[idx];
      return res.json({ user: safe, message: "User updated successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const cleanupDuplicates = async (req, res) => {
  try {
    const allUsers = await User.find({}).sort({ createdAt: 1 });
    const byName = {};
    allUsers.forEach((u) => {
      const key = u.name.trim().toLowerCase();
      if (!byName[key]) byName[key] = [];
      byName[key].push(u);
    });

    const deleted = [];
    for (const [, users] of Object.entries(byName)) {
      if (users.length > 1) {
        for (const u of users.slice(1)) {
          await User.findByIdAndDelete(u._id);
          deleted.push({ name: u.name, email: u.email });
        }
      }
    }

    res.json({ message: `Deleted ${deleted.length} duplicate(s)`, deleted });
  } catch (err) {
    res.status(500).json({ message: "Cleanup failed", error: err.message });
  }
};

module.exports = { login, register, getUsers, getPublicUsers, getPendingUsers, updateUserStatus, deleteUser, updateUser, generateToken, cleanupDuplicates };
