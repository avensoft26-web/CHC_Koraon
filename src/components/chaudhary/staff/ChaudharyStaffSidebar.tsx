import React from 'react';
import { 
  Home, 
  UserPlus, 
  Users, 
  FileText, 
  Receipt,
  UserCircle,
  LogOut,
  HeartPulse
} from 'lucide-react';
import { ChaudharyLogo } from '../ChaudharyLogo';

export type StaffNavTab = 
  | 'Dashboard'
  | 'Admit'
  | 'Patients'
  | 'Notes'
  | 'Billing'
  | 'Profile';

import { useBillingAccess } from '../../../utils/billingAccess';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { useHospitalContext } from '../../../context/HospitalContext';

interface ChaudharyStaffSidebarProps {
  activeTab: StaffNavTab;
  setActiveTab: (tab: StaffNavTab) => void;
  onOpenProfile?: () => void;
  onLogout?: () => void;
  isCollapsed?: boolean;
  userId?: string;
}

export const ChaudharyStaffSidebar: React.FC<ChaudharyStaffSidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfile,
  onLogout,
  isCollapsed = false,
}) => {
  const user = useAuthUser();
  const hasBillingAccess = useBillingAccess();
  const hospitalCtx = useHospitalContext();
  const livePatientsCount = hospitalCtx?.patients?.length ?? 0;

  // Clean, focused navigation featuring Admit, Patients, Notes, and Billing (if granted)
  const allNavItems: { id: StaffNavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
    { id: 'Dashboard', label: 'Dashboard', icon: Home },
    { id: 'Admit', label: 'Admit', icon: UserPlus },
    { id: 'Patients', label: 'Patients', icon: Users, badge: String(livePatientsCount) },
    { id: 'Notes', label: 'Notes', icon: FileText, badge: 'New' },
    { id: 'Billing', label: 'Billing', icon: Receipt },
    { id: 'Profile', label: 'Profile', icon: UserCircle },
  ];

  const navItems = allNavItems.filter(item => {
    if (item.id === 'Billing') return hasBillingAccess;
    return true;
  });

  let activeIndex = navItems.findIndex(item => item.id === activeTab);
  if (activeIndex === -1) activeIndex = 0;

  const ITEM_HEIGHT = 38; // px
  const ITEM_GAP = 18; // px - increased spacing between menu items
  const STEP = ITEM_HEIGHT + ITEM_GAP; // 56px per slot

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-[72px]' : 'w-[220px]'
      } bg-[#0E2038] border-r border-[#1B355A] flex flex-col justify-between h-screen flex-shrink-0 z-40 select-none transition-all duration-200 relative overflow-hidden`}
    >
      {/* Top Brand Header */}
      <div className="relative z-10 flex-shrink-0">
        <div 
          className={`h-16 flex items-center bg-[#0A182B] border-b border-[#1B355A] transition-colors ${
            isCollapsed ? 'justify-center px-2' : 'px-4 gap-3'
          }`}
        >
          <ChaudharyLogo size={isCollapsed ? 34 : 38} className="shadow-md flex-shrink-0 ring-1 ring-white/20" />
          
          {!isCollapsed && (
            <div className="min-w-0 flex-1 overflow-hidden transition-opacity">
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-[13px] tracking-wide font-sans truncate text-white">
                  Chaudhary Care
                </h1>
                <span className="text-[8.5px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider bg-emerald-500 text-white shadow-xs">
                  STAFF
                </span>
              </div>
              <p className="text-[10px] font-bold tracking-tight mt-0.5 truncate text-emerald-300/80 flex items-center gap-1">
                <HeartPulse className="w-2.5 h-2.5 inline" /> Inpatient & Nursing Care
              </p>
            </div>
          )}
        </div>

        {/* Navigation Area with Smooth Sliding Capsule */}
        <div className={`relative py-4 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          
          {/* Sliding Active Pill */}
          <div 
            className={`absolute ${isCollapsed ? 'left-2 right-2' : 'left-3 right-3'} pointer-events-none transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 will-change-transform transform-gpu`}
            style={{
              top: '16px',
              height: `${ITEM_HEIGHT}px`,
              transform: `translate3d(0, ${activeIndex * STEP}px, 0)`,
            }}
          >
            {isCollapsed ? (
              <div className="relative w-[38px] h-[38px] mx-auto">
                <div className="w-[38px] h-[38px] rounded-xl bg-emerald-600 border border-emerald-400/40 shadow-md shadow-emerald-950/60 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-lg bg-white/20 border border-white/30" />
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <div className="w-full h-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-400/40 shadow-md shadow-emerald-950/60 flex items-center px-2.5 gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/20 border border-white/30 flex-shrink-0" />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <div className="relative z-20 flex flex-col" style={{ gap: `${ITEM_GAP}px` }}>
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeIndex === idx;

              return (
                <div 
                  key={item.id} 
                  className="relative group flex items-center"
                  style={{ height: `${ITEM_HEIGHT}px` }}
                >
                  <button
                    onClick={() => {
                      if (item.id === 'Profile') {
                        setActiveTab('Profile');
                        if (onOpenProfile) onOpenProfile();
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                    className={`w-full h-full flex items-center cursor-pointer transition-colors duration-150 rounded-xl ${
                      isActive ? '' : 'hover:bg-white/10 border border-transparent'
                    } ${
                      isCollapsed 
                        ? 'justify-center px-0' 
                        : 'px-2.5 gap-2.5 text-left'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {/* Icon container */}
                    <div 
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform ${
                        isActive 
                          ? 'text-white scale-105' 
                          : 'text-slate-300 group-hover:text-white group-hover:scale-105'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5 stroke-[2.3]" />
                    </div>

                    {/* Nav Label + Badge */}
                    {!isCollapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0 pr-1">
                        <span 
                          className={`text-[13px] font-bold tracking-tight truncate ${
                            isActive 
                              ? 'text-white font-extrabold' 
                              : 'text-slate-300 group-hover:text-white'
                          }`}
                        >
                          {item.label}
                        </span>

                        {item.badge && (
                          <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                            isActive 
                              ? 'bg-white text-emerald-800' 
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>

                  {/* Tooltip for collapsed sidebar */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg shadow-xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Nurse Profile Capsule */}
      <div className="p-3 border-t border-[#1B355A] bg-[#0A182B]/80 relative z-10 flex-shrink-0">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div 
              onClick={() => setActiveTab('Profile')}
              className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-colors"
            >
              <div className="relative">
                {user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-emerald-400/60"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-[11px] border border-emerald-400/60">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : 'SN'}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0A182B] rounded-full" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user.name || 'Staff Nurse'}</p>
                <p className="text-[10px] text-emerald-300 font-medium truncate">{user.department || user.email || 'Inpatient Nursing'}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="w-full py-1.5 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/20 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setActiveTab('Profile')}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-200 transition-colors"
              title={user.name || 'Profile'}
            >
              <UserCircle className="w-5 h-5" />
            </button>
            <button
              onClick={onLogout}
              className="w-9 h-9 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 flex items-center justify-center transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
