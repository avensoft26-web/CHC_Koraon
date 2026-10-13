// ==============================================================
// CHAUDHARY HOSPITAL MANAGEMENT SYSTEM - COMPREHENSIVE PHARMACEUTICAL FORMULARY
// Complete Indian Hospital Formulary across all clinical departments & specialties
// Includes Brand names, Salt/Composition, Dosage Forms, Recommended Timings & Keywords
// ==============================================================

export type MedicineFormType = 
  | 'Tablet'
  | 'Capsule'
  | 'Injection'
  | 'Syrup'
  | 'Drops'
  | 'IV Fluid'
  | 'Ointment'
  | 'Inhaler'
  | 'Sachet'
  | 'Respule';

export interface MedicineFormularyItem {
  id: string;
  name: string;             // Display name e.g. "Tab. Augmentin 625mg"
  brand: string;            // Brand e.g. "Augmentin"
  composition: string;      // Generic / Salt e.g. "Amoxicillin 500mg + Potassium Clavulanate 125mg"
  type: MedicineFormType;   // Tablet, Injection, etc.
  strength?: string;        // e.g. "625mg", "1g", "40mg"
  category: string;         // e.g. "Antibiotics & Antimicrobials"
  defaultFrequency: string; // e.g. "1-0-1 (BD - Twice Daily)"
  defaultFoodRelation: string; // e.g. "After Food (खाने के बाद)"
  defaultDuration: string;  // e.g. "5 Days"
  keywords: string[];       // Search synonyms, Hindi terms, generic names
}

export const MEDICINES_FORMULARY: MedicineFormularyItem[] = [
  // =========================================================================
  // 1. ANTIBIOTICS, ANTIMICROBIALS & ANTIFUNGALS (एंटीबायोटिक्स व संक्रमण रोधी)
  // =========================================================================
  {
    id: 'abx-01',
    name: 'Tab. Augmentin 625mg',
    brand: 'Augmentin',
    composition: 'Amoxicillin 500mg + Potassium Clavulanate 125mg',
    type: 'Tablet',
    strength: '625mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['augmentin', 'amoxyclav', 'amoxicillin', 'clav', '625', 'gsk', 'infection', 'throat', 'chest', 'sankraman', 'pus']
  },
  {
    id: 'abx-02',
    name: 'Tab. Augmentin 375mg',
    brand: 'Augmentin',
    composition: 'Amoxicillin 250mg + Potassium Clavulanate 125mg',
    type: 'Tablet',
    strength: '375mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['augmentin 375', 'amoxyclav', 'amoxicillin', 'clav', 'pediatric']
  },
  {
    id: 'abx-03',
    name: 'Tab. Augmentin 1000mg (1g)',
    brand: 'Augmentin 1g',
    composition: 'Amoxicillin 875mg + Potassium Clavulanate 125mg',
    type: 'Tablet',
    strength: '1000mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['augmentin 1000', 'augmentin 1g', 'amoxyclav 1g', 'severe infection']
  },
  {
    id: 'abx-04',
    name: 'Syp. Augmentin Duo 30ml',
    brand: 'Augmentin Duo',
    composition: 'Amoxicillin 200mg + Potassium Clavulanate 28.5mg / 5ml',
    type: 'Syrup',
    strength: '228.5mg/5ml',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['augmentin syrup', 'augmentin duo', 'bachho ka syrup', 'pediatric antibiotic']
  },
  {
    id: 'abx-05',
    name: 'Tab. Amoxyclav 625mg',
    brand: 'Amoxyclav',
    composition: 'Amoxicillin 500mg + Potassium Clavulanate 125mg',
    type: 'Tablet',
    strength: '625mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['amoxyclav', 'amoxicillin', 'clavulanate', 'moxclav', '625']
  },
  {
    id: 'abx-06',
    name: 'Cap. Mox 500mg (Amoxicillin)',
    brand: 'Mox',
    composition: 'Amoxicillin 500mg',
    type: 'Capsule',
    strength: '500mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-1-1 (TID - Thrice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['mox', 'novamox', 'amoxicillin', '500mg', 'gala kharab', 'cough']
  },
  {
    id: 'abx-07',
    name: 'Cap. Novamox 250mg',
    brand: 'Novamox',
    composition: 'Amoxicillin 250mg',
    type: 'Capsule',
    strength: '250mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-1-1 (TID - Thrice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['novamox', 'amoxicillin 250', 'cipla']
  },
  {
    id: 'abx-08',
    name: 'Inj. Monocef 1g (Ceftriaxone IV/IM)',
    brand: 'Monocef',
    composition: 'Ceftriaxone Sodium 1000mg',
    type: 'Injection',
    strength: '1g',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '5 Days',
    keywords: ['monocef 1g', 'ceftriaxone', 'monocef inj', 'typhoid', 'fever inj', 'aristo', 'iv im']
  },
  {
    id: 'abx-09',
    name: 'Inj. Monocef 500mg',
    brand: 'Monocef',
    composition: 'Ceftriaxone Sodium 500mg',
    type: 'Injection',
    strength: '500mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '5 Days',
    keywords: ['monocef 500', 'ceftriaxone 500', 'pediatric ceftriaxone']
  },
  {
    id: 'abx-10',
    name: 'Inj. Monocef 2g (Ceftriaxone IV)',
    brand: 'Monocef 2g',
    composition: 'Ceftriaxone Sodium 2000mg',
    type: 'Injection',
    strength: '2g',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '5 Days',
    keywords: ['monocef 2g', 'ceftriaxone 2g', 'severe infection', 'meningitis']
  },
  {
    id: 'abx-11',
    name: 'Inj. Monocef-SB 1.5g (Ceftriaxone + Sulbactam)',
    brand: 'Monocef-SB',
    composition: 'Ceftriaxone 1000mg + Sulbactam 500mg',
    type: 'Injection',
    strength: '1.5g',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '5 Days',
    keywords: ['monocef sb', 'ceftriaxone sulbactam', 'mono sb', 'uti', 'sepsis']
  },
  {
    id: 'abx-12',
    name: 'Tab. Taxim-O 200mg (Cefixime)',
    brand: 'Taxim-O',
    composition: 'Cefixime 200mg',
    type: 'Tablet',
    strength: '200mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['taxim o', 'cefixime 200', 'taxim', 'alkem', 'typhoid tablet', 'uti', 'ear']
  },
  {
    id: 'abx-13',
    name: 'Tab. Zifi 200mg (Cefixime)',
    brand: 'Zifi',
    composition: 'Cefixime 200mg',
    type: 'Tablet',
    strength: '200mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['zifi 200', 'cefixime', 'fdc', 'respiratory infection']
  },
  {
    id: 'abx-14',
    name: 'Tab. Taxim-O CV (Cefixime + Clavulanate)',
    brand: 'Taxim-O CV',
    composition: 'Cefixime 200mg + Potassium Clavulanate 125mg',
    type: 'Tablet',
    strength: '325mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['taxim o cv', 'cefixime clav', 'zifi cv', 'mahafcef cv']
  },
  {
    id: 'abx-15',
    name: 'Tab. Gudcef 200mg (Cefpodoxime)',
    brand: 'Gudcef',
    composition: 'Cefpodoxime Proxetil 200mg',
    type: 'Tablet',
    strength: '200mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['gudcef', 'cefpodoxime', 'monocef o', 'doxcef', 'mankind']
  },
  {
    id: 'abx-16',
    name: 'Tab. Gudcef-CV 200 (Cefpodoxime + Clav)',
    brand: 'Gudcef-CV',
    composition: 'Cefpodoxime 200mg + Potassium Clavulanate 125mg',
    type: 'Tablet',
    strength: '325mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['gudcef cv', 'cefpodoxime clav', 'monocef o cv']
  },
  {
    id: 'abx-17',
    name: 'Tab. Ceftum 500mg (Cefuroxime Axetil)',
    brand: 'Ceftum',
    composition: 'Cefuroxime Axetil 500mg',
    type: 'Tablet',
    strength: '500mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['ceftum 500', 'cefuroxime', 'pulmocef', 'gsk', 'pneumonia', 'bronchitis']
  },
  {
    id: 'abx-18',
    name: 'Tab. Ceftum 250mg',
    brand: 'Ceftum',
    composition: 'Cefuroxime Axetil 250mg',
    type: 'Tablet',
    strength: '250mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['ceftum 250', 'cefuroxime 250']
  },
  {
    id: 'abx-19',
    name: 'Inj. Ceftum 750mg (Cefuroxime IV/IM)',
    brand: 'Ceftum Inj',
    composition: 'Cefuroxime Sodium 750mg',
    type: 'Injection',
    strength: '750mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '3 Days',
    keywords: ['ceftum inj', 'cefuroxime inj', 'pre-op antibiotic']
  },
  {
    id: 'abx-20',
    name: 'Tab. Azithral 500mg (Azithromycin)',
    brand: 'Azithral',
    composition: 'Azithromycin 500mg',
    type: 'Tablet',
    strength: '500mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'Empty Stomach (खाली पेट)',
    defaultDuration: '3 Days',
    keywords: ['azithral 500', 'azithromycin', 'azee', 'zithrox', 'alembic', 'gala kharab', 'cough', 'corona']
  },
  {
    id: 'abx-21',
    name: 'Tab. Azithral 250mg',
    brand: 'Azithral',
    composition: 'Azithromycin 250mg',
    type: 'Tablet',
    strength: '250mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'Empty Stomach (खाली पेट)',
    defaultDuration: '5 Days',
    keywords: ['azithral 250', 'azithromycin 250', 'azee 250']
  },
  {
    id: 'abx-22',
    name: 'Syp. Azithral 200mg/5ml (15ml)',
    brand: 'Azithral Syp',
    composition: 'Azithromycin 200mg / 5ml',
    type: 'Syrup',
    strength: '200mg/5ml',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '3 Days',
    keywords: ['azithral syrup', 'azee syrup', 'bachho ka azithromycin']
  },
  {
    id: 'abx-23',
    name: 'Tab. Ciplox 500mg (Ciprofloxacin)',
    brand: 'Ciplox',
    composition: 'Ciprofloxacin 500mg',
    type: 'Tablet',
    strength: '500mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['ciplox 500', 'cifran', 'ciprofloxacin', 'uti', 'diarrhea', 'cipla']
  },
  {
    id: 'abx-24',
    name: 'Tab. Cifran 500mg',
    brand: 'Cifran',
    composition: 'Ciprofloxacin 500mg',
    type: 'Tablet',
    strength: '500mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['cifran', 'ciprofloxacin', 'sun pharma']
  },
  {
    id: 'abx-25',
    name: 'Tab. Cifran-CT (Cipro + Tinidazole)',
    brand: 'Cifran-CT',
    composition: 'Ciprofloxacin 500mg + Tinidazole 600mg',
    type: 'Tablet',
    strength: '1100mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['cifran ct', 'cipro tinidazole', 'dast', 'loose motion', 'dysentery']
  },
  {
    id: 'abx-26',
    name: 'Tab. Levomac 500mg (Levofloxacin)',
    brand: 'Levomac',
    composition: 'Levofloxacin 500mg',
    type: 'Tablet',
    strength: '500mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['levomac', 'levofloxacin', 'l-cin', 'levo 500', 'macleods', 'pneumonia']
  },
  {
    id: 'abx-27',
    name: 'Tab. Levomac 750mg',
    brand: 'Levomac 750',
    composition: 'Levofloxacin 750mg',
    type: 'Tablet',
    strength: '750mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['levomac 750', 'levofloxacin 750']
  },
  {
    id: 'abx-28',
    name: 'Tab. Oflox 200mg (Ofloxacin)',
    brand: 'Oflox',
    composition: 'Ofloxacin 200mg',
    type: 'Tablet',
    strength: '200mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['oflox', 'ofloxacin', 'zanocin', 'typhoid', 'uti']
  },
  {
    id: 'abx-29',
    name: 'Tab. Zenflox-OZ (Ofloxacin + Ornidazole)',
    brand: 'Zenflox-OZ',
    composition: 'Ofloxacin 200mg + Ornidazole 500mg',
    type: 'Tablet',
    strength: '700mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['zenflox oz', 'o2', 'oflox oz', 'pet kharab', 'dast', 'loose motion', 'amoebiasis']
  },
  {
    id: 'abx-30',
    name: 'Tab. O2 (Ofloxacin + Ornidazole)',
    brand: 'O2',
    composition: 'Ofloxacin 200mg + Ornidazole 500mg',
    type: 'Tablet',
    strength: '700mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['o2 tablet', 'o2 tab', 'medley', 'dast ki goli', 'pet dard dast']
  },
  {
    id: 'abx-31',
    name: 'Tab. Norflox-TZ (Norfloxacin + Tinidazole)',
    brand: 'Norflox-TZ',
    composition: 'Norfloxacin 400mg + Tinidazole 600mg',
    type: 'Tablet',
    strength: '1000mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['norflox tz', 'norfloxacin', 'cipla', 'dast', 'loose motion', 'pet sankraman']
  },
  {
    id: 'abx-32',
    name: 'Tab. Flagyl 400mg (Metronidazole)',
    brand: 'Flagyl',
    composition: 'Metronidazole 400mg',
    type: 'Tablet',
    strength: '400mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-1-1 (TID - Thrice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['flagyl 400', 'metrogyl', 'metronidazole', 'sanofi', 'loose motion', 'dant infection']
  },
  {
    id: 'abx-33',
    name: 'Tab. Metrogyl 400mg',
    brand: 'Metrogyl',
    composition: 'Metronidazole 400mg',
    type: 'Tablet',
    strength: '400mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-1-1 (TID - Thrice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['metrogyl 400', 'metronidazole', 'j.b. chemicals']
  },
  {
    id: 'abx-34',
    name: 'Inj. Metrogyl IV 100ml (Metronidazole 500mg)',
    brand: 'Metrogyl IV',
    composition: 'Metronidazole 500mg / 100ml Infusion',
    type: 'IV Fluid',
    strength: '500mg/100ml',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-1-1 (TID - Thrice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '3 Days',
    keywords: ['metrogyl iv', 'metrogyl bottle', 'iv antibiotic', 'anaerobic infection', 'appendix']
  },
  {
    id: 'abx-35',
    name: 'Cap. Doxy-1 L-DR (Doxycycline + Lactic Acid Bacillus)',
    brand: 'Doxy-1 L-DR',
    composition: 'Doxycycline 100mg + Lactic Acid Bacillus 5 Billion Spores',
    type: 'Capsule',
    strength: '100mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '7 Days',
    keywords: ['doxycycline', 'doxy 1', 'microdox', 'scrub typhus', 'malaria', 'acne', 'chlamydia']
  },
  {
    id: 'abx-36',
    name: 'Cap. Dalacin C 300mg (Clindamycin)',
    brand: 'Dalacin C',
    composition: 'Clindamycin Hydrochloride 300mg',
    type: 'Capsule',
    strength: '300mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-1-1 (TID - Thrice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['dalacin c', 'clindamycin 300', 'pfizer', 'dental infection', 'bone infection']
  },
  {
    id: 'abx-37',
    name: 'Inj. Dalacin C 600mg (Clindamycin IV)',
    brand: 'Dalacin C Inj',
    composition: 'Clindamycin Phosphate 600mg / 4ml',
    type: 'Injection',
    strength: '600mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-1-1 (TID - Thrice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '5 Days',
    keywords: ['clindamycin inj', 'dalacin inj', 'deep abscess', 'ortho infection']
  },
  {
    id: 'abx-38',
    name: 'Inj. Mikacin 500mg (Amikacin IV/IM)',
    brand: 'Mikacin',
    composition: 'Amikacin Sulfate 500mg / 2ml',
    type: 'Injection',
    strength: '500mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '5 Days',
    keywords: ['mikacin 500', 'amikacin', 'aristo', 'gram negative', 'uti', 'sepsis']
  },
  {
    id: 'abx-39',
    name: 'Inj. Mikacin 250mg',
    brand: 'Mikacin 250',
    composition: 'Amikacin Sulfate 250mg / 2ml',
    type: 'Injection',
    strength: '250mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '5 Days',
    keywords: ['mikacin 250', 'amikacin 250']
  },
  {
    id: 'abx-40',
    name: 'Inj. Genticyn 80mg (Gentamicin)',
    brand: 'Genticyn',
    composition: 'Gentamicin Sulfate 80mg / 2ml',
    type: 'Injection',
    strength: '80mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '3 Days',
    keywords: ['gentamicin', 'genticyn', 'abbott']
  },
  {
    id: 'abx-41',
    name: 'Inj. Pipzo 4.5g (Piperacillin + Tazobactam)',
    brand: 'Pipzo',
    composition: 'Piperacillin Sodium 4000mg + Tazobactam Sodium 500mg',
    type: 'Injection',
    strength: '4.5g',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-1-1 (TID - Thrice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '7 Days',
    keywords: ['pipzo 4.5', 'tazact', 'piptaz', 'icu antibiotic', 'ventilator pneumonia', 'sepsis']
  },
  {
    id: 'abx-42',
    name: 'Inj. Meronem 1g (Meropenem IV)',
    brand: 'Meronem',
    composition: 'Meropenem Trihydrate 1000mg',
    type: 'Injection',
    strength: '1g',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-1-1 (TID - Thrice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '7 Days',
    keywords: ['meronem', 'meropenem 1g', 'meromac', 'carbapenem', 'severe sepsis', 'pfizer']
  },
  {
    id: 'abx-43',
    name: 'Inj. Meronem 500mg',
    brand: 'Meronem 500',
    composition: 'Meropenem 500mg',
    type: 'Injection',
    strength: '500mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-1-1 (TID - Thrice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '7 Days',
    keywords: ['meropenem 500', 'meromac 500']
  },
  {
    id: 'abx-44',
    name: 'Inj. Magnex 1.5g (Cefoperazone + Sulbactam)',
    brand: 'Magnex',
    composition: 'Cefoperazone 1000mg + Sulbactam 500mg',
    type: 'Injection',
    strength: '1.5g',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '5 Days',
    keywords: ['magnex 1.5', 'cefoperazone sulbactam', 'sulbacin', 'pfizer']
  },
  {
    id: 'abx-45',
    name: 'Tab. Linid 600mg (Linezolid)',
    brand: 'Linid',
    composition: 'Linezolid 600mg',
    type: 'Tablet',
    strength: '600mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '7 Days',
    keywords: ['linid 600', 'linezolid', 'lizomac', 'mrsa', 'vrsa', 'severe skin infection']
  },
  {
    id: 'abx-46',
    name: 'Inj. Linid IV 300ml (Linezolid 600mg)',
    brand: 'Linid IV',
    composition: 'Linezolid 600mg / 300ml Infusion',
    type: 'IV Fluid',
    strength: '600mg/300ml',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '7 Days',
    keywords: ['linezolid iv', 'linid bottle', 'mrsa infusion']
  },
  {
    id: 'abx-47',
    name: 'Tab. Martifur 100mg (Nitrofurantoin SR)',
    brand: 'Martifur',
    composition: 'Nitrofurantoin Sustained Release 100mg',
    type: 'Tablet',
    strength: '100mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '7 Days',
    keywords: ['nitrofurantoin', 'martifur', 'furadantin', 'uti tablet', 'peshab me jalan']
  },
  {
    id: 'abx-48',
    name: 'Tab. Forcan 150mg (Fluconazole)',
    brand: 'Forcan',
    composition: 'Fluconazole 150mg',
    type: 'Tablet',
    strength: '150mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '1 Day (Stat/Weekly)',
    keywords: ['fluconazole 150', 'forcan', 'zocon', 'fungal infection', 'daadh', 'khujli', 'candida']
  },
  {
    id: 'abx-49',
    name: 'Cap. Canditral 200mg (Itraconazole)',
    brand: 'Canditral',
    composition: 'Itraconazole 200mg Pellets',
    type: 'Capsule',
    strength: '200mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '14 Days',
    keywords: ['itraconazole 200', 'canditral', 'itaspor', 'fungal infection', 'ringworm', 'tinea']
  },
  {
    id: 'abx-50',
    name: 'Tab. Fluvir 75mg (Oseltamivir)',
    brand: 'Fluvir',
    composition: 'Oseltamivir Phosphate 75mg',
    type: 'Tablet',
    strength: '75mg',
    category: 'Antibiotics & Antimicrobials',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['fluvir', 'oseltamivir', 'tamiflu', 'swine flu', 'h1n1', 'influenza antiviral']
  },

  // =========================================================================
  // 2. ANALGESICS, ANTIPYRETICS & ANTI-INFLAMMATORIES (दर्द, बुखार व सूजन रोधी)
  // =========================================================================
  {
    id: 'pain-01',
    name: 'Tab. Dolo 650mg (Paracetamol)',
    brand: 'Dolo 650',
    composition: 'Paracetamol 650mg',
    type: 'Tablet',
    strength: '650mg',
    category: 'Pain, Fever & Anti-inflammatory',
    defaultFrequency: 'SOS (As Needed)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '3 Days',
    keywords: ['dolo 650', 'paracetamol', 'fever', 'bukhar', 'dard', 'bodyache', 'micro labs', 'crocin']
  },
  {
    id: 'pain-02',
    name: 'Tab. Crocin 500mg (Paracetamol)',
    brand: 'Crocin',
    composition: 'Paracetamol 500mg',
    type: 'Tablet',
    strength: '500mg',
    category: 'Pain, Fever & Anti-inflammatory',
    defaultFrequency: 'SOS (As Needed)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '3 Days',
    keywords: ['crocin 500', 'paracetamol 500', 'calpol 500', 'bukhar ki goli', 'gsk']
  },
  {
    id: 'pain-03',
    name: 'Tab. Calpol 650mg',
    brand: 'Calpol 650',
    composition: 'Paracetamol 650mg',
    type: 'Tablet',
    strength: '650mg',
    category: 'Pain, Fever & Anti-inflammatory',
    defaultFrequency: 'SOS (As Needed)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '3 Days',
    keywords: ['calpol 650', 'paracetamol 650', 'bukhar', 'gsk']
  },
  {
    id: 'pain-04',
    name: 'Syp. Calpol 250mg/5ml (Paracetamol)',
    brand: 'Calpol Syp',
    composition: 'Paracetamol 250mg / 5ml',
    type: 'Syrup',
    strength: '250mg/5ml',
    category: 'Pain, Fever & Anti-inflammatory',
    defaultFrequency: 'SOS (As Needed)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '3 Days',
    keywords: ['calpol syrup', 'bachho ka bukhar', 'paracetamol syrup', 'dolo syrup']
  },
  {
    id: 'pain-05',
    name: 'Inj. Paracip IV 100ml (Paracetamol 1000mg)',
    brand: 'Paracip IV',
    composition: 'Paracetamol 1000mg / 100ml Infusion',
    type: 'IV Fluid',
    strength: '1g/100ml',
    category: 'Pain, Fever & Anti-inflammatory',
    defaultFrequency: 'SOS (As Needed)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '1 Day',
    keywords: ['paracetamol iv', 'paracip iv', 'perfalgan', 'high fever inj', 'tez bukhar']
  },
  {
    id: 'pain-06',
    name: 'Tab. Zerodol-P (Aceclofenac + Paracetamol)',
    brand: 'Zerodol-P',
    composition: 'Aceclofenac 100mg + Paracetamol 325mg',
    type: 'Tablet',
    strength: '425mg',
    category: 'Pain, Fever & Anti-inflammatory',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['zerodol p', 'aceclofenac paracetamol', 'ipca', 'dard', 'body pain', 'joint pain']
  },
  {
    id: 'pain-07',
    name: 'Tab. Zerodol-SP (Aceclofenac + Paracetamol + Serratiopeptidase)',
    brand: 'Zerodol-SP',
    composition: 'Aceclofenac 100mg + Paracetamol 325mg + Serratiopeptidase 15mg',
    type: 'Tablet',
    strength: '440mg',
    category: 'Pain, Fever & Anti-inflammatory',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['zerodol sp', 'sujan dard', 'swelling pain', 'signoflam', 'post op pain', 'chot dard']
  },
  {
    id: 'pain-08',
    name: 'Tab. Zerodol-TH 4 (Aceclofenac + Thiocolchicoside)',
    brand: 'Zerodol-TH 4',
    composition: 'Aceclofenac 100mg + Thiocolchicoside 4mg',
    type: 'Tablet',
    strength: '104mg',
    category: 'Pain, Fever & Anti-inflammatory',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['zerodol th', 'kamar dard', 'back pain', 'muscle spasm', 'neck pain', 'muscle relaxant']
  },
  {
    id: 'pain-09',
    name: 'Tab. Combiflam (Ibuprofen + Paracetamol)',
    brand: 'Combiflam',
    composition: 'Ibuprofen 400mg + Paracetamol 325mg',
    type: 'Tablet',
    strength: '725mg',
    category: 'Pain, Fever & Anti-inflammatory',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '3 Days',
    keywords: ['combiflam', 'ibuprofen paracetamol', 'sanofi', 'headache', 'dant dard', 'toothache']
  },
  {
    id: 'pain-10',
    name: 'Inj. Dynapar AQ 1ml (Diclofenac 75mg)',
    brand: 'Dynapar AQ',
    composition: 'Diclofenac Sodium 75mg / 1ml',
    type: 'Injection',
    strength: '75mg/1ml',
    category: 'Pain, Fever & Anti-inflammatory',
    defaultFrequency: 'SOS (As Needed)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '1 Day',
    keywords: ['dynapar aq', 'voveran inj', 'diclofenac inj', 'tez dard ka injection', 'kidney stone pain']
  },
  {
    id: 'pain-11',
    name: 'Tab. Voveran 50mg (Diclofenac Sodium)',
    brand: 'Voveran',
    composition: 'Diclofenac Sodium 50mg',
    type: 'Tablet',
    strength: '50mg',
    category: 'Pain, Fever & Anti-inflammatory',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '3 Days',
    keywords: ['voveran 50', 'diclofenac 50', 'novartis', 'gathiya', 'arthritis pain']
  },
  {
    id: 'pain-12',
    name: 'Tab. Voveran-SR 100mg',
    brand: 'Voveran-SR',
    composition: 'Diclofenac Sodium Sustained Release 100mg',
    type: 'Tablet',
    strength: '100mg',
    category: 'Pain, Fever & Anti-inflammatory',
    defaultFrequency: '0-0-1 (HS - Night Only)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['voveran sr', 'diclofenac 100', 'chronic pain']
  },
  {
    id: 'pain-13',
    name: 'Tab. Meftal-Spas (Dicyclomine + Mefenamic Acid)',
    brand: 'Meftal-Spas',
    composition: 'Dicyclomine Hydrochloride 10mg + Mefenamic Acid 250mg',
    type: 'Tablet',
    strength: '260mg',
    category: 'Pain, Fever & Anti-inflammatory',
    defaultFrequency: 'SOS (As Needed)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '3 Days',
    keywords: ['meftal spas', 'pet dard', 'stomach cramp', 'periods pain', 'spasm', 'blue cross']
  },
  {
    id: 'pain-14',
    name: 'Tab. Drotin-M (Drotaverine + Mefenamic Acid)',
    brand: 'Drotin-M',
    composition: 'Drotaverine Hydrochloride 80mg + Mefenamic Acid 250mg',
    type: 'Tablet',
    strength: '330mg',
    category: 'Pain, Fever & Anti-inflammatory',
    defaultFrequency: 'SOS (As Needed)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '3 Days',
    keywords: ['drotin m', 'drotaverine', 'spasmodic pain', 'colic pain', 'pathri dard']
  },
  {
    id: 'pain-15',
    name: 'Inj. Drotin 2ml (Drotaverine 40mg)',
    brand: 'Drotin Inj',
    composition: 'Drotaverine Hydrochloride 40mg / 2ml',
    type: 'Injection',
    strength: '40mg/2ml',
    category: 'Pain, Fever & Anti-inflammatory',
    defaultFrequency: 'SOS (As Needed)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '1 Day',
    keywords: ['drotin inj', 'pet marod', 'colic injection', 'labor spasm']
  },
  {
    id: 'pain-16',
    name: 'Tab. Ultracet (Tramadol + Paracetamol)',
    brand: 'Ultracet',
    composition: 'Tramadol Hydrochloride 37.5mg + Paracetamol 325mg',
    type: 'Tablet',
    strength: '362.5mg',
    category: 'Pain, Fever & Anti-inflammatory',
    defaultFrequency: 'SOS (As Needed)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '3 Days',
    keywords: ['ultracet', 'tramadol paracetamol', 'severe pain', 'fracture pain', 'post surgery']
  },
  {
    id: 'pain-17',
    name: 'Inj. Tramazac 2ml (Tramadol 100mg IV/IM)',
    brand: 'Tramazac Inj',
    composition: 'Tramadol Hydrochloride 100mg / 2ml',
    type: 'Injection',
    strength: '100mg/2ml',
    category: 'Pain, Fever & Anti-inflammatory',
    defaultFrequency: 'SOS (As Needed)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '1 Day',
    keywords: ['tramazac', 'tramadol inj', 'severe emergency pain', 'trauma pain', 'cadila']
  },
  {
    id: 'pain-18',
    name: 'Tab. Ketorol-DT 10mg (Ketorolac Tromethamine)',
    brand: 'Ketorol-DT',
    composition: 'Ketorolac Tromethamine 10mg Dispersible',
    type: 'Tablet',
    strength: '10mg',
    category: 'Pain, Fever & Anti-inflammatory',
    defaultFrequency: 'SOS (As Needed)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '3 Days',
    keywords: ['ketorol dt', 'ketorolac', 'dant dard goli', 'toothache relief', 'dr reddy']
  },
  {
    id: 'pain-19',
    name: 'Tab. Nucoxia 90mg (Etoricoxib)',
    brand: 'Nucoxia 90',
    composition: 'Etoricoxib 90mg',
    type: 'Tablet',
    strength: '90mg',
    category: 'Pain, Fever & Anti-inflammatory',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['nucoxia 90', 'etoricoxib', 'etoshine', 'gout pain', 'joint swelling', 'zydus']
  },
  {
    id: 'pain-20',
    name: 'Tab. Myoril 4mg (Thiocolchicoside)',
    brand: 'Myoril',
    composition: 'Thiocolchicoside 4mg',
    type: 'Capsule',
    strength: '4mg',
    category: 'Pain, Fever & Anti-inflammatory',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['myoril', 'thiocolchicoside', 'nas khichna', 'muscle stiffness', 'sanofi']
  },

  // =========================================================================
  // 3. GASTROENTEROLOGY, PPIs, ANTACIDS & ANTIEMETICS (गैस, एसिडिटी, उल्टी)
  // =========================================================================
  {
    id: 'gas-01',
    name: 'Tab. Pan-D (Pantoprazole + Domperidone SR)',
    brand: 'Pan-D',
    composition: 'Pantoprazole Sodium 40mg + Domperidone 30mg SR',
    type: 'Capsule',
    strength: '70mg',
    category: 'Gastroenterology, Antacids & PPI',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'Empty Stomach (खाली पेट)',
    defaultDuration: '14 Days',
    keywords: ['pan d', 'pantoprazole domperidone', 'alkem', 'gas ki goli', 'acidity', 'ulti gas', 'heartburn']
  },
  {
    id: 'gas-02',
    name: 'Tab. Pan 40 (Pantoprazole 40mg)',
    brand: 'Pan 40',
    composition: 'Pantoprazole Sodium 40mg',
    type: 'Tablet',
    strength: '40mg',
    category: 'Gastroenterology, Antacids & PPI',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'Empty Stomach (खाली पेट)',
    defaultDuration: '14 Days',
    keywords: ['pan 40', 'pantoprazole 40', 'alkem', 'gas', 'acid reflux', 'gerd']
  },
  {
    id: 'gas-03',
    name: 'Tab. Pantocid-DSR',
    brand: 'Pantocid-DSR',
    composition: 'Pantoprazole 40mg + Domperidone 30mg Sustained Release',
    type: 'Capsule',
    strength: '70mg',
    category: 'Gastroenterology, Antacids & PPI',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'Empty Stomach (खाली पेट)',
    defaultDuration: '14 Days',
    keywords: ['pantocid dsr', 'pantoprazole domperidone sr', 'sun pharma', 'seena jalan']
  },
  {
    id: 'gas-04',
    name: 'Inj. Pantocid IV 40mg (Pantoprazole IV)',
    brand: 'Pantocid Inj',
    composition: 'Pantoprazole Sodium 40mg Vials',
    type: 'Injection',
    strength: '40mg',
    category: 'Gastroenterology, Antacids & PPI',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'Empty Stomach (खाली पेट)',
    defaultDuration: '3 Days',
    keywords: ['pantocid inj', 'pantoprazole iv', 'pan inj', 'gas ka injection', 'ipd ppi']
  },
  {
    id: 'gas-05',
    name: 'Tab. Omez 20mg (Omeprazole)',
    brand: 'Omez',
    composition: 'Omeprazole 20mg',
    type: 'Capsule',
    strength: '20mg',
    category: 'Gastroenterology, Antacids & PPI',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'Empty Stomach (खाली पेट)',
    defaultDuration: '14 Days',
    keywords: ['omez 20', 'omeprazole', 'dr reddy', 'gas capsule']
  },
  {
    id: 'gas-06',
    name: 'Cap. Omez-D (Omeprazole + Domperidone)',
    brand: 'Omez-D',
    composition: 'Omeprazole 20mg + Domperidone 10mg',
    type: 'Capsule',
    strength: '30mg',
    category: 'Gastroenterology, Antacids & PPI',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'Empty Stomach (खाली पेट)',
    defaultDuration: '14 Days',
    keywords: ['omez d', 'omeprazole domperidone', 'gas ulti capsule']
  },
  {
    id: 'gas-07',
    name: 'Tab. Razo 20mg (Rabeprazole)',
    brand: 'Razo 20',
    composition: 'Rabeprazole Sodium 20mg',
    type: 'Tablet',
    strength: '20mg',
    category: 'Gastroenterology, Antacids & PPI',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'Empty Stomach (खाली पेट)',
    defaultDuration: '14 Days',
    keywords: ['razo 20', 'rabeprazole', 'dr reddy', 'parit', 'fast ppi']
  },
  {
    id: 'gas-08',
    name: 'Cap. Razo-D (Rabeprazole + Domperidone SR)',
    brand: 'Razo-D',
    composition: 'Rabeprazole 20mg + Domperidone 30mg SR',
    type: 'Capsule',
    strength: '50mg',
    category: 'Gastroenterology, Antacids & PPI',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'Empty Stomach (खाली पेट)',
    defaultDuration: '14 Days',
    keywords: ['razo d', 'rabeprazole domperidone', 'rabicip d']
  },
  {
    id: 'gas-09',
    name: 'Tab. Rantac 150mg (Ranitidine)',
    brand: 'Rantac 150',
    composition: 'Ranitidine Hydrochloride 150mg',
    type: 'Tablet',
    strength: '150mg',
    category: 'Gastroenterology, Antacids & PPI',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'Before Food (खाने से पहले)',
    defaultDuration: '7 Days',
    keywords: ['rantac 150', 'ranitidine', 'zinetac', 'j.b. chemicals', 'purani gas']
  },
  {
    id: 'gas-10',
    name: 'Inj. Rantac 2ml (Ranitidine 50mg IV/IM)',
    brand: 'Rantac Inj',
    composition: 'Ranitidine 50mg / 2ml',
    type: 'Injection',
    strength: '50mg/2ml',
    category: 'Gastroenterology, Antacids & PPI',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'Before Food (खाने से पहले)',
    defaultDuration: '2 Days',
    keywords: ['rantac inj', 'ranitidine inj', 'emergency gas']
  },
  {
    id: 'gas-11',
    name: 'Tab. Ondem 4mg (Ondansetron MD)',
    brand: 'Ondem 4',
    composition: 'Ondansetron Hydrochloride 4mg Mouth Dissolving',
    type: 'Tablet',
    strength: '4mg',
    category: 'Gastroenterology, Antacids & PPI',
    defaultFrequency: 'SOS (As Needed)',
    defaultFoodRelation: 'Before Food (खाने से पहले)',
    defaultDuration: '3 Days',
    keywords: ['ondem 4', 'ondansetron', 'emeset', 'vomikind', 'alkem', 'ulti ki goli', 'vomiting tablet']
  },
  {
    id: 'gas-12',
    name: 'Inj. Ondem 2ml (Ondansetron 4mg IV/IM)',
    brand: 'Ondem Inj',
    composition: 'Ondansetron Hydrochloride 4mg / 2ml',
    type: 'Injection',
    strength: '4mg/2ml',
    category: 'Gastroenterology, Antacids & PPI',
    defaultFrequency: 'SOS (As Needed)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '1 Day',
    keywords: ['ondem inj', 'emeset inj', 'ulti ka injection', 'vomiting injection', 'nausea']
  },
  {
    id: 'gas-13',
    name: 'Inj. Perinorm 2ml (Metoclopramide 10mg)',
    brand: 'Perinorm Inj',
    composition: 'Metoclopramide Hydrochloride 10mg / 2ml',
    type: 'Injection',
    strength: '10mg/2ml',
    category: 'Gastroenterology, Antacids & PPI',
    defaultFrequency: 'SOS (As Needed)',
    defaultFoodRelation: 'Before Food (खाने से पहले)',
    defaultDuration: '1 Day',
    keywords: ['perinorm inj', 'metoclopramide', 'ipca', 'hiccups', 'hichki', 'gut motility']
  },
  {
    id: 'gas-14',
    name: 'Syp. Gelusil MPS 200ml (Antacid Liquid)',
    brand: 'Gelusil MPS',
    composition: 'Aluminium Hydroxide + Magnesium Hydroxide + Simethicone',
    type: 'Syrup',
    strength: '200ml',
    category: 'Gastroenterology, Antacids & PPI',
    defaultFrequency: '1-1-1 (TID - Thrice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '7 Days',
    keywords: ['gelusil', 'digene', 'antacid syrup', 'seena jalan syrup', 'pfizer']
  },
  {
    id: 'gas-15',
    name: 'Syp. Sucrafil-O 200ml (Sucralfate + Oxetacaine)',
    brand: 'Sucrafil-O',
    composition: 'Sucralfate 1000mg + Oxetacaine 20mg / 10ml',
    type: 'Syrup',
    strength: '200ml',
    category: 'Gastroenterology, Antacids & PPI',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'Empty Stomach (खाली पेट)',
    defaultDuration: '14 Days',
    keywords: ['sucrafil o', 'sucralfate', 'pet me chhale', 'stomach ulcer', 'fourrts']
  },
  {
    id: 'gas-16',
    name: 'Syp. Duphalac 150ml (Lactulose)',
    brand: 'Duphalac',
    composition: 'Lactulose Solution 10g / 15ml',
    type: 'Syrup',
    strength: '150ml',
    category: 'Gastroenterology, Antacids & PPI',
    defaultFrequency: '0-0-1 (HS - Night Only)',
    defaultFoodRelation: 'At Bedtime (सोते समय)',
    defaultDuration: '7 Days',
    keywords: ['duphalac', 'lactulose', 'abbott', 'kabz', 'constipation syrup', 'pait saaf']
  },
  {
    id: 'gas-17',
    name: 'Tab. Dulcolax 5mg (Bisacodyl)',
    brand: 'Dulcolax',
    composition: 'Bisacodyl 5mg',
    type: 'Tablet',
    strength: '5mg',
    category: 'Gastroenterology, Antacids & PPI',
    defaultFrequency: '0-0-1 (HS - Night Only)',
    defaultFoodRelation: 'At Bedtime (सोते समय)',
    defaultDuration: '2 Days',
    keywords: ['dulcolax', 'bisacodyl', 'sanofi', 'kabz ki goli', 'laxative tablet']
  },
  {
    id: 'gas-18',
    name: 'Sachet ORS Electral 21.8g',
    brand: 'Electral ORS',
    composition: 'WHO Formula Oral Rehydration Salts',
    type: 'Sachet',
    strength: '21.8g',
    category: 'Gastroenterology, Antacids & PPI',
    defaultFrequency: 'SOS (As Needed)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '3 Days',
    keywords: ['ors', 'electral', 'fDC', 'dehydration', 'dast me paani', 'namak cheeni ghol']
  },
  {
    id: 'gas-19',
    name: 'Cap. Enterogermina 5ml (Bacillus Clausii Spores)',
    brand: 'Enterogermina',
    composition: 'Bacillus Clausii 2 Billion Spores',
    type: 'Respule',
    strength: '2 Billion',
    category: 'Gastroenterology, Antacids & PPI',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['enterogermina', 'probiotic', 'sanofi', 'antibiotic diarrhea', 'bachho ka pait']
  },

  // =========================================================================
  // 4. CARDIOVASCULAR, HYPERTENSION & STATINS (हृदय रोग, ब्लड प्रेशर व कोलेस्ट्रॉल)
  // =========================================================================
  {
    id: 'cvs-01',
    name: 'Tab. Telma 40mg (Telmisartan)',
    brand: 'Telma 40',
    composition: 'Telmisartan 40mg',
    type: 'Tablet',
    strength: '40mg',
    category: 'Cardiovascular & Blood Pressure',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['telma 40', 'telmisartan', 'glenmark', 'bp ki goli', 'high blood pressure', 'hypertension']
  },
  {
    id: 'cvs-02',
    name: 'Tab. Telma-AM (Telmisartan + Amlodipine)',
    brand: 'Telma-AM',
    composition: 'Telmisartan 40mg + Amlodipine 5mg',
    type: 'Tablet',
    strength: '45mg',
    category: 'Cardiovascular & Blood Pressure',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['telma am', 'telmisartan amlodipine', 'glenmark', 'combined bp tablet']
  },
  {
    id: 'cvs-03',
    name: 'Tab. Telma-H (Telmisartan + Hydrochlorothiazide)',
    brand: 'Telma-H',
    composition: 'Telmisartan 40mg + Hydrochlorothiazide 12.5mg',
    type: 'Tablet',
    strength: '52.5mg',
    category: 'Cardiovascular & Blood Pressure',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['telma h', 'telmisartan diuretic', 'high bp']
  },
  {
    id: 'cvs-04',
    name: 'Tab. Amlong 5mg (Amlodipine)',
    brand: 'Amlong',
    composition: 'Amlodipine Besylate 5mg',
    type: 'Tablet',
    strength: '5mg',
    category: 'Cardiovascular & Blood Pressure',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['amlong 5', 'amlodipine', 'stamlo', 'micro labs', 'calcium channel blocker']
  },
  {
    id: 'cvs-05',
    name: 'Tab. Amlong 2.5mg',
    brand: 'Amlong 2.5',
    composition: 'Amlodipine 2.5mg',
    type: 'Tablet',
    strength: '2.5mg',
    category: 'Cardiovascular & Blood Pressure',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['amlong 2.5', 'amlodipine low dose']
  },
  {
    id: 'cvs-06',
    name: 'Tab. Betaloc 25mg (Metoprolol Tartrate)',
    brand: 'Betaloc 25',
    composition: 'Metoprolol Tartrate 25mg',
    type: 'Tablet',
    strength: '25mg',
    category: 'Cardiovascular & Blood Pressure',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['betaloc', 'metoprolol', 'met-xl', 'astrazeneca', 'tachycardia', 'heart rate']
  },
  {
    id: 'cvs-07',
    name: 'Tab. Met-XL 50mg (Metoprolol Succinate ER)',
    brand: 'Met-XL 50',
    composition: 'Metoprolol Succinate Extended Release 50mg',
    type: 'Tablet',
    strength: '50mg',
    category: 'Cardiovascular & Blood Pressure',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['met xl 50', 'metoprolol er', 'ajanta', 'beta blocker']
  },
  {
    id: 'cvs-08',
    name: 'Tab. Concor 5mg (Bisoprolol)',
    brand: 'Concor 5',
    composition: 'Bisoprolol Fumarate 5mg',
    type: 'Tablet',
    strength: '5mg',
    category: 'Cardiovascular & Blood Pressure',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['concor 5', 'bisoprolol', 'merck', 'heart failure', 'angina']
  },
  {
    id: 'cvs-09',
    name: 'Tab. Ecosprin 75mg (Aspirin)',
    brand: 'Ecosprin 75',
    composition: 'Aspirin Gastro-resistant 75mg',
    type: 'Tablet',
    strength: '75mg',
    category: 'Cardiovascular & Blood Pressure',
    defaultFrequency: '0-0-1 (HS - Night Only)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['ecosprin 75', 'aspirin', 'khoon patla', 'blood thinner', 'usv', 'heart attack prevention']
  },
  {
    id: 'cvs-10',
    name: 'Tab. Ecosprin 150mg',
    brand: 'Ecosprin 150',
    composition: 'Aspirin 150mg',
    type: 'Tablet',
    strength: '150mg',
    category: 'Cardiovascular & Blood Pressure',
    defaultFrequency: '0-0-1 (HS - Night Only)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['ecosprin 150', 'aspirin 150', 'blood thinner']
  },
  {
    id: 'cvs-11',
    name: 'Tab. Clopilet 75mg (Clopidogrel)',
    brand: 'Clopilet 75',
    composition: 'Clopidogrel Bisulfate 75mg',
    type: 'Tablet',
    strength: '75mg',
    category: 'Cardiovascular & Blood Pressure',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['clopilet', 'clopidogrel', 'deplatt', 'sun pharma', 'stent protection', 'antiplatelet']
  },
  {
    id: 'cvs-12',
    name: 'Tab. Ecosprin-AV 75/20 (Aspirin + Atorvastatin)',
    brand: 'Ecosprin-AV',
    composition: 'Aspirin 75mg + Atorvastatin 20mg',
    type: 'Capsule',
    strength: '95mg',
    category: 'Cardiovascular & Blood Pressure',
    defaultFrequency: '0-0-1 (HS - Night Only)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['ecosprin av', 'aspirin atorvastatin', 'heart protection', 'cholesterol']
  },
  {
    id: 'cvs-13',
    name: 'Tab. Atorva 10mg (Atorvastatin)',
    brand: 'Atorva 10',
    composition: 'Atorvastatin Calcium 10mg',
    type: 'Tablet',
    strength: '10mg',
    category: 'Cardiovascular & Blood Pressure',
    defaultFrequency: '0-0-1 (HS - Night Only)',
    defaultFoodRelation: 'At Bedtime (सोते समय)',
    defaultDuration: '30 Days',
    keywords: ['atorva 10', 'atorvastatin', 'storvas', 'zydus', 'cholesterol ki goli', 'lipid profile']
  },
  {
    id: 'cvs-14',
    name: 'Tab. Atorva 20mg',
    brand: 'Atorva 20',
    composition: 'Atorvastatin 20mg',
    type: 'Tablet',
    strength: '20mg',
    category: 'Cardiovascular & Blood Pressure',
    defaultFrequency: '0-0-1 (HS - Night Only)',
    defaultFoodRelation: 'At Bedtime (सोते समय)',
    defaultDuration: '30 Days',
    keywords: ['atorva 20', 'atorvastatin 20', 'cholesterol control']
  },
  {
    id: 'cvs-15',
    name: 'Tab. Rosuvas 10mg (Rosuvastatin)',
    brand: 'Rosuvas 10',
    composition: 'Rosuvastatin Calcium 10mg',
    type: 'Tablet',
    strength: '10mg',
    category: 'Cardiovascular & Blood Pressure',
    defaultFrequency: '0-0-1 (HS - Night Only)',
    defaultFoodRelation: 'At Bedtime (सोते समय)',
    defaultDuration: '30 Days',
    keywords: ['rosuvas 10', 'rosuvastatin', 'ranbaxy', 'sun pharma', 'potent statin']
  },
  {
    id: 'cvs-16',
    name: 'Tab. Sorbitrate 5mg (Isosorbide Dinitrate)',
    brand: 'Sorbitrate 5',
    composition: 'Isosorbide Dinitrate 5mg Sublingual',
    type: 'Tablet',
    strength: '5mg',
    category: 'Cardiovascular & Blood Pressure',
    defaultFrequency: 'STAT (Emergency Once)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '1 Day',
    keywords: ['sorbitrate', 'jeebh ke niche', 'sublingual heart attack', 'chest pain emergency', 'abbott']
  },
  {
    id: 'cvs-17',
    name: 'Inj. Clexane 40mg (Enoxaparin Pre-filled Syringe)',
    brand: 'Clexane 40',
    composition: 'Enoxaparin Sodium 40mg / 0.4ml Subcutaneous',
    type: 'Injection',
    strength: '40mg',
    category: 'Cardiovascular & Blood Pressure',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '5 Days',
    keywords: ['clexane', 'enoxaparin', 'lovenox', 'dvt prevention', 'lmwh inj', 'sanofi']
  },

  // =========================================================================
  // 5. DIABETOLOGY & ENDOCRINOLOGY (मधुमेह, शुगर व थायराइड)
  // =========================================================================
  {
    id: 'dia-01',
    name: 'Tab. Glycomet 500mg (Metformin)',
    brand: 'Glycomet 500',
    composition: 'Metformin Hydrochloride 500mg',
    type: 'Tablet',
    strength: '500mg',
    category: 'Diabetes & Endocrinology',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '30 Days',
    keywords: ['glycomet 500', 'metformin', 'sugar ki goli', 'diabetes tablet', 'usv']
  },
  {
    id: 'dia-02',
    name: 'Tab. Glycomet-SR 1000mg (Metformin SR)',
    brand: 'Glycomet-SR 1g',
    composition: 'Metformin Sustained Release 1000mg',
    type: 'Tablet',
    strength: '1000mg',
    category: 'Diabetes & Endocrinology',
    defaultFrequency: '0-0-1 (HS - Night Only)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['glycomet 1000', 'metformin 1000 sr', 'sugar control']
  },
  {
    id: 'dia-03',
    name: 'Tab. Glycomet-GP 1 (Glimepiride 1mg + Metformin 500mg)',
    brand: 'Glycomet-GP 1',
    composition: 'Glimepiride 1mg + Metformin 500mg SR',
    type: 'Tablet',
    strength: '501mg',
    category: 'Diabetes & Endocrinology',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'Before Food (खाने से पहले)',
    defaultDuration: '30 Days',
    keywords: ['glycomet gp 1', 'glimepiride metformin', 'sugar combo', 'usv']
  },
  {
    id: 'dia-04',
    name: 'Tab. Glycomet-GP 2 (Glimepiride 2mg + Metformin 500mg)',
    brand: 'Glycomet-GP 2',
    composition: 'Glimepiride 2mg + Metformin 500mg SR',
    type: 'Tablet',
    strength: '502mg',
    category: 'Diabetes & Endocrinology',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'Before Food (खाने से पहले)',
    defaultDuration: '30 Days',
    keywords: ['glycomet gp 2', 'glimepiride 2 metformin', 'usv diabetes']
  },
  {
    id: 'dia-05',
    name: 'Tab. Amaryl 1mg (Glimepiride)',
    brand: 'Amaryl 1',
    composition: 'Glimepiride 1mg',
    type: 'Tablet',
    strength: '1mg',
    category: 'Diabetes & Endocrinology',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'Before Food (खाने से पहले)',
    defaultDuration: '30 Days',
    keywords: ['amaryl', 'glimepiride', 'zoryl', 'sanofi', 'pancreas stimulation']
  },
  {
    id: 'dia-06',
    name: 'Tab. Januvia 100mg (Sitagliptin)',
    brand: 'Januvia 100',
    composition: 'Sitagliptin Phosphate 100mg',
    type: 'Tablet',
    strength: '100mg',
    category: 'Diabetes & Endocrinology',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['januvia', 'sitagliptin', 'msd', 'dpp4 inhibitor', 'sugar tablet']
  },
  {
    id: 'dia-07',
    name: 'Tab. Janumet 50/500 (Sitagliptin + Metformin)',
    brand: 'Janumet',
    composition: 'Sitagliptin 50mg + Metformin 500mg',
    type: 'Tablet',
    strength: '550mg',
    category: 'Diabetes & Endocrinology',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '30 Days',
    keywords: ['janumet', 'sitagliptin metformin', 'msd']
  },
  {
    id: 'dia-08',
    name: 'Tab. Galvus 50mg (Vildagliptin)',
    brand: 'Galvus 50',
    composition: 'Vildagliptin 50mg',
    type: 'Tablet',
    strength: '50mg',
    category: 'Diabetes & Endocrinology',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['galvus', 'vildagliptin', 'novartis', 'dpp4']
  },
  {
    id: 'dia-09',
    name: 'Tab. Galvus Met 50/500',
    brand: 'Galvus Met',
    composition: 'Vildagliptin 50mg + Metformin 500mg',
    type: 'Tablet',
    strength: '550mg',
    category: 'Diabetes & Endocrinology',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '30 Days',
    keywords: ['galvus met', 'vildagliptin metformin', 'novartis']
  },
  {
    id: 'dia-10',
    name: 'Tab. Forxiga 10mg (Dapagliflozin)',
    brand: 'Forxiga 10',
    composition: 'Dapagliflozin 10mg',
    type: 'Tablet',
    strength: '10mg',
    category: 'Diabetes & Endocrinology',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['forxiga', 'dapagliflozin', 'oxra', 'sglt2', 'sugar kidney protection', 'astrazeneca']
  },
  {
    id: 'dia-11',
    name: 'Tab. Jardiance 25mg (Empagliflozin)',
    brand: 'Jardiance 25',
    composition: 'Empagliflozin 25mg',
    type: 'Tablet',
    strength: '25mg',
    category: 'Diabetes & Endocrinology',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['jardiance', 'empagliflozin', 'boehringer', 'heart diabetes protection']
  },
  {
    id: 'dia-12',
    name: 'Inj. Human Actrapid 100 IU/ml (Regular Insulin)',
    brand: 'Actrapid',
    composition: 'Soluble Human Insulin 100 IU / ml (10ml Vial)',
    type: 'Injection',
    strength: '100 IU/ml',
    category: 'Diabetes & Endocrinology',
    defaultFrequency: '1-1-1 (TID - Thrice Daily)',
    defaultFoodRelation: 'Before Food (खाने से पहले)',
    defaultDuration: '30 Days',
    keywords: ['actrapid', 'regular insulin', 'novo nordisk', 'sliding scale', 'sugar injection']
  },
  {
    id: 'dia-13',
    name: 'Inj. Lantus Solostar 100 IU/ml (Insulin Glargine Pen)',
    brand: 'Lantus',
    composition: 'Insulin Glargine 100 IU / ml Long Acting (3ml Cartridge/Pen)',
    type: 'Injection',
    strength: '100 IU/ml',
    category: 'Diabetes & Endocrinology',
    defaultFrequency: '0-0-1 (HS - Night Only)',
    defaultFoodRelation: 'At Bedtime (सोते समय)',
    defaultDuration: '30 Days',
    keywords: ['lantus', 'insulin glargine', 'sanofi', '24 hour insulin', 'sugar pen']
  },
  {
    id: 'dia-14',
    name: 'Inj. Human Mixtard 30/70 (100 IU/ml)',
    brand: 'Mixtard 30',
    composition: 'Biphasic Isophane Insulin (30% soluble, 70% isophane) 100 IU/ml',
    type: 'Injection',
    strength: '100 IU/ml',
    category: 'Diabetes & Endocrinology',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'Before Food (खाने से पहले)',
    defaultDuration: '30 Days',
    keywords: ['mixtard 30', 'novo nordisk', 'insulin mixture']
  },
  {
    id: 'dia-15',
    name: 'Tab. Thyronorm 50mcg (Levothyroxine)',
    brand: 'Thyronorm 50',
    composition: 'Thyroxine Sodium 50 mcg',
    type: 'Tablet',
    strength: '50mcg',
    category: 'Diabetes & Endocrinology',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'Empty Stomach (खाली पेट)',
    defaultDuration: '60 Days',
    keywords: ['thyronorm 50', 'eltroxin', 'thyroid ki goli', 'hypothyroidism', 'abbott']
  },
  {
    id: 'dia-16',
    name: 'Tab. Thyronorm 100mcg',
    brand: 'Thyronorm 100',
    composition: 'Thyroxine Sodium 100 mcg',
    type: 'Tablet',
    strength: '100mcg',
    category: 'Diabetes & Endocrinology',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'Empty Stomach (खाली पेट)',
    defaultDuration: '60 Days',
    keywords: ['thyronorm 100', 'thyroxine 100', 'abbott thyroid']
  },

  // =========================================================================
  // 6. RESPIRATORY, PULMONOLOGY & ALLERGY (साँस, दमा, खांसी व एलर्जी)
  // =========================================================================
  {
    id: 'resp-01',
    name: 'Tab. Montair-LC (Montelukast + Levocetirizine)',
    brand: 'Montair-LC',
    composition: 'Montelukast 10mg + Levocetirizine Hydrochloride 5mg',
    type: 'Tablet',
    strength: '15mg',
    category: 'Respiratory & Allergy',
    defaultFrequency: '0-0-1 (HS - Night Only)',
    defaultFoodRelation: 'At Bedtime (सोते समय)',
    defaultDuration: '10 Days',
    keywords: ['montair lc', 'montelukast levocetirizine', 'telekast l', 'cipla', 'khansi allergy', 'sardi jukham', 'asthma']
  },
  {
    id: 'resp-02',
    name: 'Tab. Cetzine 10mg (Cetirizine)',
    brand: 'Cetzine 10',
    composition: 'Cetirizine Hydrochloride 10mg',
    type: 'Tablet',
    strength: '10mg',
    category: 'Respiratory & Allergy',
    defaultFrequency: '0-0-1 (HS - Night Only)',
    defaultFoodRelation: 'At Bedtime (सोते समय)',
    defaultDuration: '5 Days',
    keywords: ['cetzine', 'cetirizine', 'alerid', 'dr reddy', 'chheenk', 'sneezing', 'khujli', 'allergy']
  },
  {
    id: 'resp-03',
    name: 'Tab. Allegra 120mg (Fexofenadine)',
    brand: 'Allegra 120',
    composition: 'Fexofenadine Hydrochloride 120mg',
    type: 'Tablet',
    strength: '120mg',
    category: 'Respiratory & Allergy',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '7 Days',
    keywords: ['allegra 120', 'fexofenadine', 'sanofi', 'non drowsy allergy', 'itchy eyes']
  },
  {
    id: 'resp-04',
    name: 'Tab. Allegra 180mg',
    brand: 'Allegra 180',
    composition: 'Fexofenadine 180mg',
    type: 'Tablet',
    strength: '180mg',
    category: 'Respiratory & Allergy',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '7 Days',
    keywords: ['allegra 180', 'urticaria', 'skin allergy']
  },
  {
    id: 'resp-05',
    name: 'Inj. Avil 2ml (Pheniramine Maleate 45.5mg)',
    brand: 'Avil Inj',
    composition: 'Pheniramine Maleate 22.75mg / ml (2ml Ampoule)',
    type: 'Injection',
    strength: '45.5mg/2ml',
    category: 'Respiratory & Allergy',
    defaultFrequency: 'SOS (As Needed)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '1 Day',
    keywords: ['avil inj', 'pheniramine', 'allergy injection', 'reaction injection', 'sanofi']
  },
  {
    id: 'resp-06',
    name: 'Inhaler Asthalin 100mcg (Salbutamol 200 MDI)',
    brand: 'Asthalin Inhaler',
    composition: 'Salbutamol 100mcg per actuation (200 Doses)',
    type: 'Inhaler',
    strength: '100mcg',
    category: 'Respiratory & Allergy',
    defaultFrequency: 'SOS (As Needed)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '30 Days',
    keywords: ['asthalin inhaler', 'salbutamol', 'cipla', 'dama pump', 'asthma pump', 'saans fulna']
  },
  {
    id: 'resp-07',
    name: 'Respules Duolin 2.5ml (Levosalbutamol + Ipratropium)',
    brand: 'Duolin Respules',
    composition: 'Levosalbutamol 1.25mg + Ipratropium Bromide 500mcg / 2.5ml',
    type: 'Respule',
    strength: '2.5ml',
    category: 'Respiratory & Allergy',
    defaultFrequency: '1-1-1 (TID - Thrice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '5 Days',
    keywords: ['duolin respules', 'nebulizer medicine', 'saans ki bhaap', 'copd', 'cipla']
  },
  {
    id: 'resp-08',
    name: 'Respules Budecort 0.5mg (Budesonide Nebuliser)',
    brand: 'Budecort Respules',
    composition: 'Budesonide 0.5mg / 2ml',
    type: 'Respule',
    strength: '0.5mg/2ml',
    category: 'Respiratory & Allergy',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '5 Days',
    keywords: ['budecort respules', 'budesonide nebulizer', 'cipla', 'chest inflammation']
  },
  {
    id: 'resp-09',
    name: 'Inhaler Foracort 200 (Formoterol + Budesonide)',
    brand: 'Foracort 200',
    composition: 'Formoterol 6mcg + Budesonide 200mcg (120 MDI)',
    type: 'Inhaler',
    strength: '206mcg',
    category: 'Respiratory & Allergy',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['foracort 200', 'formoterol budesonide', 'cipla', 'asthma maintenance', 'rotacaps']
  },
  {
    id: 'resp-10',
    name: 'Tab. Deriphyllin Retard 150mg',
    brand: 'Deriphyllin',
    composition: 'Theophylline 115mg + Etofylline 35mg',
    type: 'Tablet',
    strength: '150mg',
    category: 'Respiratory & Allergy',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '7 Days',
    keywords: ['deriphyllin', 'theophylline etofylline', 'zydus', 'bronchodilator', 'saans ki goli']
  },
  {
    id: 'resp-11',
    name: 'Inj. Deriphyllin 2ml (Theophylline + Etofylline)',
    brand: 'Deriphyllin Inj',
    composition: 'Theophylline 50.6mg + Etofylline 169.4mg / 2ml',
    type: 'Injection',
    strength: '220mg/2ml',
    category: 'Respiratory & Allergy',
    defaultFrequency: 'SOS (As Needed)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '1 Day',
    keywords: ['deriphyllin inj', 'saans fulna injection', 'emergency asthma']
  },
  {
    id: 'resp-12',
    name: 'Syp. Ascoril-LS 100ml (Levosalbutamol + Ambroxol + Guaiphenesin)',
    brand: 'Ascoril-LS',
    composition: 'Levosalbutamol 1mg + Ambroxol 30mg + Guaiphenesin 50mg / 5ml',
    type: 'Syrup',
    strength: '100ml',
    category: 'Respiratory & Allergy',
    defaultFrequency: '1-1-1 (TID - Thrice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['ascoril ls', 'cough syrup', 'balgam wali khansi', 'wet cough', 'glenmark']
  },
  {
    id: 'resp-13',
    name: 'Syp. Alex 100ml (Dextromethorphan + Chlorpheniramine)',
    brand: 'Alex',
    composition: 'Dextromethorphan 10mg + Chlorpheniramine 2mg + Phenylephrine 5mg / 5ml',
    type: 'Syrup',
    strength: '100ml',
    category: 'Respiratory & Allergy',
    defaultFrequency: '1-1-1 (TID - Thrice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['alex syrup', 'dry cough syrup', 'sukhi khansi', 'glenmark', 'cough relief']
  },
  {
    id: 'resp-14',
    name: 'Tab. Mucinac 600mg (N-Acetylcysteine Effervescent)',
    brand: 'Mucinac 600',
    composition: 'Acetylcysteine 600mg Effervescent Tablet',
    type: 'Tablet',
    strength: '600mg',
    category: 'Respiratory & Allergy',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '7 Days',
    keywords: ['mucinac 600', 'acetylcysteine', 'nac', 'balgam pighlana', 'mucolytic', 'cipla']
  },

  // =========================================================================
  // 7. EMERGENCY, CRITICAL CARE & STEROIDS (आपातकालीन, इंटेंसिव केयर व स्टेरॉयड)
  // =========================================================================
  {
    id: 'emg-01',
    name: 'Inj. Adrenaline 1:1000 (1mg/1ml Ampoule)',
    brand: 'Adrenaline',
    composition: 'Epinephrine 1mg / 1ml',
    type: 'Injection',
    strength: '1mg/ml',
    category: 'Emergency & Critical Care',
    defaultFrequency: 'STAT (Emergency Once)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '1 Day',
    keywords: ['adrenaline', 'epinephrine', 'cardiac arrest', 'anaphylaxis shock', 'cpr drug', 'emergency ampoule']
  },
  {
    id: 'emg-02',
    name: 'Inj. Atropine Sulfate 0.6mg/1ml',
    brand: 'Atropine',
    composition: 'Atropine Sulfate 0.6mg / 1ml',
    type: 'Injection',
    strength: '0.6mg/ml',
    category: 'Emergency & Critical Care',
    defaultFrequency: 'STAT (Emergency Once)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '1 Day',
    keywords: ['atropine', 'bradycardia', 'dhadkan kam hona', 'organophosphate poisoning', 'cpr']
  },
  {
    id: 'emg-03',
    name: 'Inj. Norad 2ml (Noradrenaline 4mg/2ml)',
    brand: 'Norad',
    composition: 'Norepinephrine Bitartrate 4mg / 2ml IV Infusion',
    type: 'Injection',
    strength: '4mg/2ml',
    category: 'Emergency & Critical Care',
    defaultFrequency: 'STAT (Emergency Once)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: 'Continuous Infusion',
    keywords: ['norad', 'noradrenaline', 'norepinephrine', 'septic shock', 'low bp emergency', 'vasopressor']
  },
  {
    id: 'emg-04',
    name: 'Inj. Dexona 2ml (Dexamethasone 8mg)',
    brand: 'Dexona',
    composition: 'Dexamethasone Sodium Phosphate 4mg/ml (2ml Vial)',
    type: 'Injection',
    strength: '8mg/2ml',
    category: 'Emergency & Critical Care',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '3 Days',
    keywords: ['dexona', 'dexamethasone', 'steroid inj', 'zydus', 'allergy reaction', 'covid steroid', 'sujan']
  },
  {
    id: 'emg-05',
    name: 'Inj. Efcorlin 100mg (Hydrocortisone)',
    brand: 'Efcorlin',
    composition: 'Hydrocortisone Sodium Succinate 100mg Vial',
    type: 'Injection',
    strength: '100mg',
    category: 'Emergency & Critical Care',
    defaultFrequency: 'STAT (Emergency Once)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '2 Days',
    keywords: ['efcorlin', 'hydrocortisone', 'gsk', 'asthma attack', 'shock steroid', 'emergency']
  },
  {
    id: 'emg-06',
    name: 'Tab. Wysolone 10mg (Prednisolone)',
    brand: 'Wysolone 10',
    composition: 'Prednisolone 10mg',
    type: 'Tablet',
    strength: '10mg',
    category: 'Emergency & Critical Care',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['wysolone 10', 'prednisolone', 'omnacortil', 'pfizer', 'steroid tablet', 'swelling']
  },
  {
    id: 'emg-07',
    name: 'Tab. Omnacortil 20mg (Prednisolone Dispersible)',
    brand: 'Omnacortil 20',
    composition: 'Prednisolone 20mg',
    type: 'Tablet',
    strength: '20mg',
    category: 'Emergency & Critical Care',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['omnacortil 20', 'prednisolone', 'macleods', 'severe asthma']
  },
  {
    id: 'emg-08',
    name: 'Inj. Trapic 5ml (Tranexamic Acid 500mg IV)',
    brand: 'Trapic Inj',
    composition: 'Tranexamic Acid 500mg / 5ml Ampoule',
    type: 'Injection',
    strength: '500mg/5ml',
    category: 'Emergency & Critical Care',
    defaultFrequency: '1-1-1 (TID - Thrice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '3 Days',
    keywords: ['trapic inj', 'tranexamic acid', 'pause inj', 'khoon rokna', 'bleeding stop', 'sun pharma']
  },
  {
    id: 'emg-09',
    name: 'Tab. Trapic 500mg',
    brand: 'Trapic 500',
    composition: 'Tranexamic Acid 500mg',
    type: 'Tablet',
    strength: '500mg',
    category: 'Emergency & Critical Care',
    defaultFrequency: '1-1-1 (TID - Thrice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '5 Days',
    keywords: ['trapic 500', 'tranexamic tablet', 'heavy periods', 'nose bleeding']
  },
  {
    id: 'emg-10',
    name: 'Inj. Ethasyl 2ml (Ethamsylate 250mg)',
    brand: 'Ethasyl',
    composition: 'Ethamsylate 250mg / 2ml',
    type: 'Injection',
    strength: '250mg/2ml',
    category: 'Emergency & Critical Care',
    defaultFrequency: '1-1-1 (TID - Thrice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '3 Days',
    keywords: ['ethasyl', 'ethamsylate', 'dicynene', 'capillary bleeding']
  },
  {
    id: 'emg-11',
    name: 'Inj. Calcium Gluconate 10% 10ml',
    brand: 'Calcium Gluconate',
    composition: 'Calcium Gluconate 10% w/v (10ml Ampoule)',
    type: 'Injection',
    strength: '10%',
    category: 'Emergency & Critical Care',
    defaultFrequency: 'STAT (Emergency Once)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '1 Day',
    keywords: ['calcium gluconate', 'hypocalcemia', 'tetany', 'hyperkalemia antidote']
  },
  {
    id: 'emg-12',
    name: 'Inj. Soda Bicarb 7.5% 25ml (Sodium Bicarbonate)',
    brand: 'Soda Bicarb',
    composition: 'Sodium Bicarbonate 7.5% w/v (25ml Ampoule)',
    type: 'Injection',
    strength: '7.5%',
    category: 'Emergency & Critical Care',
    defaultFrequency: 'STAT (Emergency Once)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '1 Day',
    keywords: ['soda bicarb', 'sodium bicarbonate inj', 'metabolic acidosis', 'cpr']
  },
  {
    id: 'emg-13',
    name: 'Infusion Mannitol 20% 350ml (Osmotic Diuretic)',
    brand: 'Mannitol 20%',
    composition: 'Mannitol 20% w/v (350ml Glass/Plastic Bottle)',
    type: 'IV Fluid',
    strength: '20% 350ml',
    category: 'Emergency & Critical Care',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '2 Days',
    keywords: ['mannitol', 'brain edema', 'dimag me sujan', 'head injury', 'intracranial pressure']
  },

  // =========================================================================
  // 8. IV FLUIDS & CLINICAL INFUSIONS (आईवी फ्लुइड्स व ग्लूकोज़ बोतल)
  // =========================================================================
  {
    id: 'iv-01',
    name: 'IV Fluid RL 500ml (Ringer Lactate)',
    brand: 'RL 500ml',
    composition: 'Sodium Chloride + Sodium Lactate + Potassium Chloride + Calcium Chloride',
    type: 'IV Fluid',
    strength: '500ml',
    category: 'IV Fluids & Infusions',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '1 Day',
    keywords: ['rl bottle', 'ringer lactate', 'iv drip', 'operation bottle', 'trauma fluid', 'dast me drip']
  },
  {
    id: 'iv-02',
    name: 'IV Fluid NS 500ml (Normal Saline 0.9%)',
    brand: 'NS 500ml',
    composition: 'Sodium Chloride 0.9% w/v in Water for Injection',
    type: 'IV Fluid',
    strength: '500ml',
    category: 'IV Fluids & Infusions',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '1 Day',
    keywords: ['ns bottle', 'normal saline', '0.9 nacl', 'iv wash', 'drip', 'hydration']
  },
  {
    id: 'iv-03',
    name: 'IV Fluid DNS 500ml (Dextrose Normal Saline)',
    brand: 'DNS 500ml',
    composition: 'Dextrose 5% + Sodium Chloride 0.9%',
    type: 'IV Fluid',
    strength: '500ml',
    category: 'IV Fluids & Infusions',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '1 Day',
    keywords: ['dns bottle', 'glucose saline', 'kamzori me bottle', 'iv fluid']
  },
  {
    id: 'iv-04',
    name: 'IV Fluid D5W 500ml (Dextrose 5%)',
    brand: 'D5W 500ml',
    composition: 'Dextrose Anhydrous 5% w/v',
    type: 'IV Fluid',
    strength: '500ml',
    category: 'IV Fluids & Infusions',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '1 Day',
    keywords: ['d5 bottle', 'dextrose 5', 'sugar drip', 'glucose bottle']
  },
  {
    id: 'iv-05',
    name: 'IV Fluid D25 100ml (Dextrose 25% Hypoglycemia)',
    brand: 'D25 100ml',
    composition: 'Dextrose 25% w/v Concentrated',
    type: 'IV Fluid',
    strength: '100ml',
    category: 'IV Fluids & Infusions',
    defaultFrequency: 'STAT (Emergency Once)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '1 Day',
    keywords: ['d25 bottle', 'sugar low emergency', 'hypoglycemia drip', 'dextrose 25']
  },
  {
    id: 'iv-06',
    name: 'Inj. KCl 15% 10ml (Potassium Chloride)',
    brand: 'KCl Inj',
    composition: 'Potassium Chloride 150mg/ml (10ml Ampoule)',
    type: 'Injection',
    strength: '15%',
    category: 'IV Fluids & Infusions',
    defaultFrequency: 'STAT (Emergency Once)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '1 Day',
    keywords: ['kcl inj', 'potassium inj', 'hypokalemia', 'drip me milane wala potassium']
  },

  // =========================================================================
  // 9. NEPHROLOGY, UROLOGY & DIURETICS (किडनी, पेशाब व पथरी)
  // =========================================================================
  {
    id: 'uro-01',
    name: 'Tab. Lasix 40mg (Furosemide)',
    brand: 'Lasix 40',
    composition: 'Furosemide 40mg',
    type: 'Tablet',
    strength: '40mg',
    category: 'Nephrology & Urology',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '7 Days',
    keywords: ['lasix 40', 'furosemide', 'sanofi', 'peshab badhana', 'sujan utarna', 'diuretic', 'edema']
  },
  {
    id: 'uro-02',
    name: 'Inj. Lasix 2ml (Furosemide 20mg IV/IM)',
    brand: 'Lasix Inj',
    composition: 'Furosemide 20mg / 2ml Ampoule',
    type: 'Injection',
    strength: '20mg/2ml',
    category: 'Nephrology & Urology',
    defaultFrequency: 'SOS (As Needed)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '1 Day',
    keywords: ['lasix inj', 'furosemide inj', 'pulmonary edema', 'peshab rukna injection']
  },
  {
    id: 'uro-03',
    name: 'Tab. Dytor 10mg (Torsemide)',
    brand: 'Dytor 10',
    composition: 'Torsemide 10mg',
    type: 'Tablet',
    strength: '10mg',
    category: 'Nephrology & Urology',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '14 Days',
    keywords: ['dytor 10', 'torsemide', 'cipla', 'kidney swelling', 'diuretic']
  },
  {
    id: 'uro-04',
    name: 'Tab. Dytor Plus 10 (Torsemide 10mg + Spironolactone 50mg)',
    brand: 'Dytor Plus',
    composition: 'Torsemide 10mg + Spironolactone 50mg',
    type: 'Tablet',
    strength: '60mg',
    category: 'Nephrology & Urology',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '14 Days',
    keywords: ['dytor plus', 'torsemide spironolactone', 'cipla', 'ascites', 'liver swelling']
  },
  {
    id: 'uro-05',
    name: 'Tab. Urimax 0.4mg (Tamsulosin MR)',
    brand: 'Urimax 0.4',
    composition: 'Tamsulosin Hydrochloride 0.4mg Modified Release',
    type: 'Capsule',
    strength: '0.4mg',
    category: 'Nephrology & Urology',
    defaultFrequency: '0-0-1 (HS - Night Only)',
    defaultFoodRelation: 'At Bedtime (सोते समय)',
    defaultDuration: '30 Days',
    keywords: ['urimax', 'tamsulosin', 'prostate', 'cipla', 'peshab rukna', 'bph', 'pathri nikalna']
  },
  {
    id: 'uro-06',
    name: 'Tab. Urimax-D (Tamsulosin + Dutasteride)',
    brand: 'Urimax-D',
    composition: 'Tamsulosin 0.4mg + Dutasteride 0.5mg',
    type: 'Capsule',
    strength: '0.9mg',
    category: 'Nephrology & Urology',
    defaultFrequency: '0-0-1 (HS - Night Only)',
    defaultFoodRelation: 'At Bedtime (सोते समय)',
    defaultDuration: '30 Days',
    keywords: ['urimax d', 'tamsulosin dutasteride', 'prostate badhna']
  },
  {
    id: 'uro-07',
    name: 'Syp. Citralka 100ml (Disodium Hydrogen Citrate)',
    brand: 'Citralka',
    composition: 'Disodium Hydrogen Citrate 1.4g / 5ml',
    type: 'Syrup',
    strength: '100ml',
    category: 'Nephrology & Urology',
    defaultFrequency: '1-1-1 (TID - Thrice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '7 Days',
    keywords: ['citralka', 'urine alkalizer', 'peshab me jalan', 'burning micturition', 'pathri syrup', 'pfizer']
  },
  {
    id: 'uro-08',
    name: 'Syp. Potrate-MB6 200ml (Potassium Magnesium Citrate + Vit B6)',
    brand: 'Potrate-MB6',
    composition: 'Potassium Citrate 1100mg + Magnesium Citrate 375mg + Pyridoxine 20mg / 5ml',
    type: 'Syrup',
    strength: '200ml',
    category: 'Nephrology & Urology',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['potrate mb6', 'kidney stone syrup', 'pathri gholne ka syrup', 'intolence']
  },
  {
    id: 'uro-09',
    name: 'Tab. Feburic 40mg (Febuxostat)',
    brand: 'Feburic 40',
    composition: 'Febuxostat 40mg',
    type: 'Tablet',
    strength: '40mg',
    category: 'Nephrology & Urology',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['feburic', 'febuxostat', 'zurig', 'uric acid ki goli', 'gout']
  },

  // =========================================================================
  // 10. NEUROLOGY, PSYCHIATRY & SEDATIVES (तंत्रिका तंत्र, नींद, मिर्गी व अवसाद)
  // =========================================================================
  {
    id: 'neuro-01',
    name: 'Tab. Gabapin-NT (Gabapentin 400mg + Nortriptyline 10mg)',
    brand: 'Gabapin-NT',
    composition: 'Gabapentin 400mg + Nortriptyline 10mg',
    type: 'Tablet',
    strength: '410mg',
    category: 'Neurology & Psychiatry',
    defaultFrequency: '0-0-1 (HS - Night Only)',
    defaultFoodRelation: 'At Bedtime (सोते समय)',
    defaultDuration: '30 Days',
    keywords: ['gabapin nt', 'gabapentin', 'naso ka dard', 'nerve pain', 'intact labs', 'sciatica']
  },
  {
    id: 'neuro-02',
    name: 'Tab. Pregeb-OD 75mg (Pregabalin Sustained Release)',
    brand: 'Pregeb-OD',
    composition: 'Pregabalin Sustained Release 75mg',
    type: 'Tablet',
    strength: '75mg',
    category: 'Neurology & Psychiatry',
    defaultFrequency: '0-0-1 (HS - Night Only)',
    defaultFoodRelation: 'At Bedtime (सोते समय)',
    defaultDuration: '30 Days',
    keywords: ['pregeb od', 'pregabalin', 'torrent', 'diabetic neuropathy', 'jhanjhanahat']
  },
  {
    id: 'neuro-03',
    name: 'Tab. Pregeb-M OD (Pregabalin + Methylcobalamin)',
    brand: 'Pregeb-M OD',
    composition: 'Pregabalin 75mg + Methylcobalamin 1500mcg',
    type: 'Tablet',
    strength: '75mg',
    category: 'Neurology & Psychiatry',
    defaultFrequency: '0-0-1 (HS - Night Only)',
    defaultFoodRelation: 'At Bedtime (सोते समय)',
    defaultDuration: '30 Days',
    keywords: ['pregeb m', 'pregabalin b12', 'nerve weakness', 'torrent']
  },
  {
    id: 'neuro-04',
    name: 'Tab. Zapiz 0.5mg (Clonazepam MD)',
    brand: 'Zapiz 0.5',
    composition: 'Clonazepam 0.5mg Mouth Dissolving',
    type: 'Tablet',
    strength: '0.5mg',
    category: 'Neurology & Psychiatry',
    defaultFrequency: '0-0-1 (HS - Night Only)',
    defaultFoodRelation: 'At Bedtime (सोते समय)',
    defaultDuration: '7 Days',
    keywords: ['zapiz 0.5', 'clonazepam', 'clona', 'intact', 'neend ki goli', 'anxiety', 'ghabrahat']
  },
  {
    id: 'neuro-05',
    name: 'Tab. Alprax 0.25mg (Alprazolam)',
    brand: 'Alprax 0.25',
    composition: 'Alprazolam 0.25mg',
    type: 'Tablet',
    strength: '0.25mg',
    category: 'Neurology & Psychiatry',
    defaultFrequency: '0-0-1 (HS - Night Only)',
    defaultFoodRelation: 'At Bedtime (सोते समय)',
    defaultDuration: '5 Days',
    keywords: ['alprax 0.25', 'alprazolam', 'torrent', 'bechaini', 'panic']
  },
  {
    id: 'neuro-06',
    name: 'Tab. Nexito 10mg (Escitalopram)',
    brand: 'Nexito 10',
    composition: 'Escitalopram Oxalate 10mg',
    type: 'Tablet',
    strength: '10mg',
    category: 'Neurology & Psychiatry',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['nexito 10', 'escitalopram', 'sun pharma', 'depression', 'stress', 'udasi']
  },
  {
    id: 'neuro-07',
    name: 'Tab. Levipil 500mg (Levetiracetam)',
    brand: 'Levipil 500',
    composition: 'Levetiracetam 500mg',
    type: 'Tablet',
    strength: '500mg',
    category: 'Neurology & Psychiatry',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['levipil 500', 'levetiracetam', 'sun pharma', 'mirgi ki goli', 'seizure', 'fits']
  },
  {
    id: 'neuro-08',
    name: 'Inj. Levipil IV 5ml (Levetiracetam 500mg)',
    brand: 'Levipil Inj',
    composition: 'Levetiracetam 500mg / 5ml Vial',
    type: 'Injection',
    strength: '500mg/5ml',
    category: 'Neurology & Psychiatry',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '3 Days',
    keywords: ['levipil inj', 'seizures iv', 'mirgi injection']
  },
  {
    id: 'neuro-09',
    name: 'Inj. Calmpose 2ml (Diazepam 10mg IV/IM)',
    brand: 'Calmpose Inj',
    composition: 'Diazepam 10mg / 2ml Ampoule',
    type: 'Injection',
    strength: '10mg/2ml',
    category: 'Neurology & Psychiatry',
    defaultFrequency: 'STAT (Emergency Once)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '1 Day',
    keywords: ['calmpose inj', 'valium', 'diazepam', 'fits emergency', 'sedation']
  },
  {
    id: 'neuro-10',
    name: 'Tab. Vertin 16mg (Betahistine)',
    brand: 'Vertin 16',
    composition: 'Betahistine Dihydrochloride 16mg',
    type: 'Tablet',
    strength: '16mg',
    category: 'Neurology & Psychiatry',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '10 Days',
    keywords: ['vertin 16', 'betahistine', 'abbott', 'chakkar aana', 'vertigo tablet', 'dizziness']
  },
  {
    id: 'neuro-11',
    name: 'Tab. Stugeron 25mg (Cinnarizine)',
    brand: 'Stugeron 25',
    composition: 'Cinnarizine 25mg',
    type: 'Tablet',
    strength: '25mg',
    category: 'Neurology & Psychiatry',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '10 Days',
    keywords: ['stugeron', 'cinnarizine', 'johnson', 'motion sickness', 'safarn me ulti chakkar']
  },
  {
    id: 'neuro-12',
    name: 'Tab. Ceham 500mg (Citicoline)',
    brand: 'Ceham 500',
    composition: 'Citicoline Sodium 500mg',
    type: 'Tablet',
    strength: '500mg',
    category: 'Neurology & Psychiatry',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['ceham 500', 'citicoline', 'stoline', 'brain stroke recovery', 'head injury']
  },

  // =========================================================================
  // 11. VITAMINS, MINERALS & HEMATINICS (विटामिन, आयरन, कैल्शियम व मिनरल्स)
  // =========================================================================
  {
    id: 'vit-01',
    name: 'Cap. Becosules (Vitamin B-Complex + C + Zinc)',
    brand: 'Becosules',
    composition: 'B-Complex (B1, B2, B6, B12, Niacinamide, Calcium Pantothenate) + Vitamin C',
    type: 'Capsule',
    strength: 'Standard B-Complex',
    category: 'Vitamins & Minerals',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '15 Days',
    keywords: ['becosules', 'b complex', 'chhale', 'muh ke chhale', 'mouth ulcer', 'pfizer', 'kamzori']
  },
  {
    id: 'vit-02',
    name: 'Tab. Neurobion Forte (Vit B12 + B6 + B1)',
    brand: 'Neurobion Forte',
    composition: 'Mecobalamin + Pyridoxine + Thiamine + Nicotinamide',
    type: 'Tablet',
    strength: 'Standard Forte',
    category: 'Vitamins & Minerals',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['neurobion forte', 'vitamin b12', 'procter gamble', 'naso ki takat', 'jhanjhanahat tablet']
  },
  {
    id: 'vit-03',
    name: 'Tab. Nurokind-OD (Methylcobalamin 1500mcg)',
    brand: 'Nurokind-OD',
    composition: 'Mecobalamin 1500 mcg Sublingual',
    type: 'Tablet',
    strength: '1500mcg',
    category: 'Vitamins & Minerals',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['nurokind od', 'methylcobalamin', 'mankind', 'b12 deficiency', 'khoon ki kami']
  },
  {
    id: 'vit-04',
    name: 'Inj. Neurobion Forte 2ml (B12 Inj IM)',
    brand: 'Neurobion Inj',
    composition: 'Mecobalamin 1000mcg + Pyridoxine 100mg + Nicotinamide 100mg / 2ml',
    type: 'Injection',
    strength: '2ml',
    category: 'Vitamins & Minerals',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: 'Alternate Days (5 Injections)',
    keywords: ['neurobion inj', 'b12 injection', 'takat ka injection', 'red injection']
  },
  {
    id: 'vit-05',
    name: 'Tab. Shelcal 500mg (Calcium + Vitamin D3)',
    brand: 'Shelcal 500',
    composition: 'Calcium Carbonate 1250mg (Eq to Elemental Calcium 500mg) + Vitamin D3 250 IU',
    type: 'Tablet',
    strength: '500mg',
    category: 'Vitamins & Minerals',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['shelcal 500', 'calcium tablet', 'torrent', 'haddiyo ki takat', 'bone weakness']
  },
  {
    id: 'vit-06',
    name: 'Sachet Calcirol 60,000 IU (Cholecalciferol Vit D3)',
    brand: 'Calcirol Sachet',
    composition: 'Cholecalciferol Granules 60,000 IU',
    type: 'Sachet',
    strength: '60000 IU',
    category: 'Vitamins & Minerals',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: 'Once Weekly (4 Weeks)',
    keywords: ['calcirol sachet', 'vitamin d3 sachet', 'd rise', 'cadila', 'doodh me peena', 'bone density']
  },
  {
    id: 'vit-07',
    name: 'Tab. Limcee 500mg (Vitamin C Chewable)',
    brand: 'Limcee',
    composition: 'Ascorbic Acid 500mg Chewable Orange Flavor',
    type: 'Tablet',
    strength: '500mg',
    category: 'Vitamins & Minerals',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '15 Days',
    keywords: ['limcee', 'vitamin c', 'celin', 'abbott', 'immunity booster', 'chewable']
  },
  {
    id: 'vit-08',
    name: 'Tab. Zincovit (Multivitamins + Multiminerals + Zinc)',
    brand: 'Zincovit',
    composition: 'Essential Vitamins + Minerals + Zinc + Grape Seed Extract',
    type: 'Tablet',
    strength: 'Standard Multivitamin',
    category: 'Vitamins & Minerals',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['zincovit', 'multivitamin tablet', 'apex', 'kamzori goli', 'supradyn', 'energy']
  },
  {
    id: 'vit-09',
    name: 'Tab. Orofer-XT (Ferrous Ascorbate + Folic Acid)',
    brand: 'Orofer-XT',
    composition: 'Elemental Iron 100mg (as Ferrous Ascorbate) + Folic Acid 1.5mg',
    type: 'Tablet',
    strength: '100mg',
    category: 'Vitamins & Minerals',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['orofer xt', 'iron tablet', 'emcure', 'anemia', 'khoon badhana', 'hemoglobin']
  },
  {
    id: 'vit-10',
    name: 'Inj. Orofer-S 100mg (Iron Sucrose 5ml IV)',
    brand: 'Orofer-S Inj',
    composition: 'Iron Sucrose 100mg / 5ml Ampoule',
    type: 'Injection',
    strength: '100mg/5ml',
    category: 'Vitamins & Minerals',
    defaultFrequency: 'STAT (Emergency Once)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: 'Alternate Days in 100ml NS',
    keywords: ['iron sucrose inj', 'orofer s', 'khoon chadhana alternative', 'severe anemia iv']
  },
  {
    id: 'vit-11',
    name: 'Tab. Folvite 5mg (Folic Acid)',
    brand: 'Folvite 5',
    composition: 'Folic Acid 5mg',
    type: 'Tablet',
    strength: '5mg',
    category: 'Vitamins & Minerals',
    defaultFrequency: '1-0-0 (OD - Morning)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '30 Days',
    keywords: ['folvite', 'folic acid', 'pfizer', 'pregnancy iron', 'garbhavastha']
  },

  // =========================================================================
  // 12. GYNECOLOGY, OBSTETRICS & HORMONES (महिला रोग, प्रसूति व हॉर्मोन)
  // =========================================================================
  {
    id: 'gyn-01',
    name: 'Cap. Susten 200mg (Natural Micronized Progesterone)',
    brand: 'Susten 200',
    composition: 'Natural Micronized Progesterone 200mg Softgel',
    type: 'Capsule',
    strength: '200mg',
    category: 'Gynecology & Obstetrics',
    defaultFrequency: '0-0-1 (HS - Night Only)',
    defaultFoodRelation: 'At Bedtime (सोते समय)',
    defaultDuration: '15 Days',
    keywords: ['susten 200', 'progesterone', 'sun pharma', 'pregnancy support', 'garbha suraksha']
  },
  {
    id: 'gyn-02',
    name: 'Tab. Duphaston 10mg (Dydrogesterone)',
    brand: 'Duphaston',
    composition: 'Dydrogesterone 10mg',
    type: 'Tablet',
    strength: '10mg',
    category: 'Gynecology & Obstetrics',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '14 Days',
    keywords: ['duphaston', 'dydrogesterone', 'abbott', 'miscarriage prevention', 'spotting']
  },
  {
    id: 'gyn-03',
    name: 'Tab. Regestrone 5mg (Norethisterone)',
    brand: 'Regestrone',
    composition: 'Norethisterone 5mg',
    type: 'Tablet',
    strength: '5mg',
    category: 'Gynecology & Obstetrics',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'After Food (खाने के बाद)',
    defaultDuration: '10 Days',
    keywords: ['regestrone 5', 'norethisterone', 'primolut n', 'periods delay', 'irregular bleeding']
  },
  {
    id: 'gyn-04',
    name: 'Inj. Pitocin 5 IU/ml (Oxytocin)',
    brand: 'Pitocin',
    composition: 'Oxytocin 5 IU / ml Ampoule',
    type: 'Injection',
    strength: '5 IU',
    category: 'Gynecology & Obstetrics',
    defaultFrequency: 'STAT (Emergency Once)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '1 Day',
    keywords: ['pitocin', 'oxytocin inj', 'labor pain induction', 'pph bleeding', 'delivery injection']
  },
  {
    id: 'gyn-05',
    name: 'Tab. Misoprost 200mcg (Misoprostol)',
    brand: 'Misoprost',
    composition: 'Misoprostol 200 mcg',
    type: 'Tablet',
    strength: '200mcg',
    category: 'Gynecology & Obstetrics',
    defaultFrequency: 'STAT (Emergency Once)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '1 Day',
    keywords: ['misoprost', 'misoprostol', 'cytotec', 'pph control', 'cervical ripening']
  },
  {
    id: 'gyn-06',
    name: 'Inj. Methergine 0.2mg/ml (Methylergometrine)',
    brand: 'Methergine',
    composition: 'Methylergometrine Maleate 0.2mg / ml Ampoule',
    type: 'Injection',
    strength: '0.2mg/ml',
    category: 'Gynecology & Obstetrics',
    defaultFrequency: 'SOS (As Needed)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '1 Day',
    keywords: ['methergine', 'methylergometrine', 'novartis', 'post delivery bleeding', 'uterus contraction']
  },

  // =========================================================================
  // 13. TOPICALS, EYE/EAR DROPS & ANTISEPTICS (मलहम, ड्राप्स व ड्रेसिंग)
  // =========================================================================
  {
    id: 'top-01',
    name: 'Oint. Betadine 5% 20g (Povidone Iodine)',
    brand: 'Betadine Ointment',
    composition: 'Povidone Iodine 5% w/w',
    type: 'Ointment',
    strength: '5% 20g',
    category: 'Topicals & Antiseptics',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '7 Days',
    keywords: ['betadine', 'povidone iodine', 'ciplacept', 'antiseptic cream', 'chot ki cream', 'wound dressing']
  },
  {
    id: 'top-02',
    name: 'Sol. Betadine 10% 100ml (Povidone Solution)',
    brand: 'Betadine Solution',
    composition: 'Povidone Iodine 10% w/v',
    type: 'Drops',
    strength: '10% 100ml',
    category: 'Topicals & Antiseptics',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '7 Days',
    keywords: ['betadine solution', 'operation wash', 'wound cleaning', 'lal dawa']
  },
  {
    id: 'top-03',
    name: 'Oint. T-Bact 2% 5g (Mupirocin)',
    brand: 'T-Bact',
    composition: 'Mupirocin 2% w/w',
    type: 'Ointment',
    strength: '2% 5g',
    category: 'Topicals & Antiseptics',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '5 Days',
    keywords: ['t bact', 'mupirocin', 'gsk', 'antibacterial ointment', 'phoda phunsi', 'boil']
  },
  {
    id: 'top-04',
    name: 'Cream Silverex Ionic 20g (Silver Sulfadiazine)',
    brand: 'Silverex',
    composition: 'Silver Sulfadiazine 1% w/w',
    type: 'Ointment',
    strength: '20g',
    category: 'Topicals & Antiseptics',
    defaultFrequency: '1-0-1 (BD - Twice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '7 Days',
    keywords: ['silverex', 'burn cream', 'jalne ki cream', 'silver sulfadiazine', 'burnol']
  },
  {
    id: 'top-05',
    name: 'Eye Drops Ciplox 10ml (Ciprofloxacin 0.3%)',
    brand: 'Ciplox Eye Drops',
    composition: 'Ciprofloxacin 0.3% w/v Sterile Drops',
    type: 'Drops',
    strength: '0.3% 10ml',
    category: 'Topicals & Antiseptics',
    defaultFrequency: '1-1-1-1 (QID - 4 Times)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '5 Days',
    keywords: ['ciplox drops', 'aankh ka drop', 'eye infection', 'kan ka drop', 'ear drops']
  },
  {
    id: 'top-06',
    name: 'Eye Drops Vigamox 5ml (Moxifloxacin 0.5%)',
    brand: 'Vigamox',
    composition: 'Moxifloxacin 0.5% w/v',
    type: 'Drops',
    strength: '0.5% 5ml',
    category: 'Topicals & Antiseptics',
    defaultFrequency: '1-1-1 (TID - Thrice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '5 Days',
    keywords: ['vigamox', 'moxifloxacin eye drop', 'alcon', 'conjunctivitis', 'aankh aana']
  },
  {
    id: 'top-07',
    name: 'Gel Volini 30g (Diclofenac + Linseed Oil)',
    brand: 'Volini',
    composition: 'Diclofenac Diethylamine 1.16% + Linseed Oil + Methyl Salicylate + Menthol',
    type: 'Ointment',
    strength: '30g',
    category: 'Topicals & Antiseptics',
    defaultFrequency: '1-1-1 (TID - Thrice Daily)',
    defaultFoodRelation: 'With Food (खाने के साथ)',
    defaultDuration: '7 Days',
    keywords: ['volini gel', 'pain balm', 'moov', 'dard ka gel', 'kamar dard gel', 'sun pharma']
  }
];

// ── Search & Filter Algorithms ──────────────────────────────────────────────

/**
 * Fast multi-attribute fuzzy search for clinical medicine formulary:
 * Matches brand name, generic composition, dosage type, and keywords
 */
export function searchMedicinesFormulary(query: string, maxResults: number = 8): MedicineFormularyItem[] {
  if (!query || !query.trim()) return [];

  const cleanQuery = query.toLowerCase().trim().replace(/^(tab\.?|inj\.?|syp\.?|cap\.?|iv\.?)\s+/i, '');
  const rawTerms = cleanQuery.split(/\s+/).filter(Boolean);

  const scored = MEDICINES_FORMULARY.map((med) => {
    let score = 0;
    const lowerName = med.name.toLowerCase();
    const lowerBrand = med.brand.toLowerCase();
    const lowerComp = med.composition.toLowerCase();
    const lowerCat = med.category.toLowerCase();

    // Exact or prefix match on brand name gets highest boost
    if (lowerBrand === cleanQuery) {
      score += 150;
    } else if (lowerBrand.startsWith(cleanQuery)) {
      score += 100;
    } else if (lowerName.includes(cleanQuery)) {
      score += 70;
    } else if (lowerComp.includes(cleanQuery)) {
      score += 50;
    }

    // Check individual search terms
    let allMatched = true;
    for (const term of rawTerms) {
      const matchInBrand = lowerBrand.includes(term);
      const matchInComp = lowerComp.includes(term);
      const matchInCat = lowerCat.includes(term);
      const matchInKeywords = med.keywords.some((k) => k.toLowerCase().includes(term));

      if (matchInBrand) {
        score += 30;
      } else if (matchInComp) {
        score += 25;
      } else if (matchInKeywords) {
        score += 20;
      } else if (matchInCat) {
        score += 10;
      } else {
        allMatched = false;
      }
    }

    // If every typed term matched somewhere in this medicine
    if (allMatched) {
      score += 40;
    }

    return { med, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((item) => item.med);
}

/**
 * Get distinct categories for filtering
 */
export function getMedicineCategories(): string[] {
  return Array.from(new Set(MEDICINES_FORMULARY.map((m) => m.category))).sort();
}
