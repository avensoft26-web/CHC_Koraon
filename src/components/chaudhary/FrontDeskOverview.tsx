import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  User, 
  Calendar, 
  CalendarPlus, 
  Users, 
  ArrowRight,
  Plus,
  Clock,
  Stethoscope,
  Activity
} from 'lucide-react';
import { useAuthUser } from '../../hooks/useAuthUser';
import { useHospitalContext } from '../../context/HospitalContext';
import { api } from '../../services/api';
import { fetchHospitalDoctors } from '../../utils/hospitalDoctors';

interface FrontDeskOverviewProps {
  onNewAdmission?: () => void;
  onViewPatientList?: () => void;
}

export const FrontDeskOverview: React.FC<FrontDeskOverviewProps> = ({
  onNewAdmission,
  onViewPatientList,
}) => {
  const user = useAuthUser();
  const { patients } = useHospitalContext();
  const [appointmentsCount, setAppointmentsCount] = useState<number>(0);
  const [waitingQueueCount, setWaitingQueueCount] = useState<number>(0);
  const [dutyDoctor, setDutyDoctor] = useState<string>('');

  useEffect(() => {
    fetchHospitalDoctors()
      .then(list => { if (list.length > 0) setDutyDoctor(list[0].name); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    api.appointments.getAll().then((res) => {
      if (res?.success && Array.isArray(res.appointments)) {
        setAppointmentsCount(res.appointments.length);
        const waiting = res.appointments.filter((a: any) => a.status === 'Waiting' || a.status === 'Pending').length;
        setWaitingQueueCount(waiting);
      }
    }).catch(() => {});
  }, []);

  const totalPatients = patients.length;
  const ipdAdmissions = patients.filter(p => p.status !== 'DISCHARGED' && (p.status === 'ADMITTED' || p.type === 'IPD')).length;
  const currentDateStr = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-200 shadow-xs flex flex-col justify-between h-full">
      <div className="flex flex-col justify-between flex-1 min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight truncate leading-tight">
                Front Desk Overview
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate leading-tight">
                Live counter summary & status
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Shift Active
          </span>
        </div>

        {/* Quick Highlights Strip */}
        <div className="grid grid-cols-3 gap-2 my-2.5 shrink-0">
          <div className="min-w-0 bg-slate-50 border border-slate-200/80 rounded-xl p-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate block leading-none">Queue</p>
              <p className="text-xs font-bold text-slate-900 truncate block mt-0.5 leading-none">{waitingQueueCount} Waiting</p>
            </div>
          </div>

          <div className="min-w-0 bg-slate-50 border border-slate-200/80 rounded-xl p-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate block leading-none">Appts</p>
              <p className="text-xs font-bold text-slate-900 truncate block mt-0.5 leading-none">{appointmentsCount} Booked</p>
            </div>
          </div>

          <div className="min-w-0 bg-slate-50 border border-slate-200/80 rounded-xl p-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate block leading-none">Emergency</p>
              <p className="text-xs font-bold text-purple-700 truncate block mt-0.5 leading-none">Ready</p>
            </div>
          </div>
        </div>

        {/* Key Values List - Clean SaaS Rows */}
        <div className="bg-slate-50/70 rounded-xl p-2.5 px-3 border border-slate-200/70 divide-y divide-slate-200/60 flex-1 flex flex-col justify-around">
          {/* Row 1: Receptionist */}
          <div className="py-1 flex items-center justify-between text-xs gap-2 min-w-0">
            <div className="flex items-center gap-2 text-slate-600 shrink-0">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-600">Receptionist</span>
            </div>
            <span className="font-semibold text-slate-900 truncate text-right">
              {user.name || 'Front Desk Staff'}
            </span>
          </div>

          {/* Row 2: Date */}
          <div className="py-1 flex items-center justify-between text-xs gap-2 min-w-0">
            <div className="flex items-center gap-2 text-slate-600 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-600">Current Date</span>
            </div>
            <span className="font-semibold text-slate-900 truncate text-right">
              {currentDateStr}
            </span>
          </div>

          {/* Row 3: Duty Doctor */}
          <div className="py-1 flex items-center justify-between text-xs gap-2 min-w-0">
            <div className="flex items-center gap-2 text-slate-600 shrink-0">
              <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-600">Duty Doctor</span>
            </div>
            <span className="font-semibold text-slate-900 truncate text-right">
              {dutyDoctor || 'No duty doctor configured'}
            </span>
          </div>

          {/* Row 4: Today's Admissions */}
          <div className="py-1 flex items-center justify-between text-xs gap-2 min-w-0">
            <div className="flex items-center gap-2 text-slate-600 shrink-0">
              <CalendarPlus className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-600">Active Inpatients</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-mono font-bold text-slate-900 text-xs">
                {ipdAdmissions}
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                In Ward Beds
              </span>
            </div>
          </div>

          {/* Row 5: Total Patients */}
          <div className="py-1 flex items-center justify-between text-xs gap-2 min-w-0">
            <div className="flex items-center gap-2 text-slate-600 shrink-0">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-600">Total Registered</span>
            </div>
            <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md text-[11px] border border-blue-200 shrink-0">
              {totalPatients} Patients
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="pt-3 mt-2.5 grid grid-cols-2 gap-2 border-t border-slate-100 z-10 shrink-0">
        <button
          onClick={onNewAdmission}
          className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Admission</span>
          <ArrowRight className="w-3 h-3" />
        </button>

        <button
          onClick={onViewPatientList}
          className="w-full py-2 px-3 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-200 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <User className="w-3.5 h-3.5 text-blue-600" />
          <span>Patient List</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
