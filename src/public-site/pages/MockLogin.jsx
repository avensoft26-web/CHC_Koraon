import { Link } from 'react-router-dom';
import { Lock, ArrowLeft, ShieldCheck } from 'lucide-react';

const MockLogin = () => {
  return (
    <div className="animate-fade-in" style={{ background: '#F8FCFA', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ 
        maxWidth: '420px', 
        width: '100%', 
        textAlign: 'center',
        background: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid #E2ECE6',
        padding: '2.5rem',
        boxShadow: '0 8px 30px rgba(10, 48, 42, 0.06)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <div style={{ background: '#D1F8E3', padding: '1rem', borderRadius: '50%', color: '#0A302A' }}>
            <Lock size={28} />
          </div>
        </div>
        
        <h2 style={{ marginBottom: '0.4rem', color: '#0A302A', fontWeight: 800 }}>Staff HMS Login</h2>
        <p style={{ color: '#526477', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Hospital Management System (HMS) Internal Portal
        </p>
        
        <div style={{ 
          background: '#F8FCFA', 
          border: '1px solid #E2ECE6', 
          padding: '0.85rem 1rem', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '1.5rem', 
          color: '#0A302A', 
          fontSize: '0.825rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          textAlign: 'left'
        }}>
          <ShieldCheck size={18} color="#0A302A" style={{ flexShrink: 0 }} />
          <span>Restricted to authorized Chaudhary Health Care clinical staff and administrators.</span>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', color: '#0A302A' }}>Username</label>
            <input 
              type="text" 
              disabled 
              value="admin" 
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.9rem',
                color: '#64748B',
                background: '#F8FCFA',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ textAlign: 'left', marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', color: '#0A302A' }}>Password</label>
            <input 
              type="password" 
              disabled 
              value="********" 
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.9rem',
                color: '#64748B',
                background: '#F8FCFA',
                outline: 'none'
              }}
            />
          </div>
          <button 
            type="button" 
            disabled 
            style={{ 
              width: '100%',
              background: '#0A302A',
              color: '#FFFFFF',
              padding: '0.85rem',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              cursor: 'not-allowed',
              opacity: 0.8
            }}
          >
            Login to HMS Dashboard
          </button>
        </form>

        <div style={{ marginTop: '2rem', borderTop: '1px solid #E2ECE6', paddingTop: '1.25rem' }}>
          <Link 
            to="/" 
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#0A302A', 
              fontSize: '0.875rem',
              fontWeight: 700 
            }}
          >
            <ArrowLeft size={15} /> Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MockLogin;
