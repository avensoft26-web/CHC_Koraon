import { useState } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight, Building2, Sparkles } from 'lucide-react';

const Gallery = () => {
  const [filter, setFilter] = useState('all');
  const [activeImageIndex, setActiveImageIndex] = useState(null);

  const images = [
    { 
      src: "./images/chc-building.jpg", 
      alt: "Chaudhary Health Care Center - Main Entrance",
      category: "exterior",
      title: "Chaudhary Health Care Center (Main Entrance)",
      desc: "Modern multi-floor healthcare center with 24/7 emergency bay and Agilus diagnostics in Koraon."
    },
    { 
      src: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", 
      alt: "Reception & Waiting Lounge",
      category: "interior",
      title: "Reception & Triage Desk",
      desc: "Warm, air-conditioned reception providing swift appointment registrations."
    },
    { 
      src: "https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", 
      alt: "Inpatient Ward Bed",
      category: "wards",
      title: "Private Inpatient Care Rooms",
      desc: "Clean, hygienic recovery rooms equipped with modern medical beds."
    },
    { 
      src: "https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", 
      alt: "Diagnostic Laboratory",
      category: "diagnostics",
      title: "Automated Diagnostic Pathology Lab",
      desc: "High-precision testing instruments for fast and accurate medical reports."
    },
    { 
      src: "https://images.unsplash.com/photo-1551076805-e18690c5e561?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", 
      alt: "Medical Consultation Team",
      category: "staff",
      title: "Doctors & Clinical Nursing Team",
      desc: "Experienced, compassionate healthcare professionals working together."
    },
    { 
      src: "./images/chaudhary-medical-store.jpg", 
      alt: "à¤šà¥Œà¤§à¤°à¥€ à¤®à¥‡à¤¡à¤¿à¤•à¤² à¤¸à¥à¤Ÿà¥‹à¤° - Chaudhary Medical Store",
      category: "pharmacy",
      title: "à¤šà¥Œà¤§à¤°à¥€ à¤®à¥‡à¤¡à¤¿à¤•à¤² à¤¸à¥à¤Ÿà¥‹à¤° (Chaudhary Medical Store)",
      desc: "24/7 in-house medical store with genuine medicines and healthcare essentials."
    }
  ];

  const filteredImages = filter === 'all' 
    ? images 
    : images.filter(img => img.category === filter);

  const openLightbox = (index) => {
    setActiveImageIndex(index);
  };

  const closeLightbox = () => {
    setActiveImageIndex(null);
  };

  const nextImage = () => {
    if (activeImageIndex !== null) {
      setActiveImageIndex((activeImageIndex + 1) % filteredImages.length);
    }
  };

  const prevImage = () => {
    if (activeImageIndex !== null) {
      setActiveImageIndex((activeImageIndex - 1 + filteredImages.length) % filteredImages.length);
    }
  };

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
            <Building2 size={14} /> Hospital Tour
          </div>

          <h1 style={{ 
            color: '#0A302A', 
            fontSize: '3rem', 
            marginBottom: '1rem',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            lineHeight: 1.15
          }}>
            Hospital Gallery & Infrastructure
          </h1>

          <p style={{ 
            color: '#475569', 
            fontSize: '1.1rem', 
            maxWidth: '650px', 
            margin: '0 auto 2.5rem',
            lineHeight: 1.65
          }}>
            Explore our sanitized care environments, diagnostic labs, patient wards, and 24/7 medical pharmacy in Koraon.
          </p>

          {/* Clean Category Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.55rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Photos' },
              { id: 'exterior', label: 'Entrance & Triage' },
              { id: 'wards', label: 'Patient Rooms' },
              { id: 'diagnostics', label: 'Laboratory' },
              { id: 'pharmacy', label: 'Pharmacy' },
              { id: 'staff', label: 'Medical Team' }
            ].map(tab => {
              const isSelected = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  style={{
                    padding: '0.55rem 1.3rem',
                    borderRadius: 'var(--radius-pill)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: isSelected ? '1px solid #0A302A' : '1px solid #E2ECE6',
                    background: isSelected ? '#0A302A' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#334155',
                    boxShadow: isSelected ? '0 4px 12px rgba(10, 48, 42, 0.18)' : 'none'
                  }}
                  onMouseOver={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = '#D1F8E3';
                      e.currentTarget.style.color = '#0A302A';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = '#FFFFFF';
                      e.currentTarget.style.color = '#334155';
                    }
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* GALLERY GRID */}
      <section className="container" style={{ marginTop: '3.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
          {filteredImages.map((img, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid #E2ECE6',
                boxShadow: '0 4px 16px rgba(10, 48, 42, 0.04)',
                transition: 'all 0.25s ease'
              }}
              onClick={() => openLightbox(idx)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 16px 36px rgba(10, 48, 42, 0.1)';
                e.currentTarget.style.borderColor = '#0A302A';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(10, 48, 42, 0.04)';
                e.currentTarget.style.borderColor = '#E2ECE6';
              }}
            >
              <div style={{ position: 'relative', height: '280px', overflow: 'hidden' }}>
                <img 
                  src={img.src} 
                  alt={img.alt} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover', 
                    transition: 'transform 0.4s ease' 
                  }}
                />
                
                {/* Clean Caption Overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent 40%, rgba(10, 48, 42, 0.85) 100%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '1.5rem'
                }}>
                  <div style={{ color: 'white' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.25rem', color: '#FFFFFF' }}>
                      {img.title}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#D1F8E3', opacity: 0.9 }}>
                      {img.desc}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      {activeImageIndex !== null && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          background: 'rgba(10, 48, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          {/* Top Bar with Counter and Close */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white',
            zIndex: 10
          }}>
            <div style={{ 
              fontSize: '0.9rem', 
              fontWeight: 700, 
              background: '#D1F8E3', 
              color: '#0A302A',
              padding: '0.4rem 1.1rem', 
              borderRadius: 'var(--radius-pill)' 
            }}>
              Photo {activeImageIndex + 1} of {filteredImages.length}
            </div>

            <button
              onClick={closeLightbox}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#D1F8E3'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              <X size={20} color="#FFFFFF" />
            </button>
          </div>

          {/* Main Image */}
          <div style={{ position: 'relative', maxWidth: '900px', width: '100%', maxHeight: '75vh', display: 'flex', justifyContent: 'center' }}>
            <img 
              src={filteredImages[activeImageIndex].src} 
              alt={filteredImages[activeImageIndex].alt} 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '75vh', 
                objectFit: 'contain', 
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
              }} 
            />
          </div>

          {/* Caption */}
          <div style={{ marginTop: '1.25rem', textAlign: 'center', color: 'white' }}>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', fontWeight: 800 }}>
              {filteredImages[activeImageIndex].title}
            </h4>
            <p style={{ color: '#D1F8E3', margin: 0, fontSize: '0.95rem' }}>
              {filteredImages[activeImageIndex].desc}
            </p>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#D1F8E3'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <ChevronLeft size={28} />
          </button>

          <button
            onClick={nextImage}
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#D1F8E3'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <ChevronRight size={28} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Gallery;

