// Fallback health data used when the API is unavailable or token expired.
// Mirrors the backend mock data so patients always see realistic vitals.

const now = new Date();
const daysAgo = (d, h = 9) => {
  const t = new Date(now);
  t.setDate(t.getDate() - d);
  t.setHours(h, 0, 0, 0);
  return t.toISOString();
};

export const MOCK_HEALTH_RECORDS = [
  // Amna Javed — mock-user-1
  { _id:"mh-1-4", userId:"mock-user-1", heartRate:80, bloodPressure:{systolic:138,diastolic:88}, temperature:37.0, bloodOxygen:97, bloodGlucose:145, weight:61.5, respiratoryRate:17, steps:3000, medication:"Metformin 500mg, Amlodipine 5mg, Losartan 50mg", notes:"Good improvement in BP. Glucose trending down.", recordedAt:daysAgo(7), createdAt:daysAgo(7) },
  { _id:"mh-1-5", userId:"mock-user-1", heartRate:78, bloodPressure:{systolic:135,diastolic:86}, temperature:36.9, bloodOxygen:98, bloodGlucose:138, weight:61, respiratoryRate:17, steps:3200, medication:"Metformin 500mg, Amlodipine 5mg, Losartan 50mg", notes:"Steady improvement. Advised low-sugar diet.", recordedAt:daysAgo(3), createdAt:daysAgo(3) },
  { _id:"mh-1-6", userId:"mock-user-1", heartRate:76, bloodPressure:{systolic:132,diastolic:84}, temperature:36.8, bloodOxygen:98, bloodGlucose:128, weight:61, respiratoryRate:16, steps:3500, medication:"Metformin 500mg, Amlodipine 5mg, Losartan 50mg", notes:"Best readings this month. Patient in good spirits.", recordedAt:daysAgo(0), createdAt:daysAgo(0) },
  // Abdul Rehman — mock-user-2
  { _id:"mh-2-4", userId:"mock-user-2", heartRate:78, bloodPressure:{systolic:138,diastolic:88}, temperature:36.9, bloodOxygen:97, bloodGlucose:110, weight:79, respiratoryRate:17, steps:2000, medication:"Atorvastatin 40mg, Aspirin 75mg, Bisoprolol 2.5mg", notes:"Significant improvement. Lipid panel due next week.", recordedAt:daysAgo(9), createdAt:daysAgo(9) },
  { _id:"mh-2-5", userId:"mock-user-2", heartRate:75, bloodPressure:{systolic:132,diastolic:84}, temperature:36.8, bloodOxygen:98, bloodGlucose:108, weight:79, respiratoryRate:16, steps:2400, medication:"Atorvastatin 40mg, Aspirin 75mg, Bisoprolol 2.5mg", notes:"Good progress. Chest tightness resolved.", recordedAt:daysAgo(2), createdAt:daysAgo(2) },
  // Fatima Malik — mock-user-3
  { _id:"mh-3-4", userId:"mock-user-3", heartRate:70, bloodPressure:{systolic:128,diastolic:80}, temperature:36.6, bloodOxygen:99, bloodGlucose:97, weight:54.8, respiratoryRate:15, steps:3100, medication:"Alendronate 70mg weekly, Calcium 500mg, Vitamin D3 1000IU", notes:"Good overall condition. Mobility improving.", recordedAt:daysAgo(4), createdAt:daysAgo(4) },
  { _id:"mh-3-5", userId:"mock-user-3", heartRate:69, bloodPressure:{systolic:126,diastolic:79}, temperature:36.6, bloodOxygen:99, bloodGlucose:96, weight:54.8, respiratoryRate:15, steps:3300, medication:"Alendronate 70mg weekly, Calcium 500mg, Vitamin D3 1000IU", notes:"Stable. No new complaints.", recordedAt:daysAgo(1), createdAt:daysAgo(1) },
  // Mohsin Riaz — mock-user-4
  { _id:"mh-4-5", userId:"mock-user-4", heartRate:82, bloodPressure:{systolic:135,diastolic:84}, temperature:36.8, bloodOxygen:95, bloodGlucose:158, weight:77, respiratoryRate:19, steps:1400, medication:"Salbutamol inhaler, Ipratropium inhaler, Metformin 1000mg", notes:"Steady recovery. Patient advised to avoid cold air.", recordedAt:daysAgo(3), createdAt:daysAgo(3) },
  { _id:"mh-4-6", userId:"mock-user-4", heartRate:80, bloodPressure:{systolic:132,diastolic:82}, temperature:36.8, bloodOxygen:96, bloodGlucose:148, weight:77, respiratoryRate:18, steps:1600, medication:"Salbutamol inhaler, Ipratropium inhaler, Metformin 1000mg", notes:"Best readings since admission. O2 stable at 96%.", recordedAt:daysAgo(0), createdAt:daysAgo(0) },
  // Nadia Hassan — mock-user-5
  { _id:"mh-5-4", userId:"mock-user-5", heartRate:84, bloodPressure:{systolic:142,diastolic:89}, temperature:36.9, bloodOxygen:96, bloodGlucose:115, weight:67.5, respiratoryRate:18, steps:800, medication:"Furosemide 40mg, Digoxin 0.125mg, Warfarin 5mg, Spironolactone 25mg", notes:"INR within therapeutic range. Oedema largely resolved.", recordedAt:daysAgo(6), createdAt:daysAgo(6) },
  { _id:"mh-5-5", userId:"mock-user-5", heartRate:80, bloodPressure:{systolic:136,diastolic:85}, temperature:36.8, bloodOxygen:97, bloodGlucose:112, weight:67, respiratoryRate:17, steps:1000, medication:"Furosemide 40mg, Digoxin 0.125mg, Warfarin 5mg, Spironolactone 25mg", notes:"Significant improvement. Patient ambulatory with assistance.", recordedAt:daysAgo(1), createdAt:daysAgo(1) },
  // Tariq Mahmood — mock-user-6
  { _id:"mh-6-4", userId:"mock-user-6", heartRate:74, bloodPressure:{systolic:140,diastolic:88}, temperature:36.7, bloodOxygen:98, bloodGlucose:100, weight:67.5, respiratoryRate:16, steps:700, medication:"Levodopa/Carbidopa 100/25mg, Amlodipine 5mg", notes:"Stable condition. Family reports better sleep.", recordedAt:daysAgo(5), createdAt:daysAgo(5) },
  { _id:"mh-6-5", userId:"mock-user-6", heartRate:73, bloodPressure:{systolic:136,diastolic:85}, temperature:36.6, bloodOxygen:99, bloodGlucose:99, weight:67.5, respiratoryRate:15, steps:800, medication:"Levodopa/Carbidopa 100/25mg, Amlodipine 5mg", notes:"Overall stable. Continue current medication plan.", recordedAt:daysAgo(0), createdAt:daysAgo(0) },
];

// Email-to-userId mapping for lookup when only email is in localStorage user object
const EMAIL_TO_ID = {
  "amna.javed@example.com":    "mock-user-1",
  "abdul.rehman@example.com":  "mock-user-2",
  "fatima.malik@example.com":  "mock-user-3",
  "mohsin.riaz@example.com":   "mock-user-4",
  "nadia.hassan@example.com":  "mock-user-5",
  "tariq.mahmood@example.com": "mock-user-6",
};

export function getLatestFallback(user) {
  const uid = user?.id || user?._id || EMAIL_TO_ID[user?.email];
  if (!uid) return null;
  const records = MOCK_HEALTH_RECORDS.filter((r) => r.userId === uid);
  if (!records.length) return null;
  return records.reduce((latest, r) =>
    new Date(r.recordedAt) > new Date(latest.recordedAt) ? r : latest
  );
}

export function getHistoryFallback(user) {
  const uid = user?.id || user?._id || EMAIL_TO_ID[user?.email];
  if (!uid) return [];
  return MOCK_HEALTH_RECORDS
    .filter((r) => r.userId === uid)
    .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
}
