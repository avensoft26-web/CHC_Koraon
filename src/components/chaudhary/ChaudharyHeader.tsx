import React from 'react';
import { 
  Bell, 
  Menu, 
  ChevronDown,
  User
} from 'lucide-react';

import { useAuthUser } from '../../hooks/useAuthUser';

interface ChaudharyHeaderProps {
  activeTab?: string;
  onLogout?: () => void;
  onSearchChange?: (val: string) => void;
  onToggleSidebar?: () => void;
  onOpenProfile?: () => void;
}

export const ChaudharyHeader: React.FC<ChaudharyHeaderProps> = ({
  activeTab = 'Dashboard',
  onToggleSidebar,
  onOpenProfile,
}) => {
  const user = useAuthUser();

  return (
    <header className="h-14 px-6 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between gap-4 flex-shrink-0 z-30 shadow-xs">
      {/* 1. Left Section: Hamburger Toggle + Breadcrumbs */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onToggleSidebar}
          className="w-9 h-9 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
          aria-label="Toggle Sidebar"
          title="Toggle Sidebar"
        >
          <Menu className="w-4.5 h-4.5 stroke-[2.2]" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#172554] tracking-tight">
            {activeTab || 'Dashboard'}
          </h2>
        </div>
      </div>

      {/* 3. Right Section: Notification Bell + Profile Pill */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button 
          className="w-9 h-9 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center relative transition-all shadow-2xs active:scale-95"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
            3
          </span>
        </button>

        {/* User Profile Pill */}
        <div 
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-1 pr-3 shadow-2xs hover:bg-slate-50/80 transition-all cursor-pointer active:scale-98"
          title="Open Staff Profile"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-lg" />
            ) : user.name ? (
              user.name.slice(0, 2).toUpperCase()
            ) : (
              <User className="w-4 h-4 stroke-[2.4]" />
            )}
          </div>
          <div className="text-left leading-tight hidden lg:block">
            <p className="text-xs font-bold text-[#172554]">{user.name || 'Reception Officer'}</p>
            <p className="text-[11px] text-slate-500 font-medium">{user.department || user.role || 'Front Desk'}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </header>
  );
};
