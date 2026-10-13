import React, { useState } from 'react';
import { 
  Stethoscope, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Check,
  Sparkles,
  Zap
} from 'lucide-react';

import { api } from '../../../services/api';
import { useAuthUser } from '../../../hooks/useAuthUser';

export interface WardOrder {
  id: string;
  doctor: string;
  patientName: string;
  bedNo: string;
  orderText: string;
  time: string;
  priority: 'STAT' | 'Routine' | 'Urgent';
  completed: boolean;
  completedAt?: string;
}

export const DoctorWardOrdersWidget: React.FC = () => {
  const [orders, setOrders] = useState<WardOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const currentUser = useAuthUser();

  React.useEffect(() => {
    let mounted = true;
    // Ward round orders are only shown when they really exist in MongoDB
    api.wardOrders.getAll()
      .then((res: any) => {
        if (!mounted) return;
        if (res?.success && Array.isArray(res.orders)) {
          setOrders(res.orders.map((o: any) => ({
            id: o._id || o.id,
            doctor: o.doctor || "—",
            patientName: o.patientName || "—",
            bedNo: o.bedNo || "—",
            orderText: o.orderText || "",
            time: o.time || "—",
            priority: o.priority || "Routine",
            completed: !!o.completed,
            completedAt: o.completedAt,
          })));
          setLoadError(null);
        } else {
          throw new Error("Unable to load ward orders");
        }
      })
      .catch((err: any) => {
        if (!mounted) return;
        setLoadError(err?.message || "Unable to load ward orders");
      })
      .finally(() => { if (mounted) setIsLoading(false); });

    return () => { mounted = false; };
  }, []);

  const toggleOrder = async (orderId: string) => {
    const target = orders.find(o => o.id === orderId);
    if (!target) return;
    const newCompleted = !target.completed;
    const completedByStr = currentUser?.name || 'Staff';
    const completedAtStr = newCompleted ? `${completedByStr} (Just Now)` : undefined;

    setOrders(orders.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          completed: newCompleted,
          completedAt: completedAtStr,
        };
      }
      return ord;
    }));

    try {
      await api.wardOrders.complete(orderId, {
        completed: newCompleted,
        completedBy: completedByStr,
        completedAt: completedAtStr
      });
    } catch {}
  };

  const pendingCount = orders.filter(o => !o.completed).length;
  const completedCount = orders.filter(o => o.completed).length;

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-3 sm:px-3.5 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center shrink-0">
              <Stethoscope className="w-3.5 h-3.5 stroke-[2.4]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 tracking-tight truncate">
                  Doctor Ward Round Orders
                </h3>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-200 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                  Active Directives
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 truncate">
                Attending Physicians Clinical Directives & STAT Instructions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-rose-600" />
              <span>{pendingCount} Pending</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
              {completedCount} Done
            </span>
          </div>
        </div>

        {/* Orders list (Clean SaaS items) */}
        <div className="mt-2.5 space-y-2 max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400 font-semibold">
              Loading ward round orders…
            </div>
          ) : loadError ? (
            <div className="py-8 text-center text-xs text-rose-500 font-semibold">
              {loadError}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center">
              <Stethoscope className="w-7 h-7 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-semibold">No ward round orders yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Orders issued by doctors will appear here.
              </p>
            </div>
          ) : orders.map((ord) => (
            <div
              key={ord.id}
              onClick={() => toggleOrder(ord.id)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 select-none ${
                ord.completed
                  ? 'bg-slate-50/70 border-slate-200/80 text-slate-400'
                  : ord.priority === 'STAT'
                  ? 'bg-rose-50/30 border-rose-200 hover:border-rose-300'
                  : ord.priority === 'Urgent'
                  ? 'bg-amber-50/30 border-amber-200 hover:border-amber-300'
                  : 'bg-slate-50/40 hover:bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {/* Checkbox button */}
              <div 
                className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                  ord.completed 
                    ? 'bg-teal-600 text-white' 
                    : 'border border-slate-300 hover:border-teal-500 bg-white'
                }`}
                title={ord.completed ? 'Mark pending' : 'Mark completed'}
              >
                {ord.completed && <Check className="w-3 h-3 stroke-[3]" />}
              </div>

              {/* Order Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`font-mono text-[9.5px] font-bold px-1.5 py-0.2 rounded text-white shrink-0 ${
                      ord.bedNo.startsWith('ICU')
                        ? 'bg-rose-600'
                        : ord.bedNo.startsWith('ET')
                        ? 'bg-amber-600'
                        : 'bg-slate-800'
                    }`}>
                      {ord.bedNo}
                    </span>
                    <span className={`font-bold text-xs truncate ${ord.completed ? 'text-slate-500' : 'text-slate-900'}`}>
                      {ord.patientName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider flex items-center gap-1 ${
                      ord.priority === 'STAT' 
                        ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                        : ord.priority === 'Urgent'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {ord.priority === 'STAT' && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>}
                      {ord.priority === 'Urgent' && <Clock className="w-2.5 h-2.5" />}
                      <span>{ord.priority}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {ord.time}
                    </span>
                  </div>
                </div>

                <p className={`text-xs mt-1 leading-snug ${
                  ord.completed 
                    ? 'line-through text-slate-400 font-normal' 
                    : 'text-slate-800 font-semibold'
                }`}>
                  {ord.orderText}
                </p>

                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Stethoscope className="w-2.5 h-2.5 text-slate-400" />
                    <span>Ordered by: <strong className="text-slate-700 font-medium">{ord.doctor}</strong></span>
                  </span>
                  {ord.completed && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Done by {ord.completedAt}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clean Bottom Actions Strip */}
      <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-500"></span>
          <span className="text-[11px] text-slate-500 font-medium">
            Doctor Rounds Synchronized
          </span>
        </div>
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-[11px] font-semibold border border-slate-200">
          <Check className="w-3 h-3 text-slate-500 stroke-[2.5]" />
          <span>Tap order to toggle status</span>
        </div>
      </div>
    </div>
  );
};
