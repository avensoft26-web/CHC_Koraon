import { 
  Building2, 
  Stethoscope, 
  Clock, 
  ShieldCheck, 
  HeartPulse, 
  Users, 
  Phone, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Award, 
  Calendar, 
  FileText,
  Microscope,
  Pill,
  Activity
} from 'lucide-react';

const Doctors = () => {
  const residentDoctors = [
    {
      id: 'doc-1',
      chamber: 'Chamber No. 01',
      title: 'Consultant Physician — Internal Medicine & Chronic Diseases',
      qualification: 'MBBS, MD (General Medicine)',
      experience: '15+ Years Clinical Practice',
      focus: 'Fever (Typhoid, Dengue, Malaria), Diabetes (Sugar), Hypertension (BP), Thyroid, Liver & Stomach Ailments.',
      timings: '09:00 AM – 02:00 PM  |  05:00 PM – 08:30 PM',
      days: 'Monday to Sunday (Daily OPD)',
      floor: 'Ground Floor, OPD Block',
      status: 'Daily Active OPD'
    },
    {
      id: 'doc-2',
      chamber: 'Chamber No. 02',
      title: 'Resident Medical Officer — Acute Care & Chest Medicine',
      qualification: 'MBBS, Resident Physician',
      experience: '10+ Years Emergency & Hospital Care',
      focus: 'Respiratory Distress (Asthma, Bronchitis, Saans ki takleef), Acute Dehydration, Infection Control, Chest Pain Triage.',
      timings: '10:00 AM – 03:00 PM  |  06:00 PM – 09:00 PM',
      days: 'Monday to Sunday (Daily OPD)',
      floor: 'Ground Floor, OPD Block',
      status: 'Daily Active OPD'
    },
    {
      id: 'doc-3',
      chamber: 'Chamber No. 03',
      title: 'Family Physician — Preventive Medicine & Geriatric Care',
      qualification: 'MBBS, Family Medicine Specialist',
      experience: '12+ Years Community Practice',
      focus: 'Elderly Health (Buzurgon ki dekhbhal), Chronic Weakness, Anemia, Seasonal Allergies, Routine Follow-up & Vitals Assessment.',
      timings: '09:00 AM – 02:00 PM  |  04:30 PM – 08:00 PM',
      days: 'Monday to Sunday (Daily OPD)',
      floor: 'Ground Floor, OPD Block',
      status: 'Daily Active OPD'
    },
    {
      id: 'doc-4',
      chamber: 'Chamber No. 04',
      title: 'Ward In-Charge & Emergency Critical Care Resident',
      qualification: 'MBBS, Critical & Emergency Medicine',
      experience: '9+ Years In-Patient Management',
      focus: 'In-Patient Ward Rounds, Trauma & Injury Stabilization, Post-Accident First Care, IV Fluid Therapy & Burn Dressing Supervision.',
      timings: 'Day & Rotational Night Shifts (24 Hours Continuous Ward Coverage)',
      days: '24/7 Round the Clock',
      floor: 'IPD Ward & Casualty Block',
      status: '24/7 Emergency Duty'
    }
  ];

  const visitingSpecialties = [
    {
      id: 'ortho',
      specialty: 'Orthopedics & Joint Care',
      hindiName: 'हड्डी, जोड़ एवं नस रोग विशेषज्ञ',
      source: 'Senior Consultant from Prayagraj Govt Medical Hospital Panel',
      conditions: 'Arthritis (Gathiya), Joint Pain, Bone Fractures, Back/Spine Strain, Sciatica, and Ligament Injuries.',
      frequency: 'Once a Week (Designated Specialist Camp Day)',
      timing: '10:30 AM – 03:30 PM'
    },
    {
      id: 'gynae',
      specialty: 'Obstetrics & Gynecology',
      hindiName: 'महिला एवं प्रसूति रोग विशेषज्ञ',
      source: 'Senior Lady Consultant from Prayagraj Medical College Panel',
      conditions: 'Pregnancy Care (Antenatal Checkup), High-Risk Pregnancy Consultation, Menstrual Irregularities, and Infertility Guidance.',
      frequency: 'Once a Week (Designated Specialist Camp Day)',
      timing: '11:00 AM – 04:00 PM'
    },
    {
      id: 'peds',
      specialty: 'Pediatrics & Neonatology',
      hindiName: 'शिशु एवं बाल रोग विशेषज्ञ',
      source: 'Child Care Specialist from Prayagraj Senior Faculty Panel',
      conditions: 'Newborn Health, Infant Nutrition, Growth Monitoring, Pediatric Asthma, Childhood Fevers, and Complete Vaccination Counsel.',
      frequency: 'Once a Week (Designated Specialist Camp Day)',
      timing: '10:00 AM – 03:00 PM'
    },
    {
      id: 'surgery',
      specialty: 'General & Laparoscopic Surgery Consultation',
      hindiName: 'जनरल एवं दूरबीन सर्जरी परामर्श',
      source: 'Senior Surgeon from Prayagraj Surgical Center Panel',
      conditions: 'Hernia, Gallbladder Stones (Pitt ki pathari), Appendix, Hydrocele, Piles/Fistula, and Pre-Surgical Medical Evaluations.',
      frequency: 'Once a Week (Designated Specialist Camp Day)',
      timing: '11:30 AM – 04:30 PM'
    },
    {
      id: 'cardio',
      specialty: 'Cardiology & Chest Medicine Consultation',
      hindiName: 'हृदय एवं छाती रोग परामर्श',
      source: 'Senior Physician & Cardiology Consultant (Prayagraj Panel)',
      conditions: 'Hypertensive Heart Assessment, ECG Analysis, Breathlessness Evaluation, Post-Angioplasty Monitoring & Risk Management.',
      frequency: 'Once a Week (Designated Specialist Camp Day)',
      timing: '10:00 AM – 02:30 PM'
    }
  ];

  const supportPillars = [
    {
      title: '24/7 Nursing & Bedside Care',
      role: 'Trained GNM & ANM Qualified Nurses',
      desc: '24 ghante ward me bharti mareezon ki dekhbhal, injection, IV drip, BP/Sugar monitor aur emergency injection administration.'
    },
    {
      title: 'Certified Diagnostic Pathology Team',
      role: 'Laboratory Technologists',
      desc: 'Automated analyzers par khoon, peshab, dengue, malaria, typhoid, lipid profile aur biochemistry jaanch turant report ke sath.'
    },
    {
      title: 'Emergency Trauma & Dressing Staff',
      role: 'Experienced OT & Casualty Dressers',
      desc: 'Durghatna, chot, kata-fata, tanke (suturing), plaster bandage aur jale hue ghavon ki tatkal safai va dressing prabandhan.'
    },
    {
      title: '24-Hour In-House Pharmacy Dispensers',
      role: 'Registered Pharmacists',
      desc: 'Emergency jeevan-rakshak dawaiyan, surgical item aur doctor dwaara likhi gayi brand dawaiyan din-raat uplabdh.'
    }
  ];

  return (
    <div style={{ background: '#F8FCFA', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* 1. HERO INSTITUTIONAL HEADER */}
      <section style={{ 
        background: '#FFFFFF', 
        padding: '3.75rem 0 3rem',
        borderBottom: '1px solid #E2ECE6'
      }}>
        <div className="container" style={{ maxWidth: '1080px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#D1F8E3',
            color: '#0A302A',
            padding: '0.45rem 1rem',
            borderRadius: '4px',
            fontSize: '0.825rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '1rem',
            border: '1px solid rgba(10, 48, 42, 0.12)'
          }}>
            <Building2 size={15} /> Medical Leadership & Faculty
          </div>

          <h1 style={{ 
            color: '#0A302A', 
            fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', 
            marginBottom: '0.85rem',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            lineHeight: 1.15
          }}>
            Doctors & Clinical Medical Team
          </h1>

          <p style={{ 
            color: '#475569', 
            fontSize: '1.075rem', 
            maxWidth: '820px', 
            lineHeight: 1.65,
            marginBottom: '2rem'
          }}>
            Chaudhary Health Care Center, Koraon (Prayagraj) me 4 full-time General Medicine Doctors daily OPD aur 24 ghante emergency me upasthit rehte hain. Sath hi, Prayagraj ke pramukh sarkari aspatalon se Senior Super-Specialists hafte me niyamit roop se visit karte hain.
          </p>

          {/* Quick Institutional Highlights Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              background: '#F8FCFA',
              border: '1px solid #E2ECE6',
              borderRadius: '4px',
              padding: '0.9rem 1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', flexShrink: 0 }}></div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0A302A' }}>Daily General OPD</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>09:00 AM – 08:30 PM (7 Days)</div>
              </div>
            </div>

            <div style={{
              background: '#F8FCFA',
              border: '1px solid #E2ECE6',
              borderRadius: '4px',
              padding: '0.9rem 1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <Activity size={18} color="#0A302A" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0A302A' }}>4 General Physicians</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>In-House Permanent Team</div>
              </div>
            </div>

            <div style={{
              background: '#F8FCFA',
              border: '1px solid #E2ECE6',
              borderRadius: '4px',
              padding: '0.9rem 1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <Calendar size={18} color="#0A302A" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0A302A' }}>Weekly Specialist Panel</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>From Prayagraj Govt Hospitals</div>
              </div>
            </div>

            <div style={{
              background: '#F8FCFA',
              border: '1px solid #E2ECE6',
              borderRadius: '4px',
              padding: '0.9rem 1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <HeartPulse size={18} color="#0A302A" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0A302A' }}>24/7 Emergency Doctors</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Round-the-clock RMO Coverage</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOSPITAL LEADERSHIP — MD BHOOPENDRA CHAUDHARY */}
      <section className="container" style={{ maxWidth: '1080px', marginTop: '3rem' }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2ECE6',
          borderRadius: '4px',
          boxShadow: '0 4px 16px rgba(10, 48, 42, 0.04)',
          overflow: 'hidden'
        }}>
          <div style={{
            background: '#0A302A',
            color: '#FFFFFF',
            padding: '1rem 1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Award size={18} color="#D1F8E3" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#D1F8E3' }}>
                Hospital Founder & Direction
              </span>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#E2ECE6', fontWeight: 600 }}>
              Chaudhary Health Care Center, Koraon
            </span>
          </div>

          <div style={{ padding: '2rem 1.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' }}>
              <div>
                <div style={{
                  display: 'inline-block',
                  background: '#F4F9F6',
                  color: '#0A302A',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  border: '1px solid #D1F8E3',
                  marginBottom: '0.6rem'
                }}>
                  Managing Director
                </div>
                <h2 style={{ fontSize: '1.85rem', color: '#0A302A', fontWeight: 800, marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
                  MD. Bhoopendra Chaudhary
                </h2>
                <div style={{ color: '#475569', fontSize: '0.925rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                  Founder & Managing Director • Chaudhary Health Care Center
                </div>

                <p style={{ color: '#334155', fontSize: '0.975rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                  "Hamara mukhya sankalp Koraon tehsil aur aas-paas ke sabhi gramin shetron ke parivaron ko imandaar, kifaayati aur uchh-stariya chikitsa sewa uplabdh karana hai. Prayagraj shahar ke bade sarkari aspatalon ke visheshagyaon ko yahan lane aur 24 ghante dedicated general physicians ki team tainat rakhne se har vyakti ko samay par ilaaj milta hai."
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.85rem', color: '#0A302A', fontWeight: 700 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={15} color="#0A302A" /> 24/7 Administrative Supervision
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={15} color="#0A302A" /> Ethical & Transparent Patient Care
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={15} color="#0A302A" /> Direct Connect with Top Prayagraj Facilities
                  </div>
                </div>
              </div>

              {/* Institutional Overview Card */}
              <div style={{
                background: '#F8FCFA',
                border: '1px solid #E2ECE6',
                borderRadius: '4px',
                padding: '1.5rem',
                borderLeft: '4px solid #0A302A'
              }}>
                <h3 style={{ fontSize: '1.05rem', color: '#0A302A', fontWeight: 800, marginBottom: '0.75rem' }}>
                  Hospital Clinical Governance
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, marginBottom: '1rem' }}>
                  Managing Director MD. Bhoopendra Chaudhary ji ki dekhrekh me hospital me 4 full-time resident physicians aur 30+ supporting nursing va paramedical staff 24 ghante karayarat hain.
                </p>

                <div style={{ borderTop: '1px solid #E2ECE6', paddingTop: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748B' }}>Permanent Resident Doctors:</span>
                    <strong style={{ color: '#0A302A' }}>4 General Physicians</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748B' }}>Visiting Super-Specialists:</span>
                    <strong style={{ color: '#0A302A' }}>Weekly on Scheduled Days</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748B' }}>Emergency & Casualty RMO:</span>
                    <strong style={{ color: '#0A302A' }}>24 Hours Round-the-Clock</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748B' }}>Hospital Location:</span>
                    <strong style={{ color: '#0A302A' }}>Koraon, Prayagraj, UP</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. IN-HOUSE PERMANENT RESIDENT DOCTORS (4 GENERAL MEDICINE DOCTORS) */}
      <section className="container" style={{ maxWidth: '1080px', marginTop: '3.5rem' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#D1F8E3',
            color: '#0A302A',
            padding: '0.35rem 0.85rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '0.6rem'
          }}>
            <Stethoscope size={14} /> Full-Time Resident Medical Team
          </div>
          <h2 style={{ fontSize: '1.9rem', color: '#0A302A', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
            Permanent General Medicine Physicians (4 Doctors)
          </h2>
          <p style={{ color: '#475569', fontSize: '0.975rem', maxWidth: '820px', lineHeight: 1.6 }}>
            Yeh 4 doctors hospital me niyamit roop se upasthit rehte hain. Daily OPD checkup, seasonal bukhar, emergency prathmik upchar aur ward me bharti mareezon ki dekhbhal inhi ke margdarshan me hoti hai.
          </p>
        </div>

        {/* 4 Doctor Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem' }}>
          {residentDoctors.map((doc) => (
            <div 
              key={doc.id}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2ECE6',
                borderRadius: '4px',
                boxShadow: '0 4px 14px rgba(10, 48, 42, 0.03)',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                {/* Header Strip with Chamber and Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span style={{
                    background: '#0A302A',
                    color: '#D1F8E3',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '4px'
                  }}>
                    {doc.chamber}
                  </span>

                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    color: '#15803D',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.65rem',
                    borderRadius: '4px'
                  }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16A34A' }}></span>
                    {doc.status}
                  </span>
                </div>

                {/* Title & Qualification */}
                <h3 style={{ fontSize: '1.25rem', color: '#0A302A', fontWeight: 800, marginBottom: '0.25rem', lineHeight: 1.3 }}>
                  {doc.title}
                </h3>
                <div style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 600, marginBottom: '1.1rem' }}>
                  {doc.qualification} • {doc.experience}
                </div>

                {/* Clinical Areas Handled */}
                <div style={{
                  background: '#F8FCFA',
                  border: '1px solid #E2ECE6',
                  borderRadius: '4px',
                  padding: '0.85rem 1rem',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0A302A', marginBottom: '0.35rem' }}>
                    Key Clinical Expertise & Treatments:
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.55, margin: 0 }}>
                    {doc.focus}
                  </p>
                </div>
              </div>

              {/* Schedule and Location Box */}
              <div style={{ borderTop: '1px solid #E2ECE6', paddingTop: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', fontSize: '0.825rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0A302A' }}>
                    <Clock size={15} color="#0A302A" style={{ flexShrink: 0 }} />
                    <span><strong>OPD Timings:</strong> {doc.timings}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
                    <Calendar size={15} color="#0A302A" style={{ flexShrink: 0 }} />
                    <span><strong>Availability:</strong> {doc.days}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B' }}>
                    <MapPin size={15} color="#0A302A" style={{ flexShrink: 0 }} />
                    <span><strong>Location:</strong> {doc.floor}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. WEEKLY VISITING SUPER-SPECIALIST CLINICS (ROTATING GOVT HOSPITAL PANEL) */}
      <section className="container" style={{ maxWidth: '1080px', marginTop: '3.5rem' }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2ECE6',
          borderRadius: '4px',
          boxShadow: '0 4px 16px rgba(10, 48, 42, 0.04)',
          overflow: 'hidden'
        }}>
          {/* Section Banner Header */}
          <div style={{
            background: '#0A302A',
            color: '#FFFFFF',
            padding: '2rem 1.75rem',
            borderBottom: '1px solid rgba(209, 248, 227, 0.15)'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#D1F8E3',
              color: '#0A302A',
              padding: '0.35rem 0.85rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.85rem'
            }}>
              <Calendar size={14} /> Weekly Specialist Clinics
            </div>

            <h2 style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.1rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
              Prayagraj Government Hospitals Visiting Specialists Panel
            </h2>

            <p style={{ color: '#D1F8E3', fontSize: '0.975rem', maxWidth: '850px', lineHeight: 1.65, margin: 0 }}>
              Koraon aur aas-paas ke mareezon ko shahar jane ki pareshani se bachane ke liye, Prayagraj ke bade sarkari aspatalon (jaise Medical College / SRN Hospital panel) se Senior Super-Specialists hafte me ek baar rotating schedule par yahan aate hain.
            </p>
          </div>

          <div style={{ padding: '2rem 1.75rem' }}>
            {/* Notice Strip Regarding Rotating Names */}
            <div style={{
              background: '#F4F9F6',
              border: '1px solid #D1F8E3',
              borderRadius: '4px',
              padding: '1.25rem 1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start'
            }}>
              <AlertCircle size={22} color="#0A302A" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#0A302A', fontSize: '0.925rem', display: 'block', marginBottom: '0.25rem' }}>
                  Important Information About Visiting Specialist Schedules:
                </strong>
                <p style={{ color: '#334155', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                  Kyunki Prayagraj ke bade sarkari aspatalon se aane wale senior doctors har hafte roster ke mutabiq rotate hote hain, isliye kisi ek doctor ka naam sthayi nahi hota. Har hafte ke specialist doctor ke aane ka din, timing aur registration slip ki jaankari hospital notice board aur reception helpline par update ki jaati hai.
                </p>
              </div>
            </div>

            {/* Grid of Visiting Specialties */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.25rem' }}>
              {visitingSpecialties.map((item) => (
                <div 
                  key={item.id}
                  style={{
                    background: '#F8FCFA',
                    border: '1px solid #E2ECE6',
                    borderRadius: '4px',
                    padding: '1.35rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <h4 style={{ fontSize: '1.1rem', color: '#0A302A', fontWeight: 800, margin: 0 }}>
                        {item.specialty}
                      </h4>
                    </div>

                    <div style={{ fontSize: '0.825rem', color: '#134E43', fontWeight: 700, marginBottom: '0.6rem' }}>
                      {item.hindiName}
                    </div>

                    <div style={{
                      display: 'inline-block',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      color: '#475569',
                      fontWeight: 600,
                      padding: '0.2rem 0.55rem',
                      marginBottom: '0.85rem'
                    }}>
                      {item.source}
                    </div>

                    <div style={{ fontSize: '0.825rem', color: '#334155', lineHeight: 1.55, marginBottom: '1rem' }}>
                      <strong style={{ color: '#0A302A' }}>Treatment Consultation:</strong> {item.conditions}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #E2ECE6', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.775rem' }}>
                    <span style={{ color: '#0A302A', fontWeight: 700 }}>{item.frequency}</span>
                    <span style={{ color: '#64748B', fontWeight: 600 }}>{item.timing}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Reception Consultation Assistance Bar (Direct Info, No Fake Clicking) */}
            <div style={{
              marginTop: '2rem',
              background: '#0A302A',
              color: '#FFFFFF',
              borderRadius: '4px',
              padding: '1.25rem 1.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.25rem'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#D1F8E3', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Visiting Specialist Information Desk
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.15rem' }}>
                  Is Hafte Ka Specialist Schedule Janne Ke Liye Reception Par Sampark Karein
                </div>
                <div style={{ fontSize: '0.825rem', color: '#E2ECE6', marginTop: '0.25rem' }}>
                  Mareez aane se pehle phone par doctor ke aane ka din aur timing confirm kar sakte hain.
                </div>
              </div>

              <div style={{
                background: '#D1F8E3',
                color: '#0A302A',
                padding: '0.75rem 1.25rem',
                borderRadius: '4px',
                fontWeight: 800,
                fontSize: '0.95rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}>
                <Phone size={17} color="#0A302A" />
                <span>Helpline: +91 99999 00000 / 0532-234567</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NURSING & PARAMEDICAL SUPPORT FACULTY */}
      <section className="container" style={{ maxWidth: '1080px', marginTop: '3.5rem' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#D1F8E3',
            color: '#0A302A',
            padding: '0.35rem 0.85rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '0.6rem'
          }}>
            <Users size={14} /> Clinical & Paramedical Support Team
          </div>
          <h2 style={{ fontSize: '1.9rem', color: '#0A302A', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
            Supporting Medical & Nursing Staff
          </h2>
          <p style={{ color: '#475569', fontSize: '0.975rem', maxWidth: '820px', lineHeight: 1.6 }}>
            Hospital me doctors ke sath 30+ se zyada trained nursing staff, laboratory technicians, trauma dressers aur pharmacy staff 24 ghante mareezon ki sewa me samarpit rehte hain.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {supportPillars.map((pillar, idx) => (
            <div 
              key={idx}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2ECE6',
                borderRadius: '4px',
                padding: '1.4rem',
                boxShadow: '0 2px 10px rgba(10, 48, 42, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '4px',
                  background: '#F4F9F6',
                  border: '1px solid #D1F8E3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  color: '#0A302A'
                }}>
                  {idx === 0 && <HeartPulse size={18} />}
                  {idx === 1 && <Microscope size={18} />}
                  {idx === 2 && <ShieldCheck size={18} />}
                  {idx === 3 && <Pill size={18} />}
                </div>

                <h4 style={{ fontSize: '1.05rem', color: '#0A302A', fontWeight: 800, marginBottom: '0.3rem' }}>
                  {pillar.title}
                </h4>

                <div style={{ fontSize: '0.775rem', color: '#134E43', fontWeight: 700, marginBottom: '0.75rem' }}>
                  {pillar.role}
                </div>

                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
                  {pillar.desc}
                </p>
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '1rem', paddingTop: '0.65rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0A302A', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={13} color="#0A302A" /> 24/7 Hospital Floor Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. PATIENT OPD VISIT & CONSULTATION PROTOCOL (पर्ची व परामर्श नियम) */}
      <section className="container" style={{ maxWidth: '1080px', marginTop: '3.5rem' }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2ECE6',
          borderRadius: '4px',
          padding: '2rem 1.75rem',
          boxShadow: '0 4px 14px rgba(10, 48, 42, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <FileText size={18} color="#0A302A" />
            <h3 style={{ fontSize: '1.25rem', color: '#0A302A', fontWeight: 800, margin: 0 }}>
              OPD Consultation Guide (पर्ची व परामर्श प्रक्रिया)
            </h3>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            Chaudhary Health Care Center me bina kisi jhanjhat ke aasan walk-in parikshan suvidha uplabdh hai:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: '#F8FCFA', border: '1px solid #E2ECE6', borderRadius: '4px', padding: '1.15rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0A302A', marginBottom: '0.35rem' }}>
                1. पर्ची कटवाएं (Registration Slip)
              </div>
              <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
                Ground floor par reception counter par aakar apna naam, umra aur samasya darj karwayen aur OPD registration slip lein.
              </p>
            </div>

            <div style={{ background: '#F8FCFA', border: '1px solid #E2ECE6', borderRadius: '4px', padding: '1.15rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0A302A', marginBottom: '0.35rem' }}>
                2. चेम्बर में प्रतीक्षा (Assigned Chamber)
              </div>
              <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
                Slip par diye gaye chamber number (Chamber 1 se 4) ke samne waiting area me baith kar apne token number ka intezar karein.
              </p>
            </div>

            <div style={{ background: '#F8FCFA', border: '1px solid #E2ECE6', borderRadius: '4px', padding: '1.15rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0A302A', marginBottom: '0.35rem' }}>
                3. चिकित्सक परामर्श (Doctor Checkup)
              </div>
              <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
                Duty doctor dwaara blood pressure, sugar, tapman aur samasya ka gahan nidan aur sahi chikitsa salah di jayegi.
              </p>
            </div>

            <div style={{ background: '#F8FCFA', border: '1px solid #E2ECE6', borderRadius: '4px', padding: '1.15rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0A302A', marginBottom: '0.35rem' }}>
                4. दवा व पैथोलॉजी (In-House Pharmacy/Lab)
              </div>
              <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
                Doctor ke likhe anusaar aspatal ke medical store se shuddh dawa lein aur avashyakta padne par turant jaanch karwayen.
              </p>
            </div>
          </div>

          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #E2ECE6',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.85rem',
            color: '#B91C1C',
            fontWeight: 700
          }}>
            <AlertCircle size={18} color="#B91C1C" style={{ flexShrink: 0 }} />
            <span>
              Emergency Notice: Gambhir roop se beemar ya durghatna-grasth mareezon ko bina line ke seedhe Casualty / Emergency Ward me le jayen, jahan Duty Medical Officer 24 ghante upasthit rehte hain.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Doctors;
