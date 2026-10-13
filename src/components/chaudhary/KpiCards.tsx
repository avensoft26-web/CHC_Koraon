import React from 'react';
import { 
  Users, 
  Building2, 
  CheckCircle2, 
  CalendarPlus,
  ArrowUpRight,
  BedDouble
} from 'lucide-react';

import { useHospitalContext } from '../../context/HospitalContext';
import { 
  emptyHospitalBedsSummary,
  fetchHospitalBedsSummary,
  HospitalBedsSummary 
} from './ChaudharyBedsWardsView';
import { subscribeToHmsEvent } from '../../services/realtime';

export const KpiCards: React.FC = () => {
  const { patients } = useHospitalContext();
  const [bedSummary, setBedSummary] = React.useState<HospitalBedsSummary>(emptyHospitalBedsSummary);

  React.useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const summary = await fetchHospitalBedsSummary();
        if (isMounted) setBedSummary(summary);
      } catch {
        // Bed summary unavailable — the cards fall back to zeroed live values
      }
    };

    load();

    // Re-fetch instantly on any socket or local change
    const unsubBeds = subscribeToHmsEvent('bed:updated', () => load());
    const unsubSettings = subscribeToHmsEvent('settings:updated', () => load());
    const unsubAdmit = subscribeToHmsEvent('patient:admitted', () => load());
    const unsubDischarge = subscribeToHmsEvent('patient:discharged', () => load());

    const handleUpdate = () => load();
    window.addEventListener('chaudhary_beds_updated', handleUpdate);
    return () => {
      isMounted = false;
      unsubBeds();
      unsubSettings();
      unsubAdmit();
      unsubDischarge();
      window.removeEventListener('chaudhary_beds_updated', handleUpdate);
    };
  }, []);

  const totalPatients = patients.length;
  const opdCount = patients.filter(p => p.type === 'OPD').length;
  const ipdCount = patients.filter(p => p.type === 'IPD').length;
  const dischargedCount = patients.filter(p => p.status === 'DISCHARGED').length;
  const activeAdmissions = patients.filter(p => p.status !== 'DISCHARGED').length;
  
  const totalHospitalBeds = bedSummary.totalBeds;
  const occupiedBedsInWards = bedSummary.occupiedBeds;
  const occupancyRate = bedSummary.occupancyPct;
  const freeBeds = bedSummary.availableBeds;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      
      {/* 1. TOTAL PATIENTS */}
      <div className="bg-white border border-slate-200/90 hover:border-blue-300 rounded-xl p-3 sm:px-3.5 shadow-xs hover:shadow-sm transition-all duration-150 flex flex-col justify-between group">
        <div>
          {/* Header: Icon + Badge */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200/80">
              <ArrowUpRight className="w-2.5 h-2.5 stroke-[2.5]" />
              <span>Live DB</span>
            </span>
          </div>

          {/* Title */}
          <p className="text-[11px] font-semibold text-slate-500 tracking-wide uppercase leading-tight">
            Total Patients
          </p>

          {/* Metric */}
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans leading-tight">
              {totalPatients}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              registered
            </span>
          </div>
        </div>

        {/* Footer Sub-badges */}
        <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[10px] font-medium text-slate-400 truncate">
            Registry Breakdown
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[9.5px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200/60">
              {opdCount} OPD
            </span>
            <span className="text-[9.5px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200/60">
              {ipdCount} IPD
            </span>
          </div>
        </div>
      </div>

      {/* 2. CURRENTLY ADMITTED */}
      <div className="bg-white border border-slate-200/90 hover:border-indigo-300 rounded-xl p-3 sm:px-3.5 shadow-xs hover:shadow-sm transition-all duration-150 flex flex-col justify-between group">
        <div>
          {/* Header: Icon + Badge */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.2 rounded-full border border-indigo-200/80">
              <BedDouble className="w-2.5 h-2.5" />
              <span>{occupancyRate}% Occupancy</span>
            </span>
          </div>

          {/* Title */}
          <p className="text-[11px] font-semibold text-slate-500 tracking-wide uppercase leading-tight">
            Currently Admitted
          </p>

          {/* Metric */}
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans leading-tight">
              {occupiedBedsInWards}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              in wards
            </span>
          </div>
        </div>

        {/* Footer Progress Strip */}
        <div className="pt-2 mt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 mb-0.5">
            <span>{occupiedBedsInWards} of {totalHospitalBeds} Active Beds</span>
            <span className="font-bold text-indigo-700">{freeBeds} Free</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${occupancyRate}%` }} />
          </div>
        </div>
      </div>

      {/* 3. DISCHARGED */}
      <div className="bg-white border border-slate-200/90 hover:border-emerald-300 rounded-xl p-3 sm:px-3.5 shadow-xs hover:shadow-sm transition-all duration-150 flex flex-col justify-between group">
        <div>
          {/* Header: Icon + Badge */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200/80">
              <span>All Cleared</span>
            </span>
          </div>

          {/* Title */}
          <p className="text-[11px] font-semibold text-slate-500 tracking-wide uppercase leading-tight">
            Discharged Patients
          </p>

          {/* Metric */}
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans leading-tight">
              {dischargedCount}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              completed
            </span>
          </div>
        </div>

        {/* Footer Context */}
        <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[10px] font-medium text-slate-400 truncate">
            Discharge Log
          </span>
          <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
            ✓ Logged in Core
          </span>
        </div>
      </div>

      {/* 4. TODAY'S ADMISSIONS */}
      <div className="bg-white border border-slate-200/90 hover:border-amber-300 rounded-xl p-3 sm:px-3.5 shadow-xs hover:shadow-sm transition-all duration-150 flex flex-col justify-between group">
        <div>
          {/* Header: Icon + Badge */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <CalendarPlus className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Shift Active</span>
            </span>
          </div>

          {/* Title */}
          <p className="text-[11px] font-semibold text-slate-500 tracking-wide uppercase leading-tight">
            Active Admissions
          </p>

          {/* Metric */}
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans leading-tight">
              {activeAdmissions}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              active now
            </span>
          </div>
        </div>

        {/* Footer Context */}
        <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[10px] font-medium text-slate-400 truncate">
            Intake Counter
          </span>
          <span className="text-[9.5px] font-bold text-slate-600 bg-slate-50 px-1.5 py-0.2 rounded border border-slate-200">
            Ready for Walk-in
          </span>
        </div>
      </div>

    </div>
  );
};
