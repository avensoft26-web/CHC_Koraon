import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeartPulse, Menu, X, ArrowRight, User, Calendar } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const hasToken = Boolean(localStorage.getItem('chaudhary_jwt_token') || localStorage.getItem('auth_token'));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Our Doctors', path: '/doctors' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 1000, 
      width: '100%',
      background: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      transition: 'all 0.3s ease',
      boxShadow: isScrolled ? '0 10px 25px rgba(15, 23, 42, 0.06)' : 'none'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '100%', 
        padding: '0 clamp(1.25rem, 3.5vw, 3.5rem)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        height: '80px' 
      }}>
        {/* Brand Logo - Simple & Unique */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '12px', 
            background: '#0A302A',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(10, 48, 42, 0.25)',
            color: 'white',
            flexShrink: 0
          }}>
            <HeartPulse size={24} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: '#0F172A', lineHeight: 1.15 }}>
              CHAUDHARY
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', color: '#64748B' }}>
              Health Care Center
            </div>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '1.5rem' }} className="nav-desktop-visible">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                style={{
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  color: isActive ? '#0A302A' : '#334155',
                  padding: '0.4rem 0',
                  position: 'relative',
                  transition: 'color 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#0A302A';
                }}
                onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#334155';
                }}
              >
                {link.name}
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: '#0A302A',
                    borderRadius: '2px'
                  }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div style={{ display: 'none', alignItems: 'center', gap: '1.25rem' }} className="nav-actions-visible">
          <Link 
            to={hasToken ? "/portal" : "/login"} 
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: hasToken ? '#0A302A' : '#64748B', 
              background: hasToken ? '#D1F8E3' : 'transparent',
              fontSize: '0.875rem', 
              fontWeight: 700,
              padding: '0.5rem 0.95rem',
              borderRadius: 'var(--radius-pill)',
              border: hasToken ? '1.5px solid #0A302A' : '1px solid #E2E8F0',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#0F172A';
              e.currentTarget.style.borderColor = '#94A3B8';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = hasToken ? '#0A302A' : '#64748B';
              e.currentTarget.style.borderColor = hasToken ? '#0A302A' : '#E2E8F0';
            }}
          >
            <User size={15} /> {hasToken ? "Open HMS Portal →" : "Staff Portal"}
          </Link>

          {/* Exact Schedule Visit Button Matching User Design System */}
          <Link 
            to="/appointment" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#0A302A',
              color: '#FFFFFF',
              padding: '0.75rem 1.6rem',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700,
              fontSize: '0.925rem',
              boxShadow: '0 6px 18px rgba(10, 48, 42, 0.25)',
              transition: 'all 0.25s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#134E43'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#0A302A'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <Calendar size={16} />
            <span>Schedule Visit</span>
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '42px', 
            height: '42px', 
            borderRadius: '10px', 
            background: '#F8FAFC', 
            border: '1px solid #E2E8F0', 
            cursor: 'pointer',
            color: '#0F172A'
          }}
          className="mobile-toggle-btn"
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '1.5rem',
          boxShadow: '0 20px 30px rgba(15, 23, 42, 0.08)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: location.pathname === link.path ? '#E11D48' : '#0F172A',
                  background: location.pathname === link.path ? 'rgba(225, 29, 72, 0.08)' : 'transparent'
                }}
              >
                {link.name}
              </Link>
            ))}
            <div style={{ paddingTop: '1rem', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link 
                to="/appointment" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, #FF4D6D 0%, #E11D48 100%)',
                  color: '#FFFFFF',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 700,
                  textAlign: 'center'
                }}
              >
                Book An Appointment <ArrowRight size={16} />
              </Link>
              <Link 
                to={hasToken ? "/portal" : "/login"} 
                style={{ 
                  textAlign: 'center', 
                  padding: '0.75rem', 
                  borderRadius: 'var(--radius-pill)', 
                  border: hasToken ? '1.5px solid #0A302A' : '1px solid #E2E8F0',
                  color: hasToken ? '#0A302A' : '#64748B',
                  background: hasToken ? '#D1F8E3' : 'transparent',
                  fontWeight: 700
                }}
              >
                {hasToken ? "Open HMS Portal →" : "Staff Portal"}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        @media (min-width: 992px) {
          .nav-desktop-visible { display: flex !important; }
          .nav-actions-visible { display: flex !important; }
          .mobile-toggle-btn { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Header;

