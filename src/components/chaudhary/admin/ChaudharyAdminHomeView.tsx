import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Building2, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  PieChart, 
  Wallet, 
  UserPlus, 
  Receipt, 
  History,
  DollarSign
} from 'lucide-react';
import { AdminNavTab } from './ChaudharyAdminSidebar';
import { useHospitalContext } from '../../../context/HospitalContext';
import { api } from '../../../services/api';
import { emptyHospitalBedsSummary, fetchHospitalBedsSummary, HospitalBedsSummary } from '../ChaudharyBedsWardsView';
import { subscribeToHmsEvent } from '../../../services/realtime';

interface ChaudharyAdminHomeViewProps {
  onNavigate: (tab: AdminNavTab) => void;
}

export const ChaudharyAdminHomeView: React.FC<ChaudharyAdminHomeViewProps> = ({ onNavigate }) => {
  const [activeActivityTab, setActiveActivityTab] = useState<'all' | 'admissions' | 'payments'>('all');
  const [hoveredDailyIdx, setHoveredDailyIdx] = useState<number | null>(null);
  const [dailyChartMode, setDailyChartMode] = useState<'census' | 'admissions'>('admissions');
  const [hoveredRevBar, setHoveredRevBar] = useState<'collected' | 'pending' | null>(null);
  const [hoveredDonutSegment, setHoveredDonutSegment] = useState<'paid' | 'due' | null>(null);
  const hospitalCtx = useHospitalContext();
  const patients = hospitalCtx?.patients || [];

  const [billings, setBillings] = useState<any[]>([]);
  const [bedSummary, setBedSummary] = useState<HospitalBedsSummary>(emptyHospitalBedsSummary);

  useEffect(() => {
    let isMounted = true;

    const loadBillings = () =>
      api.billing.getAll().then((res) => {
        if (res?.success && Array.isArray(res.billings) && isMounted) {
          setBillings(res.billings);
        }
      }).catch(() => {});

    const loadBeds = () =>
      fetchHospitalBedsSummary()
        .then((summary) => {
          if (isMounted) setBedSummary(summary);
        })
        .catch(() => {
          if (isMounted) setBedSummary(emptyHospitalBedsSummary);
        });

    loadBillings();
    loadBeds();

    // Re-fetch instantly on any socket or local change
    const unsubBeds = subscribeToHmsEvent('bed:updated', () => loadBeds());
    const unsubSettings = subscribeToHmsEvent('settings:updated', () => loadBeds());
    const unsubAdmit = subscribeToHmsEvent('patient:admitted', () => { loadBeds(); loadBillings(); });
    const unsubDischarge = subscribeToHmsEvent('patient:discharged', () => { loadBeds(); loadBillings(); });
    const unsubBilling = subscribeToHmsEvent('billing:paid', () => loadBillings());

    const handleBedUpdate = () => loadBeds();
    window.addEventListener('chaudhary_beds_updated', handleBedUpdate);

    return () => {
      isMounted = false;
      unsubBeds();
      unsubSettings();
      unsubAdmit();
      unsubDischarge();
      unsubBilling();
      window.removeEventListener('chaudhary_beds_updated', handleBedUpdate);
    };
  }, []);

  // 1. KPI Calculations from Live DB Data
  const totalPatientsCount = patients.length;
  const admittedCount = patients.filter(p => p.status === 'ADMITTED').length;
  const dischargedCount = patients.filter(p => p.status === 'DISCHARGED').length;

  const { totalCollected, totalPending, paidCount, dueCount } = useMemo(() => {
    let collected = 0;
    let pending = 0;
    let paid = 0;
    let due = 0;

    const patientMap = new Map();
    patients.forEach(p => patientMap.set(p.id, p));

    if (billings.length > 0) {
      billings.forEach((b: any) => {
        const pat = patientMap.get(b.patient_id);
        const paymentsTotal = (b.payments || []).reduce((acc: number, pay: any) => acc + (pay.amount || 0), 0);
        const pPaid = b.totalPaid !== undefined ? Number(b.totalPaid) : (paymentsTotal || (pat ? parseInt((pat.amountPaid || '0').replace(/[^0-9]/g, ''), 10) : 0));
        
        const itemsTotal = (b.items || []).reduce((acc: number, item: any) => acc + (Number(item.fee || 0) * Number(item.days || 1)), 0);
        const grandTotal = b.grandTotal !== undefined ? Number(b.grandTotal) : (itemsTotal > 0 ? Math.max(0, itemsTotal - Number(b.discount || 0)) : (pat ? parseInt((pat.totalBilled || '0').replace(/[^0-9]/g, ''), 10) : 0));
        
        const remaining = b.due !== undefined ? Number(b.due) : Math.max(0, grandTotal - pPaid);
        const isPaid = (b.payment_status === 'Paid') || (pat?.payStatus === 'PAID') || (remaining === 0 && grandTotal > 0);
        
        collected += pPaid;
        pending += remaining;
        if (isPaid) {
          paid += 1;
        } else {
          due += 1;
        }
      });
    } else {
      // Derive from patients
      patients.forEach(p => {
        const cleanPaid = parseInt((p.amountPaid || '0').replace(/[^0-9]/g, ''), 10) || 0;
        const cleanDue = parseInt((p.amountDue || '0').replace(/[^0-9]/g, ''), 10) || 0;
        collected += cleanPaid;
        pending += cleanDue;
        if (p.payStatus === 'PAID' || cleanDue === 0) {
          paid += 1;
        } else {
          due += 1;
        }
      });
    }

    return {
      totalCollected: collected,
      totalPending: pending,
      paidCount: paid,
      dueCount: due,
    };
  }, [billings, patients]);

  const totalInvoicesCount = paidCount + dueCount;

  // 2. Chart 1 Data: Last 7 Days Dynamic Daily Patients
  const opdCount = useMemo(() => patients.filter(p => p.type === 'OPD').length, [patients]);
  const ipdCount = useMemo(() => patients.filter(p => p.type === 'IPD').length, [patients]);

  const { last7Days, maxDailyVal, opdPoints, ipdPoints, opdSvgPath, opdAreaPath, ipdSvgPath, xPositions } = useMemo(() => {
    const days: Array<{ 
      label: string; 
      fullDate: string;
      opd: number; 
      ipd: number; 
      ipdActive: number;
      ipdNew: number;
    }> = [];
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayNum = d.getDate();
      const monthNum = d.getMonth();
      const yearNum = d.getFullYear();
      const label = i === 0 ? 'Today' : `${dayNum} ${monthNames[monthNum]}`;
      const fullDate = `${dayNum} ${monthNames[monthNum]} (${dayNames[d.getDay()]})`;

      let opdDay = 0;
      let ipdNewDay = 0;
      let ipdActiveCount = 0;

      const dayEnd = new Date(yearNum, monthNum, dayNum, 23, 59, 59).getTime();

      patients.forEach(p => {
        const rawDate = p.admissionDate || (p as any).admission_date || (p as any).createdAt;
        if (!rawDate) return;
        const pDate = new Date(rawDate);
        if (isNaN(pDate.getTime())) return;

        const isSameDay = pDate.getDate() === dayNum && pDate.getMonth() === monthNum && pDate.getFullYear() === yearNum;

        if (isSameDay) {
          if (p.type === 'OPD') opdDay++;
          else ipdNewDay++;
        }

        // Active IPD in hospital: Admitted on or before this day and status is ADMITTED
        if (p.type === 'IPD' && (p.status === 'ADMITTED' || p.status === 'ACTIVE')) {
          if (pDate.getTime() <= dayEnd) {
            ipdActiveCount++;
          }
        }
      });

      const ipdShown = dailyChartMode === 'census' ? ipdActiveCount : ipdNewDay;

      days.push({ 
        label, 
        fullDate,
        opd: opdDay, 
        ipd: ipdShown, 
        ipdActive: ipdActiveCount,
        ipdNew: ipdNewDay
      });
    }

    const rawMax = Math.max(...days.map(d => Math.max(d.opd, d.ipd)), 1);
    // Ensure effective max is at least 2 and even so ticks (max, max/2, 0) never duplicate
    const maxVal = rawMax <= 1 ? 2 : (rawMax % 2 !== 0 ? rawMax + 1 : rawMax);

    // X positions across SVG width 360: from x=30 to x=330
    const xPositionsList = [30, 80, 130, 180, 230, 280, 330];
    const opdPts = days.map((d, idx) => {
      const x = xPositionsList[idx];
      const y = Math.round(120 - (d.opd / maxVal) * 95);
      return { x, y, val: d.opd };
    });

    const ipdPts = days.map((d, idx) => {
      const x = xPositionsList[idx];
      const y = Math.round(120 - (d.ipd / maxVal) * 95);
      return { x, y, val: d.ipd };
    });

    // Build smooth bezier path for OPD
    let linePath = `M ${opdPts[0].x},${opdPts[0].y}`;
    for (let i = 0; i < opdPts.length - 1; i++) {
      const p0 = opdPts[i];
      const p1 = opdPts[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpX2 = cpX1;
      linePath += ` C ${cpX1},${p0.y} ${cpX2},${p1.y} ${p1.x},${p1.y}`;
    }
    const areaPath = `${linePath} L ${opdPts[opdPts.length - 1].x},120 L ${opdPts[0].x},120 Z`;

    // Build smooth bezier path for IPD
    let ipdLinePath = `M ${ipdPts[0].x},${ipdPts[0].y}`;
    for (let i = 0; i < ipdPts.length - 1; i++) {
      const p0 = ipdPts[i];
      const p1 = ipdPts[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpX2 = cpX1;
      ipdLinePath += ` C ${cpX1},${p0.y} ${cpX2},${p1.y} ${p1.x},${p1.y}`;
    }

    return {
      last7Days: days,
      maxDailyVal: maxVal,
      opdPoints: opdPts,
      ipdPoints: ipdPts,
      opdSvgPath: linePath,
      opdAreaPath: areaPath,
      ipdSvgPath: ipdLinePath,
      xPositions: xPositionsList,
    };
  }, [patients, dailyChartMode]);

  // 3. Chart 2 Data: Revenue Overview Dynamic Axis & Proportional Heights
  const revenueOverviewAxis = useMemo(() => {
    const highest = Math.max(totalCollected, totalPending, 50000);
    const targetStep = highest / 4;
    const cleanIntervals = [10000, 20000, 25000, 50000, 75000, 100000, 150000, 200000, 250000, 500000];
    const step = cleanIntervals.find(s => s >= targetStep) || Math.ceil(targetStep / 100000) * 100000;
    const max = step * 4;

    const formatLakh = (val: number) => {
      if (val === 0) return '₹0';
      if (val >= 100000) {
        const l = val / 100000;
        return l % 1 === 0 ? `₹${l}L` : `₹${l.toFixed(1)}L`;
      }
      return `₹${Math.round(val / 1000)}k`;
    };

    const ticks = [
      { val: max, label: formatLakh(max) },
      { val: step * 3, label: formatLakh(step * 3) },
      { val: step * 2, label: formatLakh(step * 2) },
      { val: step * 1, label: formatLakh(step * 1) },
      { val: 0, label: '₹0' },
    ];

    return { max, step, ticks };
  }, [totalCollected, totalPending]);

  const maxRevAxis = revenueOverviewAxis.max;
  const maxPlotHeight = 120; // Max height in px for bar so badge and tooltip fit comfortably above
  const collectedBarHeight = totalCollected > 0 ? Math.max(8, Math.min(maxPlotHeight, Math.round((totalCollected / maxRevAxis) * maxPlotHeight))) : 0;
  const pendingBarHeight = totalPending > 0 ? Math.max(8, Math.min(maxPlotHeight, Math.round((totalPending / maxRevAxis) * maxPlotHeight))) : 0;
  const totalRevSum = totalCollected + totalPending;
  const collectedPct = totalRevSum > 0 ? ((totalCollected / totalRevSum) * 100).toFixed(1) : '0';
  const pendingPct = totalRevSum > 0 ? ((totalPending / totalRevSum) * 100).toFixed(1) : '0';

  // 4. Chart 3 Data: Donut Stroke Dash (Clean, non-overlapping radial segments)
  const circ = 238.76;
  const paidPct = totalInvoicesCount > 0 ? ((paidCount / totalInvoicesCount) * 100).toFixed(1) : '0';
  const duePct = totalInvoicesCount > 0 ? ((dueCount / totalInvoicesCount) * 100).toFixed(1) : '0';

  const paidRatio = totalInvoicesCount > 0 ? paidCount / totalInvoicesCount : 0;
  const dueRatio = totalInvoicesCount > 0 ? dueCount / totalInvoicesCount : 0;

  const bothActive = paidCount > 0 && dueCount > 0;
  const gap = bothActive ? 2 : 0; // 2px crisp separator divider between segments

  const paidArc = bothActive ? Math.max(1, (paidRatio * circ) - gap) : (paidCount > 0 ? circ : 0);
  const dueArc = bothActive ? Math.max(1, (dueRatio * circ) - gap) : (dueCount > 0 ? circ : 0);

  const paidDash = `${paidArc.toFixed(2)} ${circ}`;
  const dueDash = `${dueArc.toFixed(2)} ${circ}`;

  const paidOffset = -(gap / 2);
  const dueOffset = -((paidRatio * circ) + (gap / 2));

  // 5. Recent Activity List from Real Patients
  const realRecentActivities = useMemo(() => {
    return patients.slice(0, 5).map((p, idx) => ({
      id: p.id || `act-${idx}`,
      name: p.name,
      time: p.admissionTime || 'Today',
      type: p.status === 'DISCHARGED' ? 'discharge' : (p.payStatus === 'PAID' ? 'payment' : 'admission'),
      amount: p.amountPaid || '₹1,500',
    }));
  }, [patients]);

  return (
    <div className="flex flex-col gap-4.5 font-sans text-slate-800 select-none pb-8">

      {/* ========================================================= */}
      {/* 1. TOP ROW: 6 KPI CARDS (Real Live MongoDB Data) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
        
        {/* Card 1: Total Patients */}
        <div 
          onClick={() => onNavigate('Patients')}
          className="relative overflow-hidden bg-gradient-to-br from-blue-50/90 via-blue-50/40 to-white hover:from-blue-100/90 hover:to-white rounded-2xl py-4 px-3.5 sm:py-4.5 sm:px-4 border border-blue-200/80 hover:border-blue-400 shadow-[0_2px_12px_rgba(59,130,246,0.08)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.18)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.98]"
        >
          <div className="w-11 h-11 rounded-2xl bg-blue-100/90 border border-blue-200/90 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <Users className="w-5.5 h-5.5 stroke-[2.4]" />
          </div>
          <div className="text-right min-w-0 flex-1">
            <p className="font-outfit text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight leading-none">
              {totalPatientsCount}
            </p>
            <p className="font-space text-[10.5px] sm:text-[11px] font-semibold text-blue-900 uppercase tracking-wider mt-1.5 truncate group-hover:text-blue-950 transition-colors" title="TOTAL PATIENTS">
              Total Patients
            </p>
          </div>
        </div>

        {/* Card 2: Admitted */}
        <div 
          onClick={() => onNavigate('Patients')}
          className="relative overflow-hidden bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-white hover:from-emerald-100/90 hover:to-white rounded-2xl py-4 px-3.5 sm:py-4.5 sm:px-4 border border-emerald-200/80 hover:border-emerald-400 shadow-[0_2px_12px_rgba(16,185,129,0.08)] hover:shadow-[0_8px_24px_rgba(16,185,129,0.18)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.98]"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-100/90 border border-emerald-200/90 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <Building2 className="w-5.5 h-5.5 stroke-[2.4]" />
          </div>
          <div className="text-right min-w-0 flex-1">
            <p className="font-outfit text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight leading-none">
              {admittedCount}
            </p>
            <p className="font-space text-[10.5px] sm:text-[11px] font-semibold text-emerald-900 uppercase tracking-wider mt-1.5 truncate group-hover:text-emerald-950 transition-colors" title="ADMITTED">
              Admitted
            </p>
          </div>
        </div>

        {/* Card 3: Discharged */}
        <div 
          onClick={() => onNavigate('Discharge')}
          className="relative overflow-hidden bg-gradient-to-br from-amber-50/90 via-amber-50/40 to-white hover:from-amber-100/90 hover:to-white rounded-2xl py-4 px-3.5 sm:py-4.5 sm:px-4 border border-amber-200/80 hover:border-amber-400 shadow-[0_2px_12px_rgba(245,158,11,0.08)] hover:shadow-[0_8px_24px_rgba(245,158,11,0.18)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.98]"
        >
          <div className="w-11 h-11 rounded-2xl bg-amber-100/90 border border-amber-200/90 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <LogOut className="w-5.5 h-5.5 stroke-[2.4]" />
          </div>
          <div className="text-right min-w-0 flex-1">
            <p className="font-outfit text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight leading-none">
              {dischargedCount}
            </p>
            <p className="font-space text-[10.5px] sm:text-[11px] font-semibold text-amber-900 uppercase tracking-wider mt-1.5 truncate group-hover:text-amber-950 transition-colors" title="DISCHARGED">
              Discharged
            </p>
          </div>
        </div>

        {/* Card 4: Revenue Collected */}
        <div 
          onClick={() => onNavigate('Billing')}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-50/90 via-indigo-50/40 to-white hover:from-indigo-100/90 hover:to-white rounded-2xl py-4 px-3.5 sm:py-4.5 sm:px-4 border border-indigo-200/80 hover:border-indigo-400 shadow-[0_2px_12px_rgba(99,102,241,0.08)] hover:shadow-[0_8px_24px_rgba(99,102,241,0.18)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between gap-2.5 cursor-pointer group active:scale-[0.98]"
        >
          <div className="w-11 h-11 rounded-2xl bg-indigo-100/90 border border-indigo-200/90 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs font-bold text-lg">
            ₹
          </div>
          <div className="text-right min-w-0 flex-1">
            <p className="font-outfit text-lg sm:text-[22px] font-extrabold text-slate-900 tracking-tight leading-none">
              ₹{totalCollected.toLocaleString('en-IN')}
            </p>
            <p className="font-space text-[10px] sm:text-[10.5px] font-semibold text-indigo-900 uppercase tracking-wider mt-1.5 truncate group-hover:text-indigo-950 transition-colors" title="REVENUE COLLECTED">
              Revenue Collected
            </p>
          </div>
        </div>

        {/* Card 5: Paid Invoices */}
        <div 
          onClick={() => onNavigate('Billing')}
          className="relative overflow-hidden bg-gradient-to-br from-teal-50/90 via-teal-50/40 to-white hover:from-teal-100/90 hover:to-white rounded-2xl py-4 px-3.5 sm:py-4.5 sm:px-4 border border-teal-200/80 hover:border-teal-400 shadow-[0_2px_12px_rgba(20,184,166,0.08)] hover:shadow-[0_8px_24px_rgba(20,184,166,0.18)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.98]"
        >
          <div className="w-11 h-11 rounded-2xl bg-teal-100/90 border border-teal-200/90 text-teal-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <CheckCircle2 className="w-5.5 h-5.5 stroke-[2.4]" />
          </div>
          <div className="text-right min-w-0 flex-1">
            <p className="font-outfit text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight leading-none">
              {paidCount}
            </p>
            <p className="font-space text-[10.5px] sm:text-[11px] font-semibold text-teal-900 uppercase tracking-wider mt-1.5 truncate group-hover:text-teal-950 transition-colors" title="PAID INVOICES">
              Paid Invoices
            </p>
          </div>
        </div>

        {/* Card 6: Pending Bills */}
        <div 
          onClick={() => onNavigate('Billing')}
          className="relative overflow-hidden bg-gradient-to-br from-rose-50/90 via-rose-50/40 to-white hover:from-rose-100/90 hover:to-white rounded-2xl py-4 px-3.5 sm:py-4.5 sm:px-4 border border-rose-200/80 hover:border-rose-400 shadow-[0_2px_12px_rgba(244,63,94,0.08)] hover:shadow-[0_8px_24px_rgba(244,63,94,0.18)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.98]"
        >
          <div className="w-11 h-11 rounded-2xl bg-rose-100/90 border border-rose-200/90 text-rose-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <Clock className="w-5.5 h-5.5 stroke-[2.4]" />
          </div>
          <div className="text-right min-w-0 flex-1">
            <p className="font-outfit text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight leading-none">
              {dueCount}
            </p>
            <p className="font-space text-[10.5px] sm:text-[11px] font-semibold text-rose-900 uppercase tracking-wider mt-1.5 truncate group-hover:text-rose-950 transition-colors" title="PENDING BILLS">
              Pending Bills
            </p>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. MIDDLE ROW: 3 ANALYTICS CHARTS (Now Fully Dynamic From DB) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* CHART 1: Daily Patients */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[300px]">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 stroke-[2.4]" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 whitespace-nowrap truncate">Daily Patients</h3>
              </div>

              {/* Badges on right - strictly nowrap so they never wrap vertically */}
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold flex-shrink-0">
                <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-600 border border-sky-200 whitespace-nowrap">
                  • OPD: {opdCount}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 border border-purple-200 whitespace-nowrap">
                  • IPD: {ipdCount}
                </span>
              </div>
            </div>

            {/* Sub-Legend Row: Legend on left, View Mode Switcher on right */}
            <div className="flex items-center justify-between my-2.5 gap-2">
              <div className="flex items-center gap-3 text-[10.5px] font-bold text-slate-600 min-w-0">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-3.5 h-1.5 rounded-full bg-sky-500 inline-block flex-shrink-0" />
                  <span>OPD</span>
                </div>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-3.5 h-1.5 rounded-full bg-purple-500 inline-block flex-shrink-0" />
                  <span>IPD ({dailyChartMode === 'census' ? 'Census' : 'New'})</span>
                </div>
              </div>

              {/* View Mode Toggle: Sits neatly on the right */}
              <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200/80 text-[10px] font-bold flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setDailyChartMode('admissions')}
                  className={`px-2 py-0.5 rounded-md transition-all whitespace-nowrap ${dailyChartMode === 'admissions' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-700'}`}
                  title="View new patient registrations on each day"
                >
                  Admissions
                </button>
                <button
                  type="button"
                  onClick={() => setDailyChartMode('census')}
                  className={`px-2 py-0.5 rounded-md transition-all whitespace-nowrap ${dailyChartMode === 'census' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-700'}`}
                  title="View active in-hospital patients on each day"
                >
                  Census
                </button>
              </div>
            </div>

            {/* Area Chart with Real Plotted Points & Interactive Tooltip */}
            <div className="w-full mt-1 flex flex-col">
              <div className="relative h-36 w-full">
                <svg className="w-full h-full overflow-hidden select-none" viewBox="0 0 360 140" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="opdWaveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="25" y1="20" x2="350" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="25" y1="70" x2="350" y2="70" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="25" y1="120" x2="350" y2="120" stroke="#E2E8F0" strokeWidth="1" />

                  {/* Y-Axis Labels (Non-duplicate clean scale) */}
                  <text x="10" y="24" fontSize="9" fill="#94A3B8" fontWeight="600">{maxDailyVal}</text>
                  <text x="10" y="74" fontSize="9" fill="#94A3B8" fontWeight="600">{Math.round(maxDailyVal / 2)}</text>
                  <text x="10" y="123" fontSize="9" fill="#94A3B8" fontWeight="600">0</text>

                  {/* Area under OPD curve */}
                  <path
                    d={opdAreaPath}
                    fill="url(#opdWaveGrad)"
                  />

                  {/* OPD Line Stroke */}
                  <path
                    d={opdSvgPath}
                    fill="none"
                    stroke="#0EA5E9"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* IPD Line (dashed purple connecting real IPD data points) */}
                  <polyline
                    points={ipdPoints.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                  />

                  {/* Data Points on OPD */}
                  {opdPoints.map((pt, i) => (
                    <circle 
                      key={`opd-${i}`} 
                      cx={pt.x} 
                      cy={pt.y} 
                      r={hoveredDailyIdx === i ? 5 : (pt.val > 0 ? 3.5 : 2)} 
                      fill="#0284C7"
                      className="transition-all"
                    />
                  ))}

                  {/* Data Points on IPD */}
                  {ipdPoints.map((pt, i) => (
                    <circle 
                      key={`ipd-${i}`} 
                      cx={pt.x} 
                      cy={pt.y} 
                      r={hoveredDailyIdx === i ? 5 : (pt.val > 0 ? 3.5 : 2)} 
                      fill="#8B5CF6"
                      className="transition-all"
                    />
                  ))}

                  {/* Vertical Guide Line on Hover */}
                  {hoveredDailyIdx !== null && (
                    <line 
                      x1={xPositions[hoveredDailyIdx]} 
                      y1="18" 
                      x2={xPositions[hoveredDailyIdx]} 
                      y2="120" 
                      stroke="#0284C7" 
                      strokeWidth="1.2" 
                      strokeDasharray="3 3" 
                      opacity="0.6" 
                    />
                  )}

                  {/* Floating Tooltip at Exact Plotted Position (Usa Jagah Ka Dikhaye) */}
                  {hoveredDailyIdx !== null && (() => {
                    const cur = last7Days[hoveredDailyIdx];
                    const hX = xPositions[hoveredDailyIdx];
                    // Keep tooltip within SVG bounds
                    const tx = hoveredDailyIdx >= 4 ? Math.max(10, hX - 130) : Math.min(220, hX + 12);
                    const ty = Math.min(65, Math.max(10, Math.min(opdPoints[hoveredDailyIdx].y, ipdPoints[hoveredDailyIdx].y) - 25));

                    return (
                      <g transform={`translate(${tx}, ${ty})`} className="pointer-events-none transition-all duration-150">
                        <rect 
                          width="124" 
                          height="56" 
                          rx="8" 
                          fill="#0F172A" 
                          opacity="0.96" 
                        />
                        {/* Date Header */}
                        <text x="62" y="15" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="bold">
                          {cur.fullDate}
                        </text>
                        {/* OPD Count */}
                        <circle cx="14" cy="28" r="3" fill="#38BDF8" />
                        <text x="22" y="31" fill="#BAE6FD" fontSize="9" fontWeight="bold">
                          OPD: {cur.opd} {cur.opd === 1 ? 'Patient' : 'Patients'}
                        </text>
                        {/* IPD Count */}
                        <circle cx="14" cy="43" r="3" fill="#C084FC" />
                        <text x="22" y="46" fill="#F3E8FF" fontSize="9" fontWeight="bold">
                          IPD: {cur.ipd} {dailyChartMode === 'census' ? 'Active Inpatients' : 'Admitted'}
                        </text>
                      </g>
                    );
                  })()}

                  {/* Transparent Interactive Hit-Test Columns for Silky Smooth Hover */}
                  {last7Days.map((_, i) => (
                    <rect
                      key={`hit-${i}`}
                      x={xPositions[i] - 25}
                      y="0"
                      width="50"
                      height="135"
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredDailyIdx(i)}
                      onMouseLeave={() => setHoveredDailyIdx(null)}
                    />
                  ))}
                </svg>
              </div>

              {/* X-Axis Day Labels with Hover Feedback */}
              <div className="flex justify-between text-[9.5px] text-slate-500 font-bold px-2 pt-2 border-t border-slate-100">
                {last7Days.map((d, i) => (
                  <span 
                    key={`lbl-${i}`}
                    onMouseEnter={() => setHoveredDailyIdx(i)}
                    onMouseLeave={() => setHoveredDailyIdx(null)}
                    className={`cursor-pointer transition-colors px-1 py-0.5 rounded ${hoveredDailyIdx === i ? 'text-sky-600 font-extrabold bg-sky-50' : 'hover:text-slate-700'}`}
                  >
                    {d.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CHART 2: Revenue Overview (Real Live Amounts) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[300px]">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Wallet className="w-4 h-4 stroke-[2.4]" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">Revenue Overview</h3>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-[11px]">
                ₹{(totalCollected + totalPending).toLocaleString('en-IN')} Total
              </span>
            </div>

            {/* Vertical Bars Chart Arena */}
            <div className="relative h-44 w-full mt-3 flex items-stretch">
              {/* Y-Axis Labels */}
              <div className="flex flex-col justify-between text-[9.5px] text-slate-400 font-bold pr-2.5 text-right w-12 flex-shrink-0 select-none">
                {revenueOverviewAxis.ticks.map((t, idx) => (
                  <span key={idx} className="leading-none">{t.label}</span>
                ))}
              </div>

              {/* Bars Arena (Bottom border is the exact 0 baseline) */}
              <div className="flex-1 relative border-l border-b-2 border-slate-300">
                {/* Horizontal guideline grid */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {revenueOverviewAxis.ticks.map((_, idx) => (
                    <div key={idx} className={`w-full ${idx === revenueOverviewAxis.ticks.length - 1 ? 'border-b-0' : 'border-b border-slate-100'}`} />
                  ))}
                </div>

                {/* Sleek Compact Tooltip */}
                {hoveredRevBar && (
                  <div 
                    className={`absolute -top-7 z-30 transition-all duration-150 pointer-events-none transform -translate-x-1/2 ${
                      hoveredRevBar === 'collected' ? 'left-[28%]' : 'left-[72%]'
                    }`}
                  >
                    <div className="bg-slate-900/95 text-white text-[10px] font-bold rounded-lg px-2 py-1 shadow-md border border-slate-700/80 backdrop-blur-xs flex items-center gap-1.5 whitespace-nowrap">
                      <span className={`w-1.5 h-1.5 rounded-full ${hoveredRevBar === 'collected' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      <span>{hoveredRevBar === 'collected' ? 'Collected' : 'Pending Due'}:</span>
                      <span className="font-black text-white">
                        ₹{(hoveredRevBar === 'collected' ? totalCollected : totalPending).toLocaleString('en-IN')}
                      </span>
                      <span className={`text-[9px] font-black px-1 py-0.2 rounded ${
                        hoveredRevBar === 'collected' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                      }`}>
                        {hoveredRevBar === 'collected' ? `${collectedPct}%` : `${pendingPct}%`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Bars sitting directly on the 0-baseline */}
                <div className="relative z-10 h-full flex items-end justify-around px-4">
                  {/* Bar 1: Collected */}
                  <div 
                    className="flex flex-col items-center cursor-pointer group"
                    onMouseEnter={() => setHoveredRevBar('collected')}
                    onMouseLeave={() => setHoveredRevBar(null)}
                  >
                    {/* Amount Badge Above Bar */}
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/90 px-1.5 py-0.5 rounded-md shadow-2xs group-hover:scale-105 transition-transform whitespace-nowrap mb-1">
                      ₹{totalCollected.toLocaleString('en-IN')}
                    </span>

                    {/* Bar touching baseline with flat bottom */}
                    <div 
                      className={`w-14 sm:w-16 bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400 rounded-t-xl rounded-b-none shadow-xs transition-all duration-200 ${
                        hoveredRevBar === 'collected' ? 'ring-2 ring-emerald-400 ring-offset-1 brightness-110 shadow-emerald-500/30' : 'hover:brightness-105'
                      }`}
                      style={{ height: `${collectedBarHeight}px` }}
                      title={`Collected: ₹${totalCollected.toLocaleString('en-IN')} (${collectedPct}%)`}
                    />
                  </div>

                  {/* Bar 2: Pending Due */}
                  <div 
                    className="flex flex-col items-center cursor-pointer group"
                    onMouseEnter={() => setHoveredRevBar('pending')}
                    onMouseLeave={() => setHoveredRevBar(null)}
                  >
                    {/* Amount Badge Above Bar */}
                    <span className="text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-200/90 px-1.5 py-0.5 rounded-md shadow-2xs group-hover:scale-105 transition-transform whitespace-nowrap mb-1">
                      ₹{totalPending.toLocaleString('en-IN')}
                    </span>

                    {/* Bar touching baseline with flat bottom */}
                    <div 
                      className={`w-14 sm:w-16 bg-gradient-to-t from-rose-600 via-rose-500 to-rose-400 rounded-t-xl rounded-b-none shadow-xs transition-all duration-200 ${
                        hoveredRevBar === 'pending' ? 'ring-2 ring-rose-400 ring-offset-1 brightness-110 shadow-rose-500/30' : 'hover:brightness-105'
                      }`}
                      style={{ height: `${pendingBarHeight}px` }}
                      title={`Pending Due: ₹${totalPending.toLocaleString('en-IN')} (${pendingPct}%)`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* X-Axis Labels Row below the 0 Baseline */}
            <div className="flex items-center pl-12 mt-2 select-none">
              <div className="flex-1 flex items-center justify-around px-4">
                <div className="flex flex-col items-center -space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-800">Collected</span>
                  <span className="text-[10px] font-extrabold text-emerald-600">({collectedPct}%)</span>
                </div>
                <div className="flex flex-col items-center -space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-800">Pending Due</span>
                  <span className="text-[10px] font-extrabold text-rose-600">({pendingPct}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CHART 3: Bills Status (Dynamic Donut from DB) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[300px]">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <PieChart className="w-4 h-4 stroke-[2.4]" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">Bills Status</h3>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {paidCount} Paid
                </span>
                <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                  {dueCount} Due
                </span>
              </div>
            </div>

            {/* Circular Donut Ring */}
            <div className="relative flex items-center justify-center my-2">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90 overflow-visible" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="homePaidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="homeDueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fb7185" />
                      <stop offset="100%" stopColor="#e11d48" />
                    </linearGradient>
                  </defs>

                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth="11"
                  />

                  {/* Red/Rose Segment (Pending / Due) */}
                  {dueArc > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="url(#homeDueGrad)"
                      strokeWidth="11"
                      strokeDasharray={dueDash}
                      strokeDashoffset={dueOffset}
                      strokeLinecap="butt"
                      className={`cursor-pointer transition-all duration-200 ${
                        hoveredDonutSegment === 'paid' ? 'opacity-30' : 'opacity-100'
                      }`}
                      onMouseEnter={() => setHoveredDonutSegment('due')}
                      onMouseLeave={() => setHoveredDonutSegment(null)}
                    >
                      <title>{`Pending Due: ${dueCount} Invoices (${duePct}%)`}</title>
                    </circle>
                  )}

                  {/* Green Segment (Paid) */}
                  {paidArc > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="url(#homePaidGrad)"
                      strokeWidth="11"
                      strokeDasharray={paidDash}
                      strokeDashoffset={paidOffset}
                      strokeLinecap="butt"
                      className={`cursor-pointer transition-all duration-200 ${
                        hoveredDonutSegment === 'due' ? 'opacity-30' : 'opacity-100'
                      }`}
                      onMouseEnter={() => setHoveredDonutSegment('paid')}
                      onMouseLeave={() => setHoveredDonutSegment(null)}
                    >
                      <title>{`Paid: ${paidCount} Invoices (${paidPct}%)`}</title>
                    </circle>
                  )}
                </svg>

                {/* Donut Inner Center Inset Disc */}
                <div className="absolute inset-5 bg-white rounded-full border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center pointer-events-none select-none z-10 p-1.5 transition-all duration-200">
                  <span className={`text-2xl font-black tracking-tight leading-none transition-colors duration-200 ${
                    hoveredDonutSegment === 'paid' ? 'text-emerald-600' : (hoveredDonutSegment === 'due' ? 'text-rose-600' : 'text-slate-900')
                  }`}>
                    {hoveredDonutSegment === 'paid' ? paidCount : (hoveredDonutSegment === 'due' ? dueCount : totalInvoicesCount)}
                  </span>
                  <span className={`text-[8.5px] font-black uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded-full transition-all duration-200 ${
                    hoveredDonutSegment === 'paid' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : (hoveredDonutSegment === 'due' 
                        ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                        : 'bg-slate-50 text-slate-500 border border-slate-200')
                  }`}>
                    {hoveredDonutSegment === 'paid' ? `PAID (${paidPct}%)` : (hoveredDonutSegment === 'due' ? `DUE (${duePct}%)` : 'TOTAL')}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Legend */}
            <div className="flex items-center justify-center gap-2.5 text-xs font-bold border-t border-slate-100 pt-3">
              <button
                type="button"
                onMouseEnter={() => setHoveredDonutSegment('paid')}
                onMouseLeave={() => setHoveredDonutSegment(null)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
                  hoveredDonutSegment === 'paid' ? 'bg-emerald-100 text-emerald-800 scale-105 shadow-2xs' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block shadow-2xs" />
                <span>Paid ({paidCount})</span>
                <span className="text-[10px] font-black text-emerald-600">· {paidPct}%</span>
              </button>

              <button
                type="button"
                onMouseEnter={() => setHoveredDonutSegment('due')}
                onMouseLeave={() => setHoveredDonutSegment(null)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
                  hoveredDonutSegment === 'due' ? 'bg-rose-100 text-rose-800 scale-105 shadow-2xs' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block shadow-2xs" />
                <span>Pending ({dueCount})</span>
                <span className="text-[10px] font-black text-rose-600">· {duePct}%</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. THIRD ROW: 4 SHORTCUT ACTION PILL BUTTONS */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Button 1: New Admission */}
        <button
          onClick={() => onNavigate('Add Patient')}
          className="relative overflow-hidden bg-gradient-to-br from-emerald-50/90 via-emerald-50/30 to-white hover:from-emerald-100/90 hover:to-white border border-emerald-200/80 hover:border-emerald-400 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between transition-all duration-200 shadow-[0_2px_12px_rgba(16,185,129,0.06)] hover:shadow-[0_8px_20px_rgba(16,185,129,0.14)] hover:-translate-y-0.5 cursor-pointer group active:scale-[0.98]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100/80 border border-emerald-200/90 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <UserPlus className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div className="text-left min-w-0">
              <span className="block font-black text-[14px] text-slate-900 group-hover:text-emerald-950 transition-colors truncate">
                New Admission
              </span>
              <span className="block text-[10.5px] font-bold text-emerald-800/70 truncate mt-0.5">
                OPD & IPD Register
              </span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-white/90 border border-emerald-200/70 flex items-center justify-center text-emerald-600 group-hover:text-emerald-800 group-hover:border-emerald-400 group-hover:translate-x-1 transition-all shadow-2xs flex-shrink-0 ml-2">
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </button>

        {/* Button 2: Patient Directory */}
        <button
          onClick={() => onNavigate('Patients')}
          className="relative overflow-hidden bg-gradient-to-br from-sky-50/90 via-sky-50/30 to-white hover:from-sky-100/90 hover:to-white border border-sky-200/80 hover:border-sky-400 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between transition-all duration-200 shadow-[0_2px_12px_rgba(14,165,233,0.06)] hover:shadow-[0_8px_20px_rgba(14,165,233,0.14)] hover:-translate-y-0.5 cursor-pointer group active:scale-[0.98]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-sky-100/80 border border-sky-200/90 text-sky-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <Users className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div className="text-left min-w-0">
              <span className="block font-black text-[14px] text-slate-900 group-hover:text-sky-950 transition-colors truncate">
                Patient Directory
              </span>
              <span className="block text-[10.5px] font-bold text-sky-800/70 truncate mt-0.5">
                Search & Medical Records
              </span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-white/90 border border-sky-200/70 flex items-center justify-center text-sky-600 group-hover:text-sky-800 group-hover:border-sky-400 group-hover:translate-x-1 transition-all shadow-2xs flex-shrink-0 ml-2">
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </button>

        {/* Button 3: Billing & Invoices */}
        <button
          onClick={() => onNavigate('Billing')}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-50/90 via-indigo-50/30 to-white hover:from-indigo-100/90 hover:to-white border border-indigo-200/80 hover:border-indigo-400 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between transition-all duration-200 shadow-[0_2px_12px_rgba(99,102,241,0.06)] hover:shadow-[0_8px_20px_rgba(99,102,241,0.14)] hover:-translate-y-0.5 cursor-pointer group active:scale-[0.98]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100/80 border border-indigo-200/90 text-indigo-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <Receipt className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div className="text-left min-w-0">
              <span className="block font-black text-[14px] text-slate-900 group-hover:text-indigo-950 transition-colors truncate">
                Billing & Invoices
              </span>
              <span className="block text-[10.5px] font-bold text-indigo-800/70 truncate mt-0.5">
                Payments & Receipts
              </span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-white/90 border border-indigo-200/70 flex items-center justify-center text-indigo-600 group-hover:text-indigo-800 group-hover:border-indigo-400 group-hover:translate-x-1 transition-all shadow-2xs flex-shrink-0 ml-2">
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </button>

        {/* Button 4: Discharge Summary */}
        <button
          onClick={() => onNavigate('Discharge')}
          className="relative overflow-hidden bg-gradient-to-br from-amber-50/90 via-amber-50/30 to-white hover:from-amber-100/90 hover:to-white border border-amber-200/80 hover:border-amber-400 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between transition-all duration-200 shadow-[0_2px_12px_rgba(245,158,11,0.06)] hover:shadow-[0_8px_20px_rgba(245,158,11,0.14)] hover:-translate-y-0.5 cursor-pointer group active:scale-[0.98]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-100/80 border border-amber-200/90 text-amber-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <LogOut className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div className="text-left min-w-0">
              <span className="block font-black text-[14px] text-slate-900 group-hover:text-amber-950 transition-colors truncate">
                Discharge Summary
              </span>
              <span className="block text-[10.5px] font-bold text-amber-800/70 truncate mt-0.5">
                Clearance & Handover
              </span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-white/90 border border-amber-200/70 flex items-center justify-center text-amber-600 group-hover:text-amber-800 group-hover:border-amber-400 group-hover:translate-x-1 transition-all shadow-2xs flex-shrink-0 ml-2">
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </button>

      </div>

      {/* ========================================================= */}
      {/* 4. FOURTH ROW: RECENT HOSPITAL ACTIVITY FEED & WARD SUMMARY */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        
        {/* Left Card: Recent Hospital Activity Feed */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6.5 h-6.5 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 stroke-[2.3]" />
                </div>
                <h3 className="font-extrabold text-[13.5px] text-slate-900">
                  Recent Hospital Activity Feed
                </h3>
              </div>
              <button 
                onClick={() => onNavigate('Patients')}
                className="text-[11.5px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            {/* Dynamic Activity List from DB */}
            <div className="mt-3 space-y-2">
              {realRecentActivities.map((act) => (
                <div key={act.id} className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className={`w-7.5 h-7.5 rounded-lg border flex items-center justify-center flex-shrink-0 shadow-2xs font-bold text-xs ${
                    act.type === 'discharge' 
                      ? 'bg-amber-50 border-amber-100 text-amber-600'
                      : act.type === 'payment'
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                      : 'bg-sky-50 border-sky-100 text-sky-600'
                  }`}>
                    {act.type === 'discharge' ? (
                      <LogOut className="w-3.5 h-3.5 stroke-[2.2]" />
                    ) : act.type === 'payment' ? (
                      '₹'
                    ) : (
                      <UserPlus className="w-3.5 h-3.5 stroke-[2.2]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                    <p className="font-bold text-[11.5px] text-slate-900 truncate">
                      {act.type === 'discharge' 
                        ? `Patient discharged: ${act.name}` 
                        : act.type === 'payment'
                        ? `${act.amount} received from ${act.name}`
                        : `New patient added: ${act.name}`}
                    </p>
                    <span className="text-[10.5px] text-slate-400 font-medium whitespace-nowrap flex-shrink-0">
                      {act.time}
                    </span>
                  </div>
                </div>
              ))}

              {realRecentActivities.length === 0 && (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  No recent patient activity recorded in database
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Card: Hospital Ward & Bed Summary (Real Live Beds) */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header with Integrated Compact Stats */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6.5 h-6.5 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5 stroke-[2.3]" />
                </div>
                <h3 className="font-extrabold text-[13.5px] text-slate-900">
                  Ward & Bed Summary
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-[10.5px] font-bold">
                <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/60 font-mono">
                  {bedSummary.occupiedBeds} Occupied
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-mono">
                  {bedSummary.availableBeds} Free
                </span>
              </div>
            </div>

            {/* Dynamic Mini-Ward Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
              {bedSummary.wardsBreakdown.map((ward, idx) => {
                const isFull = ward.available === 0 && ward.total > 0;
                return (
                  <div 
                    key={ward.name || `w-${idx}`}
                    className={`py-2 px-3 rounded-xl border transition-colors ${
                      isFull 
                        ? 'bg-rose-50/30 border-rose-200/70 hover:border-rose-400'
                        : 'bg-slate-50/80 border-slate-200/70 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11.5px] mb-1">
                      <span className="font-black text-slate-800 flex items-center gap-1.5 truncate">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          isFull ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'
                        }`} />
                        {ward.name}
                      </span>
                      <span className={`text-[11px] font-mono font-bold flex-shrink-0 ${isFull ? 'text-rose-700' : 'text-slate-600'}`}>
                        {ward.occupied}/{ward.total}{' '}
                        {isFull ? (
                          <span className="text-rose-600 text-[10px] font-black uppercase">(Full)</span>
                        ) : (
                          <span className="text-emerald-600 text-[10px] font-bold">({ward.available} Free)</span>
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${isFull ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${ward.pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Call to Action */}
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10.5px] text-slate-400 font-semibold">Incoming patient intake:</span>
            <button
              onClick={() => onNavigate('Add Patient')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11.5px] font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1 active:scale-98"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ New Admission</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
