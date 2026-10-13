import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, ShieldCheck, Building2, Calendar } from 'lucide-react';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
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
            <Building2 size={14} /> Get In Touch
          </div>

          <h1 style={{ 
            color: '#0A302A', 
            fontSize: '3rem', 
            marginBottom: '1rem',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            lineHeight: 1.15
          }}>
            Contact Chaudhary Health Care Center
          </h1>

          <p style={{ 
            color: '#475569', 
            fontSize: '1.1rem', 
            maxWidth: '650px', 
            margin: '0 auto',
            lineHeight: 1.65
          }}>
            We are here for you 24/7. Reach out for OPD consultations, diagnostic inquiries, or emergency ambulance dispatch in Koraon.
          </p>
        </div>
      </section>

      {/* MAIN CONTACT GRID */}
      <section className="container" style={{ marginTop: '3.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '3rem', alignItems: 'start' }}>
          {/* Left Column: Direct Hospital Contacts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Quick Contact Numbers */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid #E2ECE6',
              padding: '2.5rem',
              boxShadow: '0 6px 20px rgba(10, 48, 42, 0.04)'
            }}>
              <h3 style={{ fontSize: '1.45rem', marginBottom: '1.75rem', color: '#0A302A', fontWeight: 800 }}>
                Direct Hospital Helplines
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {/* Emergency Hotline */}
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '14px', 
                    background: '#0A302A', 
                    color: '#D1F8E3',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Phone size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0A302A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      24/7 Emergency & Ambulance
                    </span>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0A302A', margin: '0.15rem 0' }}>
                      +91 99999 00000
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#526477' }}>
                      Continuous trauma triage & immediate dispatch.
                    </div>
                  </div>
                </div>

                {/* OPD Desk */}
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '14px', 
                    background: '#D1F8E3', 
                    color: '#0A302A',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Calendar size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0A302A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      OPD & Consultation Desk
                    </span>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0A302A', margin: '0.15rem 0' }}>
                      +91 99999 00001
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#526477' }}>
                      Open 09:00 AM - 08:00 PM for doctor appointments.
                    </div>
                  </div>
                </div>

                {/* Hospital Location */}
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '14px', 
                    background: '#F8FCFA', 
                    border: '1px solid #E2ECE6',
                    color: '#0A302A',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <MapPin size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0A302A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Hospital Address
                    </span>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0A302A', margin: '0.15rem 0' }}>
                      Chaudhary Health Care Center
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#526477' }}>
                      Koraon, Prayagraj, Uttar Pradesh, India - 212306
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Hours Card */}
            <div style={{ 
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid #E2ECE6',
              padding: '2rem 2.5rem',
              boxShadow: '0 4px 16px rgba(10, 48, 42, 0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <Clock size={22} color="#0A302A" />
                <h4 style={{ fontSize: '1.2rem', color: '#0A302A', fontWeight: 800, margin: 0 }}>
                  Hospital Operating Timings
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.925rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2ECE6', paddingBottom: '0.6rem' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>Emergency & Pharmacy</span>
                  <span style={{ color: '#0A302A', fontWeight: 800 }}>24 Hours Open (Daily)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2ECE6', paddingBottom: '0.6rem' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>Outpatient Department (OPD)</span>
                  <span style={{ color: '#0A302A', fontWeight: 700 }}>09:00 AM - 08:00 PM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.2rem' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>Pathology & Diagnostics Lab</span>
                  <span style={{ color: '#0A302A', fontWeight: 700 }}>08:00 AM - 08:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Send Online Inquiry Form */}
          <div style={{ 
            background: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid #E2ECE6',
            padding: '2.5rem',
            boxShadow: '0 6px 22px rgba(10, 48, 42, 0.04)'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.4rem', color: '#0A302A', fontWeight: 800 }}>
              Send an Online Inquiry
            </h3>
            <p style={{ color: '#526477', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              Have questions regarding treatments, lab tests, or hospital admission? Submit an inquiry and our front desk will get back to you promptly.
            </p>

            {submitted ? (
              <div style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: '#D1F8E3',
                  color: '#0A302A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem'
                }}>
                  <CheckCircle2 size={42} strokeWidth={2.5} />
                </div>
                <h4 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#0A302A', fontWeight: 800 }}>
                  Inquiry Sent Successfully!
                </h4>
                <p style={{ color: '#526477', marginBottom: '1.75rem', maxWidth: '400px', margin: '0 auto 1.75rem' }}>
                  Thank you for reaching out. Our front desk staff will contact you shortly on your provided phone number.
                </p>
                <button 
                  onClick={() => setSubmitted(false)} 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#0A302A',
                    color: '#FFFFFF',
                    padding: '0.8rem 1.8rem',
                    borderRadius: 'var(--radius-pill)',
                    fontWeight: 700,
                    fontSize: '0.925rem',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem', color: '#0A302A' }}>
                    Your Full Name *
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter your name" 
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.925rem',
                      color: '#0A302A',
                      outline: 'none',
                      fontFamily: 'var(--font-body)',
                      background: '#FFFFFF'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem', color: '#0A302A' }}>
                      Phone Number *
                    </label>
                    <input 
                      type="tel" 
                      required 
                      placeholder="+91 98765 43210" 
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.925rem',
                        color: '#0A302A',
                        outline: 'none',
                        fontFamily: 'var(--font-body)',
                        background: '#FFFFFF'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem', color: '#0A302A' }}>
                      Email Address (Optional)
                    </label>
                    <input 
                      type="email" 
                      placeholder="name@example.com" 
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.925rem',
                        color: '#0A302A',
                        outline: 'none',
                        fontFamily: 'var(--font-body)',
                        background: '#FFFFFF'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem', color: '#0A302A' }}>
                    Department / Query Type
                  </label>
                  <select 
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.925rem',
                      color: '#0A302A',
                      outline: 'none',
                      fontFamily: 'var(--font-body)',
                      background: '#FFFFFF'
                    }}
                  >
                    <option>General Medical Inquiry</option>
                    <option>Doctor Consultation Schedule</option>
                    <option>Diagnostic Laboratory Test</option>
                    <option>Pharmacy / Medicine Availability</option>
                  </select>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem', color: '#0A302A' }}>
                    Your Message *
                  </label>
                  <textarea 
                    rows={4} 
                    required 
                    placeholder="How can we assist you?" 
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.925rem',
                      color: '#0A302A',
                      outline: 'none',
                      fontFamily: 'var(--font-body)',
                      background: '#FFFFFF',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <button 
                  type="submit" 
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                    background: '#0A302A',
                    color: '#FFFFFF',
                    padding: '0.95rem',
                    borderRadius: 'var(--radius-pill)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(10, 48, 42, 0.25)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#134E43'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#0A302A'}
                >
                  <Send size={17} />
                  <span>Send Message to Hospital Desk</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
