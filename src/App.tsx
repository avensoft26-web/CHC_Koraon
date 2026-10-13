import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { PublicSiteApp } from './public-site/PublicSiteApp';
import { LoginPage, AuthUser } from './features/auth/LoginPage';
import { SignUpPage } from './features/auth/SignUpPage';
import { HospitalProvider, useHospitalContext } from './context/HospitalContext';
import { GlobalCommandSearch } from './components/chaudhary/GlobalCommandSearch';
import { useHospitalHotkeys } from './hooks/useHospitalHotkeys';
import { api } from './services/api';
import { disconnectSocket } from './services/realtime';
import { ChaudharyLogo } from './components/chaudhary/ChaudharyLogo';
import { PortalRole } from './types/hospital';
import { OfflineStatusIndicator } from './components/common/OfflineStatusIndicator';

// Lazy-loaded portals for fast initial page load and code splitting
const ChaudharyReceptionistDashboard = React.lazy(() => 
  import('./portals/receptionist/ChaudharyReceptionistDashboard').then(m => ({ default: m.ChaudharyReceptionistDashboard }))
);
const ChaudharyStaffDashboard = React.lazy(() => 
  import('./portals/staff/ChaudharyStaffDashboard').then(m => ({ default: m.ChaudharyStaffDashboard }))
);
const ChaudharyAdminDashboard = React.lazy(() => 
  import('./portals/admin/ChaudharyAdminDashboard').then(m => ({ default: m.ChaudharyAdminDashboard }))
);
const ChaudharyDoctorDashboard = React.lazy(() => 
  import('./portals/doctor/ChaudharyDoctorDashboard').then(m => ({ default: m.ChaudharyDoctorDashboard }))
);
const ChaudharyDeveloperDashboard = React.lazy(() => 
  import('./portals/developer/ChaudharyDeveloperDashboard').then(m => ({ default: m.ChaudharyDeveloperDashboard }))
);

function DashboardLoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
      <p className="text-sm font-medium text-slate-400">Loading Hospital Portal Module...</p>
    </div>
  );
}

function AuthenticatedApp({ 
  currentUser, 
  onLogout 
}: { 
  currentUser: AuthUser; 
  onLogout: () => void;
}) {
  useHospitalHotkeys();
  const { toastMessage } = useHospitalContext();

  return (
    <>
      <GlobalCommandSearch />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999] bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-slate-700/80 flex items-center gap-2.5 transition-all duration-300 transform translate-y-0 opacity-100">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <Suspense fallback={<DashboardLoadingFallback />}>
        {/* 1. DOCTOR PORTAL */}
        {currentUser.role === 'DOCTOR' && (
          <ChaudharyDoctorDashboard userId={currentUser.id} onLogout={onLogout} />
        )}

        {/* 2. ADMIN PORTAL */}
        {currentUser.role === 'ADMIN' && (
          <ChaudharyAdminDashboard userId={currentUser.id} onLogout={onLogout} />
        )}

        {/* 3. RECEPTIONIST PORTAL */}
        {currentUser.role === 'RECEPTIONIST' && (
          <ChaudharyReceptionistDashboard onLogout={onLogout} />
        )}

        {/* 4. STAFF / NURSE PORTAL */}
        {currentUser.role === 'STAFF' && (
          <ChaudharyStaffDashboard userId={currentUser.id} onLogout={onLogout} />
        )}

        {/* 5. DEVELOPER PORTAL */}
        {currentUser.role === 'DEVELOPER' && (
          <ChaudharyDeveloperDashboard userId={currentUser.id} onLogout={onLogout} />
        )}
      </Suspense>
    </>
  );
}

const getInitialAuthUser = (): AuthUser | null => {
  try {
    const token = localStorage.getItem('chaudhary_jwt_token') || localStorage.getItem('auth_token');
    const cached = localStorage.getItem('chaudhary_auth_user');
    if (!token || !cached) return null;
    const parsed = JSON.parse(cached) as AuthUser;
    const validRoles: PortalRole[] = ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'STAFF', 'DEVELOPER'];
    if (parsed && validRoles.includes(parsed.role)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

export function App() {
  const navigate = useNavigate();
  // ðŸ”’ SECURITY: the session is NOT hydrated from localStorage on first
  // render. It previously was (`useState(getInitialAuthUser)`), which painted
  // the full portal â€” ADMIN included â€” from a client-side cache before the
  // server had confirmed anything, on every reload.
  //
  // Local storage is a cache, not an authority. The session is now resolved by
  // the server in the effect below; until it answers, the app shows the
  // verification splash and nothing else. `getInitialAuthUser` survives purely
  // to answer "is there a stored token to verify?" â€” it never renders UI.
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(() => {
    const token = localStorage.getItem('chaudhary_jwt_token') || localStorage.getItem('auth_token');
    // Only skip the splash when there is definitively nothing to verify.
    return Boolean(token);
  });

  // Cross-tab synchronization: If user logs in/out in another tab, update immediately
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chaudhary_jwt_token' || e.key === 'chaudhary_auth_user' || e.key === 'auth_token') {
        // A token appearing in another tab must still be verified against the
        // server before this tab renders an authenticated portal.
        const hasToken = Boolean(localStorage.getItem('chaudhary_jwt_token') || localStorage.getItem('auth_token'));
        if (!hasToken) {
          setCurrentUser(null);
    navigate('/');
          setIsCheckingAuth(false);
          return;
        }
        window.dispatchEvent(new Event('chaudhary_reverify_session'));
      }
    };

    // ðŸ”’ SECURITY: this handler used to call setCurrentUser(getInitialAuthUser()),
    // i.e. render whatever was in localStorage. Anything that could write to
    // localStorage â€” an XSS payload, a shared machine, an extension â€” could
    // therefore paint an authenticated portal here.
    //
    // It now triggers the same server verification as a fresh page load. The
    // token is still sent on the next request; only the RENDERING of a session
    // is gated on the server confirming it.
    const handleCustomAuthUpdate = () => {
      const hasToken = Boolean(
        localStorage.getItem('chaudhary_jwt_token') || localStorage.getItem('auth_token')
      );
      if (!hasToken) {
        setCurrentUser(null);
    navigate('/');
        setIsCheckingAuth(false);
        return;
      }
      window.dispatchEvent(new Event('chaudhary_reverify_session'));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('chaudhary_auth_updated', handleCustomAuthUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('chaudhary_auth_updated', handleCustomAuthUpdate);
    };
  }, []);

  // Background session verification from backend JWT
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      if (isMounted) setIsCheckingAuth(true);
      const token = localStorage.getItem('chaudhary_jwt_token') || localStorage.getItem('auth_token');
      if (!token) {
        if (isMounted) {
          setCurrentUser(null);
    navigate('/');
          setIsCheckingAuth(false);
        }
        return;
      }

      const roleMap: Record<string, PortalRole> = {
        receptionist: 'RECEPTIONIST',
        reception: 'RECEPTIONIST',   // Backend stores 'reception'
        doctor: 'DOCTOR',
        admin: 'ADMIN',
        staff: 'STAFF',
        nurse: 'STAFF',
        developer: 'DEVELOPER',
      };
      const deptMap: Record<PortalRole, string> = {
        RECEPTIONIST: 'Front Desk OPD & Admission Counter',
        DOCTOR: 'Department of Cardiology (Room 102)',
        ADMIN: 'Hospital Administration & Board',
        STAFF: 'Intensive Care Unit (ICU Floor 3)',
        DEVELOPER: 'System Architecture & Engineering',
      };

      try {
        const res = await api.auth.getProfile();
        if (isMounted && res.success && res.user) {
          const resolvedRole = roleMap[res.user.role?.toLowerCase()] || 'RECEPTIONIST';

          const verifiedUser: AuthUser = {
            id: res.user._id || res.user.id,
            name: res.user.name,
            role: resolvedRole,
            email: res.user.email,
            avatarUrl: res.user.avatar || '',
            department: res.user.department || deptMap[resolvedRole],
            // Mirrors the backend rule: admin/developer always have billing access
            billingAccess: (resolvedRole === 'ADMIN' || resolvedRole === 'DEVELOPER')
              ? true
              : Boolean(res.user.billingAccess),
          };

          try {
            localStorage.setItem('chaudhary_auth_user', JSON.stringify(verifiedUser));
          } catch {}

          setCurrentUser(verifiedUser);
        }
      } catch (err: any) {
        // The backend could not be reached OR explicitly rejected the session.
        //
        // ðŸ”’ SECURITY: the previous code logged out only on 401/403 and
        // otherwise restored a cached user object from localStorage, rendering
        // a fully working portal â€” including ADMIN â€” with no server validation.
        // Any client able to make the API unreachable (outage, DNS failure, or
        // simply stopping the server) was handed an administrator interface.
        // Client storage is a cache, never an authority.
        //
        // On a 401/403 the session is genuinely revoked: clear it. On any other
        // failure the session is simply UNVERIFIED, which is not the same as
        // revoked â€” but it is also not permission to proceed. Show the login
        // screen and keep the token, so a genuine transient outage does not
        // force the user to type their password again.
        if (err?.status === 401 || err?.status === 403) {
          console.warn('[Auth] Server revoked session:', err?.message);
          localStorage.removeItem('chaudhary_jwt_token');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('chaudhary_auth_user');
          disconnectSocket();
        } else {
          console.warn('[Auth] Could not verify the session with the server. Sign in again.');
        }
        window.dispatchEvent(new Event('chaudhary_auth_updated'));
        if (isMounted) setCurrentUser(null);
    navigate('/');
      } finally {
        if (isMounted) setIsCheckingAuth(false);
      }
    };

    restoreSession();

    // A token that appears in another tab (or is replaced) is re-verified
    // against the server rather than trusted from storage.
    const handleReverify = () => { restoreSession(); };
    window.addEventListener('chaudhary_reverify_session', handleReverify);

    return () => {
      isMounted = false;
      window.removeEventListener('chaudhary_reverify_session', handleReverify);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('chaudhary_jwt_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('chaudhary_auth_user');
    disconnectSocket();
    window.dispatchEvent(new Event('chaudhary_auth_updated'));
    setCurrentUser(null);
    navigate('/');
  };

  // Session verification loading splash
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <ChaudharyLogo size={56} className="animate-pulse" />
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 mt-2">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin" />
            <span>Verifying hospital session...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* 1. HMS Staff Login Page */}
      <Route
        path="/login"
        element={
          currentUser ? (
            <Navigate to="/portal" replace />
          ) : (
            <div className="min-h-screen">
              <OfflineStatusIndicator />
              <LoginPage
                onLogin={(user) => {
                  setCurrentUser(user);
                  navigate('/portal');
                }}
                onNavigateToSignUp={() => navigate('/signup')}
              />
            </div>
          )
        }
      />

      {/* 2. HMS Staff SignUp Page */}
      <Route
        path="/signup"
        element={
          currentUser ? (
            <Navigate to="/portal" replace />
          ) : (
            <div className="min-h-screen">
              <OfflineStatusIndicator />
              <SignUpPage
                onLogin={(user) => {
                  setCurrentUser(user);
                  navigate('/portal');
                }}
                onNavigateToLogin={() => navigate('/login')}
              />
            </div>
          )
        }
      />

      {/* 3. Protected Authenticated Hospital Portals */}
      <Route
        path="/portal/*"
        element={
          currentUser ? (
            <HospitalProvider>
              <OfflineStatusIndicator />
              <AuthenticatedApp currentUser={currentUser} onLogout={handleLogout} />
            </HospitalProvider>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 4. Public Hospital Website (Home, About, Doctors, Services, Gallery, Appointments, Contact) */}
      <Route path="/*" element={<PublicSiteApp />} />
    </Routes>
  );
}

export default App;

