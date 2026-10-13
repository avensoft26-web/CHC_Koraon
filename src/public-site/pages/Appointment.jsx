import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Calendar, Clock, User, Phone, CheckCircle2, ShieldCheck, 
  Sparkles, FileText, ArrowRight, Activity, MapPin, HeartPulse, Building2
} from 'lucide-react';

const Appointment = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialDoctor = searchParams.get('doctor') || '';

  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    age: '',
    gender: 'Male',
    department: 'General Medicine',
    doctor: initialDoctor || 'Dr. A. K. Chaudhary (General Physician)',
    preferredDate: new Date().toISOString().split('T')[0],
    timeSlot: '10:30 AM - Morning',
    notes: ''
  });

  const [bookingStatus, setBookingStatus] = useState('idle'); // idle, loading, confirmed
  const [tokenNumber, setTokenNumber] = useState('');

  const doctorsList = {
    'General Medicine': ['Dr. A. K. Chaudhary (General Physician)', 'Dr. S. K. Gupta (Family Medicine)'],
    'Orthopedics': ['Dr. S. Singh (Orthopedic Surgeon)'],
    'Pediatrics': ['Dr. Meenakshi Sharma (Pediatrician)'],
    'Dental Surgery': ['Dr. Rohit Verma (Dental Surgeon)']
  };

  const timeSlots = [
    '09:30 AM - Morning',
    '10:30 AM - Morning',
    '11:45 AM - Morning',
    '01:00 PM - Afternoon',
    '03:30 PM - Afternoon',
    '05:00 PM - Evening',
    '06:30 PM - Evening',
    '07:30 PM - Evening'
  ];

  const handleDepartmentChange = (dept) => {
    setFormData(prev => ({
      ...prev,
      department: dept,
      doctor: doctorsList[dept] ? doctorsList[dept][0] : ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setBookingStatus('loading');
    
    setTimeout(() => {
      const generatedToken = 'CHC-' + Math.floor(100000 + Math.random() * 900000);
      setTokenNumber(generatedToken);
      setBookingStatus('confirmed');
    }, 900);
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
            <Calendar size={14} /> Instant OPD Token Booking
          </div>

          <h1 style={{ 
            color: '#0A302A', 
            fontSize: '3rem', 
            marginBottom: '1rem',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            lineHeight: 1.15
          }}>
            Schedule Your Consultation
          </h1>

          <p style={{ 
            color: '#475569', 
            fontSize: '1.1rem', 
            maxWidth: '650px', 
            margin: '0 auto',
            lineHeight: 1.65
          }}>
            Reserve your clinical appointment slot at Chaudhary Health Care Center, Koraon without standing in hospital queues.
          </p>
        </div>
      </section>

      {/* MAIN FORM & LIVE SLIP */}
      <section className="container" style={{ marginTop: '3.5rem' }}>
        {bookingStatus === 'confirmed' ? (
          <div style={{ 
            maxWidth: '680px', 
            margin: '0 auto', 
            background: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid #E2ECE6',
            padding: '3.5rem 2.5rem', 
            textAlign: 'center',
            boxShadow: '0 12px 36px rgba(10, 48, 42, 0.08)'
          }}>
            <div style={{ 
              width: '76px', 
              height: '76px', 
              borderRadius: '50%', 
              background: '#D1F8E3', 
              color: '#0A302A',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <CheckCircle2 size={44} strokeWidth={2.5} />
            </div>

            <div style={{
              display: 'inline-block',
              background: '#D1F8E3',
              color: '#0A302A',
              padding: '0.35rem 0.95rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.825rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.85rem'
            }}>
              Appointment Registered
            </div>

            <h2 style={{ fontSize: '2.2rem', marginBottom: '0.75rem', color: '#0A302A', fontWeight: 800 }}>
              OPD Token Generated!
            </h2>
            
            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.65, marginBottom: '2rem', maxWidth: '540px', margin: '0 auto 2rem' }}>
              Your appointment request is registered in our hospital system. Please arrive 10 minutes before your slot and present this token at the reception.
            </p>

            {/* Token Badge */}
            <div style={{ 
              background: '#F8FCFA', 
              border: '2px dashed #0A302A', 
              borderRadius: 'var(--radius-lg)', 
              padding: '1.75rem', 
              marginBottom: '2.5rem',
              display: 'inline-block',
              width: '100%',
              maxWidth: '460px'
            }}>
              <span style={{ fontSize: '0.8rem', color: '#526477', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                Your OPD Token Number
              </span>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.75rem', fontWeight: 800, color: '#0A302A', margin: '0.25rem 0', letterSpacing: '0.02em' }}>
                {tokenNumber}
              </div>
              <div style={{ fontSize: '0.95rem', color: '#0A302A', fontWeight: 700 }}>
                {formData.patientName} • {formData.doctor}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#526477', marginTop: '0.35rem' }}>
                Date: {formData.preferredDate} | Slot: {formData.timeSlot}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setBookingStatus('idle')} 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#0A302A',
                  color: '#FFFFFF',
                  padding: '0.85rem 1.8rem',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(10, 48, 42, 0.2)'
                }}
              >
                <Calendar size={16} /> Book Another Token
              </button>
              
              <a 
                href="tel:+919999900000" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#D1F8E3',
                  color: '#0A302A',
                  padding: '0.85rem 1.8rem',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  border: '1px solid rgba(10, 48, 42, 0.12)'
                }}
              >
                <Phone size={16} /> Call Reception Desk
              </a>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
            {/* Form Column */}
            <div style={{ 
              background: '#FFFFFF', 
              borderRadius: 'var(--radius-xl)', 
              border: '1px solid #E2ECE6', 
              padding: '2.5rem',
              boxShadow: '0 6px 22px rgba(10, 48, 42, 0.04)'
            }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#0A302A', fontWeight: 800 }}>
                Patient & Appointment Details
              </h3>

              <form onSubmit={handleSubmit}>
                {/* Department Selection */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.6rem', color: '#0A302A' }}>
                    Select Medical Department *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    {Object.keys(doctorsList).map(dept => {
                      const isSelected = formData.department === dept;
                      return (
                        <button
                          type="button"
                          key={dept}
                          onClick={() => handleDepartmentChange(dept)}
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: isSelected ? '1.5px solid #0A302A' : '1px solid #E2ECE6',
                            background: isSelected ? '#D1F8E3' : '#FFFFFF',
                            color: isSelected ? '#0A302A' : '#334155',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {dept}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Doctor Selection */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem', color: '#0A302A' }}>
                    Consulting Doctor *
                  </label>
                  <select
                    value={formData.doctor}
                    onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.925rem',
                      color: '#0A302A',
                      background: '#FFFFFF',
                      fontFamily: 'var(--font-body)',
                      outline: 'none'
                    }}
                  >
                    {doctorsList[formData.department]?.map(doc => (
                      <option key={doc} value={doc}>{doc}</option>
                    ))}
                  </select>
                </div>

                {/* Patient Name & Mobile */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem', color: '#0A302A' }}>
                      Patient Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.925rem',
                        color: '#0A302A',
                        background: '#FFFFFF',
                        fontFamily: 'var(--font-body)',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem', color: '#0A302A' }}>
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.925rem',
                        color: '#0A302A',
                        background: '#FFFFFF',
                        fontFamily: 'var(--font-body)',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Date & Time Slot Picker */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem', color: '#0A302A' }}>
                      Preferred Visit Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.925rem',
                        color: '#0A302A',
                        background: '#FFFFFF',
                        fontFamily: 'var(--font-body)',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem', color: '#0A302A' }}>
                      Select Time Slot *
                    </label>
                    <select
                      value={formData.timeSlot}
                      onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.925rem',
                        color: '#0A302A',
                        background: '#FFFFFF',
                        fontFamily: 'var(--font-body)',
                        outline: 'none'
                      }}
                    >
                      {timeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Symptoms / Notes */}
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem', color: '#0A302A' }}>
                    Describe Symptoms / Reason for Visit (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Joint pain for past 3 days, seasonal fever, cough..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.925rem',
                      color: '#0A302A',
                      background: '#FFFFFF',
                      fontFamily: 'var(--font-body)',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Submit Pill Button matching user screenshot */}
                <button
                  type="submit"
                  disabled={bookingStatus === 'loading'}
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
                  <Calendar size={18} />
                  <span>{bookingStatus === 'loading' ? 'Generating OPD Token...' : 'Schedule Visit & Generate Token'}</span>
                </button>
              </form>
            </div>

            {/* Live Interactive Appointment Summary Slip */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ 
                background: '#FFFFFF', 
                borderRadius: 'var(--radius-xl)', 
                border: '1.5px solid #0A302A', 
                padding: '2rem',
                boxShadow: '0 6px 20px rgba(10, 48, 42, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '10px', 
                    background: '#D1F8E3', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#0A302A' 
                  }}>
                    <HeartPulse size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', color: '#0A302A', fontWeight: 800, margin: 0 }}>
                      Live Appointment Summary
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Auto-updating consultation slip</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.925rem' }}>
                  <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid #E2ECE6' }}>
                    <span style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                      Patient Name
                    </span>
                    <div style={{ fontWeight: 800, color: '#0A302A', fontSize: '1.05rem', marginTop: '0.2rem' }}>
                      {formData.patientName || 'Enter patient name in form...'}
                    </div>
                  </div>

                  <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid #E2ECE6' }}>
                    <span style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                      Doctor & Department
                    </span>
                    <div style={{ fontWeight: 800, color: '#0A302A', fontSize: '1rem', marginTop: '0.2rem' }}>
                      {formData.doctor}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#526477' }}>
                      Specialty: {formData.department}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E2ECE6' }}>
                    <div>
                      <span style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                        Visit Date
                      </span>
                      <div style={{ fontWeight: 700, color: '#0A302A', marginTop: '0.15rem' }}>
                        {formData.preferredDate}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                        Selected Slot
                      </span>
                      <div style={{ fontWeight: 700, color: '#0A302A', marginTop: '0.15rem' }}>
                        {formData.timeSlot}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0A302A', fontWeight: 700, fontSize: '0.85rem', paddingTop: '0.25rem' }}>
                    <CheckCircle2 size={16} /> Instant Online Token Generation
                  </div>
                </div>
              </div>

              {/* Emergency Callout Card in Deep Pine */}
              <div style={{ 
                background: '#0A302A', 
                borderRadius: 'var(--radius-xl)', 
                color: 'white', 
                padding: '2rem',
                boxShadow: '0 8px 24px rgba(10, 48, 42, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <Activity size={22} color="#D1F8E3" />
                  <h4 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                    Emergency or Acute Trauma?
                  </h4>
                </div>
                
                <p style={{ color: '#D1F8E3', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.55, opacity: 0.9 }}>
                  Do not wait for a scheduled slot if experiencing acute chest pain, trauma, or severe shortness of breath.
                </p>
                
                <a 
                  href="tel:+919999900000" 
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: '#D1F8E3', 
                    color: '#0A302A', 
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-pill)',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#BFF2D6'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#D1F8E3'}
                >
                  <Phone size={16} /> Call Emergency: +91 99999 00000
                </a>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Appointment;
