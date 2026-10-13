import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { 
  UserCog, 
  Stethoscope, 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  Phone, 
  Clock, 
  ShieldCheck, 
  X,
  Building2,
  CheckCircle2,
  LayoutGrid,
  List,
  Filter,
  Eye,
  Activity,
  Laptop,
  Edit3
} from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { checkBillingAccess, setBillingAccess } from '../../../utils/billingAccess';

// Exactly 5 Hospital Roles as required by user
export type HospitalRole = 'doctor' | 'staff' | 'reception' | 'admin' | 'developer';
export type FilterRole = 'all' | HospitalRole;

export interface HospitalUser {
  id: string;
  empId: string;
  name: string;
  role: HospitalRole;
  designation: string;
  department: string;
  shift: string;
  status: 'Available' | 'On Duty' | 'In Surgery' | 'On Break' | 'Off Duty' | 'On Leave';
  accountStatus?: 'active' | 'pending' | 'rejected';
  contact: string;
  email: string;
  billingAccess: boolean;
  avatarUrl?: string;
  roomNo?: string;
  opdFee?: number;
  qualification?: string;
  joiningDate?: string;
}

// Reusable Safe User Avatar with fallback to clean initials
const UserAvatar: React.FC<{ user: HospitalUser; size?: 'sm' | 'md' | 'lg' }> = ({ user, size = 'md' }) => {
  const [imgError, setImgError] = useState(false);
  
  const initials = user.name
    .replace(/^Dr\.\s*/i, '')
    .replace(/^Sister\s*/i, '')
    .replace(/^Nurse\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || 'U';

  const sizeClasses = {
    sm: 'w-8 h-8 text-[11px]',
    md: 'w-11 h-11 text-xs',
    lg: 'w-14 h-14 text-sm'
  }[size];

  const roleGradients: Record<HospitalRole, string> = {
    doctor: 'from-blue-600 to-indigo-700 text-white',
    staff: 'from-rose-500 to-pink-600 text-white',
    reception: 'from-teal-600 to-emerald-700 text-white',
    admin: 'from-slate-700 to-slate-900 text-white',
    developer: 'from-violet-600 to-purple-800 text-white'
  };

  const gradient = roleGradients[user.role] || 'from-emerald-600 to-teal-700 text-white';

  if (!user.avatarUrl || imgError) {
    return (
      <div className={`${sizeClasses} rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center font-bold tracking-tight shadow-2xs border border-white/20 select-none flex-shrink-0`}>
        {initials}
      </div>
    );
  }

  return (
    <img
      src={user.avatarUrl}
      alt={user.name}
      onError={() => setImgError(true)}
      className={`${sizeClasses} rounded-2xl object-cover border border-slate-200 shadow-2xs flex-shrink-0`}
    />
  );
};

// Helper: MongoDB user -> HospitalUser interface
function mapDbUserToHospitalUser(u: any): HospitalUser {
  const role: HospitalRole = (['doctor', 'staff', 'reception', 'admin', 'developer'].includes(u.role)
    ? u.role : 'staff') as HospitalRole;
  return {
    id: u._id || u.id || '',
    empId: u.empId || u.username || u._id?.slice(-6)?.toUpperCase() || 'EMP-000',
    name: u.name || 'Unknown',
    role,
    designation: u.designation || u.role?.charAt(0).toUpperCase() + u.role?.slice(1) || 'Staff',
    department: u.department || 'General',
    shift: u.shift || 'General (09:00 - 17:00)',
    status: (u.available !== undefined 
      ? (u.available ? 'Available' : 'Off Duty')
      : (['Available', 'On Duty', 'In Surgery', 'On Break', 'Off Duty', 'On Leave'].includes(u.status)
        ? u.status : (u.status === 'active' ? 'Available' : 'Off Duty'))) as HospitalUser['status'],
    accountStatus: (u.status === 'pending' || u.status === 'rejected') ? u.status : 'active',
    contact: u.mobile || u.contact || 'N/A',
    email: u.email || '',
    billingAccess: Boolean(u.billingAccess),
    avatarUrl: u.avatar || undefined,
    roomNo: u.roomNo,
    opdFee: u.opdFee,
    qualification: u.qualification,
    joiningDate: u.joiningDate || (u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A')
  };
}

// Module-level memory cache so switching tabs never shows a blank loading spinner
let cachedUsersMemory: HospitalUser[] = [];

export const ChaudharyAdminUsersView: React.FC = () => {
  // Active Filter: 'all' or one of the 5 roles
  const [activeRole, setActiveRole] = useState<FilterRole>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [usersList, setUsersList] = useState<HospitalUser[]>(() => cachedUsersMemory);
  const [isLoading, setIsLoading] = useState(() => cachedUsersMemory.length === 0);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Sync usersList changes with module memory cache
  useEffect(() => {
    if (usersList.length > 0) {
      cachedUsersMemory = usersList;
    }
  }, [usersList]);

  // Fetch real users from MongoDB on mount (swr background revalidation)
  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        if (cachedUsersMemory.length === 0) {
          setIsLoading(true);
        }
        setLoadError(null);
        const response = await api.auth.getUsers();
        if (response.success && Array.isArray(response.users)) {
          const mapped = response.users.map(mapDbUserToHospitalUser);
          cachedUsersMemory = mapped;
          if (isMounted) {
            setUsersList(mapped);
          }
        }
      } catch (err: any) {
        console.error('[AdminUsers] Failed to load users:', err.message);
        if (isMounted && cachedUsersMemory.length === 0) {
          setLoadError('Database se users load nahi ho sake. Backend check karein.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchUsers();
    return () => { isMounted = false; };
  }, []);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<HospitalUser | null>(null);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<HospitalUser | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New User Form State
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<HospitalRole>('doctor');
  const [formDesignation, setFormDesignation] = useState('');
  const [formDept, setFormDept] = useState('Cardiology & Cath Lab');
  const [formShift, setFormShift] = useState('Morning (08:00 - 16:00)');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  // No default room number — the admin types the real one, or leaves it empty
  const [formRoomNo, setFormRoomNo] = useState('');
  const [formOpdFee, setFormOpdFee] = useState<number>(800);
  const [formQualification, setFormQualification] = useState('');
  const [formBillingAccess, setFormBillingAccess] = useState<boolean>(false);

  // Counts for each of the 5 roles
  const getRoleCount = (role: FilterRole) => {
    if (role === 'all') return usersList.length;
    return usersList.filter(u => u.role === role).length;
  };

  const pendingUsersCount = usersList.filter(u => u.accountStatus === 'pending').length;

  const handleApproveUser = async (id: string, name: string) => {
    try {
      await api.auth.updateUser(id, { status: 'active' });
      setUsersList(prev => prev.map(u => u.id === id ? { ...u, accountStatus: 'active', status: 'Available' } : u));
      showToast(`✅ ${name} has been approved! Their account is now active.`);
    } catch (err: any) {
      showToast(`Approval failed: ${err.message || 'Error occurred'}`);
    }
  };

  // Filtered Users
  const filteredUsers = usersList.filter(u => {
    const matchesRole = activeRole === 'all' || u.role === activeRole;
    const matchesStatus = statusFilter === 'all' 
      ? true 
      : statusFilter === 'pending'
      ? u.accountStatus === 'pending'
      : u.status.toLowerCase() === statusFilter.toLowerCase();
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || (
      u.name.toLowerCase().includes(q) ||
      u.empId.toLowerCase().includes(q) ||
      u.designation.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q) ||
      u.contact.includes(q) ||
      u.role.toLowerCase().includes(q)
    );

    return matchesRole && matchesStatus && matchesSearch;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Real-time Billing Access Toggle — saves to MongoDB
  const handleToggleBillingAccess = async (id: string) => {
    const user = usersList.find(u => u.id === id);
    if (!user) return;
    const nextAccess = !user.billingAccess;
    // Optimistic UI update
    setUsersList(prev => prev.map(u => u.id === id ? { ...u, billingAccess: nextAccess } : u));
    setBillingAccess(id, nextAccess);
    showToast(`${user.name}: Billing access ${nextAccess ? 'granted (ON)' : 'revoked (OFF)'}.`);
    try {
      await api.auth.toggleBillingAccess(id, nextAccess);
    } catch (err: any) {
      // Revert on failure
      setUsersList(prev => prev.map(u => u.id === id ? { ...u, billingAccess: !nextAccess } : u));
      setBillingAccess(id, !nextAccess);
      showToast('Billing access update failed. Try again.');
    }
  };

  const handleToggleStatus = async (id: string) => {
    const user = usersList.find(u => u.id === id);
    if (!user) return;
    const isCurrentlyOn = user.status === 'On Duty' || user.status === 'Available';
    const nextStatus = isCurrentlyOn ? 'Off Duty' : 'Available';
    const nextAvailable = !isCurrentlyOn;

    // Optimistic update
    setUsersList(prev => prev.map(u => u.id === id ? { ...u, status: nextStatus } : u));
    showToast(`User duty status updated to ${nextStatus}!`);

    try {
      await api.auth.updateUser(id, { available: nextAvailable });
    } catch (err: any) {
      // Revert on failure
      setUsersList(prev => prev.map(u => u.id === id ? { ...u, status: user.status } : u));
      showToast('Failed to update duty status on server.');
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the system?`)) {
      // Optimistic remove
      setUsersList(prev => prev.filter(u => u.id !== id));
      if (selectedUserForDetail?.id === id) setSelectedUserForDetail(null);
      if (editingUser?.id === id) { setEditingUser(null); setIsEditUserOpen(false); }
      showToast(`${name} removed.`);
      try {
        await api.auth.deleteUser(id);
      } catch (err: any) {
        showToast(`Failed to delete ${name}. Refreshing list...`);
        // Re-fetch to restore correct state
        const response = await api.auth.getUsers();
        if (response.success) setUsersList(response.users.map(mapDbUserToHospitalUser));
      }
    }
  };

  // Edit Modal handler
  const handleOpenEditModal = (user: HospitalUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormRole(user.role);
    setFormDesignation(user.designation);
    setFormDept(user.department);
    setFormShift(user.shift);
    setFormPhone(user.contact);
    setFormEmail(user.email);
    setFormRoomNo(user.roomNo || '');
    setFormOpdFee(user.opdFee || 800);
    setFormQualification(user.qualification || '');
    setFormBillingAccess(Boolean(user.billingAccess));
    setIsEditUserOpen(true);
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    // Optimistic update
    setUsersList(prev => prev.map(u => {
      if (u.id === editingUser.id) {
        return {
          ...u,
          name: formName.trim(),
          role: formRole,
          designation: formDesignation.trim(),
          department: formDept.trim(),
          shift: formShift,
          contact: formPhone.trim(),
          email: formEmail.trim(),
          roomNo: formRole === 'doctor' ? formRoomNo : undefined,
          opdFee: formRole === 'doctor' ? Number(formOpdFee) : undefined,
          qualification: formQualification.trim(),
          billingAccess: formBillingAccess
        };
      }
      return u;
    }));

    setIsEditUserOpen(false);
    setBillingAccess(editingUser.id, formBillingAccess);
    setEditingUser(null);
    showToast(`Updated details for ${formName}!`);

    try {
      await api.auth.updateUser(editingUser.id, {
        name: formName.trim(),
        role: formRole,
        designation: formDesignation.trim(),
        department: formDept.trim(),
        shift: formShift,
        mobile: formPhone.trim(),
        email: formEmail.trim(),
        roomNo: formRole === 'doctor' ? formRoomNo : undefined,
        opdFee: formRole === 'doctor' ? Number(formOpdFee) : undefined,
        qualification: formQualification.trim(),
        billingAccess: formBillingAccess
      });
    } catch (err: any) {
      showToast(`Warning: DB update failed for ${formName}. Changes may not persist.`);
    }
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      showToast('Name and Email are required.');
      return;
    }

    const defaultPassword = `${formRole}@123`;
    try {
      await api.auth.signup({
        name: formName.trim(),
        email: formEmail.trim(),
        mobile: formPhone || '',
        password: defaultPassword,
        role: formRole,
        status: 'active',
        designation: formDesignation.trim(),
        department: formDept,
        shift: formShift,
        qualification: formQualification,
        roomNo: formRole === 'doctor' ? formRoomNo : undefined,
        opdFee: formRole === 'doctor' ? Number(formOpdFee) : undefined,
      });
      showToast(`${formName.trim()} added! Default password: ${defaultPassword}`);
      setIsAddUserOpen(false);
      // Reset Form
      setFormName(''); setFormDesignation(''); setFormQualification(''); setFormEmail('');
      // Re-fetch users from DB
      const response = await api.auth.getUsers();
      if (response.success) setUsersList(response.users.map(mapDbUserToHospitalUser));
    } catch (err: any) {
      showToast(`Failed to add user: ${err.message}`);
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status: HospitalUser['status'], accountStatus?: string) => {
    if (accountStatus === 'pending') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
          Pending Approval
        </span>
      );
    }
    const config: Record<string, { bg: string; text: string; border: string; dot: string }> = {
      'Available': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
      'On Duty': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' },
      'In Surgery': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
      'On Break': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
      'Off Duty': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' },
      'On Leave': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
    };
    const c = config[status] || config['Off Duty'];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${c.bg} ${c.text} border ${c.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        {status}
      </span>
    );
  };

  // Role Badge Helper
  const renderRoleBadge = (role: HospitalRole) => {
    const labels: Record<HospitalRole, { label: string; bg: string; text: string }> = {
      doctor: { label: 'Doctor', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
      staff: { label: 'Staff', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
      reception: { label: 'Reception', bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700' },
      admin: { label: 'Admin', bg: 'bg-slate-100 border-slate-300', text: 'text-slate-800' },
      developer: { label: 'Developer', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' }
    };
    const b = labels[role] || labels.staff;
    return (
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border uppercase tracking-wider ${b.bg} ${b.text}`}>
        {b.label}
      </span>
    );
  };

  // Billing Access Component: Live Toggle for all users
  const renderBillingAccessCell = (user: HospitalUser) => {
    const isEnabled = Boolean(user.billingAccess);

    return (
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => handleToggleBillingAccess(user.id)}
          className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-in-out focus:outline-none ${
            isEnabled 
              ? 'bg-[#10b981] border-[#10b981]' 
              : 'bg-white border-slate-300 hover:border-slate-400'
          }`}
          title={isEnabled ? 'Billing Access Active (Click to turn off)' : 'Billing Access Inactive (Click to turn on)'}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
              isEnabled ? 'translate-x-5' : 'translate-x-0 border border-slate-200 bg-white'
            }`}
          />
        </button>
      </div>
    );
  };

  // The Exact 5 Roles + All Users subtabs
  const roleTabs: { id: FilterRole; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'all', label: 'All Users', icon: Users },
    { id: 'reception', label: 'Reception', icon: Building2 },
    { id: 'staff', label: 'Staff', icon: Activity },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope },
    { id: 'admin', label: 'Admin', icon: ShieldCheck },
    { id: 'developer', label: 'Developer', icon: Laptop },
  ];

  return (
    <div className="w-full space-y-4 pb-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Loading State - only shown on initial cold start when no users are in memory */}
      {isLoading && usersList.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Database se users load ho rahe hain...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && usersList.length === 0 && loadError && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center">
            <X className="w-6 h-6 text-rose-500" />
          </div>
          <p className="text-sm font-bold text-rose-600">{loadError}</p>
          <button
            onClick={async () => {
              setIsLoading(true); setLoadError(null);
              try {
                const r = await api.auth.getUsers();
                if (r.success) setUsersList(r.users.map(mapDbUserToHospitalUser));
              } catch (e: any) { setLoadError(e.message); }
              finally { setIsLoading(false); }
            }}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Content (rendered instantly if users are cached) */}
      {(usersList.length > 0 || (!isLoading && !loadError)) && (
        <div className="w-full space-y-4">

      {/* Pending User Approvals Action Banner */}
      {pendingUsersCount > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 border border-amber-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs sm:text-sm font-bold text-amber-950">
                  {pendingUsersCount} Staff Registration{pendingUsersCount > 1 ? 's' : ''} Awaiting Admin Approval
                </p>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-200 text-amber-800">
                  Action Required
                </span>
              </div>
              <p className="text-[11.5px] text-amber-800 mt-0.5 font-normal">
                These users signed up but cannot access the hospital system until an administrator activates their account.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setStatusFilter('pending');
              setActiveRole('all');
            }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap self-stretch sm:self-auto text-center"
          >
            Review & Approve Users ({pendingUsersCount})
          </button>
        </div>
      )}

      {/* 1. HEADER & 5-ROLE KPI CARDS */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <UserCog className="w-6 h-6 text-emerald-600" />
              Hospital Users & Role Access Management
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Add New User</span>
            </button>
          </div>
        </div>

        {/* 5 KPI Cards for the 5 Roles + Total */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100">
          <div 
            onClick={() => setActiveRole('all')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              activeRole === 'all' ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900 ring-offset-1 scale-[1.01]' : 'bg-slate-50/70 border-slate-200/70 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${activeRole === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>Total Users</span>
              <Users className={`w-3.5 h-3.5 ${activeRole === 'all' ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <p className={`text-xl font-extrabold mt-1 ${activeRole === 'all' ? 'text-white' : 'text-slate-900'}`}>{usersList.length}</p>
            <p className="text-[10px] text-slate-400 font-normal">All 5 Roles</p>
          </div>

          <div 
            onClick={() => setActiveRole('reception')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              activeRole === 'reception' ? 'bg-teal-700 text-white border-teal-700 shadow-md ring-2 ring-teal-700 ring-offset-1 scale-[1.01]' : 'bg-slate-50/70 border-slate-200/70 hover:bg-teal-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${activeRole === 'reception' ? 'text-teal-200' : 'text-slate-500'}`}>Reception</span>
              <Building2 className={`w-3.5 h-3.5 ${activeRole === 'reception' ? 'text-teal-200' : 'text-teal-600'}`} />
            </div>
            <p className={`text-xl font-extrabold mt-1 ${activeRole === 'reception' ? 'text-white' : 'text-teal-900'}`}>{getRoleCount('reception')}</p>
            <p className={`text-[10px] font-normal ${activeRole === 'reception' ? 'text-teal-200' : 'text-slate-400'}`}>Front Desk</p>
          </div>

          <div 
            onClick={() => setActiveRole('staff')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              activeRole === 'staff' ? 'bg-rose-700 text-white border-rose-700 shadow-md ring-2 ring-rose-700 ring-offset-1 scale-[1.01]' : 'bg-slate-50/70 border-slate-200/70 hover:bg-rose-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${activeRole === 'staff' ? 'text-rose-200' : 'text-slate-500'}`}>Staff</span>
              <Activity className={`w-3.5 h-3.5 ${activeRole === 'staff' ? 'text-rose-200' : 'text-rose-600'}`} />
            </div>
            <p className={`text-xl font-extrabold mt-1 ${activeRole === 'staff' ? 'text-white' : 'text-rose-900'}`}>{getRoleCount('staff')}</p>
            <p className={`text-[10px] font-normal ${activeRole === 'staff' ? 'text-rose-200' : 'text-slate-400'}`}>Ward & Nursing</p>
          </div>

          <div 
            onClick={() => setActiveRole('doctor')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              activeRole === 'doctor' ? 'bg-blue-700 text-white border-blue-700 shadow-md ring-2 ring-blue-700 ring-offset-1 scale-[1.01]' : 'bg-slate-50/70 border-slate-200/70 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${activeRole === 'doctor' ? 'text-blue-200' : 'text-slate-500'}`}>Doctor</span>
              <Stethoscope className={`w-3.5 h-3.5 ${activeRole === 'doctor' ? 'text-blue-200' : 'text-blue-600'}`} />
            </div>
            <p className={`text-xl font-extrabold mt-1 ${activeRole === 'doctor' ? 'text-white' : 'text-blue-900'}`}>{getRoleCount('doctor')}</p>
            <p className={`text-[10px] font-normal ${activeRole === 'doctor' ? 'text-blue-200' : 'text-slate-400'}`}>Consultants</p>
          </div>

          <div 
            onClick={() => setActiveRole('admin')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              activeRole === 'admin' ? 'bg-slate-800 text-white border-slate-800 shadow-md ring-2 ring-slate-800 ring-offset-1 scale-[1.01]' : 'bg-slate-50/70 border-slate-200/70 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${activeRole === 'admin' ? 'text-slate-300' : 'text-slate-500'}`}>Admin</span>
              <ShieldCheck className={`w-3.5 h-3.5 ${activeRole === 'admin' ? 'text-amber-400' : 'text-slate-700'}`} />
            </div>
            <p className={`text-xl font-extrabold mt-1 ${activeRole === 'admin' ? 'text-white' : 'text-slate-900'}`}>{getRoleCount('admin')}</p>
            <p className={`text-[10px] font-normal ${activeRole === 'admin' ? 'text-slate-400' : 'text-slate-400'}`}>Management</p>
          </div>

          <div 
            onClick={() => setActiveRole('developer')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              activeRole === 'developer' ? 'bg-purple-700 text-white border-purple-700 shadow-md ring-2 ring-purple-700 ring-offset-1 scale-[1.01]' : 'bg-slate-50/70 border-slate-200/70 hover:bg-purple-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${activeRole === 'developer' ? 'text-purple-200' : 'text-slate-500'}`}>Developer</span>
              <Laptop className={`w-3.5 h-3.5 ${activeRole === 'developer' ? 'text-purple-200' : 'text-purple-600'}`} />
            </div>
            <p className={`text-xl font-extrabold mt-1 ${activeRole === 'developer' ? 'text-white' : 'text-purple-900'}`}>{getRoleCount('developer')}</p>
            <p className={`text-[10px] font-normal ${activeRole === 'developer' ? 'text-purple-200' : 'text-slate-400'}`}>Tech & IT Lead</p>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & CONTROLS (Role filter is handled by top KPI cards) */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user name, ID, role, department..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-500 font-medium"
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                {pendingUsersCount > 0 && (
                  <option value="pending" className="font-bold text-amber-600">
                    ⏳ Pending Approval ({pendingUsersCount})
                  </option>
                )}
                <option value="Available">Available</option>
                <option value="On Duty">On Duty</option>
                <option value="In Surgery">In Surgery</option>
                <option value="On Break">On Break</option>
                <option value="Off Duty">Off Duty</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          {/* Right View Toggle: Grid / Table */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <span>Showing <strong className="text-slate-900">{filteredUsers.length}</strong> users</span>
              {activeRole !== 'all' && (
                <button
                  type="button"
                  onClick={() => setActiveRole('all')}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold capitalize transition-colors cursor-pointer"
                  title="Clear role filter"
                >
                  <span>{activeRole}</span>
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
            <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Detailed Table View (with Billing Access & Actions)"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MAIN USERS DISPLAY: TABLE (Matching screenshot) OR GRID */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-dashed border-slate-300 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">No users match your filters</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Try adjusting your search query, status filter, or selected role tab.
            </p>
          </div>
          <button
            onClick={() => { setSearch(''); setStatusFilter('all'); setActiveRole('all'); }}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE LIST VIEW WITH EXACT "BILLING ACCESS" AND "ACTIONS" COLUMNS */
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Emp ID</th>
                <th className="py-3 px-3">User Name</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Designation</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Shift</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-slate-700">Billing Access</th>
                <th className="py-3 px-4 text-slate-700 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono font-medium text-slate-700">
                    {user.empId}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar user={user} size="sm" />
                      <div>
                        <p className="font-semibold text-slate-900 hover:text-emerald-700 cursor-pointer" onClick={() => setSelectedUserForDetail(user)}>
                          {user.name}
                        </p>
                        <p className="text-[11px] text-slate-500 font-normal truncate max-w-[140px]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    {renderRoleBadge(user.role)}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-800">
                    {user.designation}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {user.department}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    <div className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{user.shift}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">
                    {user.contact}
                  </td>
                  <td className="py-3 px-3">
                    {renderStatusBadge(user.status, user.accountStatus)}
                  </td>

                  {/* BILLING ACCESS CELL (Toggle or Always On) */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {renderBillingAccessCell(user)}
                  </td>

                  {/* ACTIONS CELL */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    {user.accountStatus === 'pending' ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleApproveUser(user.id, user.name)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                          title="Approve Registration & Activate Account"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Reject Registration"
                        >
                          <Trash2 className="w-4 h-4 stroke-[1.6]" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(user)}
                          className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          title="Edit User Details & Role"
                        >
                          <Edit3 className="w-4 h-4 stroke-[1.6]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4 stroke-[1.6]" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID CARD VIEW WITH BILLING ACCESS & ACTIONS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredUsers.map((user) => (
            <div 
              key={user.id} 
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start gap-3">
                  <UserAvatar user={user} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-sm text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                          {user.name}
                        </h3>
                        <p className="text-[11px] font-mono text-slate-500 font-semibold">{user.empId}</p>
                      </div>
                      {renderStatusBadge(user.status, user.accountStatus)}
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      {renderRoleBadge(user.role)}
                      <span className="text-[11px] font-medium text-slate-600 truncate">
                        {user.designation}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="mt-3 py-2 px-2.5 bg-slate-50/80 rounded-xl border border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Department</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[170px]">{user.department}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Shift Timing</span>
                    <span className="font-medium text-slate-700">{user.shift}</span>
                  </div>
                  
                  {/* Billing Access Row on Card */}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Billing Access</span>
                    <div>{renderBillingAccessCell(user)}</div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Contact & Actions (Edit & Delete) */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <a 
                  href={`tel:${user.contact}`} 
                  className="font-mono text-[11px] text-slate-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>{user.contact}</span>
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedUserForDetail(user)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                    title="View Profile Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {user.accountStatus === 'pending' ? (
                    <button
                      onClick={() => handleApproveUser(user.id, user.name)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                      title="Approve User Registration"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenEditModal(user)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
                      title="Edit User"
                    >
                      <Edit3 className="w-4 h-4 stroke-[1.8]" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteUser(user.id, user.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                    title={user.accountStatus === 'pending' ? 'Reject Registration' : 'Delete User'}
                  >
                    <Trash2 className="w-4 h-4 stroke-[1.8]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. ADD USER MODAL (Strictly 5 Roles + Billing Access) */}
      {isAddUserOpen && (
        <Modal
          isOpen={isAddUserOpen}
          onClose={() => setIsAddUserOpen(false)}
          title="Onboard New Hospital User"
          subtitle="Assign user to one of the 5 roles: Reception, Staff, Doctor, Admin, or Developer"
          maxWidth="lg"
        >
          <form onSubmit={handleAddUserSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Role *</label>
                <select
                  value={formRole}
                  onChange={(e) => {
                    const r = e.target.value as HospitalRole;
                    setFormRole(r);
                    if (r === 'doctor') {
                      setFormDept('Cardiology & Cath Lab');
                      setFormDesignation('Consultant Specialist');
                    } else if (r === 'staff') {
                      setFormDept('General Ward A & B');
                      setFormDesignation('Staff Nurse');
                    } else if (r === 'reception') {
                      setFormDept('OPD Front Desk');
                      setFormDesignation('Receptionist');
                    } else if (r === 'admin') {
                      setFormDept('Hospital Administration');
                      setFormDesignation('Hospital Operations Manager');
                    } else if (r === 'developer') {
                      setFormDept('HMS Engineering & IT');
                      setFormDesignation('Full Stack Developer');
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="reception">📋 Reception (रिसेप्शन)</option>
                  <option value="staff">💉 Staff (स्टाफ़ - Nursing & Ward)</option>
                  <option value="doctor">🩺 Doctor (डॉक्टर - Consultant Specialist)</option>
                  <option value="admin">🛡️ Admin (एडमिन - Management & Director)</option>
                  <option value="developer">💻 Developer (डेवलपर - Software & IT Architecture)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={formRole === 'doctor' ? 'Dr. Ramesh Gupta' : 'Ramesh Kumar'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 font-semibold text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Designation / Title *</label>
                <input
                  type="text"
                  required
                  value={formDesignation}
                  onChange={(e) => setFormDesignation(e.target.value)}
                  placeholder="E.g. Senior Pediatrician / Staff Nurse / Lead Developer"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department / Unit</label>
                <input
                  type="text"
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Doctor Specific Fields */}
            {formRole === 'doctor' && (
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-blue-900 mb-1">Consultation Room No.</label>
                  <input
                    type="text"
                    value={formRoomNo}
                    onChange={(e) => setFormRoomNo(e.target.value)}
                    placeholder="OPD-201"
                    className="w-full px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-blue-900 mb-1">OPD Consultation Fee (₹)</label>
                  <input
                    type="number"
                    value={formOpdFee}
                    onChange={(e) => setFormOpdFee(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg outline-none text-xs font-mono font-bold"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Shift Schedule</label>
                <select
                  value={formShift}
                  onChange={(e) => setFormShift(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer"
                >
                  <option value="Morning (08:00 - 16:00)">Morning (08:00 - 16:00)</option>
                  <option value="Evening (16:00 - 00:00)">Evening (16:00 - 00:00)</option>
                  <option value="Night (00:00 - 08:00)">Night (00:00 - 08:00)</option>
                  <option value="General (09:00 - 18:00)">General (09:00 - 18:00)</option>
                  <option value="24x7 On Call">24x7 On Call</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone *</label>
                <input
                  type="text"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="user@chaudharyhospital.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>

            {/* Billing Access Toggle in Modal */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-xs">Grant Billing Access</p>
                <p className="text-[11px] text-slate-500">Allow this user to generate, view, and clear patient bills & invoices.</p>
              </div>
              <button
                type="button"
                onClick={() => setFormBillingAccess(!formBillingAccess)}
                className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-in-out focus:outline-none ${
                  formBillingAccess ? 'bg-[#10b981] border-[#10b981]' : 'bg-white border-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                    formBillingAccess ? 'translate-x-5' : 'translate-x-0 border border-slate-200 bg-white'
                  }`}
                />
              </button>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer"
              >
                Save & Onboard User
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 6. EDIT USER MODAL (Pencil ✏️ Action) */}
      {isEditUserOpen && editingUser && (
        <Modal
          isOpen={isEditUserOpen}
          onClose={() => { setIsEditUserOpen(false); setEditingUser(null); }}
          title="Edit User Profile & Permissions"
          subtitle={`Editing Employee Record: ${editingUser.empId}`}
          maxWidth="lg"
        >
          <form onSubmit={handleEditUserSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">User Role *</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as HospitalRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="reception">📋 Reception (रिसेप्शन)</option>
                  <option value="staff">💉 Staff (स्टाफ़ - Nursing & Ward)</option>
                  <option value="doctor">🩺 Doctor (डॉक्टर - Consultant Specialist)</option>
                  <option value="admin">🛡️ Admin (एडमिन - Management & Director)</option>
                  <option value="developer">💻 Developer (डेवलपर - Software & IT Architecture)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 font-semibold text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Designation / Title *</label>
                <input
                  type="text"
                  required
                  value={formDesignation}
                  onChange={(e) => setFormDesignation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department / Wing</label>
                <input
                  type="text"
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Shift Schedule</label>
                <select
                  value={formShift}
                  onChange={(e) => setFormShift(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer"
                >
                  <option value="Morning (08:00 - 16:00)">Morning (08:00 - 16:00)</option>
                  <option value="Evening (16:00 - 00:00)">Evening (16:00 - 00:00)</option>
                  <option value="Night (00:00 - 08:00)">Night (00:00 - 08:00)</option>
                  <option value="General (09:00 - 18:00)">General (09:00 - 18:00)</option>
                  <option value="24x7 On Call">24x7 On Call</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>

            {/* Billing Access Toggle in Edit Modal */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-xs">Billing Access Permission</p>
                <p className="text-[11px] text-slate-500">Allow this user to access the billing desk and process payments.</p>
              </div>
              <button
                type="button"
                onClick={() => setFormBillingAccess(!formBillingAccess)}
                className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-in-out focus:outline-none ${
                  formBillingAccess ? 'bg-[#10b981] border-[#10b981]' : 'bg-white border-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                    formBillingAccess ? 'translate-x-5' : 'translate-x-0 border border-slate-200 bg-white'
                  }`}
                />
              </button>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setIsEditUserOpen(false); setEditingUser(null); }}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer"
              >
                Update User
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 7. USER DETAIL PROFILE MODAL */}
      {selectedUserForDetail && (
        <Modal
          isOpen={!!selectedUserForDetail}
          onClose={() => setSelectedUserForDetail(null)}
          title="Hospital User Details"
          subtitle={`Employee ID: ${selectedUserForDetail.empId}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <UserAvatar user={selectedUserForDetail} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900">{selectedUserForDetail.name}</h3>
                  {renderStatusBadge(selectedUserForDetail.status, selectedUserForDetail.accountStatus)}
                </div>
                <p className="text-xs font-bold text-emerald-700">{selectedUserForDetail.designation}</p>
                <div className="mt-1 flex items-center gap-2">
                  {renderRoleBadge(selectedUserForDetail.role)}
                  <span className="text-[11px] text-slate-500 font-mono">{selectedUserForDetail.empId}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Hospital Role</span>
                <p className="font-bold text-slate-800 capitalize mt-0.5">{selectedUserForDetail.role}</p>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Department</span>
                <p className="font-semibold text-slate-800 truncate mt-0.5">{selectedUserForDetail.department}</p>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Billing Clearance</span>
                <p className="mt-0.5">{renderBillingAccessCell(selectedUserForDetail)}</p>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Direct Phone</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedUserForDetail.contact}</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">
                Joined: {selectedUserForDetail.joiningDate || 'Active'}
              </span>
              <div className="flex items-center gap-2">
                {selectedUserForDetail.accountStatus === 'pending' && (
                  <button
                    type="button"
                    onClick={() => {
                      const u = selectedUserForDetail;
                      setSelectedUserForDetail(null);
                      handleApproveUser(u.id, u.name);
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer transition-all inline-flex items-center gap-1.5 shadow-xs active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve Account
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const u = selectedUserForDetail;
                    setSelectedUserForDetail(null);
                    handleOpenEditModal(u);
                  }}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold text-xs cursor-pointer transition-all inline-flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit User
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUserForDetail(null)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
        </div>
      )}
    </div>
  );
};
