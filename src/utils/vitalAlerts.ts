// Shared clinical alert thresholds for recorded vital signs.
// Used by both the staff dashboard summary and the nurse-station header so the
// two can never drift apart on what counts as a critical reading.
//
// A reading is only judged when the value actually exists and parses as a
// number — missing fields never trigger an alert.

const toNumber = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

export const VITAL_THRESHOLDS = {
  spo2Low: 92,
  pulseHigh: 110,
  pulseLow: 50,
  tempFever: 100.4,
  systolicHigh: 160,
  diastolicHigh: 100,
} as const;

export function isCriticalReading(v: any): boolean {
  if (!v) return false;

  const spo2 = toNumber(v.spo2);
  if (spo2 !== null && spo2 > 0 && spo2 < VITAL_THRESHOLDS.spo2Low) return true;

  const pulse = toNumber(v.pulse);
  if (pulse !== null && pulse > 0 &&
      (pulse > VITAL_THRESHOLDS.pulseHigh || pulse < VITAL_THRESHOLDS.pulseLow)) return true;

  const temp = toNumber(v.temp);
  if (temp !== null && temp >= VITAL_THRESHOLDS.tempFever) return true;

  // BP is stored as a "systolic/diastolic" string
  const bpParts = String(v.bp || '').split('/');
  const systolic = toNumber(bpParts[0]);
  if (systolic !== null && systolic >= VITAL_THRESHOLDS.systolicHigh) return true;
  const diastolic = toNumber(bpParts[1]);
  if (diastolic !== null && diastolic >= VITAL_THRESHOLDS.diastolicHigh) return true;

  return false;
}

/** Human-readable summary of the readings actually present on a record. */
export function describeReading(v: any): string {
  const parts: string[] = [];
  if (v?.bp) parts.push(`BP ${v.bp}`);
  if (toNumber(v?.pulse) !== null) parts.push(`HR ${v.pulse}`);
  if (toNumber(v?.spo2) !== null) parts.push(`SpO2 ${v.spo2}%`);
  if (toNumber(v?.temp) !== null) parts.push(`Temp ${v.temp}°F`);
  return parts.join(' • ');
}
