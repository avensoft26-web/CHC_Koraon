import React, { useState, useEffect, useRef } from 'react';
import {
  Eye,
  EyeOff,
  ChevronDown,
  Clock,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Edit3
} from 'lucide-react';
import { api } from '../../services/api';
import { ChaudharyLogo } from '../../components/chaudhary/ChaudharyLogo';
import { subscribeToHmsEvent } from '../../services/realtime';
import { AuthUser } from './LoginPage';
import { PortalRole } from '../../types/hospital';
import { GoogleIcon } from '../../components/common/GoogleIcon';
import { triggerRealGoogleSignIn } from '../../services/firebaseAuth';

interface SignUpPageProps {
  onNavigateToLogin: () => void;
  onLogin?: (user: AuthUser) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigateToLogin, onLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email OTP Verification Lifecycle
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isVerifyingOtpLoading, setIsVerifyingOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [resendSuccessMsg, setResendSuccessMsg] = useState<string | null>(null);

  // Pending / Approved Lifecycle State
  const [isSubmittedPending, setIsSubmittedPending] = useState(false);
  const [submittedUser, setSubmittedUser] = useState<{
    name: string;
    email: string;
    mobile: string;
    role: string;
    password?: string;
  } | null>(null);

  const [isApproved, setIsApproved] = useState(false);
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);
  const [loginRedirectCountdown, setLoginRedirectCountdown] = useState<number | null>(null);

  const isLoggingInRef = useRef(false);

  // Countdown timer for Resend OTP button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // -------------------------------------------------------------
  // Real-Time Approval Detection (WebSocket + Active Polling)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isSubmittedPending || !submittedUser) return;

    let isMounted = true;

    // Helper: Execute auto-login upon approval
    const triggerLogin = async (userEmail: string, userPass?: string) => {
      if (isLoggingInRef.current) return;
      isLoggingInRef.current = true;
      setIsApproved(true);

      if (userPass && onLogin) {
        setIsAutoLoggingIn(true);
        setLoginRedirectCountdown(2);

        try {
          const data = await api.auth.login({
            email: userEmail.trim(),
            password: userPass,
          });

          if (data?.success && isMounted) {
            const roleMap: Record<string, PortalRole> = {
              receptionist: 'RECEPTIONIST',
              reception: 'RECEPTIONIST',
              doctor: 'DOCTOR',
              admin: 'ADMIN',
              staff: 'STAFF',
              nurse: 'STAFF',
              developer: 'DEVELOPER',
            };

            const resolvedRole = roleMap[data.role?.toLowerCase()] || 'RECEPTIONIST';

            const deptMap: Record<PortalRole, string> = {
              RECEPTIONIST: 'Front Desk OPD & Admission Counter',
              DOCTOR: 'Medical & Clinical Department',
              ADMIN: 'Hospital Administration & Board',
              STAFF: 'Nursing & Inpatient Care',
              DEVELOPER: 'Systems & Technical Architecture',
            };

            const authenticatedUser: AuthUser = {
              id: data.user_id,
              name: data.name || submittedUser.name,
              role: resolvedRole,
              email: data.email || userEmail,
              avatarUrl: data.avatar || '',
              department: deptMap[resolvedRole],
              billingAccess: Boolean(data.billingAccess),
            };

            try {
              localStorage.setItem('chaudhary_auth_user', JSON.stringify(authenticatedUser));
              window.dispatchEvent(new Event('chaudhary_auth_updated'));
            } catch { }

            // Smooth 1.5-second celebration transition before auto-entering
            setTimeout(() => {
              if (isMounted) {
                onLogin(authenticatedUser);
              }
            }, 1500);
            return;
          }
        } catch (err) {
          console.warn('[AutoLogin] Error logging in automatically:', err);
          if (isMounted) setIsAutoLoggingIn(false);
        }
      } else {
        if (isMounted) setIsAutoLoggingIn(false);
      }
    };

    // 1. Instant WebSocket event listener (0ms latency broadcast)
    const unsubscribe = subscribeToHmsEvent('user:approved', (payload: any) => {
      if (!isMounted) return;
      const approvedEmail = payload?.email?.toLowerCase();
      if (approvedEmail && approvedEmail === submittedUser.email.toLowerCase()) {
        console.log('[Socket.IO] Real-time approval received for:', approvedEmail);
        triggerLogin(submittedUser.email, submittedUser.password);
      }
    });

    // 2. Continuous 3-second background polling fallback
    const pollInterval = setInterval(async () => {
      if (!isMounted || isLoggingInRef.current) return;
      try {
        const res = await api.auth.checkStatus(submittedUser.email);
        if (res?.isApproved || res?.status === 'active') {
          console.log('[Polling] Detected approval status: active');
          triggerLogin(submittedUser.email, submittedUser.password);
        }
      } catch {
        // Ignore network drops during polling
      }
    }, 3000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [isSubmittedPending, submittedUser, onLogin]);

  // -------------------------------------------------------------
  // Form Submission
  // -------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form Validations
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!mobileNumber.trim() || mobileNumber.trim().length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both passwords.');
      return;
    }
    if (!role) {
      setErrorMessage('Please select your hospital role.');
      return;
    }

    setIsLoading(true);

    try {
      // 🔒 Public registration: sets status 'pending' on MongoDB
      const res = await api.auth.signup({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobileNumber.trim(),
        password,
        role,
        googleIdToken: googleIdToken || undefined,
        isGoogleSignup: isGoogleConnected,
      });

      setIsLoading(false);

      if (res?.success) {
        setSubmittedUser({
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          mobile: mobileNumber.trim(),
          role: role.toUpperCase(),
          password, // Stored in memory for automatic login on approval
        });

        if (res?.requiresOtp) {
          setIsVerifyingOtp(true);
          setEnteredOtp('');
          setOtpError(null);
          setResendCooldown(45);
        } else {
          setIsSubmittedPending(true);
        }
      } else {
        setErrorMessage(res?.message || 'Registration failed. Please check your information.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Registration could not be completed. Please try again.');
    }
  };

  // -------------------------------------------------------------
  // Verify OTP Submission
  // -------------------------------------------------------------
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!enteredOtp || enteredOtp.trim().length < 6) {
      setOtpError('Please enter the complete 6-digit OTP code sent to your email.');
      return;
    }

    setIsVerifyingOtpLoading(true);
    setOtpError(null);

    const targetEmail = submittedUser?.email || email.trim().toLowerCase();

    try {
      const res = await api.auth.verifySignupOtp({
        email: targetEmail,
        otp: enteredOtp.trim(),
      });

      setIsVerifyingOtpLoading(false);

      if (res?.success) {
        setIsVerifyingOtp(false);
        setIsSubmittedPending(true);
      } else {
        setOtpError(res?.message || 'Invalid OTP. Please check the code and try again.');
      }
    } catch (err: any) {
      setIsVerifyingOtpLoading(false);
      setOtpError(err?.message || 'Invalid OTP. Please check the code and try again.');
    }
  };

  // -------------------------------------------------------------
  // Resend OTP
  // -------------------------------------------------------------
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResendingOtp || !submittedUser) return;

    setIsResendingOtp(true);
    setOtpError(null);

    try {
      const res = await api.auth.signup({
        name: submittedUser.name,
        email: submittedUser.email,
        mobile: submittedUser.mobile,
        password: submittedUser.password,
        role: submittedUser.role.toLowerCase(),
      });

      setIsResendingOtp(false);

      if (res?.success) {
        setResendCooldown(45);
        setResendSuccessMsg('A fresh verification OTP has been sent to your email.');
        setTimeout(() => setResendSuccessMsg(null), 4000);
      } else {
        setOtpError(res?.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (err: any) {
      setIsResendingOtp(false);
      setOtpError(err?.message || 'Failed to resend OTP. Please try again.');
    }
  };

  const handleManualEnterPortal = async () => {
    if (!submittedUser) return;
    if (submittedUser.password && onLogin) {
      setIsAutoLoggingIn(true);
      try {
        const data = await api.auth.login({
          email: submittedUser.email,
          password: submittedUser.password,
        });
        if (data?.success) {
          const roleMap: Record<string, PortalRole> = {
            receptionist: 'RECEPTIONIST',
            reception: 'RECEPTIONIST',
            doctor: 'DOCTOR',
            admin: 'ADMIN',
            staff: 'STAFF',
            nurse: 'STAFF',
            developer: 'DEVELOPER',
          };
          const resolvedRole = roleMap[data.role?.toLowerCase()] || 'RECEPTIONIST';
          const deptMap: Record<PortalRole, string> = {
            RECEPTIONIST: 'Front Desk OPD & Admission Counter',
            DOCTOR: 'Medical & Clinical Department',
            ADMIN: 'Hospital Administration & Board',
            STAFF: 'Nursing & Inpatient Care',
            DEVELOPER: 'Systems & Technical Architecture',
          };

          const authenticatedUser: AuthUser = {
            id: data.user_id,
            name: data.name || submittedUser.name,
            role: resolvedRole,
            email: data.email || submittedUser.email,
            avatarUrl: data.avatar || '',
            department: deptMap[resolvedRole],
            billingAccess: Boolean(data.billingAccess),
          };

          try {
            localStorage.setItem('chaudhary_auth_user', JSON.stringify(authenticatedUser));
            window.dispatchEvent(new Event('chaudhary_auth_updated'));
          } catch { }

          onLogin(authenticatedUser);
          return;
        }
      } catch {
        setIsAutoLoggingIn(false);
      }
    }
    // Fallback: take user to Sign In page
    onNavigateToLogin();
  };

  const handleRealGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);

    try {
      // 🌐 Triggers official Google OAuth popup (accounts.google.com)
      const googleUser = await triggerRealGoogleSignIn();
      setIsGoogleLoading(false);

      setFullName(googleUser.name);
      setEmail(googleUser.email);
      setGoogleIdToken(googleUser.idToken);
      setIsGoogleConnected(true);
      if (!password) {
        setPassword('GoogleAuth@123');
        setConfirmPassword('GoogleAuth@123');
      }
    } catch (err: any) {
      setIsGoogleLoading(false);
      if (err?.code === 'auth/popup-closed-by-user') {
        return;
      }
      setErrorMessage(err?.message || 'Could not connect with Google.');
    }
  };

  // -------------------------------------------------------------
  // Render: OTP Email Verification Screen (Neat & Clean)
  // -------------------------------------------------------------
  if (isVerifyingOtp && submittedUser) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
        {/* Soft Ambient Background Glows */}
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[400px] bg-white rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.06),0_2px_8px_rgba(15,23,42,0.03)] p-7 sm:p-8 z-10 transition-all animate-fadeIn">

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-3">
              <ChaudharyLogo size={46} className="shadow-xs ring-1 ring-slate-200/80" />
            </div>

            <span className="text-[11px] font-bold tracking-wider uppercase text-teal-700">
              Chaudhary Health Care
            </span>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Verify Email
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Enter the 6-digit code sent to
            </p>
            <div className="mt-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <span>{submittedUser.email}</span>
              <button
                type="button"
                onClick={() => {
                  setIsVerifyingOtp(false);
                  setOtpError(null);
                }}
                className="text-indigo-600 hover:text-indigo-800 p-0.5 cursor-pointer"
                title="Change Email"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* OTP Error Banner */}
          {otpError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[11.5px] text-rose-700 font-medium">{otpError}</p>
              </div>
              <button
                type="button"
                onClick={() => setOtpError(null)}
                className="text-rose-400 hover:text-rose-700 p-0.5 cursor-pointer"
              >
                ×
              </button>
            </div>
          )}

          {/* Resend Success Banner */}
          {resendSuccessMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="font-semibold text-[11.5px]">{resendSuccessMsg}</p>
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="relative">
                <input
                  id="signup-otp-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  autoFocus
                  value={enteredOtp}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setEnteredOtp(clean);
                    setOtpError(null);
                  }}
                  placeholder="------"
                  className="w-full py-3 px-4 text-center tracking-[0.55em] text-2xl font-bold font-mono bg-slate-50 border-2 border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl text-slate-900 placeholder:text-slate-300 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isVerifyingOtpLoading || enteredOtp.length < 6}
              className="w-full py-3 rounded-xl text-white font-bold text-xs sm:text-sm tracking-wide bg-[#4f46e5] hover:bg-[#4338ca] shadow-md shadow-indigo-500/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isVerifyingOtpLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Verify OTP</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </div>
              )}
            </button>

            {/* Resend & Back controls */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsVerifyingOtp(false);
                  setOtpError(null);
                }}
                className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={resendCooldown > 0 || isResendingOtp}
                onClick={handleResendOtp}
                className="text-indigo-600 hover:text-indigo-800 font-semibold disabled:text-slate-400 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
              >
                {isResendingOtp ? (
                  <>
                    <div className="w-3 h-3 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                    <span>Resending...</span>
                  </>
                ) : resendCooldown > 0 ? (
                  <span>Resend in {resendCooldown}s</span>
                ) : (
                  <>
                    <RotateCcw className="w-3 h-3" />
                    <span>Resend OTP</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Render: Pending Admin Approval / Approved Screen (Neat & Clean)
  // -------------------------------------------------------------
  if (isSubmittedPending && submittedUser) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
        {/* Soft Ambient Background Glows */}
        <div className={`absolute top-1/4 -left-40 w-96 h-96 ${isApproved ? 'bg-emerald-100/50' : 'bg-indigo-100/40'} rounded-full blur-3xl pointer-events-none transition-colors duration-700`} />
        <div className={`absolute bottom-1/4 -right-40 w-96 h-96 ${isApproved ? 'bg-teal-100/50' : 'bg-amber-100/40'} rounded-full blur-3xl pointer-events-none transition-colors duration-700`} />

        <div className="w-full max-w-[400px] bg-white rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.06),0_2px_8px_rgba(15,23,42,0.03)] p-7 sm:p-8 z-10 transition-all animate-fadeIn">

          {/* Header Icon */}
          <div className="flex flex-col items-center text-center mb-5">
            {isApproved ? (
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3 shadow-xs">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3 shadow-xs">
                <Clock className="w-7 h-7 stroke-[2.2] animate-pulse" />
              </div>
            )}

            <span className="text-[11px] font-bold tracking-wider uppercase text-teal-700">
              Chaudhary Health Care
            </span>

            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              {isApproved ? 'Account Approved!' : 'Registration Received'}
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {isApproved
                ? 'Your credentials are verified. You may now enter the portal.'
                : 'Your request is pending administrator approval.'}
            </p>
          </div>

          {/* User Details Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs mb-5">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Name</span>
              <span className="text-slate-800 font-semibold">{submittedUser.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Email</span>
              <span className="text-slate-800 font-semibold">{submittedUser.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Role</span>
              <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                {submittedUser.role}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
              <span className="text-slate-400 font-medium">Status</span>
              {isApproved ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active
                </span>
              ) : (
                <span className="text-amber-600 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Pending Approval
                </span>
              )}
            </div>
          </div>

          {/* Action Button */}
          {isApproved ? (
            <button
              type="button"
              onClick={handleManualEnterPortal}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md shadow-emerald-500/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enter Portal</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="w-full py-3 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md shadow-indigo-500/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </button>
          )}

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Render: Main Create Account Form (Neat & Clean)
  // -------------------------------------------------------------
  return (
    <div className="relative h-screen w-full flex items-center justify-center lg:justify-end overflow-hidden font-sans selection:bg-blue-600 selection:text-white bg-slate-950">
      {/* ─────────────────────────────────────────────────────────────
          FULL-SCREEN BACKGROUND: Uniform Opacity across Left and Middle
      ───────────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-slate-950">
        <img
          src="./images/chc-building.jpg"
          alt="Chaudhary Health Care Center"
          className="w-full h-full object-cover opacity-55"
        />
        {/* Uniform overlay: exact same opacity on left side and middle */}
        <div className="absolute inset-0 bg-slate-950/45" />
        {/* Subtle top vignette for crystal-clear logo readability */}
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-slate-950/70 to-transparent" />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TOP-LEFT BRANDING: Fixed Large [Logo] + Name (Zero Jump)
      ───────────────────────────────────────────────────────────── */}
      <div className="fixed top-6 left-6 sm:top-10 sm:left-12 z-20 flex items-center gap-4 sm:gap-6 pointer-events-auto">
        {/* Large White Square Logo Box */}
        <div className="w-18 h-18 sm:w-24 sm:h-24 md:w-26 md:h-26 bg-white rounded-2xl shadow-2xl flex items-center justify-center shrink-0 p-2 sm:p-2.5 border border-white/40">
          <ChaudharyLogo size={74} />
        </div>
        <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-extrabold text-white tracking-tight drop-shadow-lg leading-tight">
            Chaudhary Health Care Center
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/95 font-medium tracking-wide mt-1 drop-shadow-md">
            Koraon, Prayagraj
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          FLOATING CARD: SignUp Form (Non-scrollable, compact layout,
          fits 100vh with ~10-12% spacing from right screen edge)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full h-full flex items-center justify-center lg:justify-end px-4 sm:px-8 lg:pr-[8vw] xl:pr-[12vw] 2xl:pr-[15vw]">
        <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl border border-white/20 p-5 sm:p-6 animate-fadeIn my-auto">
          {/* Back link */}
          <div className="mb-2">
            <a
              href="#/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors group cursor-pointer"
            >
              <span className="transition-transform group-hover:-translate-x-1 font-bold">‹</span>
              <span>Go Back</span>
            </a>
          </div>

          {/* Top Brand Header */}
          <div className="mb-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Create Account
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Fill in your details to register
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[11.5px] text-rose-700">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-rose-700 p-0.5 cursor-pointer"
              >
                ×
              </button>
            </div>
          )}

          {/* Google Sign Up Button */}
          <button
            type="button"
            onClick={handleRealGoogleSignUp}
            disabled={isLoading || isGoogleLoading}
            className="w-full py-2.5 px-4 mb-3.5 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm font-medium text-slate-700 flex items-center justify-center gap-2.5 transition-all shadow-2xs hover:shadow-xs active:scale-[0.99] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                <span className="text-slate-500 font-medium text-xs">Connecting to Google...</span>
              </div>
            ) : (
              <>
                <GoogleIcon className="w-4 h-4 shrink-0" />
                <span>Sign up with Google</span>
              </>
            )}
          </button>

          {isGoogleConnected && (
            <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px]">Google account connected</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsGoogleConnected(false);
                  setEmail('');
                  setFullName('');
                }}
                className="text-[11px] text-emerald-700 hover:text-emerald-950 underline font-bold cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          )}

          {/* Clean Divider */}
          <div className="relative mb-2.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/90" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                or register with email
              </span>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-2.5">
            {/* 1. Full Name */}
            <div>
              <label htmlFor="signup-fullName" className="block text-xs font-bold text-slate-700 mb-1">
                Full Name*
              </label>
              <input
                id="signup-fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
                placeholder="Dr. Rajesh Sharma"
                autoComplete="name"
              />
            </div>

            {/* 2. Email Address */}
            <div>
              <label htmlFor="signup-email" className="block text-xs font-bold text-slate-700 mb-1">
                Email Address*
              </label>
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
                placeholder="rajesh@chaudhary.com"
                autoComplete="email"
              />
            </div>

            {/* 3. Mobile Number */}
            <div>
              <label htmlFor="signup-mobile" className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number*
              </label>
              <input
                id="signup-mobile"
                type="tel"
                required
                maxLength={10}
                value={mobileNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setMobileNumber(val);
                  setErrorMessage(null);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
                placeholder="9876543210"
                autoComplete="tel"
              />
            </div>

            {/* 4. Hospital Role */}
            <div>
              <label htmlFor="signup-role" className="block text-xs font-bold text-slate-700 mb-1">
                Hospital Role*
              </label>
              <div className="relative">
                <select
                  id="signup-role"
                  required
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full px-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled className="text-slate-400">
                    Select your role
                  </option>
                  <option value="doctor">Doctor</option>
                  <option value="receptionist">Receptionist / Front Desk</option>
                  <option value="staff">Staff / Nursing Care</option>
                  <option value="admin">Hospital Administrator</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* 5. Password */}
            <div>
              <label htmlFor="signup-password" className="block text-xs font-bold text-slate-700 mb-1">
                Password*
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full px-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 6. Confirm Password */}
            <div>
              <label htmlFor="signup-confirmPassword" className="block text-xs font-bold text-slate-700 mb-1">
                Confirm Password*
              </label>
              <div className="relative">
                <input
                  id="signup-confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full px-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-1.5">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm tracking-wide bg-[#4f46e5] hover:bg-[#4338ca] shadow-md shadow-indigo-500/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <span>Sign Up</span>
                )}
              </button>
            </div>

            {/* Already have an account */}
            <div className="pt-4 pb-1 text-center">
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer ml-0.5"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

