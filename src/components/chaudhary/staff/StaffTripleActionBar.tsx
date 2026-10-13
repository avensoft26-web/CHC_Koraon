import React from 'react';
import { UserPlus, Users, FileText, ArrowRight } from 'lucide-react';
import { StaffNavTab } from './ChaudharyStaffSidebar';

interface StaffTripleActionBarProps {
  activeTab: StaffNavTab;
  onSelectTab: (tab: StaffNavTab) => void;
}

export const StaffTripleActionBar: React.FC<StaffTripleActionBarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const items = [
    {
      id: 'Admit' as StaffNavTab,
      label: 'Admit Patient',
      icon: UserPlus,
      iconBg: 'bg-emerald-600 text-white',
      hoverBorder: 'hover:border-emerald-500 hover:bg-emerald-50/10',
      activeBorder: 'border-emerald-600 bg-emerald-50/25 ring-2 ring-emerald-600/15',
      arrowColor: 'group-hover:text-emerald-600',
    },
    {
      id: 'Patients' as StaffNavTab,
      label: 'Patients',
      icon: Users,
      iconBg: 'bg-blue-600 text-white',
      hoverBorder: 'hover:border-blue-500 hover:bg-blue-50/10',
      activeBorder: 'border-blue-600 bg-blue-50/25 ring-2 ring-blue-600/15',
      arrowColor: 'group-hover:text-blue-600',
    },
    {
      id: 'Notes' as StaffNavTab,
      label: 'Daily Notes',
      icon: FileText,
      iconBg: 'bg-indigo-600 text-white',
      hoverBorder: 'hover:border-indigo-500 hover:bg-indigo-50/10',
      activeBorder: 'border-indigo-600 bg-indigo-50/25 ring-2 ring-indigo-600/15',
      arrowColor: 'group-hover:text-indigo-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTab(item.id)}
            className={`w-full h-16 sm:h-20 px-4 sm:px-5 rounded-2xl border-2 transition-all duration-150 text-left flex items-center justify-between gap-3 cursor-pointer group shadow-xs hover:shadow-md ${
              isActive
                ? `${item.activeBorder}`
                : `bg-white border-slate-200/90 ${item.hoverBorder}`
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-150 group-hover:scale-105 ${item.iconBg}`}
              >
                <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.3]" />
              </div>

              <span className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-slate-950 tracking-tight truncate">
                {item.label}
              </span>
            </div>

            <ArrowRight className={`w-5 h-5 text-slate-300 ${item.arrowColor} group-hover:translate-x-1 transition-all shrink-0 stroke-[2.4]`} />
          </button>
        );
      })}
    </div>
  );
};





