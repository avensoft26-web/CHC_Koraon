import React from 'react';
import { 
  Home, 
  Users, 
  UserPlus, 
  FileText, 
  CreditCard, 
  LogOut, 
  FileBadge, 
  Bell,
  Stethoscope,
  Settings
} from 'lucide-react';
import { ChaudharyLogo } from '../ChaudharyLogo';
import { useBillingAccess } from '../../../utils/billingAccess';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { useHospitalContext } from '../../../context/HospitalContext';

export type DoctorNavTab = 
  | 'Home'
  | 'Patients'
  | 'Add Patient'
  | 'Daily Notes'
  | 'Billing'
  | 'Discharge'
  | 'Patient Records'
  | 'Notifications'
  | 'Settings';

interface ChaudharyDoctorSidebarProps {
  activeTab: DoctorNavTab;
  setActiveTab: (tab: DoctorNavTab) => void;
  onLogout?: () => void;
  isCollapsed?: boolean;
  userId?: string;
}

interface NavItemConfig {
  id: DoctorNavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const ChaudharyDoctorSidebar: React.FC<ChaudharyDoctorSidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
  isCollapsed = false,
}) => {
  const user = useAuthUser();
  // Real-time Billing Access permission
  const hasBillingAccess = useBillingAccess();
  const hospitalCtx = useHospitalContext();
  const livePatientsCount = hospitalCtx?.patients?.length ?? 0;

  // Navigation items matching exactly the user requested list:
  // Billing is ONLY shown when billingAccess is ON!
  const allNavItems: NavItemConfig[] = [
    { id: 'Home', label: 'Home', icon: Home },
    { id: 'Patients', label: 'Patients', icon: Users, badge: String(livePatientsCount) },
    { id: 'Add Patient', label: 'Add Patient', icon: UserPlus },
    { id: 'Daily Notes', label: 'Daily Notes', icon: FileText },
    { id: 'Billing', label: 'Billing', icon: CreditCard },
    { id: 'Discharge', label: 'Discharge', icon: LogOut },
    { id: 'Patient Records', label: 'Patient Records', icon: FileBadge },
    { id: 'Notifications', label: 'Notifications', icon: Bell, badge: '4' },
    { id: 'Settings', label: 'Settings', icon: Settings },
  ];

  const navItems = allNavItems.filter(item => {
    if (item.id === 'Billing') return hasBillingAccess;
    return true;
  });

  // If user is currently on Billing tab and permission is revoked/off, gracefully switch to Home
  React.useEffect(() => {
    if (activeTab === 'Billing' && !hasBillingAccess) {
      setActiveTab('Home');
    }
  }, [activeTab, hasBillingAccess, setActiveTab]);

  const renderNavItem = (item: NavItemConfig) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    if (isCollapsed) {
      return (
        <div key={item.id} className="relative flex justify-center py-1">
          <button
            onClick={() => setActiveTab(item.id)}
            className={`relative w-11 h-11 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-[0_6px_18px_rgba(16,185,129,0.38),inset_0_1.5px_2px_rgba(255,255,255,0.45)] !border-2 !border-emerald-300 scale-105'
                : 'bg-white/90 hover:bg-white text-slate-600 hover:text-emerald-700 border border-emerald-100/90 hover:border-emerald-300 shadow-[0_2px_6px_rgba(15,23,42,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:shadow-[0_6px_16px_rgba(16,185,129,0.18)] hover:-translate-y-0.5'
            }`}
            title={item.badge ? `${item.label} (${item.badge})` : item.label}
          >
            <Icon className={`w-5 h-5 stroke-[2.3] transition-transform duration-200 group-hover:scale-105 ${
              isActive ? 'text-white drop-shadow-xs' : 'text-slate-600 group-hover:text-emerald-600'
            }`} />

            {/* Collapsed Micro-badge */}
            {item.badge && (
              <span className={`absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center border-2 border-white shadow-xs ${
                item.id === 'Notifications' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-600'
              }`}>
                {item.badge}
              </span>
            )}
          </button>
        </div>
      );
    }

    return (
      <div key={item.id} className="relative group">
        <button
          onClick={() => setActiveTab(item.id)}
          className={`w-full h-[46px] flex items-center cursor-pointer transition-all duration-200 rounded-2xl px-3 gap-3 text-left ${
            isActive 
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-semibold shadow-[0_6px_18px_rgba(16,185,129,0.28),inset_0_1px_1px_rgba(255,255,255,0.35)] border border-emerald-400/50' 
              : 'bg-transparent hover:bg-white/90 text-slate-700 hover:text-slate-950 font-medium hover:border hover:border-emerald-200/70 hover:shadow-2xs'
          }`}
        >
          {/* Icon in Capsule Box */}
          <div 
            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
              isActive 
                ? 'bg-white/20 text-white border border-white/35 shadow-2xs' 
                : 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 group-hover:text-emerald-900 border border-emerald-100/90'
            }`}
          >
            <Icon className="w-4.5 h-4.5 stroke-[2.3]" />
          </div>

          {/* Label + Badge */}
          <div className="flex-1 flex items-center justify-between min-w-0 pr-1">
            <span 
              className={`text-[13.5px] tracking-tight truncate ${
                isActive 
                  ? 'text-white font-semibold' 
                  : 'text-slate-700 group-hover:text-slate-950 font-medium'
              }`}
            >
              {item.label}
            </span>

            {item.badge && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isActive 
                  ? 'bg-white/25 text-white border border-white/30' 
                  : item.id === 'Notifications'
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200/60'
              }`}>
                {item.badge}
              </span>
            )}
          </div>
        </button>
      </div>
    );
  };

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-[74px]' : 'w-[256px]'
      } bg-[#F4FBF7] border-r border-emerald-200/90 flex flex-col justify-between h-screen flex-shrink-0 z-40 select-none transition-colors duration-150 relative overflow-hidden`}
    >
      {/* Top Section: Brand + Navigation */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
        {/* Brand Header */}
        <div 
          className={`h-16 flex items-center border-b border-emerald-100 bg-white/90 flex-shrink-0 ${
            isCollapsed ? 'justify-center px-2' : 'px-4 gap-3'
          }`}
        >
          <ChaudharyLogo size={isCollapsed ? 36 : 40} className="shadow-xs flex-shrink-0 ring-1 ring-emerald-200" />
          
          {!isCollapsed && (
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex items-center gap-1.5">
                <h1 className="font-outfit font-bold text-[15px] tracking-tight text-slate-900 truncate">
                  Chaudhary Care
                </h1>
                <span className="text-[8.5px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-2xs flex-shrink-0">
                  DOCTOR
                </span>
              </div>
              <p className="text-[10px] font-semibold tracking-tight truncate text-emerald-800 flex items-center gap-1 mt-0.5">
                <Stethoscope className="w-3 h-3 text-emerald-600 inline flex-shrink-0" />
                <span>OPD & Clinical Portal</span>
              </p>
            </div>
          )}
        </div>

        {/* Scrollable Navigation Items */}
        <div className={`flex-1 overflow-y-auto py-3 custom-scrollbar ${isCollapsed ? 'px-2' : 'px-3'}`}>
          <div className={isCollapsed ? "space-y-2.5 flex flex-col items-center" : "space-y-1.5"}>
            {!isCollapsed && (
              <p className="px-3 pt-1 pb-1.5 text-[9.5px] font-semibold uppercase tracking-wider text-emerald-900/60 font-space">
                Clinical Menu
              </p>
            )}
            {navItems.map(renderNavItem)}
          </div>
        </div>
      </div>

      {/* Bottom Doctor Profile Capsule */}
      <div className="p-3 border-t border-emerald-200/70 bg-white/90 flex-shrink-0 relative z-10">
        {!isCollapsed ? (
          <div className="p-2.5 rounded-2xl bg-white border border-emerald-200 shadow-2xs flex items-center justify-between gap-3">
            <div 
              className="flex items-center gap-2.5 min-w-0 flex-1"
              title={`${user.name || 'Doctor'} (Doctor Profile)`}
            >
              <div className="relative w-10 h-10 flex-shrink-0">
                {user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name}
                    className="w-10 h-10 min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px] rounded-full object-cover border-2 border-emerald-400 flex-shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-800 text-white font-bold flex items-center justify-center text-xs border-2 border-emerald-400 flex-shrink-0 shadow-xs">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : 'DR'}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold text-slate-900 truncate leading-tight">
                  {user.name || 'Consultant Doctor'}
                </p>
                <p className="text-[10px] text-emerald-700 font-medium truncate mt-0.5">
                  {user.department || user.email || 'Clinical Department'}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 flex items-center justify-center transition-colors cursor-pointer shadow-2xs flex-shrink-0"
              title="Log Out"
            >
              <LogOut className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div 
              className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-800 text-white font-bold border-2 border-emerald-400 flex items-center justify-center shadow-xs overflow-hidden text-xs"
              title={user.name || 'Doctor'}
            >
              {user.name ? user.name.slice(0, 2).toUpperCase() : 'DR'}
            </div>
            <button
              onClick={onLogout}
              className="w-9 h-9 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              title="Log Out"
            >
              <LogOut className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
