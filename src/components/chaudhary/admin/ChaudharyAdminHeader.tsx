import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Menu, 
  ChevronDown, 
  ShieldCheck, 
  Activity, 
  Download, 
  Radio, 
  Sparkles,
  X,
  AlertTriangle
} from 'lucide-react';
import { AdminNavTab } from './ChaudharyAdminSidebar';
import { useAuthUser } from '../../../hooks/useAuthUser';

interface ChaudharyAdminHeaderProps {
  activeTab: AdminNavTab;
  onToggleSidebar: () => void;
  onLogout?: () => void;
}

export const ChaudharyAdminHeader: React.FC<ChaudharyAdminHeaderProps> = ({
  activeTab,
  onToggleSidebar,
  onLogout,
}) => {
  const user = useAuthUser();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'ICU Bed 02 Critical Telemetry',
      desc: 'SpO2 drops below 90% in Inpatient Ward 3',
      time: '5 mins ago',
      type: 'urgent',
    },
    {
      id: 2,
      title: 'Daily Billing Settlement Milestone',
      desc: 'Today gross billing reached ₹2,45,000 (Target 100% met)',
      time: '30 mins ago',
      type: 'info',
    },
    {
      id: 3,
      title: 'Doctor OPD Roster Change',
      desc: 'Dr. Vikram Malhotra covering Evening Emergency Shift',
      time: '1 hour ago',
      type: 'notice',
    },
  ];

  return (
    <header className="h-16 px-4 sm:px-6 bg-white border-b border-slate-200/80 flex items-center justify-between gap-3 flex-shrink-0 z-30 shadow-xs relative">
      {/* 1. Left: Hamburger + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="w-9 h-9 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
          aria-label="Toggle Sidebar"
          title="Toggle Sidebar"
        >
          <Menu className="w-4.5 h-4.5 stroke-[2.2]" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {activeTab}
          </h2>
        </div>
      </div>

      {/* 2. Middle: Global Search */}
      <div className="flex-1 max-w-xl mx-2 flex items-center">
        <div className="relative flex items-center bg-slate-50 hover:bg-white focus-within:bg-white border border-slate-200 focus-within:border-emerald-500 rounded-xl px-3 py-1.5 shadow-2xs transition-all w-full group">
          <Search className="w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search patient UHID, doctor, staff, invoice no..."
            className="w-full text-xs text-slate-800 placeholder-slate-400 outline-none bg-transparent font-medium"
          />
          <span className="hidden sm:inline-block ml-2 text-[9.5px] bg-white text-slate-400 font-semibold px-1.5 py-0.5 rounded border border-slate-200">
            ⌘K
          </span>
        </div>
      </div>

      {/* 3. Right: Notification + Admin Avatar */}
      <div className="flex items-center gap-2 sm:gap-2.5">

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center relative transition-all shadow-2xs active:scale-95 cursor-pointer"
            aria-label="Admin Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-11 w-80 sm:w-88 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Hospital Live Alerts</h4>
                </div>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div 
                    key={n.id}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-xs transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin Avatar Pill */}
        <div 
          className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1 pr-2.5 shadow-2xs hover:bg-slate-100 transition-all cursor-pointer"
        >
          {user.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.name}
              className="w-7 h-7 rounded-lg object-cover border border-emerald-500/50"
            />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-bold flex items-center justify-center text-[10px] border border-emerald-500/50">
              {user.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
          )}
          <div className="text-left leading-tight hidden lg:block">
            <p className="text-xs font-bold text-slate-900">{user.name || 'Hospital Admin'}</p>
            <p className="text-[9px] text-emerald-700 font-bold uppercase">{user.role || 'Super Admin'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
