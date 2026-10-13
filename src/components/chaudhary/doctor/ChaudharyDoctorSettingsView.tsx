import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Building2, 
  LogOut, 
  UserCheck, 
  Stethoscope, 
  FileText, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Check, 
  EyeOff, 
  Sparkles,
  Building,
  Phone,
  Mail
} from 'lucide-react';
import { useDoctorDashboardVisibility } from '../../../utils/doctorDashboardVisibility';
import { getStoredAuthUser } from '../../../hooks/useAuthUser';
import { api } from '../../../services/api';

export const ChaudharyDoctorSettingsView: React.FC = () => {
  const activeUser = getStoredAuthUser();
  // Clean, focused 3 tabs: 'visibility' | 'profile' | 'prescription'
  const [activeTab, setActiveTab] = useState<'visibility' | 'profile' | 'prescription'>('visibility');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Real-time Doctor Dashboard Visibility Hook
  const { showAdmitted, showDischarged, setToggles } = useDoctorDashboardVisibility();

  // 1. Doctor Profile & OPD Chamber State
  //    Filled from the signed-in doctor's real staff record. Fields the hospital
  //    does not store (registration number, follow-up fee) stay blank instead of
  //    being invented.
  const [profile, setProfile] = useState({
    name: activeUser.name || '',
    qualification: '',
    registrationNumber: '',
    department: activeUser.department || '',
    opdRoom: '',
    consultationFee: '',
    followUpFee: '',
    contactNumber: '',
    email: activeUser.email || '',
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

  // 2. Prescription & Print Defaults State
  const [rxDefaults, setRxDefaults] = useState({
    clinicName: 'Chaudhary Care Super Speciality Hospital',
    defaultAdviceNote: 'Take all prescribed medicines after meals with water. Continue regular morning walk & salt-restricted diet.',
    printDoctorRegNumber: true,
    autoAttachVitals: true,
    emergencyDisclaimer: 'Consult emergency immediately in case of acute chest discomfort or breathing distress.'
  });

  // Load the doctor's real staff record from MongoDB, restoring profile and preferences
  useEffect(() => {
    let isMounted = true;

    let stored: { profile?: Record<string, string>; rxDefaults?: Record<string, string> } = {};
    try {
      const savedDoc = localStorage.getItem('chaudhary_doctor_settings');
      if (savedDoc) stored = JSON.parse(savedDoc) || {};
    } catch {
      // Ignore parsing errors
    }

    if (stored.rxDefaults) setRxDefaults(prev => ({ ...prev, ...stored.rxDefaults }));

    (async () => {
      try {
        const res: any = await api.auth.getProfile();
        if (isMounted && res?.success && res.user) {
          const u = res.user;
          setProfile(prev => ({
            ...prev,
            name: u.name || '',
            qualification: u.qualification || '',
            department: u.department || '',
            opdRoom: u.roomNo || '',
            consultationFee:
              u.fee !== undefined && u.fee !== null && u.fee !== '' ? String(u.fee) : '',
            contactNumber: u.mobile || '',
            email: u.email || '',
          }));

          // Restore preferences from authoritative database
          if (u.preferences?.rxDefaults) {
            setRxDefaults(prev => ({ ...prev, ...u.preferences.rxDefaults }));
          }
          if (u.preferences?.doctorDashboardVisibility) {
            setToggles(u.preferences.doctorDashboardVisibility);
          }
        }
      } catch {
        // Profile stays blank rather than being invented
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    })();

    return () => { isMounted = false; };
  }, []);

  // Locally saved edits apply once the real record has loaded
  useEffect(() => {
    if (isLoadingProfile) return;
    try {
      const savedDoc = localStorage.getItem('chaudhary_doctor_settings');
      const parsed = savedDoc ? JSON.parse(savedDoc) : null;
      if (parsed?.profile) setProfile(prev => ({ ...prev, ...parsed.profile }));
    } catch {
      // Ignore parsing errors
    }
  }, [isLoadingProfile]);

  // Quick Toggles for Admit & Discharge
  const handleToggleAdmit = () => {
    const nextVal = !showAdmitted;
    setToggles({ showAdmitted: nextVal });
    setToastMessage(nextVal ? 'Admit module is now VISIBLE on Dashboard' : 'Admit module is now HIDDEN from Dashboard');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleToggleDischarge = () => {
    const nextVal = !showDischarged;
    setToggles({ showDischarged: nextVal });
    setToastMessage(nextVal ? 'Discharge module is now VISIBLE on Dashboard' : 'Discharge module is now HIDDEN from Dashboard');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSave = async () => {
    const payload = {
      profile,
      rxDefaults,
      dashboardToggles: { showAdmitted, showDischarged },
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem('chaudhary_doctor_settings', JSON.stringify(payload));
    } catch {
      // Fallback
    }

    // Persist authoritative doctor settings & Rx defaults to MongoDB
    if (activeUser?.id) {
      try {
        const updatePayload: Record<string, any> = {
          name: profile.name,
          qualification: profile.qualification,
          department: profile.department,
          roomNo: profile.opdRoom,
          mobile: profile.contactNumber,
          preferences: {
            rxDefaults,
            doctorDashboardVisibility: { showAdmitted, showDischarged },
          }
        };
        if (profile.consultationFee && !isNaN(Number(profile.consultationFee))) {
          updatePayload.fee = Number(profile.consultationFee);
        }
        await api.auth.updateUser(activeUser.id, updatePayload);
        setToastMessage('Doctor Settings successfully saved and synchronized to database!');
      } catch (err: any) {
        console.warn('Backend doctor settings update error:', err);
        setToastMessage('Doctor Settings saved locally, but database sync encountered an error.');
      }
    } else {
      setToastMessage('Doctor Settings saved successfully!');
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = async () => {
    if (window.confirm('Reset all doctor settings back to original defaults?')) {
      localStorage.removeItem('chaudhary_doctor_settings');
      setToggles({ showAdmitted: true, showDischarged: true });
      if (activeUser?.id) {
        try {
          await api.auth.updateUser(activeUser.id, {
            preferences: {
              doctorDashboardVisibility: { showAdmitted: true, showDischarged: true }
            }
          });
        } catch {
          // ignore
        }
      }
      setToastMessage('Doctor settings successfully reset to defaults.');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-8 animate-fadeIn select-none max-w-7xl mx-auto w-full">
      {/* Toast Notification */}
      {saveSuccess && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-600/30 border border-emerald-400 animate-slideIn">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
          <span className="text-xs sm:text-sm font-extrabold">{toastMessage}</span>
        </div>
      )}

      {/* 1. Clean, Modern Header */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 shrink-0">
            <Sliders className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Doctor Settings
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10.5px] font-semibold">
                {profile.name || activeUser.name || 'Doctor Settings'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Manage dashboard visibility, OPD consultation chamber details, and prescription defaults.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Reset Defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-600/25 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4 stroke-[2.3]" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* 2. Structured 3 Tabs Navigation */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-1.5">
        <button
          onClick={() => setActiveTab('visibility')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer whitespace-nowrap flex-1 sm:flex-initial justify-center sm:justify-start ${
            activeTab === 'visibility'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Dashboard Visibility</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ml-1 ${
            activeTab === 'visibility' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>
            Admit &amp; Discharge
          </span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer whitespace-nowrap flex-1 sm:flex-initial justify-center sm:justify-start ${
            activeTab === 'profile'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Doctor Profile &amp; OPD</span>
        </button>

        <button
          onClick={() => setActiveTab('prescription')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer whitespace-nowrap flex-1 sm:flex-initial justify-center sm:justify-start ${
            activeTab === 'prescription'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Prescription (Rx) Defaults</span>
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* =========================================================================
          TAB 1: DASHBOARD VISIBILITY CONTROLS (Admit & Discharge Toggles)
      ========================================================================= */}
      {activeTab === 'visibility' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-wide uppercase font-space flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Dashboard Module Visibility Controls</span>
              </h2>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Toggle modules OFF to hide them from the main doctor dashboard in real time.
              </p>
            </div>
            <span className="self-start sm:self-auto text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Instant Update
            </span>
          </div>

          {/* Clean 2-Card Layout for the 2 Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Admit Patients Module Toggle */}
            <div className={`p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between gap-4 ${
              showAdmitted 
                ? 'bg-emerald-50/40 border-emerald-300 shadow-2xs' 
                : 'bg-slate-50/70 border-slate-200'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0 transition-colors ${
                    showAdmitted ? 'bg-emerald-600' : 'bg-slate-400'
                  }`}>
                    <Building2 className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Admit Patients Module
                      </h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        showAdmitted 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                          : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}>
                        {showAdmitted ? 'VISIBLE' : 'HIDDEN'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      Card: <span className="font-semibold text-slate-700">ADMITTED (In Ward)</span>
                    </p>
                  </div>
                </div>

                {/* Clean iOS Switch Button */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={showAdmitted}
                  onClick={handleToggleAdmit}
                  className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    showAdmitted ? 'bg-emerald-600' : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                      showAdmitted ? 'translate-x-6 text-emerald-600' : 'translate-x-0 text-slate-400'
                    }`}
                  >
                    {showAdmitted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <EyeOff className="w-3 h-3 stroke-[2]" />}
                  </span>
                </button>
              </div>

              {/* Bullet description */}
              <div className="text-[11.5px] text-slate-600 space-y-1.5 pt-2 border-t border-slate-200/70">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${showAdmitted ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  <span><strong>Top KPI Card:</strong> "ADMITTED (In Ward: 13)" metric card</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${showAdmitted ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  <span><strong>Clinical Summary:</strong> Active Patients (Admitted) status line</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${showAdmitted ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  <span><strong>Quick Action:</strong> "Admit" button</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-semibold text-slate-500">Status:</span>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg ${
                  showAdmitted 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {showAdmitted ? 'Active on Dashboard' : 'Hidden from Dashboard'}
                </span>
              </div>
            </div>

            {/* 2. Discharge Patients Module Toggle */}
            <div className={`p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between gap-4 ${
              showDischarged 
                ? 'bg-amber-50/40 border-amber-300 shadow-2xs' 
                : 'bg-slate-50/70 border-slate-200'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0 transition-colors ${
                    showDischarged ? 'bg-amber-500' : 'bg-slate-400'
                  }`}>
                    <LogOut className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Discharge Patients Module
                      </h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        showDischarged 
                          ? 'bg-amber-100 text-amber-800 border-amber-200' 
                          : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}>
                        {showDischarged ? 'VISIBLE' : 'HIDDEN'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      Card: <span className="font-semibold text-slate-700">DISCHARGED (Today)</span>
                    </p>
                  </div>
                </div>

                {/* Clean iOS Switch Button */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={showDischarged}
                  onClick={handleToggleDischarge}
                  className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    showDischarged ? 'bg-amber-500' : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                      showDischarged ? 'translate-x-6 text-amber-600' : 'translate-x-0 text-slate-400'
                    }`}
                  >
                    {showDischarged ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <EyeOff className="w-3 h-3 stroke-[2]" />}
                  </span>
                </button>
              </div>

              {/* Bullet description */}
              <div className="text-[11.5px] text-slate-600 space-y-1.5 pt-2 border-t border-slate-200/70">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${showDischarged ? 'bg-amber-500' : 'bg-slate-400'}`} />
                  <span><strong>Top KPI Card:</strong> "DISCHARGED (Today: 3)" metric card</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${showDischarged ? 'bg-amber-500' : 'bg-slate-400'}`} />
                  <span><strong>Clinical Summary:</strong> Discharged Today (Done: 3) counter row</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${showDischarged ? 'bg-amber-500' : 'bg-slate-400'}`} />
                  <span><strong>Bed Occupancy:</strong> "Discharge" action button</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-semibold text-slate-500">Status:</span>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg ${
                  showDischarged 
                    ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {showDischarged ? 'Active on Dashboard' : 'Hidden from Dashboard'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Notice Tip */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 text-xs text-slate-600 font-medium">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Toggling either switch immediately updates your dashboard without reloading. When turned OFF, the remaining dashboard cards automatically resize to maintain a balanced layout.
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: DOCTOR PROFILE & OPD CONSULTATION
      ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col gap-5">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-wide uppercase font-space flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Doctor Practice Details &amp; OPD Chamber</span>
            </h2>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Update doctor credentials, OPD chamber room, and consultation fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left: Credentials */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                <span>Doctor Credentials</span>
              </h3>

              <div>
                <label className="text-[11px] font-semibold uppercase text-slate-600 tracking-wider">Doctor Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="mt-1 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-slate-600 tracking-wider">Degrees &amp; Qualifications</label>
                <input
                  type="text"
                  value={profile.qualification}
                  onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                  className="mt-1 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-600 tracking-wider">Medical Reg. Number</label>
                  <input
                    type="text"
                    value={profile.registrationNumber}
                    onChange={(e) => setProfile({ ...profile, registrationNumber: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-600 tracking-wider">Department</label>
                  <input
                    type="text"
                    value={profile.department}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Right: OPD Chamber & Fees */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-emerald-600" />
                <span>OPD Chamber &amp; Consultation Fees</span>
              </h3>

              <div>
                <label className="text-[11px] font-semibold uppercase text-slate-600 tracking-wider">OPD Chamber Room No.</label>
                <input
                  type="text"
                  value={profile.opdRoom}
                  onChange={(e) => setProfile({ ...profile, opdRoom: e.target.value })}
                  className="mt-1 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-600 tracking-wider">Standard OPD Fee (₹)</label>
                  <input
                    type="number"
                    value={profile.consultationFee}
                    onChange={(e) => setProfile({ ...profile, consultationFee: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-600 tracking-wider">Follow-up Review Fee (₹)</label>
                  <input
                    type="number"
                    value={profile.followUpFee}
                    onChange={(e) => setProfile({ ...profile, followUpFee: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-600 tracking-wider">Contact Phone</label>
                  <input
                    type="text"
                    value={profile.contactNumber}
                    onChange={(e) => setProfile({ ...profile, contactNumber: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-600 tracking-wider">Official Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: PRESCRIPTION (Rx) DEFAULTS
      ========================================================================= */}
      {activeTab === 'prescription' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col gap-5">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-wide uppercase font-space flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Prescription (Rx) &amp; Print Defaults</span>
            </h2>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Default instructions and options printed on patient prescription slips.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold uppercase text-slate-600 tracking-wider">Hospital / Clinic Letterhead Name</label>
              <input
                type="text"
                value={rxDefaults.clinicName}
                onChange={(e) => setRxDefaults({ ...rxDefaults, clinicName: e.target.value })}
                className="mt-1 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-slate-600 tracking-wider">Default Patient Advice Note</label>
              <textarea
                rows={3}
                value={rxDefaults.defaultAdviceNote}
                onChange={(e) => setRxDefaults({ ...rxDefaults, defaultAdviceNote: e.target.value })}
                className="mt-1 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-slate-600 tracking-wider">Emergency Disclaimer (Rx Footer)</label>
              <input
                type="text"
                value={rxDefaults.emergencyDisclaimer}
                onChange={(e) => setRxDefaults({ ...rxDefaults, emergencyDisclaimer: e.target.value })}
                className="mt-1 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
              />
            </div>

            {/* Print Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={rxDefaults.printDoctorRegNumber}
                  onChange={(e) => setRxDefaults({ ...rxDefaults, printDoctorRegNumber: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Print Medical Reg. Number</span>
                  <span className="text-[10.5px] text-slate-500 block">Include registration number on every Rx header</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={rxDefaults.autoAttachVitals}
                  onChange={(e) => setRxDefaults({ ...rxDefaults, autoAttachVitals: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Auto-Attach Recorded Vitals</span>
                  <span className="text-[10.5px] text-slate-500 block">Include BP, Pulse, SpO2 directly in printed Rx slip</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
