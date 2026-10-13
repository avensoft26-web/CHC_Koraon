import { Link } from 'react-router-dom';
import { 
  Building2, ShieldCheck, Award, Heart, CheckCircle2, 
  Calendar, ArrowRight, Sparkles, Stethoscope, Users
} from 'lucide-react';

const About = () => {
  return (
    <div className="animate-fade-in" style={{ background: '#F8FCFA', minHeight: '100vh', paddingBottom: '6rem' }}>
      {/* HEADER BANNER - CRYSTAL CLEAR */}
      <section style={{ 
        background: '#FFFFFF', 
        padding: '4.5rem 0 3.5rem',
        borderBottom: '1px solid #E2ECE6',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          <div style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#D1F8E3',
            color: '#0A302A',
            padding: '0.45rem 1.1rem',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '1.25rem'
          }}>
            <Building2 size={14} /> Our Heritage & Mission
          </div>
          
          <h1 style={{ 
            color: '#0A302A', 
            fontSize: '3rem', 
            fontWeight: 800, 
            marginBottom: '1rem', 
            letterSpacing: '-0.025em',
            lineHeight: 1.15
          }}>
            About Chaudhary Health Care Center
          </h1>
          
          <p style={{ 
            color: '#475569', 
            fontSize: '1.1rem', 
            maxWidth: '680px', 
            margin: '0 auto', 
            lineHeight: 1.65 
          }}>
            Founded with the conviction that every patient in Koraon, Prayagraj deserves compassionate, dependable, and high-standard clinical care.
          </p>
        </div>
      </section>

      {/* MAIN STORY & EDITORIAL SECTION */}
      <section className="container" style={{ marginTop: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', alignItems: 'center', gap: '3.5rem' }}>
          <div>
            <div style={{ 
              display: 'inline-block',
              background: '#D1F8E3',
              color: '#0A302A',
              padding: '0.35rem 0.9rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.825rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem'
            }}>
              Patient-Centric Care
            </div>
            
            <h2 style={{ 
              color: '#0A302A', 
              fontSize: '2.25rem', 
              fontWeight: 800, 
              letterSpacing: '-0.02em', 
              lineHeight: 1.25, 
              marginBottom: '1.25rem' 
            }}>
              Pioneering Ethical Healthcare in Koraon
            </h2>
            
            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              Chaudhary Health Care Center was established to bring reliable, modern healthcare infrastructure directly to Koraon and surrounding rural communities across Prayagraj.
            </p>
            
            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
              Before our inception, families frequently faced strenuous travel to distant cities for basic diagnostic reports, pediatric care, or emergency stabilization. We created a medical institution where clinical competence meets deep human empathy.
            </p>

            {/* Key Metrics Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2.5rem' }}>
              <div style={{ 
                padding: '1.25rem', 
                background: '#FFFFFF', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid #E2ECE6',
                boxShadow: '0 2px 8px rgba(10, 48, 42, 0.04)'
              }}>
                <div style={{ fontWeight: 800, fontSize: '1.85rem', color: '#0A302A', marginBottom: '0.2rem' }}>
                  100%
                </div>
                <div style={{ fontWeight: 700, color: '#0A302A', fontSize: '0.95rem' }}>
                  Sterilization Standard
                </div>
                <div style={{ fontSize: '0.825rem', color: '#526477', marginTop: '0.25rem' }}>
                  Strict daily protocol in wards & OPD.
                </div>
              </div>

              <div style={{ 
                padding: '1.25rem', 
                background: '#FFFFFF', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid #E2ECE6',
                boxShadow: '0 2px 8px rgba(10, 48, 42, 0.04)'
              }}>
                <div style={{ fontWeight: 800, fontSize: '1.85rem', color: '#0A302A', marginBottom: '0.2rem' }}>
                  24/7
                </div>
                <div style={{ fontWeight: 700, color: '#0A302A', fontSize: '0.95rem' }}>
                  Emergency Readiness
                </div>
                <div style={{ fontSize: '0.825rem', color: '#526477', marginTop: '0.25rem' }}>
                  Continuous on-call doctor & ambulance.
                </div>
              </div>
            </div>

            {/* CTA Buttons Matching Screenshot */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link 
                to="/appointment" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  background: '#0A302A',
                  color: '#FFFFFF',
                  padding: '0.85rem 1.75rem',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  boxShadow: '0 6px 18px rgba(10, 48, 42, 0.25)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#134E43'}
                onMouseOut={(e) => e.currentTarget.style.background = '#0A302A'}
              >
                <Calendar size={17} /> Schedule Visit
              </Link>

              <Link 
                to="/doctors" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  background: '#D1F8E3',
                  color: '#0A302A',
                  padding: '0.85rem 1.6rem',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  border: '1px solid rgba(10, 48, 42, 0.12)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#BFF2D6'}
                onMouseOut={(e) => e.currentTarget.style.background = '#D1F8E3'}
              >
                <Building2 size={17} /> Specialties & Team
              </Link>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <img 
              src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Hospital Facility"
              style={{ 
                borderRadius: 'var(--radius-xl)', 
                width: '100%', 
                height: '460px', 
                objectFit: 'cover', 
                boxShadow: '0 20px 45px rgba(10, 48, 42, 0.12)',
                border: '1px solid #E2ECE6'
              }}
            />
            {/* Trust Floating Badge */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              background: '#FFFFFF',
              padding: '1rem 1.5rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 12px 30px rgba(10, 48, 42, 0.15)',
              border: '1px solid #E2ECE6',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#D1F8E3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0A302A',
                flexShrink: 0
              }}>
                <Heart size={20} fill="#0A302A" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0A302A' }}>
                  Compassion & Respect
                </div>
                <div style={{ fontSize: '0.8rem', color: '#526477' }}>
                  Every patient treated like family
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE GUIDING PRINCIPLES */}
      <section style={{ marginTop: '5rem', background: '#FFFFFF', padding: '5rem 0', borderTop: '1px solid #E2ECE6', borderBottom: '1px solid #E2ECE6' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ 
              display: 'inline-block',
              background: '#D1F8E3',
              color: '#0A302A',
              padding: '0.35rem 0.9rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.825rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem'
            }}>
              Guiding Principles
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0A302A', marginBottom: '0.75rem' }}>
              The Values That Shape Our Care
            </h2>
            <p style={{ color: '#475569', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.65 }}>
              Our clinical decisions, nursing care, and patient triage are governed by unwavering ethical commitments.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {[
              {
                title: "Clinical Integrity",
                desc: "We recommend only medical treatments and diagnostic tests that are genuinely required for the patient's recovery. Transparent prescriptions without commercial pressure.",
                icon: <ShieldCheck size={28} />
              },
              {
                title: "Human Empathy",
                desc: "Medical visits can be anxious and vulnerable times. We train our doctors, nurses, and support staff to listen patiently, explain diagnoses clearly, and offer reassurance.",
                icon: <Heart size={28} />
              },
              {
                title: "Affordable Excellence",
                desc: "High medical standards must remain accessible to the entire community. We maintain fair consultation and bed rates so no family is left without essential medical aid.",
                icon: <Award size={28} />
              }
            ].map((v, i) => (
              <div 
                key={i} 
                style={{ 
                  padding: '2.5rem',
                  background: '#F8FCFA',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid #E2ECE6',
                  transition: 'all 0.25s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#0A302A';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(10, 48, 42, 0.08)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#E2ECE6';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '16px', 
                  background: '#D1F8E3',
                  color: '#0A302A',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '1.5rem' 
                }}>
                  {v.icon}
                </div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', color: '#0A302A', fontWeight: 800 }}>
                  {v.title}
                </h3>
                <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.65, margin: 0 }}>
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
