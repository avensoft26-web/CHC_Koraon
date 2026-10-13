import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Menu, 
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';
import { api } from '../../../services/api';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { isCriticalReading, describeReading } from '../../../utils/vitalAlerts';

interface StaffAlert {
  id: string;
  type: 'critical' | 'info';
  bed: string;
  title: string;
  time: string;
  patient: string;
}

interface ChaudharyStaffHeaderProps {
  activeTab?: string;
  onLogout?: () => void;
  onSearchChange?: (val: string) => void;
  onToggleSidebar?: () => void;
  onOpenProfile?: () => void;
  onTriggerCodeBlue?: () => void;
}

export const ChaudharyStaffHeader: React.FC<ChaudharyStaffHeaderProps> = ({
  activeTab = 'Dashboard',
  onSearchChange,
  onToggleSidebar,
  onOpenProfile,
  onTriggerCodeBlue,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const user = useAuthUser();

  // Real ward alerts derived from recorded vitals and low pharmacy stock
  const [notifications, setNotifications] = useState<StaffAlert[]>([]);
  const [alertsLoaded, setAlertsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [vitalsRes, medsRes] = await Promise.all([
        api.vitals.getAll().catch(() => null),
        api.medicines.getAll().catch(() => null),
      ]);
      if (!mounted) return;

      const alerts: StaffAlert[] = [];

      // Only the most recent reading per patient is evaluated
      if (vitalsRes?.success && Array.isArray(vitalsRes.vitals)) {
        const latestByPatient = new Map<string, any>();
        vitalsRes.vitals.forEach((v: any) => {
          const key = v?.patient_id ? String(v.patient_id) : null;
          if (key && !latestByPatient.has(key)) latestByPatient.set(key, v);
        });
        latestByPatient.forEach((v: any, key: string) => {
          if (!isCriticalReading(v)) return;
          alerts.push({
            id: `vital-${key}`,
            type: 'critical',
            bed: v.bed_no || '—',
            patient: v.patient_name || 'Patient',
            title: `Abnormal vitals: ${describeReading(v) || 'out of range'}`,
            time: v.recorded_at || '—',
          });
        });
      }

      if (medsRes?.success && Array.isArray(medsRes.medicines)) {
        medsRes.medicines.forEach((m: any) => {
          if (typeof m.stock === 'number' && m.stock <= 10) {
            alerts.push({
              id: `med-${m._id || m.name}`,
              type: 'info',
              bed: 'Pharmacy',
              patient: m.name || 'Medicine',
              title: `Low stock: ${m.stock} ${m.unit || 'units'} remaining`,
              time: '—',
            });
          }
        });
      }

      setNotifications(alerts);
      setAlertsLoaded(true);
    })();
    return () => { mounted = false; };
  }, []);

  const userInitials = user.name
    ? user.name.split(/\s+/).slice(0, 2).map((n: string) => n[0]?.toUpperCase() ?? '').join('')
    : '?';

  return (
    <header className="h-16 px-4 sm:px-6 bg-white border-b border-slate-200/80 flex items-center justify-between gap-3 flex-shrink-0 z-30 shadow-xs relative">
      {/* 1. Left Section: Hamburger Toggle + Page Title */}
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

      {/* 2. Right Section: Notifications + Nurse Profile */}
      <div className="flex items-center gap-2.5">
        {/* Notification Bell with Critical Alert Counter */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(prev => !prev)}
            className="w-9 h-9 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center relative transition-all shadow-2xs active:scale-95 cursor-pointer"
            aria-label="Staff Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9.5px] font-bold rounded-full flex items-center justify-center shadow-xs">
              {notifications.length}
            </span>
          </button>

          {/* Notifications Dropdown Modal / Flyout */}
          {showNotifications && (
            <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Ward & Vitals Alerts</h4>
                </div>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-2 space-y-2 max-h-72 overflow-y-auto pr-1">
                {!alertsLoaded ? (
                  <div className="py-6 text-center text-xs text-slate-400 font-semibold">
                    Checking ward alerts…
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-6 text-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-500 font-semibold">No active alerts</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Critical vitals and low-stock warnings will appear here.
                    </p>
                  </div>
                ) : notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                      n.type === 'critical' 
                        ? 'bg-rose-50/60 border-rose-200 text-rose-950' 
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      n.type === 'critical' ? 'bg-rose-600 animate-ping' : 'bg-amber-500'
                    }`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[11px] text-slate-800">{n.bed} • {n.patient}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
                      </div>
                      <p className="font-semibold text-slate-900 text-xs mt-0.5">{n.title}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 text-center">
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                >
                  Close & Acknowledge All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div 
          onClick={onOpenProfile}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:border-emerald-300 rounded-xl p-1 pr-2.5 shadow-2xs hover:bg-slate-50/80 transition-all cursor-pointer active:scale-98"
          title="Open Staff Profile"
        >
          <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-[11px] font-bold shrink-0">
            {userInitials}
          </span>
          <div className="text-left leading-tight hidden lg:block">
            <p className="text-xs font-bold text-[#172554]">{user.name || 'Staff member'}</p>
            <p className="text-[9px] text-emerald-700 font-semibold">{user.role || 'Staff'}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </header>
  );
};
