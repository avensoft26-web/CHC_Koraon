import React, { useState, useEffect, useTransition, Suspense } from 'react';
import { ChaudharySidebar, ChaudharyNavTab } from '../../components/chaudhary/ChaudharySidebar';
import { ChaudharyHeader } from '../../components/chaudhary/ChaudharyHeader';
import { KpiCards } from '../../components/chaudhary/KpiCards';
import { FrontDeskOverview } from '../../components/chaudhary/FrontDeskOverview';
import { BedAvailability } from '../../components/chaudhary/BedAvailability';
import { RecentActivity } from '../../components/chaudhary/RecentActivity';
import { QuickActionsSection } from '../../components/chaudhary/QuickActionsSection';
import type { ChaudharyPatientRow } from '../../components/chaudhary/ChaudharyPatientsView';
import { Modal } from '../../components/ui/Modal';
import { useHospitalContext } from '../../context/HospitalContext';

// Lazy-loaded secondary tab views
const ChaudharyPatientsView = React.lazy(() =>
  import('../../components/chaudhary/ChaudharyPatientsView').then(m => ({ default: m.ChaudharyPatientsView }))
);
const ChaudharyAddPatientView = React.lazy(() =>
  import('../../components/chaudhary/ChaudharyAddPatientView').then(m => ({ default: m.ChaudharyAddPatientView }))
);
const ChaudharyDoctorsView = React.lazy(() =>
  import('../../components/chaudhary/ChaudharyDoctorsView').then(m => ({ default: m.ChaudharyDoctorsView }))
);
const ChaudharyBedsWardsView = React.lazy(() =>
  import('../../components/chaudhary/ChaudharyBedsWardsView').then(m => ({ default: m.ChaudharyBedsWardsView }))
);
const ChaudharyBillingView = React.lazy(() =>
  import('../../components/chaudhary/ChaudharyBillingView').then(m => ({ default: m.ChaudharyBillingView }))
);
const ChaudharyProfileView = React.lazy(() =>
  import('../../components/chaudhary/ChaudharyProfileView').then(m => ({ default: m.ChaudharyProfileView }))
);

function TabFallback() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[350px]">
      <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin mb-3" />
      <p className="text-xs font-semibold text-slate-500 tracking-wide">Loading module...</p>
    </div>
  );
}
import { useAuthUser } from '../../hooks/useAuthUser';
import { api } from '../../services/api';
import { fetchHospitalDoctors, HospitalDoctor } from '../../utils/hospitalDoctors';
import { subscribeToHmsEvent } from '../../services/realtime';

interface ChaudharyReceptionistDashboardProps {
  onLogout?: () => void;
}

export const ChaudharyReceptionistDashboard: React.FC<ChaudharyReceptionistDashboardProps> = ({
  onLogout,
}) => {
  const hospitalCtx = useHospitalContext();
  const [activeTab, setActiveTab] = useState<ChaudharyNavTab>('Dashboard');
  const [renderedTab, setRenderedTab] = useState<ChaudharyNavTab>('Dashboard');
  const user = useAuthUser();
  const [, startTransition] = useTransition();
  const patientsList = hospitalCtx.patients;

  // Modals state
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [isPatientListModalOpen, setIsPatientListModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleTabChange = (tab: ChaudharyNavTab) => {
    setActiveTab(tab);
    startTransition(() => {
      setRenderedTab(tab);
    });
    if (
      tab === 'Add Patient' ||
      tab === 'Patients' ||
      tab === 'Doctors' ||
      tab === 'Doctors & Staff' ||
      tab === 'Bed & Wards' ||
      tab === 'Beds & Wards' ||
      tab === 'Billing' ||
      tab === 'Billing & Payments' ||
      tab === 'Profile'
    ) {
      // Inline dedicated pages
    } else if (tab === 'Appointments') {
      setIsAppointmentModalOpen(true);
    }
  };

  // New Admission Form State
  const [admName, setAdmName] = useState('');
  const [admAge, setAdmAge] = useState('');
  const [admGender, setAdmGender] = useState<'Male' | 'Female'>('Male');
  const [admGuardian, setAdmGuardian] = useState('');
  const [admBed, setAdmBed] = useState('');
  const [admDoctor, setAdmDoctor] = useState('');
  const [admPhone, setAdmPhone] = useState('');

  // ── Live reference data from MongoDB (bed layout, wards, doctors, fee) ──
  const [doctorList, setDoctorList] = useState<HospitalDoctor[]>([]);
  const [bedOptions, setBedOptions] = useState<string[]>([]);
  const [wardOptions, setWardOptions] = useState<string[]>([]);
  const [consultationFee, setConsultationFee] = useState<number | null>(null);

  const reloadReferenceData = React.useCallback(async () => {
    try {
      const [docs, bedRes, allRes, setRes] = await Promise.all([
        fetchHospitalDoctors().catch(() => [] as HospitalDoctor[]),
        api.patients.getAvailableBeds().catch(() => null),
        api.beds.getAll().catch(() => null),
        api.settings.get().catch(() => null),
      ]);
      setDoctorList(docs);
      setAdmDoctor(prev => prev || docs[0]?.name || '');
      setApptDoctor(prev => prev || docs[0]?.name || '');
      if (bedRes?.success && Array.isArray(bedRes.beds)) setBedOptions(bedRes.beds);
      if (allRes?.success && Array.isArray(allRes.beds)) {
        setWardOptions(Array.from(new Set(allRes.beds.map((b: any) => b.ward).filter(Boolean))) as string[]);
      }
      const fee = setRes?.success ? setRes.settings?.['consultation-fee'] : undefined;
      if (fee !== undefined && fee !== null && fee !== '') setConsultationFee(Number(fee));
    } catch (err) {
      console.error('Error reloading receptionist reference data:', err);
    }
  }, []);

  useEffect(() => {
    reloadReferenceData();

    // Instant real-time updates without manual refresh
    const unsubBeds = subscribeToHmsEvent('bed:updated', () => reloadReferenceData());
    const unsubSettings = subscribeToHmsEvent('settings:updated', () => reloadReferenceData());
    const unsubAdmit = subscribeToHmsEvent('patient:admitted', () => reloadReferenceData());
    const unsubDischarge = subscribeToHmsEvent('patient:discharged', () => reloadReferenceData());

    const handleLocalUpdate = () => reloadReferenceData();
    window.addEventListener('chaudhary_beds_updated', handleLocalUpdate);

    return () => {
      unsubBeds();
      unsubSettings();
      unsubAdmit();
      unsubDischarge();
      window.removeEventListener('chaudhary_beds_updated', handleLocalUpdate);
    };
  }, [reloadReferenceData]);

  const doctorOptions = doctorList.map(d =>
    d.department ? `${d.name} (${d.department})` : d.name
  );
  const doctorNameFor = (label: string) => (label || '').replace(/\s*\(.*\)\s*$/, '');

  const wardForBed = (bed: string) => {
    const b = (bed || '').toUpperCase();
    if (b.startsWith('ICU')) return 'ICU';
    if (b.startsWith('PRIVATE') || b.startsWith('PVT')) return 'Private Room';
    if (b.startsWith('FEMALE')) return 'Female General Ward';
    if (b.startsWith('MALE')) return 'Male General Ward';
    return 'General Ward';
  };

  // Quick Appointment form state (created in MongoDB, token comes back from the server)
  const [apptName, setApptName] = useState('');
  const [apptPhone, setApptPhone] = useState('');
  const [apptDoctor, setApptDoctor] = useState('');
  const [apptDate, setApptDate] = useState(new Date().toISOString().slice(0, 10));
  const [apptTime, setApptTime] = useState('');
  const [apptBusy, setApptBusy] = useState(false);

  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admName || !admAge) return;
    if (!admBed) {
      hospitalCtx.showToast('Please select a free bed before admitting the patient.');
      return;
    }

    const row: ChaudharyPatientRow = {
      id: `CH-${Date.now().toString().slice(-4)}`,
      name: admName,
      guardian: admGuardian.trim(),
      type: 'IPD',
      age: parseInt(admAge, 10) || 0,
      gender: admGender === 'Male' ? 'M' : 'F',
      bedNo: admBed,
      ward: wardForBed(admBed),
      admissionDate: new Date().toLocaleDateString(),
      admissionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'ADMITTED',
      payStatus: 'PENDING',
      phone: admPhone,
      doctor: doctorNameFor(admDoctor),
    };

    await hospitalCtx.addPatient(row);
    setIsAdmissionModalOpen(false);
    setAdmName('');
    setAdmAge('');
    setAdmGuardian('');
    setAdmBed('');
    setAdmPhone('');
    hospitalCtx.showToast(`Patient ${admName} admitted successfully!`);
  };

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-[#EBF3FC] via-[#F1F6FE] to-[#E3EEFC] font-sans text-[#172554] relative overflow-hidden select-none">

      {/* Soft Ambient Glows in background */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-300/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 1. Left Fixed Sidebar (Curatera AI Style Dark Sidebar) */}
      <ChaudharySidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenProfile={() => setActiveTab('Profile')}
        onLogout={onLogout}
        isCollapsed={isSidebarCollapsed}
      />

      {/* 2. Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header (Curatera AI Style Breadcrumb + Search + Badges) */}
        <ChaudharyHeader
          activeTab={activeTab}
          onLogout={onLogout}
          onSearchChange={(q) => console.log('Searching:', q)}
          onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
          onOpenProfile={() => handleTabChange('Profile')}
        />

        {/* Dashboard Body */}
        <main className={`flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-3.5 flex flex-col pb-6 ${renderedTab === 'Billing' || renderedTab === 'Billing & Payments' || renderedTab === 'Profile'
            ? 'gap-3'
            : renderedTab === 'Add Patient'
              ? 'pb-6'
              : 'pb-4'
          }`}>
          <Suspense fallback={<TabFallback />}>
            {renderedTab === 'Add Patient' ? (
              <ChaudharyAddPatientView
                onAddPatient={async (newPatient) => {
                  await hospitalCtx.addPatient(newPatient);
                  handleTabChange('Patients');
                }}
                onBack={() => handleTabChange('Patients')}
              />
            ) : renderedTab === 'Patients' ? (
              <ChaudharyPatientsView
                patientsList={patientsList}
                onNewAdmission={() => handleTabChange('Add Patient')}
              />
            ) : renderedTab === 'Doctors' || renderedTab === 'Doctors & Staff' ? (
              <ChaudharyDoctorsView
                onBookAppointment={(doc) => {
                  setAdmDoctor(doc.name);
                  setIsAppointmentModalOpen(true);
                }}
              />
            ) : renderedTab === 'Bed & Wards' || renderedTab === 'Beds & Wards' ? (
              <ChaudharyBedsWardsView onAdmitPatient={() => setIsAdmissionModalOpen(true)} />
            ) : renderedTab === 'Billing' || renderedTab === 'Billing & Payments' ? (
              <ChaudharyBillingView />
            ) : renderedTab === 'Profile' ? (
              <ChaudharyProfileView onLogout={onLogout} />
            ) : (
              <div className="flex flex-col gap-4 pb-6">
                {/* Row 1: 4 KPI Cards */}
                <section>
                  <KpiCards />
                </section>

                {/* Row 2: Front Desk Overview & Bed Availability */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                  <FrontDeskOverview
                    onNewAdmission={() => setActiveTab('Add Patient')}
                    onViewPatientList={() => handleTabChange('Patients')}
                  />
                  <BedAvailability
                    onViewWards={() => handleTabChange('Beds & Wards')}
                  />
                </section>

                {/* Row 3: Recent Hospital Activity & Quick Actions / Department Shortcuts */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                  <RecentActivity onViewAll={() => handleTabChange('Patients')} />
                  <QuickActionsSection
                    onNewAppointment={() => setIsAppointmentModalOpen(true)}
                    onCreateInvoice={() => handleTabChange('Billing')}
                    onLabReport={() => handleTabChange('Lab & Reports')}
                    onManageStaff={() => handleTabChange('Doctors & Staff')}
                    onNavigateTab={(tab) => handleTabChange(tab as ChaudharyNavTab)}
                  />
                </section>
              </div>
            )}
          </Suspense>
        </main>
      </div>

      {/* MODAL 1: New Admission */}
      {isAdmissionModalOpen && (
        <Modal
          isOpen={isAdmissionModalOpen}
          onClose={() => setIsAdmissionModalOpen(false)}
          title="Patient Admission Intake Form"
          subtitle="Chaudhary Health Care Center - Front Desk Admission"
          maxWidth="md"
        >
          <form onSubmit={handleAdmissionSubmit} className="space-y-3.5 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold text-[#172554] mb-1">Patient Full Name *</label>
              <input
                type="text"
                required
                placeholder="Enter Patient Full Name"
                value={admName}
                onChange={(e) => setAdmName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#00C292] focus:ring-2 focus:ring-[#00C292]/20 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172554] mb-1">Age *</label>
                <input
                  type="number"
                  required
                  placeholder="Enter Age"
                  value={admAge}
                  onChange={(e) => setAdmAge(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#00C292] focus:ring-2 focus:ring-[#00C292]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#172554] mb-1">Gender</label>
                <select
                  value={admGender}
                  onChange={(e) => setAdmGender(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172554] mb-1">Guardian / Kin Name</label>
                <input
                  type="text"
                  placeholder="Attendant's full name"
                  value={admGuardian}
                  onChange={(e) => setAdmGuardian(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#00C292] focus:ring-2 focus:ring-[#00C292]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#172554] mb-1">Attending Doctor</label>
                <select
                  value={admDoctor}
                  onChange={(e) => setAdmDoctor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  {doctorOptions.length === 0 && (
                    <option value="" disabled>No doctors configured</option>
                  )}
                  {doctorOptions.map(doc => (
                    <option key={doc} value={doc}>{doc}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172554] mb-1">
                Free Bed <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={admBed}
                onChange={(e) => setAdmBed(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                {(() => {
                  const free = admGender === 'Female'
                    ? bedOptions.filter(b => b.startsWith('Female') || b.startsWith('ICU'))
                    : bedOptions.filter(b => b.startsWith('Male') || b.startsWith('ICU'));
                  if (free.length === 0) return <option value="">No free beds available</option>;
                  return (
                    <>
                      <option value="">Select a free bed</option>
                      {free.map(bed => (
                        <option key={bed} value={bed}>{bed} — {wardForBed(bed)}</option>
                      ))}
                    </>
                  );
                })()}
              </select>
              {wardOptions.length > 0 && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Wards in this hospital: {wardOptions.join(', ')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172554] mb-1">Contact Phone Number</label>
              <input
                type="tel"
                value={admPhone}
                onChange={(e) => setAdmPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAdmissionModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-[#00C292] to-[#00A896] hover:from-[#00B285] hover:to-[#009686] text-white rounded-xl font-bold shadow-sm text-xs"
              >
                Confirm Admission
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: Patient Directory */}
      {isPatientListModalOpen && (
        <Modal
          isOpen={isPatientListModalOpen}
          onClose={() => setIsPatientListModalOpen(false)}
          title="Chaudhary Hospital Patient Directory"
          subtitle="Currently active registered inpatients and outpatients"
          maxWidth="2xl"
        >
          <div className="space-y-3">
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                    <th className="py-2.5 px-4">UHID / Name</th>
                    <th className="py-2.5 px-3">Age / Gender</th>
                    <th className="py-2.5 px-3">Ward / Bed</th>
                    <th className="py-2.5 px-3">Guardian</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patientsList.slice(0, 20).map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4">
                        <p className="font-bold text-[#172554]">{p.name}</p>
                        <p className="text-[10px] font-mono text-blue-600">{p.id}</p>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{p.age} Yrs • {p.gender}</td>
                      <td className="py-2.5 px-3 font-medium text-[#172554]">{p.bedNo} ({p.ward})</td>
                      <td className="py-2.5 px-3 text-slate-600">{p.guardian}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setIsPatientListModalOpen(false)}
                className="px-4 py-2 bg-[#172554] text-white rounded-xl font-bold text-xs"
              >
                Close Directory
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: Quick Appointment */}
      {isAppointmentModalOpen && (
        <Modal
          isOpen={isAppointmentModalOpen}
          onClose={() => setIsAppointmentModalOpen(false)}
          title="Schedule Quick Appointment"
          subtitle="Front desk token generation"
          maxWidth="md"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!apptName.trim() || !apptDoctor || !apptDate || !apptTime) return;
              setApptBusy(true);
              try {
                const res: any = await api.appointments.create({
                  patient_name: apptName.trim(),
                  patient_phone: apptPhone.trim() || undefined,
                  doctor_name: apptDoctor,
                  date: apptDate,
                  time: apptTime,
                  type: 'OPD',
                  status: 'Scheduled',
                });
                if (!res?.success) throw new Error('Could not create the appointment');
                const token = res.appointment?.token_no;
                alert(token ? `Token #${token} issued successfully!` : 'Appointment scheduled successfully!');
                setApptName('');
                setApptPhone('');
                setApptTime('');
                setIsAppointmentModalOpen(false);
              } catch (err) {
                alert('Could not schedule the appointment. Please try again.');
              } finally {
                setApptBusy(false);
              }
            }}
            className="space-y-3 text-xs sm:text-sm"
          >
            <p className="text-slate-600">Schedule a patient appointment slot with an on-duty consultant.</p>

            <div>
              <label className="block text-xs font-bold text-[#172554] mb-1">Patient Name *</label>
              <input
                type="text"
                required
                value={apptName}
                onChange={(e) => setApptName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#00C292] focus:ring-2 focus:ring-[#00C292]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172554] mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={apptPhone}
                  onChange={(e) => setApptPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#172554] mb-1">Doctor *</label>
                <select
                  required
                  value={apptDoctor}
                  onChange={(e) => setApptDoctor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  {doctorOptions.length === 0 && (
                    <option value="" disabled>No doctors configured</option>
                  )}
                  {doctorOptions.map(doc => (
                    <option key={doc} value={doctorNameFor(doc)}>{doc}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172554] mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={apptDate}
                  onChange={(e) => setApptDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#172554] mb-1">Time *</label>
                <input
                  type="time"
                  required
                  value={apptTime}
                  onChange={(e) => setApptTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>

            {consultationFee !== null && (
              <p className="text-[11px] text-slate-500">
                Current OPD consultation fee (hospital settings): ₹{consultationFee}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAppointmentModalOpen(false)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={apptBusy}
                className="px-4 py-2 bg-gradient-to-r from-[#00C292] to-[#00A896] disabled:opacity-60 text-white font-bold rounded-xl text-xs shadow-sm"
              >
                {apptBusy ? 'Scheduling…' : 'Issue Token'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 4: Create Invoice */}
      {isInvoiceModalOpen && (
        <Modal
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          title="Create OPD / IPD Invoice"
          subtitle="Chaudhary Billing & Cashier Desk"
          maxWidth="md"
        >
          <div className="space-y-3 text-xs sm:text-sm">
            <p className="text-slate-600">Generate cashier payment slip for consultation, pharmacy or bed charges.</p>
            <div className="flex justify-between items-center p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <p className="font-bold text-[#172554]">Standard OPD Consultation Fee</p>
                <p className="text-[11px] text-slate-500">As configured in hospital settings</p>
              </div>
              <span className="font-bold text-[#172554] text-base font-mono">
                {consultationFee !== null ? `₹${consultationFee.toFixed(2)}` : 'Not configured'}
              </span>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsInvoiceModalOpen(false)} className="px-4 py-2 border rounded-xl text-xs font-semibold">Cancel</button>
              <button
                onClick={() => {
                  window.print();
                  setIsInvoiceModalOpen(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
              >
                Print Invoice
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 5: Profile & Support */}
      {isSupportModalOpen && (
        <Modal
          isOpen={isSupportModalOpen}
          onClose={() => setIsSupportModalOpen(false)}
          title="User Profile & Staff Details"
          subtitle="Chaudhary Health Care Center - Front Desk Terminal"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            {/* User Header */}
            <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-[#00C292]/20 text-[#00A87A] border border-[#00C292]/40 flex items-center justify-center font-bold text-base flex-shrink-0">
                {user.name
                  ? user.name.split(/\s+/).slice(0, 2).map((n: string) => n[0]?.toUpperCase() ?? '').join('')
                  : '—'}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-[#172554] text-sm">{user.name || 'Not signed in'}</h4>
                <p className="text-xs text-slate-500 font-medium">
                  {user.role || 'Front Desk Staff'}
                  {user.department ? ` • ${user.department}` : ''}
                </p>
              </div>
            </div>

            {/* Profile Info Details */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Staff ID:</span>
                <span className="font-bold text-[#172554]">{user.id || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Role:</span>
                <span className="font-bold text-[#172554]">{user.role || '—'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Contact Email:</span>
                <span className="font-bold text-[#172554]">{user.email || '—'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setIsSupportModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#172554] font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
