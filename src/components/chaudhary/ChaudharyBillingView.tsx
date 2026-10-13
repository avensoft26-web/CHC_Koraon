import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useAuthUser } from '../../hooks/useAuthUser';
import {
  Receipt,
  Search,
  Plus,
  Printer,
  Eye,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Smartphone,
  Wallet,
  ArrowUpRight,
  Share2,
  Building,
  CreditCard,
  Banknote,
  DollarSign,
  TrendingUp,
  Sparkles,
  QrCode,
  Calendar,
  BedDouble,
  Stethoscope,
  Pill,
  Microscope,
  Zap,
  ArrowRight,
  FileCheck,
  Percent,
  Calculator,
} from 'lucide-react';

export type PatientType = 'IPD' | 'OPD';
export type PaymentStatus = 'ALL' | 'PAID' | 'PENDING';
export type PaymentMethod = 'UPI / QR' | 'Cash' | 'Debit/Credit Card' | 'Insurance / TPA';

export interface BillItem {
  id: string;
  name: string;
  category?: string;
  qty: number;
  rate: number;
}

export interface BillingInvoice {
  id: string;
  patientName: string;
  patientType: PatientType;
  uhid: string;
  phone: string;
  age: number;
  gender?: 'M' | 'F';
  billNumber: string;
  invoiceDate: string;
  amount: number;
  due: number;
  status: 'PAID' | 'PENDING';
  paymentMethod?: PaymentMethod;
  doctor: string;
  wardOrBed?: string;
  items: BillItem[];
  transactionRef?: string;
}

// Module-level cache for instant tab switching without loading spinners
let cachedInvoicesMemory: BillingInvoice[] = [];

export const ChaudharyBillingView: React.FC = () => {
  // Used to attribute each recorded payment to the person who collected it.
  const authUser = useAuthUser();
  const [invoices, setInvoices] = useState<BillingInvoice[]>(() => cachedInvoicesMemory);
  const [isLoadingBilling, setIsLoadingBilling] = useState<boolean>(() => cachedInvoicesMemory.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<PaymentStatus>('ALL');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('All');

  // Sync state to memory cache
  useEffect(() => {
    if (invoices.length > 0) {
      cachedInvoicesMemory = invoices;
    }
  }, [invoices]);

  // Fetch live billing records from MongoDB. Exposed as a reusable callback so
  // that after a payment is committed on the server we can reload the
  // authoritative ledger instead of leaving a locally-faked "settled" invoice
  // on screen that a page refresh would silently undo.
  const loadBillings = useCallback(async () => {
    try {
      if (cachedInvoicesMemory.length === 0) {
        setIsLoadingBilling(true);
      }
      const [billingRes, patientsRes] = await Promise.all([
        api.billing.getAll().catch(() => ({ success: false, billings: [] })),
        api.patients.getAll().catch(() => ({ success: false, patients: [] })),
      ]);

      if (billingRes.success && billingRes.billings && billingRes.billings.length > 0) {
        const patientMap = new Map();
        if (patientsRes.success && patientsRes.patients) {
          patientsRes.patients.forEach((p: any) => {
            patientMap.set(p.patient_id, p);
          });
        }

        const mapped: BillingInvoice[] = billingRes.billings.map((b: any, index: number) => {
          const pat = patientMap.get(b.patient_id);
          const totalPaid = b.totalPaid !== undefined ? b.totalPaid : (b.payments || []).reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
          // Blank when the billing record carries no total — never invent one
          const rawAmount = b.grandTotal !== undefined ? b.grandTotal : (pat?.totalBill || 0);
          const due = b.due !== undefined ? b.due : Math.max(0, rawAmount - (b.discount || 0) - totalPaid);
          const isPaid = (b.payment_status === 'Paid') || (due === 0 && rawAmount > 0);

          return {
            id: b._id || `inv-${index}`,
            patientName: b.patient_name || pat?.name || '',
            patientType: b.patient_type || (pat?.patient_type === 'OPD' ? 'OPD' : 'IPD'),
            // Real identifiers only — no placeholder UHID / phone number
            uhid: b.patient_id || pat?.patient_id || '',
            phone: b.mobile || pat?.mobile || '',
            age: b.age || pat?.age || 0,
            gender: (b.gender === 'Female' || b.gender === 'F' || pat?.gender === 'Female' || pat?.gender === 'F') ? 'F' : 'M',
            billNumber: `INV-${b.patient_id || 'CH'}-${index + 1}`,
            invoiceDate: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—',
            amount: rawAmount,
            due: due,
            status: isPaid ? 'PAID' : 'PENDING',
            paymentMethod: (b.payments?.[0]?.mode as PaymentMethod) || (b.payments?.[0]?.method as PaymentMethod) || undefined,
            doctor: b.doctor_name || pat?.attending_doctor || pat?.doctor_assigned || '',
            wardOrBed: (b.bed_no || pat?.bed_no) ? `${b.ward_type || pat?.ward_type || 'Ward'} (${b.bed_no || pat?.bed_no})` : ((b.patient_type === 'OPD' || pat?.patient_type === 'OPD') ? 'OPD Consultation' : ''),
            // Charge lines use the recorded fee — 0 when the item has none
            items: (b.items || []).map((it: any, itIdx: number) => ({
              id: `it-${itIdx}`,
              name: it.name || 'Hospital Service',
              category: it.category || 'Service',
              qty: it.days || 1,
              rate: it.fee ?? 0,
            })),
          };
        });

        setInvoices(mapped);
      } else {
        // The server returned no billing records — show an honest empty ledger
        // rather than keeping whatever was on screen before.
        setInvoices([]);
      }
    } catch (err) {
      console.warn('Failed to fetch live billing:', err);
    } finally {
      setIsLoadingBilling(false);
    }
  }, []);

  useEffect(() => {
    loadBillings();
  }, [loadBillings]);

  // Modal 1: Full Tax Invoice Inspector (for Eye & Printer buttons)
  const [inspectedInvoice, setInspectedInvoice] = useState<BillingInvoice | null>(null);

  // Modal 2: Collect Due Payment Modal (for Check button)
  const [collectPaymentInvoice, setCollectPaymentInvoice] = useState<BillingInvoice | null>(null);
  const [collectingMethod, setCollectingMethod] = useState<PaymentMethod>('UPI / QR');
  const [collectingAmount, setCollectingAmount] = useState<number>(0);

  // Modal 3: Issue New Bill Modal
  const [isNewBillModalOpen, setIsNewBillModalOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientType, setNewPatientType] = useState<PatientType>('IPD');
  const [newAmount, setNewAmount] = useState<number>(1700);
  const [newPaymentStatus, setNewPaymentStatus] = useState<'PAID' | 'PENDING'>('PENDING');
  const [newDoctor, setNewDoctor] = useState('Dr. Vikram Singh');

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch =
        inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.phone.includes(searchQuery);

      const matchStatus =
        selectedStatusTab === 'ALL' || inv.status === selectedStatusTab;

      const matchDept =
        selectedDepartmentFilter === 'All' ||
        (selectedDepartmentFilter === 'IPD' && inv.patientType === 'IPD') ||
        (selectedDepartmentFilter === 'OPD' && inv.patientType === 'OPD') ||
        (selectedDepartmentFilter === 'Emergency' && inv.wardOrBed?.includes('Emergency'));

      return matchSearch && matchStatus && matchDept;
    });
  }, [invoices, searchQuery, selectedStatusTab, selectedDepartmentFilter]);

  // ── Pagination State & Calculations (Requested Next & Previous buttons) ──
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  // Auto-reset current page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatusTab, selectedDepartmentFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredInvoices.length);
  const paginatedInvoices = useMemo(() => {
    return filteredInvoices.slice(startIndex, endIndex);
  }, [filteredInvoices, startIndex, endIndex]);

  // Executive Metrics
  const metrics = useMemo(() => {
    const totalCollected = invoices
      .filter(i => i.status === 'PAID')
      .reduce((sum, i) => sum + i.amount, 0);

    const totalDue = invoices
      .filter(i => i.status === 'PENDING')
      .reduce((sum, i) => sum + i.due, 0);

    const pendingCount = invoices.filter(i => i.status === 'PENDING').length;
    const paidCount = invoices.filter(i => i.status === 'PAID').length;

    return { totalCollected, totalDue, pendingCount, paidCount };
  }, [invoices]);

  // ACTION 1: Eye Button - Preview Invoice
  const handleViewInvoice = (inv: BillingInvoice) => {
    setInspectedInvoice(inv);
  };

  // ACTION 2: Check Button - Collect Payment
  const handleInitiateCollect = (inv: BillingInvoice) => {
    if (inv.status === 'PAID' || inv.due === 0) {
      showToast(`Invoice ${inv.billNumber} for ${inv.patientName} is already fully settled!`);
      return;
    }
    setCollectPaymentInvoice(inv);
    setCollectingAmount(inv.due);
  };

  // Confirm Payment Collection — posted to MongoDB via
  // POST /api/billing/:patientId/payments. The ledger is reloaded from the
  // server afterwards, so what stays on screen is the persisted state rather
  // than an optimistic local edit that a page refresh would silently undo.
  const handleConfirmPaymentCollection = async () => {
    if (!collectPaymentInvoice) return;

    const patientId = collectPaymentInvoice.uhid;
    const patientName = collectPaymentInvoice.patientName;
    const amount = collectingAmount;

    if (!patientId) {
      showToast(`This invoice has no patient UHID, so its payment cannot be posted to a patient record.`);
      return;
    }
    if (!(amount > 0)) {
      showToast('Please enter a payment amount greater than zero.');
      return;
    }

    try {
      const res = await api.billing.addPayment(patientId, {
        amount,
        mode: collectingMethod,
        performed_by: authUser.name || authUser.email || 'Hospital User',
      });

      if (!res?.success) throw new Error('the payment was not accepted');

      // Reload the authoritative ledger; the due amount and PAID/PENDING
      // status now come from the server, not from local arithmetic.
      await loadBillings();

      setCollectPaymentInvoice(null);
      showToast(`Payment of ₹${amount.toLocaleString()} recorded for ${patientName} via ${collectingMethod}.`);
    } catch (err: any) {
      // No success is claimed unless the backend confirmed the write.
      showToast(`Payment for ${patientName} was not saved — ${err?.message || 'please try again'}.`);
    }
  };

  // State & Handler for Auto-Recalculate Bill (Stay Days × Bed Rate)
  const [recalculatingUhid, setRecalculatingUhid] = useState<string | null>(null);

  const handleAutoRecalculate = async (inv: BillingInvoice) => {
    if (!inv.uhid) {
      showToast('Cannot recalculate: Invoice has no UHID.');
      return;
    }
    setRecalculatingUhid(inv.uhid);
    try {
      const res = await api.billing.sync(inv.uhid);
      if (res?.success) {
        const total = res.billing?.grandTotal ?? res.totalBill ?? 0;
        showToast(`Auto-recalculated bill for ${inv.patientName}: ₹${total.toLocaleString()}`);
        await loadBillings();
      } else {
        showToast(`Recalculation error: ${res?.message || 'Failed'}`);
      }
    } catch (err: any) {
      showToast(`Recalculation failed: ${err?.message || 'Network error'}`);
    } finally {
      setRecalculatingUhid(null);
    }
  };

  // ACTION 3: Printer Button - Instant Print
  const handlePrintInvoice = (inv: BillingInvoice) => {
    setInspectedInvoice(inv);
    setTimeout(() => {
      window.print();
    }, 350);
  };

  // Create New Bill Submission
  const handleCreateNewBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim() || newAmount <= 0) return;

    // Identifiers come from the real clock — not invented patient demographics
    const nowStamp = Date.now();
    const newRecord: BillingInvoice = {
      id: `inv-${nowStamp}`,
      patientName: newPatientName.trim(),
      patientType: newPatientType,
      uhid: '',
      phone: '',
      age: 0,
      billNumber: `INV-${nowStamp}`,
      invoiceDate: new Date().toLocaleDateString(),
      amount: Number(newAmount),
      due: newPaymentStatus === 'PAID' ? 0 : Number(newAmount),
      status: newPaymentStatus,
      paymentMethod: 'Cash',
      doctor: newDoctor,
      items: [
        { id: 'it-custom-1', name: `${newPatientType} Consultation & Nursing Package`, qty: 1, rate: Number(newAmount) },
      ],
    };

    setInvoices([newRecord, ...invoices]);
    setIsNewBillModalOpen(false);
    setNewPatientName('');
    // This invoice is held in the local ledger only — there is no billing-create
    // endpoint, so say so instead of reporting a saved hospital record.
    showToast(`Draft invoice ${newRecord.billNumber} added to the local ledger (not yet posted to the hospital record).`);
  };

  return (
    <div className="w-full space-y-3.5 select-none animate-fadeIn pb-2">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] px-4 py-2.5 bg-slate-900/90 backdrop-blur-xl text-white font-medium text-xs rounded-2xl shadow-2xl border border-white/20 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. ULTRA-MODERN REVENUE HERO CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Card 1: Total Realized Collections */}
        <div className="glass-card-soft-emerald relative overflow-hidden rounded-2xl py-2.5 px-3.5 sm:py-3 sm:px-4 flex flex-col justify-between group hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Total Received</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
                ₹{metrics.totalCollected.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> {metrics.paidCount} Paid
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Outstanding Due */}
        <div className="glass-card-soft-rose relative overflow-hidden rounded-2xl py-2.5 px-3.5 sm:py-3 sm:px-4 flex flex-col justify-between group hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Total Outstanding Due</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-xs flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-rose-600 tracking-tight font-mono">
                ₹{metrics.totalDue.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                {metrics.pendingCount} Pending
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Department Mix Badges */}
        <div className="glass-card-soft-sky relative overflow-hidden rounded-2xl py-2.5 px-3.5 sm:py-3 sm:px-4 flex flex-col justify-between group hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Segment Filter</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xs flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5">
            <button
              onClick={() => setSelectedDepartmentFilter('All')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDepartmentFilter === 'All'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-white'
              }`}
            >
              All ({invoices.length})
            </button>
            <button
              onClick={() => setSelectedDepartmentFilter('IPD')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDepartmentFilter === 'IPD'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100'
              }`}
            >
              IPD ({invoices.filter(i => i.patientType === 'IPD').length})
            </button>
            <button
              onClick={() => setSelectedDepartmentFilter('OPD')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDepartmentFilter === 'OPD'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100'
              }`}
            >
              OPD ({invoices.filter(i => i.patientType === 'OPD').length})
            </button>
          </div>
        </div>

        {/* Card 4: Front Desk Cashier Terminal */}
        <div className="glass-card-soft-indigo relative overflow-hidden rounded-2xl py-2.5 px-3.5 sm:py-3 sm:px-4 flex flex-col justify-between group hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Cashier Counter #1</span>
          </div>

          <div className="mt-2.5">
            <button
              onClick={() => setIsNewBillModalOpen(true)}
              className="w-full py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create New Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. FILTER TABS & SEARCH BAR ── */}
      <div className="glass-panel-3d relative overflow-hidden rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Specular Light Sheen */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

        {/* Status Filter Tabs (ALL / PENDING / PAID) with tactile colored pills */}
        <div className="flex items-center gap-2">
          {(['ALL', 'PENDING', 'PAID'] as PaymentStatus[]).map(st => {
            const isActive = selectedStatusTab === st;
            const count = st === 'ALL' 
              ? invoices.length 
              : invoices.filter(i => i.status === st).length;

            let tabActiveStyle = 'bg-slate-900 text-white shadow-xs';
            let tabInactiveStyle = 'bg-white/80 backdrop-blur-md text-slate-600 hover:bg-white hover:text-slate-900 border border-white/90 shadow-2xs';
            let badgeStyle = isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700';

            if (st === 'PENDING') {
              tabInactiveStyle = 'bg-rose-50/80 backdrop-blur-md text-rose-700 hover:bg-rose-100/80 border border-rose-200/70 shadow-2xs';
              if (isActive) {
                tabActiveStyle = 'bg-rose-600 text-white shadow-xs border border-rose-700';
                badgeStyle = 'bg-white/25 text-white';
              }
            } else if (st === 'PAID') {
              tabInactiveStyle = 'bg-emerald-50/80 backdrop-blur-md text-emerald-700 hover:bg-emerald-100/80 border border-emerald-200/70 shadow-2xs';
              if (isActive) {
                tabActiveStyle = 'bg-emerald-600 text-white shadow-xs border border-emerald-700';
                badgeStyle = 'bg-white/25 text-white';
              }
            }

            return (
              <button
                key={st}
                onClick={() => setSelectedStatusTab(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 active:scale-95 ${
                  isActive ? tabActiveStyle : tabInactiveStyle
                }`}
              >
                <span>{st}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${badgeStyle}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input with Clear Button */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search patient, bill ID, phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white/80 backdrop-blur-md border border-white/90 focus:border-blue-400/80 focus:bg-white rounded-xl text-xs font-semibold text-slate-800 outline-none transition-all shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.03)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── 3. USER'S EXACT REFERENCE TABLE DESIGN (ELEVATED & MODERN 3D GLASS) ── */}
      <div className="glass-panel-3d relative overflow-hidden rounded-3xl shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        {/* Specular Light Sheen */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/90 bg-slate-50/90 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-4 px-5">PATIENT NAME</th>
                <th className="py-4 px-5">INVOICE ID</th>
                <th className="py-4 px-5">DATE</th>
                <th className="py-4 px-5">AMOUNT</th>
                <th className="py-4 px-5">DUE</th>
                <th className="py-4 px-5">STATUS</th>
                <th className="py-4 px-5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingBilling && paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500 font-bold bg-white/60">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold text-slate-700">Loading billing invoices from database...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="font-semibold text-sm text-slate-600">No matching billing invoices found</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing your search query or filters</p>
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map(inv => {
                  const isPaid = inv.status === 'PAID';
                  const isPending = inv.status === 'PENDING';

                  return (
                    <tr 
                      key={inv.id} 
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* 1. PATIENT NAME + AVATAR + [IPD/OPD] TAG */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 border shadow-2xs ${
                            inv.patientType === 'IPD'
                              ? 'bg-blue-100/80 text-blue-700 border-blue-200'
                              : 'bg-teal-100/80 text-teal-700 border-teal-200'
                          }`}>
                            {inv.patientName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                                {inv.patientName}
                              </span>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border shrink-0 ${
                                inv.patientType === 'IPD'
                                  ? 'bg-blue-50 text-blue-600 border-blue-200/90'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200/90'
                              }`}>
                                {inv.patientType}
                              </span>
                            </div>
                            <div className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">
                              {inv.uhid} • {inv.doctor}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. INVOICE ID */}
                      <td className="py-3.5 px-5">
                        <span className="font-mono font-semibold text-slate-600 text-xs tracking-tight bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/70 inline-block">
                          {inv.billNumber}
                        </span>
                      </td>

                      {/* 3. DATE */}
                      <td className="py-3.5 px-5">
                        <span className="text-slate-700 font-medium text-xs">
                          {inv.invoiceDate}
                        </span>
                      </td>

                      {/* 4. AMOUNT */}
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-slate-900 font-mono text-sm">
                          ₹{inv.amount.toLocaleString()}
                        </span>
                      </td>

                      {/* 5. DUE */}
                      <td className="py-3.5 px-5">
                        <span className={`font-bold font-mono text-sm px-2 py-0.5 rounded-lg border inline-block ${
                          inv.due > 0 
                            ? 'text-rose-600 bg-rose-50 border-rose-200/80' 
                            : 'text-emerald-700 bg-emerald-50/80 border-emerald-200/60'
                        }`}>
                          ₹{inv.due.toLocaleString()}
                        </span>
                      </td>

                      {/* 6. STATUS PILL */}
                      <td className="py-3.5 px-5">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                            <Clock className="w-3.5 h-3.5" />
                            <span>PENDING</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                            <Check className="w-3.5 h-3.5" />
                            <span>PAID</span>
                          </span>
                        )}
                      </td>

                      {/* 7. ACTIONS (4 Working Buttons: Calculator, Eye, Check, Printer) */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* BUTTON 0: CALCULATOR (Auto-Recalculate: Stay Days × Bed Rate + Doctor + Services) */}
                          <button
                            onClick={() => handleAutoRecalculate(inv)}
                            disabled={recalculatingUhid === inv.uhid}
                            title="Auto-Recalculate Bill (Stay Days × Bed Rate + Doctor + Services - Advance)"
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all border ${
                              recalculatingUhid === inv.uhid
                                ? 'bg-amber-100 text-amber-700 border-amber-300 animate-spin cursor-wait'
                                : 'bg-white hover:bg-amber-50 text-slate-600 hover:text-amber-600 border-slate-200/90 cursor-pointer hover:scale-105 active:scale-95 shadow-2xs'
                            }`}
                          >
                            <Calculator className="w-4 h-4" />
                          </button>

                          {/* BUTTON 1: EYE (Preview Full Invoice Details) */}
                          <button
                            onClick={() => handleViewInvoice(inv)}
                            title="Preview Full Invoice"
                            className="w-8 h-8 rounded-xl bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200/90 flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-2xs"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* BUTTON 2: CHECK (Collect Due Payment / Mark as Paid) */}
                          <button
                            onClick={() => handleInitiateCollect(inv)}
                            title={inv.due > 0 ? "Collect Due Payment" : "Already Paid in Full"}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all border ${
                              inv.due > 0
                                ? 'bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-700 border-emerald-300 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs'
                                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>

                          {/* BUTTON 3: PRINTER (Print Tax Invoice Receipt) */}
                          <button
                            onClick={() => handlePrintInvoice(inv)}
                            title="Print Tax Receipt"
                            className="w-8 h-8 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/90 flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-2xs"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: Previous & Next Pagination Bar + Ledger Summary */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-t-2 border-slate-200/90 flex flex-wrap items-center justify-between gap-4 text-xs">
          
          {/* Left: Summary text & Rows per page */}
          <div className="flex items-center gap-3">
            <span className="text-slate-600 font-semibold">
              Showing <strong className="text-slate-900 font-bold">{filteredInvoices.length === 0 ? 0 : startIndex + 1}</strong> to <strong className="text-slate-900 font-bold">{endIndex}</strong> of <strong className="text-slate-900 font-bold">{filteredInvoices.length}</strong> invoices
            </span>
            <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-slate-200">
              <span className="text-[11px] text-slate-400 font-medium">Rows:</span>
              {[6, 10, 16].map(sz => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => {
                    setPageSize(sz);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    pageSize === sz
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Center: Tactile Previous & Next Controls with Page Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 mx-auto sm:mx-0">
            {/* Previous Button */}
            <button
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() => {
                if (safeCurrentPage > 1) {
                  setCurrentPage(prev => prev - 1);
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs border ${
                safeCurrentPage <= 1
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                  : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 border-slate-200 hover:border-blue-300 cursor-pointer active:scale-95'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Page Number Pills */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
                    pageNum === safeCurrentPage
                      ? 'bg-blue-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.35)] border border-blue-700'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              type="button"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => {
                if (safeCurrentPage < totalPages) {
                  setCurrentPage(prev => prev + 1);
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs border ${
                safeCurrentPage >= totalPages
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                  : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 border-slate-200 hover:border-blue-300 cursor-pointer active:scale-95'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Summary Pills */}
          <div className="flex items-center gap-2.5 ml-auto">
            <div className="bg-blue-50/90 border border-blue-200/90 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
              <span className="text-[11px] font-semibold text-blue-700">Total:</span>
              <strong className="text-blue-950 font-mono font-bold text-xs">
                ₹{filteredInvoices.reduce((a, b) => a + b.amount, 0).toLocaleString()}
              </strong>
            </div>
            <div className="bg-rose-50/90 border border-rose-200/90 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
              <span className="text-[11px] font-semibold text-rose-700">Pending Due:</span>
              <strong className="text-rose-950 font-mono font-bold text-xs">
                ₹{filteredInvoices.reduce((a, b) => a + b.due, 0).toLocaleString()}
              </strong>
            </div>
          </div>

        </div>
      </div>

      {/* ── 4. MODAL: COLLECT DUE PAYMENT (Triggered by Green Check Button) ── */}
      {collectPaymentInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            
            <div className="px-5 py-4 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-sm">Collect Due Payment</h3>
              </div>
              <button
                onClick={() => setCollectPaymentInvoice(null)}
                className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              
              {/* Patient Snapshot */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-sm">{collectPaymentInvoice.patientName}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                    {collectPaymentInvoice.patientType}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">Bill #{collectPaymentInvoice.billNumber}</p>
                <p className="text-[11px] text-slate-500">{collectPaymentInvoice.doctor} • {collectPaymentInvoice.wardOrBed || 'OPD'}</p>
              </div>

              {/* Outstanding Amount */}
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-rose-800 uppercase block">Outstanding Due</span>
                  <span className="text-[10px] text-rose-600">Pending settlement</span>
                </div>
                <span className="text-xl font-bold text-rose-600 font-mono">
                  ₹{collectPaymentInvoice.due.toLocaleString()}
                </span>
              </div>

              {/* Select Payment Mode */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Cash', 'UPI / QR', 'Debit/Credit Card', 'Insurance / TPA'] as PaymentMethod[]).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setCollectingMethod(m)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer text-left transition-all ${
                        collectingMethod === m
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount to Collect Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Amount to Collect (₹)</label>
                <input
                  type="number"
                  value={collectingAmount}
                  onChange={e => setCollectingAmount(Number(e.target.value))}
                  max={collectPaymentInvoice.due}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setCollectPaymentInvoice(null)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPaymentCollection}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm & Settle</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. MODAL: FULL TAX INVOICE INSPECTOR (Triggered by Eye & Printer Buttons) ── */}
      {inspectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                  Tax Invoice • {inspectedInvoice.billNumber}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setInspectedInvoice(null)}
                  className="w-7 h-7 rounded-full hover:bg-white/20 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Paper View */}
            <div className="p-6 overflow-y-auto space-y-4 text-slate-800 bg-[#FAFAFC]">
              
              {/* Letterhead */}
              <div className="flex justify-between items-start pb-4 border-b-2 border-slate-800 gap-4">
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight uppercase">
                    CHAUDHARY HEALTH CARE CENTER
                  </h1>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Multi-Speciality Hospital & Research Institute • 24x7 Emergency & Trauma
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Civil Lines, MG Marg, Prayagraj - 211001 (U.P.) • Phone: +91 98765 43210
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[9.5px] font-bold text-slate-600">
                    <span className="bg-slate-200 px-1.5 py-0.2 rounded">GSTIN: 09AAACC4910K1ZP</span>
                    <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">NABH Accredited</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white uppercase tracking-wider mb-1">
                    TAX INVOICE
                  </span>
                  <p className="font-mono font-bold text-sm text-slate-900">{inspectedInvoice.billNumber}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{inspectedInvoice.invoiceDate}</p>
                </div>
              </div>

              {/* Patient Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-white rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Patient Name</span>
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{inspectedInvoice.patientName}</span>
                    <span className="text-[9px] px-1 rounded bg-blue-100 text-blue-700 font-bold">{inspectedInvoice.patientType}</span>
                  </p>
                  <p className="text-[10px] text-slate-500">{inspectedInvoice.gender === 'F' ? 'Female' : inspectedInvoice.gender === 'M' ? 'Male' : '—'}, {inspectedInvoice.age || '—'} Yrs</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">UHID & Contact</span>
                  <p className="font-mono font-bold text-slate-900">{inspectedInvoice.uhid}</p>
                  <p className="text-[10px] text-slate-500">{inspectedInvoice.phone}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Doctor In Charge</span>
                  <p className="font-bold text-slate-900">{inspectedInvoice.doctor}</p>
                  <p className="text-[10px] text-teal-700 font-semibold">{inspectedInvoice.wardOrBed || 'OPD Desk'}</p>
                </div>
              </div>

              {/* Itemized Services */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Medical Service Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Rate</th>
                      <th className="py-2.5 px-3 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inspectedInvoice.items.map((it, idx) => (
                      <tr key={it.id}>
                        <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{it.name}</td>
                        <td className="py-2 px-3 text-center text-slate-600 font-mono">{it.qty}</td>
                        <td className="py-2 px-3 text-right text-slate-600 font-mono">₹{it.rate.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">₹{(it.rate * it.qty).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Amount Breakdown */}
              <div className="flex justify-between items-end p-4 bg-white rounded-2xl border border-slate-200 text-xs">
                <div className="space-y-1">
                  <p className="text-slate-500">
                    Status: <strong className={inspectedInvoice.status === 'PAID' ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>{inspectedInvoice.status}</strong>
                  </p>
                  <p className="text-slate-500">Settled via: <strong className="text-slate-800">{inspectedInvoice.paymentMethod || '—'}</strong></p>
                  {inspectedInvoice.transactionRef && (
                    <p className="font-mono text-[10px] text-slate-400">Ref: {inspectedInvoice.transactionRef}</p>
                  )}
                </div>

                <div className="w-52 space-y-1 text-right">
                  <div className="flex justify-between text-slate-500">
                    <span>Total Amount:</span>
                    <span className="font-mono font-bold text-slate-900">₹{inspectedInvoice.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Due Balance:</span>
                    <span className={`font-mono font-bold ${inspectedInvoice.due > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      ₹{inspectedInvoice.due.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                    <span>Amount Paid:</span>
                    <span className="font-mono text-emerald-700">₹{(inspectedInvoice.amount - inspectedInvoice.due).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 flex justify-between items-end text-xs text-slate-400">
                <p className="text-[10px]">Computer generated invoice from Chaudhary Receptionist Desk #1.</p>
                <div className="text-right">
                  <div className="w-28 border-b border-slate-300 mb-1" />
                  <p className="text-[10px] font-bold text-slate-600 uppercase">Authorized Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. MODAL: ISSUE NEW BILL ── */}
      {isNewBillModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Create New Patient Bill</h3>
              </div>
              <button
                onClick={() => setIsNewBillModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewBill} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mishra Ji"
                  value={newPatientName}
                  onChange={e => setNewPatientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Patient Type</label>
                  <select
                    value={newPatientType}
                    onChange={e => setNewPatientType(e.target.value as PatientType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-medium"
                  >
                    <option value="IPD">IPD (Inpatient)</option>
                    <option value="OPD">OPD (Outpatient)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newAmount}
                    onChange={e => setNewAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 font-mono text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Consultant Doctor</label>
                  <select
                    value={newDoctor}
                    onChange={e => setNewDoctor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-medium"
                  >
                    <option value="Dr. Vikram Singh">Dr. Vikram Singh</option>
                    <option value="Dr. Sunita Verma">Dr. Sunita Verma</option>
                    <option value="Dr. Amit Singh">Dr. Amit Singh</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Initial Status</label>
                  <select
                    value={newPaymentStatus}
                    onChange={e => setNewPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-medium"
                  >
                    <option value="PENDING">PENDING (Due)</option>
                    <option value="PAID">PAID (Settled)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewBillModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer"
                >
                  Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
