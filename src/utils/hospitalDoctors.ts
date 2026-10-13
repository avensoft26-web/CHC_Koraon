import { api } from '../services/api';

export interface HospitalDoctor {
  name: string;
  department: string;
  fee: number;
}

/**
 * Single source of truth for the hospital's doctor roster.
 * Reads real doctor accounts from MongoDB (`/api/doctors`), and falls back to the
 * admin-maintained `hospital-doctors-list` setting when no doctor users exist yet.
 * Never returns fabricated names — an empty array means "no doctors configured".
 */
export async function fetchHospitalDoctors(): Promise<HospitalDoctor[]> {
  try {
    const res = await api.doctors.getAll();
    if (res?.success && Array.isArray(res.doctors) && res.doctors.length > 0) {
      return res.doctors
        .filter((d: any) => !!d?.name)
        .map((d: any) => ({
          name: String(d.name),
          department: String(d.specialization || d.department || 'General Medicine'),
          fee: Number(d.fee) || 0,
        }));
    }
  } catch {
    // fall through to the settings roster
  }

  try {
    const res = await api.settings.get();
    const raw = res?.settings?.['hospital-doctors-list'];
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
        .filter((d: any) => !!d?.name)
        .map((d: any) => ({
          name: String(d.name),
          department: String(d.dept || d.department || 'General Medicine'),
          fee: Number(d.fee) || 0,
        }));
    }
  } catch {
    // no roster configured
  }

  return [];
}
