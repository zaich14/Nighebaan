// Health-focused AI chatbot for elderly patients
// Supports Anthropic Claude API if ANTHROPIC_API_KEY is set; falls back to rule-based responses.

const axios = require("axios");

// ── Rule-based response engine ─────────────────────────────────────────────────

const rules = [
  // Greetings
  {
    patterns: [/^hi\b/i, /^hello\b/i, /^hey\b/i, /^good (morning|afternoon|evening)/i, /^greetings/i, /^salaam/i, /^salam/i],
    responses: [
      "Hello! I'm your Nigehbaan health assistant. How are you feeling today?",
      "Hi there! I'm here to help with any health questions you have. What's on your mind?",
      "Hello! Great to hear from you. How can I assist you with your health today?",
    ],
  },
  // How are you
  {
    patterns: [/how are you/i, /how do you do/i, /how's it going/i],
    responses: [
      "I'm doing great, thank you for asking! More importantly, how are *you* feeling today?",
      "I'm here and ready to help! How are your health and vitals today?",
    ],
  },
  // Goodbye
  {
    patterns: [/^bye\b/i, /^goodbye/i, /^take care/i, /^see you/i, /^thank you/i, /^thanks/i],
    responses: [
      "Take care and stay healthy! Don't hesitate to ask if you need anything.",
      "Goodbye! Remember to take your medications on time and stay hydrated. Feel better!",
      "You're welcome! Stay safe and healthy. I'm always here if you need health guidance.",
    ],
  },
  // Blood pressure
  {
    patterns: [/blood pressure/i, /bp\b/i, /hypertension/i, /systolic/i, /diastolic/i],
    responses: [
      "**Blood Pressure Tips:**\n\n• Normal range is 120/80 mmHg or lower\n• High BP (above 130/80) is hypertension\n• Reduce salt intake — aim for less than 2,300 mg/day\n• Exercise regularly — even 30 min walking daily helps\n• Avoid smoking and limit alcohol\n• Manage stress with breathing exercises\n• Take prescribed medications consistently\n\nIf your BP is above 180/120, seek emergency care immediately.",
      "**Managing High Blood Pressure:**\n\n• Monitor your BP at the same time each day\n• The DASH diet (fruits, vegetables, low-fat dairy) is proven to lower BP\n• Reducing stress through relaxation techniques helps significantly\n• Medications like ACE inhibitors and beta-blockers are commonly prescribed\n• Always consult your doctor before changing medications\n\nWould you like tips on diet or exercise for BP management?",
    ],
  },
  // Heart rate
  {
    patterns: [/heart rate/i, /pulse/i, /heartbeat/i, /bpm\b/i, /palpitation/i, /irregular heart/i],
    responses: [
      "**Heart Rate Information:**\n\n• Normal resting heart rate for adults: 60–100 bpm\n• Athletes may have a lower resting rate (40–60 bpm)\n• Bradycardia: below 60 bpm — can cause dizziness\n• Tachycardia: above 100 bpm at rest — seek medical advice\n\n**When to call a doctor:**\n• Chest pain with irregular heartbeat\n• Shortness of breath or fainting\n• Palpitations lasting more than a few minutes\n\nIs there a specific concern about your heart rate?",
    ],
  },
  // Blood oxygen
  {
    patterns: [/blood oxygen/i, /oxygen level/i, /spo2/i, /saturation/i, /oximeter/i],
    responses: [
      "**Blood Oxygen (SpO₂) Guide:**\n\n• Normal: 95–100%\n• Mild concern: 91–94% — monitor closely\n• Emergency: below 90% — seek immediate care\n\n**Tips to improve oxygen levels:**\n• Practice deep breathing exercises\n• Stay in well-ventilated areas\n• Avoid smoking and secondhand smoke\n• Stay active — regular exercise strengthens lungs\n• Treat underlying conditions (asthma, COPD)\n\nIf you have persistent low readings, please contact your doctor.",
    ],
  },
  // Blood glucose / diabetes
  {
    patterns: [/blood glucose/i, /blood sugar/i, /diabetes/i, /diabetic/i, /insulin/i, /glucose/i, /sugar level/i],
    responses: [
      "**Blood Glucose Management:**\n\n• Fasting glucose normal: 70–99 mg/dL\n• After meals (2 hrs): below 140 mg/dL\n• Prediabetes fasting: 100–125 mg/dL\n• Diabetes fasting: 126 mg/dL or higher\n\n**Daily tips:**\n• Eat at regular intervals — skipping meals causes spikes\n• Choose whole grains, vegetables, lean proteins\n• Limit sugary drinks and sweets\n• Monitor your glucose as prescribed\n• Exercise helps cells use insulin more effectively\n\nWould you like advice on diet for diabetes management?",
      "**Managing Diabetes:**\n\n• Take medications/insulin exactly as prescribed\n• Check feet daily for cuts or sores (poor healing is common)\n• Stay hydrated — dehydration raises blood sugar\n• Carry a fast-acting sugar source (glucose tablets) for hypoglycemia\n• Schedule regular eye, kidney, and foot exams\n\nEmergency: If glucose drops below 70 mg/dL with symptoms (shakiness, confusion), treat immediately with 15g of fast sugar.",
    ],
  },
  // Temperature / fever
  {
    patterns: [/temperature/i, /fever/i, /thermometer/i, /38\s*°?c/i, /39\s*°?c/i, /100\s*°?f/i],
    responses: [
      "**Body Temperature Guide:**\n\n• Normal: 36.1°C – 37.2°C (97–99°F)\n• Low-grade fever: 37.3°C – 38°C\n• Fever: above 38°C (100.4°F)\n• High fever: above 39.4°C (103°F) — seek medical care\n\n**Managing fever:**\n• Rest and stay hydrated (water, clear broths)\n• Paracetamol or ibuprofen as directed\n• Cool compress on forehead\n• Avoid heavy blankets if actively feverish\n\n**Seek emergency care if:**\n• Fever above 40°C (104°F)\n• Stiff neck, severe headache, or rash\n• Confusion or difficulty breathing",
    ],
  },
  // Medication
  {
    patterns: [/medication/i, /medicine/i, /tablet/i, /pill/i, /dose/i, /dosage/i, /prescription/i, /drug\b/i, /forgot.*medi/i, /missed.*dose/i],
    responses: [
      "**Medication Reminders & Tips:**\n\n• Take medications at the same time each day\n• Use a pill organizer to track daily doses\n• Never skip doses without consulting your doctor\n• Store medications away from heat and humidity\n• Keep an up-to-date list of all medications\n\n**If you missed a dose:**\n• Take it as soon as you remember\n• If it's almost time for the next dose, skip the missed one\n• Never double-dose\n\nAlways consult your pharmacist or doctor before stopping any medication.",
      "**Safe Medication Practices:**\n\n• Inform all your doctors about every medication you take\n• Be aware of drug interactions — ask your pharmacist\n• Check expiry dates regularly\n• Don't share medications with others\n• Keep medications out of reach of children\n\nDo you have a specific medication question?",
    ],
  },
  // Pain
  {
    patterns: [/chest pain/i, /chest tightness/i],
    responses: [
      "⚠️ **Chest pain can be serious.** Please seek medical attention immediately if you have:\n\n• Chest pain or pressure\n• Pain spreading to arm, jaw, or back\n• Shortness of breath\n• Sweating or nausea\n\nThese can be signs of a **heart attack**. Call emergency services (1122 in Pakistan) right away. Do not drive yourself.\n\nIf the pain is mild and you're uncertain, contact your doctor immediately. It is always better to be safe.",
    ],
  },
  {
    patterns: [/joint pain/i, /knee pain/i, /back pain/i, /arthritis/i, /pain\b/i],
    responses: [
      "**Managing Joint and Muscle Pain:**\n\n• Apply ice for the first 48 hours after an injury\n• Switch to warm compress for chronic pain\n• Gentle exercises like walking and swimming reduce joint stiffness\n• Over-the-counter pain relievers (as directed) can help\n• Physical therapy is highly effective for chronic pain\n\n**Arthritis tips:**\n• Stay active — inactivity makes joints stiffer\n• Maintain a healthy weight to reduce joint load\n• Omega-3 fatty acids (fish, flaxseed) have anti-inflammatory effects\n\nIs the pain new or ongoing? Severe or worsening pain should be evaluated by a doctor.",
    ],
  },
  // Diet / nutrition
  {
    patterns: [/diet/i, /nutrition/i, /food/i, /eat/i, /meal/i, /healthy eating/i, /weight/i],
    responses: [
      "**Healthy Eating for Elderly Patients:**\n\n• **Protein:** Lean meat, fish, eggs, beans — helps maintain muscle\n• **Calcium:** Dairy, leafy greens, fortified foods — for bone health\n• **Fibre:** Whole grains, fruits, vegetables — aids digestion\n• **Limit:** Salt, sugar, fried foods, processed snacks\n• **Hydration:** Drink 6–8 glasses of water daily — thirst lessens with age\n\n**Meal tips:**\n• Eat smaller, more frequent meals if appetite is low\n• Avoid skipping breakfast\n• Choose steamed, baked, or grilled over fried foods\n\nWould you like a sample meal plan or advice for a specific condition?",
      "**Foods That Support Heart & Blood Pressure Health:**\n\n• Oats and whole grains\n• Leafy greens (spinach, kale)\n• Berries (antioxidants)\n• Bananas and avocados (potassium)\n• Fatty fish (salmon, sardines — omega-3)\n• Nuts and seeds\n• Olive oil instead of butter\n\n**Limit:** Red meat, processed foods, pickled foods, salty snacks, sugary drinks.",
    ],
  },
  // Exercise
  {
    patterns: [/exercise/i, /workout/i, /physical activity/i, /walk/i, /yoga/i, /stretching/i, /gym/i, /active/i],
    responses: [
      "**Exercise Recommendations for Elderly Patients:**\n\n• **Aerobic:** 30 min of moderate walking, 5 days/week\n• **Strength:** Light resistance exercises 2 days/week\n• **Balance:** Tai chi or standing on one foot — reduces fall risk\n• **Flexibility:** Gentle stretching daily\n\n**Getting started safely:**\n• Begin with 10-minute sessions and increase gradually\n• Warm up before and cool down after\n• Stay hydrated — drink water before, during, and after\n• Stop if you feel chest pain, dizziness, or shortness of breath\n\nAlways consult your doctor before starting a new exercise program.",
    ],
  },
  // Sleep
  {
    patterns: [/sleep/i, /insomnia/i, /can't sleep/i, /cannot sleep/i, /sleeping problem/i, /tired/i, /fatigue/i],
    responses: [
      "**Sleep Health Tips:**\n\n• Aim for 7–9 hours per night\n• Keep a consistent sleep and wake time — even on weekends\n• Avoid caffeine after 2 PM\n• Limit screen time 1 hour before bed\n• Keep the bedroom cool, dark, and quiet\n• Avoid large meals close to bedtime\n• A warm bath before bed helps some people relax\n\n**Natural sleep aids:**\n• Chamomile tea\n• Warm milk\n• Gentle stretching or meditation before bed\n\nChronic insomnia lasting more than 3 weeks should be discussed with your doctor.",
    ],
  },
  // Emergency
  {
    patterns: [/emergency/i, /call.*ambulance/i, /call.*doctor/i, /urgent/i, /heart attack/i, /stroke/i, /can't breathe/i, /cannot breathe/i, /unconscious/i],
    responses: [
      "🚨 **EMERGENCY GUIDANCE**\n\nIf this is a medical emergency, **call emergency services immediately:**\n• Pakistan Emergency: **1122** (Rescue)\n• Edhi Foundation: **115**\n• Chhipa Ambulance: **1020**\n\n**Signs of a heart attack:** Chest pain, pain in left arm/jaw, sweating, nausea\n**Signs of a stroke (FAST):**\n• **F**ace drooping\n• **A**rm weakness\n• **S**peech difficulty\n• **T**ime to call for help\n\n**Do not wait.** Call for help immediately and stay calm.",
    ],
  },
  // Respiratory / breathing
  {
    patterns: [/breathing/i, /shortness of breath/i, /breathe/i, /copd/i, /asthma/i, /lungs/i, /respiratory/i],
    responses: [
      "**Respiratory Health Tips:**\n\n• Normal respiratory rate: 12–20 breaths per minute\n• Avoid smoke, dust, and strong fumes\n• Stay indoors on high pollution days\n• Use your inhaler as prescribed (asthma/COPD)\n• Practice pursed-lip breathing: inhale through nose (2 counts), exhale through pursed lips (4 counts)\n\n**Warning signs — seek immediate care:**\n• Breathing rate above 25/min\n• Blue lips or fingernails\n• Severe wheezing or stridor\n• Cannot speak in full sentences due to breathlessness",
    ],
  },
  // Hydration / water
  {
    patterns: [/water/i, /hydration/i, /drink\b/i, /dehydration/i, /thirst/i],
    responses: [
      "**Staying Hydrated:**\n\n• Elderly adults often feel less thirsty — drink water regularly even without thirst\n• Aim for 6–8 glasses (1.5–2 litres) per day\n• More fluids needed in hot weather or when exercising\n\n**Signs of dehydration:**\n• Dark yellow urine\n• Dry mouth or lips\n• Dizziness or lightheadedness\n• Confusion (can be serious in elderly)\n\n**Good fluid choices:** Water, diluted juice, herbal teas, clear soups\n**Limit:** Alcohol and caffeine — both cause fluid loss",
    ],
  },
  // Mental health
  {
    patterns: [/depressed/i, /depression/i, /anxiety/i, /stress/i, /sad\b/i, /lonely/i, /mental health/i, /worried/i, /panic/i],
    responses: [
      "**Mental Health Support:**\n\nFeelings of sadness, anxiety, or loneliness are very common — you are not alone.\n\n**Practical tips:**\n• Stay connected with family and friends\n• Engage in activities you enjoy\n• Get regular sunlight (15–20 min daily)\n• Light exercise releases mood-lifting endorphins\n• Limit news and social media if it causes worry\n\n**When to seek professional help:**\n• Persistent sadness lasting more than 2 weeks\n• Loss of interest in daily activities\n• Changes in appetite or sleep\n• Thoughts of self-harm\n\nPlease talk to your doctor — mental health is as important as physical health.",
    ],
  },
  // Fall prevention
  {
    patterns: [/fall\b/i, /fell\b/i, /balance/i, /dizzy/i, /dizziness/i, /vertigo/i, /trip\b/i],
    responses: [
      "**Fall Prevention for Elderly Patients:**\n\n• Install grab bars in bathroom and near stairs\n• Use non-slip mats in bathrooms\n• Keep floors clear of clutter and loose rugs\n• Ensure good lighting throughout the home\n• Wear non-slip footwear — avoid socks on smooth floors\n• Use a cane or walker if recommended\n\n**Balance exercises:**\n• Standing on one foot (hold chair for support)\n• Heel-to-toe walking\n• Tai chi — proven to reduce falls by up to 45%\n\n**Dizziness:** May be caused by low BP on standing (orthostatic hypotension) — rise slowly from sitting/lying positions.",
    ],
  },
  // Appointments
  {
    patterns: [/appointment/i, /schedule/i, /doctor visit/i, /checkup/i, /check.?up/i, /follow.?up/i, /visit\b/i],
    responses: [
      "**Managing Medical Appointments:**\n\n• Keep a written log of all appointments and doctors\n• Bring a list of all current medications to every visit\n• Write down questions beforehand so you don't forget\n• Ask a family member to accompany you if needed\n• Request a copy of test results for your records\n\n**Recommended check-ups for elderly patients:**\n• Blood pressure: every 1–2 years (or more often if elevated)\n• Blood glucose: annually\n• Cholesterol: every 4–6 years\n• Eye exam: annually\n• Dental exam: every 6 months",
    ],
  },
  // Vaccination
  {
    patterns: [/vaccine/i, /vaccination/i, /flu shot/i, /immunization/i, /booster/i],
    responses: [
      "**Recommended Vaccines for Elderly Patients:**\n\n• **Influenza (Flu):** Annually — especially important for 65+\n• **Pneumococcal:** Protects against pneumonia\n• **COVID-19:** Stay up to date with boosters\n• **Shingles (Herpes Zoster):** Recommended from age 50+\n• **Tetanus/Diphtheria (Td):** Every 10 years\n\nVaccines significantly reduce the risk of serious illness in older adults. Speak to your doctor about which vaccines are due for you.",
    ],
  },
  // General health question
  {
    patterns: [/health tip/i, /healthy/i, /wellness/i, /advice/i, /suggest/i, /recommend/i, /help me/i, /what should i/i],
    responses: [
      "**General Wellness Tips for Elderly Patients:**\n\n1. **Stay active** — 30 min of walking daily\n2. **Eat balanced meals** — more fruits, vegetables, and whole grains\n3. **Stay hydrated** — 6–8 glasses of water daily\n4. **Sleep well** — 7–9 hours per night\n5. **Take medications** — as prescribed, never skip doses\n6. **Stay social** — connect with family and friends\n7. **Monitor vitals** — check BP, glucose regularly\n8. **Regular check-ups** — don't skip scheduled appointments\n9. **Quit smoking** — it's never too late to benefit\n10. **Manage stress** — breathing exercises, prayer, or hobbies\n\nIs there a specific area you'd like to know more about?",
    ],
  },
  // What can you do / capabilities
  {
    patterns: [/what can you do/i, /what do you know/i, /your capabilities/i, /help me with/i, /how can you help/i, /what are you/i, /who are you/i],
    responses: [
      "I'm your **Nigehbaan Health Assistant** — a medical support chatbot designed for elderly patients.\n\n**I can help you with:**\n• Blood pressure, heart rate, and vital signs\n• Blood glucose and diabetes management\n• Medications and dosage reminders\n• Diet and nutrition advice\n• Exercise and physical activity tips\n• Sleep health\n• Fall prevention\n• Mental health support\n• Emergency guidance\n• Appointment management\n• Vaccination information\n\nJust ask me anything health-related and I'll do my best to help!",
    ],
  },
];

const conditionTopics = [
  {
    aliases: [/tuberculosis/i, /\btb\b/i],
    response:
      "**Tuberculosis (TB)** is an infection caused by bacteria, most often affecting the lungs. It spreads through the air when someone with active lung TB coughs, speaks, or sneezes.\n\n" +
      "**Common symptoms of active TB:**\n" +
      "- Cough lasting 3 weeks or more\n" +
      "- Chest pain\n" +
      "- Coughing blood or sputum\n" +
      "- Fever, night sweats, tiredness, weight loss, or loss of appetite\n\n" +
      "**Important:** TB can also be inactive/latent, where a person has TB bacteria but no symptoms and cannot spread it. Active TB needs medical testing and treatment. If you suspect TB, wear a mask, avoid close contact, and see a doctor for tests such as sputum testing, chest X-ray, or TB blood/skin testing.\n\n" +
      "TB is treatable, but the full medicine course must be completed exactly as prescribed.",
  },
  {
    aliases: [/pneumonia/i],
    response:
      "**Pneumonia** is a lung infection that can cause cough, fever, chest pain, weakness, and difficulty breathing. It can be serious in elderly patients.\n\n" +
      "**Seek urgent care** if there is shortness of breath, blue lips, confusion, chest pain, high fever, or oxygen below 90%. Treatment depends on the cause, so a doctor may need to examine you and order tests.",
  },
  {
    aliases: [/\bflu\b/i, /influenza/i, /common cold/i, /\bcold\b/i],
    response:
      "**Cold and flu symptoms** can include runny nose, sore throat, cough, fever, body aches, and tiredness.\n\n" +
      "- Rest and drink fluids.\n" +
      "- Use fever medicine only as directed.\n" +
      "- Elderly patients should contact a doctor if fever is high, breathing is difficult, symptoms worsen, or they have chronic conditions like heart/lung disease or diabetes.\n" +
      "- Yearly flu vaccination helps reduce severe illness.",
  },
  {
    aliases: [/covid/i, /coronavirus/i],
    response:
      "**COVID-19** can cause fever, cough, sore throat, tiredness, body aches, loss of smell/taste, or breathing difficulty.\n\n" +
      "If symptoms appear, consider testing, rest, hydration, and masking around others. Seek urgent care for breathing trouble, chest pain, confusion, blue lips, or low oxygen. Elderly patients and people with chronic illness should contact a doctor early.",
  },
];

function getAppHelpResponse() {
  return "**No problem — I can guide you around Nigehbaan.**\n\n" +
    "- Use **Vitals** to check your health readings.\n" +
    "- Use **Appointments** to book or review doctor/nurse visits.\n" +
    "- Use **Alerts** or **SOS** for urgent support.\n" +
    "- Use **Health History** from your dashboard to see past records.\n" +
    "- Use **Support** for complaints, FAQs, or questions.\n\n" +
    "Tell me what you want to do, for example: \"book a doctor\", \"see my vitals\", or \"send SOS\".";
}

function getPhysicalLostResponse() {
  return "**If you are lost and need to get home, please focus on safety first.**\n\n" +
    "- Stay where you are if it is safe, well-lit, and public.\n" +
    "- Call a trusted family member, caregiver, or neighbor and share your location.\n" +
    "- Use your phone map app and search for **Home** if your home address is saved.\n" +
    "- If you feel unsafe, confused, unwell, or cannot find help, call emergency services at **1122**.\n" +
    "- You can also go to a nearby shop, clinic, mosque, police/security desk, or reception and ask them to call your family.\n\n" +
    "If you are using Nigehbaan, press **SOS** to alert your caregivers. If you can, tell me what city/area or landmark you are near.";
}

function getRuleBasedResponse(message) {
  const lower = message.toLowerCase().trim();

  if (/lost.*(way|home|road|street|outside)|get home|find.*home|can't find.*home|cannot find.*home|where am i/.test(lower)) {
    return getPhysicalLostResponse();
  }

  if (/lost.*(app|website|page|dashboard)|confused.*(app|website|page|dashboard)|where do i go in.*(app|website)|how do i use|help.*app|navigate.*(app|website)/.test(lower)) {
    return getAppHelpResponse();
  }

  const topic = conditionTopics.find((item) => item.aliases.some((p) => p.test(lower)));
  if (topic) return topic.response;

  for (const rule of rules) {
    if (rule.patterns.some((p) => p.test(lower))) {
      const arr = rule.responses;
      return arr[Math.floor(Math.random() * arr.length)];
    }
  }

  if (/^what is\b|^what are\b|^tell me about\b|^explain\b/i.test(lower)) {
    return "I may not have a detailed built-in answer for that exact topic yet, but I can still help with general health guidance. Please ask with a symptom or condition name, for example: \"What is tuberculosis?\", \"I have cough and fever\", or \"How do I manage blood pressure?\"";
  }

  return "I can help with health questions and app guidance. Try asking about symptoms, blood pressure, diabetes, medicines, sleep, diet, exercise, appointments, payments, or SOS support.";
}

// ── Claude API call (optional) ─────────────────────────────────────────────────

async function callClaudeAPI(messages) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  const system = `You are a compassionate and knowledgeable health assistant for elderly patients using the Nigehbaan elderly care system.
Your role is to provide clear, helpful health guidance in simple language.
Focus on: blood pressure, heart rate, blood glucose, medications, diet, exercise, sleep, mental wellness, fall prevention, and general elderly health.
Always recommend consulting a doctor for medical decisions. For emergencies (chest pain, stroke symptoms), always direct to emergency services immediately.
Keep responses concise, warm, and easy to understand. Use bullet points for lists.
Pakistan emergency number: 1122.`;

  try {
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      },
      {
        headers: {
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        timeout: 15000,
      }
    );
    return response.data?.content?.[0]?.text || null;
  } catch {
    return null;
  }
}

// ── Controller ─────────────────────────────────────────────────────────────────

const chat = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0)
      return res.status(400).json({ message: "Messages array is required" });

    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== "user" || !lastMsg.content?.trim())
      return res.status(400).json({ message: "Last message must be a non-empty user message" });

    // Try Claude API first
    const aiReply = await callClaudeAPI(messages);
    if (aiReply) return res.json({ reply: aiReply, source: "claude" });

    // Rule-based fallback
    const reply = getRuleBasedResponse(lastMsg.content);
    res.json({ reply, source: "rules" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { chat };
