import React, { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  ShieldCheck,
  Code2,
  Terminal,
  Cpu
} from 'lucide-react';
import { AdminNavTab } from '../admin/ChaudharyAdminSidebar';

interface ChaudharyDeveloperHeaderProps {
  activeTab: AdminNavTab;
  onToggleSidebar: () => void;
  onLogout?: () => void;
}

export const ChaudharyDeveloperHeader: React.FC<ChaudharyDeveloperHeaderProps> = ({
  activeTab,
  onToggleSidebar,
  onLogout,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Dev System Health: All 32 Terminals Connected',
      desc: 'WebSocket telemetry ping steady at 18ms. No packet drops.',
      time: 'Just now',
      type: 'info',
    },
    {
      id: 2,
      title: 'Database Auto-Backup Check Complete',
      desc: 'PostgreSQL EMR schemas snapshot synced with 100% integrity.',
      time: '15 mins ago',
      type: 'notice',
    },
  ];

  return (
    <header className="h-16 px-4 sm:px-6 bg-white border-b border-slate-200/80 flex items-center justify-between gap-3 flex-shrink-0 z-30 shadow-xs relative select-none">
      {/* 1. Left: Hamburger + Title + Dev Root Badge */}
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
        <div className="relative flex items-center bg-slate-50 hover:bg-white focus-within:bg-white border border-slate-200 focus-within:border-indigo-500 rounded-xl px-3 py-1.5 shadow-2xs transition-all w-full group">
          <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Developer Search: patient UHID, doctor, invoices, API logs..."
            className="w-full text-xs text-slate-800 placeholder-slate-400 outline-none bg-transparent font-medium"
          />
          <span className="hidden sm:inline-block ml-2 text-[9.5px] bg-white text-slate-400 font-semibold px-1.5 py-0.5 rounded border border-slate-200 font-mono">
            ⌘K
          </span>
        </div>
      </div>

      {/* 3. Right: Dev Status + Notification + Avatar */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Live System Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px]">Local Dev (5173)</span>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center relative transition-all shadow-2xs active:scale-95 cursor-pointer"
            aria-label="Developer Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              2
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Developer Alerts</span>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Live Feed
                </span>
              </div>
              <div className="space-y-2 mt-2">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <p className="font-bold text-slate-800">{n.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{n.desc}</p>
                    <span className="text-[10px] font-semibold text-slate-400 mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Developer User Pill */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            DEV
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-none">Shivam Dev</p>
            <p className="text-[10px] text-indigo-600 font-mono font-bold mt-0.5">Full Root Access</p>
          </div>
        </div>
      </div>
    </header>
  );
};
