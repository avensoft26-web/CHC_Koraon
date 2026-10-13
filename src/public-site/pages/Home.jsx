import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Stethoscope, Activity, ArrowRight, CheckCircle2, 
  ShieldPlus, HeartHandshake, Phone, HeartPulse, Clock, Star,
  Award, Users, ChevronDown, Ambulance, Sparkles, UserCheck,
  Thermometer, Bone, Baby, Syringe, Pill, MapPin, Check,
  Zap, ShieldCheck, Heart, Building2, ChevronLeft, ChevronRight
} from 'lucide-react';

const Home = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [activeFaq, setActiveFaq] = useState(0);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // Pinned Sticky Horizontal Scroll refs for Specialized Clinical Departments
  const deptContainerRef = useRef(null);
  const deptTrackRef = useRef(null);

  // Rotating Hero Banner Slides featuring real CHC Building, Doctor Team & Medical Store
  const heroSlides = [
    {
      id: 0,
      image: "./images/chc-building.jpg",
      fallback: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=85",
      title: "Chaudhary Health Care Center",
      badge: "ðŸ¥ CHC Hospital Campus â€¢ Koraon",
      subtitle: "Multi-Specialty Healthcare & Agilus Diagnostics",
      position: "75% center"
    },
    {
      id: 1,
      image: "./hero-doctors.jpg",
      fallback: "https://images.unsplash.com/photo-1551076805-e18690c5e561?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=85",
      title: "Expert Specialist Medical Team",
      badge: "ðŸ‘¨â€âš•ï¸ Specialist Doctors Team",
      subtitle: "General Medicine, Ortho & Pediatric Care",
      position: "75% top"
    },
    {
      id: 2,
      image: "./images/chaudhary-medical-store.jpg",
      fallback: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=85",
      title: "Chaudhary Medical Store",
      badge: "ðŸ’Š 24/7 Chaudhary Medical Store",
      subtitle: "100% Genuine Medicines & First Aid",
      position: "75% center"
    }
  ];

  // Auto-change hero banner image every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Comprehensive Clinical Departments Data with Dedicated Indian Medical Photos
  const clinicalDepartments = [
    {
      id: 0,
      category: 'emergency',
      icon: <Activity size={24} color="#0A302A" />,
      badge: "24/7 Red-Zone Trauma Bay",
      badgeColor: "#FEE2E2",
      badgeTextColor: "#991B1B",
      title: 'Emergency & Critical Care',
      tag: '24/7 Open',
      image: './images/symptom-emergency.jpg',
      tagline: 'Immediate trauma resuscitation, ICU stabilization, acute cardiac triage, and 24/7 ambulance dispatch in Koraon.',
      highlights: [
        'Zero-Delay Emergency Triage',
        'Oxygen ICU & Crash-Cart Ready',
        '24/7 Ambulance Dispatch Unit'
      ],
      doctor: 'Dr. A. K. Chaudhary & Trauma Team',
      link: '/appointment?service=Emergency'
    },
    {
      id: 1,
      category: 'general',
      icon: <Stethoscope size={24} color="#0A302A" />,
      badge: "Senior Consultant OPD",
      badgeColor: "#D1F8E3",
      badgeTextColor: "#0A302A",
      title: 'General & Family Medicine',
      tag: 'Top Specialist',
      image: './images/symptom-general-medicine.jpg',
      tagline: 'Comprehensive clinical diagnosis for seasonal viral fevers, diabetes, hypertension, infectious disease & preventive adult wellness.',
      highlights: [
        'Complete Adult Health Screenings',
        'Chronic Lifestyle Disease Care',
        'Preventive Family OPD Regimens'
      ],
      doctor: 'Dr. A. K. Chaudhary (Senior Consultant)',
      link: '/appointment?service=General%20Medicine'
    },
    {
      id: 2,
      category: 'pediatrics',
      icon: <Baby size={24} color="#0A302A" />,
      badge: "Child & Newborn Clinic",
      badgeColor: "#FEF3C7",
      badgeTextColor: "#92400E",
      title: 'Pediatrics & Child Care',
      tag: 'Child Friendly',
      image: './images/symptom-pediatrics.jpg',
      tagline: 'Gentle, compassionate pediatric treatment for infants, toddlers & growing children with government-aligned routine immunization.',
      highlights: [
        'Growth & Developmental Tracking',
        'Painless Child Vaccination Schedule',
        'Neonatal Infection & Colic Care'
      ],
      doctor: 'Dr. Meenakshi Sharma (Child Specialist)',
      link: '/appointment?service=Pediatrics'
    },
    {
      id: 3,
      category: 'orthopedics',
      icon: <Bone size={24} color="#0A302A" />,
      badge: "Bone & Joint Specialist",
      badgeColor: "#E0F2FE",
      badgeTextColor: "#0369A1",
      title: 'Orthopedics & Joint Care',
      tag: 'Expert Surgeon',
      image: './images/symptom-orthopedics.jpg',
      tagline: 'Specialized modern diagnosis & management of accidental fractures, arthritis stiffness, joint pain relief & post-injury rehab.',
      highlights: [
        'Plaster & Fracture Setting Unit',
        'Arthritis & Joint Pain Therapy',
        'Post-Trauma Bone Rehabilitation'
      ],
      doctor: 'Dr. S. Singh (Orthopedic Specialist)',
      link: '/appointment?service=Orthopedics'
    },
    {
      id: 4,
      category: 'diagnostic',
      icon: <Sparkles size={24} color="#0A302A" />,
      badge: "Agilus Diagnostics Partner",
      badgeColor: "#EDE9FE",
      badgeTextColor: "#5B21B6",
      title: 'Diagnostic Pathology Lab',
      tag: 'Same Day Reports',
      image: './images/symptom-diagnostics.jpg',
      tagline: 'Automated bio-chemistry & computerized hematology testing for blood counts, lipid, liver & kidney panels with rapid digital reports.',
      highlights: [
        'Automated Computerized Analyzers',
        'Same-Day Accurate Digital Reports',
        'Sterile Barcoded Sample Handling'
      ],
      doctor: 'Agilus Certified Lab Diagnostics Team',
      link: '/appointment?service=Diagnostics'
    },
    {
      id: 5,
      category: 'pharmacy',
      icon: <HeartHandshake size={24} color="#0A302A" />,
      badge: "24/7 Chaudhary Medical Store",
      badgeColor: "#D1F8E3",
      badgeTextColor: "#0A302A",
      title: 'Chaudhary Medical Store',
      tag: 'Always Stocked',
      image: './images/chaudhary-medical-store.jpg',
      tagline: '100% genuine prescription medicines, surgical bandages, cold-chain insulin, infant remedies, and first-aid kits round the clock.',
      highlights: [
        '100% Authentic Brand Medicines',
        'Insulin & Serum Cold Storage',
        '24/7 Direct Medicine Counter'
      ],
      doctor: 'Licensed Pharmacist On-Duty',
      link: '/contact'
    }
  ];

  // Department Sliding Constants
  const CARD_WIDTH = 340;
  const CARD_GAP = 24;
  const TOTAL_DEPTS = clinicalDepartments.length; // 6

  // Smooth scroll page to a specific department card
  const scrollDeptToStep = (targetStep) => {
    if (!deptContainerRef.current) return;
    if (window.innerWidth < 768) {
      if (deptTrackRef.current) {
        const targetCard = deptTrackRef.current.children[targetStep];
        if (targetCard) {
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
      return;
    }

    const container = deptContainerRef.current;
    const headerOffset = 80;
    const totalPinnedDistance = container.offsetHeight - window.innerHeight;
    if (totalPinnedDistance <= 0) return;

    const clampedStep = Math.max(0, Math.min(TOTAL_DEPTS - 1, targetStep));
    const targetProgress = clampedStep / (TOTAL_DEPTS - 1);
    const containerTop = container.offsetTop;
    const targetScrollY = containerTop - headerOffset + (targetProgress * totalPinnedDistance);

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    let animationFrameId = null;

    const updateDeptPosition = () => {
      if (!deptContainerRef.current || !deptTrackRef.current) return;

      // Mobile check (< 768px)
      if (window.innerWidth < 768) {
        deptTrackRef.current.style.transform = 'none';
        return;
      }

      const container = deptContainerRef.current;
      const rect = container.getBoundingClientRect();
      const headerOffset = 80;
      const totalPinnedDistance = container.offsetHeight - window.innerHeight;
      if (totalPinnedDistance <= 0) return;

      // Scrolled distance within this pinned container (0 to 1)
      const scrolled = -(rect.top - headerOffset);
      const progress = Math.max(0, Math.min(1, scrolled / totalPinnedDistance));

      // Calculate track translation
      const windowWidth = window.innerWidth;
      const containerPadding = Math.max(24, Math.min(60, (windowWidth - 1280) / 2 + 24));
      const totalTrackWidth = TOTAL_DEPTS * CARD_WIDTH + (TOTAL_DEPTS - 1) * CARD_GAP;

      // Start: Card 0 aligned with container margin (screen is full of cards from start!)
      const startX = containerPadding;
      // End: Last card (index 5) settles cleanly at the right margin (never leaves screen empty!)
      const endX = windowWidth - containerPadding - totalTrackWidth;
      const currentX = startX - (progress * (startX - endX));

      deptTrackRef.current.style.transform = `translate3d(${currentX}px, 0, 0)`;
    };

    const handleScroll = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(updateDeptPosition);
    };

    const handleResize = () => {
      updateDeptPosition();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    // Initial position check
    updateDeptPosition();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [clinicalDepartments.length]);

  const testimonials = [
    {
      name: "Rameshwar Prasad Patel",
      location: "Koraon Main Market, Prayagraj",
      review: "Chaudhary Health Care Center brings city-grade hospital treatment right here in Koraon. The doctors are polite, attentive, and the diagnostics reports were provided within hours.",
      rating: 5,
      date: "Family Medicine"
    },
    {
      name: "Sunita Devi Sharma",
      location: "Meja Road, Prayagraj",
      review: "The emergency trauma team was a lifesaver when my husband suffered acute chest discomfort at night. The nurses responded within seconds without paperwork hassles.",
      rating: 5,
      date: "Emergency Trauma Care"
    },
    {
      name: "Vikas Chandra Mishra",
      location: "Koraon Town",
      review: "Extremely hygienic hospital environment, no over-billing, and genuine medicines available 24/7 from their in-house medical store. A true blessing for Koraon families.",
      rating: 5,
      date: "Orthopedic Patient"
    }
  ];

  const faqs = [
    {
      q: "Where is Chaudhary Health Care Center located in Koraon?",
      a: "Our hospital is conveniently located in Koraon, Prayagraj, Uttar Pradesh (PIN 212306), easily accessible with dedicated parking and rapid ambulance bay."
    },
    {
      q: "Is emergency care and pharmacy available 24 hours a day?",
      a: "Yes. Our emergency unit, trauma stabilization team, and pharmacy operate 24 hours a day, 7 days a week, including all public holidays and weekends."
    },
    {
      q: "How can I book an appointment with a doctor?",
      a: "You can book an appointment online via our 'Book Appointment' page, where you receive a confirmed digital token number, or simply call our reception hotline at +91 99999 00000."
    },
    {
      q: "Do you have in-house diagnostic blood testing?",
      a: "Yes, we house a computerized diagnostic pathology laboratory for complete blood counts, blood sugar, lipid profiles, liver & kidney tests with same-day accurate digital results."
    }
  ];

  return (
    <div className="animate-fade-in">
      {/* UNIFIED CINEMATIC HERO SECTION (FULL-BLEED BACKGROUND - ZERO TWO-PART SPLIT) */}
      <section style={{ 
        position: 'relative', 
        minHeight: '680px',
        padding: '5.5rem 0 7rem',
        background: '#071828',
        color: 'white',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* ROTATING BACKGROUND SLIDESHOW (STARTS AFTER 20% FROM LEFT WITH SEAMLESS FADE) */}
        <div 
          className="hero-bg-slideshow"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: '20%',
            zIndex: 1,
            overflow: 'hidden'
          }}>
          {/* Crossfading Slide Images */}
          {heroSlides.map((slide, idx) => {
            const isActive = idx === currentHeroSlide;
            return (
              <div
                key={slide.id}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'scale(1)' : 'scale(1.04)',
                  transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1), transform 6s cubic-bezier(0.4, 0, 0.2, 1)',
                  pointerEvents: 'none'
                }}
              >
                <img 
                  src={slide.image} 
                  onError={(e) => {
                    e.currentTarget.src = slide.fallback;
                  }}
                  alt={slide.title}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    objectPosition: slide.position || '70% center',
                    filter: 'contrast(1.04) brightness(0.94)'
                  }}
                />
              </div>
            );
          })}

          {/* Smooth Left-Edge Gradient Fade: Matches #071828 exactly at the 20% mark, fading softly into clear image */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #071828 0%, rgba(7, 24, 40, 0.88) 18%, rgba(7, 24, 40, 0.45) 52%, rgba(7, 24, 40, 0.12) 100%)',
            pointerEvents: 'none'
          }} />

          {/* Bottom Vignette Blend into next section */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '140px',
            background: 'linear-gradient(0deg, #071828 0%, transparent 100%)',
            pointerEvents: 'none'
          }} />
        </div>

        {/* Right Floating Social/Hotline Strip (like reference template) */}
        <div 
          className="hero-floating-helpline"
          style={{
            position: 'absolute',
            right: 0,
            top: '40%',
            transform: 'translateY(-50%)',
          background: 'linear-gradient(180deg, #FF4D6D 0%, #E11D48 100%)',
          padding: '1.25rem 0.65rem',
          borderTopLeftRadius: '14px',
          borderBottomLeftRadius: '14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 10px 25px rgba(225, 29, 72, 0.4)',
          zIndex: 20
        }}>
          <a href="tel:+919999900000" title="Emergency Hotline" style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Phone size={18} />
          </a>
          <span style={{ 
            writingMode: 'vertical-rl', 
            textOrientation: 'mixed', 
            fontSize: '0.75rem', 
            fontWeight: 800, 
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'white'
          }}>
            24/7 HELPLINE
          </span>
        </div>

        {/* Hero Container Content */}
        <div className="container" style={{ position: 'relative', zIndex: 10, width: '100%' }}>
          <div className="hero-content-grid">
            {/* Left Typography (Matching user's reference landing page layout) */}
            <div style={{ position: 'relative', zIndex: 12 }}>
              {/* Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(16px)',
                padding: '0.45rem 1.15rem',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <span className="radar-ping">
                  <span className="live-indicator"></span>
                </span>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Chaudhary Health Care â€¢ Koraon, Prayagraj
                </span>
              </div>
              
              {/* Main Headline */}
              <h1 style={{ 
                fontSize: 'clamp(2.35rem, 6vw, 4.2rem)', 
                color: '#FFFFFF', 
                marginBottom: '1.25rem', 
                letterSpacing: '-0.035em', 
                lineHeight: 1.12,
                fontWeight: 800
              }}>
                Your Health Is <br />
                <span style={{
                  color: '#FFFFFF',
                  textShadow: '0 0 25px rgba(255,255,255,0.4)',
                  position: 'relative',
                  display: 'inline-block'
                }}>
                  Our Priority.
                </span>
              </h1>
              
              <p style={{ 
                fontSize: 'clamp(1rem, 2.6vw, 1.2rem)', 
                color: '#E0F2FE', 
                marginBottom: '2rem', 
                maxWidth: '520px', 
                lineHeight: 1.75,
                fontWeight: 400
              }}>
                Discover compassionate medical care, certified specialist doctors, advanced computerized diagnostics, and round-the-clock emergency support in Koraon.
              </p>

              {/* Action Buttons: Exact Schedule Visit & Specialties matching user design */}
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '2.5rem' }}>
                <Link 
                  to="/appointment" 
                  style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    background: '#0A302A',
                    color: '#FFFFFF',
                    padding: '1rem 2.2rem',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    boxShadow: '0 8px 24px rgba(10, 48, 42, 0.4)',
                    transition: 'all 0.25s ease'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#134E43'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#0A302A'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <Calendar size={20} color="#FFFFFF" />
                  <span>Schedule Visit</span>
                </Link>

                <a 
                  href="#departments" 
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('departments')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    background: '#D1F8E3',
                    color: '#0A302A',
                    padding: '1rem 2.2rem',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    border: '1px solid rgba(10, 48, 42, 0.12)',
                    boxShadow: '0 4px 14px rgba(209, 248, 227, 0.3)',
                    transition: 'all 0.25s ease',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#BFF2D6'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#D1F8E3'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <Building2 size={20} color="#0A302A" />
                  <span>Clinical Wings</span>
                </a>
              </div>

              {/* Trust Checkmarks */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.9rem', fontWeight: 600, color: '#F0F9FF' }}>
                  <CheckCircle2 color="#38BDF8" size={17} /> Certified Doctors
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.9rem', fontWeight: 600, color: '#F0F9FF' }}>
                  <CheckCircle2 color="#38BDF8" size={17} /> 24/7 Emergency Care
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.9rem', fontWeight: 600, color: '#F0F9FF' }}>
                  <CheckCircle2 color="#38BDF8" size={17} /> Zero Queue Online Token
                </div>
              </div>
            </div>

            {/* Right Side empty spacer to keep grid balanced without blocking doctors */}
            <div style={{ position: 'relative', height: '100%', minHeight: '380px' }} />
          </div>
        </div>
      </section>

      {/* GROUNDED 3-PILLAR CLINICAL STANDARDS (SINGLE UNIFIED FLOATING CARD) */}
      <section style={{ 
        position: 'relative', 
        zIndex: 25, 
        marginTop: '-52px', 
        marginBottom: '2.5rem' 
      }}>
        <div className="container">
          {/* One Single Unified Card Container */}
          <div 
            className="hero-pillars-card"
            style={{ 
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2ECE6',
              boxShadow: '0 16px 40px rgba(7, 24, 40, 0.09)',
              padding: '1.75rem 2.25rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2.5rem',
              alignItems: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 20px 48px rgba(10, 48, 42, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(10, 48, 42, 0.22)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(7, 24, 40, 0.09)';
              e.currentTarget.style.borderColor = '#E2ECE6';
            }}
          >
            {/* Pillar 1: 24/7 Emergency */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ 
                width: '54px', 
                height: '54px', 
                borderRadius: '14px', 
                background: '#D1F8E3',
                color: '#0A302A',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Ambulance size={26} color="#0A302A" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', color: '#0A302A', fontWeight: 800, marginBottom: '0.2rem' }}>
                  24/7 Emergency Care
                </h4>
                <p style={{ color: '#475569', fontSize: '0.875rem', margin: 0, lineHeight: 1.5 }}>
                  Immediate trauma resuscitation & ambulance dispatch in Koraon.
                </p>
              </div>
            </div>

            {/* Pillar 2: Specialist Consultation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ 
                width: '54px', 
                height: '54px', 
                borderRadius: '14px', 
                background: '#D1F8E3',
                color: '#0A302A',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Stethoscope size={26} color="#0A302A" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', color: '#0A302A', fontWeight: 800, marginBottom: '0.2rem' }}>
                  Qualified Specialists
                </h4>
                <p style={{ color: '#475569', fontSize: '0.875rem', margin: 0, lineHeight: 1.5 }}>
                  Board-certified doctors across internal medicine, ortho & pediatrics.
                </p>
              </div>
            </div>

            {/* Pillar 3: Modern Diagnostics */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ 
                width: '54px', 
                height: '54px', 
                borderRadius: '14px', 
                background: '#D1F8E3',
                color: '#0A302A',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Sparkles size={26} color="#0A302A" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', color: '#0A302A', fontWeight: 800, marginBottom: '0.2rem' }}>
                  Accurate Diagnostics
                </h4>
                <p style={{ color: '#475569', fontSize: '0.875rem', margin: 0, lineHeight: 1.5 }}>
                  Automated pathology lab with verified same-day test reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CREATIVE SECTION: 4-STEP CARE JOURNEY */}
      <section className="section" style={{ background: '#F8FAFC' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="badge-pill badge-blue" style={{ marginBottom: '0.75rem' }}>
              Smooth Patient Experience
            </div>
            <h2 className="section-title">Your 4-Step Journey to Full Recovery</h2>
            <p className="section-subtitle">
              We eliminate traditional hospital hassles, paperwork delays, and long lines with organized digital care.
            </p>
          </div>

          <div className="grid-4" style={{ gap: '2rem' }}>
            {[
              {
                step: "01",
                title: "Digital Token Booking",
                desc: "Book online or via phone in under 60 seconds to lock your preferred doctor's consultation time slot.",
                icon: <Calendar size={24} color="#0284C7" />
              },
              {
                step: "02",
                title: "Specialist Diagnosis",
                desc: "Meet board-certified physicians who spend dedicated time understanding your medical history and concerns.",
                icon: <Stethoscope size={24} color="#0284C7" />
              },
              {
                step: "03",
                title: "Accurate Lab Testing",
                desc: "Automated in-house biochemistry and blood tests deliver reliable digital reports directly to the doctor.",
                icon: <Sparkles size={24} color="#0284C7" />
              },
              {
                step: "04",
                title: "Prescription & Healing",
                desc: "Receive 100% genuine medicines from our 24/7 on-campus pharmacy with personalized lifestyle instructions.",
                icon: <ShieldCheck size={24} color="#0284C7" />
              }
            ].map((st, i) => (
              <div key={i} className="journey-step">
                <div style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontSize: '2.5rem', 
                  fontWeight: 900, 
                  color: 'rgba(2, 132, 199, 0.15)',
                  lineHeight: 1,
                  marginBottom: '0.75rem'
                }}>
                  {st.step}
                </div>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '14px',
                  background: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}>
                  {st.icon}
                </div>
                <h4 style={{ fontSize: '1.25rem', marginBottom: '0.65rem', color: 'var(--primary-navy)' }}>
                  {st.title}
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPECIALIZED CLINICAL DEPARTMENTS - PINNED STICKY HORIZONTAL SCROLL SHOWCASE */}
      <section 
        id="departments"
        ref={deptContainerRef}
        className="dept-pin-container"
      >
        <div className="dept-pin-sticky">
          {/* Header Row: Clean Title & Subtitle */}
          <div className="container" style={{ position: 'relative', zIndex: 10, width: '100%', marginBottom: '2rem' }}>
            <div style={{ maxWidth: '680px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: '#D1F8E3',
                color: '#0A302A',
                padding: '0.35rem 0.95rem',
                borderRadius: '4px',
                fontSize: '0.825rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
                border: '1px solid rgba(10, 48, 42, 0.15)'
              }}>
                <Building2 size={15} color="#0A302A" />
                <span>Comprehensive Treatments</span>
              </div>
              <h2 style={{ 
                color: '#0A302A', 
                fontSize: 'clamp(1.65rem, 3.2vw, 2.45rem)', 
                fontWeight: 800, 
                letterSpacing: '-0.025em', 
                marginBottom: '0.45rem' 
              }}>
                Specialized Clinical Departments
              </h2>
              <p style={{ 
                color: '#475569', 
                fontSize: '1rem', 
                lineHeight: 1.6, 
                margin: 0 
              }}>
                Explore our core clinical wings led by specialist consultants, modern diagnostic labs, and 24/7 emergency trauma care.
              </p>

              {/* Mobile-Only Swipe Indicator */}
              <div className="dept-mobile-swipe-badge">
                <ArrowRight size={13} />
                <span>Swipe cards to explore all {clinicalDepartments.length} wings</span>
              </div>
            </div>
          </div>

          {/* Horizontal Sliding Track of Cards */}
          <div className="dept-track-wrapper" style={{ width: '100%', overflow: 'hidden', position: 'relative' }}>
            <div 
              ref={deptTrackRef}
              className="dept-cards-track"
            >
              {clinicalDepartments.map((dept) => (
                <div 
                  key={dept.id}
                  className="dept-card-item"
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 12px 35px rgba(10, 48, 42, 0.08)',
                    border: '1px solid #E2ECE6',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 18px 40px rgba(10, 48, 42, 0.14)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(10, 48, 42, 0.08)';
                  }}
                >
                  {/* Top Image Banner */}
                  <div style={{ position: 'relative', height: '165px', width: '100%', overflow: 'hidden' }}>
                    <img 
                      src={dept.image} 
                      alt={dept.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center'
                      }}
                    />
                  </div>

                  {/* Card Content Body */}
                  <div style={{ padding: '1.15rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <h3 style={{ 
                      fontSize: '1.2rem', 
                      fontWeight: 800, 
                      color: '#0A302A', 
                      marginBottom: '0.4rem',
                      lineHeight: 1.3
                    }}>
                      {dept.title}
                    </h3>
                    
                    <p style={{ 
                      color: '#475569', 
                      fontSize: '0.875rem', 
                      lineHeight: 1.55, 
                      marginBottom: '0.85rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {dept.tagline}
                    </p>

                    {/* Highlights Bullet List */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.4rem', 
                      marginBottom: '1rem',
                      padding: '0.65rem 0.85rem',
                      background: '#F8FCFA',
                      borderRadius: '4px',
                      border: '1px solid #E2ECE6'
                    }}>
                      {dept.highlights.map((point, pIdx) => (
                        <div key={pIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#0F172A', fontWeight: 600 }}>
                          <CheckCircle2 size={14} color="#10B981" style={{ flexShrink: 0 }} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{point}</span>
                        </div>
                      ))}
                    </div>

                    {/* Doctor Info & Action Button */}
                    <div style={{ 
                      marginTop: 'auto', 
                      borderTop: '1px solid #E2E8F0', 
                      paddingTop: '0.85rem', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', color: '#475569', fontWeight: 600, minWidth: 0, flex: 1, overflow: 'hidden' }}>
                        <UserCheck size={15} color="#0A302A" style={{ flexShrink: 0 }} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {dept.doctor}
                        </span>
                      </div>

                      <Link 
                        to={dept.link}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: '#0A302A',
                          color: '#FFFFFF',
                          padding: '0.45rem 0.95rem',
                          borderRadius: '4px',
                          fontSize: '0.825rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          transition: 'background 0.2s ease',
                          whiteSpace: 'nowrap',
                          flexShrink: 0
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#134E43'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#0A302A'}
                      >
                        <span>Consult</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CREATIVE SECTION: 24/7 EMERGENCY SOS BANNER */}
      <section className="container" style={{ margin: '5rem auto 4rem' }}>
        <div className="live-sos-banner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ maxWidth: '650px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.2)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-pill)', fontSize: '0.825rem', fontWeight: 700, marginBottom: '1rem' }}>
                <Ambulance size={16} /> EMERGENCY DISPATCH UNIT
              </div>
              <h3 className="sos-banner-heading" style={{ fontSize: '2.4rem', color: 'white', marginBottom: '0.75rem', lineHeight: 1.2 }}>
                Critical Emergency? We Are Ready 24 Hours a Day.
              </h3>
              <p style={{ color: '#FEE2E2', fontSize: '1.1rem', lineHeight: 1.6 }}>
                Immediate doctor-led triage for severe trauma, acute cardiac symptoms, respiratory distress, and poisoning. Dedicated ambulance ready to deploy in Koraon.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
              <a 
                href="tel:+919999900000" 
                className="btn sos-call-btn" 
                style={{ 
                  background: '#FFFFFF', 
                  color: '#B91C1C', 
                  padding: '1.1rem 2.5rem', 
                  fontSize: '1.25rem', 
                  fontWeight: 800,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)' 
                }}
              >
                <Phone size={22} color="#B91C1C" /> Call Emergency: +91 99999 00000
              </a>
              <span style={{ fontSize: '0.875rem', color: '#FECACA' }}>
                ðŸ“ Instant arrival point: Koraon, Prayagraj
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* PATIENT TESTIMONIALS */}
      <section className="section" style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="badge-pill badge-blue" style={{ marginBottom: '0.75rem' }}>
              Community Trust
            </div>
            <h2 className="section-title">Words from Patients We Have Healed</h2>
            <p className="section-subtitle">
              Authentic feedback from families who visited Chaudhary Health Care Center in Koraon.
            </p>
          </div>

          <div className="grid-3">
            {testimonials.map((t, idx) => (
              <div key={idx} className="card-premium" style={{ background: '#FFFFFF', padding: '2.25rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem' }}>
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={18} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
                <p style={{ fontSize: '1.05rem', color: 'var(--primary-navy)', fontStyle: 'italic', marginBottom: '1.5rem', lineHeight: 1.65 }}>
                  "{t.review}"
                </p>
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.975rem', color: 'var(--primary-navy)' }}>{t.name}</div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{t.location}</div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-blue)', background: '#F1F5F9', padding: '0.25rem 0.65rem', borderRadius: '4px' }}>
                    {t.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE FAQ ACCORDION */}
      <section className="section">
        <div className="container" style={{ maxWidth: '850px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="badge-pill badge-teal" style={{ marginBottom: '0.75rem' }}>
              Common Inquiries
            </div>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">
              Important details about visiting times, doctor consultations, and diagnostic tests.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index} 
                  style={{ 
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? -1 : index)}
                    style={{
                      width: '100%',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'var(--font-body)',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      color: isOpen ? 'var(--primary-blue)' : 'var(--primary-navy)'
                    }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown 
                      size={20} 
                      style={{ 
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                        flexShrink: 0
                      }} 
                    />
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 1.5rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.975rem', lineHeight: 1.6 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION BANNER */}
      <section style={{ 
        background: 'linear-gradient(135deg, #0A192F 0%, #1E293B 100%)',
        padding: '5rem 0',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <div className="badge-pill" style={{ background: 'rgba(2, 132, 199, 0.2)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.4)', marginBottom: '1.25rem' }}>
            Instant OPD Registration
          </div>
          <h2 style={{ color: 'white', fontSize: 'clamp(1.85rem, 5.5vw, 3rem)', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            Prioritize Your Health with Koraon's Trusted Hospital
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '1.2rem', maxWidth: '680px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Schedule an in-person doctor appointment online today and avoid waiting in long queues.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <Link to="/appointment" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              Request Doctor Appointment Online
            </Link>
            <a href="tel:+919999900000" className="btn btn-outline-white" style={{ padding: '1rem 2.2rem', fontSize: '1.1rem' }}>
              <Phone size={18} /> Call +91 99999 00000
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

