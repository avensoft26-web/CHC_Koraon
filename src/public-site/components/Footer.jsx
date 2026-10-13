import { Link } from 'react-router-dom';
import { HeartPulse, MapPin, Phone, Clock, Mail, ShieldCheck, ChevronUp, Calendar, Building2 } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{ 
      background: '#0A302A', 
      color: '#E2ECE6', 
      padding: '4.5rem 0 2rem',
      position: 'relative',
      borderTop: '1px solid rgba(209, 248, 227, 0.12)'
    }}>
      <div className="container">
        {/* Top Footer Banner */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(209, 248, 227, 0.15)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem 3rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '2rem',
          marginBottom: '4rem'
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#D1F8E3', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
              Immediate Medical Help
            </div>
            <h3 style={{ color: 'white', fontSize: '1.75rem', margin: 0, fontWeight: 800 }}>
              Need Urgent Clinical Attention in Koraon?
            </h3>
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
                padding: '0.8rem 1.6rem',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 800,
                fontSize: '0.925rem',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#BFF2D6'}
              onMouseOut={(e) => e.currentTarget.style.background = '#D1F8E3'}
            >
              <Phone size={16} /> 24/7 Hotline: +91 99999 00000
            </a>

            <Link 
              to="/appointment" 
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                padding: '0.8rem 1.6rem',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 700,
                fontSize: '0.925rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
            >
              <Calendar size={16} /> Schedule Visit
            </Link>
          </div>
        </div>

        {/* 4 Column Footer Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '3rem', marginBottom: '3.5rem' }}>
          {/* Brand Col */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ 
                width: '42px', 
                height: '42px', 
                borderRadius: '12px', 
                background: '#D1F8E3',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#0A302A'
              }}>
                <HeartPulse size={24} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: '#FFFFFF', lineHeight: 1.1 }}>
                  CHAUDHARY
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', color: '#D1F8E3' }}>
                  Health Care Center
                </div>
              </div>
            </Link>

            <p style={{ color: '#CBD8D2', fontSize: '0.925rem', lineHeight: 1.65, marginBottom: '1.5rem' }}>
              Delivering high-standard multi-specialty healthcare, 24/7 emergency response, automated diagnostics, and transparent care to the citizens of Koraon, Prayagraj.
            </p>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(209, 248, 227, 0.12)', color: '#D1F8E3', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 700 }}>
              <ShieldCheck size={14} /> Certified Healthcare Provider
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '1.25rem', fontWeight: 800 }}>Hospital Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0 }}>
              <li><Link to="/" style={{ color: '#CBD8D2', fontSize: '0.925rem', transition: 'color 0.2s ease' }}>Hospital Home</Link></li>
              <li><Link to="/doctors" style={{ color: '#CBD8D2', fontSize: '0.925rem', transition: 'color 0.2s ease' }}>Our Doctors & Team</Link></li>
              <li><Link to="/about" style={{ color: '#CBD8D2', fontSize: '0.925rem', transition: 'color 0.2s ease' }}>About CHC Hospital</Link></li>
              <li><Link to="/gallery" style={{ color: '#CBD8D2', fontSize: '0.925rem', transition: 'color 0.2s ease' }}>Photo Gallery</Link></li>
              <li><Link to="/contact" style={{ color: '#CBD8D2', fontSize: '0.925rem', transition: 'color 0.2s ease' }}>Location & Contact Us</Link></li>
            </ul>
          </div>

          {/* Clinical Services */}
          <div>
            <h4 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '1.25rem', fontWeight: 800 }}>Clinical Specialties</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0 }}>
              <li><Link to="/contact" style={{ color: '#CBD8D2', fontSize: '0.925rem' }}>Emergency 24x7 Triage</Link></li>
              <li><Link to="/doctors" style={{ color: '#CBD8D2', fontSize: '0.925rem' }}>General Medicine OPD</Link></li>
              <li><Link to="/doctors" style={{ color: '#CBD8D2', fontSize: '0.925rem' }}>Pediatrics & Child Care</Link></li>
              <li><Link to="/doctors" style={{ color: '#CBD8D2', fontSize: '0.925rem' }}>Orthopedics & Joint Clinic</Link></li>
              <li><Link to="/contact" style={{ color: '#CBD8D2', fontSize: '0.925rem' }}>Pathology & Blood Testing</Link></li>
              <li><Link to="/login" style={{ color: '#D1F8E3', fontSize: '0.925rem', fontWeight: 700 }}>Staff HMS Login</Link></li>
            </ul>
          </div>

          {/* Hospital Address */}
          <div>
            <h4 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '1.25rem', fontWeight: 800 }}>Location & Hours</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#CBD8D2', fontSize: '0.925rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <MapPin size={18} color="#D1F8E3" style={{ flexShrink: 0, marginTop: '3px' }} />
                <span>Koraon, Prayagraj, Uttar Pradesh, India - 212306</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Clock size={18} color="#D1F8E3" style={{ flexShrink: 0 }} />
                <span>Emergency & Pharmacy: 24/7 Open</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Phone size={18} color="#D1F8E3" style={{ flexShrink: 0 }} />
                <span>+91 99999 00000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Back to Top */}
        <div style={{ 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
          paddingTop: '2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1rem',
          fontSize: '0.85rem',
          color: '#A2B6AD'
        }}>
          <div>
            &copy; {currentYear} Chaudhary Health Care Center, Koraon. All rights reserved.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Care</span>
            <button
              onClick={scrollToTop}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'white',
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-pill)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#D1F8E3';
                e.currentTarget.style.color = '#0A302A';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = 'white';
              }}
            >
              Back to Top <ChevronUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
