import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  X,
  Clock
} from 'lucide-react';
import { PortalRole } from '../../types/hospital';
import { ChaudharyLogo } from '../../components/chaudhary/ChaudharyLogo';
import { api } from '../../services/api';
import { GoogleIcon } from '../../components/common/GoogleIcon';
import { triggerRealGoogleSignIn } from '../../services/firebaseAuth';

export interface AuthUser {
  id: string;
  name: string;
  role: PortalRole;
  email: string;
  avatarUrl: string;
  department: string;
  /** Granted by the backend (admin/developer always true) — drives billing visibility */
  billingAccess?: boolean;
}

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
  onNavigateToSignUp?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRealGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);

    try {
      // 🌐 Triggers official Google OAuth popup (accounts.google.com)
      const googleUser = await triggerRealGoogleSignIn();

      // Strict authentication against live backend
      const data = await api.auth.googleLogin({
        idToken: googleUser.idToken,
        email: googleUser.email,
        name: googleUser.name,
      });

      setIsGoogleLoading(false);

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
          name: data.name || googleUser.name,
          role: resolvedRole,
          email: data.email || googleUser.email,
          avatarUrl: data.avatar || googleUser.avatar || '',
          department: deptMap[resolvedRole],
          billingAccess: Boolean(data.billingAccess),
        };

        try {
          localStorage.setItem('chaudhary_auth_user', JSON.stringify(authenticatedUser));
          if (rememberMe) {
            localStorage.setItem('chaudhary_saved_email', googleUser.email);
          }
          window.dispatchEvent(new Event('chaudhary_auth_updated'));
        } catch { }

        onLogin(authenticatedUser);
      } else {
        setErrorMessage(data?.message || 'Google login failed.');
      }
    } catch (err: any) {
      setIsGoogleLoading(false);
      if (err?.code === 'auth/popup-closed-by-user') {
        return;
      }
      if (err?.body?.notRegistered || err?.status === 404) {
        setErrorMessage(`No hospital account registered for this Google account. Please click "Create Account" below.`);
      } else if (err?.body?.isPendingApproval || err?.status === 403) {
        setErrorMessage('Your account is awaiting administrator approval.');
      } else {
        setErrorMessage(err?.message || 'Google authentication failed.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 🔒 Strict authentication against live MongoDB backend
      const data = await api.auth.login({ email: email.trim(), password });
      setIsLoading(false);

      if (data?.success) {
        // Map backend role to frontend PortalRole
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
          name: data.name || (data.email ? data.email.split('@')[0] : 'Hospital Personnel'),
          role: resolvedRole,
          email: data.email || email.trim(),
          avatarUrl: data.avatar || '',
          department: deptMap[resolvedRole],
          billingAccess: Boolean(data.billingAccess),
        };

        try {
          localStorage.setItem('chaudhary_auth_user', JSON.stringify(authenticatedUser));
          if (rememberMe) {
            localStorage.setItem('chaudhary_saved_email', email.trim());
          } else {
            localStorage.removeItem('chaudhary_saved_email');
          }
          window.dispatchEvent(new Event('chaudhary_auth_updated'));
        } catch {
          // Ignore storage error
        }

        onLogin(authenticatedUser);
      } else {
        setErrorMessage(data?.message || 'Login failed. Please verify your email and password.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Authentication failed. Please verify your email and password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-white">
      {/* Background Soft Organic Glows */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Clean Centered Login Card */}
      <div className="w-full max-w-[400px] bg-white rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.06),0_2px_8px_rgba(15,23,42,0.03)] p-7 sm:p-8 z-10 transition-all">

        {/* Top Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-3">
            <ChaudharyLogo size={46} className="shadow-xs ring-1 ring-slate-200/80" />
          </div>

          <span className="text-[11px] font-bold tracking-wider uppercase text-teal-700">
            Chaudhary Health Care
          </span>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Sign In
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Enter your credentials to access your portal
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          errorMessage.toLowerCase().includes('pending') ? (
            <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900 animate-fadeIn">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-amber-900">Pending Approval</p>
                <p className="text-[11.5px] text-amber-800 mt-0.5 leading-relaxed">
                  Your account is awaiting administrator approval.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-amber-500 hover:text-amber-800 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[11.5px] text-rose-700">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-rose-700 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        )}

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleRealGoogleSignIn}
          disabled={isLoading || isGoogleLoading}
          className="w-full py-2.5 px-4 mb-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-700 flex items-center justify-center gap-2.5 transition-all shadow-2xs hover:shadow-xs active:scale-[0.99] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isGoogleLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
              <span className="text-slate-500 font-semibold">Connecting to Google...</span>
            </div>
          ) : (
            <>
              <GoogleIcon className="w-4 h-4 shrink-0" />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Clean Divider */}
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/90" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              or with email
            </span>
          </div>
        </div>

        {/* Clean Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
                placeholder="doctor@chaudhary.com"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('To reset your password, contact Chaudhary IT Administration.');
                }}
                className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Checkbox: Remember Me */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-300 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-600">
                Remember me
              </span>
            </label>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl text-white text-xs sm:text-sm font-bold transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer bg-[#4f46e5] hover:bg-[#4338ca] shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>

          {/* New Staff Registration Link */}
          {onNavigateToSignUp && (
            <div className="pt-2 text-center">
              <p className="text-xs text-slate-500 font-medium">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onNavigateToSignUp}
                  className="text-indigo-600 font-bold hover:underline cursor-pointer"
                >
                  Create Account
                </button>
              </p>
            </div>
          )}
        </form>

      </div>
    </div>
  );
};
