import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, Building2, Check, ArrowRight, Calendar } from 'lucide-react';

const Facilities = () => {
  const facilities = [
    {
      title: "Inpatient Recovery Wards & Private Rooms",
      tag: "Clean & Climate Controlled",
      desc: "Designed with patient tranquility and hygiene at the forefront. Every bed features ergonomic adjustability, 24/7 nursing call buttons, oxygen supply ports, and sanitized individual washrooms.",
      image: "https://images.unsplash.com/photo-1538108149393-cebb47cbdc4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      specs: [
        "Continuous patient vitals monitoring & bedside nursing",
        "Strict daily sterilization and anti-microbial cleaning",
        "Spacious attendant seating & climate control",
        "Dietary meal provision tailored to patient recovery"
      ]
    },
    {
      title: "Modern Pathology & Diagnostic Center",
      tag: "Automated Digital Accuracy",
      desc: "Equipped with automated clinical chemistry analyzers and cell counters to provide fast, reliable blood and fluid tests without relying on distant urban laboratories.",
      image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      specs: [
        "Automated hematology & biochemistry analyzers",
        "Sterilized, single-use vacuum collection tubes",
        "Routine diagnostic reports delivered same day",
        "Direct digital delivery of test records to doctor"
      ]
    },
    {
      title: "24/7 In-House Medical Pharmacy",
      tag: "Authentic Medicines Guaranteed",
      desc: "A fully licensed, temperature-regulated on-site pharmacy stocked with critical emergency drugs, chronic medications, surgical dressings, and pediatrician-recommended pediatric formulations.",
      image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      specs: [
        "Direct manufacturer sourcing ensuring genuine brands",
        "Continuous cold-chain maintenance for vaccines & insulins",
        "Open 24 hours including Sundays and holidays",
        "Registered pharmacist consultation for dosage clarity"
      ]
    },
    {
      title: "Emergency Trauma Unit & Ambulance Service",
      tag: "Instant Response Triage",
      desc: "Prepared for rapid patient stabilization during road accidents, acute chest pain, respiratory distress, and dehydration. Supported by dedicated ambulance transport across Koraon.",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      specs: [
        "Emergency defibrillator & multipara vitals monitors",
        "Continuous medical oxygen manifolds & nebulizers",
        "Immediate surgical suture & wound dressing kits",
        "GPS-enabled ambulance with paramedic assistance"
      ]
    }
  ];

  return (
    <div className="animate-fade-in" style={{ background: '#F8FCFA', minHeight: '100vh', paddingBottom: '6rem' }}>
      {/* CRYSTAL-CLEAR HEADER SECTION */}
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
            <Building2 size={14} /> Hospital Infrastructure
          </div>

          <h1 style={{ 
            color: '#0A302A', 
            fontSize: '3rem', 
            marginBottom: '1rem',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            lineHeight: 1.15
          }}>
            Hospital Facilities & Infrastructure
          </h1>

          <p style={{ 
            color: '#475569', 
            fontSize: '1.1rem', 
            maxWidth: '650px', 
            margin: '0 auto',
            lineHeight: 1.65
          }}>
            High-standard clinical environments engineered for patient comfort, rapid diagnosis, and safe healing in Koraon.
          </p>
        </div>
      </section>

      {/* FACILITIES SHOWCASE LIST */}
      <section className="container" style={{ marginTop: '4rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
          {facilities.map((fac, idx) => (
            <div 
              key={idx} 
              style={{ 
                background: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid #E2ECE6',
                overflow: 'hidden', 
                display: 'grid', 
                gridTemplateColumns: idx % 2 === 0 ? '1fr 1.1fr' : '1.1fr 1fr',
                boxShadow: '0 6px 22px rgba(10, 48, 42, 0.04)',
                alignItems: 'center',
                transition: 'all 0.25s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 16px 36px rgba(10, 48, 42, 0.09)';
                e.currentTarget.style.borderColor = '#0A302A';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 22px rgba(10, 48, 42, 0.04)';
                e.currentTarget.style.borderColor = '#E2ECE6';
              }}
            >
              {/* Image Column */}
              <div style={{ 
                order: idx % 2 === 0 ? 1 : 2, 
                height: '100%', 
                minHeight: '380px',
                position: 'relative' 
              }}>
                <img 
                  src={fac.image} 
                  alt={fac.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: '#FFFFFF',
                  color: '#0A302A',
                  padding: '0.4rem 1rem',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 2px 8px rgba(10, 48, 42, 0.15)'
                }}>
                  <ShieldCheck size={14} color="#0A302A" /> {fac.tag}
                </div>
              </div>

              {/* Text Column */}
              <div style={{ 
                order: idx % 2 === 0 ? 2 : 1, 
                padding: '3rem' 
              }}>
                <div style={{ 
                  display: 'inline-block',
                  background: '#D1F8E3',
                  color: '#0A302A',
                  fontSize: '0.8rem', 
                  fontWeight: 800, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.04em', 
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-pill)',
                  marginBottom: '0.75rem'
                }}>
                  Facility 0{idx + 1}
                </div>

                <h3 style={{ fontSize: '1.75rem', marginBottom: '0.85rem', color: '#0A302A', fontWeight: 800 }}>
                  {fac.title}
                </h3>

                <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.65, marginBottom: '1.75rem' }}>
                  {fac.desc}
                </p>

                {/* Features Checklist */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0A302A', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Facility Features:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.65rem' }}>
                    {fac.specs.map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.925rem', color: '#334155' }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: '#D1F8E3',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Check size={12} color="#0A302A" strokeWidth={3} />
                        </div>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pill Buttons Matching Screenshot */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link 
                    to="/appointment" 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: '#0A302A',
                      color: '#FFFFFF',
                      padding: '0.8rem 1.6rem',
                      borderRadius: 'var(--radius-pill)',
                      fontWeight: 700,
                      fontSize: '0.925rem',
                      boxShadow: '0 4px 14px rgba(10, 48, 42, 0.2)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#134E43';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#0A302A';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Calendar size={16} /> Schedule Visit
                  </Link>

                  <Link 
                    to="/services" 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: '#D1F8E3',
                      color: '#0A302A',
                      padding: '0.8rem 1.5rem',
                      borderRadius: 'var(--radius-pill)',
                      fontWeight: 700,
                      fontSize: '0.925rem',
                      border: '1px solid rgba(10, 48, 42, 0.12)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#BFF2D6';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#D1F8E3';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Building2 size={16} /> Specialties
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Facilities;
