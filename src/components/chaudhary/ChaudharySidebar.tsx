import React from 'react';
import { 
  Home, 
  Users, 
  UserPlus, 
  Stethoscope, 
  BedDouble, 
  Receipt, 
  UserCircle,
  LogOut
} from 'lucide-react';
import { ChaudharyLogo } from './ChaudharyLogo';

export type ChaudharyNavTab = 
  | 'Dashboard'
  | 'Patients'
  | 'Add Patient'
  | 'Doctors'
  | 'Bed & Wards'
  | 'Billing'
  | 'Profile'
  | 'Appointments'
  | 'Billing & Payments'
  | 'Lab & Reports'
  | 'Pharmacy'
  | 'Beds & Wards'
  | 'Doctors & Staff'
  | 'Hospital Analytics'
  | 'Settings';

interface ChaudharySidebarProps {
  activeTab: ChaudharyNavTab;
  setActiveTab: (tab: ChaudharyNavTab) => void;
  onOpenProfile?: () => void;
  onLogout?: () => void;
  isCollapsed?: boolean;
}

export const ChaudharySidebar: React.FC<ChaudharySidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfile,
  onLogout,
  isCollapsed = false,
}) => {
  // Exactly 7 items requested
  const navItems: { id: ChaudharyNavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'Dashboard', label: 'Dashboard', icon: Home },
    { id: 'Patients', label: 'Patients', icon: Users },
    { id: 'Add Patient', label: 'Add Patient', icon: UserPlus },
    { id: 'Doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'Bed & Wards', label: 'Bed & Wards', icon: BedDouble },
    { id: 'Billing', label: 'Billing', icon: Receipt },
    { id: 'Profile', label: 'Profile', icon: UserCircle },
  ];

  let activeIndex = navItems.findIndex(item => item.id === activeTab);
  if (activeIndex === -1) {
    if (activeTab === 'Beds & Wards') activeIndex = 4;
    else if (activeTab === 'Billing & Payments') activeIndex = 5;
    else if (activeTab === 'Doctors & Staff' || activeTab === 'Appointments') activeIndex = 3;
    else activeIndex = 0;
  }

  const ITEM_HEIGHT = 38; // px - compact sleek height
  const ITEM_GAP = 18; // px - spacious comfortable gap
  const STEP = ITEM_HEIGHT + ITEM_GAP; // 56px per slot

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-[70px]' : 'w-[215px]'
      } bg-[#0E2038] border-r border-[#1B355A] flex flex-col justify-between h-screen flex-shrink-0 z-40 select-none transition-colors duration-200 relative overflow-hidden`}
    >
      {/* Top Brand Header */}
      <div className="relative z-10">
        <div 
          className={`h-16 flex items-center bg-[#0A182B] border-b border-[#1B355A] transition-colors ${
            isCollapsed ? 'justify-center px-2' : 'px-4 gap-3'
          }`}
        >
          <ChaudharyLogo size={isCollapsed ? 34 : 40} className="shadow-md flex-shrink-0 ring-1 ring-white/20" />
          
          {!isCollapsed && (
            <div className="min-w-0 flex-1 overflow-hidden transition-opacity">
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-[13.5px] tracking-wide font-sans truncate text-white">
                  Chaudhary Care
                </h1>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  HMS
                </span>
              </div>
              <p className="text-[10px] font-medium tracking-tight mt-0.5 truncate text-blue-300/80">
                Hospital Management
              </p>
            </div>
          )}
        </div>

        {/* Navigation Area with Sliding Modern Floating Capsule */}
        <div className={`relative py-4 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          
          {/* Sliding Active Background (Hardware-accelerated 60fps GPU Glide) */}
          <div 
            className={`absolute ${isCollapsed ? 'left-2 right-2' : 'left-3 right-3'} pointer-events-none transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 will-change-transform transform-gpu`}
            style={{
              top: '16px',
              height: `${ITEM_HEIGHT}px`,
              transform: `translate3d(0, ${activeIndex * STEP}px, 0)`,
            }}
          >
            {isCollapsed ? (
              /* Collapsed Active Capsule */
              <div className="relative w-[38px] h-[38px] mx-auto">
                <div className="w-[38px] h-[38px] rounded-xl bg-blue-600 border border-blue-400/40 shadow-md shadow-blue-950/60 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center" />
                </div>
              </div>
            ) : (
              /* Expanded Active Card */
              <div className="relative w-full h-full">
                <div className="w-full h-full rounded-xl bg-blue-600 border border-blue-400/40 shadow-md shadow-blue-950/60 flex items-center px-2.5 gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/20 border border-white/30 flex-shrink-0" />
                </div>
              </div>
            )}
          </div>

          {/* All 7 Nav Buttons */}
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
                        ? 'justify-center' 
                        : 'justify-between px-2.5'
                    }`}
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5 min-w-0'}`}>
                      {/* Icon Container */}
                      <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                        <Icon
                          className={`transition-colors duration-150 flex-shrink-0 ${
                            isCollapsed ? 'w-5 h-5' : 'w-4.5 h-4.5'
                          } ${
                            isActive 
                              ? 'text-white stroke-[2.4] drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]'
                              : 'text-slate-400 stroke-[2] group-hover:text-blue-300'
                          }`}
                        />
                      </div>

                      {!isCollapsed && (
                        <span className={`text-[13px] tracking-tight transition-colors duration-150 truncate ${
                          isActive 
                            ? 'text-white font-semibold' 
                            : 'text-slate-300 font-medium group-hover:text-white'
                        }`}>
                          {item.label}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && isActive && (
                      <span className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9] mr-1 animate-pulse" />
                    )}
                  </button>

                  {/* Floating Tooltip in collapsed mode */}
                  {isCollapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-[#0A1A30] text-white text-xs font-semibold rounded-lg shadow-xl border border-[#1C3B68] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Bottom Section: Dedicated Logout Button */}
      <div className={`relative z-10 border-t border-[#1B355A] bg-[#0A182B] ${isCollapsed ? 'p-2' : 'p-3'}`}>
        <div className="relative group">
          <button
            onClick={onLogout}
            className={`transition-all flex items-center justify-center cursor-pointer group active:scale-[0.98] ${
              isCollapsed 
                ? 'w-11 h-11 mx-auto rounded-xl bg-[#0E2038] hover:bg-rose-950/60 border border-[#1B355A] hover:border-rose-500/60 text-slate-300 hover:text-rose-200 shadow-2xs' 
                : 'w-full py-2.5 px-3.5 bg-[#0E2038] hover:bg-rose-950/60 border border-[#1B355A] hover:border-rose-500/60 text-slate-300 hover:text-rose-200 rounded-xl text-xs font-bold gap-2 shadow-2xs'
            }`}
            title={isCollapsed ? "Logout / Exit" : undefined}
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-400 transition-colors flex-shrink-0" />
            {!isCollapsed && <span>Logout / Exit</span>}
          </button>

          {/* Floating Tooltip for logout when collapsed */}
          {isCollapsed && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-[#0A1A30] text-rose-300 text-xs font-semibold rounded-lg shadow-xl border border-[#1B355A] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Logout / Exit
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
