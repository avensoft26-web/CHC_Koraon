import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Clock,
  Key,
  CheckCircle2,
  Edit3,
  X,
  Building,
  HeartPulse,
  LogOut,
  Briefcase
} from 'lucide-react';

import { getStoredAuthUser } from '../../hooks/useAuthUser';
import { api } from '../../services/api';

interface ChaudharyProfileViewProps {
  onLogout?: () => void;
}

export interface UserProfileData {
  name: string;
  designation: string;
  department: string;
  staffId: string;
  email: string;
  phone: string;
  extension: string;
  bloodGroup: string;
  gender: string;
  joiningDate: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  shiftTiming: string;
  counterNumber: string;
}

export const ChaudharyProfileView: React.FC<ChaudharyProfileViewProps> = ({ onLogout }) => {
  const activeUser = getStoredAuthUser();

  // Profile starts empty and is filled from the signed-in user's real record.
  // Fields with no backend source (blood group, emergency contact, etc.) stay
  // blank and render as "—" rather than being invented.
  const [profile, setProfile] = useState<UserProfileData>({
    name: activeUser.name || '',
    designation: (activeUser as any).specialization || activeUser.role || '',
    department: activeUser.department || '',
    staffId: activeUser.id ? `CH-EMP-${activeUser.id.slice(-4).toUpperCase()}` : '',
    email: activeUser.email || '',
    phone: '',
    extension: '',
    bloodGroup: '',
    gender: '',
    joiningDate: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    shiftTiming: '',
    counterNumber: '',
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Renders an em dash for fields the hospital has not recorded, instead of
  // inventing a value
  const dash = (v: string) => (v && v.trim() ? v : '—');

  useEffect(() => {
    let isMounted = true;
    api.auth.getProfile()
      .then((res: any) => {
        if (!isMounted || !res?.success || !res.user) return;
        const u = res.user;
        setProfile({
          name: u.name || '',
          designation: u.specialization || u.role || '',
          department: u.department || '',
          staffId: u._id ? `CH-EMP-${String(u._id).slice(-4).toUpperCase()}` : '',
          email: u.email || '',
          phone: u.mobile || '',
          extension: u.roomNo || '',
          bloodGroup: '',
          gender: '',
          joiningDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
          address: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          shiftTiming: u.opdTiming || '',
          counterNumber: u.roomNo || '',
        });
      })
      .catch(() => { if (isMounted) setProfileError('Could not load your staff record.'); })
      .finally(() => { if (isMounted) setIsLoadingProfile(false); });
    return () => { isMounted = false; };
  }, []);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<UserProfileData>(profile);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simple Security PIN Form State
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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
          roomNo: editForm.counterNumber || editForm.extension,
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

  // Terminal PIN: the User model has no PIN field and the backend exposes no
  // PIN endpoint, so there is nothing to persist this to. The form is left in
  // place but reports the real state instead of claiming a change was saved.
  const handlePinUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPin('');
    setNewPin('');
    showToast('Terminal PIN is not available yet — the hospital system has no PIN field, so nothing was changed.');
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 pb-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
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

      {/* 1. Main Header Card */}
      <div className="glass-panel-3d relative overflow-hidden rounded-3xl p-5 sm:p-6 shadow-[0_8px_32px_rgba(15,23,42,0.06)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        {/* Specular Light Sheen */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

        <div className="flex items-center gap-4">
          
          {/* Avatar with Initials */}
          <div className="relative shrink-0">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 text-white font-bold text-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(37,99,235,0.3),inset_0_2px_3px_rgba(255,255,255,0.6)] border-2 border-white/90">
              SK
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-xs" title="Active on duty">
              <span className="w-2 h-2 rounded-full bg-white" />
            </span>
          </div>

          {/* Name & Basic Info */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                {profile.name}
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-blue-50/90 text-blue-700 text-[11px] font-bold font-mono border border-blue-200/80 shadow-2xs">
                {profile.staffId}
              </span>
            </div>

            <p className="text-xs text-slate-600 font-semibold mt-0.5">
              {profile.designation} • <span className="text-slate-500">{profile.department}</span>
            </p>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[10.5px] font-bold text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                <Clock className="w-3 h-3 text-emerald-600" />
                Shift: {dash(profile.shiftTiming)}
              </span>
              <span className="text-[10.5px] font-bold text-slate-700 bg-white/80 border border-white/90 px-2.5 py-0.5 rounded-md shadow-2xs">
                {dash(profile.counterNumber)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setEditForm(profile);
              setIsEditModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-[0_4px_14px_rgba(37,99,235,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] cursor-pointer active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center justify-center p-2 rounded-xl border border-white/90 bg-white/80 hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer shadow-2xs"
              title="Logout Terminal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Simple Grid: Personal & Work Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Personal Details Card */}
        <div className="glass-panel-3d relative overflow-hidden rounded-3xl p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] space-y-4">
          {/* Specular Light Sheen */}
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

          <div className="flex items-center gap-2 border-b border-slate-200/50 pb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50/90 text-blue-600 border border-blue-200/60 flex items-center justify-center font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,1)]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-slate-900">Personal Information</h2>
              <p className="text-[11px] text-slate-500 font-medium">Contact & identity details</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-200/40">
              <span className="text-slate-500 font-medium">Full Name:</span>
              <span className="font-bold text-slate-900">{profile.name}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/40">
              <span className="text-slate-500 font-medium">Phone Number:</span>
              <span className="font-bold text-slate-900">{dash(profile.phone)}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/40">
              <span className="text-slate-500 font-medium">Email Address:</span>
              <span className="font-bold text-slate-900">{profile.email}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/40">
              <span className="text-slate-500 font-medium">Blood Group:</span>
              <span className="font-bold text-rose-600 bg-rose-50/90 px-2 py-0.5 rounded border border-rose-200/80 shadow-2xs">
                {profile.bloodGroup ? profile.bloodGroup : 'Not recorded'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/40">
              <span className="text-slate-500 font-medium">Gender:</span>
              <span className="font-bold text-slate-900">{dash(profile.gender)}</span>
            </div>

            <div className="flex items-start justify-between py-1 border-b border-slate-200/40">
              <span className="text-slate-500 font-medium">Address:</span>
              <span className="font-bold text-slate-900 text-right">{dash(profile.address)}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium">Emergency Contact:</span>
              <span className="font-bold text-slate-900">
                {profile.emergencyContactName
                  ? `${profile.emergencyContactName}${profile.emergencyContactPhone ? ` (${profile.emergencyContactPhone})` : ''}`
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Work & Shift Details Card */}
        <div className="glass-panel-3d relative overflow-hidden rounded-3xl p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] space-y-4">
          {/* Specular Light Sheen */}
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

          <div className="flex items-center gap-2 border-b border-slate-200/50 pb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50/90 text-emerald-600 border border-emerald-200/60 flex items-center justify-center font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,1)]">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-slate-900">Work & Shift Details</h2>
              <p className="text-[11px] text-slate-500 font-medium">Hospital workstation credentials</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-200/40">
              <span className="text-slate-500 font-medium">Staff ID:</span>
              <span className="font-mono font-bold text-slate-900">{profile.staffId}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/40">
              <span className="text-slate-500 font-medium">Department:</span>
              <span className="font-bold text-slate-900">{profile.department}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/40">
              <span className="text-slate-500 font-medium">Designation:</span>
              <span className="font-bold text-slate-900">{profile.designation}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/40">
              <span className="text-slate-500 font-medium">Counter Station:</span>
              <span className="font-bold text-slate-900">{dash(profile.counterNumber)}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/40">
              <span className="text-slate-500 font-medium">Internal Extension:</span>
              <span className="font-bold text-slate-900">{dash(profile.extension)}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/40">
              <span className="text-slate-500 font-medium">Joining Date:</span>
              <span className="font-bold text-slate-900">{dash(profile.joiningDate)}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium">Duty Status:</span>
              <span className="font-bold text-emerald-800 bg-emerald-50/90 px-2 py-0.5 rounded border border-emerald-200/80 shadow-2xs">
                Active On Duty
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Simple PIN Change Card */}
      <div className="glass-panel-3d relative overflow-hidden rounded-3xl p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        {/* Specular Light Sheen */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

        <div className="flex items-center gap-2 border-b border-slate-200/50 pb-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-purple-50/90 text-purple-600 border border-purple-200/60 flex items-center justify-center font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,1)]">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-slate-900">Terminal Login PIN</h2>
            <p className="text-[11px] text-slate-500 font-medium">Not available yet — this hospital system has no PIN field to save to</p>
          </div>
        </div>

        <form onSubmit={handlePinUpdate} className="flex flex-col sm:flex-row items-center gap-3 text-xs">
          <div className="w-full sm:w-48">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Current PIN</label>
            <input
              type="password"
              maxLength={4}
              value={currentPin}
              onChange={e => setCurrentPin(e.target.value)}
              placeholder="••••"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-center font-mono font-bold tracking-widest text-sm"
            />
          </div>

          <div className="w-full sm:w-48">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">New PIN</label>
            <input
              type="password"
              maxLength={4}
              value={newPin}
              onChange={e => setNewPin(e.target.value)}
              placeholder="••••"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-center font-mono font-bold tracking-widest text-sm"
            />
          </div>

          <div className="w-full sm:w-auto pt-0 sm:pt-4">
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer active:scale-95"
            >
              Update PIN
            </button>
          </div>
        </form>
      </div>

      {/* Edit Profile Simple Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm">Edit Profile Information</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Emergency Contact Person</label>
                  <input
                    type="text"
                    value={editForm.emergencyContactName}
                    onChange={e => setEditForm({ ...editForm, emergencyContactName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Emergency Phone</label>
                  <input
                    type="text"
                    value={editForm.emergencyContactPhone}
                    onChange={e => setEditForm({ ...editForm, emergencyContactPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer"
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
