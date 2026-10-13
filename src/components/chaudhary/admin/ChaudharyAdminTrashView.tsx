import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Trash2,
  Search,
  X,
  AlertTriangle,
  RefreshCw,
  RotateCcw,
  BedDouble,
  Calendar,
  ShieldAlert,
  History,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { api, ApiError } from '../../../services/api';
import { useHospitalContext } from '../../../context/HospitalContext';

/**
 * Admin-only patient trash.
 *
 * Shows records that were soft-deleted from the active patient list, and lets
 * an administrator put one back. Restoring is deliberately NOT a single blind
 * click: the server re-checks that the record's bed is genuinely free before
 * re-activating it, and if it is not, this view surfaces the conflict and
 * offers to restore the record WITHOUT re-claiming a bed.
 *
 * No bulk restore and no permanent delete exist here on purpose — a hospital
 * record is only ever returned to service one at a time, by an administrator
 * who has looked at it.
 */

interface BedHistoryEntry {
  bed_no?: string;
  start_date?: string;
  end_date?: string;
}

interface TrashRow {
  patient_id: string;
  name: string;
  age?: number;
  gender?: string;
  status?: string;
  patient_type?: string;
  bed_no?: string | null;
  bedHistory?: BedHistoryEntry[];
  admission_date?: string;
  doctor_assigned?: string;
}

interface AuditEntry {
  _id: string;
  action: string;
  entityId: string;
  outcome: string;
  performedBy?: { userId?: string; role?: string; name?: string };
  detail?: any;
  createdAt?: string;
}

/** A reason the server would refuse to restore a record into its old bed. */
interface RestoreObstacle {
  kind: 'occupied' | 'notInRoster';
  bed: string;
  occupiedBy: string | null;
}

const fmtDate = (d?: string | null) => {
  if (!d) return '—';
  try {
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
};

// Module-level cache for instant tab navigation
let cachedTrashMemory: TrashRow[] = [];

export const ChaudharyAdminTrashView: React.FC = () => {
  const ctx = useHospitalContext();
  const showToast = ctx?.showToast ?? (() => {});

  const [rows, setRows] = useState<TrashRow[]>(() => cachedTrashMemory);
  const [isLoading, setIsLoading] = useState(() => cachedTrashMemory.length === 0);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    cachedTrashMemory = rows;
  }, [rows]);

  // Bed board, used only to tell the admin up-front whether a restore would
  // collide with somebody already in that bed.
  const [occupiedBeds, setOccupiedBeds] = useState<Record<string, string>>({});
  // The current roster, used to spot a record still pointing at a bed that no
  // longer exists — the server refuses that restore as well.
  const [roster, setRoster] = useState<Set<string>>(() => new Set());

  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [auditError, setAuditError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [conflict, setConflict] = useState<{
    row: TrashRow;
    code: string;
    message: string;
    bed: string;
    occupiedBy: string | null;
  } | null>(null);
  const [showAudit, setShowAudit] = useState(false);

  const load = useCallback(async () => {
    try {
      if (cachedTrashMemory.length === 0) {
        setIsLoading(true);
      }
      const [trashRes, bedsRes] = await Promise.all([
        api.patients.getTrash(),
        api.beds.getAll().catch(() => null),
      ]);
      const list = Array.isArray(trashRes?.patients) ? trashRes.patients : [];
      setRows(list);

      const map: Record<string, string> = {};
      const rosterSet = new Set<string>();
      if (bedsRes?.success && Array.isArray(bedsRes.beds)) {
        bedsRes.beds.forEach((b: any) => {
          if (!b?.bedNo) return;
          rosterSet.add(String(b.bedNo).trim().toLowerCase());
          if (b.status === 'Occupied') map[String(b.bedNo).trim().toLowerCase()] = b?.patient?.id || 'another patient';
        });
      }
      setOccupiedBeds(map);
      setRoster(rosterSet);
      setLoadError(null);
    } catch (err: any) {
      setLoadError(err?.message || 'Unable to load the patient trash.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadAudit = useCallback(async () => {
    try {
      const res = await api.audit.get({ entityType: 'patient', limit: 30 });
      setAuditEntries(Array.isArray(res?.entries) ? res.entries : []);
      setAuditError(null);
    } catch (err: any) {
      setAuditError(err?.message || 'Unable to load the audit trail.');
    }
  }, []);

  useEffect(() => {
    load();
    loadAudit();
  }, [load, loadAudit]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        String(r.patient_id || '').toLowerCase().includes(q) ||
        String(r.name || '').toLowerCase().includes(q) ||
        String(r.bed_no || '').toLowerCase().includes(q)
    );
  }, [rows, query]);

  /**
   * The bed this record would re-claim on restore — an exact mirror of the
   * server rule in patientController.restorePatient: only an Admitted record
   * that still carries a `bed_no` re-activates a bed claim. A discharged
   * record holds no bed, and an unclosed bedHistory period alone does not
   * claim one, so neither is treated as an obstacle here.
   */
  const claimedBedOf = (row: TrashRow): string | null =>
    row.status === 'Admitted' && row.bed_no ? row.bed_no : null;

  /**
   * What the server would refuse, worked out up-front so the administrator
   * sees it before clicking. Same two checks the API performs, in the same
   * order: occupied by another live inpatient, or not in the current roster.
   */
  const obstacleFor = (row: TrashRow): RestoreObstacle | null => {
    const bed = claimedBedOf(row);
    if (!bed) return null;
    const occupant = occupiedBeds[String(bed).trim().toLowerCase()];
    if (occupant) return { kind: 'occupied', bed, occupiedBy: occupant };
    if (roster.size > 0 && !roster.has(String(bed).trim().toLowerCase())) {
      return { kind: 'notInRoster', bed, occupiedBy: null };
    }
    return null;
  };

  const handleRestore = async (row: TrashRow, releaseBed = false) => {
    setBusyId(row.patient_id);
    try {
      const res = await api.patients.restore(row.patient_id, { releaseBed });
      if (res?.success) {
        showToast(
          releaseBed
            ? `Patient ${row.patient_id} restored without a bed assignment.`
            : `Patient ${row.patient_id} restored to the active list.`
        );
        setConflict(null);
        await load();
        await loadAudit();
        await ctx?.refreshPatients?.().catch(() => {});
      } else {
        showToast(`Patient ${row.patient_id} was not restored — the server did not confirm it.`);
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 409) {
        const code = err.body?.code || 'BED_OCCUPIED';
        setConflict({
          row,
          code,
          message: err.body?.message || err.message,
          bed: err.body?.conflict?.bed_no || claimedBedOf(row) || '—',
          occupiedBy: err.body?.conflict?.occupiedBy ?? null,
        });
        await loadAudit();
      } else {
        showToast(`Restore of ${row.patient_id} failed — ${err?.message || 'unknown error'}`);
      }
    } finally {
      setBusyId(null);
    }
  };

  const obstacleBadge = (row: TrashRow) => {
    const o = obstacleFor(row);
    if (!o) return null;
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
        <AlertTriangle className="w-3 h-3" />
        {o.kind === 'occupied' ? `${o.bed} held by ${o.occupiedBy}` : `${o.bed} not in roster`}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-5 py-2 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Patient Trash</h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold">
              {isLoading ? '…' : rows.length} record{rows.length === 1 ? '' : 's'}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Soft-deleted patients. Records are kept with their full history — restoring one returns it to the active list.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setShowAudit(true);
              loadAudit();
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Audit trail</span>
          </button>
          <button
            onClick={() => { setIsLoading(true); load(); loadAudit(); }}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Explanation banner */}
      <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 font-medium leading-relaxed">
          Restoring is checked by the server before anything is written. If the bed this record still claims is now
          occupied by another inpatient, the restore is refused and you can bring the record back{' '}
          <span className="font-bold text-slate-800">without</span> a bed assignment — its ward history is preserved
          either way. Every restore is written to the audit trail.
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-72">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by ID, name or bed..."
          className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-slate-400 outline-none transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && rows.length === 0 && (
        <div className="p-12 text-center rounded-2xl border border-slate-200/80 bg-white">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-2.5 animate-pulse">
            <Trash2 className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">Loading deleted records…</h4>
          <p className="text-xs text-slate-400 mt-0.5">Fetching from the database.</p>
        </div>
      )}

      {/* Error */}
      {!isLoading && loadError && (
        <div className="p-12 text-center rounded-2xl border border-rose-200 bg-rose-50">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-400 mx-auto mb-2.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-rose-700">Unable to load the patient trash</h4>
          <p className="text-xs text-rose-500 mt-0.5">{loadError}</p>
          <button
            onClick={() => { setIsLoading(true); load(); }}
            className="mt-3 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !loadError && rows.length === 0 && (
        <div className="p-12 text-center rounded-2xl border border-slate-200/80 bg-white">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-2.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">No deleted patients</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Nothing has been removed from the active patient list. Records appear here only after an admin deletes one.
          </p>
        </div>
      )}

      {/* Rows */}
      {!isLoading && !loadError && filtered.length === 0 && rows.length > 0 && (
        <div className="p-8 text-center rounded-2xl border border-slate-200/80 bg-white">
          <h4 className="text-sm font-bold text-slate-800">No records match “{query}”</h4>
          <button
            onClick={() => setQuery('')}
            className="mt-3 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
          >
            Clear search
          </button>
        </div>
      )}

      {!isLoading && !loadError && filtered.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            <span className="col-span-2">Patient ID</span>
            <span className="col-span-3">Name</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2">Admitted</span>
            <span className="col-span-3 text-right">Action</span>
          </div>

          {filtered.map((row) => {
            const obstacle = obstacleFor(row);
            const bed = claimedBedOf(row);
            const busy = busyId === row.patient_id;

            return (
              <div
                key={row.patient_id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 px-4 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors items-center"
              >
                <span className="sm:col-span-2 text-xs font-bold text-slate-800 font-mono">{row.patient_id}</span>

                <span className="sm:col-span-3 text-xs font-semibold text-slate-700 truncate">
                  {row.name || '—'}
                  {row.age != null && <span className="text-slate-400 font-medium"> · {row.age}</span>}
                </span>

                <span className="sm:col-span-2 flex flex-wrap items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600">
                    {row.status || 'Unknown'}
                  </span>
                  {bed && !obstacle && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500">
                      <BedDouble className="w-3 h-3" />
                      {bed}
                    </span>
                  )}
                  {obstacleBadge(row)}
                </span>

                <span className="sm:col-span-2 text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {fmtDate(row.admission_date)}
                </span>

                <span className="sm:col-span-3 flex justify-start sm:justify-end">
                  <button
                    onClick={() => handleRestore(row)}
                    disabled={busy}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} />
                    <span>{busy ? 'Restoring…' : 'Restore'}</span>
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Conflict modal — server refused the restore, offer the safe alternative */}
      {conflict && (
        <Modal
          isOpen={!!conflict}
          onClose={() => setConflict(null)}
          title={conflict.code === 'BED_NOT_IN_ROSTER' ? 'Bed no longer in roster' : 'Bed already occupied'}
          subtitle={`Restore of ${conflict.row.patient_id}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 leading-relaxed text-amber-900 font-medium">
              {conflict.message}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Bed</span>
                <span className="font-bold text-slate-800 mt-0.5 block font-mono">{conflict.bed}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  {conflict.code === 'BED_NOT_IN_ROSTER' ? 'In current roster' : 'Currently held by'}
                </span>
                <span className="font-bold text-slate-800 mt-0.5 block font-mono">
                  {conflict.code === 'BED_NOT_IN_ROSTER' ? 'No — bed removed' : conflict.occupiedBy || '—'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Restoring without a bed brings the record back to the active patient list and closes its old bed stay.
              The ward history is kept, and the bed is not taken away from its current occupant.
            </p>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConflict(null)}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRestore(conflict.row, true)}
                disabled={busyId === conflict.row.patient_id}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>
                  {busyId === conflict.row.patient_id ? 'Restoring…' : 'Restore without a bed'}
                </span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Audit trail modal */}
      {showAudit && (
        <Modal
          isOpen={showAudit}
          onClose={() => setShowAudit(false)}
          title="Patient lifecycle audit trail"
          subtitle="Who deleted or restored which record, and when"
          maxWidth="lg"
        >
          <div className="space-y-3 text-xs">
            {auditError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                {auditError}
              </div>
            )}

            {!auditError && auditEntries.length === 0 && (
              <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-200">
                <History className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No audited actions yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Entries appear here after the first delete or restore performed through this system.
                </p>
              </div>
            )}

            {!auditError && auditEntries.length > 0 && (
              <div className="max-h-[55vh] overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
                {auditEntries.map((e) => (
                  <div key={e._id} className="px-3 py-2.5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 font-mono text-[11px]">{e.entityId}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${
                            e.action === 'patient.restore'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-rose-50 border-rose-200 text-rose-700'
                          }`}
                        >
                          {e.action === 'patient.restore' ? 'RESTORE' : 'DELETE'}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                            e.outcome === 'denied'
                              ? 'bg-amber-50 border border-amber-200 text-amber-700'
                              : 'bg-slate-100 border border-slate-200 text-slate-600'
                          }`}
                        >
                          {e.outcome.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">
                        {e.performedBy?.name || 'Unknown user'}
                        {e.performedBy?.role ? ` · ${e.performedBy.role}` : ''}
                      </p>
                      {e.detail?.after?.releasedBed && (
                        <p className="text-[10px] text-slate-400 font-medium">
                          Released bed {e.detail.after.releasedBed}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                      {fmtDate(e.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
