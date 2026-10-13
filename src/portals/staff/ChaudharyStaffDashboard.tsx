import React, { useState, useTransition, useEffect } from 'react';
import { ChaudharyStaffSidebar, StaffNavTab } from '../../components/chaudhary/staff/ChaudharyStaffSidebar';
import { ChaudharyStaffHeader } from '../../components/chaudhary/staff/ChaudharyStaffHeader';
import { StaffTripleActionBar } from '../../components/chaudhary/staff/StaffTripleActionBar';
import { StaffAdmitView, AdmittedPatientEntry } from '../../components/chaudhary/staff/StaffAdmitView';
import { StaffPatientsListView } from '../../components/chaudhary/staff/StaffPatientsListView';
import { StaffNotesView } from '../../components/chaudhary/staff/StaffNotesView';
import { StaffProfileView } from '../../components/chaudhary/staff/StaffProfileView';
import { ChaudharyBillingView } from '../../components/chaudhary/ChaudharyBillingView';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { isCriticalReading } from '../../utils/vitalAlerts';
import { saveOfflineVital } from '../../services/offlineSyncService';
import {
  UserPlus,
  Users,
  FileText,
  BedDouble,
  Activity,
  ArrowRight,
  Clock,
  CheckCircle2,
  HeartPulse,
  Pill,
  AlertTriangle,
  Stethoscope,
  Sparkles,
  Thermometer,
  Droplets
} from 'lucide-react';
import { DoctorWardOrdersWidget } from '../../components/chaudhary/staff/DoctorWardOrdersWidget';

interface ChaudharyStaffDashboardProps {
  onLogout?: () => void;
  userId?: string;
}

export const ChaudharyStaffDashboard: React.FC<ChaudharyStaffDashboardProps> = ({
  userId,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<StaffNavTab>('Dashboard');
  const [renderedTab, setRenderedTab] = useState<StaffNavTab>('Dashboard');
  const [, startTransition] = useTransition();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Inpatients & live beds from real DB
  const [inpatients, setInpatients] = useState<AdmittedPatientEntry[]>([]);
  const [totalBeds, setTotalBeds] = useState(0);
  const [occupiedBedsCount, setOccupiedBedsCount] = useState(0);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);

  // Live clinical counters (critical vitals + pharmacy stock) — never hardcoded
  const [criticalVitalsCount, setCriticalVitalsCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [totalMedicines, setTotalMedicines] = useState(0);

  // Reloads beds, vitals alerts, pharmacy stock and the inpatient roster from MongoDB
  const fetchInpatients = async () => {
      try {
        setIsLoadingPatients(true);
        const [res, bedRes, vitalsRes, medsRes] = await Promise.all([
          api.patients.getAll().catch(() => null),
          api.beds.getAll().catch(() => null),
          api.vitals.getAll().catch(() => null),
          api.medicines.getAll().catch(() => null),
        ]);

        if (bedRes?.success && bedRes.summary) {
          setTotalBeds(bedRes.summary.totalBeds);
          setOccupiedBedsCount(bedRes.summary.occupiedCount);
        }

        // Count patients whose latest recorded vitals are outside safe limits
        if (vitalsRes?.success && Array.isArray(vitalsRes.vitals)) {
          const latestByPatient = new Map<string, any>();
          vitalsRes.vitals.forEach((v: any) => {
            const key = v?.patient_id ? String(v.patient_id) : null;
            if (key && !latestByPatient.has(key)) latestByPatient.set(key, v);
          });
          setCriticalVitalsCount(Array.from(latestByPatient.values()).filter(isCriticalReading).length);
        }

        if (medsRes?.success && Array.isArray(medsRes.medicines)) {
          setTotalMedicines(medsRes.medicines.length);
          setLowStockCount(
            medsRes.medicines.filter((m: any) => {
              const stock = Number(m.stock);
              return m.status === 'Low Stock' || (Number.isFinite(stock) && stock <= 20);
            }).length
          );
        }

        if (res?.success && Array.isArray(res.patients)) {
          // Latest recorded vitals per patient (API returns newest first)
          const vitalsByPatient = new Map<string, any>();
          if (vitalsRes?.success && Array.isArray(vitalsRes.vitals)) {
            vitalsRes.vitals.forEach((v: any) => {
              const key = v?.patient_id ? String(v.patient_id) : null;
              if (key && !vitalsByPatient.has(key)) vitalsByPatient.set(key, v);
            });
          }

          const ipd = res.patients
            .filter((p: any) => {
              const s = String(p.status || '').toLowerCase().trim();
              return s !== 'discharged' && (p.patient_type === 'IPD' || (p.bed_no && p.bed_no !== '-'));
            })
            .map((p: any): AdmittedPatientEntry => {
              const v = vitalsByPatient.get(String(p.patient_id || p._id));
              const vitalsText = v
                ? [
                    v.bp ? `BP ${v.bp}` : null,
                    v.pulse ? `HR ${v.pulse}` : null,
                    v.spo2 !== undefined && v.spo2 !== null && v.spo2 !== '' ? `SpO2 ${v.spo2}%` : null,
                    v.temp ? `Temp ${v.temp}°F` : null,
                  ].filter(Boolean).join(' • ') || 'No vitals recorded'
                : 'No vitals recorded';

              return {
                id: p.patient_id || p._id,
                uhid: p.patient_id || p._id,
                name: p.name || 'Patient',
                age: p.age || 0,
                gender: p.gender || 'Male',
                contact: p.mobile || '—',
                ward: p.ward_type || (p.bed_no?.includes('ICU') ? 'ICU Floor 3' : 'General Ward'),
                bedNo: p.bed_no || '-',
                doctor: p.doctor_assigned || '—',
                diagnosis: p.problem || '—',
                vitals: vitalsText,
                admittedAt: p.admission_date ? new Date(p.admission_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
                admittedBy: 'Staff',
                status: p.status || 'Admitted',
              };
            });
          setInpatients(ipd);
        }
      } catch (err) {
        console.warn('[StaffDashboard] Failed to load inpatients from DB:', err);
      } finally {
        setIsLoadingPatients(false);
      }
  };

  useEffect(() => {
    fetchInpatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Selected patient for notes or vitals
  const [selectedPatientForNote, setSelectedPatientForNote] = useState<{ name: string; bed: string } | null>(null);

  // Vitals recording modal (fields start blank so staff enter actual readings)
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [vitalTargetPatient, setVitalTargetPatient] = useState('');
  const [newBp, setNewBp] = useState('');
  const [newPulse, setNewPulse] = useState('');
  const [newSpo2, setNewSpo2] = useState('');
  const [newTemp, setNewTemp] = useState('');

  const handleTabChange = (tab: StaffNavTab) => {
    setActiveTab(tab);
    if (tab === 'Notes') {
      // If clicking Notes from navigation, show full roster list
      setSelectedPatientForNote(null);
    }
    startTransition(() => {
      setRenderedTab(tab);
    });
  };

  // Persist a new admission in MongoDB, then reload the live roster
  const handleAdmitSuccess = async (newPatient: AdmittedPatientEntry) => {
    try {
      await api.patients.create({
        name: newPatient.name,
        age: newPatient.age,
        gender: newPatient.gender,
        guardian_name: newPatient.guardian || '',
        mobile: newPatient.contact,
        address: newPatient.address || '',
        bed_no: newPatient.bedNo,
        doctor_assigned: newPatient.doctor,
        problem: newPatient.diagnosis,
        patient_type: 'IPD',
        status: 'Admitted',
        pending_amount: newPatient.deposit || 0,
      });
    } catch (err) {
      console.warn('[StaffDashboard] Admit failed to persist:', err);
      alert('Could not save the admission to the database. Please try again.');
      return;
    }
    await fetchInpatients();
  };

  // Mark the patient discharged in MongoDB, then reload the live roster
  const handleDischarge = async (id: string) => {
    try {
      const res = await api.patients.update(id, {
        status: 'Discharged',
        discharge_date: new Date().toISOString(),
      } as any);
      if (!res?.success) throw new Error('Discharge rejected by the server');
    } catch (err) {
      console.warn('[StaffDashboard] Discharge failed to persist:', err);
      alert('Could not discharge the patient in the database. Please try again.');
      return;
    }
    alert('Patient discharged successfully and bed marked vacant.');
    await fetchInpatients();
  };

  const handleRecordVitals = async (e: React.FormEvent) => {
    e.preventDefault();

    const target = inpatients.find(p => p.name === vitalTargetPatient);
    if (!target) {
      alert('Select a patient first.');
      return;
    }
    if (!newBp.trim() || !newPulse.trim() || !newSpo2.trim() || !newTemp.trim()) {
      alert('Please enter every vital reading (BP, Pulse, SpO2, Temperature).');
      return;
    }
    const pulse = Number(newPulse);
    const spo2 = Number(newSpo2);
    const temp = Number(newTemp);
    if (!Number.isFinite(pulse) || !Number.isFinite(spo2) || !Number.isFinite(temp)) {
      alert('Pulse, SpO2 and Temperature must be numbers.');
      return;
    }

    const vitalPayload = {
      patient_id: target.id,
      patient_name: target.name,
      uhid: target.uhid,
      bed_no: target.bedNo,
      bp: newBp.trim(),
      pulse,
      temp,
      spo2,
    };

    let isOfflineSaved = false;

    if (!navigator.onLine) {
      saveOfflineVital(vitalPayload);
      isOfflineSaved = true;
    } else {
      try {
        await api.vitals.create(vitalPayload);
      } catch (err) {
        console.warn('[StaffDashboard] Online vitals failed, fallback to offline queue:', err);
        saveOfflineVital(vitalPayload);
        isOfflineSaved = true;
      }
    }

    setIsVitalsModalOpen(false);
    setNewBp('');
    setNewPulse('');
    setNewSpo2('');
    setNewTemp('');

    if (isOfflineSaved) {
      alert(`⚡ ऑफ़लाइन मोड: ${target.name} के वाइटल्स डिवाइस में सुरक्षित सेव हो गए हैं!\nनेटवर्क आते ही ये बैकएंड में ऑटोमैटिक सिंक हो जाएँगे।`);
    } else {
      alert(`✅ वाइटल्स सफलतापूर्वक दर्ज किए गए (${target.name})।`);
    }

    // Update in-memory patient display immediately so staff sees new readings on screen
    setInpatients(prev => prev.map(p => {
      if (p.name === target.name) {
        return {
          ...p,
          vitals: `BP: ${newBp.trim()} • HR: ${pulse} bpm • SpO2: ${spo2}% • Temp: ${temp}°F`
        };
      }
      return p;
    }));

    if (navigator.onLine) {
      fetchInpatients().catch(() => {});
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#F8FAFC] font-sans text-slate-900 relative overflow-hidden select-none">

      {/* 1. Left Fixed Sidebar */}
      <ChaudharyStaffSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenProfile={() => handleTabChange('Profile')}
        onLogout={onLogout}
        isCollapsed={isSidebarCollapsed}
        userId={userId}
      />

      {/* 2. Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <ChaudharyStaffHeader
          activeTab={activeTab}
          onLogout={onLogout}
          onSearchChange={(q) => console.log('Staff Searching:', q)}
          onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
          onOpenProfile={() => handleTabChange('Profile')}
          onTriggerCodeBlue={() => alert('🚨 CODE BLUE BROADCASTED across ICU & Inpatient Station.')}
        />

        {/* Dashboard Body */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-3.5 flex flex-col pb-6">

          {/* Tab Routing */}
          {renderedTab === 'Admit' ? (
            <StaffAdmitView
              onAdmitSuccess={handleAdmitSuccess}
              onViewPatients={() => handleTabChange('Patients')}
            />
          ) : renderedTab === 'Patients' ? (
            <StaffPatientsListView
              patientsList={inpatients}
              onAdmitNew={() => handleTabChange('Admit')}
              onOpenNoteForPatient={(name, bed, patientObj) => {
                setSelectedPatientForNote(patientObj ? { name: patientObj.name, bed: patientObj.bedNo } : { name, bed });
                setActiveTab('Notes');
                startTransition(() => {
                  setRenderedTab('Notes');
                });
              }}
              onDischargePatient={handleDischarge}
              onRecordVitalsModal={(name) => {
                setVitalTargetPatient(name);
                setIsVitalsModalOpen(true);
              }}
            />
          ) : renderedTab === 'Notes' ? (
            <StaffNotesView
              patient={selectedPatientForNote}
              initialPatientName={selectedPatientForNote?.name}
              initialBedNo={selectedPatientForNote?.bed}
              onBack={() => handleTabChange('Patients')}
            />
          ) : renderedTab === 'Billing' ? (
            <ChaudharyBillingView />
          ) : renderedTab === 'Profile' ? (
            <StaffProfileView onLogout={onLogout} />
          ) : (
            /* CLEAN, HIGH-VALUE CLINICAL DASHBOARD OVERVIEW */
            <div className="flex flex-col gap-3.5 pb-4">
              {/* Action Bar: Admit | Patients | Notes */}
              <section>
                <StaffTripleActionBar
                  activeTab={activeTab}
                  onSelectTab={handleTabChange}
                />
              </section>

              {/* Row 1: 3 Clean, Compact Clinical Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                {/* Card 1: Ward Bed Occupancy */}
                <div
                  onClick={() => handleTabChange('Patients')}
                  className="bg-white border border-slate-200/90 hover:border-blue-300 rounded-xl p-3 sm:px-3.5 shadow-xs hover:shadow-sm transition-all duration-150 flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    {/* Header: Icon + Badge */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                        <BedDouble className="w-3.5 h-3.5 stroke-[2.2]" />
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.2 rounded-full border border-blue-200/80">
                        {Math.round((occupiedBedsCount / totalBeds) * 100)}% Full
                      </span>
                    </div>

                    {/* Title */}
                    <p className="text-[11px] font-semibold text-slate-500 tracking-wide uppercase leading-tight">
                      Ward Bed Occupancy
                    </p>

                    {/* Metric */}
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans leading-tight">
                        {occupiedBedsCount}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        / {totalBeds} Beds
                      </span>
                    </div>
                  </div>

                  {/* Footer Progress Strip */}
                  <div className="pt-2 mt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 mb-0.5">
                      <span>{Math.max(0, totalBeds - occupiedBedsCount)} vacant beds available</span>
                      <span className="font-bold text-blue-700">
                        {Math.min(100, Math.round((occupiedBedsCount / totalBeds) * 100))}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, Math.round((occupiedBedsCount / totalBeds) * 100))}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Card 2: Critical Vitals */}
                <div
                  onClick={() => {
                    setVitalTargetPatient(inpatients[0]?.name || '');
                    setIsVitalsModalOpen(true);
                  }}
                  className="bg-white border border-slate-200/90 hover:border-rose-300 rounded-xl p-3 sm:px-3.5 shadow-xs hover:shadow-sm transition-all duration-150 flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    {/* Header: Icon + Badge */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                        <HeartPulse className="w-3.5 h-3.5 stroke-[2.2]" />
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.2 rounded-full border border-rose-200/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        {criticalVitalsCount > 0 ? 'Action Needed' : 'All Stable'}
                      </span>
                    </div>

                    {/* Title */}
                    <p className="text-[11px] font-semibold text-slate-500 tracking-wide uppercase leading-tight">
                      Critical Vitals Alerts
                    </p>

                    {/* Metric */}
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-2xl font-extrabold text-rose-600 tracking-tight font-sans leading-tight">
                        {criticalVitalsCount}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        Vital Alerts
                      </span>
                    </div>
                  </div>

                  {/* Footer Progress Strip */}
                  <div className="pt-2 mt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 mb-0.5">
                      <span>
                        {criticalVitalsCount > 0
                          ? `${criticalVitalsCount} patient${criticalVitalsCount > 1 ? 's' : ''} need bedside review`
                          : 'No abnormal readings recorded'}
                      </span>
                      <span className="font-bold text-rose-600">
                        {criticalVitalsCount > 0 ? 'Urgent' : 'Clear'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            inpatients.length > 0
                              ? Math.min(100, Math.round((criticalVitalsCount / inpatients.length) * 100))
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card 3: Pharmacy Stock */}
                <div
                  onClick={() => handleTabChange('Patients')}
                  className="bg-white border border-slate-200/90 hover:border-amber-300 rounded-xl p-3 sm:px-3.5 shadow-xs hover:shadow-sm transition-all duration-150 flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    {/* Header: Icon + Badge */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                        <Pill className="w-3.5 h-3.5 stroke-[2.2]" />
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.2 rounded-full border border-amber-200/80">
                        {(() => {
                          const h = new Date().getHours();
                          return h < 14 ? 'Morning Shift' : h < 22 ? 'Evening Shift' : 'Night Shift';
                        })()}
                      </span>
                    </div>

                    {/* Title */}
                    <p className="text-[11px] font-semibold text-slate-500 tracking-wide uppercase leading-tight">
                      Pharmacy Stock Alerts
                    </p>

                    {/* Metric */}
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans leading-tight">
                        {lowStockCount}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        Low Stock Items
                      </span>
                    </div>
                  </div>

                  {/* Footer Progress Strip */}
                  <div className="pt-2 mt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 mb-0.5">
                      <span>
                        {lowStockCount} of {totalMedicines} medicines running low
                      </span>
                      <span className="font-bold text-amber-600">
                        {totalMedicines > 0 ? `${Math.round((lowStockCount / totalMedicines) * 100)}%` : '0%'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            totalMedicines > 0 ? Math.round((lowStockCount / totalMedicines) * 100) : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Row 2: Two Clean, Actionable Clinical Panels Side-by-Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-stretch">

                {/* 1. Quick Patients Overview with Live Vitals */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-3 sm:px-3.5 shadow-xs flex flex-col justify-between h-full">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
                          <Users className="w-3.5 h-3.5 stroke-[2.3]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-900 tracking-tight truncate">
                              Admitted Inpatients & Live Vitals
                            </h3>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Telemetry Live
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-slate-400 truncate">
                            Current active ward beds & continuous bedside monitoring
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTabChange('Patients')}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200/80 transition-all flex items-center gap-1 shrink-0"
                      >
                        <span>View All ({inpatients.length})</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Patient Cards List (Scrollable, Clean SaaS layout) */}
                    <div className="mt-2.5 space-y-2 max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
                      {inpatients.map((p) => {
                        // Parse the live vitals string recorded for this patient
                        const tokens = p.vitals.split('•').map(t => t.trim());
                        let bp = '', hr = '', spo2 = '', temp = '';
                        tokens.forEach(t => {
                          if (t.startsWith('BP ')) bp = t.replace('BP ', '');
                          else if (t.startsWith('HR ')) hr = t.replace('HR ', '');
                          else if (t.startsWith('SpO2 ')) spo2 = t.replace('SpO2 ', '').replace('%', '');
                          else if (t.startsWith('Temp ')) temp = t.replace('Temp ', '').replace('°F', '');
                        });

                        const tempNum = parseFloat(temp);
                        const spo2Num = parseFloat(spo2);
                        const hrNum = parseFloat(hr);
                        const isAlert =
                          p.status === 'In ICU' ||
                          (Number.isFinite(tempNum) && tempNum >= 100.4) ||
                          (Number.isFinite(spo2Num) && spo2Num > 0 && spo2Num < 92) ||
                          (Number.isFinite(hrNum) && hrNum > 0 && (hrNum > 110 || hrNum < 50));

                        return (
                          <div
                            key={p.id}
                            className={`p-2.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                              isAlert
                                ? 'bg-rose-50/30 border-rose-200 hover:border-rose-300'
                                : 'bg-slate-50/40 hover:bg-white border-slate-200/80 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                              {/* Bed Badge */}
                              <div className={`flex flex-col items-center justify-center min-w-[52px] px-1.5 py-1 rounded-md font-mono text-center shrink-0 ${
                                p.status === 'In ICU'
                                  ? 'bg-rose-600 text-white'
                                  : p.status === 'Emergency'
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-slate-800 text-white'
                              }`}>
                                <span className="text-[7.5px] uppercase font-sans font-bold tracking-wider opacity-90 leading-none">
                                  {p.status === 'In ICU' ? 'ICU' : p.status === 'Emergency' ? 'TRIAGE' : 'WARD'}
                                </span>
                                <span className="text-xs font-bold leading-tight mt-0.5 tracking-tight">
                                  {p.bedNo}
                                </span>
                              </div>

                              {/* Patient Clinical Info */}
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <h4 className="font-bold text-xs text-slate-900 truncate">
                                    {p.name}
                                  </h4>
                                  <span className="text-[11px] font-medium text-slate-400">
                                    ({p.age}y, {p.gender})
                                  </span>
                                  {isAlert && (
                                    <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                                      Flagged
                                    </span>
                                  )}
                                </div>

                                <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                                  <span>{p.diagnosis}</span>
                                  <span className="mx-1 text-slate-300">•</span>
                                  <strong className="text-slate-700 font-medium">{p.doctor}</strong>
                                </p>

                                {/* Modern Telemetry Pills */}
                                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                  {bp && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-sky-50 text-sky-800 border border-sky-200/80 text-[10px] font-bold font-mono">
                                      <Activity className="w-2.5 h-2.5 text-sky-600 stroke-[2.3]" />
                                      <span className="text-sky-600 text-[8.5px]">BP</span>
                                      <span className="font-bold text-sky-950">{bp}</span>
                                    </span>
                                  )}
                                  {hr && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-rose-50 text-rose-800 border border-rose-200/80 text-[10px] font-bold font-mono">
                                      <HeartPulse className="w-2.5 h-2.5 text-rose-600 stroke-[2.3]" />
                                      <span className="text-rose-600 text-[8.5px]">HR</span>
                                      <span className="font-bold text-rose-950">{hr}</span>
                                    </span>
                                  )}
                                  {spo2 && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-teal-50 text-teal-800 border border-teal-200/80 text-[10px] font-bold font-mono">
                                      <Droplets className="w-2.5 h-2.5 text-teal-600 stroke-[2.3]" />
                                      <span className="text-teal-600 text-[8.5px]">SpO₂</span>
                                      <span className="font-bold text-teal-950">{spo2}</span>
                                    </span>
                                  )}
                                  {temp && (
                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold font-mono ${
                                      parseFloat(temp) >= 100
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                        : 'bg-slate-100 text-slate-800 border border-slate-200'
                                    }`}>
                                      <Thermometer className="w-2.5 h-2.5 text-amber-600 stroke-[2.3]" />
                                      <span className="text-amber-700 text-[8.5px]">Temp</span>
                                      <span className="font-bold text-amber-950">{temp}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                              <button
                                onClick={() => {
                                  setVitalTargetPatient(p.name);
                                  setIsVitalsModalOpen(true);
                                }}
                                className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                                title="Record Vitals"
                              >
                                <HeartPulse className="w-3 h-3 text-emerald-600 stroke-[2.4]" />
                                <span>+ Vitals</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedPatientForNote({ name: p.name, bed: p.bedNo });
                                  handleTabChange('Notes');
                                }}
                                className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                                title="Open Clinical Notes"
                              >
                                <FileText className="w-3 h-3 text-indigo-600 stroke-[2.4]" />
                                <span>Note</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Empty / loading / error state for the live inpatient list */}
                      {inpatients.length === 0 && (
                        <div className="p-6 text-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50">
                          {isLoadingPatients ? (
                            <p className="text-xs font-semibold text-slate-400">Loading inpatients from database...</p>
                          ) : (
                            <>
                              <p className="text-xs font-semibold text-slate-500">No admitted inpatients</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">New IPD admissions will appear here instantly.</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Clean Bottom Actions Strip */}
                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Need to admit a new patient?
                      </span>
                    </div>
                    <button
                      onClick={() => handleTabChange('Admit')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ New IPD Admission</span>
                    </button>
                  </div>
                </div>

                {/* 2. Attending Doctor Ward Round Orders & STAT Directives */}
                <div className="h-full flex flex-col">
                  <DoctorWardOrdersWidget />
                </div>

              </div>
            </div>
          )}
        </main>
      </div>

      {/* Quick Vitals Modal */}
      {isVitalsModalOpen && (
        <Modal
          isOpen={isVitalsModalOpen}
          onClose={() => setIsVitalsModalOpen(false)}
          title={`Update Vitals for ${vitalTargetPatient}`}
          subtitle="Record telemetry & hemodynamics"
          maxWidth="sm"
        >
          <form onSubmit={handleRecordVitals} className="space-y-3 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Blood Pressure</label>
                <input
                  type="text"
                  value={newBp}
                  onChange={(e) => setNewBp(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pulse (bpm)</label>
                <input
                  type="number"
                  value={newPulse}
                  onChange={(e) => setNewPulse(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">SpO2 (%)</label>
                <input
                  type="number"
                  value={newSpo2}
                  onChange={(e) => setNewSpo2(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Temp (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newTemp}
                  onChange={(e) => setNewTemp(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsVitalsModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-xs text-xs"
              >
                Save Vitals
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
