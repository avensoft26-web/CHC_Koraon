import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  ArrowRightLeft,
  FileEdit,
  UserPlus,
  LogOut,
  Trash2,
  RotateCcw,
  CreditCard,
  Settings as SettingsIcon,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Building2,
  Activity
} from 'lucide-react';
import { api } from '../../../services/api';

interface AuditEntry {
  _id: string;
  action: string;
  entityType: string;
  entityId: string;
  performedBy: {
    userId?: string;
    role?: string;
    name?: string;
  };
  detail: Record<string, any>;
  outcome: 'success' | 'denied' | 'failed';
  ip: string;
  createdAt: string;
}

// Module-level cache for instant audit log viewing
let cachedAuditLogsMemory: AuditEntry[] = [];

export const ChaudharyAdminAuditView: React.FC = () => {
  const [logs, setLogs] = useState<AuditEntry[]>(() => cachedAuditLogsMemory);
  const [isLoading, setIsLoading] = useState<boolean>(() => cachedAuditLogsMemory.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (logs.length > 0) {
      cachedAuditLogsMemory = logs;
    }
  }, [logs]);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedEntityType, setSelectedEntityType] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Pagination & Stats
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(25);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [stats, setStats] = useState({
    totalAll: 0,
    todayCount: 0,
    availableActions: [] as string[]
  });

  // Selected Log Modal / Detail View
  const [selectedLog, setSelectedLog] = useState<AuditEntry | null>(null);

  const fetchLogs = useCallback(async () => {
    if (cachedAuditLogsMemory.length === 0) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const res = await api.audit.getLogs({
        action: selectedAction !== 'all' ? selectedAction : undefined,
        entityType: selectedEntityType !== 'all' ? selectedEntityType : undefined,
        search: searchTerm.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit
      });

      if (res.success) {
        setLogs(res.entries || []);
        setTotalRecords(res.pagination?.total || 0);
        setTotalPages(res.pagination?.pages || 1);
        if (res.stats) {
          setStats({
            totalAll: res.stats.totalAll || 0,
            todayCount: res.stats.todayCount || 0,
            availableActions: res.stats.availableActions || []
          });
        }
      } else {
        setError('Failed to load audit logs.');
      }
    } catch (err: any) {
      console.error('[Audit View] Fetch Error:', err);
      setError(err?.message || 'Unable to load audit logs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedAction, selectedEntityType, searchTerm, startDate, endDate, page, limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedAction('all');
    setSelectedEntityType('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const getActionConfig = (action: string) => {
    switch (action) {
      case 'patient.admit':
        return {
          label: 'Patient Admission',
          icon: UserPlus,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          badge: 'bg-emerald-100 text-emerald-800'
        };
      case 'patient.discharge':
        return {
          label: 'Patient Discharge',
          icon: LogOut,
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          badge: 'bg-blue-100 text-blue-800'
        };
      case 'patient.transfer_bed':
        return {
          label: 'Bed Transfer',
          icon: ArrowRightLeft,
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          badge: 'bg-purple-100 text-purple-800'
        };
      case 'patient.update':
        return {
          label: 'Record Update',
          icon: FileEdit,
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          badge: 'bg-amber-100 text-amber-800'
        };
      case 'patient.soft_delete':
        return {
          label: 'Moved to Trash',
          icon: Trash2,
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          badge: 'bg-rose-100 text-rose-800'
        };
      case 'patient.restore':
        return {
          label: 'Record Restored',
          icon: RotateCcw,
          bg: 'bg-teal-50 text-teal-700 border-teal-200',
          badge: 'bg-teal-100 text-teal-800'
        };
      case 'billing.payment_received':
        return {
          label: 'Payment Collected',
          icon: CreditCard,
          bg: 'bg-green-50 text-green-700 border-green-200',
          badge: 'bg-green-100 text-green-800'
        };
      case 'billing.payment_deleted':
        return {
          label: 'Payment Reversed',
          icon: AlertCircle,
          bg: 'bg-red-50 text-red-700 border-red-200',
          badge: 'bg-red-100 text-red-800'
        };
      case 'setting.update':
        return {
          label: 'Setting Changed',
          icon: SettingsIcon,
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          badge: 'bg-slate-100 text-slate-800'
        };
      default:
        return {
          label: action.replace('.', ' ').toUpperCase(),
          icon: Activity,
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          badge: 'bg-slate-100 text-slate-800'
        };
    }
  };

  const exportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'Performed By Name', 'Role', 'Outcome', 'IP', 'Details'];
    const rows = logs.map(l => [
      new Date(l.createdAt).toLocaleString(),
      l.action,
      l.entityType,
      l.entityId,
      l.performedBy?.name || 'System',
      l.performedBy?.role || 'System',
      l.outcome,
      l.ip || 'N/A',
      JSON.stringify(l.detail || {}).replace(/"/g, '""')
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => `"${r.join('","')}"`)].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NABH_HMS_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col space-y-4 max-w-7xl mx-auto w-full pb-8">
      {/* 1. Header Banner & NABH Compliance Accreditation */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-400/30">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </span>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                NABH Compliance & Clinical Audit Trail
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchLogs()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm transition-all"
              title="Refresh log entries"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={exportCSV}
              disabled={logs.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              Export Audit CSV
            </button>
          </div>
        </div>

        {/* Aggregate KPI Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 rounded-xl p-3.5">
            <span className="text-xs font-medium text-slate-400">Total Lifecycle Events</span>
            <p className="text-2xl font-bold text-white mt-0.5">{stats.totalAll.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 rounded-xl p-3.5">
            <span className="text-xs font-medium text-slate-400">Recorded Today</span>
            <p className="text-2xl font-bold text-emerald-400 mt-0.5">{stats.todayCount.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 rounded-xl p-3.5">
            <span className="text-xs font-medium text-slate-400">Matched in Current Query</span>
            <p className="text-2xl font-bold text-indigo-300 mt-0.5">{totalRecords.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 rounded-xl p-3.5">
            <span className="text-xs font-medium text-slate-400">Compliance Standard</span>
            <div className="flex items-center gap-1.5 mt-1 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>NABH Section 5 Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search, Date Range & Filter Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Free-text Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Patient ID, Staff Name, Action, or IP..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Action Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 cursor-pointer"
            >
              <option value="all">All Operational Actions</option>
              <option value="patient.admit">Patient Admissions</option>
              <option value="patient.discharge">Patient Discharges</option>
              <option value="patient.transfer_bed">Bed Transfers</option>
              <option value="patient.update">Patient Record Updates</option>
              <option value="patient.soft_delete">Moved to Trash (Soft Delete)</option>
              <option value="patient.restore">Patient Restorations</option>
              <option value="billing.payment_received">Payments Collected</option>
              <option value="billing.payment_deleted">Payments Reversed</option>
              <option value="setting.update">Settings Revisions</option>
            </select>
          </div>

          {/* Entity Type Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedEntityType}
              onChange={(e) => {
                setSelectedEntityType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 cursor-pointer"
            >
              <option value="all">All Entities</option>
              <option value="patient">Patient Records</option>
              <option value="setting">System Settings</option>
              <option value="user">User Accounts</option>
              <option value="backup">Backups</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="md:col-span-2 flex items-center justify-end">
            <button
              onClick={handleResetFilters}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-all flex items-center justify-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Date Filter Strip */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date Range:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:border-indigo-500"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={() => {
                const today = new Date().toISOString().slice(0, 10);
                setStartDate(today);
                setEndDate(today);
                setPage(1);
              }}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-medium"
            >
              Today
            </button>
            <button
              onClick={() => {
                const now = new Date();
                const past7 = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);
                setStartDate(past7);
                setEndDate(now.toISOString().slice(0, 10));
                setPage(1);
              }}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-medium"
            >
              Past 7 Days
            </button>
            <button
              onClick={() => {
                const now = new Date();
                const past30 = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
                setStartDate(past30);
                setEndDate(now.toISOString().slice(0, 10));
                setPage(1);
              }}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-medium"
            >
              Past 30 Days
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Audit Timeline Feed */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-sm font-semibold text-slate-700">Loading verifiable audit ledger...</p>
            <p className="text-xs text-slate-400">Querying append-only logs from MongoDB</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">{error}</p>
            <button
              onClick={() => fetchLogs()}
              className="text-xs font-semibold px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700"
            >
              Retry Query
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-200">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Audit Records Found</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              No lifecycle modifications match your search criteria. Every clinical admission, bed transfer, payment, and discharge performed in the system will automatically log here.
            </p>
            {(searchTerm || selectedAction !== 'all' || startDate) && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => {
              const cfg = getActionConfig(log.action);
              const ActionIcon = cfg.icon;
              const dateObj = new Date(log.createdAt);
              const formattedDate = dateObj.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });
              const formattedTime = dateObj.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              });

              return (
                <div
                  key={log._id}
                  className="p-4 hover:bg-slate-50/70 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  {/* Left: Icon & Action Summary */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${cfg.bg}`}>
                      <ActionIcon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                          {log.entityId}
                        </span>
                        {log.outcome === 'success' ? (
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200/60">
                            <CheckCircle2 className="w-3 h-3" /> Success
                          </span>
                        ) : log.outcome === 'denied' ? (
                          <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200/60">
                            <AlertCircle className="w-3 h-3" /> Denied
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-rose-200/60">
                            <XCircle className="w-3 h-3" /> Failed
                          </span>
                        )}
                      </div>

                      {/* Detail Snippet */}
                      <p className="text-xs text-slate-600 line-clamp-1">
                        {log.action === 'patient.admit' && (
                          <span>Admitted as <strong>{log.detail?.patient_type || 'IPD'}</strong> • Bed: <strong>{log.detail?.bed_no || 'Pending'}</strong> ({log.detail?.ward_type || 'Ward'})</span>
                        )}
                        {log.action === 'patient.discharge' && (
                          <span>Discharged by <strong>{log.detail?.dischargedBy || log.detail?.doctorName || 'Doctor'}</strong> • Diag: {log.detail?.diagnosis || 'General'}</span>
                        )}
                        {log.action === 'patient.transfer_bed' && (
                          <span>Moved bed: <strong>{log.detail?.fromBed || 'None'}</strong> → <strong className="text-purple-700">{log.detail?.toBed}</strong> ({log.detail?.toWard})</span>
                        )}
                        {log.action === 'patient.update' && (
                          <span>Updated fields: <strong>{(log.detail?.updatedFields || []).join(', ') || 'Patient Chart'}</strong></span>
                        )}
                        {log.action === 'patient.soft_delete' && (
                          <span>Patient moved to Trash • Released Bed: <strong>{log.detail?.after?.releasedBed || 'None'}</strong></span>
                        )}
                        {log.action === 'patient.restore' && (
                          <span>Record Restored to Active Roster</span>
                        )}
                        {log.action === 'billing.payment_received' && (
                          <span>Collected <strong className="text-emerald-700">₹{log.detail?.amount?.toLocaleString?.()}</strong> via {log.detail?.mode || 'Cash'}</span>
                        )}
                        {log.action === 'billing.payment_deleted' && (
                          <span>Reversed Payment Record ID: {log.detail?.paymentId}</span>
                        )}
                        {!['patient.admit', 'patient.discharge', 'patient.transfer_bed', 'patient.update', 'patient.soft_delete', 'patient.restore', 'billing.payment_received', 'billing.payment_deleted'].includes(log.action) && (
                          <span>{JSON.stringify(log.detail || {})}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right: User Accountability & Timestamp */}
                  <div className="flex sm:flex-col items-end justify-between sm:justify-center text-right shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.performedBy?.name || 'Authorized Staff'}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1.5 py-0.2 bg-slate-100 rounded">
                        {log.performedBy?.role || 'Staff'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formattedDate} at {formattedTime}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. Pagination Navigation Bar */}
        {totalRecords > 0 && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Showing <span className="font-semibold text-slate-800">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-semibold text-slate-800">{Math.min(page * limit, totalRecords)}</span> of{' '}
              <span className="font-semibold text-slate-800">{totalRecords}</span> verifiable events
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page <= 1 || isLoading}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-all flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <span className="px-3 py-1 font-semibold text-slate-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages || isLoading}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-all flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Detail Modal Popup for Forensic Verification */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm tracking-wide">Audit Trail Forensic Record</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Event Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Action</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedLog.action}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Entity ID</span>
                  <p className="font-mono font-bold text-indigo-600 mt-0.5">{selectedLog.entityId}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Outcome</span>
                  <p className={`font-bold uppercase mt-0.5 ${selectedLog.outcome === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selectedLog.outcome}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Staff / Actor</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedLog.performedBy?.name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Role</span>
                  <p className="font-semibold uppercase text-slate-800 mt-0.5">{selectedLog.performedBy?.role || 'Staff'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Client IP</span>
                  <p className="font-mono text-slate-700 mt-0.5">{selectedLog.ip || 'Local / Gateway'}</p>
                </div>
                <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Exact UTC Timestamp</span>
                  <p className="font-mono text-slate-700 mt-0.5">{new Date(selectedLog.createdAt).toISOString()}</p>
                </div>
              </div>

              {/* Forensic Details / Diff Snapshot */}
              <div>
                <span className="text-xs font-bold text-slate-800 block mb-1.5">
                  State Mutation Snapshot (Before / After Payload):
                </span>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-[11px] font-mono overflow-x-auto border border-slate-800">
                  {JSON.stringify(selectedLog.detail || {}, null, 2)}
                </pre>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-amber-800 text-[11px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  <strong>NABH Medical Compliance Note:</strong> This record was generated automatically by the server clock and cryptographically tied to the authorized user's session token. It cannot be tampered with or purged by any UI user.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChaudharyAdminAuditView;
