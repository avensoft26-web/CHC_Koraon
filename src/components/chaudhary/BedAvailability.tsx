import React from 'react';
import { 
  BedDouble, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  Layers 
} from 'lucide-react';

import { 
  emptyHospitalBedsSummary,
  fetchHospitalBedsSummary,
  HospitalBedsSummary 
} from './ChaudharyBedsWardsView';
import { subscribeToHmsEvent } from '../../services/realtime';

interface BedAvailabilityProps {
  onViewWards?: () => void;
}

export const BedAvailability: React.FC<BedAvailabilityProps> = ({ onViewWards }) => {
  const [bedSummary, setBedSummary] = React.useState<HospitalBedsSummary>(emptyHospitalBedsSummary);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const summary = await fetchHospitalBedsSummary();
        if (isMounted) {
          setBedSummary(summary);
          setLoadError(null);
        }
      } catch (err: any) {
        if (isMounted) setLoadError(err?.message || 'Unable to load bed availability');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();

    // Refresh instantly on any socket or local change
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

  const icuWard = bedSummary.wardsBreakdown.find(w => w.name.toLowerCase().includes('icu'));
  const maleWard = bedSummary.wardsBreakdown.find(w => w.name.toLowerCase().includes('male'));
  const femaleWard = bedSummary.wardsBreakdown.find(w => w.name.toLowerCase().includes('female'));
  const generalFreeBeds = (maleWard?.available || 0) + (femaleWard?.available || 0);

  // Donut chart calculations (circumference = 2 * PI * 38 ≈ 238.8)
  const circ = 238.8;
  const occLen = bedSummary.totalBeds > 0 ? (bedSummary.occupiedBeds / bedSummary.totalBeds) * circ : 0;
  const availLen = bedSummary.totalBeds > 0 ? (bedSummary.availableBeds / bedSummary.totalBeds) * circ : 0;
  const cleanLen = bedSummary.totalBeds > 0 ? (bedSummary.sanitizingBeds / bedSummary.totalBeds) * circ : 0;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-200 shadow-xs flex flex-col justify-between h-full">
      <div className="flex flex-col justify-between flex-1 min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
              <BedDouble className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight truncate leading-tight">
                Bed Availability
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate leading-tight">
                Live occupancy across all wards & ICU
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 shrink-0">
            Total Beds: {bedSummary.totalBeds}
          </span>
        </div>

        {/* Live data status */}
        {(isLoading || loadError) && (
          <div className="my-2 text-[11px] font-semibold text-center rounded-lg py-1.5 border">
            {isLoading ? (
              <span className="text-slate-400 bg-slate-50 border-slate-200">Loading live bed data...</span>
            ) : (
              <span className="text-rose-500 bg-rose-50 border-rose-200">{loadError}</span>
            )}
          </div>
        )}

        {/* Quick Highlights Strip */}
        <div className="grid grid-cols-3 gap-2 my-2.5 shrink-0">
          <div className="min-w-0 bg-slate-50 border border-slate-200/80 rounded-xl p-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate block leading-none">Vacant</p>
              <p className="text-xs font-bold text-slate-900 truncate block mt-0.5 leading-none">{bedSummary.availableBeds} Free</p>
            </div>
          </div>

          <div className="min-w-0 bg-slate-50 border border-slate-200/80 rounded-xl p-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate block leading-none">Occupied</p>
              <p className="text-xs font-bold text-slate-900 truncate block mt-0.5 leading-none">{bedSummary.occupiedBeds} Beds ({bedSummary.occupancyPct}%)</p>
            </div>
          </div>

          <div className="min-w-0 bg-slate-50 border border-slate-200/80 rounded-xl p-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate block leading-none">ICU Status</p>
              <p className="text-xs font-bold text-rose-600 truncate block mt-0.5 leading-none">{icuWard?.available ?? 0} Free {icuWard && icuWard.available === 0 ? '(Full)' : ''}</p>
            </div>
          </div>
        </div>

        {/* Donut Chart & Ward Breakdown Grid */}
        <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-200/70 flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3">
            {/* Donut Chart (5 cols) */}
            <div className="sm:col-span-5 flex items-center justify-center relative">
              <div className="w-20 h-20 relative flex items-center justify-center shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="11"
                  />
                  {/* Segment 1: Occupied (amber/rose) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="11"
                    strokeDasharray={`${occLen} ${circ}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                  />
                  {/* Segment 2: Available (emerald) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="11"
                    strokeDasharray={`${availLen} ${circ}`}
                    strokeDashoffset={`${-occLen}`}
                    strokeLinecap="round"
                  />
                  {/* Segment 3: Sanitizing (blue) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="11"
                    strokeDasharray={`${cleanLen} ${circ}`}
                    strokeDashoffset={`${-(occLen + availLen)}`}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Inner Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold text-slate-900 tracking-tight leading-none font-mono">
                    {bedSummary.availableBeds}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 mt-0.5">
                    Available
                  </span>
                </div>
              </div>
            </div>

            {/* Breakdown List (7 cols) */}
            <div className="sm:col-span-7 space-y-1.5">
              {bedSummary.wardsBreakdown.map((ward, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-slate-900 gap-2 min-w-0">
                    <div className="flex items-center gap-1.5 font-medium shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full ${ward.dotColor}`} />
                      <span className="text-xs text-slate-700">{ward.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-xs font-semibold text-slate-900">
                        {ward.occupied} / {ward.total} Occ
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        ward.pct > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-200/60 text-slate-500'
                      }`}>
                        {ward.pct}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200/80 rounded-full h-1 overflow-hidden">
                    {ward.pct > 0 && (
                      <div 
                        className={`h-1 rounded-full transition-all duration-300 ${ward.barColor}`} 
                        style={{ width: `${ward.pct}%` }} 
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-3 mt-2.5 flex items-center justify-between gap-2 border-t border-slate-100 z-10 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-xs font-medium text-slate-600 truncate">
            General wards have <strong className="text-slate-900 font-bold">{generalFreeBeds} free beds</strong> ready
          </span>
        </div>

        <button
          onClick={onViewWards}
          className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-200 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          <Layers className="w-3.5 h-3.5 text-rose-500" />
          <span>Ward Floor Map</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
