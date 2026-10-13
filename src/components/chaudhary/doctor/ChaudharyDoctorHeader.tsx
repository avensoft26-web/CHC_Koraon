import React, { useState } from 'react';
import { 
  Bell, 
  Menu, 
  X,
  UserCheck,
  CalendarOff
} from 'lucide-react';
import { DoctorNavTab } from './ChaudharyDoctorSidebar';
import { useDoctorAvailabilityMap, updateDoctorOverride } from '../../../utils/doctorAvailability';
import { useAuthUser } from '../../../hooks/useAuthUser';

interface ChaudharyDoctorHeaderProps {
  activeTab: DoctorNavTab;
  onToggleSidebar: () => void;
  onLogout?: () => void;
  onQuickConsult?: () => void;
  userId?: string;
  doctorName?: string;
}

export const ChaudharyDoctorHeader: React.FC<ChaudharyDoctorHeaderProps> = ({
  userId,
  activeTab,
  onToggleSidebar,
  onLogout,
  onQuickConsult,
  doctorName,
}) => {
  const user = useAuthUser();
  const displayName = doctorName || user.name || 'Consultant Doctor';
  const [showNotifications, setShowNotifications] = useState(false);
  const availabilityMap = useDoctorAvailabilityMap();
  const [toastStatus, setToastStatus] = useState<string | null>(null);

  // Compute doctor's current status from storage
  const currentOverride = (userId ? availabilityMap[userId] : undefined) || (displayName ? availabilityMap[displayName] : undefined);
  const isAvailable = (currentOverride?.status || 'Active') === 'Active';

  const handleToggleMyAvailability = () => {
    const nextStatus = isAvailable ? 'On Leave' : 'Active';
    if (userId) {
      updateDoctorOverride(userId, { status: nextStatus }, displayName);
    }
    if (displayName) {
      updateDoctorOverride(displayName, { status: nextStatus }, displayName);
    }
    setToastStatus(`Your status updated to: ${nextStatus}`);
    setTimeout(() => setToastStatus(null), 3000);
  };

  const doctorNotifications = [
    {
      id: 1,
      title: 'Critical Lab Alert - Troponin-I',
      desc: 'Patient Rajesh Verma (UHID-2024-089) Troponin-I > 1.4 ng/mL',
      time: '2 mins ago',
      type: 'urgent',
    },
    {
      id: 2,
      title: 'ICU Ward Call - Bed 04',
      desc: 'Staff Nurse requesting review of Post-CABG telemetry',
      time: '12 mins ago',
      type: 'alert',
    },
    {
      id: 3,
      title: 'OPD Queue Update',
      desc: '4 new cardiac consultation appointments added for afternoon slot',
      time: '35 mins ago',
      type: 'info',
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

      {/* 2. Right: Notification + Doctor Avatar */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Doctor Self-Service Availability Toggle Switch */}
        <button
          onClick={handleToggleMyAvailability}
          title={isAvailable ? "Click to Mark Yourself 'On Leave'" : "Click to Mark Yourself 'Available (On Duty)'"}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer ${
            isAvailable
              ? 'bg-emerald-50 text-emerald-850 border-emerald-300 hover:bg-emerald-100'
              : 'bg-rose-50 text-rose-850 border-rose-300 hover:bg-rose-100'
          }`}
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="hidden sm:inline font-mono font-semibold text-[11px] tracking-tight">
            {isAvailable ? 'Available (On Duty)' : 'On Leave (Off Duty)'}
          </span>
          <span className="sm:hidden font-semibold text-[11px]">
            {isAvailable ? 'Active' : 'Leave'}
          </span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center relative transition-all shadow-2xs active:scale-95 cursor-pointer"
            aria-label="Doctor Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* Notifications Dropdown Modal */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
                    Clinical Alerts
                  </h3>
                </div>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {doctorNotifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                        {n.type === 'urgent' && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Doctor Capsule Badge */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200">
          <div className="relative w-9 h-9 min-w-[36px] min-h-[36px] rounded-full overflow-hidden border border-emerald-400 shadow-2xs flex-shrink-0">
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={displayName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-800 text-white font-bold flex items-center justify-center text-xs">
                {displayName ? displayName.replace(/^Dr\.\s*/i, '').slice(0, 2).toUpperCase() : 'DR'}
              </div>
            )}
          </div>
          <div className="hidden lg:block text-left leading-tight">
            <p className="text-xs font-semibold text-slate-900">{displayName}</p>
            <p className="text-[11px] font-normal text-emerald-800">{user.department || 'Medical Officer'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
