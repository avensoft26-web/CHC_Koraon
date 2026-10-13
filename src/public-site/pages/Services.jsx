import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Clock, Check, Sparkles, Phone, UserCheck, 
  ArrowRight, Ambulance, Activity, Stethoscope, Bone, 
  Baby, Syringe, Pill, CheckCircle2, MapPin, ShieldCheck,
  FileText, HeartPulse, ChevronRight, AlertTriangle
} from 'lucide-react';

const Services = () => {
  const [selectedWingId, setSelectedWingId] = useState('emergency');

  // In-Depth Clinical Departments & Treatment Scope Data
  const clinicalWings = [
    {
      id: 'emergency',
      icon: <Activity size={22} color="#0A302A" />,
      title: '24/7 Emergency & Trauma Resuscitation',
      wingBadge: '24/7 Red-Zone Emergency Bay',
      wingBadgeColor: '#FEE2E2',
      wingBadgeText: '#991B1B',
      location: 'Ground Floor â€¢ Direct Ambulance Entrance',
      timing: '24 Hours / 7 Days Active (Always Open)',
      doctor: 'Emergency Medical Officer & Trauma Team',
      doctorDegree: 'MBBS, Critical Care Resuscitation Certified',
      image: './images/symptom-emergency.jpg',
      overview: 'Dedicated emergency department equipped for acute trauma resuscitation, cardiac stabilization, oxygen therapy, and zero-delay triage in Koraon.',
      procedures: [
        'Acute cardiac & chest pain emergency stabilization',
        'Accidental trauma wound debridement, suturing & sterile dressing',
        'Severe respiratory distress nebulization & high-flow oxygen delivery',
        'Pediatric fever convulsion triage & emergency stabilization',
        'Poisoning, acute allergic reactions & snake-bite emergency protocol'
      ],
      technology: [
        'Multipara Cardiac Monitors (ECG, SpO2, NIBP)',
        'Central Wall Oxygen Bay & Electric Suction Unit',
        'Emergency Resuscitation Crash-Cart with Defibrillator',
        'Dedicated 24/7 Ambulance Fleet with Oxygen Support'
      ],
      walkInNote: 'Immediate red-zone walk-in: No paperwork delay. Doctors attend immediately upon arrival.'
    },
    {
      id: 'medicine',
      icon: <Stethoscope size={22} color="#0A302A" />,
      title: 'General & Internal Medicine OPD',
      wingBadge: 'Senior Consultant OPD',
      wingBadgeColor: '#D1F8E3',
      wingBadgeText: '#0A302A',
      location: '1st Floor â€¢ OPD Wing A (Chamber 1)',
      timing: 'Mon - Sat: 10:00 AM - 05:00 PM',
      doctor: 'Dr. A. K. Chaudhary',
      doctorDegree: 'MBBS, MD (Internal Medicine)',
      image: './images/symptom-general-medicine.jpg',
      overview: 'Primary diagnostic wing for seasonal fevers, metabolic chronic disorders, cardiovascular hypertension management, and preventative adult healthcare.',
      procedures: [
        'Seasonal viral fever, Typhoid, Malaria & Dengue clinical care',
        'Diabetes Mellitus (Sugar) profiling, medication titration & insulin management',
        'Hypertension (High BP) screening & cardiovascular risk assessment',
        'Chronic gastrointestinal, liver & acid-peptic ulcer diagnosis',
        'Respiratory asthma, chronic bronchitis & seasonal allergy therapy'
      ],
      technology: [
        'Computerized 12-Lead Resting ECG Machine',
        'Digital Heavy-Duty Ultrasonic Nebulizer',
        'Rapid Point-of-Care Blood Glucometer',
        'Automated Blood Pressure & Vascular Profiling'
      ],
      walkInNote: 'Walk-in consultation slips available daily at ground floor reception desk from 09:30 AM.'
    },
    {
      id: 'orthopedics',
      icon: <Bone size={22} color="#0A302A" />,
      title: 'Orthopedics & Joint Clinic',
      wingBadge: 'Specialist Bone & Joint Wing',
      wingBadgeColor: '#E0F2FE',
      wingBadgeText: '#0369A1',
      location: 'Ground Floor â€¢ Ortho Care Wing (Chamber 2)',
      timing: 'Mon, Wed, Fri: 11:00 AM - 04:00 PM',
      doctor: 'Dr. S. Singh',
      doctorDegree: 'MBBS, MS (Orthopedics), M.Ch',
      image: './images/symptom-orthopedics.jpg',
      overview: 'Specialized clinic for accidental bone fracture realignment, severe joint arthritis management, spinal sciatica relief, and mobility rehabilitation.',
      procedures: [
        'Accidental bone fracture reduction, alignment & rigid casting',
        'Knee Osteoarthritis (Gathiya) joint pain management & viscosity therapy',
        'Sciatica, chronic lower back ache & cervical spondylosis relief',
        'Sports ligament sprains, tendon injuries & joint dislocation reduction',
        'Post-trauma physical mobility & walking rehabilitation counseling'
      ],
      technology: [
        'Synthetic Lightweight Fiberglass & POP Plaster Facility',
        'Sterile Intra-Articular Joint Injection Suite',
        'Cervical & Lumbar Spinal Traction Support',
        'Orthopedic Dressing & Splint Immobilization Bay'
      ],
      walkInNote: 'Consultation slips issued on Mon, Wed, Fri. Emergency fracture splints available 24/7.'
    },
    {
      id: 'pediatrics',
      icon: <Baby size={22} color="#0A302A" />,
      title: 'Pediatrics & Neonatal Child Health',
      wingBadge: 'Specialist Child Care OPD',
      wingBadgeColor: '#FEF3C7',
      wingBadgeText: '#B45309',
      location: '1st Floor â€¢ Pediatric Clinic (Chamber 3)',
      timing: 'Tue, Thu, Sat: 10:00 AM - 03:00 PM',
      doctor: 'Dr. Meenakshi Sharma',
      doctorDegree: 'MBBS, MD (Pediatrics & Neonatology)',
      image: './images/symptom-pediatrics.jpg',
      overview: 'Gentle, dedicated healthcare wing for infants, toddlers, and young children focusing on infections, nutritional growth, and WHO-standard routine immunization.',
      procedures: [
        'Infant & child seasonal viral fever, chest flu & throat infection treatment',
        'Complete childhood immunization schedule & booster vaccinations',
        'Infant growth monitoring, weight tracking & malnutrition therapy',
        'Pediatric acute diarrhea, vomiting & oral rehydration therapy',
        'Childhood allergic bronchitis & recurrent wheezing management'
      ],
      technology: [
        'Precision Pediatric Electronic Weighing & Length Scale',
        'Child-Friendly Low-Noise Nebulization Suite',
        'WHO-Standard Dedicated Cold-Chain Vaccine Refrigerator',
        'Quiet, Comfortable Child Examination Chamber'
      ],
      walkInNote: 'Vaccination & child OPD available Tue, Thu, Sat. Emergency child triage 24/7.'
    },
    {
      id: 'dental',
      icon: <Sparkles size={22} color="#0A302A" />,
      title: 'Dental Surgery & Oral Maxillofacial Care',
      wingBadge: 'Dental Operatory Clinic',
      wingBadgeColor: '#F3E8FF',
      wingBadgeText: '#7E22CE',
      location: 'Ground Floor â€¢ Dental Clinic (Chamber 4)',
      timing: 'Mon - Sat: 04:00 PM - 08:30 PM',
      doctor: 'Dr. Rohit Verma',
      doctorDegree: 'BDS, MDS (Oral & Maxillofacial Surgery)',
      image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      overview: 'Modern dental suite dedicated to pain-free tooth extractions, root canal therapy, ultrasonic gum scaling, and cosmetic oral restorations.',
      procedures: [
        'Severe acute toothache diagnosis & localized pain management',
        'Single-sitting & multi-sitting Root Canal Treatment (RCT)',
        'Painless permanent & impacted wisdom tooth extractions',
        'Ultrasonic scaling for plaque, tartar & bleeding gum disease',
        'Tooth-colored composite fillings & protective dental crowns'
      ],
      technology: [
        'Ergonomic Multi-Axis Motorized Dental Chair',
        'Piezo-Ultrasonic Dental Cleaning & Scaling Unit',
        'Class-B Autoclave 100% Sterilization Protocol',
        'Precision Local Anesthesia Delivery Systems'
      ],
      walkInNote: 'Evening clinic open Mon - Sat from 04:00 PM. Dental emergencies triaged on arrival.'
    },
    {
      id: 'diagnostics',
      icon: <Syringe size={22} color="#0A302A" />,
      title: 'Automated Diagnostic Pathology Laboratory',
      wingBadge: 'Computerized Diagnostic Lab',
      wingBadgeColor: '#D1F8E3',
      wingBadgeText: '#0A302A',
      location: 'Ground Floor â€¢ Diagnostic Wing (Near Reception)',
      timing: 'Daily: 08:00 AM - 08:00 PM (Emergency Tests 24/7)',
      doctor: 'Certified Pathologists & Lab Technologists',
      doctorDegree: 'Registered Clinical Biochemistry Unit',
      image: './images/symptom-diagnostics.jpg',
      overview: 'Computerized in-house pathology laboratory delivering accurate hematology, blood chemistry, and infectious disease test results with same-day reports.',
      procedures: [
        'Complete Blood Count (CBC) with Platelets & Hemoglobin profiling',
        'Blood Glucose (Fasting, Post-Prandial, Random) & HbA1c 3-month control',
        'Liver Function Test (LFT) & Kidney Function Test (KFT / RFT)',
        'Lipid Profile (Cholesterol, Triglycerides, HDL, LDL)',
        'Widal Serology for Typhoid, Dengue NS1 / IgM & Malaria Antigen',
        'Complete Urine Routine & Microscopic Examination'
      ],
      technology: [
        'Automated 3-Part Differential Hematology Cell Counter',
        'Semi-Automated Clinical Biochemistry Spectrophotometer',
        'High-Speed Refrigerated Clinical Centrifuges',
        'Digital High-Resolution Binocular Microscopy',
        'Direct WhatsApp Digital Report Delivery System'
      ],
      walkInNote: 'Sample collection daily 08:00 AM to 08:00 PM. Reports ready within 2 to 4 hours.'
    },
    {
      id: 'pharmacy',
      icon: <Pill size={22} color="#0A302A" />,
      title: 'Chaudhary Medical Store (24-Hour Pharmacy)',
      wingBadge: '24/7 In-House Pharmacy',
      wingBadgeColor: '#D1F8E3',
      wingBadgeText: '#0A302A',
      location: 'Hospital Campus Entrance â€¢ Ground Floor',
      timing: '24 Hours Open Daily (365 Days Non-Stop)',
      doctor: 'Licensed Registered Pharmacists On Duty',
      doctorDegree: 'Hospital Pharmacy Dispensing Unit',
      image: './images/chaudhary-medical-store.jpg',
      overview: 'Hospital pharmacy stocking 100% genuine branded pharmaceuticals, temperature-controlled insulin, injectables, surgical supplies, and patient wound care products.',
      procedures: [
        '100% genuine branded prescription pharmaceuticals & antibiotics',
        'Continuous cold-chain insulin, vaccine & injectable storage',
        'Emergency surgical dressings, sterile cotton, gauze & antiseptics',
        'IV fluids (NS, RL, DNS), infusion sets & disposable syringes',
        'Pediatric drop formulations, fever syrups & infant rehydration salts'
      ],
      technology: [
        'Continuous 24-Hour Automatic Generator Backup',
        'Temperature-Monitored Pharmaceutical Cold-Chain Refrigerator',
        'Computerized Tax Billing & Batch Expiry Tracking',
        'Direct Brand-Authorized Pharmaceutical Sourcing'
      ],
      walkInNote: 'Open 24 hours a day, 7 days a week, including all festivals and public holidays.'
    }
  ];

  // In-House Diagnostic Test Directory (Agilus Partnered Standards)
  const diagnosticTestMenu = [
    { test: 'Complete Blood Count (CBC) + Platelets', use: 'Anemia, infections, platelet count, viral fever', time: 'Within 2 Hours', timing: '08:00 AM - 08:00 PM' },
    { test: 'Blood Sugar (Fasting & PP)', use: 'Diabetes diagnosis & routine glucose tracking', time: 'Within 1 Hour', timing: '08:00 AM - 08:00 PM' },
    { test: 'HbA1c (3-Month Glycated Hemoglobin)', use: 'Long-term diabetic management assessment', time: 'Same Day', timing: '08:00 AM - 08:00 PM' },
    { test: 'Liver Function Test (LFT Panel)', use: 'Jaundice, SGOT, SGPT, bilirubin, liver wellness', time: 'Same Day', timing: '08:00 AM - 08:00 PM' },
    { test: 'Kidney Function Test (KFT / RFT)', use: 'Urea, creatinine, uric acid, kidney wellness', time: 'Same Day', timing: '08:00 AM - 08:00 PM' },
    { test: 'Lipid Profile (Full Cholesterol Panel)', use: 'Heart health, triglycerides, cholesterol levels', time: 'Same Day', timing: '08:00 AM - 08:00 PM' },
    { test: 'Typhoid (Widal) & Dengue NS1 Antigen', use: 'Rapid fever differential for acute infections', time: 'Within 2 Hours', timing: '08:00 AM - 08:00 PM' },
    { test: 'Urine Routine & Microscopic Analysis', use: 'Urinary tract infection (UTI), pus cells, protein', time: 'Within 1 Hour', timing: '08:00 AM - 08:00 PM' }
  ];

  const activeWing = clinicalWings.find(w => w.id === selectedWingId) || clinicalWings[0];

  return (
    <div className="animate-fade-in" style={{ background: '#F8FCFA', minHeight: '100vh', paddingBottom: '5rem' }}>
      
      {/* ==========================================================================
          1. HERO HEADER: CLINICAL SERVICES & MEDICAL SPECIALTIES
          ========================================================================== */}
      <section style={{
        background: 'linear-gradient(135deg, #071828 0%, #0A302A 60%, #0D3E36 100%)',
        color: '#FFFFFF',
        padding: '5rem 0 4.5rem',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(209, 248, 227, 0.15)'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 10, maxWidth: '1080px', textAlign: 'center' }}>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            color: '#FFFFFF',
            padding: '0.45rem 1.15rem',
            borderRadius: '4px',
            fontSize: '0.825rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '1.25rem'
          }}>
            <Building2 size={15} color="#D1F8E3" />
            <span>Chaudhary Health Care Center â€¢ Koraon, Prayagraj</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.3rem, 5.5vw, 3.8rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: '#FFFFFF',
            marginBottom: '1.2rem'
          }}>
            Clinical Services & Diagnostic Guide
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.6vw, 1.18rem)',
            color: '#E0F2FE',
            maxWidth: '780px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
            fontWeight: 400
          }}>
            Official clinical department profiles, doctor consultation timings, in-house computerized laboratory tests, and 24-hour emergency trauma care facilities in Koraon.
          </p>

          {/* Transparent Walk-In OPD Notice */}
          <div style={{
            background: 'rgba(209, 248, 227, 0.14)',
            border: '1px solid rgba(209, 248, 227, 0.35)',
            borderRadius: '4px',
            padding: '1.15rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
            textAlign: 'left',
            maxWidth: '920px',
            margin: '0 auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <ShieldCheck size={22} color="#D1F8E3" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.2rem' }}>
                  Walk-In OPD Daily Active â€¢ No Prior Online Booking Required
                </div>
                <div style={{ fontSize: '0.85rem', color: '#D1F8E3', lineHeight: 1.5 }}>
                  Aap seedhe hospital reception counter par aakar OPD slip le sakte hain. Kisi bhi doctor ki availability confirm karne ke liye seedhe reception par call karein.
                </div>
              </div>
            </div>

            <a
              href="tel:+919999900000"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#D1F8E3',
                color: '#0A302A',
                padding: '0.65rem 1.25rem',
                borderRadius: '4px',
                fontWeight: 800,
                fontSize: '0.875rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                whiteSpace: 'nowrap'
              }}
            >
              <Phone size={15} /> Reception: +91 99999 00000
            </a>
          </div>

        </div>
      </section>

      {/* ==========================================================================
          2. INTERACTIVE CLINICAL WINGS MASTER CONSOLE (DEEP-DIVE PROCEDURAL PROFILES)
          ========================================================================== */}
      <section style={{ padding: '3.5rem 0', borderBottom: '1px solid #E2ECE6' }}>
        <div className="container" style={{ maxWidth: '1240px' }}>
          
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0A302A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
              Department Master Console
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.3rem)', fontWeight: 800, color: '#0A302A', margin: 0 }}>
              Hospital Wings, Doctors & Treatment Scope
            </h2>
          </div>

          {/* 2-Column Responsive Layout: Left Wing Selector + Right Deep-Dive Panel */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 340px) 1fr',
            gap: '1.75rem',
            alignItems: 'start'
          }}>
            
            {/* Left Column: Wing Selector List */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2ECE6',
              borderRadius: '4px',
              padding: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              boxShadow: '0 4px 16px rgba(10, 48, 42, 0.04)'
            }}>
              {clinicalWings.map((wing) => {
                const isSelected = wing.id === selectedWingId;
                return (
                  <div
                    key={wing.id}
                    onClick={() => setSelectedWingId(wing.id)}
                    style={{
                      padding: '0.9rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: isSelected ? '1px solid #0A302A' : '1px solid transparent',
                      background: isSelected ? '#0A302A' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : '#0A302A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = '#F1F7F4';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = '#FFFFFF';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '4px',
                        background: isSelected ? 'rgba(255, 255, 255, 0.15)' : '#D1F8E3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {wing.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.925rem', lineHeight: 1.25 }}>
                          {wing.title.split('&')[0]}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: isSelected ? '#D1F8E3' : '#64748B', fontWeight: 600 }}>
                          {wing.location.split('â€¢')[0]}
                        </div>
                      </div>
                    </div>

                    <ChevronRight size={16} color={isSelected ? '#D1F8E3' : '#94A3B8'} />
                  </div>
                );
              })}
            </div>

            {/* Right Column: Active Wing Deep-Dive Panel */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2ECE6',
              borderRadius: '4px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(10, 48, 42, 0.06)'
            }}>
              
              {/* Photo Banner with Sharp 4px Top */}
              <div style={{ position: 'relative', height: '230px', width: '100%', overflow: 'hidden' }}>
                <img 
                  src={activeWing.image} 
                  alt={activeWing.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                />
              </div>

              {/* Panel Content Body */}
              <div style={{ padding: '2rem 2.25rem' }}>
                
                {/* Header: Title & Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <span style={{
                      fontSize: '0.785rem',
                      fontWeight: 800,
                      background: activeWing.wingBadgeColor,
                      color: activeWing.wingBadgeText,
                      padding: '0.25rem 0.75rem',
                      borderRadius: '4px',
                      display: 'inline-block',
                      marginBottom: '0.5rem'
                    }}>
                      {activeWing.wingBadge}
                    </span>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0A302A', margin: 0 }}>
                      {activeWing.title}
                    </h3>
                  </div>

                  <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} color="#0A302A" />
                    <span>{activeWing.location}</span>
                  </span>
                </div>

                <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                  {activeWing.overview}
                </p>

                {/* Doctor & Timing Info Box */}
                <div style={{
                  background: '#F8FCFA',
                  borderRadius: '4px',
                  border: '1px solid #E2ECE6',
                  padding: '1.15rem 1.35rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '1.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '4px',
                      background: '#D1F8E3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <UserCheck size={22} color="#0A302A" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0A302A' }}>
                        {activeWing.doctor}
                      </div>
                      <div style={{ fontSize: '0.825rem', color: '#64748B' }}>
                        {activeWing.doctorDegree}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.885rem', color: '#0A302A', fontWeight: 700 }}>
                    <Clock size={16} color="#0A302A" />
                    <span>{activeWing.timing}</span>
                  </div>
                </div>

                {/* Procedures & Clinical Scope */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#0A302A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                    Clinical Procedures & Treatments Handled:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {activeWing.procedures.map((proc, pIdx) => (
                      <div key={pIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: '0.9rem', color: '#1E293B', lineHeight: 1.5 }}>
                        <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{proc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medical Technology & Equipment */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
                    In-Wing Equipment & Facilities:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {activeWing.technology.map((tech, tIdx) => (
                      <span key={tIdx} style={{
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        background: '#F1F5F9',
                        color: '#334155',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '4px',
                        border: '1px solid #E2E8F0'
                      }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Walk-in Notice Note */}
                <div style={{
                  fontSize: '0.85rem',
                  color: '#475569',
                  background: '#F8FCFA',
                  padding: '0.75rem 1rem',
                  borderRadius: '4px',
                  borderLeft: '3px solid #0A302A',
                  marginBottom: '1.75rem'
                }}>
                  <strong>Walk-in Note:</strong> {activeWing.walkInNote}
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  paddingTop: '1rem',
                  borderTop: '1px solid #E2ECE6'
                }}>
                  <a
                    href="tel:+919999900000"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: '#0A302A',
                      color: '#FFFFFF',
                      padding: '0.75rem 1.4rem',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      textDecoration: 'none'
                    }}
                  >
                    <Phone size={15} />
                    <span>Call Reception for Timings</span>
                  </a>

                  <Link
                    to="/doctors"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: '#D1F8E3',
                      color: '#0A302A',
                      padding: '0.75rem 1.4rem',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                      border: '1px solid rgba(10, 48, 42, 0.12)'
                    }}
                  >
                    <span>View Doctor Profile</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ==========================================================================
          3. IN-HOUSE DIAGNOSTIC PATHOLOGY TEST DIRECTORY (AGILUS STANDARDS)
          ========================================================================== */}
      <section style={{ padding: '4.5rem 0', background: '#FFFFFF', borderBottom: '1px solid #E2ECE6' }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#D1F8E3',
              color: '#0A302A',
              padding: '0.35rem 0.9rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.5rem'
            }}>
              <Syringe size={14} color="#0A302A" /> In-House Diagnostic Lab
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.8vw, 2.45rem)', fontWeight: 800, color: '#0A302A', letterSpacing: '-0.02em', marginBottom: '0.65rem' }}>
              Computerized Blood, Sugar & Biochemical Tests
            </h2>
            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
              Hospital campus ke andar automated pathology lab uplabdh hai. Sample collection subah 8 baje se shaam 8 baje tak hota hai, aur reports same-day milti hain.
            </p>
          </div>

          {/* Test Menu Table / Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1rem'
          }}>
            {diagnosticTestMenu.map((t, idx) => (
              <div 
                key={idx}
                style={{
                  background: '#F8FCFA',
                  border: '1px solid #E2ECE6',
                  borderRadius: '4px',
                  padding: '1.25rem 1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.85rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.985rem', color: '#0A302A' }}>
                      {t.test}
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      background: '#D1F8E3',
                      color: '#0A302A',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap'
                    }}>
                      {t.time}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.45 }}>
                    {t.use}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.65rem',
                  borderTop: '1px solid #E2ECE6',
                  fontSize: '0.8rem',
                  color: '#64748B'
                }}>
                  <span>Timing: {t.timing}</span>
                  <span style={{ color: '#0A302A', fontWeight: 700 }}>Ground Floor Lab</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '2rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#475569'
          }}>
            Kissi bhi specific test ya doctor prescription ke baare me poochne ke liye lab desk par call karein:{' '}
            <a href="tel:+919999900000" style={{ fontWeight: 800, color: '#0A302A', textDecoration: 'underline' }}>
              +91 99999 00000
            </a>
          </div>

        </div>
      </section>

      {/* ==========================================================================
          4. RECEPTION HOTLINE & CAMPUS LOCATION BAR (CLEAN BOTTOM STRIP)
          ========================================================================== */}
      <section className="container" style={{ maxWidth: '1240px', marginTop: '3.5rem' }}>
        <div style={{
          background: '#0A302A',
          borderRadius: '4px',
          padding: '2.5rem',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '2rem',
          boxShadow: '0 16px 36px rgba(10, 48, 42, 0.22)'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#D1F8E3',
              color: '#0A302A',
              padding: '0.35rem 0.9rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 800,
              marginBottom: '0.85rem'
            }}>
              <Building2 size={14} /> Reception Helpdesk â€¢ Koraon
            </div>
            <h3 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', color: 'white', marginBottom: '0.5rem', fontWeight: 800 }}>
              Hospital Aane Se Pehle Koi Jankari Chahiye?
            </h3>
            <p style={{ color: '#D1F8E3', fontSize: '1rem', maxWidth: '620px', margin: 0, opacity: 0.9, lineHeight: 1.6 }}>
              Aapke aane se pehle doctor sahab ki timing, lab test timing ya 24/7 ambulance ke liye hamari reception desk phone par uplabdh hai.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <a 
              href="tel:+919999900000" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#D1F8E3',
                color: '#0A302A',
                padding: '0.85rem 1.6rem',
                borderRadius: '4px',
                fontWeight: 800,
                fontSize: '0.95rem',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#BFF2D6'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#D1F8E3'}
            >
              <Phone size={17} /> Call Reception: +91 99999 00000
            </a>

            <Link 
              to="/contact" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'transparent',
                color: '#FFFFFF',
                padding: '0.85rem 1.6rem',
                borderRadius: '4px',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: '1.5px solid rgba(209, 248, 227, 0.4)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = '#D1F8E3';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(209, 248, 227, 0.4)';
              }}
            >
              <MapPin size={16} /> Campus Location & Route
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Services;

