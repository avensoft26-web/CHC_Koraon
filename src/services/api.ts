// ==========================================
// CHAUDHARY HOSPITAL MANAGEMENT SYSTEM API CLIENT
// Connects Frontend to Express + MongoDB Backend
// ==========================================

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

function getStoredToken(): string | null {
  try {
    return localStorage.getItem('chaudhary_jwt_token') || localStorage.getItem('auth_token');
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem('chaudhary_jwt_token', token);
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('chaudhary_jwt_token');
      localStorage.removeItem('auth_token');
    }
  } catch {
    // Ignore storage errors
  }
}

// In-memory cache for fast tab-switching (0ms instant page loads)
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
}
const apiCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

export function invalidateApiCache(pattern?: string | RegExp) {
  if (!pattern) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (typeof pattern === 'string') {
      if (key.toLowerCase().includes(pattern.toLowerCase())) {
        apiCache.delete(key);
      }
    } else if (pattern.test(key)) {
      apiCache.delete(key);
    }
  }
}

export function autoInvalidateCacheOnMutation(url: string) {
  const lower = url.toLowerCase();
  if (lower.includes('/auth/users') || lower.includes('/auth/')) {
    invalidateApiCache('users');
    invalidateApiCache('profile');
  }
  if (lower.includes('/patients')) {
    invalidateApiCache('patients');
    invalidateApiCache('discharge');
    invalidateApiCache('records');
    invalidateApiCache('beds');
    invalidateApiCache('trash');
  }
  if (lower.includes('/billing')) {
    invalidateApiCache('billing');
    invalidateApiCache('discharge');
    invalidateApiCache('records');
  }
  if (lower.includes('/discharge')) {
    invalidateApiCache('discharge');
    invalidateApiCache('patients');
    invalidateApiCache('billing');
    invalidateApiCache('beds');
    invalidateApiCache('records');
  }
  if (lower.includes('/notes')) {
    invalidateApiCache('notes');
  }
  if (lower.includes('/appointments')) {
    invalidateApiCache('appointments');
  }
  if (lower.includes('/medicines')) {
    invalidateApiCache('medicines');
  }
  if (lower.includes('/beds')) {
    invalidateApiCache('beds');
    invalidateApiCache('patients');
  }
  if (lower.includes('/vitals')) {
    invalidateApiCache('vitals');
    invalidateApiCache('patients');
  }
  if (lower.includes('/notifications')) {
    invalidateApiCache('notifications');
  }
  if (lower.includes('/audit')) {
    invalidateApiCache('audit');
  }
}

// Concurrent identical GETs are coalesced into a single network request. On most
// screens several components request the same collection in the same tick (the
// global patient list in HospitalContext plus the view's own copy), so this cuts
// real duplicate traffic without changing any caller's semantics — a GET issued
// after the previous one resolves still performs a fresh read.
const inflightGets = new Map<string, Promise<any>>();

/**
 * Error thrown for any non-2xx API response.
 *
 * Extends Error so existing `catch (err) { err.message }` handling is
 * unchanged, but additionally carries the HTTP status and the parsed response
 * body. Callers that need to react to a specific server-side decision (e.g. a
 * 409 bed-occupancy conflict) can read `err.status` / `err.body.code`
 * instead of having to parse the message text.
 */
export class ApiError extends Error {
  status: number;
  body: any;
  constructor(message: string, status: number, body: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function request<T>(endpoint: string, options: RequestInit & { bypassCache?: boolean } = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const method = (options.method || 'GET').toUpperCase();

  if (method === 'GET' && !options.bypassCache) {
    const cached = apiCache.get(url);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return Promise.resolve(cached.data as T);
    }
    const pending = inflightGets.get(url);
    if (pending) return pending as Promise<T>;
  }

  const task = (async () => {
    try {
      const res = await fetch(url, {
        ...options,
        headers,
        // Send the httpOnly session cookie too. The backend accepts either
        // this or the Bearer header.
        credentials: 'include',
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
          setStoredToken(null);
          try {
            localStorage.removeItem('chaudhary_auth_user');
          } catch {}
          window.dispatchEvent(new Event('chaudhary_auth_updated'));
        }

        const errorMsg = data?.message || data?.error || `Request failed with status ${res.status}`;
        throw new ApiError(errorMsg, res.status, data);
      }

      if (method === 'GET') {
        apiCache.set(url, { data, timestamp: Date.now() });
      } else {
        autoInvalidateCacheOnMutation(url);
      }

      return data as T;
    } catch (err: any) {
      console.error(`[API Error] ${method} ${url}:`, err.message);
      throw err;
    }
  })();

  if (method === 'GET') {
    inflightGets.set(url, task);
    const clear = () => { if (inflightGets.get(url) === task) inflightGets.delete(url); };
    task.then(clear, clear);
  }

  return task;
}

export const api = {
  // ── Authentication ──
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      const data = await request<{
        success: boolean;
        token: string;
        user_id: string;
        name: string;
        role: string;
        email: string;
        mobile?: string;
        avatar?: string | null;
        message?: string;
        billingAccess?: boolean;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (data.token) {
        setStoredToken(data.token);
      }
      return data;
    },
    googleLogin: async (credentials: { idToken?: string; email?: string; name?: string }) => {
      const data = await request<{
        success: boolean;
        token: string;
        user_id: string;
        name: string;
        role: string;
        email: string;
        mobile?: string;
        avatar?: string | null;
        message?: string;
        billingAccess?: boolean;
        notRegistered?: boolean;
        isPendingApproval?: boolean;
      }>('/auth/google-login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (data.token) {
        setStoredToken(data.token);
      }
      return data;
    },
    logout: async () => {
      try {
        await request('/auth/logout', { method: 'POST' });
      } finally {
        setStoredToken(null);
        try {
          localStorage.removeItem('chaudhary_auth_user');
          window.dispatchEvent(new Event('chaudhary_auth_updated'));
        } catch {}
      }
    },
    getProfile: () => request<{ success: boolean; user: any }>('/auth/profile'),
    getUsers: () => request<{ success: boolean; users: any[] }>('/auth/users'),
    signup: (userData: any) =>
      request<{ success: boolean; message: string; requiresOtp?: boolean; status?: string }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    verifySignupOtp: (data: { email: string; otp: string }) =>
      request<{ success: boolean; message: string; status?: string }>('/auth/verify-signup-otp', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    checkStatus: (email: string) =>
      request<{ success: boolean; status: string; isApproved: boolean; name?: string; role?: string }>(
        `/auth/status?email=${encodeURIComponent(email)}`
      ),
    updateUser: (id: string, updates: any) =>
      request<{ success: boolean; user: any }>(`/auth/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    deleteUser: (id: string) =>
      request<{ success: boolean; message: string }>(`/auth/users/${id}`, {
        method: 'DELETE',
      }),
    toggleBillingAccess: (id: string, billingAccess: boolean) =>
      request<{ success: boolean; billingAccess: boolean }>(`/auth/users/${id}/billing-access`, {
        method: 'PUT',
        body: JSON.stringify({ billingAccess }),
      }),
  },

  // ── Patients ──
  patients: {
    getAll: () => request<{ success: boolean; patients: any[] }>('/patients'),
    getById: (id: string) => request<{ success: boolean; patient: any }>(`/patients/${id}`),
    create: (patientData: any) =>
      request<{ success: boolean; patient: any }>('/patients', {
        method: 'POST',
        body: JSON.stringify(patientData),
      }),
    update: (id: string, updates: any) =>
      request<{ success: boolean; patient: any }>(`/patients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    transferBed: (transferData: { patient_id: string; new_bed_no: string; ward_type?: string; new_daily_charge?: number }) =>
      request<{ success: boolean; patient: any }>('/patients/transfer', {
        method: 'POST',
        body: JSON.stringify(transferData),
      }),
    delete: (id: string, opts?: { confirmAdmissionEnded?: boolean }) =>
      request<{ success: boolean; message: string; releasedBed?: string | null }>(`/patients/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({ confirmAdmissionEnded: opts?.confirmAdmissionEnded ?? false }),
      }),
    // Admin-only: soft-deleted records (patient trash)
    getTrash: () => request<{ success: boolean; patients: any[] }>('/patients/trash'),
    restore: (id: string, opts?: { releaseBed?: boolean }) =>
      request<{ success: boolean; message: string; patient?: any; releasedBed?: string | null }>(
        `/patients/${id}/restore`,
        {
          method: 'POST',
          body: JSON.stringify({ releaseBed: opts?.releaseBed ?? false }),
        }
      ),
    getAvailableBeds: () => request<{ success: boolean; beds: string[] }>('/patients/available-beds'),
    addSurgery: (id: string, surgeryData: any) =>
      request<{ success: boolean; surgeries: any[] }>(`/patients/${id}/surgeries`, {
        method: 'POST',
        body: JSON.stringify(surgeryData),
      }),
  },

  // ── Clinical Daily Notes ──
  notes: {
    getAll: () => request<{ success: boolean; notes: any[] }>('/notes'),
    getByPatient: (patientId: string) =>
      request<{ success: boolean; notes: any[] }>(`/notes/${patientId}`),
    create: (patientId: string, noteData: any) =>
      request<{ success: boolean; note: any }>(`/notes/${patientId}`, {
        method: 'POST',
        body: JSON.stringify(noteData),
      }),
    update: (noteId: string, updates: any) =>
      request<{ success: boolean; note: any }>(`/notes/${noteId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
  },

  // ── Appointments ──
  appointments: {
    getAll: (filters?: { date?: string; doctor_id?: string; status?: string }) => {
      const params = new URLSearchParams();
      if (filters?.date) params.append('date', filters.date);
      if (filters?.doctor_id) params.append('doctor_id', filters.doctor_id);
      if (filters?.status) params.append('status', filters.status);
      const query = params.toString() ? `?${params.toString()}` : '';
      return request<{ success: boolean; appointments: any[] }>(`/appointments${query}`);
    },
    create: (appointmentData: any) =>
      request<{ success: boolean; appointment: any }>('/appointments', {
        method: 'POST',
        body: JSON.stringify(appointmentData),
      }),
    update: (id: string, updates: any) =>
      request<{ success: boolean; appointment: any }>(`/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/appointments/${id}`, {
        method: 'DELETE',
      }),
  },

  // ── Doctors & Staff ──
  doctors: {
    getAll: () => request<{ success: boolean; doctors: any[] }>('/doctors'),
    update: (id: string, updates: any) =>
      request<{ success: boolean; doctor: any }>(`/doctors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
  },
  staff: {
    getAll: () => request<{ success: boolean; staff: any[] }>('/staff'),
  },

  // ── Beds & Wards ──
  beds: {
    getAll: () =>
      request<{
        success: boolean;
        summary: { totalBeds: number; occupiedCount: number; availableCount: number; occupancyRate: number };
        beds: any[];
      }>('/beds'),
  },

  // ── Medicines & Pharmacy ──
  medicines: {
    getAll: () => request<{ success: boolean; medicines: any[] }>('/medicines'),
    create: (medData: any) =>
      request<{ success: boolean; medicine: any }>('/medicines', {
        method: 'POST',
        body: JSON.stringify(medData),
      }),
    update: (id: string, updates: any) =>
      request<{ success: boolean; medicine: any }>(`/medicines/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/medicines/${id}`, {
        method: 'DELETE',
      }),
  },

  // ── Clinical Vitals ──
  vitals: {
    getAll: (patientId?: string) => {
      const query = patientId ? `?patient_id=${patientId}` : '';
      return request<{ success: boolean; vitals: any[] }>(`/vitals${query}`);
    },
    create: (vitalData: any) =>
      request<{ success: boolean; vital: any }>('/vitals', {
        method: 'POST',
        body: JSON.stringify(vitalData),
      }),
  },

  // ── Billing ──
  billing: {
    getAll: () => request<{ success: boolean; billings: any[] }>('/billing'),
    getByPatient: (patientId: string) =>
      request<{ success: boolean; billing: any; hasBillingRecord?: boolean }>(`/billing/${patientId}`),
    addPayment: (patientId: string, paymentData: any) =>
      request<{ success: boolean; billing: any }>(`/billing/${patientId}/payments`, {
        method: 'POST',
        body: JSON.stringify(paymentData),
      }),
    sync: (patientId: string) =>
      request<{
        success: boolean;
        totalBill: number;
        grandTotal?: number;
        discount?: number;
        netPayable?: number;
        totalPaid?: number;
        pending_amount: number;
        payment_status: string;
        billing?: any;
        message?: string;
      }>(
        `/billing/${patientId}/sync`,
        { method: 'POST' }
      ),
  },

  // ── Discharge ──
  discharge: {
    getByPatient: (patientId: string) =>
      request<{ success: boolean; discharge: any }>(`/discharge/${patientId}`),
    getEstimate: (patientId: string) =>
      request<{ success: boolean; estimate: any }>(`/discharge/${patientId}/estimate`),
    create: (dischargeData: any) =>
      request<{ success: boolean; discharge: any; billing?: any }>('/discharge', {
        method: 'POST',
        body: JSON.stringify(dischargeData),
      }),
  },

  // ── Live Notifications ──
  notifications: {
    getAll: () => request<{ success: boolean; total?: number; notifications: any[] }>('/notifications'),
    send: (data: { title: string; body: string; targetRole?: string }) =>
      request<{ success: boolean; sent: number; failed: number }>('/notifications/send', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // ── Audit Trail (admin only) ──
  audit: {
    get: (filters?: { entityType?: string; entityId?: string; action?: string; limit?: number }) => {
      const params = new URLSearchParams();
      if (filters?.entityType) params.append('entityType', filters.entityType);
      if (filters?.entityId) params.append('entityId', filters.entityId);
      if (filters?.action) params.append('action', filters.action);
      if (filters?.limit) params.append('limit', String(filters.limit));
      const query = params.toString() ? `?${params.toString()}` : '';
      return request<{ success: boolean; entries: any[] }>(`/audit${query}`);
    },
    getLogs: (params?: {
      entityType?: string;
      entityId?: string;
      action?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }) => {
      const query = new URLSearchParams();
      if (params?.entityType) query.set('entityType', params.entityType);
      if (params?.entityId) query.set('entityId', params.entityId);
      if (params?.action) query.set('action', params.action);
      if (params?.search) query.set('search', params.search);
      if (params?.startDate) query.set('startDate', params.startDate);
      if (params?.endDate) query.set('endDate', params.endDate);
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));

      const qs = query.toString();
      return request<{
        success: boolean;
        entries: Array<{
          _id: string;
          action: string;
          entityType: string;
          entityId: string;
          performedBy: { userId?: string; role?: string; name?: string };
          detail: Record<string, any>;
          outcome: 'success' | 'denied' | 'failed';
          ip: string;
          createdAt: string;
        }>;
        pagination: {
          total: number;
          page: number;
          limit: number;
          pages: number;
        };
        stats: {
          totalAll: number;
          todayCount: number;
          availableActions: string[];
        };
      }>(`/audit${qs ? `?${qs}` : ''}`);
    },
  },

  // ── Hospital Settings ──
  settings: {
    get: () => request<{ success: boolean; settings: Record<string, any> }>('/settings'),
    update: (settingsData: Record<string, any>) =>
      request<{ success: boolean; message: string }>('/settings', {
        method: 'POST',
        body: JSON.stringify(settingsData),
      }),
  },

  // ── Clinical Handovers (SBAR) ──
  handovers: {
    getAll: () => request<{ success: boolean; handovers: any[] }>('/handovers'),
    create: (data: any) =>
      request<{ success: boolean; handover: any }>('/handovers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // ── Doctor Ward Orders ──
  wardOrders: {
    getAll: () => request<{ success: boolean; orders: any[] }>('/ward-orders'),
    create: (data: any) =>
      request<{ success: boolean; order: any }>('/ward-orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    complete: (id: string, data: any) =>
      request<{ success: boolean; order: any }>(`/ward-orders/${id}/complete`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // Runtime / server health — real values read from the backend
  system: {
    health: () =>
      request<{
        status: string;
        dbStatus: string;
        uptime: number;
        timestamp: string;
        memoryUsage: { heapUsedMb: number; rssMb: number };
      }>('/health'),
    dbStatus: () =>
      request<{ readyState: number; status: string; error: string | null }>('/db-status'),
    // Measures the real round-trip of a live endpoint and reports what came back
    probe: async (endpoint: string) => {
      const started = performance.now();
      try {
        await request<unknown>(endpoint);
        return { endpoint, ok: true, latencyMs: Math.round(performance.now() - started) };
      } catch {
        return { endpoint, ok: false, latencyMs: Math.round(performance.now() - started) };
      }
    },
  },
};
