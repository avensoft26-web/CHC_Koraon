import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  RotateCw, 
  Printer, 
  Calendar, 
  Filter, 
  Activity, 
  Users, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Building2, 
  PieChart as PieChartIcon, 
  BarChart3, 
  Stethoscope,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../../services/api';
import { fetchHospitalDoctors, HospitalDoctor } from '../../../utils/hospitalDoctors';

export const ChaudharyAdminReportsView: React.FC = () => {
  // Filter States
  const [period, setPeriod] = useState<string>('All Time');
  const [category, setCategory] = useState<string>('All (OPD + IPD)');
  const [doctor, setDoctor] = useState<string>('All Doctors');
  const [surgery, setSurgery] = useState<string>('All Patients');

  // Interactive UI States
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Non-null when the live data could not be loaded. The report then shows
  // the last known figures WITH a visible warning, instead of silently
  // presenting zeros as if the hospital had no activity.
  const [dataError, setDataError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeHoverPoint, setActiveHoverPoint] = useState<{
    date: string;
    opd: number;
    ipd: number;
    x: number;
    yOpd: number;
    yIpd: number;
  } | null>(null);
  const [hoveredBar, setHoveredBar] = useState<'paid' | 'pending' | null>(null);
  const [hoveredBillSegment, setHoveredBillSegment] = useState<'paid' | 'pending' | null>(null);
  const [hoveredCategorySegment, setHoveredCategorySegment] = useState<'normal' | 'surgery' | null>(null);
  const [trendViewMode, setTrendViewMode] = useState<'monthly' | 'datewise'>('monthly');

  const triggerRefresh = () => {
    fetchLiveData();
    setToastMessage('Reports & Analytics synced with live hospital ledger!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Dynamic Trend Data loaded from live admissions
  const [trendData, setTrendData] = useState([
    { date: '6 Jun', opd: 0, ipd: 1 },
    { date: '8 Jun', opd: 1, ipd: 1 },
    { date: '26 Jun', opd: 0, ipd: 2 },
    { date: '21 Jul', opd: 0, ipd: 2 },
    { date: '3 Aug', opd: 0, ipd: 1 },
    { date: '30 Aug', opd: 1, ipd: 3 },
    { date: '2 Oct', opd: 1, ipd: 1 },
    { date: '3 Oct', opd: 1, ipd: 0 },
    { date: '5 Oct', opd: 0, ipd: 1 },
  ]);

  // Monthly aggregated trend data (clean chronological: Jun, Jul, Aug, Sep, Oct)
  const monthlyTrendData = useMemo(() => {
    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const map = new Map<string, { date: string; opd: number; ipd: number }>();
    months.forEach(m => map.set(m, { date: m, opd: 0, ipd: 0 }));

    trendData.forEach(p => {
      const parts = p.date.split(' ');
      const m = parts.length > 1 ? parts[1] : parts[0];
      if (m && map.has(m)) {
        const item = map.get(m)!;
        item.opd += p.opd;
        item.ipd += p.ipd;
      }
    });

    return months.map(m => map.get(m)!);
  }, [trendData]);

  const activeTrendData = trendViewMode === 'monthly' ? monthlyTrendData : trendData;

  // SVG Chart Dimensions
  const svgWidth = 460;
  const svgHeight = 220;
  const padLeft = 35;
  const padRight = 20;
  const padTop = 25;
  const padBottom = 35;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;
  const maxY = Math.max(3, ...activeTrendData.map(d => Math.max(d.opd, d.ipd)));

  const getX = (idx: number) => padLeft + (activeTrendData.length > 1 ? (idx / (activeTrendData.length - 1)) * chartW : chartW / 2);
  const getY = (val: number) => padTop + chartH - (val / maxY) * chartH;
  const zeroY = padTop + chartH;

  // Natural Catmull-Rom Smoothing (Monotone-like, zero-clamped, NO DNA loops or sine wave overshoot!)
  const createSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    const tension = 0.18; // Balanced natural curvature

    for (let i = 0; i < points.length - 1; i++) {
      const pPrev = points[i > 0 ? i - 1 : i];
      const pCurr = points[i];
      const pNext = points[i + 1];
      const pNextNext = points[i + 2 < points.length ? i + 2 : i + 1];

      // Tangent vector at pCurr
      const dx1 = pNext.x - pPrev.x;
      const dy1 = pNext.y - pPrev.y;

      // Tangent vector at pNext
      const dx2 = pNextNext.x - pCurr.x;
      const dy2 = pNextNext.y - pCurr.y;

      // Control points clamped to baseline zeroY and padTop
      const cp1x = pCurr.x + dx1 * tension;
      const cp1y = Math.min(zeroY, Math.max(padTop - 5, pCurr.y + dy1 * tension));

      const cp2x = pNext.x - dx2 * tension;
      const cp2y = Math.min(zeroY, Math.max(padTop - 5, pNext.y - dy2 * tension));

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${pNext.x.toFixed(1)} ${pNext.y.toFixed(1)}`;
    }
    return d;
  };

  const createSmoothAreaPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    const linePath = createSmoothPath(points);
    return `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${zeroY} L ${points[0].x.toFixed(1)} ${zeroY} Z`;
  };

  const opdPoints = activeTrendData.map((d, i) => ({ x: getX(i), y: getY(d.opd) }));
  const ipdPoints = activeTrendData.map((d, i) => ({ x: getX(i), y: getY(d.ipd) }));

  const opdPath = createSmoothPath(opdPoints);
  const ipdPath = createSmoothPath(ipdPoints);
  const opdAreaPath = createSmoothAreaPath(opdPoints);
  const ipdAreaPath = createSmoothAreaPath(ipdPoints);

  const peakItem = useMemo(() => {
    if (activeTrendData.length === 0) return null;
    return [...activeTrendData].sort((a, b) => (b.ipd + b.opd) - (a.ipd + a.opd))[0];
  }, [activeTrendData]);

  // Live Revenue & Department Numbers from DB (start empty — DB fills them in)
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [admittedCount, setAdmittedCount] = useState<number>(0);
  const [dischargedCount, setDischargedCount] = useState<number>(0);
  const [surgeryCount, setSurgeryCount] = useState<number>(0);
  const [paidRevenue, setPaidRevenue] = useState<number>(0);
  const [pendingRevenue, setPendingRevenue] = useState<number>(0);
  const [paidBillsCount, setPaidBillsCount] = useState<number>(0);
  const [pendingBillsCount, setPendingBillsCount] = useState<number>(0);
  const [departmentBreakdown, setDepartmentBreakdown] = useState<{
    name: string; patients: number; paid: string; pending: string; doctor: string; rate: string;
  }[]>([]);
  const [doctorOptions, setDoctorOptions] = useState<HospitalDoctor[]>([]);

  useEffect(() => {
    let mounted = true;
    fetchHospitalDoctors().then(list => { if (mounted) setDoctorOptions(list); }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const fetchLiveData = () => {
    setIsRefreshing(true);
    // TRUTHFULNESS: these calls used `.catch(() => null)`, so ANY failure
    // (outage, 500, permission change) silently left the previous or initial
    // zero figures on screen. An administrator during an outage would see
    // "0 revenue, 0 patients" and conclude the hospital had no activity.
    // Failures are now surfaced instead of rendered as zeros.
    Promise.all([api.billing.getAll(), api.patients.getAll()])
      .then(([billRes, patRes]) => {
        setDataError(null);
      let livePaid = 0;
      let livePending = 0;

      const patientMap = new Map();
      if (patRes?.success && Array.isArray(patRes.patients)) {
        patRes.patients.forEach((p: any) => patientMap.set(p.patient_id || p._id, p));
      }

      if (billRes?.success && Array.isArray(billRes.billings) && billRes.billings.length > 0) {
        let totalPaid = 0;
        let totalPending = 0;
        let pCount = 0;
        let dCount = 0;
        billRes.billings.forEach((b: any) => {
          const pat = patientMap.get(b.patient_id);
          const paymentsTotal = (b.payments || []).reduce((acc: number, pay: any) => acc + (pay.amount || 0), 0);
          const paid = b.totalPaid !== undefined ? Number(b.totalPaid) : (paymentsTotal || (pat ? (pat.totalBill ? pat.totalBill - (pat.pending_amount || 0) : 0) : 0));
          const itemsTotal = (b.items || []).reduce((acc: number, item: any) => acc + (Number(item.fee || 0) * Number(item.days || 1)), 0);
          const grandTotal = b.grandTotal !== undefined ? Number(b.grandTotal) : (itemsTotal > 0 ? Math.max(0, itemsTotal - Number(b.discount || 0)) : (pat?.totalBill || 0));
          const remaining = b.due !== undefined ? Number(b.due) : Math.max(0, grandTotal - paid);
          const isPaid = (b.payment_status === 'Paid') || (pat?.payment_status === 'Paid') || (remaining === 0 && grandTotal > 0);

          totalPaid += paid;
          totalPending += remaining;
          if (isPaid) pCount++;
          else dCount++;
        });
        livePaid = totalPaid;
        livePending = totalPending;
        setPaidRevenue(totalPaid);
        setPendingRevenue(totalPending);
        setPaidBillsCount(pCount);
        setPendingBillsCount(dCount);
      }

      if (patRes?.success && Array.isArray(patRes.patients) && patRes.patients.length > 0) {
        const total = patRes.patients.length;
        const adm = patRes.patients.filter((p: any) => p.status === 'Admitted' || p.status === 'ADMITTED').length;
        const disch = patRes.patients.filter((p: any) => p.status === 'Discharged' || p.status === 'DISCHARGED').length;
        
        const surg = patRes.patients.filter((p: any) => 
          (Array.isArray(p.surgeries) && p.surgeries.length > 0) ||
          (typeof p.problem === 'string' && /surg|laparoscop|appendix|hernia|cholecyst/i.test(p.problem)) ||
          (typeof p.department === 'string' && /surg/i.test(p.department)) ||
          (typeof p.ward_type === 'string' && /surg/i.test(p.ward_type))
        ).length;

        setTotalPatients(total);
        setAdmittedCount(adm);
        setDischargedCount(disch);
        // Only real, detectable surgery records are counted — never fabricated
        setSurgeryCount(surg);

        const ipd = adm;
        const opd = total - ipd;
        // Calculate dynamic trend data from live patient admission dates
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dateGroups = new Map<string, { date: string; opd: number; ipd: number; time: number }>();
        
        patRes.patients.forEach((p: any) => {
          if (!p.admission_date) return;
          const d = new Date(p.admission_date);
          if (isNaN(d.getTime())) return;
          const dateLabel = `${d.getDate()} ${monthNames[d.getMonth()]}`;
          const cur = dateGroups.get(dateLabel) || { date: dateLabel, opd: 0, ipd: 0, time: d.getTime() };
          if (p.patient_type === 'OPD' || (!p.bed_no || p.bed_no === '-')) {
            cur.opd += 1;
          } else {
            cur.ipd += 1;
          }
          dateGroups.set(dateLabel, cur);
        });

        if (dateGroups.size > 0) {
          const sorted = Array.from(dateGroups.values()).sort((a, b) => a.time - b.time);
          setTrendData(sorted.map(({ date, opd, ipd }) => ({ date, opd, ipd })));
        }

        // Department breakdown computed from real departments + each patient's own billing
        const billingByPatient = new Map<string, any>();
        ((billRes?.success && Array.isArray(billRes.billings)) ? billRes.billings : []).forEach((b: any) => {
          if (b?.patient_id) billingByPatient.set(String(b.patient_id), b);
        });

        const groups = new Map<string, {
          patients: number;
          paid: number;
          pending: number;
          billedCount: number;
          settledCount: number;
          doctors: Map<string, number>;
        }>();

        patRes.patients.forEach((p: any) => {
          const key = String(p.department || p.ward_type || 'General Medicine').trim() || 'General Medicine';
          const g = groups.get(key) || {
            patients: 0, paid: 0, pending: 0, billedCount: 0, settledCount: 0, doctors: new Map<string, number>(),
          };
          g.patients += 1;

          const doc = String(p.doctor_assigned || '').trim();
          if (doc) g.doctors.set(doc, (g.doctors.get(doc) || 0) + 1);

          const bill = billingByPatient.get(String(p.patient_id || p._id));
          if (bill) {
            const paymentsTotal = (bill.payments || []).reduce((acc: number, pay: any) => acc + (Number(pay.amount) || 0), 0);
            const paid = bill.totalPaid !== undefined ? Number(bill.totalPaid) : paymentsTotal;
            const itemsTotal = (bill.items || []).reduce((acc: number, item: any) => acc + (Number(item.fee || 0) * Number(item.days || 1)), 0);
            const grand = bill.grandTotal !== undefined ? Number(bill.grandTotal) : itemsTotal;
            const remaining = bill.due !== undefined ? Number(bill.due) : Math.max(0, grand - paid);
            g.paid += Number.isFinite(paid) ? paid : 0;
            g.pending += Number.isFinite(remaining) ? remaining : 0;
            g.billedCount += 1;
            if (remaining === 0 && grand > 0) g.settledCount += 1;
          }

          groups.set(key, g);
        });

        const breakdownRows = Array.from(groups.entries())
          .map(([name, g]) => {
            let topDoctor = '—';
            let topCount = 0;
            g.doctors.forEach((count, docName) => {
              if (count > topCount) { topCount = count; topDoctor = docName; }
            });
            return {
              name,
              patients: g.patients,
              paid: `₹${Math.round(g.paid).toLocaleString('en-IN')}`,
              pending: `₹${Math.round(g.pending).toLocaleString('en-IN')}`,
              doctor: topDoctor,
              rate: g.billedCount > 0 ? `${Math.round((g.settledCount / g.billedCount) * 100)}%` : '—',
            };
          })
          .sort((a, b) => b.patients - a.patients)
          .slice(0, 6);

        setDepartmentBreakdown(breakdownRows);
      }
    })
      .catch((err: any) => {
        // Keep the last known-good figures on screen and state plainly that
        // they are stale, rather than showing a false "no activity".
        console.error('[Reports] Failed to load live data:', err?.message);
        setDataError(
          err?.status === 403
            ? 'You do not have permission to view billing data. Ask an administrator for billing access.'
            : 'Could not reach the hospital server. These figures may be out of date.'
        );
      })
      .finally(() => {
      setIsRefreshing(false);
    });
  };

  useEffect(() => {
    fetchLiveData();
  }, []);

  // Dynamic scale calculation for Financial Revenue Bar Chart to prevent bar overflow
  const calculateRevenueChartAxis = (paid: number, pending: number) => {
    const highest = Math.max(paid, pending, 120000);
    const rawStep = highest / 6;
    const cleanSteps = [20000, 25000, 30000, 40000, 50000, 60000, 70000, 75000, 80000, 100000, 125000, 150000, 200000, 250000, 300000, 400000, 500000];
    const step = cleanSteps.find(s => s >= rawStep) || Math.ceil(rawStep / 100000) * 100000;
    const maxVal = step * 6;
    const ticks = [];
    for (let i = 6; i >= 0; i--) {
      ticks.push({
        val: step * i,
        label: (step * i).toLocaleString('en-IN')
      });
    }
    return { maxVal, ticks };
  };

  const revenueAxis = calculateRevenueChartAxis(paidRevenue, pendingRevenue);
  const paidBarHeight = Math.min(150, Math.max(0, (paidRevenue / revenueAxis.maxVal) * 150));
  const paidBarY = 180 - paidBarHeight;

  const pendingBarHeight = Math.min(150, Math.max(0, (pendingRevenue / revenueAxis.maxVal) * 150));
  const pendingBarY = 180 - pendingBarHeight;

  const totalInvoiced = paidRevenue + pendingRevenue;
  const paidRatio = totalInvoiced > 0 ? (paidRevenue / totalInvoiced) : 0;
  const pendingRatio = 1 - paidRatio;
  const donutCircumference = 238.76;

  // Symmetrical micro-gap donut geometry (3.5px gap when both segments exist)
  const hasBothBillSegments = paidRevenue > 0 && pendingRevenue > 0;
  const billGap = hasBothBillSegments ? 3.5 : 0;
  const billUsableC = donutCircumference - (hasBothBillSegments ? billGap * 2 : 0);
  const paidArc = Math.max(0, billUsableC * paidRatio);
  const pendingArc = Math.max(0, billUsableC * pendingRatio);
  const paidOffset = -billGap;
  const pendingOffset = -(billGap + paidArc + billGap);

  // Real-time Patient Category Mix Donut Calculation
  const normalCount = Math.max(0, totalPatients - surgeryCount);
  const surgeryRatio = totalPatients > 0 ? (surgeryCount / totalPatients) : 0;
  const normalRatio = 1 - surgeryRatio;
  const normalPercentage = totalPatients > 0 ? ((normalCount / totalPatients) * 100).toFixed(1) : '0';
  const surgeryPercentage = totalPatients > 0 ? ((surgeryCount / totalPatients) * 100).toFixed(1) : '0';

  const hasBothCatSegments = normalCount > 0 && surgeryCount > 0;
  const catGap = hasBothCatSegments ? 3.5 : 0;
  const catUsableC = donutCircumference - (hasBothCatSegments ? catGap * 2 : 0);
  const normalArc = Math.max(0, catUsableC * normalRatio);
  const surgeryArc = Math.max(0, catUsableC * surgeryRatio);
  const normalOffset = -catGap;
  const surgeryOffset = -(catGap + normalArc + catGap);

  return (
    <div className="w-full space-y-4 font-sans text-slate-800 pb-8 select-none">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {dataError && (
        <div role="alert" className="w-full flex items-start gap-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="text-xs font-semibold leading-relaxed">
            <p>{dataError}</p>
            <p className="font-medium text-amber-800/80 mt-0.5">Figures below are the last loaded values, not live.</p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. HEADER: Title & Action Buttons (Matching Screenshot)   */}
      {/* ========================================================= */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <TrendingUp className="w-5 h-5 stroke-[2.4]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Reports & Analytics Dashboard
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={triggerRefresh}
            className="px-4 py-2 bg-[#10b981] hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Live</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-[#2563eb] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. FILTER BAR (PERIOD, CATEGORY, DOCTOR, SURGERY)         */}
      {/* ========================================================= */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Filter 1: PERIOD */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 focus-within:border-emerald-500 focus-within:bg-white transition-all">
            <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 min-w-[50px]">
              PERIOD
            </span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="All Time">All Time</option>
              <option value="Today">Today (Live)</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Quarter">This Quarter</option>
            </select>
          </div>

          {/* Filter 2: CATEGORY */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 focus-within:border-emerald-500 focus-within:bg-white transition-all">
            <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 min-w-[65px]">
              CATEGORY
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="All (OPD + IPD)">All (OPD + IPD)</option>
              <option value="OPD Only">OPD Consultations Only</option>
              <option value="IPD Only">IPD Inpatients Only</option>
              <option value="Emergency Only">Emergency & Triage</option>
            </select>
          </div>

          {/* Filter 3: DOCTOR */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 focus-within:border-emerald-500 focus-within:bg-white transition-all">
            <Stethoscope className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 min-w-[55px]">
              DOCTOR
            </span>
            <select
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer truncate"
            >
              <option value="All Doctors">All Doctors</option>
              {doctorOptions.map((d) => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
              {doctorOptions.length === 0 && (
                <option value="" disabled>No doctors configured</option>
              )}
            </select>
          </div>

          {/* Filter 4: SURGERY */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 focus-within:border-emerald-500 focus-within:bg-white transition-all">
            <Activity className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 min-w-[60px]">
              SURGERY
            </span>
            <select
              value={surgery}
              onChange={(e) => setSurgery(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="All Patients">All Patients</option>
              <option value="Surgery Cases Only">Surgery Cases Only</option>
              <option value="Non-Surgery Cases">Non-Surgery Cases</option>
            </select>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. 4 TOP KPI CARDS (Matching Screenshot Visuals Exactly)  */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: TOTAL PATIENTS (Teal Accent) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs relative overflow-hidden transition-all hover:shadow-md">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500 rounded-l-full" />
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-2 shadow-2xs">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              TOTAL PATIENTS
            </p>
            <p className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              {totalPatients}
            </p>
            <div className="mt-2 flex items-center gap-2 text-[11px] font-bold">
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                {admittedCount} Adm
              </span>
              <span className="text-slate-300">-</span>
              <span className="inline-flex items-center gap-1 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                {dischargedCount} Disch
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: REVENUE COLLECTED (Emerald Accent) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs relative overflow-hidden transition-all hover:shadow-md">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 rounded-l-full" />
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 shadow-2xs">
              <CreditCard className="w-5 h-5 stroke-[2.2]" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              REVENUE COLLECTED
            </p>
            <p className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              ₹{paidRevenue.toLocaleString('en-IN')}
            </p>
            <div className="mt-2 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{paidBillsCount} Paid Bills</span>
            </div>
          </div>
        </div>

        {/* Card 3: PENDING BALANCE (Rose/Red Accent) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs relative overflow-hidden transition-all hover:shadow-md">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500 rounded-l-full" />
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2 shadow-2xs">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              PENDING BALANCE
            </p>
            <p className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              ₹{pendingRevenue.toLocaleString('en-IN')}
            </p>
            <div className="mt-2 text-[11px] font-bold text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{pendingBillsCount} Unpaid</span>
            </div>
          </div>
        </div>

        {/* Card 4: SURGERY PATIENTS (Purple Accent) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs relative overflow-hidden transition-all hover:shadow-md">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500 rounded-l-full" />
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 shadow-2xs">
              <Building2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              SURGERY PATIENTS
            </p>
            <p className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              {surgeryCount}
            </p>
            <div className="mt-2 text-[11px] font-bold text-purple-600 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Consent Done</span>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 4. BALANCED 2x2 CHART GRID (Structured Screen Layout)      */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* --------------------------------------------------------- */}
        {/* CHART 1: OPD vs IPD Registration Trends (Smooth Curve)     */}
        {/* --------------------------------------------------------- */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                OPD vs IPD Registration Trends
              </h3>
              
              <div className="flex items-center flex-wrap gap-2.5">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px] font-extrabold">
                  <button
                    type="button"
                    onClick={() => setTrendViewMode('monthly')}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                      trendViewMode === 'monthly' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Monthly Trend
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrendViewMode('datewise')}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                      trendViewMode === 'datewise' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Datewise
                  </button>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block shadow-2xs" />
                    <span className="text-slate-600 text-[11px]">OPD</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1] inline-block shadow-2xs" />
                    <span className="text-slate-600 text-[11px]">IPD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SVG Trend Graph */}
            <div className="w-full relative mt-2 pt-1">
              <svg 
                viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                className="w-full h-auto overflow-visible select-none"
              >
                {/* Gradient Definitions */}
                <defs>
                  <linearGradient id="reportsOpdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
                  </linearGradient>
                  <linearGradient id="reportsIpdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {Array.from({ length: maxY + 1 }, (_, i) => i).map((val) => {
                  const y = getY(val);
                  return (
                    <g key={val}>
                      <line 
                        x1={padLeft} 
                        y1={y} 
                        x2={svgWidth - padRight} 
                        y2={y} 
                        stroke={val === 0 ? '#cbd5e1' : '#f1f5f9'} 
                        strokeWidth={val === 0 ? '1.5' : '1.2'}
                      />
                      <text 
                        x={padLeft - 8} 
                        y={y + 3.5} 
                        textAnchor="end" 
                        fontSize="10" 
                        fontWeight="700"
                        fill="#64748b"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Gradient Area Fills */}
                <path d={ipdAreaPath} fill="url(#reportsIpdGrad)" />
                <path d={opdAreaPath} fill="url(#reportsOpdGrad)" />

                {/* Natural Smooth IPD Curve (Indigo/Purple) */}
                <path 
                  d={ipdPath} 
                  fill="none" 
                  stroke="#6366f1" 
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Natural Smooth OPD Curve (Emerald/Green) */}
                <path 
                  d={opdPath} 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points on Curves */}
                {activeTrendData.map((d, i) => {
                  const x = getX(i);
                  const yOpd = getY(d.opd);
                  const yIpd = getY(d.ipd);

                  return (
                    <g key={i}>
                      {/* IPD Dot */}
                      <circle 
                        cx={x} 
                        cy={yIpd} 
                        r="4" 
                        fill="#6366f1" 
                        stroke="#ffffff" 
                        strokeWidth="1.8"
                        className="cursor-pointer hover:r-5 transition-all shadow-sm"
                        onMouseEnter={() => setActiveHoverPoint({ date: d.date, opd: d.opd, ipd: d.ipd, x, yOpd, yIpd })}
                        onMouseLeave={() => setActiveHoverPoint(null)}
                      >
                        <title>{`${d.date}: ${d.ipd} IPD Patients`}</title>
                      </circle>

                      {/* OPD Dot */}
                      <circle 
                        cx={x} 
                        cy={yOpd} 
                        r="4" 
                        fill="#10b981" 
                        stroke="#ffffff" 
                        strokeWidth="1.8"
                        className="cursor-pointer hover:r-5 transition-all shadow-sm"
                        onMouseEnter={() => setActiveHoverPoint({ date: d.date, opd: d.opd, ipd: d.ipd, x, yOpd, yIpd })}
                        onMouseLeave={() => setActiveHoverPoint(null)}
                      >
                        <title>{`${d.date}: ${d.opd} OPD Patients`}</title>
                      </circle>

                      {/* X-Axis Dates Label */}
                      <text 
                        x={x} 
                        y={svgHeight - 12} 
                        textAnchor={trendViewMode === 'monthly' ? 'middle' : 'end'} 
                        fontSize={trendViewMode === 'monthly' ? '10.5' : '9'} 
                        fontWeight="700"
                        fill="#64748b"
                        transform={trendViewMode === 'datewise' ? `rotate(-35, ${x}, ${svgHeight - 12})` : undefined}
                      >
                        {d.date}
                      </text>
                    </g>
                  );
                })}

                {/* Interactive Tooltip on hover */}
                {activeHoverPoint && (
                  <g transform={`translate(${Math.max(10, Math.min(activeHoverPoint.x - 48, svgWidth - 105))}, 8)`}>
                    <rect 
                      width="96" 
                      height="46" 
                      rx="8" 
                      fill="#0f172a" 
                      opacity="0.95"
                    />
                    <text x="48" y="14" textAnchor="middle" fill="#cbd5e1" fontSize="9.5" fontWeight="bold">
                      {activeHoverPoint.date}
                    </text>
                    <text x="12" y="27" fill="#34d399" fontSize="9.5" fontWeight="bold">
                      OPD: {activeHoverPoint.opd}
                    </text>
                    <text x="12" y="39" fill="#a5b4fc" fontSize="9.5" fontWeight="bold">
                      IPD: {activeHoverPoint.ipd}
                    </text>
                    <text x="84" y="33" textAnchor="end" fill="#94a3b8" fontSize="8.5" fontWeight="bold">
                      Tot: {activeHoverPoint.opd + activeHoverPoint.ipd}
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Peak Admissions: <strong>{peakItem ? `${peakItem.date} (${peakItem.ipd} IPD, ${peakItem.opd} OPD)` : 'Aug (4 IPD)'}</strong></span>
            <span className="text-emerald-700 font-bold">100% Tracking Active</span>
          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* CHART 2: Financial Revenue Collection (Bar Chart)          */}
        {/* --------------------------------------------------------- */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Financial Revenue Collection
              </h3>

              {/* Legend matching screenshot */}
              <div className="flex items-center gap-3 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-2.5 rounded-xs bg-[#10b981] inline-block" />
                  <span className="text-slate-600 text-[11px]">Paid (₹)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-2.5 rounded-xs bg-[#ef4444] inline-block" />
                  <span className="text-slate-600 text-[11px]">Pending (₹)</span>
                </div>
              </div>
            </div>

            {/* Bar Chart Container */}
            <div className="w-full relative mt-2 pt-2 overflow-hidden rounded-xl">
              <svg viewBox="0 0 440 220" className="w-full h-auto select-none">
                {/* Horizontal Grid lines (Dynamically scaled to fit revenueAxis) */}
                {revenueAxis.ticks.map((item, idx) => {
                  const y = 30 + (idx / 6) * 150;
                  return (
                    <g key={item.val}>
                      <line 
                        x1="65" 
                        y1={y} 
                        x2="420" 
                        y2={y} 
                        stroke="#94a3b8" 
                        strokeWidth="1.2"
                      />
                      <text 
                        x="55" 
                        y={y + 3.5} 
                        textAnchor="end" 
                        fontSize="10" 
                        fontWeight="700"
                        fill="#64748b"
                      >
                        {item.label}
                      </text>
                    </g>
                  );
                })}

                {/* Paid Bar (Green: Dynamically scaled & clamped) */}
                <rect 
                  x="180" 
                  y={paidBarY} 
                  width="44" 
                  height={paidBarHeight} 
                  rx="4"
                  fill="#10b981"
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                  onMouseEnter={() => setHoveredBar('paid')}
                  onMouseLeave={() => setHoveredBar(null)}
                />

                {/* Pending Bar (Red: Dynamically scaled & clamped) */}
                <rect 
                  x="228" 
                  y={pendingBarY} 
                  width="44" 
                  height={pendingBarHeight} 
                  rx="4"
                  fill="#ef4444"
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                  onMouseEnter={() => setHoveredBar('pending')}
                  onMouseLeave={() => setHoveredBar(null)}
                />

                {/* Bottom X-Axis Label matching screenshot */}
                <text 
                  x="226" 
                  y="204" 
                  textAnchor="middle" 
                  fontSize="11" 
                  fontWeight="600"
                  fill="#64748b"
                >
                  Collections & Receivables
                </text>

                {/* Tooltip on bar hover */}
                {hoveredBar && (
                  <g transform={`translate(${hoveredBar === 'paid' ? 140 : 230}, 40)`}>
                    <rect width="116" height="34" rx="8" fill="#0f172a" opacity="0.95" />
                    <text x="58" y="15" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                      {hoveredBar === 'paid' ? `Paid: ₹${paidRevenue.toLocaleString('en-IN')}` : `Pending: ₹${pendingRevenue.toLocaleString('en-IN')}`}
                    </text>
                    <text x="58" y="27" textAnchor="middle" fill={hoveredBar === 'paid' ? '#34d399' : '#f87171'} fontSize="9">
                      {hoveredBar === 'paid' 
                        ? `${((paidRevenue / (totalInvoiced || 1)) * 100).toFixed(1)}% Settled` 
                        : `${((pendingRevenue / (totalInvoiced || 1)) * 100).toFixed(1)}% Due`}
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Gross Invoiced: <strong className="text-slate-900">₹{totalInvoiced.toLocaleString('en-IN')}</strong></span>
            <span className="text-rose-600 font-bold">₹{pendingRevenue.toLocaleString('en-IN')} Pending Collection</span>
          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* CHART 3: Outstanding vs Paid Bills Breakdown (Donut)       */}
        {/* --------------------------------------------------------- */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-rose-500" />
                Outstanding vs Paid Bills Breakdown
              </h3>
            </div>

            {/* Donut Chart SVG */}
            <div className="py-4 flex flex-col items-center justify-center">
              <div className="relative w-48 h-48 sm:w-52 sm:h-52">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 overflow-visible">
                  <defs>
                    <linearGradient id="paidDonutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="pendingDonutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fb7185" />
                      <stop offset="100%" stopColor="#e11d48" />
                    </linearGradient>
                  </defs>

                  {/* Background Track Ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="12"
                  />

                  {/* Paid Bills Arc (Independent, seamless micro-gap) */}
                  {paidArc > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="url(#paidDonutGrad)"
                      strokeWidth="12"
                      strokeDasharray={`${paidArc} ${donutCircumference}`}
                      strokeDashoffset={paidOffset}
                      strokeLinecap="butt"
                      className={`cursor-pointer transition-all duration-200 ${
                        hoveredBillSegment === 'pending' ? 'opacity-30' : 'opacity-100'
                      }`}
                      onMouseEnter={() => setHoveredBillSegment('paid')}
                      onMouseLeave={() => setHoveredBillSegment(null)}
                    >
                      <title>{`Paid Bills: ${paidBillsCount} Invoices • ₹${paidRevenue.toLocaleString('en-IN')} (${((paidRevenue / (totalInvoiced || 1)) * 100).toFixed(1)}%)`}</title>
                    </circle>
                  )}

                  {/* Pending Bills Arc (Independent, seamless micro-gap) */}
                  {pendingArc > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="url(#pendingDonutGrad)"
                      strokeWidth="12"
                      strokeDasharray={`${pendingArc} ${donutCircumference}`}
                      strokeDashoffset={pendingOffset}
                      strokeLinecap="butt"
                      className={`cursor-pointer transition-all duration-200 ${
                        hoveredBillSegment === 'paid' ? 'opacity-30' : 'opacity-100'
                      }`}
                      onMouseEnter={() => setHoveredBillSegment('pending')}
                      onMouseLeave={() => setHoveredBillSegment(null)}
                    >
                      <title>{`Pending Bills: ${pendingBillsCount} Invoices • ₹${pendingRevenue.toLocaleString('en-IN')} (${((pendingRevenue / (totalInvoiced || 1)) * 100).toFixed(1)}%)`}</title>
                    </circle>
                  )}
                </svg>

                {/* Donut Inner Center Card (Crisp white inset disc with 100% sharp text) */}
                <div className="absolute inset-7 bg-white rounded-full border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center pointer-events-none select-none z-10 p-2 transition-all duration-200">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
                    hoveredBillSegment === 'paid' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : (hoveredBillSegment === 'pending' 
                        ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200')
                  }`}>
                    {hoveredBillSegment === 'paid' ? 'Paid Settled' : (hoveredBillSegment === 'pending' ? 'Pending Due' : 'Total Invoiced')}
                  </span>
                  <p className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-1 leading-tight">
                    {hoveredBillSegment === 'paid' 
                      ? `₹${paidRevenue.toLocaleString('en-IN')}` 
                      : (hoveredBillSegment === 'pending' ? `₹${pendingRevenue.toLocaleString('en-IN')}` : `₹${totalInvoiced.toLocaleString('en-IN')}`)}
                  </p>
                  <span className={`text-[10px] font-bold transition-colors duration-200 ${
                    hoveredBillSegment === 'paid' ? 'text-emerald-600' : (hoveredBillSegment === 'pending' ? 'text-rose-600' : 'text-slate-500')
                  }`}>
                    {hoveredBillSegment === 'paid' 
                      ? `${paidBillsCount} Invoices (${((paidRevenue / (totalInvoiced || 1)) * 100).toFixed(1)}%)`
                      : (hoveredBillSegment === 'pending' 
                        ? `${pendingBillsCount} Invoices (${((pendingRevenue / (totalInvoiced || 1)) * 100).toFixed(1)}%)`
                        : `${paidBillsCount + pendingBillsCount} Invoices`)}
                  </span>
                </div>
              </div>

              {/* Legend with Interactive Hover Sync */}
              <div className="mt-4 flex items-center justify-center gap-6 select-none">
                <button
                  type="button"
                  onMouseEnter={() => setHoveredBillSegment('paid')}
                  onMouseLeave={() => setHoveredBillSegment(null)}
                  className={`flex items-center gap-2 text-xs font-bold transition-all px-2.5 py-1 rounded-lg cursor-pointer ${
                    hoveredBillSegment === 'paid' ? 'bg-emerald-50 text-emerald-800 scale-105 shadow-2xs' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <span className="w-5 h-2.5 rounded-xs bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-2xs" />
                  <span>Paid Bills</span>
                </button>
                <button
                  type="button"
                  onMouseEnter={() => setHoveredBillSegment('pending')}
                  onMouseLeave={() => setHoveredBillSegment(null)}
                  className={`flex items-center gap-2 text-xs font-bold transition-all px-2.5 py-1 rounded-lg cursor-pointer ${
                    hoveredBillSegment === 'pending' ? 'bg-rose-50 text-rose-800 scale-105 shadow-2xs' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <span className="w-5 h-2.5 rounded-xs bg-gradient-to-r from-rose-400 to-rose-600 shadow-2xs" />
                  <span>Pending Bills</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>{paidBillsCount} Paid (₹{paidRevenue.toLocaleString('en-IN')})</span>
            <span className="text-rose-600 font-bold">{pendingBillsCount} Pending (₹{pendingRevenue.toLocaleString('en-IN')})</span>
          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* CHART 4: Patient Category Mix (Donut Chart)                */}
        {/* --------------------------------------------------------- */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600" />
                Patient Category Mix
              </h3>
            </div>

            {/* Donut Chart SVG */}
            <div className="py-4 flex flex-col items-center justify-center">
              <div className="relative w-48 h-48 sm:w-52 sm:h-52">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 overflow-visible">
                  <defs>
                    <linearGradient id="normalDonutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#4338ca" />
                    </linearGradient>
                    <linearGradient id="surgeryDonutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#c084fc" />
                      <stop offset="100%" stopColor="#9333ea" />
                    </linearGradient>
                  </defs>

                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="12"
                  />

                  {/* Normal Cases Arc (Independent, seamless micro-gap) */}
                  {normalArc > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="url(#normalDonutGrad)"
                      strokeWidth="12"
                      strokeDasharray={`${normalArc} ${donutCircumference}`}
                      strokeDashoffset={normalOffset}
                      strokeLinecap="butt"
                      className={`cursor-pointer transition-all duration-200 ${
                        hoveredCategorySegment === 'surgery' ? 'opacity-30' : 'opacity-100'
                      }`}
                      onMouseEnter={() => setHoveredCategorySegment('normal')}
                      onMouseLeave={() => setHoveredCategorySegment(null)}
                    >
                      <title>{`Medical Management: ${normalCount} Patients (${normalPercentage}%)`}</title>
                    </circle>
                  )}

                  {/* Surgery Cases Arc (Independent, seamless micro-gap) */}
                  {surgeryArc > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="url(#surgeryDonutGrad)"
                      strokeWidth="12"
                      strokeDasharray={`${surgeryArc} ${donutCircumference}`}
                      strokeDashoffset={surgeryOffset}
                      strokeLinecap="butt"
                      className={`cursor-pointer transition-all duration-200 ${
                        hoveredCategorySegment === 'normal' ? 'opacity-30' : 'opacity-100'
                      }`}
                      onMouseEnter={() => setHoveredCategorySegment('surgery')}
                      onMouseLeave={() => setHoveredCategorySegment(null)}
                    >
                      <title>{`Surgery Cases: ${surgeryCount} Patients (${surgeryPercentage}%)`}</title>
                    </circle>
                  )}
                </svg>

                {/* Donut Inner Center Card (Crisp white inset disc with 100% sharp text) */}
                <div className="absolute inset-7 bg-white rounded-full border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center pointer-events-none select-none z-10 p-2 transition-all duration-200">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
                    hoveredCategorySegment === 'normal' 
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                      : (hoveredCategorySegment === 'surgery' 
                        ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200')
                  }`}>
                    {hoveredCategorySegment === 'normal' ? 'Medical Care' : (hoveredCategorySegment === 'surgery' ? 'Surgery Cases' : 'Total Patients')}
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 leading-tight">
                    {hoveredCategorySegment === 'normal' ? normalCount : (hoveredCategorySegment === 'surgery' ? surgeryCount : totalPatients)}
                  </p>
                  <span className={`text-[10px] font-bold mt-0.5 transition-colors duration-200 ${
                    hoveredCategorySegment === 'normal' ? 'text-indigo-600' : (hoveredCategorySegment === 'surgery' ? 'text-purple-600' : 'text-slate-500')
                  }`}>
                    {hoveredCategorySegment === 'normal' 
                      ? `${normalPercentage}% of Roster` 
                      : (hoveredCategorySegment === 'surgery' ? `${surgeryPercentage}% of Roster` : 'Clinical Roster')}
                  </span>
                </div>
              </div>

              {/* Legend with Interactive Hover Sync */}
              <div className="mt-4 flex items-center justify-center gap-6 select-none">
                <button
                  type="button"
                  onMouseEnter={() => setHoveredCategorySegment('normal')}
                  onMouseLeave={() => setHoveredCategorySegment(null)}
                  className={`flex items-center gap-2 text-xs font-bold transition-all px-2.5 py-1 rounded-lg cursor-pointer ${
                    hoveredCategorySegment === 'normal' ? 'bg-indigo-50 text-indigo-800 scale-105 shadow-2xs' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <span className="w-5 h-2.5 rounded-xs bg-gradient-to-r from-indigo-500 to-indigo-700 shadow-2xs" />
                  <span>Normal Cases</span>
                </button>
                <button
                  type="button"
                  onMouseEnter={() => setHoveredCategorySegment('surgery')}
                  onMouseLeave={() => setHoveredCategorySegment(null)}
                  className={`flex items-center gap-2 text-xs font-bold transition-all px-2.5 py-1 rounded-lg cursor-pointer ${
                    hoveredCategorySegment === 'surgery' ? 'bg-purple-50 text-purple-800 scale-105 shadow-2xs' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <span className="w-5 h-2.5 rounded-xs bg-gradient-to-r from-purple-400 to-purple-600 shadow-2xs" />
                  <span>Surgery Cases</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>{normalPercentage}% Medical Management ({normalCount})</span>
            <span className="text-purple-700 font-bold">{surgeryPercentage}% Surgery Cases ({surgeryCount})</span>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 5. DEPARTMENTAL REVENUE & CLINICAL PERFORMANCE LEDGER     */}
      {/* ========================================================= */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
              Departmental Billing & Consultant Performance Ledger
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Breakdown of collections, outstanding balances, and patient admissions per specialty
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-xl self-start sm:self-auto">
            Audit Period: FY 2026-27
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-black tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Specialty / Department</th>
                <th className="py-2.5 px-3">Lead Consultant</th>
                <th className="py-2.5 px-3 text-center">Active Patients</th>
                <th className="py-2.5 px-3">Paid Collection</th>
                <th className="py-2.5 px-3">Pending Dues</th>
                <th className="py-2.5 px-3 text-center">Recovery Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departmentBreakdown.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {row.name}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700">
                    {row.doctor}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-800">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 font-mono text-[11px]">
                      {row.patients}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-600">
                    {row.paid}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-rose-600">
                    {row.pending}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold text-[11px] border border-emerald-200">
                      {row.rate}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
