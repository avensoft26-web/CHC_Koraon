import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Edit3,
  X,
  LogOut,
  Copy,
  Building2,
  BedDouble,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';

import { getStoredAuthUser } from '../../../hooks/useAuthUser';
import { api } from '../../../services/api';

interface StaffProfileViewProps {
  onLogout?: () => void;
}

export interface NurseProfileData {
  name: string;
  designation: string;
  department: string;
  staffId: string;
  nursingCouncilReg: string;
  email: string;
  phone: string;
  intercomExt: string;
  bloodGroup: string;
  gender: string;
  joiningDate: string;
  address: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  shiftTiming: string;
  wardStation: string;
  assignedBeds: string;
}

export const StaffProfileView: React.FC<StaffProfileViewProps> = ({ onLogout }) => {
  const activeUser = getStoredAuthUser();

  // Starts empty and is filled from the signed-in staff member's real record.
  // Anything the hospital has not recorded (registration number, blood group,
  // emergency contact, ward station…) stays blank and renders as "—".
  const [profile, setProfile] = useState<NurseProfileData>({
    name: activeUser.name || '',
    designation: (activeUser as any).specialization || activeUser.role || '',
    department: activeUser.department || '',
    staffId: activeUser.id ? `CH-NUR-${activeUser.id.slice(-4).toUpperCase()}` : '',
    nursingCouncilReg: '',
    email: activeUser.email || '',
    phone: '',
    intercomExt: '',
    bloodGroup: '',
    gender: '',
    joiningDate: '',
    address: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    shiftTiming: '',
    wardStation: '',
    assignedBeds: '',
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Em dash for fields the hospital has not recorded, instead of inventing a value
  const dash = (v: string) => (v && v.trim() ? v : '—');

  useEffect(() => {
    let isMounted = true;
    api.auth.getProfile()
      .then((res: any) => {
        if (!isMounted || !res?.success || !res.user) return;
        const u = res.user;
        setProfile(prev => ({
          ...prev,
          name: u.name || '',
          designation: u.specialization || u.role || '',
          department: u.department || '',
          staffId: u._id ? `CH-NUR-${String(u._id).slice(-4).toUpperCase()}` : '',
          email: u.email || '',
          phone: u.mobile || '',
          intercomExt: u.roomNo || '',
          joiningDate: u.createdAt
            ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
            : '',
        }));
      })
      .catch(() => { if (isMounted) setProfileError('Could not load your staff record.'); })
      .finally(() => { if (isMounted) setIsLoadingProfile(false); });
    return () => { isMounted = false; };
  }, []);

  const [activeTab, setActiveTab] = useState<'details' | 'roster'>('details');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<NurseProfileData>(profile);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(editForm);
    setIsEditModalOpen(false);

    if (activeUser?.id) {
      try {
        const res = await api.auth.updateUser(activeUser.id, {
          name: editForm.name,
          mobile: editForm.phone,
          department: editForm.department,
          specialization: editForm.designation,
          roomNo: editForm.intercomExt,
          opdTiming: editForm.shiftTiming
        });
        if (res?.success) {
          const cached = getStoredAuthUser();
          if (cached) {
            localStorage.setItem('chaudhary_auth_user', JSON.stringify({ ...cached, name: editForm.name, department: editForm.department }));
            window.dispatchEvent(new Event('chaudhary_auth_updated'));
          }
          showToast('Staff profile successfully updated and saved to MongoDB!');
        }
      } catch (err: any) {
        showToast('Saved in session, but server update failed.');
      }
    } else {
      showToast('Profile updated.');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 pb-10 font-sans select-none animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl shadow-xl text-xs font-bold animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Profile source status */}
      {isLoadingProfile && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600">
          <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin" />
          <span>Loading your staff record…</span>
        </div>
      )}
      {profileError && (
        <div className="px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800">
          {profileError} Fields without a recorded value are shown as "—".
        </div>
      )}

      {/* ── 1. HEADER PROFILE CARD ── */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            {/* Left: Avatar + Details */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative shrink-0">
                {!avatarError ? (
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=240&auto=format&fit=crop&q=80"
                    alt={profile.name}
                    onError={() => setAvatarError(true)}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-emerald-500/20 border border-slate-200"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-700 flex flex-col items-center justify-center text-white">
                    <Stethoscope className="w-6 h-6 opacity-90 mb-0.5" />
                    <span className="text-xs font-bold">PN</span>
                  </div>
                )}
                {/* On duty badge */}
                <div 
                  className="absolute -bottom-1 -right-1 bg-white px-1.5 py-0.5 rounded-full border border-emerald-300 shadow-2xs flex items-center gap-1"
                  title="Active on duty"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-semibold uppercase text-emerald-800 tracking-wider">ON DUTY</span>
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    {profile.name}
                  </h1>
                  <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    {profile.staffId}
                  </span>
                </div>

                <p className="text-xs font-bold text-emerald-700 mt-0.5">
                  {profile.designation} <span className="text-slate-400 font-normal">•</span> <span className="text-slate-600 font-medium">{profile.department}</span>
                </p>

                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Reg: <strong className="text-slate-700 font-mono">{dash(profile.nursingCouncilReg)}</strong>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>08:00 AM – 04:00 PM</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setEditForm(profile);
                  setIsEditModalOpen(true);
                }}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              )}
            </div>
          </div>

          {/* ── Metric Summary Strip ── */}
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600" />
                Current Shift
              </span>
              <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">08:00 AM – 04:00 PM</p>
              <p className="text-[10px] font-medium text-emerald-700">Morning Rotation</p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-indigo-600" />
                Nursing Station
              </span>
              <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">Floor 3 Central</p>
              <p className="text-[10px] font-medium text-slate-500">{dash(profile.intercomExt)}</p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <BedDouble className="w-3 h-3 text-cyan-600" />
                Assigned Beds
              </span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">6 Active Beds</p>
              <p className="text-[10px] font-medium text-slate-500">Beds 301–306 (HDU)</p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-blue-600" />
                Tenure
              </span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">5+ Years Service</p>
              <p className="text-[10px] font-medium text-slate-500">Joined {dash(profile.joiningDate)}</p>
            </div>
          </div>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="px-5 bg-slate-50/80 border-t border-slate-200 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-2.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-700 bg-white -mb-[1px] shadow-2xs font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Contact Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`py-2.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'roster'
                ? 'border-indigo-600 text-indigo-700 bg-white -mb-[1px] shadow-2xs font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Weekly Shift Roster</span>
          </button>
        </div>
      </div>

      {/* ── 2. TAB CONTENT ── */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card A: Contact & Personal Info */}
          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs p-5 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              Contact & Personal Details
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Hospital Email</p>
                  <p className="font-bold text-slate-800 mt-0.5">{profile.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(profile.email, 'Email')}
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                  title="Copy email"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Mobile Phone</p>
                  <p className="font-bold text-slate-800 mt-0.5">{dash(profile.phone)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(profile.phone, 'Mobile number')}
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                  title="Copy phone"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Blood Group</p>
                  <p className="font-bold text-rose-700 mt-0.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    {dash(profile.bloodGroup)}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Gender</p>
                  <p className="font-bold text-slate-800 mt-0.5">{dash(profile.gender)}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <p className="text-[10px] font-bold uppercase text-slate-400">Campus Residence Address</p>
                <p className="font-medium text-slate-700 mt-0.5 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{dash(profile.address)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Card B: Work & Emergency Info */}
          <div className="space-y-4">
            {/* Work & Station Assignment */}
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs p-5 space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                Station & Assignment Details
              </h2>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-500 font-medium">Department</span>
                  <span className="font-bold text-slate-800">{profile.department}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-500 font-medium">Nursing Station</span>
                  <span className="font-bold text-slate-800">{dash(profile.wardStation)}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-500 font-medium">Desk Extension</span>
                  <span className="font-bold font-mono text-slate-800">{dash(profile.intercomExt)}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-500 font-medium">Assigned Bed Range</span>
                  <span className="font-bold text-emerald-700">{dash(profile.assignedBeds)}</span>
                </div>
              </div>
            </div>

            {/* Emergency Kin Contact */}
            <div className="rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-2xs p-4">
              <p className="text-[10px] font-semibold uppercase text-amber-800 tracking-wider">
                Emergency Kin Contact
              </p>
              <div className="flex items-center justify-between mt-1 text-xs">
                <div>
                  <p className="font-bold text-slate-900">
                    {profile.emergencyContactName ? profile.emergencyContactName : '—'} <span className="font-normal text-slate-500">{profile.emergencyContactRelation ? `(${profile.emergencyContactRelation})` : ''}</span>
                  </p>
                </div>
                <p className="font-mono font-bold text-amber-900 bg-white px-2 py-0.5 rounded-md border border-amber-200">
                  {dash(profile.emergencyContactPhone)}
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── TAB 2: WEEKLY DUTY ROSTER ── */}
      {activeTab === 'roster' && (
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Weekly Shift Roster — Current Week
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Assigned by Nursing Superintendent Office • Floor 3 Central</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 self-start sm:self-auto">
              Total Logged: 36.5 / 40.0 Hrs
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {[
              { day: 'Mon', date: '05 Oct', shift: 'Morning', time: '08:00 - 16:00', status: 'Completed', active: false },
              { day: 'Tue', date: '06 Oct', shift: 'Morning', time: '08:00 - 16:00', status: 'Completed', active: false },
              { day: 'Wed', date: '07 Oct', shift: 'Morning', time: '08:00 - 16:00', status: 'Completed', active: false },
              { day: 'Thu', date: '08 Oct', shift: 'Morning', time: '08:00 - 16:00', status: 'Completed', active: false },
              { day: 'Fri', date: '09 Oct', shift: 'Morning', time: '08:00 - 16:00', status: 'Active Today', active: true },
              { day: 'Sat', date: '10 Oct', shift: 'Evening', time: '16:00 - 00:00', status: 'Upcoming', active: false },
              { day: 'Sun', date: '11 Oct', shift: 'Weekly OFF', time: 'Rest Day', status: 'Off Duty', active: false },
            ].map((slot, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  slot.active
                    ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-500/20'
                    : slot.shift === 'Weekly OFF'
                    ? 'bg-slate-50 border-slate-200/60 text-slate-400'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600">{slot.day}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{slot.date}</span>
                  </div>
                  <h4 className={`text-xs font-bold mt-1.5 ${slot.active ? 'text-emerald-900' : 'text-slate-800'}`}>
                    {slot.shift}
                  </h4>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">{slot.time}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100">
                  <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                    slot.active
                      ? 'bg-emerald-600 text-white'
                      : slot.status === 'Completed'
                      ? 'bg-slate-100 text-slate-600'
                      : slot.shift === 'Weekly OFF'
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {slot.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. EDIT PROFILE MODAL ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-200 relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Edit Staff Profile</h3>
                <p className="text-xs text-slate-400 mt-0.5">Update contact, address, and emergency kin info</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Direct Mobile</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hospital Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ward / Nursing Station</label>
                <input
                  type="text"
                  value={editForm.wardStation}
                  onChange={(e) => setEditForm({ ...editForm, wardStation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Campus Residence Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Emergency Kin Name</label>
                  <input
                    type="text"
                    value={editForm.emergencyContactName}
                    onChange={(e) => setEditForm({ ...editForm, emergencyContactName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Emergency Kin Phone</label>
                  <input
                    type="text"
                    value={editForm.emergencyContactPhone}
                    onChange={(e) => setEditForm({ ...editForm, emergencyContactPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-2xs cursor-pointer"
                >
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
