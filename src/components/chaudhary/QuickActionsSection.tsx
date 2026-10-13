import React from 'react';
import { 
  Zap, 
  Layers, 
  CalendarPlus, 
  FileText, 
  FlaskConical, 
  Users, 
  Stethoscope, 
  BedDouble, 
  Pill, 
  CreditCard,
  ArrowRight
} from 'lucide-react';

interface QuickActionsSectionProps {
  onNewAppointment?: () => void;
  onCreateInvoice?: () => void;
  onLabReport?: () => void;
  onManageStaff?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  onNewAppointment,
  onCreateInvoice,
  onLabReport,
  onManageStaff,
  onNavigateTab,
}) => {
  const quickActions = [
    {
      id: 'appointment',
      title: 'New Appointment',
      subtitle: 'Schedule OPD Visit',
      icon: CalendarPlus,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      onClick: onNewAppointment,
    },
    {
      id: 'invoice',
      title: 'Create Invoice',
      subtitle: 'Billing & Payments',
      icon: FileText,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      onClick: onCreateInvoice,
    },
    {
      id: 'lab',
      title: 'Lab Reports',
      subtitle: 'Pathology & Scans',
      icon: FlaskConical,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      onClick: onLabReport,
    },
    {
      id: 'staff',
      title: 'Doctors & Staff',
      subtitle: 'Roster & Duty Chart',
      icon: Users,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
      onClick: onManageStaff,
    },
  ];

  const departmentShortcuts = [
    { name: 'Patients', tabId: 'Patients', icon: Users, iconColor: 'text-emerald-600', bgColor: 'bg-emerald-50/70' },
    { name: 'Doctors', tabId: 'Doctors & Staff', icon: Stethoscope, iconColor: 'text-blue-600', bgColor: 'bg-blue-50/70' },
    { name: 'Beds & Wards', tabId: 'Beds & Wards', icon: BedDouble, iconColor: 'text-amber-600', bgColor: 'bg-amber-50/70' },
    { name: 'Pharmacy', tabId: 'Pharmacy', icon: Pill, iconColor: 'text-purple-600', bgColor: 'bg-purple-50/70' },
    { name: 'Lab Tests', tabId: 'Lab & Reports', icon: FlaskConical, iconColor: 'text-rose-600', bgColor: 'bg-rose-50/70' },
    { name: 'Billing', tabId: 'Billing & Payments', icon: CreditCard, iconColor: 'text-sky-600', bgColor: 'bg-sky-50/70' },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-200 shadow-xs flex flex-col justify-between h-full">
      <div className="z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight truncate">
                Quick Actions & Shortcuts
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate">
                Common desk tasks and department navigation
              </p>
            </div>
          </div>

          <span className="inline-flex items-center text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
            Fast Access
          </span>
        </div>

        {/* 1. Primary Action Buttons - 2x2 SaaS Tiles Grid */}
        <div className="grid grid-cols-2 gap-2 my-2.5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className="p-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 transition-all text-left flex items-center justify-between group active:scale-[0.98] cursor-pointer min-w-0"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className={`w-7 h-7 rounded-lg ${action.bgColor} border border-slate-200/60 flex items-center justify-center shrink-0`}>
                    <Icon className={`w-3.5 h-3.5 ${action.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-emerald-700 transition-colors leading-tight">
                      {action.title}
                    </p>
                    <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5 truncate font-medium">
                      {action.subtitle}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
              </button>
            );
          })}
        </div>

        {/* 2. Department Shortcuts Grid */}
        <div className="bg-slate-50/70 rounded-xl p-2.5 px-3 border border-slate-200/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              Department Modules
            </span>
            <span className="text-[10px] font-semibold text-slate-400">Click to open</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {departmentShortcuts.map((dept, idx) => {
              const Icon = dept.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onNavigateTab && onNavigateTab(dept.tabId)}
                  className="p-2 rounded-lg bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95 text-center cursor-pointer min-w-0"
                >
                  <div className={`w-6 h-6 rounded-md ${dept.bgColor} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-3 h-3 ${dept.iconColor}`} />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-800 truncate w-full block">
                    {dept.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
