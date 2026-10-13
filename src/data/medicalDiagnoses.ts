// ==============================================================
// CHAUDHARY HOSPITAL MANAGEMENT SYSTEM - CLINICAL DIAGNOSIS DICTIONARY
// Standard diagnoses with Hindi translations, synonyms & specialty tags
// ==============================================================

export interface MedicalDiagnosisItem {
  id: string;
  name: string;
  hindiName: string;
  department: string;
  severity?: 'Routine' | 'Urgent' | 'Critical';
  keywords: string[];
}

export const MEDICAL_DIAGNOSES: MedicalDiagnosisItem[] = [
  // ── Fevers & Infections (संक्रामक रोग व बुखार) ──
  {
    id: 'fev-01',
    name: 'Acute Viral Fever',
    hindiName: 'वायरल बुखार',
    department: 'General Medicine',
    severity: 'Routine',
    keywords: ['fever', 'viral', 'bukhar', 'cold', 'body ache', 'sardi', 'taap', 'temperature']
  },
  {
    id: 'fev-02',
    name: 'Typhoid Fever (Enteric Fever)',
    hindiName: 'टाइफाइड / मियादी बुखार',
    department: 'General Medicine',
    severity: 'Urgent',
    keywords: ['typhoid', 'enteric', 'motijhara', 'fever', 'bukhar', 'widal', 'salmonella']
  },
  {
    id: 'fev-03',
    name: 'Dengue Fever with Thrombocytopenia',
    hindiName: 'डेंगू बुखार (प्लेटलेट्स कमी)',
    department: 'General Medicine',
    severity: 'Critical',
    keywords: ['dengue', 'platelet', 'thrombocytopenia', 'machhar', 'fever', 'bukhar', 'bleeding']
  },
  {
    id: 'fev-04',
    name: 'Malaria (Plasmodium Vivax / Falciparum)',
    hindiName: 'मलेरिया बुखार (कंपकंपी के साथ)',
    department: 'General Medicine',
    severity: 'Urgent',
    keywords: ['malaria', 'chills', 'thand', 'fever', 'bukhar', 'plasmodium', 'shivering']
  },
  {
    id: 'fev-05',
    name: 'Pyrexia of Unknown Origin (PUO)',
    hindiName: 'अज्ञात कारण से बुखार',
    department: 'General Medicine',
    severity: 'Urgent',
    keywords: ['puo', 'unknown fever', 'fever', 'purana bukhar', 'pyrexia']
  },

  // ── Diabetes & Endocrinology (मधुमेह व हार्मोनल) ──
  {
    id: 'dia-01',
    name: 'Type 2 Diabetes Mellitus (T2DM)',
    hindiName: 'टाइप 2 मधुमेह (शुगर)',
    department: 'General Medicine',
    severity: 'Routine',
    keywords: ['diabetes', 'sugar', 'diab', 't2dm', 'madhumeh', 'blood sugar', 'glucose']
  },
  {
    id: 'dia-02',
    name: 'Type 1 Diabetes Mellitus (T1DM)',
    hindiName: 'टाइप 1 मधुमेह (इंसुलिन आश्रित)',
    department: 'Pediatrics',
    severity: 'Urgent',
    keywords: ['diabetes', 'sugar', 'type 1', 't1dm', 'insulin', 'juvenile']
  },
  {
    id: 'dia-03',
    name: 'Diabetic Ketoacidosis (DKA)',
    hindiName: 'डायबिटिक कीटोएसिडोसिस (गंभीर आपातकाल)',
    department: 'ICU / Emergency',
    severity: 'Critical',
    keywords: ['dka', 'ketoacidosis', 'high sugar', 'unconscious', 'diabetes coma', 'emergency']
  },
  {
    id: 'dia-04',
    name: 'Diabetic Foot Ulcer with Cellulitis',
    hindiName: 'डायबिटिक पैर का घाव व संक्रमण',
    department: 'General Surgery',
    severity: 'Urgent',
    keywords: ['diabetic foot', 'ulcer', 'sugar ghav', 'gangrene', 'cellulitis', 'per ka ghav']
  },
  {
    id: 'dia-05',
    name: 'Gestational Diabetes Mellitus (GDM)',
    hindiName: 'गर्भावस्था में मधुमेह',
    department: 'Gynecology',
    severity: 'Urgent',
    keywords: ['gdm', 'gestational diabetes', 'garbh sugar', 'pregnancy sugar']
  },
  {
    id: 'dia-06',
    name: 'Severe Hypoglycemia',
    hindiName: 'शुगर का अत्यधिक गिर जाना (हाइपोग्लाइसीमिया)',
    department: 'ICU / Emergency',
    severity: 'Critical',
    keywords: ['hypo', 'low sugar', 'hypoglycemia', 'chakkar', 'sweating', 'sugar low']
  },

  // ── Cardiology & Hypertension (हृदय व रक्तचाप) ──
  {
    id: 'car-01',
    name: 'Acute Myocardial Infarction (AMI / Heart Attack)',
    hindiName: 'हार्ट अटैक (दिल का दौरा)',
    department: 'Cardiology',
    severity: 'Critical',
    keywords: ['heart attack', 'ami', 'myocardial', 'chest pain', 'seena dard', 'dil ka daura', 'ecg', 'stemi']
  },
  {
    id: 'car-02',
    name: 'Acute Coronary Syndrome (ACS)',
    hindiName: 'एक्यूट कोरोनरी सिंड्रोम (धमनी अवरोध)',
    department: 'Cardiology',
    severity: 'Critical',
    keywords: ['acs', 'coronary', 'heart', 'chest pain', 'angina', 'cardiac']
  },
  {
    id: 'car-03',
    name: 'Essential / Primary Hypertension (High BP)',
    hindiName: 'उच्च रक्तचाप (हाई ब्लड प्रेशर)',
    department: 'General Medicine',
    severity: 'Routine',
    keywords: ['hypertension', 'bp', 'high bp', 'blood pressure', 'raktchap', 'sir dard']
  },
  {
    id: 'car-04',
    name: 'Hypertensive Urgency / Crisis',
    hindiName: 'अत्यधिक उच्च रक्तचाप आपातकाल (BP > 180/120)',
    department: 'ICU / Emergency',
    severity: 'Critical',
    keywords: ['bp crisis', 'hypertensive emergency', 'high bp', 'severe bp']
  },
  {
    id: 'car-05',
    name: 'Congestive Heart Failure (CHF)',
    hindiName: 'कंजेस्टिव हार्ट फेलियर (हृदय गति रुकना)',
    department: 'Cardiology',
    severity: 'Critical',
    keywords: ['heart failure', 'chf', 'breathlessness', 'per me sujan', 'edema', 'dil']
  },
  {
    id: 'car-06',
    name: 'Cardiac Arrhythmia / Atrial Fibrillation',
    hindiName: 'अनियमित दिल की धड़कन (एरिथमिया)',
    department: 'Cardiology',
    severity: 'Urgent',
    keywords: ['arrhythmia', 'afib', 'palpitation', 'dhadkan', 'irregular heart']
  },

  // ── Nephrology & Urology (किडनी व मूत्र रोग / पथरी) ──
  {
    id: 'uro-01',
    name: 'Renal Calculi / Nephrolithiasis (Kidney Stone)',
    hindiName: 'गुर्दे / किडनी की पथरी',
    department: 'Urology',
    severity: 'Urgent',
    keywords: ['kidney stone', 'renal stone', 'pathri', 'stone', 'calculi', 'gurde ki pathri', 'back pain']
  },
  {
    id: 'uro-02',
    name: 'Ureteric Calculus with Hydronephrosis',
    hindiName: 'मूत्रनली की पथरी (यूरिन रुकावट)',
    department: 'Urology',
    severity: 'Urgent',
    keywords: ['ureteric stone', 'ureter', 'hydronephrosis', 'stone', 'pathri', 'peshab me dard']
  },
  {
    id: 'uro-03',
    name: 'Urinary Tract Infection (UTI) / Cystitis',
    hindiName: 'मूत्र मार्ग संक्रमण (यूटीआई / पेशाब में जलन)',
    department: 'General Medicine',
    severity: 'Routine',
    keywords: ['uti', 'urinary infection', 'peshab jalan', 'dysuria', 'burning urine', 'cystitis']
  },
  {
    id: 'uro-04',
    name: 'Acute Pyelonephritis (Severe Kidney Infection)',
    hindiName: 'किडनी का गंभीर संक्रमण',
    department: 'Urology',
    severity: 'Urgent',
    keywords: ['pyelonephritis', 'kidney infection', 'fever chills', 'flank pain']
  },
  {
    id: 'uro-05',
    name: 'Benign Prostatic Hyperplasia (BPH) with Retention',
    hindiName: 'प्रोस्टेट ग्रंथि वृद्धि (पेशाब रुकना)',
    department: 'Urology',
    severity: 'Urgent',
    keywords: ['bph', 'prostate', 'urinary retention', 'peshab rukna', 'elderly']
  },
  {
    id: 'uro-06',
    name: 'Chronic Kidney Disease (CKD Stage 3-5)',
    hindiName: 'क्रॉनिक किडनी रोग (गुर्दे की खराबी)',
    department: 'Nephrology',
    severity: 'Critical',
    keywords: ['ckd', 'kidney failure', 'creatinine', 'urea', 'dialysis', 'gurda']
  },

  // ── Gastroenterology & Surgery (पेट व सर्जरी) ──
  {
    id: 'gas-01',
    name: 'Cholelithiasis (Gallbladder Stone)',
    hindiName: 'पित्ताशय / गॉलब्लेडर की पथरी',
    department: 'General Surgery',
    severity: 'Urgent',
    keywords: ['gallbladder stone', 'cholelithiasis', 'pitt ki pathri', 'pathri', 'stone', 'gb stone']
  },
  {
    id: 'gas-02',
    name: 'Acute Appendicitis with Local Peritonitis',
    hindiName: 'एक्यूट अपेंडिसाइटिस (अपेंडिक्स का दर्द)',
    department: 'General Surgery',
    severity: 'Critical',
    keywords: ['appendix', 'appendicitis', 'right iliac fossa', 'pet dard', 'abdominal pain']
  },
  {
    id: 'gas-03',
    name: 'Acute Gastroenteritis with Severe Dehydration',
    hindiName: 'उल्टी-दस्त व पानी की कमी (गैस्ट्रो)',
    department: 'General Medicine',
    severity: 'Urgent',
    keywords: ['gastroenteritis', 'diarrhea', 'vomiting', 'dast', 'ulti', 'dehydration', 'food poison']
  },
  {
    id: 'gas-04',
    name: 'Acute Pancreatitis',
    hindiName: 'अग्न्याशय में गंभीर सूजन (पैन्क्रियाटाइटिस)',
    department: 'Gastroenterology',
    severity: 'Critical',
    keywords: ['pancreatitis', 'amylase', 'lipase', 'severe stomach pain', 'alcohol']
  },
  {
    id: 'gas-05',
    name: 'Inguinal Hernia (Obstructed / Incarcerated)',
    hindiName: 'हर्निया (हर्निया का उभार व दर्द)',
    department: 'General Surgery',
    severity: 'Urgent',
    keywords: ['hernia', 'inguinal', 'umbilical', 'swelling', 'pet me gath']
  },
  {
    id: 'gas-06',
    name: 'Peptic Ulcer Disease with Upper GI Bleed',
    hindiName: 'पेट में छाला / अल्सर (खून की उल्टी)',
    department: 'Gastroenterology',
    severity: 'Critical',
    keywords: ['peptic ulcer', 'gi bleed', 'hematemesis', 'pet ka chala', 'blood vomit', 'melena']
  },
  {
    id: 'gas-07',
    name: 'Liver Abscess (Amoebic / Pyogenic)',
    hindiName: 'लिवर में मवाद / फोड़ा',
    department: 'Gastroenterology',
    severity: 'Urgent',
    keywords: ['liver abscess', 'liver', 'pus', 'jigar', 'fever liver']
  },

  // ── Orthopedics & Trauma (हड्डी रोग व चोट) ──
  {
    id: 'ort-01',
    name: 'Compound / Open Fracture Femur (Thigh Bone)',
    hindiName: 'जांघ की हड्डी का फ्रैक्चर (ओपन फ्रैक्चर)',
    department: 'Orthopedics',
    severity: 'Critical',
    keywords: ['fracture', 'femur', 'haddi', 'tuti haddi', 'thigh', 'accident', 'trauma']
  },
  {
    id: 'ort-02',
    name: 'Colles / Distal Radius Fracture (Wrist)',
    hindiName: 'हाथ की कलाई का फ्रैक्चर',
    department: 'Orthopedics',
    severity: 'Urgent',
    keywords: ['fracture', 'radius', 'wrist', 'kalai', 'hath tutna', 'ortho']
  },
  {
    id: 'ort-03',
    name: 'Fracture Neck of Femur (Elderly Hip Fracture)',
    hindiName: 'कूल्हे की हड्डी का फ्रैक्चर (हिप फ्रैक्चर)',
    department: 'Orthopedics',
    severity: 'Urgent',
    keywords: ['hip fracture', 'neck of femur', 'kulha', 'elderly fall', 'bujurg girna']
  },
  {
    id: 'ort-04',
    name: 'Shaft of Tibia-Fibula Fracture (Lower Leg)',
    hindiName: 'पैर की पिंडली का फ्रैक्चर',
    department: 'Orthopedics',
    severity: 'Urgent',
    keywords: ['tibia', 'fibula', 'leg fracture', 'per tutna', 'haddi']
  },
  {
    id: 'ort-05',
    name: 'Lumbar Spondylosis with Sciatica (Slip Disc)',
    hindiName: 'कमर दर्द / स्लिप डिस्क / साइटिका',
    department: 'Orthopedics',
    severity: 'Routine',
    keywords: ['slip disc', 'sciatica', 'back pain', 'kamar dard', 'spondylosis', 'l4 l5']
  },
  {
    id: 'ort-06',
    name: 'Severe Osteoarthritis of Knee (Bilateral)',
    hindiName: 'घुटनों का गंभीर गठिया (ऑस्टियोआर्थराइटिस)',
    department: 'Orthopedics',
    severity: 'Routine',
    keywords: ['arthritis', 'knee pain', 'ghutna dard', 'gathiya', 'osteoarthritis']
  },
  {
    id: 'ort-07',
    name: 'Polytrauma following Road Traffic Accident (RTA)',
    hindiName: 'सड़क दुर्घटना में गंभीर बहु-अंगीय चोट',
    department: 'Emergency / Trauma',
    severity: 'Critical',
    keywords: ['rta', 'accident', 'trauma', 'chot', 'head injury', 'polytrauma']
  },

  // ── Pulmonology & Respiratory (श्वसन व फेफड़े) ──
  {
    id: 'pul-01',
    name: 'Community Acquired Pneumonia (CAP) with Hypoxia',
    hindiName: 'निमोनिया (फेफड़ों में संक्रमण व ऑक्सीजन कमी)',
    department: 'Pulmonology',
    severity: 'Critical',
    keywords: ['pneumonia', 'chest infection', 'cough', 'balgam', 'oxygen low', 'spo2 low']
  },
  {
    id: 'pul-02',
    name: 'Acute Exacerbation of Bronchial Asthma',
    hindiName: 'दमा का गंभीर दौरा (अस्थमा अटैक)',
    department: 'Pulmonology',
    severity: 'Critical',
    keywords: ['asthma', 'dama', 'breathless', 'wheezing', 'sans fulna', 'inhaler']
  },
  {
    id: 'pul-03',
    name: 'Chronic Obstructive Pulmonary Disease (COPD Exacerbation)',
    hindiName: 'सीओपीडी (फेफड़ों की पुरानी बीमारी का बढ़ना)',
    department: 'Pulmonology',
    severity: 'Critical',
    keywords: ['copd', 'smoker cough', 'sans foolna', 'oxygen', 'bidi khansi']
  },
  {
    id: 'pul-04',
    name: 'Pulmonary Tuberculosis (Active TB)',
    hindiName: 'फेफड़ों की टीबी (क्षय रोग)',
    department: 'Pulmonology',
    severity: 'Urgent',
    keywords: ['tuberculosis', 'tb', 'khansi', 'weight loss', 'blood in sputum', 'hemoptysis']
  },
  {
    id: 'pul-05',
    name: 'Acute Bronchitis with Bronchospasm',
    hindiName: 'तीव्र ब्रोंकाइटिस (श्वसन नली में सूजन)',
    department: 'General Medicine',
    severity: 'Routine',
    keywords: ['bronchitis', 'cough', 'khansi', 'chest congestion']
  },

  // ── Neurology (मस्तिष्क व तंत्रिका तंत्र) ──
  {
    id: 'neu-01',
    name: 'Cerebrovascular Accident (Acute Ischemic Stroke)',
    hindiName: 'ब्रेन स्ट्रोक / लकवा (फालिज)',
    department: 'Neurology',
    severity: 'Critical',
    keywords: ['stroke', 'cva', 'paralysis', 'lakwa', 'falij', 'face deviation', 'weakness']
  },
  {
    id: 'neu-02',
    name: 'Intracranial Hemorrhage (Brain Bleed)',
    hindiName: 'मस्तिष्क में रक्तस्राव (ब्रेन हेमरेज)',
    department: 'Neurology / Neurosurgery',
    severity: 'Critical',
    keywords: ['hemorrhage', 'brain bleed', 'sir me khoon', 'unconscious', 'bp high']
  },
  {
    id: 'neu-03',
    name: 'Generalized Tonic-Clonic Seizure (Epilepsy / Fit)',
    hindiName: 'मिर्गी का दौरा (दौरे पड़ना / फिट्स)',
    department: 'Neurology',
    severity: 'Critical',
    keywords: ['seizure', 'epilepsy', 'fit', 'daura', 'mirgi', 'convulsion']
  },
  {
    id: 'neu-04',
    name: 'Severe Migraine with Aura',
    hindiName: 'माइग्रेन (आधे सिर का तेज दर्द)',
    department: 'Neurology',
    severity: 'Routine',
    keywords: ['migraine', 'headache', 'aadha sir dard', 'vomiting headache', 'sir dard']
  },

  // ── Obstetrics & Gynecology (स्त्री व प्रसूति रोग) ──
  {
    id: 'gyn-01',
    name: 'Full Term Normal Delivery (FTND) in Active Labor',
    hindiName: 'पूर्ण प्रसव पीड़ा (नॉर्मल डिलीवरी)',
    department: 'Gynecology',
    severity: 'Urgent',
    keywords: ['labor', 'delivery', 'delivery pain', 'prasav', 'ftnd', 'pregnancy']
  },
  {
    id: 'gyn-02',
    name: 'Lower Segment Cesarean Section (LSCS Required)',
    hindiName: 'सिजेरियन डिलीवरी (ऑपरेशन द्वारा प्रसव)',
    department: 'Gynecology',
    severity: 'Urgent',
    keywords: ['c-section', 'lscs', 'cesarean', 'operation delivery', 'fetal distress']
  },
  {
    id: 'gyn-03',
    name: 'Preeclampsia with Severe Hypertension',
    hindiName: 'गर्भावस्था में अत्यधिक हाई बीपी (प्री-एक्लेमप्सिया)',
    department: 'Gynecology',
    severity: 'Critical',
    keywords: ['preeclampsia', 'eclampsia', 'garbh me bp', 'swelling face', 'proteinuria']
  },
  {
    id: 'gyn-04',
    name: 'Ectopic Pregnancy Ruptured (Surgical Emergency)',
    hindiName: 'अस्थानिक गर्भावस्था फटना (इमरजेंसी सर्जरी)',
    department: 'Gynecology',
    severity: 'Critical',
    keywords: ['ectopic', 'tube pregnancy', 'bleeding', 'severe pelvic pain']
  },
  {
    id: 'gyn-05',
    name: 'Abnormal Uterine Bleeding (AUB) / Menorrhagia',
    hindiName: 'अत्यधिक मासिक रक्तस्राव (एयूबी)',
    department: 'Gynecology',
    severity: 'Routine',
    keywords: ['aub', 'bleeding', 'heavy period', 'mahavari', 'uterus']
  },

  // ── ENT, Eye & Dermatology (आँख, कान, त्वचा) ──
  {
    id: 'ent-01',
    name: 'Acute Suppurative Otitis Media (Ear Infection)',
    hindiName: 'कान का गंभीर संक्रमण / मवाद बहना',
    department: 'ENT',
    severity: 'Routine',
    keywords: ['ear pain', 'otitis', 'kaan me dard', 'pus ear', 'ent']
  },
  {
    id: 'ent-02',
    name: 'Severe Epistaxis (Nasal Bleeding)',
    hindiName: 'नाक से खून बहना (नकसीर)',
    department: 'ENT',
    severity: 'Urgent',
    keywords: ['epistaxis', 'nose bleed', 'naksir', 'naak se khoon']
  },
  {
    id: 'eye-01',
    name: 'Mature Senile Cataract (Pre-Op Evaluation)',
    hindiName: 'मोतियाबिंद (सफेद मोतिया)',
    department: 'Ophthalmology',
    severity: 'Routine',
    keywords: ['cataract', 'motiyabind', 'aankh', 'eye vision', 'blur vision']
  },
  {
    id: 'eye-02',
    name: 'Acute Angle-Closure Glaucoma',
    hindiName: 'काला मोतियाबिंद (आँख का तेज दर्द व दबाव)',
    department: 'Ophthalmology',
    severity: 'Critical',
    keywords: ['glaucoma', 'kala motiya', 'eye pressure', 'sudden blindness']
  },
  {
    id: 'der-01',
    name: 'Severe Cutaneous Drug Reaction / Urticaria',
    hindiName: 'दवा से गंभीर एलर्जी / पित्ती (अर्टिकेरिया)',
    department: 'Dermatology',
    severity: 'Urgent',
    keywords: ['allergy', 'urticaria', 'pitti', 'drug reaction', 'itching', 'rash']
  }
];

/**
 * Fast fuzzy search across diagnosis name, hindi name, keywords & department.
 * Matches single characters, prefixes, or full phrases.
 */
export function searchDiagnoses(query: string, maxResults: number = 8): MedicalDiagnosisItem[] {
  if (!query || !query.trim()) return [];

  const clean = query.trim().toLowerCase();
  const words = clean.split(/\s+/).filter(Boolean);

  const scored = MEDICAL_DIAGNOSES.map((item) => {
    let score = 0;
    const nameLower = item.name.toLowerCase();
    const hindiLower = item.hindiName.toLowerCase();
    const deptLower = item.department.toLowerCase();

    // Exact prefix match on name (Highest priority)
    if (nameLower.startsWith(clean)) score += 100;
    else if (nameLower.includes(clean)) score += 50;

    // Match on Hindi name
    if (hindiLower.includes(clean)) score += 60;

    // Match on keywords
    for (const kw of item.keywords) {
      if (kw === clean) score += 90;
      else if (kw.startsWith(clean)) score += 70;
      else if (kw.includes(clean)) score += 40;
    }

    // Match on department
    if (deptLower.includes(clean)) score += 20;

    // Multi-word matches
    for (const w of words) {
      if (nameLower.includes(w)) score += 15;
      if (item.keywords.some(k => k.includes(w))) score += 15;
    }

    return { item, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(s => s.item);
}
