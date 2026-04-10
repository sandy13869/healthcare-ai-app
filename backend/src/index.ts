import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// GET /api/health
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Healthcare AI API is running' });
});

// POST /api/chat
app.post('/api/chat', (req: Request, res: Response) => {
  const { message } = req.body as { message: string };
  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  const lower = message.toLowerCase();
  let response: string;

  if (/headache|pain|migraine/.test(lower)) {
    response = 'For headaches and pain, try resting in a quiet, dark room and staying well hydrated. Over-the-counter pain relievers like ibuprofen or acetaminophen can help. If pain is severe, persistent, or accompanied by other symptoms, please consult a healthcare provider.';
  } else if (/fever|temperature|hot/.test(lower)) {
    response = 'For a fever, monitor your temperature regularly. Stay well hydrated with water and clear fluids. Rest as much as possible. Seek medical care if temperature exceeds 103°F (39.4°C), lasts more than 3 days, or is accompanied by severe symptoms.';
  } else if (/cold|flu|cough|sneeze/.test(lower)) {
    response = 'For colds and flu, rest is essential. Drink plenty of fluids, especially warm liquids like soup or tea. Over-the-counter medications can help manage symptoms. Most colds resolve within 7-10 days. See a doctor if symptoms worsen or last longer.';
  } else if (/diet|nutrition|eating|food/.test(lower)) {
    response = 'A healthy diet includes plenty of fruits, vegetables, and whole grains. Aim for lean proteins, healthy fats, and limit processed foods and added sugars. Stay hydrated with 8+ glasses of water daily. Consider consulting a registered dietitian for personalized advice.';
  } else if (/exercise|fitness|workout|gym/.test(lower)) {
    response = "Adults should aim for at least 150 minutes of moderate aerobic activity per week, plus strength training 2+ days per week. Start gradually if you're new to exercise. Always warm up, cool down, and listen to your body. Consult a doctor before starting a new exercise program if you have health conditions.";
  } else if (/sleep|tired|fatigue|insomnia/.test(lower)) {
    response = "Adults need 7-9 hours of quality sleep per night. Practice good sleep hygiene: keep a consistent schedule, avoid screens before bed, keep your room cool and dark. If you experience chronic insomnia or excessive fatigue, consult a healthcare provider.";
  } else if (/stress|anxiety|mental|depression/.test(lower)) {
    response = "Mental health is crucial for overall wellbeing. Techniques like mindfulness, deep breathing, and regular exercise can help manage stress and anxiety. Don't hesitate to seek professional help from a therapist or counselor. If you're experiencing severe depression or anxiety, please reach out to a mental health professional.";
  } else if (/heart|chest|blood pressure|hypertension/.test(lower)) {
    response = 'Heart health is serious. For chest pain, difficulty breathing, or heart palpitations, seek emergency care immediately. To maintain heart health: exercise regularly, eat a heart-healthy diet, manage stress, avoid smoking, and monitor blood pressure. Regular check-ups with your doctor are important.';
  } else if (/diabetes|sugar|insulin/.test(lower)) {
    response = 'Managing diabetes involves monitoring blood sugar levels, following a balanced diet low in simple carbohydrates, regular exercise, and taking medications as prescribed. Work closely with your healthcare team for personalized management. Regular eye, foot, and kidney check-ups are important for diabetics.';
  } else {
    response = "I'm a health information assistant. For specific medical concerns, please consult a licensed healthcare professional. I can provide general health information and wellness tips on topics like nutrition, exercise, sleep, stress management, and common conditions. What would you like to know?";
  }

  res.json({ response, timestamp: new Date().toISOString() });
});

// POST /api/symptom-check
app.post('/api/symptom-check', (req: Request, res: Response) => {
  const { symptoms } = req.body as { symptoms: string[] };
  if (!symptoms || !Array.isArray(symptoms)) {
    res.status(400).json({ error: 'Symptoms array is required' });
    return;
  }

  const severeKeywords = ['chest pain', 'difficulty breathing', 'severe pain', 'loss of consciousness', 'stroke', 'heart attack'];
  const lowerSymptoms = symptoms.map(s => s.toLowerCase());
  const hasSevereKeyword = severeKeywords.some(kw => lowerSymptoms.some(s => s.includes(kw)));

  let severity: 'mild' | 'moderate' | 'severe';
  let assessment: string;
  let recommendations: string[];

  if (hasSevereKeyword) {
    severity = 'severe';
    assessment = 'Your symptoms may indicate a serious medical condition that requires immediate attention.';
    recommendations = [
      'Call emergency services (911) immediately',
      'Do not drive yourself to the hospital',
      'Stay calm and rest',
      'Have someone stay with you until help arrives'
    ];
  } else if (symptoms.length >= 5) {
    severity = 'severe';
    assessment = 'You are experiencing multiple symptoms that warrant prompt medical evaluation.';
    recommendations = [
      'Seek medical care within the next few hours',
      'Consider visiting an urgent care center or emergency room',
      'Rest and stay hydrated',
      'Avoid strenuous activities',
      'Monitor symptoms closely and call 911 if condition worsens'
    ];
  } else if (symptoms.length >= 3) {
    severity = 'moderate';
    assessment = 'Your symptoms suggest a moderate health concern. Medical evaluation is recommended.';
    recommendations = [
      'Schedule an appointment with your healthcare provider soon',
      'Rest and stay hydrated',
      'Monitor your symptoms and track any changes',
      'Take over-the-counter medications as appropriate for individual symptoms',
      'Avoid contact with others if symptoms may be contagious'
    ];
  } else {
    severity = 'mild';
    assessment = 'Your symptoms appear to be mild. Home care may be sufficient, but monitor for changes.';
    recommendations = [
      'Rest and get adequate sleep',
      'Stay well hydrated',
      'Use over-the-counter remedies as needed',
      'Monitor symptoms over the next 24-48 hours',
      'Contact a healthcare provider if symptoms worsen or persist beyond 3-5 days'
    ];
  }

  res.json({
    severity,
    assessment,
    recommendations,
    disclaimer: 'This assessment is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.'
  });
});

// GET /api/health-info
app.get('/api/health-info', (_req: Request, res: Response) => {
  const healthInfo = [
    {
      id: 1,
      title: 'Common Cold',
      description: 'A viral infection of the upper respiratory tract, typically caused by rhinoviruses.',
      symptoms: ['Runny nose', 'Sore throat', 'Coughing', 'Sneezing', 'Mild headache', 'Low-grade fever'],
      treatments: ['Rest', 'Plenty of fluids', 'OTC pain relievers', 'Decongestants', 'Throat lozenges'],
      prevention: ['Frequent handwashing', 'Avoid touching face', 'Stay away from sick individuals', 'Boost immune system with healthy lifestyle']
    },
    {
      id: 2,
      title: 'Influenza (Flu)',
      description: 'A contagious respiratory illness caused by influenza viruses, more severe than the common cold.',
      symptoms: ['High fever', 'Severe body aches', 'Fatigue', 'Dry cough', 'Headache', 'Chills'],
      treatments: ['Antiviral medications (Tamiflu)', 'Rest', 'Hydration', 'OTC fever reducers', 'Medical supervision for high-risk patients'],
      prevention: ['Annual flu vaccine', 'Good hygiene practices', 'Avoid close contact with infected individuals', 'Healthy diet and exercise']
    },
    {
      id: 3,
      title: 'Hypertension',
      description: 'High blood pressure, a chronic condition where blood pressure in the arteries is persistently elevated.',
      symptoms: ['Often no symptoms (silent killer)', 'Headaches', 'Shortness of breath', 'Nosebleeds', 'Dizziness'],
      treatments: ['Lifestyle modifications', 'ACE inhibitors', 'Beta-blockers', 'Diuretics', 'Calcium channel blockers'],
      prevention: ['Regular exercise', 'Low-sodium diet', 'Maintain healthy weight', 'Limit alcohol', 'Quit smoking', 'Manage stress']
    },
    {
      id: 4,
      title: 'Type 2 Diabetes',
      description: 'A chronic condition affecting how the body processes blood sugar (glucose).',
      symptoms: ['Increased thirst', 'Frequent urination', 'Fatigue', 'Blurred vision', 'Slow-healing sores', 'Frequent infections'],
      treatments: ['Blood sugar monitoring', 'Metformin and other medications', 'Insulin therapy', 'Dietary changes', 'Regular exercise'],
      prevention: ['Maintain healthy weight', 'Regular physical activity', 'Healthy diet', 'Regular blood sugar screening', 'Avoid smoking']
    },
    {
      id: 5,
      title: 'Migraine',
      description: 'A neurological condition characterized by intense, debilitating headaches, often with other symptoms.',
      symptoms: ['Throbbing headache (usually one side)', 'Nausea', 'Vomiting', 'Light sensitivity', 'Sound sensitivity', 'Visual disturbances (aura)'],
      treatments: ['Pain relievers', 'Triptans', 'Anti-nausea medications', 'Rest in dark quiet room', 'Cold or warm compresses'],
      prevention: ['Identify and avoid triggers', 'Regular sleep schedule', 'Stay hydrated', 'Stress management', 'Preventive medications']
    },
    {
      id: 6,
      title: 'Allergies',
      description: 'An immune system response to substances (allergens) that are typically harmless to most people.',
      symptoms: ['Sneezing', 'Itchy eyes/nose/throat', 'Runny nose', 'Watery eyes', 'Skin rash', 'Difficulty breathing'],
      treatments: ['Antihistamines', 'Decongestants', 'Nasal corticosteroids', 'Immunotherapy', 'Avoid allergens'],
      prevention: ['Identify and avoid triggers', 'Keep windows closed during high pollen seasons', 'Use air purifiers', 'Regular cleaning']
    }
  ];

  res.json(healthInfo);
});

app.listen(PORT, () => {
  console.log(`Healthcare AI Backend running on port ${PORT}`);
});
