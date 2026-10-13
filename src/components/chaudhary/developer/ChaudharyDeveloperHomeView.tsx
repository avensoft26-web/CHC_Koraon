import React, { useState, useEffect, useCallback } from 'react';
import {
  Terminal, Server, Activity, Database, Cpu, HardDrive,
  RefreshCw, CheckCircle2, AlertTriangle,
  Layers, Radio
} from 'lucide-react';
import { AdminNavTab } from '../admin/ChaudharyAdminSidebar';
import { api } from '../../../services/api';

interface EndpointProbe {
  endpoint: string;
  ok: boolean;
  latencyMs: number;
}

interface StorageCounts {
  label: string;
  count: number | null;
  unit: string;
}

interface ChaudharyDeveloperHomeViewProps {
  onNavigate: (tab: AdminNavTab) => void;
}

function formatUptime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '—';
  const s = Math.floor(totalSeconds % 60);
  const m = Math.floor((totalSeconds / 60) % 60);
  const h = Math.floor((totalSeconds / 3600) % 24);
  const d = Math.floor(totalSeconds / 86400);
  const parts: string[] = [];
  if (d) parts.push(`${d}d`);
  if (h || d) parts.push(`${h}h`);
  if (m || h || d) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

// Endpoints actually served by this backend — each is measured for real round-trip time
const PROBED_ENDPOINTS = [
  '/health',
  '/patients',
  '/beds',
  '/vitals',
  '/medicines',
  '/appointments',
  '/doctors',
];

export const ChaudharyDeveloperHomeView: React.FC<ChaudharyDeveloperHomeViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'RUNTIME' | 'ENDPOINTS' | 'STORAGE'>('RUNTIME');

  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(false);
  const [health, setHealth] = useState<{ status: string; dbStatus: string; uptime: number; heapUsedMb: number; rssMb: number } | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState<boolean>(true);

  const [probes, setProbes] = useState<EndpointProbe[]>([]);
  const [isProbing, setIsProbing] = useState<boolean>(false);

  const [storage, setStorage] = useState<StorageCounts[]>([]);
  const [isLoadingStorage, setIsLoadingStorage] = useState<boolean>(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  const loadHealth = useCallback(async () => {
    setIsLoadingHealth(true);
    setHealthError(null);
    try {
      const [h, db] = await Promise.all([
        api.system.health(),
        api.system.dbStatus().catch(() => null),
      ]);
      setHealth({
        status: db?.status || h?.status || 'unknown',
        dbStatus: h?.dbStatus || db?.status || 'unknown',
        uptime: h?.uptime ?? 0,
        heapUsedMb: h?.memoryUsage?.heapUsedMb ?? 0,
        rssMb: h?.memoryUsage?.rssMb ?? 0,
      });
    } catch (err: any) {
      setHealth(null);
      setHealthError(err?.message || 'Backend unreachable');
    } finally {
      setIsLoadingHealth(false);
    }
  }, []);

  const runProbes = useCallback(async () => {
    setIsProbing(true);
    try {
      const results = await Promise.all(PROBED_ENDPOINTS.map(ep => api.system.probe(ep)));
      setProbes(results);
    } finally {
      setIsProbing(false);
    }
  }, []);

  const loadStorage = useCallback(async () => {
    setIsLoadingStorage(true);
    setStorageError(null);
    const safe = async (p: Promise<any>): Promise<any[] | null> => {
      try {
        const r = await p;
        if (!r?.success) return null;
        const arrKey = ['patients', 'beds', 'vitals', 'medicines', 'appointments', 'doctors', 'notes', 'orders', 'handovers']
          .find(k => Array.isArray(r[k]));
        return arrKey ? r[arrKey] : null;
      } catch {
        return null;
      }
    };

    const [patients, beds, vitals, medicines, appointments, doctors, notes, orders, handovers] = await Promise.all([
      safe(api.patients.getAll()),
      safe(api.beds.getAll()),
      safe(api.vitals.getAll()),
      safe(api.medicines.getAll()),
      safe(api.appointments.getAll()),
      safe(api.doctors.getAll()),
      safe(api.notes.getAll()),
      safe(api.wardOrders.getAll()),
      safe(api.handovers.getAll()),
    ]);

    setStorage([
      { label: 'Patient records', count: patients?.length ?? null, unit: 'documents' },
      { label: 'Bed allocations', count: beds?.length ?? null, unit: 'beds' },
      { label: 'Vital sign readings', count: vitals?.length ?? null, unit: 'readings' },
      { label: 'Pharmacy inventory', count: medicines?.length ?? null, unit: 'items' },
      { label: 'Appointments', count: appointments?.length ?? null, unit: 'entries' },
      { label: 'Doctor roster', count: doctors?.length ?? null, unit: 'profiles' },
      { label: 'Clinical notes', count: notes?.length ?? null, unit: 'notes' },
      { label: 'Ward orders', count: orders?.length ?? null, unit: 'orders' },
      { label: 'SBAR handovers', count: handovers?.length ?? null, unit: 'records' },
    ]);

    if (patients === null && beds === null && vitals === null) {
      setStorageError('Collections could not be read from the backend.');
    }
    setIsLoadingStorage(false);
  }, []);

  useEffect(() => { loadHealth(); }, [loadHealth]);
  useEffect(() => { runProbes(); }, [runProbes]);
  useEffect(() => { loadStorage(); }, [loadStorage]);

  // Optional manual refresh loop — off by default so an idle tab never polls
  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(() => {
      loadHealth();
      runProbes();
    }, 15000);
    return () => clearInterval(interval);
  }, [isLiveStreaming, loadHealth, runProbes]);

  const clientMemoryMb = (performance as any)?.memory?.usedJSHeapSize
    ? Math.round((performance as any).memory.usedJSHeapSize / 1048576)
    : null;

  const sortedProbes = [...probes].sort((a, b) => a.latencyMs - b.latencyMs);
  const worstLatency = probes.length ? Math.max(...probes.map(p => p.latencyMs)) : null;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner / System Telemetry Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-100 tracking-tight">Runtime &amp; Developer Telemetry</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  LIVE BACKEND
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Server health, measured endpoint latency and persisted record counts read from the hospital database.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400">Client Heap:</span>
              <span className="font-mono font-semibold text-slate-200">
                {clientMemoryMb !== null ? `${clientMemoryMb} MB` : '—'}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-slate-400">Slowest Endpoint:</span>
              <span className="font-mono font-semibold text-teal-300">
                {worstLatency !== null ? `${worstLatency} ms` : '—'}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Backend:</span>
              <span className={`font-semibold ${healthError ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isLoadingHealth ? 'Checking…' : healthError ? 'Unreachable' : (health?.status || 'unknown')}
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('RUNTIME')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'RUNTIME'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Runtime Health
          </button>
          <button
            onClick={() => setActiveTab('ENDPOINTS')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'ENDPOINTS'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Endpoint Latency
          </button>
          <button
            onClick={() => setActiveTab('STORAGE')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'STORAGE'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Persistence &amp; Store
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                isLiveStreaming
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <Radio className={`w-3 h-3 ${isLiveStreaming ? 'animate-pulse' : ''}`} />
              {isLiveStreaming ? 'AUTO-REFRESH' : 'PAUSED'}
            </button>
            <button
              onClick={() => { loadHealth(); runProbes(); loadStorage(); }}
              title="Re-read from backend"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingHealth || isProbing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* RUNTIME HEALTH */}
      {activeTab === 'RUNTIME' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Backend Runtime</h2>
            <span className="text-xs text-slate-500 font-mono">/api/health · /api/db-status</span>
          </div>

          {isLoadingHealth ? (
            <div className="p-10 text-center text-sm text-slate-500">Reading server health…</div>
          ) : healthError ? (
            <div className="p-10 text-center">
              <AlertTriangle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Backend unreachable</p>
              <p className="text-xs text-slate-500 mt-1">{healthError}</p>
            </div>
          ) : health ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-100">
              {[
                { label: 'API Status', value: health.status, icon: Activity, tone: 'text-emerald-600 bg-emerald-50' },
                { label: 'MongoDB', value: health.dbStatus, icon: Database, tone: health.dbStatus === 'connected' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50' },
                { label: 'Process Uptime', value: formatUptime(health.uptime), icon: Server, tone: 'text-indigo-600 bg-indigo-50' },
                { label: 'Server Heap Used', value: `${health.heapUsedMb} MB`, icon: HardDrive, tone: 'text-teal-600 bg-teal-50' },
                { label: 'Server RSS', value: `${health.rssMb} MB`, icon: Cpu, tone: 'text-amber-600 bg-amber-50' },
                { label: 'Client JS Heap', value: clientMemoryMb !== null ? `${clientMemoryMb} MB` : 'Not exposed by this browser', icon: Cpu, tone: 'text-slate-600 bg-slate-100' },
              ].map((m) => (
                <div key={m.label} className="bg-white p-4 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${m.tone}`}>
                    <m.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">{m.label}</div>
                    <div className="text-sm font-semibold text-slate-800 font-mono">{m.value}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center text-sm text-slate-500">No health data returned.</div>
          )}
        </div>
      )}

      {/* ENDPOINT LATENCY */}
      {activeTab === 'ENDPOINTS' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Measured API Round-Trips</h2>
            <button
              onClick={runProbes}
              disabled={isProbing}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              {isProbing ? 'Measuring…' : 'Measure again'}
            </button>
          </div>

          {probes.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">No measurements yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sortedProbes.map((p) => (
                <div key={p.endpoint} className="px-5 py-3 flex items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                      p.ok
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {p.ok ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      {p.ok ? 'OK' : 'FAILED'}
                    </span>
                    <code className="font-mono text-xs text-slate-700 truncate">/api{p.endpoint}</code>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-28 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${p.latencyMs < 100 ? 'bg-emerald-500' : p.latencyMs < 400 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${Math.min(100, (p.latencyMs / 800) * 100)}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs font-semibold text-slate-700 w-16 text-right">{p.latencyMs} ms</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PERSISTENCE INSPECTOR */}
      {activeTab === 'STORAGE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-indigo-600" />
                MongoDB Collection Sizes
              </h3>
              <span className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                {isLoadingStorage ? 'Reading…' : 'Live counts'}
              </span>
            </div>

            {storageError && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded px-2 py-1.5">{storageError}</p>
            )}

            {isLoadingStorage ? (
              <div className="py-8 text-center text-xs text-slate-500">Counting records…</div>
            ) : (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 font-mono text-xs">
                {storage.map((row) => (
                  <div key={row.label} className="flex justify-between text-slate-600">
                    <span>{row.label}:</span>
                    <span className="text-slate-900 font-semibold">
                      {row.count === null ? 'Unavailable' : `${row.count} ${row.unit}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                Quick Portal Navigation
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Direct access links for system administrators and engineering teams to debug active portal workflows:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onNavigate('Patients')}
                className="px-3 py-2 text-left rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50 text-xs font-medium text-slate-700 hover:text-teal-800 transition-colors"
              >
                Patients Directory &rarr;
              </button>
              <button
                onClick={() => onNavigate('Billing')}
                className="px-3 py-2 text-left rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50 text-xs font-medium text-slate-700 hover:text-teal-800 transition-colors"
              >
                Invoicing &amp; Billing &rarr;
              </button>
              <button
                onClick={() => onNavigate('Users')}
                className="px-3 py-2 text-left rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50 text-xs font-medium text-slate-700 hover:text-teal-800 transition-colors"
              >
                Staff Credentials &rarr;
              </button>
              <button
                onClick={() => onNavigate('Reports')}
                className="px-3 py-2 text-left rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50 text-xs font-medium text-slate-700 hover:text-teal-800 transition-colors"
              >
                Clinical Reports &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
