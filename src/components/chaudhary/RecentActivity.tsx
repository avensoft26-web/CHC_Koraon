import React from 'react';
import { 
  Clock, 
  User, 
  IndianRupee, 
  ArrowRight,
  BedDouble,
  CheckCircle2
} from 'lucide-react';
import { useHospitalContext } from '../../context/HospitalContext';

interface RecentActivityProps {
  onViewAll?: () => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ onViewAll }) => {
  const { patients } = useHospitalContext();

  // Derive recent activities from real patient data
  const activities = React.useMemo(() => {
    const sorted = [...patients].sort((a, b) => {
      // Sort by admissionDate desc (approximate - treat as string comparison)
      return (b.admissionDate || '').localeCompare(a.admissionDate || '');
    });

    const result: Array<{
      id: string;
      type: string;
      time: string;
      title: string;
      desc: string;
      icon: typeof User;
      iconColor: string;
      bgColor: string;
      badge: string;
      badgeColor: string;
    }> = [];

    const seen = new Set<string>();
    for (const p of sorted) {
      if (result.length >= 4) break;
      if (seen.has(p.id)) continue;
      seen.add(p.id);

      const timeStr = p.admissionTime || '—';

      if (p.status === 'DISCHARGED') {
        result.push({
          id: p.id,
          type: 'discharge',
          time: timeStr,
          title: 'Patient discharged',
          desc: `${p.name} discharged from ${p.ward || 'ward'} ${p.bedNo !== '-' ? `• ${p.bedNo}` : ''}`,
          icon: CheckCircle2,
          iconColor: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          badge: 'Discharged',
          badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        });
      } else if (p.type === 'IPD') {
        result.push({
          id: p.id,
          type: 'patient',
          time: timeStr,
          title: 'New patient admitted',
          desc: `${p.name} admitted to ${p.ward || 'Ward'} ${p.bedNo !== '-' ? `• Bed ${p.bedNo}` : ''}`,
          icon: BedDouble,
          iconColor: 'text-indigo-600',
          bgColor: 'bg-indigo-50',
          badge: 'IPD Admitted',
          badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
        });
      } else {
        result.push({
          id: p.id,
          type: 'patient',
          time: timeStr,
          title: 'New OPD patient',
          desc: `${p.name} registered at Front Desk • ${p.doctor || 'Duty Doctor'}`,
          icon: User,
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          badge: 'OPD Token',
          badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
        });
      }
    }

    // If no patients yet, show placeholder
    if (result.length === 0) {
      return [{
        id: 'empty',
        type: 'info',
        time: '—',
        title: 'No recent activity',
        desc: 'Patient admissions will appear here in real-time',
        icon: IndianRupee,
        iconColor: 'text-slate-400',
        bgColor: 'bg-slate-50',
        badge: 'Awaiting',
        badgeColor: 'text-slate-500 bg-slate-50 border-slate-200',
      }];
    }

    return result;
  }, [patients]);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-200 shadow-xs flex flex-col justify-between h-full">
      <div className="z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight truncate">
                Recent Hospital Activity
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate">
                Live stream of counter actions &amp; updates
              </p>
            </div>
          </div>

          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 transition-all px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 cursor-pointer shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Timeline Entries */}
        <div className="bg-slate-50/70 rounded-xl p-2.5 px-3 my-2.5 border border-slate-200/70 relative">
          {/* Vertical timeline connector line */}
          <div className="absolute left-[25px] top-4 bottom-4 w-[2px] bg-slate-200/80 pointer-events-none" />

          <div className="space-y-2 relative">
            {activities.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2.5 group/row relative p-1.5 rounded-lg hover:bg-white transition-colors min-w-0"
                >
                  {/* Left Icon Node & Text */}
                  <div className="flex items-center gap-2.5 z-10 flex-1 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-md ${item.bgColor} ${item.iconColor} border border-slate-200/60 flex items-center justify-center shrink-0 z-10`}
                    >
                      <Icon className="w-3 h-3 stroke-[2.2]" />
                    </div>

                    <span className="text-[11px] font-mono font-medium text-slate-400 whitespace-nowrap w-16 shrink-0">
                      {item.time}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {/* Right Badge */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge && (
                      <span className={`px-2 py-0.5 font-bold text-[10px] rounded-full border ${item.badgeColor} bg-white`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
