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
  /** Granted by the backend (admin/developer always true) â€” drives billing visibility */
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
      // ðŸŒ Triggers official Google OAuth popup (accounts.google.com)
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
      // ðŸ”’ Strict authentication against live MongoDB backend
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
          FLOATING CARD: Login Form (Positioned towards middle-right,
          with ~10-12% spacing from right screen edge as drawn)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full h-full flex items-center justify-center lg:justify-end px-4 sm:px-8 lg:pr-[8vw] xl:pr-[12vw] 2xl:pr-[15vw]">
        <div className="w-full max-w-[390px] bg-white rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 animate-fadeIn my-auto">
          {/* Back link */}
          <div className="mb-5">
            <a
              href="#/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors group cursor-pointer"
            >
              <span className="transition-transform group-hover:-translate-x-1 font-bold">‹</span>
              <span>Go Back</span>
            </a>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Sign In
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="flex-1 font-medium">{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-rose-700 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address*
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password*
                </label>
                <button
                  type="button"
                  onClick={() => setErrorMessage('Contact Chaudhary IT Administration to reset your password.')}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-600">
                  Remember me
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full py-2.5 px-4 bg-[#1e40af] hover:bg-[#1d4ed8] text-white font-semibold text-sm rounded-xl transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Logging in...</span>
                </div>
              ) : (
                <span>Log in</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-medium">OR</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleRealGoogleSignIn}
            disabled={isLoading || isGoogleLoading}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl border border-slate-300 hover:border-slate-400 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 shadow-2xs"
          >
            {isGoogleLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                <span className="text-slate-500 font-medium text-xs">Connecting...</span>
              </div>
            ) : (
              <>
                <GoogleIcon className="w-4 h-4 shrink-0" />
                <span>Log in with Google</span>
              </>
            )}
          </button>

          {/* Sign Up Link */}
          {onNavigateToSignUp && (
            <p className="mt-6 text-center text-xs text-slate-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToSignUp}
                className="text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
