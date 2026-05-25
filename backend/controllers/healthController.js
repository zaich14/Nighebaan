const HealthData = require("../models/HealthData");

// Helper – create a date N days ago
const daysAgo = (n, h = 9) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(h, 0, 0, 0);
  return d;
};

// ─── Rich mock health history ────────────────────────────────────────────────
// mock-user-1  Amna Javed     – diabetic, hypertensive
// mock-user-2  Abdul Rehman   – heart disease, hyperlipidemia
// mock-user-3  Fatima Malik   – osteoporosis, mild hypertension
// mock-user-4  Mohsin Riaz    – COPD, diabetes
// mock-user-5  Nadia Hassan   – congestive heart failure, AFib
// mock-user-6  Tariq Mahmood  – Parkinson's, hypertension
const mockHealthData = [
  // ── Amna Javed (mock-user-1) ────────────────────────────────────────────
  { _id:"mh-1-1",  userId:"mock-user-1", recordedBy:"mock-user-11", heartRate:88, bloodPressure:{systolic:148,diastolic:94}, temperature:37.1, bloodOxygen:96, bloodGlucose:182, weight:62, respiratoryRate:19, steps:1800, medication:"Metformin 500mg, Amlodipine 5mg", notes:"Patient reports mild fatigue. Blood sugar elevated post-lunch.", recordedAt:daysAgo(28,9), createdAt:daysAgo(28,9) },
  { _id:"mh-1-2",  userId:"mock-user-1", recordedBy:"mock-user-11", heartRate:85, bloodPressure:{systolic:145,diastolic:92}, temperature:37.0, bloodOxygen:97, bloodGlucose:165, weight:62, respiratoryRate:18, steps:2100, medication:"Metformin 500mg, Amlodipine 5mg", notes:"Fasting glucose improved slightly. BP still elevated.", recordedAt:daysAgo(21,8), createdAt:daysAgo(21,8) },
  { _id:"mh-1-3",  userId:"mock-user-1", recordedBy:"mock-user-12", heartRate:82, bloodPressure:{systolic:142,diastolic:90}, temperature:36.9, bloodOxygen:97, bloodGlucose:158, weight:61.5, respiratoryRate:18, steps:2500, medication:"Metformin 500mg, Amlodipine 5mg, Losartan 50mg", notes:"Losartan added to improve BP control. Patient tolerating well.", recordedAt:daysAgo(14,9), createdAt:daysAgo(14,9) },
  { _id:"mh-1-4",  userId:"mock-user-1", recordedBy:"mock-user-11", heartRate:80, bloodPressure:{systolic:138,diastolic:88}, temperature:37.0, bloodOxygen:97, bloodGlucose:145, weight:61.5, respiratoryRate:17, steps:3000, medication:"Metformin 500mg, Amlodipine 5mg, Losartan 50mg", notes:"Good improvement in BP. Glucose trending down.", recordedAt:daysAgo(7,9), createdAt:daysAgo(7,9) },
  { _id:"mh-1-5",  userId:"mock-user-1", recordedBy:"mock-user-11", heartRate:78, bloodPressure:{systolic:135,diastolic:86}, temperature:36.9, bloodOxygen:98, bloodGlucose:138, weight:61, respiratoryRate:17, steps:3200, medication:"Metformin 500mg, Amlodipine 5mg, Losartan 50mg", notes:"Steady improvement. Advised low-sugar diet.", recordedAt:daysAgo(3,10), createdAt:daysAgo(3,10) },
  { _id:"mh-1-6",  userId:"mock-user-1", recordedBy:"mock-user-12", heartRate:76, bloodPressure:{systolic:132,diastolic:84}, temperature:36.8, bloodOxygen:98, bloodGlucose:128, weight:61, respiratoryRate:16, steps:3500, medication:"Metformin 500mg, Amlodipine 5mg, Losartan 50mg", notes:"Best readings this month. Patient in good spirits.", recordedAt:daysAgo(0,9), createdAt:daysAgo(0,9) },

  // ── Abdul Rehman (mock-user-2) ───────────────────────────────────────────
  { _id:"mh-2-1",  userId:"mock-user-2", recordedBy:"mock-user-11", heartRate:92, bloodPressure:{systolic:155,diastolic:98}, temperature:37.2, bloodOxygen:95, bloodGlucose:118, weight:80, respiratoryRate:20, steps:900,  medication:"Atorvastatin 40mg, Aspirin 75mg", notes:"Chest tightness reported. Referred to cardiologist.", recordedAt:daysAgo(30,8), createdAt:daysAgo(30,8) },
  { _id:"mh-2-2",  userId:"mock-user-2", recordedBy:"mock-user-11", heartRate:88, bloodPressure:{systolic:150,diastolic:95}, temperature:37.0, bloodOxygen:96, bloodGlucose:115, weight:80, respiratoryRate:19, steps:1100, medication:"Atorvastatin 40mg, Aspirin 75mg, Bisoprolol 2.5mg", notes:"Bisoprolol started. Monitoring HR closely.", recordedAt:daysAgo(23,9), createdAt:daysAgo(23,9) },
  { _id:"mh-2-3",  userId:"mock-user-2", recordedBy:"mock-user-12", heartRate:82, bloodPressure:{systolic:144,diastolic:91}, temperature:37.0, bloodOxygen:97, bloodGlucose:112, weight:79.5, respiratoryRate:18, steps:1500, medication:"Atorvastatin 40mg, Aspirin 75mg, Bisoprolol 2.5mg", notes:"HR responding well to Bisoprolol.", recordedAt:daysAgo(16,9), createdAt:daysAgo(16,9) },
  { _id:"mh-2-4",  userId:"mock-user-2", recordedBy:"mock-user-11", heartRate:78, bloodPressure:{systolic:138,diastolic:88}, temperature:36.9, bloodOxygen:97, bloodGlucose:110, weight:79, respiratoryRate:17, steps:2000, medication:"Atorvastatin 40mg, Aspirin 75mg, Bisoprolol 2.5mg", notes:"Significant improvement. Lipid panel due next week.", recordedAt:daysAgo(9,8), createdAt:daysAgo(9,8) },
  { _id:"mh-2-5",  userId:"mock-user-2", recordedBy:"mock-user-12", heartRate:75, bloodPressure:{systolic:132,diastolic:84}, temperature:36.8, bloodOxygen:98, bloodGlucose:108, weight:79, respiratoryRate:16, steps:2400, medication:"Atorvastatin 40mg, Aspirin 75mg, Bisoprolol 2.5mg", notes:"Good progress. Chest tightness resolved.", recordedAt:daysAgo(2,9), createdAt:daysAgo(2,9) },

  // ── Fatima Malik (mock-user-3) ───────────────────────────────────────────
  { _id:"mh-3-1",  userId:"mock-user-3", recordedBy:"mock-user-11", heartRate:74, bloodPressure:{systolic:136,diastolic:85}, temperature:36.7, bloodOxygen:98, bloodGlucose:102, weight:55, respiratoryRate:16, steps:2200, medication:"Alendronate 70mg weekly, Calcium 500mg", notes:"Mild back pain reported. Osteoporosis management ongoing.", recordedAt:daysAgo(25,10), createdAt:daysAgo(25,10) },
  { _id:"mh-3-2",  userId:"mock-user-3", recordedBy:"mock-user-11", heartRate:72, bloodPressure:{systolic:133,diastolic:83}, temperature:36.8, bloodOxygen:99, bloodGlucose:100, weight:55, respiratoryRate:15, steps:2500, medication:"Alendronate 70mg weekly, Calcium 500mg, Vitamin D3 1000IU", notes:"Vitamin D added. Bone density scan scheduled.", recordedAt:daysAgo(18,9), createdAt:daysAgo(18,9) },
  { _id:"mh-3-3",  userId:"mock-user-3", recordedBy:"mock-user-12", heartRate:71, bloodPressure:{systolic:130,diastolic:82}, temperature:36.7, bloodOxygen:99, bloodGlucose:98, weight:55, respiratoryRate:15, steps:2800, medication:"Alendronate 70mg weekly, Calcium 500mg, Vitamin D3 1000IU", notes:"BP improving. Back pain decreased.", recordedAt:daysAgo(11,9), createdAt:daysAgo(11,9) },
  { _id:"mh-3-4",  userId:"mock-user-3", recordedBy:"mock-user-11", heartRate:70, bloodPressure:{systolic:128,diastolic:80}, temperature:36.6, bloodOxygen:99, bloodGlucose:97, weight:54.8, respiratoryRate:15, steps:3100, medication:"Alendronate 70mg weekly, Calcium 500mg, Vitamin D3 1000IU", notes:"Good overall condition. Mobility improving.", recordedAt:daysAgo(4,10), createdAt:daysAgo(4,10) },
  { _id:"mh-3-5",  userId:"mock-user-3", recordedBy:"mock-user-11", heartRate:69, bloodPressure:{systolic:126,diastolic:79}, temperature:36.6, bloodOxygen:99, bloodGlucose:96, weight:54.8, respiratoryRate:15, steps:3300, medication:"Alendronate 70mg weekly, Calcium 500mg, Vitamin D3 1000IU", notes:"Stable. No new complaints.", recordedAt:daysAgo(1,9), createdAt:daysAgo(1,9) },

  // ── Mohsin Riaz (mock-user-4) ────────────────────────────────────────────
  { _id:"mh-4-1",  userId:"mock-user-4", recordedBy:"mock-user-12", heartRate:96, bloodPressure:{systolic:145,diastolic:92}, temperature:37.3, bloodOxygen:91, bloodGlucose:210, weight:78, respiratoryRate:26, steps:600,  medication:"Salbutamol inhaler, Ipratropium inhaler, Metformin 1000mg", notes:"COPD exacerbation — increased dyspnea. O2 saturation low.", recordedAt:daysAgo(29,8), createdAt:daysAgo(29,8) },
  { _id:"mh-4-2",  userId:"mock-user-4", recordedBy:"mock-user-11", heartRate:92, bloodPressure:{systolic:142,diastolic:90}, temperature:37.2, bloodOxygen:93, bloodGlucose:195, weight:78, respiratoryRate:24, steps:700,  medication:"Salbutamol inhaler, Ipratropium inhaler, Metformin 1000mg, Prednisone 30mg", notes:"Prednisone course for exacerbation. Slight improvement in O2.", recordedAt:daysAgo(22,9), createdAt:daysAgo(22,9) },
  { _id:"mh-4-3",  userId:"mock-user-4", recordedBy:"mock-user-12", heartRate:88, bloodPressure:{systolic:140,diastolic:88}, temperature:37.0, bloodOxygen:94, bloodGlucose:180, weight:77.5, respiratoryRate:22, steps:900,  medication:"Salbutamol inhaler, Ipratropium inhaler, Metformin 1000mg", notes:"Prednisone tapered off. Breathing improved.", recordedAt:daysAgo(15,9), createdAt:daysAgo(15,9) },
  { _id:"mh-4-4",  userId:"mock-user-4", recordedBy:"mock-user-11", heartRate:85, bloodPressure:{systolic:138,diastolic:86}, temperature:36.9, bloodOxygen:95, bloodGlucose:168, weight:77.5, respiratoryRate:20, steps:1200, medication:"Salbutamol inhaler, Ipratropium inhaler, Metformin 1000mg", notes:"O2 stabilising. Glucose improving with diet changes.", recordedAt:daysAgo(8,8), createdAt:daysAgo(8,8) },
  { _id:"mh-4-5",  userId:"mock-user-4", recordedBy:"mock-user-12", heartRate:82, bloodPressure:{systolic:135,diastolic:84}, temperature:36.8, bloodOxygen:95, bloodGlucose:158, weight:77, respiratoryRate:19, steps:1400, medication:"Salbutamol inhaler, Ipratropium inhaler, Metformin 1000mg", notes:"Steady recovery. Patient advised to avoid cold air.", recordedAt:daysAgo(3,9), createdAt:daysAgo(3,9) },
  { _id:"mh-4-6",  userId:"mock-user-4", recordedBy:"mock-user-11", heartRate:80, bloodPressure:{systolic:132,diastolic:82}, temperature:36.8, bloodOxygen:96, bloodGlucose:148, weight:77, respiratoryRate:18, steps:1600, medication:"Salbutamol inhaler, Ipratropium inhaler, Metformin 1000mg", notes:"Best readings since admission. O2 stable at 96%.", recordedAt:daysAgo(0,10), createdAt:daysAgo(0,10) },

  // ── Nadia Hassan (mock-user-5) ───────────────────────────────────────────
  { _id:"mh-5-1",  userId:"mock-user-5", recordedBy:"mock-user-11", heartRate:102, bloodPressure:{systolic:160,diastolic:100}, temperature:37.4, bloodOxygen:93, bloodGlucose:122, weight:70, respiratoryRate:24, steps:300,  medication:"Furosemide 40mg, Digoxin 0.125mg, Warfarin 5mg", notes:"Bilateral leg oedema. Fluid retention worsening. Furosemide dose reviewed.", recordedAt:daysAgo(27,8), createdAt:daysAgo(27,8) },
  { _id:"mh-5-2",  userId:"mock-user-5", recordedBy:"mock-user-12", heartRate:96, bloodPressure:{systolic:155,diastolic:97}, temperature:37.2, bloodOxygen:94, bloodGlucose:120, weight:69, respiratoryRate:22, steps:400,  medication:"Furosemide 40mg, Digoxin 0.125mg, Warfarin 5mg, Spironolactone 25mg", notes:"Weight down 1 kg after diuretic adjustment. Oedema reducing.", recordedAt:daysAgo(20,9), createdAt:daysAgo(20,9) },
  { _id:"mh-5-3",  userId:"mock-user-5", recordedBy:"mock-user-11", heartRate:90, bloodPressure:{systolic:148,diastolic:93}, temperature:37.0, bloodOxygen:95, bloodGlucose:118, weight:68, respiratoryRate:20, steps:600,  medication:"Furosemide 40mg, Digoxin 0.125mg, Warfarin 5mg, Spironolactone 25mg", notes:"Good diuretic response. HR improving.", recordedAt:daysAgo(13,9), createdAt:daysAgo(13,9) },
  { _id:"mh-5-4",  userId:"mock-user-5", recordedBy:"mock-user-12", heartRate:84, bloodPressure:{systolic:142,diastolic:89}, temperature:36.9, bloodOxygen:96, bloodGlucose:115, weight:67.5, respiratoryRate:18, steps:800,  medication:"Furosemide 40mg, Digoxin 0.125mg, Warfarin 5mg, Spironolactone 25mg", notes:"INR within therapeutic range. Oedema largely resolved.", recordedAt:daysAgo(6,8), createdAt:daysAgo(6,8) },
  { _id:"mh-5-5",  userId:"mock-user-5", recordedBy:"mock-user-11", heartRate:80, bloodPressure:{systolic:136,diastolic:85}, temperature:36.8, bloodOxygen:97, bloodGlucose:112, weight:67, respiratoryRate:17, steps:1000, medication:"Furosemide 40mg, Digoxin 0.125mg, Warfarin 5mg, Spironolactone 25mg", notes:"Significant improvement. Patient ambulatory with assistance.", recordedAt:daysAgo(1,9), createdAt:daysAgo(1,9) },

  // ── Tariq Mahmood (mock-user-6) ──────────────────────────────────────────
  { _id:"mh-6-1",  userId:"mock-user-6", recordedBy:"mock-user-12", heartRate:78, bloodPressure:{systolic:152,diastolic:96}, temperature:36.9, bloodOxygen:97, bloodGlucose:105, weight:68, respiratoryRate:17, steps:400,  medication:"Levodopa/Carbidopa 100/25mg, Amlodipine 5mg", notes:"Mild tremor present. BP elevated. Mobility assistance needed.", recordedAt:daysAgo(26,10), createdAt:daysAgo(26,10) },
  { _id:"mh-6-2",  userId:"mock-user-6", recordedBy:"mock-user-11", heartRate:76, bloodPressure:{systolic:148,diastolic:93}, temperature:36.8, bloodOxygen:98, bloodGlucose:103, weight:68, respiratoryRate:16, steps:500,  medication:"Levodopa/Carbidopa 100/25mg, Amlodipine 5mg, Physiotherapy ongoing", notes:"Physiotherapy started for motor control. Tremors slightly reduced.", recordedAt:daysAgo(19,9), createdAt:daysAgo(19,9) },
  { _id:"mh-6-3",  userId:"mock-user-6", recordedBy:"mock-user-12", heartRate:75, bloodPressure:{systolic:144,diastolic:90}, temperature:36.7, bloodOxygen:98, bloodGlucose:101, weight:67.8, respiratoryRate:16, steps:600,  medication:"Levodopa/Carbidopa 100/25mg, Amlodipine 5mg", notes:"BP improving. Gait slightly more stable.", recordedAt:daysAgo(12,8), createdAt:daysAgo(12,8) },
  { _id:"mh-6-4",  userId:"mock-user-6", recordedBy:"mock-user-11", heartRate:74, bloodPressure:{systolic:140,diastolic:88}, temperature:36.7, bloodOxygen:98, bloodGlucose:100, weight:67.5, respiratoryRate:16, steps:700,  medication:"Levodopa/Carbidopa 100/25mg, Amlodipine 5mg", notes:"Stable condition. Family reports better sleep.", recordedAt:daysAgo(5,10), createdAt:daysAgo(5,10) },
  { _id:"mh-6-5",  userId:"mock-user-6", recordedBy:"mock-user-12", heartRate:73, bloodPressure:{systolic:136,diastolic:85}, temperature:36.6, bloodOxygen:99, bloodGlucose:99, weight:67.5, respiratoryRate:15, steps:800,  medication:"Levodopa/Carbidopa 100/25mg, Amlodipine 5mg", notes:"Overall stable. Continue current medication plan.", recordedAt:daysAgo(0,9), createdAt:daysAgo(0,9) },
];

// ─── Controllers ─────────────────────────────────────────────────────────────

const getHealthData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 50, skip = 0 } = req.query;
    let healthData = [];
    try {
      healthData = await HealthData.find({ userId }).sort({ createdAt: -1 }).limit(parseInt(limit)).skip(parseInt(skip));
      if (healthData.length === 0) healthData = mockHealthData.filter((h) => h.userId === String(userId));
    } catch {
      healthData = mockHealthData.filter((h) => h.userId === String(userId));
    }
    res.json({ data: healthData, total: healthData.length, limit: parseInt(limit), skip: parseInt(skip) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createHealthData = async (req, res) => {
  try {
    const requesterId = req.user.userId;
    const requesterRole = req.user.role;
    const {
      patientId, recordedAt, heartRate, bloodPressure,
      temperature, bloodOxygen, bloodGlucose, weight,
      respiratoryRate, steps, medication, notes,
    } = req.body;

    if (!heartRate) return res.status(400).json({ message: "Heart rate is required" });

    const ownerId = (requesterRole === "nurse" || requesterRole === "doctor") && patientId
      ? patientId
      : requesterId;

    const record = {
      userId: String(ownerId),
      recordedBy: String(requesterId),
      recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
      heartRate, bloodPressure, temperature, bloodOxygen,
      bloodGlucose, weight, respiratoryRate, steps, medication, notes,
      createdAt: new Date(),
    };

    try {
      const doc = new HealthData(record);
      await doc.save();
      return res.status(201).json(doc);
    } catch {
      // DB unavailable — persist in mock array so reads reflect the new record
      const mockRecord = { ...record, _id: `mock-health-${Date.now()}` };
      mockHealthData.unshift(mockRecord);
      return res.status(201).json(mockRecord);
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getLatestHealthData = async (req, res) => {
  try {
    const userId = req.user.userId;
    let latestData = null;
    try {
      latestData = await HealthData.findOne({ userId }).sort({ createdAt: -1 });
    } catch { /* fall through */ }

    if (!latestData) {
      const records = mockHealthData
        .filter((h) => h.userId === String(userId))
        .sort((a, b) => b.createdAt - a.createdAt);
      return res.json({ data: records[0] || null });
    }
    res.json({ data: latestData });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getHealthHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 20, skip = 0 } = req.query;
    let records = [];
    let total = 0;
    try {
      total = await HealthData.countDocuments({ userId });
      records = await HealthData.find({ userId }).sort({ createdAt: -1 }).limit(parseInt(limit)).skip(parseInt(skip));
    } catch {
      const all = mockHealthData
        .filter((h) => h.userId === String(userId))
        .sort((a, b) => b.createdAt - a.createdAt);
      total = all.length;
      records = all.slice(parseInt(skip), parseInt(skip) + parseInt(limit));
    }
    res.json({ data: records, total, limit: parseInt(limit), skip: parseInt(skip) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Nurse/doctor view: health data for a specific patient
const getPatientHealthData = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 20, skip = 0 } = req.query;
    let records = [];
    let total = 0;
    try {
      total = await HealthData.countDocuments({ userId: patientId });
      records = await HealthData.find({ userId: patientId }).sort({ createdAt: -1 }).limit(parseInt(limit)).skip(parseInt(skip));
    } catch {
      const all = mockHealthData
        .filter((h) => h.userId === patientId)
        .sort((a, b) => b.createdAt - a.createdAt);
      total = all.length;
      records = all.slice(parseInt(skip), parseInt(skip) + parseInt(limit));
    }
    res.json({ data: records, total, limit: parseInt(limit), skip: parseInt(skip) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllHealthRecords = async (req, res) => {
  try {
    const { limit = 100, skip = 0 } = req.query;
    let records = [];
    try {
      records = await HealthData.find({}).sort({ createdAt: -1 }).limit(parseInt(limit)).skip(parseInt(skip));
      if (records.length === 0) throw new Error("empty");
    } catch {
      records = [...mockHealthData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    res.json({ data: records, total: records.length });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getHealthData,
  createHealthData,
  getLatestHealthData,
  getHealthHistory,
  getPatientHealthData,
  getAllHealthRecords,
};
