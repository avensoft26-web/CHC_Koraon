import React from 'react';
import {
  Home,
  Users,
  UserPlus,
  FileText,
  CreditCard,
  LogOut,
  UserCog,
  BarChart3,
  FileBadge,
  Bell,
  Settings,
  Code2,
  Terminal,
  Cpu
} from 'lucide-react';
import { ChaudharyLogo } from '../ChaudharyLogo';
import { useBillingAccess } from '../../../utils/billingAccess';
import { AdminNavTab } from '../admin/ChaudharyAdminSidebar';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { useHospitalContext } from '../../../context/HospitalContext';

interface ChaudharyDeveloperSidebarProps {
  activeTab: AdminNavTab;
  setActiveTab: (tab: AdminNavTab) => void;
  onLogout?: () => void;
  isCollapsed?: boolean;
  userId?: string;
}

interface NavItemConfig {
  id: AdminNavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const ChaudharyDeveloperSidebar: React.FC<ChaudharyDeveloperSidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
  isCollapsed = false,
}) => {
  const user = useAuthUser();
  const hasBillingAccess = useBillingAccess();
  const hospitalCtx = useHospitalContext();
  const livePatientsCount = hospitalCtx?.patients?.length ?? 0;

  // Identical navigation authority as Admin
  const allMainNavItems: NavItemConfig[] = [
    { id: 'Home', label: 'Home', icon: Home },
    { id: 'Patients', label: 'Patients', icon: Users, badge: String(livePatientsCount) },
    { id: 'Add Patient', label: 'Add Patient', icon: UserPlus },
    { id: 'Daily Notes', label: 'Daily Notes', icon: FileText },
    { id: 'Billing', label: 'Billing', icon: CreditCard },
    { id: 'Discharge', label: 'Discharge', icon: LogOut },
  ];

  const mainNavItems = allMainNavItems.filter(item => {
    if (item.id === 'Billing') return hasBillingAccess;
    return true;
  });

  const managementNavItems: NavItemConfig[] = [
    { id: 'Users', label: 'Users', icon: UserCog },
    { id: 'Reports', label: 'Reports', icon: BarChart3 },
    { id: 'Patient Records', label: 'Patient Records', icon: FileBadge },
    { id: 'Notifications', label: 'Notifications', icon: Bell, badge: '3' },
    { id: 'Settings', label: 'Settings', icon: Settings },
  ];

  const renderNavItem = (item: NavItemConfig) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    if (isCollapsed) {
      return (
        <div key={item.id} className="relative flex justify-center py-1">
          <button
            onClick={() => setActiveTab(item.id)}
            className={`relative w-11 h-11 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 ${isActive
                ? 'bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 text-white shadow-md shadow-indigo-500/30 scale-105'
                : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-indigo-600 border border-slate-200/80 shadow-2xs'
              }`}
            title={item.badge ? `${item.label} (${item.badge})` : item.label}
          >
            <Icon className={`w-5 h-5 stroke-[2.3] ${isActive ? 'text-white' : 'text-slate-600'}`} />
            {item.badge && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center bg-indigo-600 border-2 border-white shadow-xs">
                {item.badge}
              </span>
            )}
          </button>
        </div>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all duration-200 cursor-pointer ${isActive
            ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white shadow-md shadow-indigo-500/25'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
          }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon className={`w-4.5 h-4.5 stroke-[2.2] shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
          <span className="truncate">{item.label}</span>
        </div>
        {item.badge && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
            }`}>
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside
      className={`h-screen bg-white border-r border-slate-200/80 flex flex-col justify-between transition-all duration-300 z-40 select-none shadow-xs ${isCollapsed ? 'w-20' : 'w-64'
        }`}
    >
      {/* 1. Header / Logo */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
            <Code2 className="w-5 h-5 stroke-[2.4]" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900 tracking-tight uppercase">CHAUDHARY</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                  DEV ROOT
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                Full Admin Authorities
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Nav Items List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 no-scrollbar">
        {/* Core Operations */}
        <div className="space-y-1">
          {!isCollapsed && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1 block">
              Core Clinical Operations
            </span>
          )}
          {mainNavItems.map(renderNavItem)}
        </div>

        {/* Administration & Management */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          {!isCollapsed && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1 block">
              Hospital Administration
            </span>
          )}
          {managementNavItems.map(renderNavItem)}
        </div>
      </div>

      {/* 3. Footer / User & Logout */}
      <div className="p-3 border-t border-slate-100">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-2 rounded-2xl bg-slate-50 border border-slate-200/80`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'DEV'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user.name || 'Developer'}</p>
                <p className="text-[10px] text-indigo-600 font-mono font-semibold">{user.email || 'Root Admin Mode'}</p>
              </div>
            </div>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
