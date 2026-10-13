import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  Building2, 
  Search, 
  Clock, 
  Star, 
  Phone, 
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Send,
  Paperclip,
  Sparkles,
  Printer,
  ShieldCheck,
  Check,
  Video,
  AlertCircle,
  MessageSquare, 
  CalendarDays, 
  MoreVertical, 
  LayoutGrid, 
  List, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  CheckCircle2, 
  X,
  MapPin,
  Mail,
  UserPlus,
  Edit3,
  Camera,
  Upload,
  Trash2,
  Image
} from 'lucide-react';
import { useDoctorAvailabilityMap, updateDoctorOverride, toggleDoctorStatus } from '../../utils/doctorAvailability';
import { api } from '../../services/api';

export interface DoctorItem {
  id: string;
  name: string;
  specialization: string;
  department: string;
  experience: number;
  rating: number;
  reviewsCount: number;
  status: 'Active' | 'On Leave';
  availableTime: string;
  leaveUntil?: string;
  phone: string;
  email: string;
  roomNo: string;
  opdFee: number;
  avatarUrl: string;
  backdropColor: string;
  gender: 'M' | 'F';
  themeColor: 'blue' | 'purple' | 'amber';
  qualification: string;
  patientsToday: number;
}

const DOCTOR_GRADIENTS = [
  'from-slate-900 via-slate-800 to-teal-950',
  'from-emerald-900 via-teal-900 to-slate-900',
  'from-slate-900 via-blue-950 to-slate-900',
  'from-teal-900 via-slate-900 to-emerald-950',
  'from-indigo-950 via-slate-900 to-slate-900',
];

const getDoctorGradient = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
  }
  return DOCTOR_GRADIENTS[Math.abs(hash) % DOCTOR_GRADIENTS.length];
};

const getDoctorInitials = (name: string): string => {
  if (!name) return 'DR';
  const cleaned = name.replace(/^(dr\.|dr\s+|doctor\s+|prof\.|prof\s+)/i, '').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }
  return 'DR';
};

// Executive Medical Doctor Avatar: Shows real photo if uploaded, otherwise dignified monogram with initials
const DoctorAvatar: React.FC<{
  src?: string;
  name: string;
  backdropColor?: string;
  gender?: 'M' | 'F';
  size?: 'normal' | 'modal' | 'sm';
}> = ({ src, name, size = 'normal' }) => {
  const [hasError, setHasError] = useState(false);
  const isModal = size === 'modal';
  const isSm = size === 'sm';

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const initials = getDoctorInitials(name);
  const avatarGradient = getDoctorGradient(name);

  // If real image is uploaded and hasn't errored
  const hasRealImage = Boolean(src && src.trim() !== '' && !hasError);

  const containerDims = isModal 
    ? 'w-[96px] h-[116px] rounded-2xl' 
    : isSm 
    ? 'w-[48px] h-[48px] rounded-xl' 
    : 'w-[78px] h-[92px] rounded-2xl';

  return (
    <div className={`${containerDims} border border-slate-200/90 shadow-xs shrink-0 overflow-hidden relative group/avatar bg-slate-100`}>
      {hasRealImage ? (
        <img
          src={src}
          alt={name}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover object-top transition-transform duration-300 group-hover/avatar:scale-105"
          loading="eager"
        />
      ) : (
        /* Professional Dignified Monogram Avatar */
        <div className={`w-full h-full bg-gradient-to-br ${avatarGradient} flex flex-col items-center justify-center relative select-none p-1 transition-all`}>
          {/* Subtle medical watermark in background */}
          <Stethoscope className="w-12 h-12 text-white/[0.08] absolute -bottom-2 -right-2 pointer-events-none stroke-[1.5]" />
          
          {/* DR Label */}
          {!isSm && (
            <span className="text-[9.5px] font-black tracking-widest text-emerald-400/90 uppercase font-mono leading-none mb-1">
              DR.
            </span>
          )}

          {/* Bold Initials */}
          <span className={`${isModal ? 'text-3xl' : isSm ? 'text-sm' : 'text-xl sm:text-2xl'} font-black text-white tracking-wider font-sans drop-shadow-sm`}>
            {initials}
          </span>

          {/* Subtle accent bar */}
          {!isSm && <div className="w-4 h-0.5 bg-emerald-400/30 rounded-full mt-1" />}
        </div>
      )}
    </div>
  );
};

// ==========================================================
// 1. DOCTOR TELE-CALL MODAL (AUTHENTIC IN-APP VOICE CALL)
// ==========================================================
const DoctorCallModal: React.FC<{
  doctor: DoctorItem;
  onClose: () => void;
  onSwitchToBooking: (doc: DoctorItem) => void;
}> = ({ doctor, onClose, onSwitchToBooking }) => {
  const [callState, setCallState] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callSeconds, setCallSeconds] = useState(0);

  useEffect(() => {
    let timer: any;
    if (callState === 'connecting') {
      timer = setTimeout(() => {
        setCallState('connected');
      }, 2200);
    } else if (callState === 'connected') {
      timer = setInterval(() => {
        setCallSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    const secs = (totalSecs % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-[#0B132B] text-white rounded-3xl shadow-2xl border border-slate-700/80 w-full max-w-md overflow-hidden relative animate-scaleIn">
        {/* Top Glow & Header */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-500/20 via-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="p-4 flex items-center justify-between relative z-10 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-300 tracking-wide uppercase">Chaudhary Tele-Consult</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Centerpiece Call Body */}
        <div className="p-6 text-center flex flex-col items-center relative z-10">
          
          {/* Avatar with Animated Pulse Rings */}
          <div className="relative mb-5">
            {callState === 'connecting' && (
              <>
                <div className="absolute -inset-3 rounded-full bg-blue-500/25 animate-ping" />
                <div className="absolute -inset-6 rounded-full bg-blue-500/15 animate-pulse" />
              </>
            )}
            {callState === 'connected' && (
              <div className="absolute -inset-2.5 rounded-full bg-emerald-500/30 animate-pulse" />
            )}
            
            <div className="w-26 h-26 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl relative bg-slate-800">
              <img
                src={doctor.avatarUrl}
                alt={doctor.name}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className={`absolute bottom-0 right-0 w-7 h-7 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs shadow-md ${
              callState === 'connected' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'
            }`}>
              <Phone className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>

          {/* Doctor Info */}
          <h3 className="text-xl font-bold tracking-tight text-white">{doctor.name}</h3>
          <p className="text-xs font-semibold text-blue-400 mt-1">{doctor.specialization} • {doctor.department}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{doctor.roomNo}</p>

          {/* Call Status Badge & Timer */}
          <div className="mt-4">
            {callState === 'connecting' && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                <span>Ringing doctor's consultation line...</span>
              </div>
            )}
            {callState === 'connected' && (
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm font-bold font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{formatTimer(callSeconds)}</span>
                </div>
                {/* Audio visualizer simulation */}
                <div className="flex items-center justify-center gap-1.5 h-5 pt-1">
                  <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3" />
                  <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-5" style={{ animationDelay: '0.15s' }} />
                  <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2" style={{ animationDelay: '0.3s' }} />
                  <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-4" style={{ animationDelay: '0.45s' }} />
                  <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3" style={{ animationDelay: '0.2s' }} />
                </div>
                <p className="text-[10px] text-slate-400 font-medium">HD Voice Audio Encrypted • Hospital Line Active</p>
              </div>
            )}
            {callState === 'ended' && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-bold">
                <span>Call Ended ({formatTimer(callSeconds)})</span>
              </div>
            )}
          </div>

          {/* In-Call Controls */}
          {callState !== 'ended' ? (
            <div className="mt-8 flex items-center justify-center gap-5 w-full">
              {/* Mute Toggle */}
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-md ${
                  isMuted ? 'bg-rose-500 text-white' : 'bg-white/10 hover:bg-white/20 text-slate-300'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* End Call Button */}
              <button
                type="button"
                onClick={() => setCallState('ended')}
                className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-all shadow-[0_4px_16px_rgba(244,63,94,0.4)] cursor-pointer hover:scale-105 active:scale-95"
                title="End Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>

              {/* Speakerphone Toggle */}
              <button
                type="button"
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-md ${
                  isSpeakerOn ? 'bg-blue-600 text-white' : 'bg-white/10 hover:bg-white/20 text-slate-300'
                }`}
                title={isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full">
              <button
                type="button"
                onClick={() => {
                  setCallSeconds(0);
                  setCallState('connecting');
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Again</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToBooking(doctor);
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <CalendarDays className="w-4 h-4" />
                <span>Book OPD Token</span>
              </button>
            </div>
          )}

          {/* Quick Direct Dial Link */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 w-full flex items-center justify-between text-xs text-slate-400">
            <span>Direct Tel: <a href={`tel:${doctor.phone}`} className="text-blue-400 hover:underline font-bold">{doctor.phone}</a></span>
            <span className="text-[10.5px] bg-slate-800 px-2.5 py-0.5 rounded-full text-slate-300">OPD: {doctor.opdFee ? `₹${doctor.opdFee}` : '—'}</span>
          </div>

        </div>
      </div>
    </div>
  );
};

// ==========================================================
// 2. DOCTOR INSTANT CHAT MODAL (SMART CLINICAL MESSAGING)
// ==========================================================
const DoctorChatModal: React.FC<{
  doctor: DoctorItem;
  onClose: () => void;
  onBookAppointment: (doc: DoctorItem) => void;
}> = ({ doctor, onClose, onBookAppointment }) => {
  const [messages, setMessages] = useState<Array<{ id: string; sender: 'doctor' | 'patient'; text: string; time: string; attachment?: string }>>([
    {
      id: 'm-1',
      sender: 'doctor',
      text: `Namaste! I am ${doctor.name}, ${doctor.specialization} at Chaudhary Health Care Center. How can I assist you with your health symptoms or queries today?`,
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickChips = [
    'Need prescription renewal',
    'Consult about fever/headache',
    'Review my blood test report',
    'What are your OPD timings today?'
  ];

  const handleSendMessage = (customText?: string) => {
    const text = customText || inputText;
    if (!text.trim() && !attachedFile) return;

    const newMsg = {
      id: `p-${Date.now()}`,
      sender: 'patient' as const,
      text: text.trim(),
      attachment: attachedFile || undefined,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setAttachedFile(null);
    setIsTyping(true);

    // Dynamic intelligent reply based on patient query
    setTimeout(() => {
      setIsTyping(false);
      let reply = `Thank you for sharing your concern. I have noted your message. For a detailed clinical examination, I recommend booking an in-person token with me at ${doctor.roomNo}.`;
      const lower = text.toLowerCase();
      if (lower.includes('fever') || lower.includes('headache')) {
        reply = `For fever or acute headaches, ensure proper hydration and rest. If temperature persists above 101°F, please visit Chaudhary OPD immediately for blood tests.`;
      } else if (lower.includes('prescription')) {
        reply = `I can review your current medication and issue an authorized refill once we confirm your medical records at the hospital desk.`;
      } else if (lower.includes('report') || lower.includes('blood')) {
        reply = `I have received your diagnostic inquiry. You can bring the physical lab copy to ${doctor.roomNo}, and I will analyze the complete findings for you.`;
      } else if (lower.includes('timing') || lower.includes('opd')) {
        reply = `My active OPD shift is ${doctor.availableTime} at ${doctor.roomNo}. You can book an instant token right now.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `d-${Date.now()}`,
          sender: 'doctor',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col h-[600px] max-h-[90vh] animate-scaleIn">
        
        {/* Chat Header */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/50 bg-slate-200">
                <img src={doctor.avatarUrl} alt={doctor.name} className="w-full h-full object-cover object-top" />
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-white absolute bottom-0 right-0 shadow-xs" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">{doctor.name}</h3>
              <p className="text-[11px] text-blue-100 flex items-center gap-1.5">
                <span>{doctor.specialization}</span>
                <span>•</span>
                <span className="text-emerald-300 font-bold">Online</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onBookAppointment(doctor);
              }}
              className="px-2.5 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Book Token</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
          
          {/* Security Notice */}
          <div className="text-center">
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-200/60 px-3 py-1 rounded-full font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Encrypted Medical Consultation • Chaudhary Hospital Bareilly
            </span>
          </div>

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'patient' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[84%] sm:max-w-[78%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                  m.sender === 'patient'
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                }`}
              >
                {m.attachment && (
                  <div className="mb-2 p-2 rounded-xl bg-blue-700/60 text-white flex items-center gap-2 text-[11px] font-semibold">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{m.attachment}</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{m.text}</p>
                <span
                  className={`text-[9.5px] block mt-1 text-right ${
                    m.sender === 'patient' ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  {m.time}
                </span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3.5 py-2 w-fit shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-slate-100/70 border-t border-slate-200/80 overflow-x-auto flex items-center gap-1.5 shrink-0 scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Quick:
          </span>
          {quickChips.map((chip, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(chip)}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/90 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
          <button
            type="button"
            title="Attach Lab Report / Prescription"
            onClick={() => {
              setAttachedFile('Blood_Test_Report_Oct2026.pdf');
            }}
            className={`p-2 rounded-xl border border-slate-200 transition-colors cursor-pointer shrink-0 ${
              attachedFile ? 'bg-blue-100 text-blue-600 border-blue-300' : 'bg-slate-50 hover:bg-slate-100 text-slate-500'
            }`}
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={attachedFile ? `Attached: ${attachedFile} (Add message...)` : `Message Dr. ${doctor.name}...`}
            className="flex-1 px-3.5 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400"
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-xs cursor-pointer shrink-0 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

// ==========================================================
// 3. DOCTOR APPOINTMENT & OPD TOKEN BOOKING MODAL
// ==========================================================
const DoctorBookingModal: React.FC<{
  doctor: DoctorItem;
  onClose: () => void;
  onConfirmSuccess?: (doc: DoctorItem) => void;
}> = ({ doctor, onClose, onConfirmSuccess }) => {
  const [selectedDate, setSelectedDate] = useState('05 Oct');
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');
  const [consultType, setConsultType] = useState<'In-Person OPD' | 'Video Consultation'>('In-Person OPD');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [generatedToken, setGeneratedToken] = useState('');

  // 5 upcoming days
  const dateOptions = [
    { day: 'Today', date: '05 Oct', slots: '4 Slots' },
    { day: 'Tomorrow', date: '06 Oct', slots: '6 Slots' },
    { day: 'Wed', date: '07 Oct', slots: '8 Slots' },
    { day: 'Thu', date: '08 Oct', slots: '5 Slots' },
    { day: 'Fri', date: '09 Oct', slots: '7 Slots' }
  ];

  const morningSlots = ['09:30 AM', '10:00 AM', '10:45 AM', '11:30 AM'];
  const afternoonSlots = ['01:00 PM', '01:45 PM', '02:30 PM', '03:15 PM'];

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert('Please enter patient name');
      return;
    }
    const tokenNo = `CH-OPD-${Math.floor(100 + Math.random() * 900)}`;
    setGeneratedToken(tokenNo);
    setIsConfirmed(true);
    if (onConfirmSuccess) onConfirmSuccess(doctor);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scaleIn">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xs">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Book OPD Appointment</h3>
              <p className="text-xs text-emerald-100 font-semibold">{doctor.name} • {doctor.specialization}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {!isConfirmed ? (
          <form onSubmit={handleBook} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            
            {/* Doctor Quick Badge */}
            <div className="flex items-center gap-3.5 p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80">
              <div className="w-12 h-14 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                <img src={doctor.avatarUrl} alt={doctor.name} className="w-full h-full object-cover object-top" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate">{doctor.name}</span>
                  <span className="text-xs font-bold text-emerald-700 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                    {doctor.opdFee ? `₹${doctor.opdFee}` : '—'} Fee
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">{doctor.roomNo} • Shift: {doctor.availableTime}</p>
              </div>
            </div>

            {/* Consultation Type Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1.5 uppercase tracking-wide">
                Consultation Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConsultType('In-Person OPD')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    consultType === 'In-Person OPD'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-500 shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Hospital OPD Visit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConsultType('Video Consultation')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    consultType === 'Video Consultation'
                      ? 'bg-blue-50 text-blue-700 border-blue-500 shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>Video Consultation</span>
                </button>
              </div>
            </div>

            {/* Select Date */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1.5 uppercase tracking-wide">
                Select Date
              </label>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {dateOptions.map((d) => (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => setSelectedDate(d.date)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedDate === d.date
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="block text-[10px] font-bold opacity-80">{d.day}</span>
                    <span className="block text-xs font-bold my-0.5">{d.date.split(' ')[0]}</span>
                    <span className="block text-[9px] opacity-75">{d.slots}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Select Time Slot */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1.5 uppercase tracking-wide">
                Available Time Slots
              </label>
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Morning Shift</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {morningSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          selectedSlot === slot
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Afternoon Shift</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {afternoonSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          selectedSlot === slot
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Patient Details */}
            <div className="space-y-2.5 pt-1">
              <label className="text-[11px] font-bold text-slate-600 block uppercase tracking-wide">
                Patient Information
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Patient Full Name *"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    required
                    placeholder="Mobile Number *"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 border border-emerald-500 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Appointment & Generate OPD Token</span>
              </button>
            </div>

          </form>
        ) : (
          /* Confirmation Success Ticket */
          <div className="p-6 text-center space-y-4 animate-scaleIn">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900">OPD Appointment Confirmed!</h4>
              <p className="text-xs text-slate-500 mt-0.5">Your official digital consultation slip has been issued.</p>
            </div>

            {/* Official Token Pass */}
            <div className="bg-gradient-to-b from-emerald-50/90 to-teal-50/50 p-4 rounded-2xl border-2 border-emerald-300 text-left space-y-3 relative overflow-hidden shadow-xs">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                <div>
                  <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider">Chaudhary Health Care</span>
                  <p className="text-sm font-bold text-slate-900">Token ID: {generatedToken}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-600 text-white font-extrabold text-xs rounded-lg shadow-2xs">
                  Active Queued
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Patient Name</span>
                  <span className="font-extrabold text-slate-800">{patientName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Doctor</span>
                  <span className="font-extrabold text-slate-800">{doctor.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Appointment Slot</span>
                  <span className="font-extrabold text-slate-800">{selectedDate} at {selectedSlot}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Room & Fee</span>
                  <span className="font-extrabold text-emerald-700">{doctor.roomNo} ({doctor.opdFee ? `₹${doctor.opdFee}` : '—'})</span>
                </div>
              </div>

              <div className="pt-2 border-t border-dashed border-emerald-300/80 flex items-center justify-between text-[11px] text-emerald-900 font-medium">
                <span>📱 Confirmation SMS sent to {patientPhone || '+91 Patient'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Token</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

interface ChaudharyDoctorsViewProps {
  onBookAppointment?: (doctor: DoctorItem) => void;
  onSelectDoctor?: (doctor: DoctorItem) => void;
}

// Module-level cache for instant Doctors tab switching
let cachedDoctorsMemory: DoctorItem[] = [];

export const ChaudharyDoctorsView: React.FC<ChaudharyDoctorsViewProps> = ({
  onBookAppointment,
}) => {
  const [doctorsData, setDoctorsData] = useState<DoctorItem[]>(() => cachedDoctorsMemory);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(() => cachedDoctorsMemory.length === 0);
  const [todayAppointmentsCount, setTodayAppointmentsCount] = useState<number>(0);

  useEffect(() => {
    if (doctorsData.length > 0) {
      cachedDoctorsMemory = doctorsData;
    }
  }, [doctorsData]);

  // Fetch real doctors and appointments from MongoDB database
  useEffect(() => {
    let isMounted = true;
    if (cachedDoctorsMemory.length === 0) {
      setIsLoadingDoctors(true);
    }

    api.doctors.getAll().then((res) => {
      if (isMounted && res?.success && Array.isArray(res.doctors)) {
        const mapped: DoctorItem[] = res.doctors.map((d: any, idx: number) => {
          return {
            id: d._id || d.id || `doc-${idx + 1}`,
            name: d.name,
            specialization: d.specialization || 'Consultant Physician',
            department: d.department || 'General Medicine',
            experience: parseInt(d.experience) || 5,
            rating: d.rating ? Number(d.rating) : 0,
            reviewsCount: d.reviewsCount ? Number(d.reviewsCount) : 0,
            status: d.available === false ? 'On Leave' : 'Active',
            availableTime: d.opdTiming || '10:00 AM - 04:00 PM',
            phone: d.mobile || '',
            email: d.email || `${d.name?.toLowerCase().replace(/[^a-z0-9]/g, '')}@chaudharyhospital.com`,
            roomNo: d.roomNo || `OPD Room ${idx + 1}`,
            // Blank when no fee is recorded — never invent a consultation fee
            opdFee: d.fee || 0,
            avatarUrl: d.avatar || '',
            backdropColor: idx % 3 === 0 ? '#DDEEFE' : idx % 3 === 1 ? '#FFEDD5' : '#FCE7F3',
            gender: (d.gender === 'F' || d.gender === 'Female') ? 'F' : 'M',
            themeColor: idx % 3 === 0 ? 'blue' : idx % 3 === 1 ? 'amber' : 'purple',
            qualification: d.qualification || 'MBBS',
            patientsToday: 0,
          };
        });
        setDoctorsData(mapped);
      }
    }).catch((err) => {
      console.warn('Live doctors fetch error:', err);
    }).finally(() => {
      if (isMounted) setIsLoadingDoctors(false);
    });

    api.appointments.getAll().then((res) => {
      if (isMounted && res?.success && Array.isArray(res.appointments)) {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayCount = res.appointments.filter((a: any) => {
          return a.date === todayStr || (a.createdAt && new Date(a.createdAt).toISOString().split('T')[0] === todayStr);
        }).length;
        setTodayAppointmentsCount(todayCount > 0 ? todayCount : res.appointments.length);
      }
    }).catch((err) => {
      console.warn('Live appointments fetch error:', err);
    });

    return () => { isMounted = false; };
  }, []);

  const availabilityOverrides = useDoctorAvailabilityMap();
  const doctorsList = useMemo<DoctorItem[]>(() => {
    return doctorsData.map(doc => {
      const override = availabilityOverrides[doc.id] || availabilityOverrides[doc.name];
      if (!override) return doc;
      return {
        ...doc,
        status: override.status || doc.status,
        availableTime: override.availableTime || doc.availableTime,
        roomNo: override.roomNo || doc.roomNo,
        opdFee: override.opdFee !== undefined ? override.opdFee : doc.opdFee,
        phone: override.phone || doc.phone,
        avatarUrl: override.avatarUrl !== undefined ? override.avatarUrl : doc.avatarUrl,
        leaveUntil: override.leaveUntil || doc.leaveUntil,
      };
    });
  }, [doctorsData, availabilityOverrides]);

  // Receptionist Edit Doctor Modal state
  const [editingDoctor, setEditingDoctor] = useState<DoctorItem | null>(null);
  const [editStatus, setEditStatus] = useState<'Active' | 'On Leave'>('Active');
  const [editAvailableTime, setEditAvailableTime] = useState('');
  const [editRoomNo, setEditRoomNo] = useState('');
  const [editOpdFee, setEditOpdFee] = useState<number | ''>('');
  const [editPhone, setEditPhone] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setEditAvatarUrl(compressed);
        } else {
          setEditAvatarUrl(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Blank input keeps the doctor's existing recorded fee instead of writing 0
  const resolvedEditOpdFee = editOpdFee === '' ? (editingDoctor?.opdFee ?? 0) : Number(editOpdFee);

  const handleOpenEditModal = (doc: DoctorItem) => {
    setEditingDoctor(doc);
    setEditStatus(doc.status);
    setEditAvailableTime(doc.availableTime);
    setEditRoomNo(doc.roomNo);
    setEditOpdFee(doc.opdFee);
    setEditPhone(doc.phone);
    setEditAvatarUrl(doc.avatarUrl || '');
  };

  const handleSaveDoctorEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;
    const cleanAvatar = editAvatarUrl.trim();
    updateDoctorOverride(editingDoctor.id, {
      status: editStatus,
      availableTime: editAvailableTime.trim(),
      roomNo: editRoomNo.trim(),
      opdFee: resolvedEditOpdFee,
      phone: editPhone.trim(),
      avatarUrl: cleanAvatar,
    }, 'Receptionist');
    updateDoctorOverride(editingDoctor.name, {
      status: editStatus,
      availableTime: editAvailableTime.trim(),
      roomNo: editRoomNo.trim(),
      opdFee: resolvedEditOpdFee,
      phone: editPhone.trim(),
      avatarUrl: cleanAvatar,
    }, 'Receptionist');
    setDoctorsData(prev =>
      prev.map(d =>
        (d.id === editingDoctor.id || d.name === editingDoctor.name)
          ? {
              ...d,
              status: editStatus,
              availableTime: editAvailableTime.trim(),
              roomNo: editRoomNo.trim(),
              opdFee: resolvedEditOpdFee,
              phone: editPhone.trim(),
              avatarUrl: cleanAvatar
            }
          : d
      )
    );
    if (editingDoctor.id) {
      api.doctors.update(editingDoctor.id, {
        available: editStatus === 'Active',
        opdTiming: editAvailableTime.trim(),
        roomNo: editRoomNo.trim(),
        fee: resolvedEditOpdFee,
        mobile: editPhone.trim(),
        avatar: cleanAvatar,
      }).catch((err) => console.warn('Doctor update error:', err));
    }
    showToast(`${editingDoctor.name} updated successfully.`);
    setEditingDoctor(null);
  };

  const handleQuickToggleStatus = (doc: DoctorItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextStatus = toggleDoctorStatus(doc.id, doc.status, 'Receptionist');
    toggleDoctorStatus(doc.name, doc.status, 'Receptionist');
    if (doc.id) {
      api.doctors.update(doc.id, {
        available: nextStatus === 'Active',
      }).catch((err) => console.warn('Doctor toggle error:', err));
    }
    showToast(`${doc.name} status switched to: ${nextStatus}`);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'default' | 'name' | 'experience' | 'rating'>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Active Modals for Phone, Chat, Calendar & Profile
  const [selectedProfileDoc, setSelectedProfileDoc] = useState<DoctorItem | null>(null);
  const [activeCallDoc, setActiveCallDoc] = useState<DoctorItem | null>(null);
  const [activeChatDoc, setActiveChatDoc] = useState<DoctorItem | null>(null);
  const [activeBookingDoc, setActiveBookingDoc] = useState<DoctorItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Specializations & Departments for dropdowns
  const specializations = useMemo(() => ['All', ...Array.from(new Set(doctorsList.map(d => d.specialization)))], [doctorsList]);
  const departments = useMemo(() => ['All', ...Array.from(new Set(doctorsList.map(d => d.department)))], [doctorsList]);
  const statuses = ['All', 'Active', 'On Leave'];

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8; // 8 doctors per page (4x2 grid)

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSpecialization, selectedDepartment, selectedStatus, sortBy]);

  // Filtered & Sorted Doctors
  const filteredDoctors = useMemo(() => {
    return doctorsList
      .filter((doc) => {
        const matchesQuery = 
          doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.department.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSpec = selectedSpecialization === 'All' || doc.specialization === selectedSpecialization;
        const matchesDept = selectedDepartment === 'All' || doc.department === selectedDepartment;
        const matchesStatus = selectedStatus === 'All' || doc.status === selectedStatus;

        return matchesQuery && matchesSpec && matchesDept && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'experience') return b.experience - a.experience;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0; // 'default' preserves exact curated 2x4 grid layout matching screenshot
      });
  }, [doctorsList, searchQuery, selectedSpecialization, selectedDepartment, selectedStatus, sortBy]);

  // Paginated Doctors slice
  const totalItems = filteredDoctors.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedDoctors = useMemo(() => {
    return filteredDoctors.slice(startIndex, endIndex);
  }, [filteredDoctors, startIndex, endIndex]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 animate-fadeIn pb-2">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900/95 backdrop-blur-md text-white font-semibold text-xs rounded-xl shadow-2xl border border-slate-700/80 flex items-center gap-2 transition-all duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. TOP SECTION: 4 SOFT 3D GLASS KPI CARDS                */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* KPI 1: Total Doctors */}
        <div className="relative glass-card-soft-sky rounded-2xl py-2.5 px-3.5 sm:py-3 sm:px-4 overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between z-10 min-w-0">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider truncate">
              Total Doctors
            </span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-sky-500 to-blue-700 text-white shadow-xs border border-white/40 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 stroke-[2.3]" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 z-10 min-w-0">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight leading-none font-mono">
                {doctorsList.length}
              </span>
              <span className="text-[10px] font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 shrink-0">
                Full Faculty
              </span>
            </div>
            <p className="text-[10.5px] text-slate-500 font-normal mt-0.5 truncate">Total registered doctors</p>
          </div>
        </div>

        {/* KPI 2: Active Doctors */}
        <div className="relative glass-card-soft-purple rounded-2xl py-2.5 px-3.5 sm:py-3 sm:px-4 overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between z-10 min-w-0">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider truncate">
              Active Doctors
            </span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-purple-500 to-purple-700 text-white shadow-xs border border-white/40 flex items-center justify-center shrink-0">
              <Stethoscope className="w-4 h-4 stroke-[2.3]" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 z-10 min-w-0">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight leading-none font-mono">
                {doctorsList.filter(d => d.status === 'Active').length}
              </span>
              <span className="text-[10px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 shrink-0">
                On Duty
              </span>
            </div>
            <p className="text-[10.5px] text-slate-500 font-normal mt-0.5 truncate">Available for consultation</p>
          </div>
        </div>

        {/* KPI 3: Specializations */}
        <div className="relative glass-card-soft-amber rounded-2xl py-2.5 px-3.5 sm:py-3 sm:px-4 overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between z-10 min-w-0">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider truncate">
              Specializations
            </span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-amber-500 to-amber-700 text-white shadow-xs border border-white/40 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 stroke-[2.3]" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 z-10 min-w-0">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight leading-none font-mono">
                {departments.filter(d => d !== 'All').length}
              </span>
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                Departments
              </span>
            </div>
            <p className="text-[10.5px] text-slate-500 font-normal mt-0.5 truncate">Active hospital units</p>
          </div>
        </div>

        {/* KPI 4: Total Appointments */}
        <div className="relative glass-card-soft-emerald rounded-2xl py-2.5 px-3.5 sm:py-3 sm:px-4 overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between z-10 min-w-0">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider truncate">
              Total Appointments
            </span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-emerald-500 to-teal-700 text-white shadow-xs border border-white/40 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 stroke-[2.3]" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 z-10 min-w-0">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight leading-none font-mono">
                {todayAppointmentsCount}
              </span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                Booked Today
              </span>
            </div>
            <p className="text-[10.5px] text-slate-500 font-normal mt-0.5 truncate">Total appointments scheduled</p>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 2. SEARCH & FILTER CONTROLS BAR (3D Soft Glass)         */}
      {/* ======================================================== */}
      <div className="glass-subcard-soft rounded-2xl p-3 sm:p-3.5 border border-white/90 shadow-[0_8px_24px_rgba(15,23,42,0.03),inset_0_1px_1px_rgba(255,255,255,1)] flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Left: Search Input */}
        <div className="relative flex-1 min-w-[200px] sm:min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctors by name, specialization..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Filters & Controls Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dropdown 1: All Specializations */}
          <div className="relative">
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="px-3 py-2 pr-8 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer appearance-none hover:border-slate-300 shadow-2xs"
            >
              {specializations.map(spec => (
                <option key={spec} value={spec}>
                  {spec === 'All' ? 'All Specializations' : spec}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {/* Dropdown 2: All Departments */}
          <div className="relative">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 pr-8 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer appearance-none hover:border-slate-300 shadow-2xs"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {/* Dropdown 3: All Status */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 pr-8 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer appearance-none hover:border-slate-300 shadow-2xs"
            >
              {statuses.map(st => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All Status' : st}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {/* View Toggle: Grid / List */}
          <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 pr-8 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer appearance-none hover:border-slate-300 shadow-2xs"
            >
              <option value="default">Sort: Default</option>
              <option value="name">Name (A-Z)</option>
              <option value="experience">Experience</option>
              <option value="rating">Rating</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 3. DOCTORS DIRECTORY (ZERO-OVERLAP 3D CARDS)              */}
      {/* ======================================================== */}
      {isLoadingDoctors ? (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-16 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <h3 className="text-sm font-bold text-slate-700">Loading Doctors from Database...</h3>
          <p className="text-xs text-slate-400 mt-1">Fetching live records from MongoDB</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No doctors match your search</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting filters or registering doctors in the system.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSpecialization('All');
              setSelectedDepartment('All');
              setSelectedStatus('All');
              setSortBy('default');
            }}
            className="mt-4 px-4.5 py-2.5 bg-blue-50 text-blue-600 font-semibold text-xs rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW WITH SOLID PASTEL GRADIENTS & ZERO OVERLAP */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-4.5 items-stretch">
          {paginatedDoctors.map((doc) => {
            const isAvailable = doc.status === 'Active';
            
            // Professional Medical Executive Styling: Clean, cohesive & elegant
            const cardTheme = isAvailable
              ? {
                  cardBg: 'bg-white hover:bg-slate-50/40',
                  border: 'border border-slate-200/90 hover:border-emerald-500/80',
                  shadow: 'shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]',
                  specText: 'text-emerald-700',
                  deptIcon: 'text-slate-400 group-hover:text-emerald-600',
                  hoverName: 'group-hover:text-emerald-700',
                  btnStyle: 'bg-slate-900 hover:bg-emerald-700 text-white shadow-xs hover:shadow-sm',
                }
              : {
                  cardBg: 'bg-slate-50/70 hover:bg-slate-100/50',
                  border: 'border border-slate-200 hover:border-rose-300',
                  shadow: 'shadow-xs hover:shadow-md',
                  specText: 'text-slate-500',
                  deptIcon: 'text-slate-400',
                  hoverName: 'group-hover:text-rose-700',
                  btnStyle: 'bg-slate-800 hover:bg-slate-700 text-white shadow-xs',
                };

            return (
              <div
                key={doc.id}
                className={`${cardTheme.cardBg} ${cardTheme.border} ${cardTheme.shadow} rounded-2xl p-3.5 sm:p-4 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden`}
              >
                {/* Subtle Ambient Light */}
                <div className="absolute top-0 right-0 w-28 h-16 bg-slate-100/40 rounded-full blur-xl pointer-events-none" />

                <div className="relative z-10">
                  {/* Top Row: Avatar + Doctor Info */}
                  <div className="flex items-start gap-3">
                    
                    {/* Compact Doctor Portrait with Photo Edit Trigger */}
                    <div
                      onClick={() => handleOpenEditModal(doc)}
                      title={`Click to upload photo or edit Dr. ${doc.name}`}
                      className="cursor-pointer relative group/avatarlink shrink-0"
                    >
                      <DoctorAvatar
                        src={doc.avatarUrl}
                        name={doc.name}
                        backdropColor={doc.backdropColor}
                        gender={doc.gender}
                      />
                      <div className="absolute inset-0 bg-slate-900/40 rounded-2xl opacity-0 group-hover/avatarlink:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-5 h-5 text-white drop-shadow-md" />
                      </div>
                    </div>

                    {/* Info Column with truncate and no-wrap safeguards */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      
                      {/* Status Pill + 3-Dots Button */}
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border shrink-0 shadow-2xs ${
                          isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span>{doc.status}</span>
                        </span>

                        <button 
                          type="button" 
                          onClick={() => setSelectedProfileDoc(doc)}
                          className="w-6 h-6 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white/80 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Doctor Name */}
                      <h4 className={`text-[13.5px] font-bold text-slate-900 mt-1 truncate ${cardTheme.hoverName} transition-colors leading-tight`} title={doc.name}>
                        {doc.name}
                      </h4>

                      {/* Specialization */}
                      <p className={`text-[11.5px] font-bold ${cardTheme.specText} truncate mt-0.5`} title={doc.specialization}>
                        {doc.specialization}
                      </p>

                      {/* Department */}
                      <div className="flex items-center gap-1 text-[10.5px] text-slate-600 font-medium truncate mt-0.5" title={doc.department}>
                        <Building2 className={`w-3 h-3 ${cardTheme.deptIcon} shrink-0`} />
                        <span className="truncate">{doc.department}</span>
                      </div>

                      {/* Experience & Rating (Guaranteed No-Wrap) */}
                      <div className="flex items-center gap-1.5 mt-1 text-[10.5px] text-slate-600 font-medium whitespace-nowrap overflow-hidden">
                        <span className="font-semibold text-slate-700 shrink-0">{doc.experience} Years</span>
                        {doc.rating > 0 ? (
                          <div className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0 bg-white/70 px-1 py-0.2 rounded border border-amber-200/60 shadow-2xs">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                            <span className="text-slate-800 font-extrabold">{doc.rating}</span>
                            <span className="text-slate-400 font-normal text-[10px]">({doc.reviewsCount})</span>
                          </div>
                        ) : (
                          <span className="text-[9.5px] font-extrabold text-blue-700 bg-blue-50/80 px-1.5 py-0.5 rounded border border-blue-200/60 shadow-2xs">
                            Verified Faculty
                          </span>
                        )}
                      </div>

                    </div>

                  </div>

                  {/* Availability Bar with 1-Click Toggle & Quick Edit Button */}
                  <div className={`mt-2.5 mb-2.5 px-2.5 py-1.5 rounded-xl border flex items-center justify-between gap-1.5 bg-white/95 backdrop-blur-xs shadow-2xs ${
                    isAvailable
                      ? 'text-[#065F46] border-emerald-200/90'
                      : 'text-[#9F1239] border-rose-200/90'
                  }`}>
                    {/* 1-Click Status Toggle for Receptionist */}
                    <button
                      type="button"
                      onClick={(e) => handleQuickToggleStatus(doc, e)}
                      title="Click to toggle Available / On Leave"
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10.5px] font-extrabold transition-all cursor-pointer border ${
                        isAvailable
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 shadow-2xs'
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200 shadow-2xs'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      <span>{isAvailable ? 'Available' : 'On Leave'}</span>
                    </button>

                    <div className="h-3 w-px bg-slate-300/60 shrink-0 mx-0.5" />

                    <div className="text-[10px] sm:text-[10.5px] font-semibold text-slate-700 truncate text-right flex-1 min-w-0" title={doc.availableTime}>
                      {isAvailable ? doc.availableTime : (doc.leaveUntil ? `Till ${doc.leaveUntil}` : 'On Leave')}
                    </div>

                    {/* Quick Edit Doctor Timing & Fees Modal Trigger */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(doc);
                      }}
                      title={`Edit ${doc.name}'s schedule, room & fees`}
                      className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer shrink-0"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom Action Bar (Fixed Width Actions, Tactile Soft Buttons) */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-1.5 relative z-10">
                  
                  {/* Left 3 Tactile Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      title={`Call ${doc.name}`}
                      onClick={() => setActiveCallDoc(doc)}
                      className="w-8 h-8 rounded-xl bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200/90 hover:border-emerald-300 shadow-2xs flex items-center justify-center transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      title={`Chat with ${doc.name}`}
                      onClick={() => setActiveChatDoc(doc)}
                      className="w-8 h-8 rounded-xl bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200/90 hover:border-blue-300 shadow-2xs flex items-center justify-center transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      title="Book Appointment"
                      onClick={() => setActiveBookingDoc(doc)}
                      className="w-8 h-8 rounded-xl bg-white hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200/90 hover:border-teal-300 shadow-2xs flex items-center justify-center transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95"
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* View Profile Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedProfileDoc(doc)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 hover:scale-102 active:scale-98 ${cardTheme.btnStyle}`}
                  >
                    View Profile
                  </button>

                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border-2 border-slate-200/90 shadow-[0_8px_20px_rgba(15,23,42,0.05)] overflow-hidden">
          <div className="divide-y divide-slate-100">
            {paginatedDoctors.map((doc) => (
              <div 
                key={doc.id}
                className="p-4 sm:p-5 hover:bg-blue-50/40 transition-colors flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-[280px]">
                  <div
                    onClick={() => handleOpenEditModal(doc)}
                    title={`Click to upload photo or edit Dr. ${doc.name}`}
                    className="cursor-pointer relative group/avatarlink shrink-0"
                  >
                    <DoctorAvatar
                      src={doc.avatarUrl}
                      name={doc.name}
                      backdropColor={doc.backdropColor}
                      gender={doc.gender}
                    />
                    <div className="absolute inset-0 bg-slate-900/40 rounded-2xl opacity-0 group-hover/avatarlink:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-5 h-5 text-white drop-shadow-md" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{doc.name}</h4>
                      <button
                        type="button"
                        onClick={() => handleQuickToggleStatus(doc)}
                        title="Click to toggle Available / On Leave"
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95 ${
                          doc.status === 'Active' 
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${doc.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        <span>{doc.status}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(doc)}
                        title={`Edit ${doc.name}'s schedule & fees`}
                        className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs font-bold text-blue-600 mt-0.5">{doc.specialization} • {doc.department}</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">{doc.experience} Years Experience • ⭐ {doc.rating} ({doc.reviewsCount})</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-800">{doc.availableTime}</p>
                    <p className="text-[11px] text-slate-400 font-semibold">{doc.roomNo} • Fee: {doc.opdFee ? `₹${doc.opdFee}` : '—'}</p>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      title={`Call ${doc.name}`}
                      onClick={() => setActiveCallDoc(doc)}
                      className="p-2 sm:p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 border border-slate-200/90 shadow-2xs cursor-pointer transition-all hover:scale-105 active:scale-95"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title={`Chat with ${doc.name}`}
                      onClick={() => setActiveChatDoc(doc)}
                      className="p-2 sm:p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-emerald-600 border border-slate-200/90 shadow-2xs cursor-pointer transition-all hover:scale-105 active:scale-95"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title={`Book Appointment with ${doc.name}`}
                      onClick={() => setActiveBookingDoc(doc)}
                      className="p-2 sm:p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-purple-600 border border-slate-200/90 shadow-2xs cursor-pointer transition-all hover:scale-105 active:scale-95"
                    >
                      <CalendarDays className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedProfileDoc(doc)}
                      className="px-3.5 py-2 sm:px-4.5 sm:py-2.5 bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap hover:scale-102 active:scale-98"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. TACTILE PAGINATION BAR (PREVIOUS / NEXT & PAGE PILLS) */}
      {/* ======================================================== */}
      {filteredDoctors.length > 0 && (
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border-2 border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.04)] flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Summary text */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>
              Showing <span className="text-slate-900 font-bold">{totalItems === 0 ? 0 : startIndex + 1}</span> to <span className="text-slate-900 font-bold">{endIndex}</span> of <span className="text-slate-900 font-bold">{totalItems}</span> Doctors
            </span>
            <span className="hidden sm:inline-block text-slate-300">•</span>
            <span className="hidden sm:inline-block text-slate-400">Page {safeCurrentPage} of {totalPages}</span>
          </div>

          {/* Right: Previous, Page Numbers, Next Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
            
            {/* Previous Button */}
            <button
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() => {
                if (safeCurrentPage > 1) {
                  setCurrentPage(prev => prev - 1);
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                safeCurrentPage <= 1
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                  : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 border border-slate-200 hover:border-blue-300 cursor-pointer active:translate-y-0.5'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    pageNum === safeCurrentPage
                      ? 'bg-blue-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.35)] border border-blue-700'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              type="button"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => {
                if (safeCurrentPage < totalPages) {
                  setCurrentPage(prev => prev + 1);
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                safeCurrentPage >= totalPages
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                  : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 border border-slate-200 hover:border-blue-300 cursor-pointer active:translate-y-0.5'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 4. DOCTOR PROFILE DOSSIER MODAL                         */}
      {/* ======================================================== */}
      {selectedProfileDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-blue-200 w-full max-w-xl overflow-hidden animate-scaleIn">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-emerald-400 shadow-xs">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-white">{selectedProfileDoc.name}</h3>
                  <p className="text-xs text-slate-300 font-semibold">{selectedProfileDoc.specialization} • {selectedProfileDoc.department}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProfileDoc(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Doctor Quick Identity Card */}
              <div className="flex items-center gap-4.5 p-4.5 bg-slate-50/80 rounded-2xl border border-slate-200 shadow-2xs">
                <DoctorAvatar
                  src={selectedProfileDoc.avatarUrl}
                  name={selectedProfileDoc.name}
                  backdropColor={selectedProfileDoc.backdropColor}
                  gender={selectedProfileDoc.gender}
                  size="modal"
                />
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900 tracking-tight">{selectedProfileDoc.name}</span>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                      selectedProfileDoc.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {selectedProfileDoc.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-blue-700">{selectedProfileDoc.qualification}</p>
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-600 pt-0.5">
                    <span className="flex items-center gap-1 text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-800">{selectedProfileDoc.rating}</span>
                      <span className="text-slate-400 font-normal">({selectedProfileDoc.reviewsCount} Reviews)</span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>{selectedProfileDoc.experience} Years Exp.</span>
                  </div>
                </div>
              </div>

              {/* Consultation Details Grid with 3D Inset Tiles */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 border-b-[2.5px] border-b-slate-300 shadow-2xs">
                  <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider">Consultation Chamber</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedProfileDoc.roomNo}</p>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 border-b-[2.5px] border-b-slate-300 shadow-2xs">
                  <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider">OPD Consultation Fee</span>
                  <p className="text-sm font-bold text-emerald-700 mt-0.5">{selectedProfileDoc.opdFee ? `₹${selectedProfileDoc.opdFee}` : '—'} / Patient</p>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 border-b-[2.5px] border-b-slate-300 shadow-2xs">
                  <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider">Shift Timing</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedProfileDoc.availableTime}</p>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 border-b-[2.5px] border-b-slate-300 shadow-2xs">
                  <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider">Patients Queued Today</span>
                  <p className="text-sm font-bold text-indigo-700 mt-0.5">{selectedProfileDoc.patientsToday} Active</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-2.5 text-xs shadow-2xs">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold">{selectedProfileDoc.phone}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold">{selectedProfileDoc.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold">Chaudhary Health Care Center, Bareilly</span>
                </div>
              </div>

            </div>

            {/* Modal Footer Actions with Tactile 3D Buttons */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedProfileDoc(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 font-bold text-xs text-slate-700 rounded-xl transition-all cursor-pointer shadow-xs active:translate-y-0.5 shrink-0"
              >
                Close
              </button>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const doc = selectedProfileDoc;
                    setSelectedProfileDoc(null);
                    setActiveCallDoc(doc);
                  }}
                  className="px-4 py-2 bg-gradient-to-b from-white via-white to-blue-50 text-blue-700 border border-blue-300 border-b-[2.5px] border-b-blue-400 hover:bg-blue-100 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs hover:-translate-y-0.5 active:translate-y-0.5 shrink-0"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Doctor</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const doc = selectedProfileDoc;
                    setSelectedProfileDoc(null);
                    setActiveBookingDoc(doc);
                  }}
                  className="px-4.5 py-2 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-[0_4px_12px_rgba(16,185,129,0.3)] border border-emerald-400 border-b-[2.5px] border-b-emerald-800 flex items-center gap-1.5 cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Book Appointment</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. ACTIVE DOCTOR TELE-CALL MODAL                        */}
      {/* ======================================================== */}
      {activeCallDoc && (
        <DoctorCallModal
          doctor={activeCallDoc}
          onClose={() => setActiveCallDoc(null)}
          onSwitchToBooking={(doc) => {
            setActiveCallDoc(null);
            setActiveBookingDoc(doc);
          }}
        />
      )}

      {/* ======================================================== */}
      {/* 6. ACTIVE DOCTOR LIVE CHAT MODAL                         */}
      {/* ======================================================== */}
      {activeChatDoc && (
        <DoctorChatModal
          doctor={activeChatDoc}
          onClose={() => setActiveChatDoc(null)}
          onBookAppointment={(doc) => {
            setActiveChatDoc(null);
            setActiveBookingDoc(doc);
          }}
        />
      )}

      {/* ======================================================== */}
      {/* 7. ACTIVE DOCTOR APPOINTMENT & OPD TOKEN BOOKING MODAL   */}
      {/* ======================================================== */}
      {activeBookingDoc && (
        <DoctorBookingModal
          doctor={activeBookingDoc}
          onClose={() => setActiveBookingDoc(null)}
          onConfirmSuccess={(doc) => {
            showToast(`OPD Token confirmed with ${doc.name}!`);
            if (onBookAppointment) onBookAppointment(doc);
          }}
        />
      )}
      {/* ======================================================== */}
      {/* 8. RECEPTIONIST & ADMIN: EDIT DOCTOR SCHEDULE & OPD MODAL */}
      {/* ======================================================== */}
      {editingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-100">
                    Edit Doctor Availability & OPD Details
                  </h3>
                  <p className="text-xs text-slate-300">
                    {editingDoctor.name} • {editingDoctor.specialization}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingDoctor(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveDoctorEdit} className="p-5 space-y-4">
              {/* Doctor Real Photo or Monogram Avatar */}
              <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Doctor Photo (Real Image / Monogram Initials)
                  </label>
                  {editAvatarUrl ? (
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Real Photo Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-full">
                      Name Initials Active
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* Avatar Preview */}
                  <div className="relative group shrink-0">
                    <DoctorAvatar
                      src={editAvatarUrl}
                      name={editingDoctor.name}
                      size="modal"
                    />
                    {editAvatarUrl && (
                      <button
                        type="button"
                        onClick={() => setEditAvatarUrl('')}
                        title="Remove photo and use initials monogram"
                        className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:scale-102 active:scale-98"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Real Photo</span>
                      </button>

                      {editAvatarUrl && (
                        <button
                          type="button"
                          onClick={() => setEditAvatarUrl('')}
                          className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>

                    {/* Or URL input */}
                    <div className="relative">
                      <input
                        type="url"
                        value={editAvatarUrl}
                        onChange={(e) => setEditAvatarUrl(e.target.value)}
                        placeholder="Or paste image URL (https://...)"
                        className="w-full px-3 py-1.5 pr-8 bg-white border border-slate-300 focus:border-blue-500 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none"
                      />
                      {editAvatarUrl && (
                        <button
                          type="button"
                          onClick={() => setEditAvatarUrl('')}
                          className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-[10.5px] text-slate-500 leading-tight">
                      Doctor ki real image upload karein ya direct link dalein. Photo na hone par doctor ke naam ke initials monogram show honge.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Duty Availability Status *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditStatus('Active')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      editStatus === 'Active'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Active (Available for OPD)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus('On Leave')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      editStatus === 'On Leave'
                        ? 'bg-rose-50 text-rose-800 border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>On Leave (Not Available)</span>
                  </button>
                </div>
              </div>

              {/* Consultation Timings & Room No */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Available OPD Timings
                  </label>
                  <input
                    type="text"
                    value={editAvailableTime}
                    onChange={(e) => setEditAvailableTime(e.target.value)}
                    placeholder="e.g. 09:00 AM - 04:00 PM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Room / OPD Wing
                  </label>
                  <input
                    type="text"
                    value={editRoomNo}
                    onChange={(e) => setEditRoomNo(e.target.value)}
                    placeholder="e.g. OPD Room 102"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Consultation Fee & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    OPD Consultation Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={editOpdFee}
                    onChange={(e) => setEditOpdFee(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Doctor Direct Phone
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDoctor(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
