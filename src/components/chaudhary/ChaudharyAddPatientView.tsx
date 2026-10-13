import React, { useState, useEffect } from 'react';
import { 
  Bed, 
  Stethoscope, 
  User, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Shield,
  CreditCard,
  Building2,
  ChevronDown,
  RotateCcw,
  UserPlus
} from 'lucide-react';
import { ChaudharyPatientRow } from './ChaudharyPatientsView';
import { api } from '../../services/api';
import { fetchHospitalDoctors, HospitalDoctor } from '../../utils/hospitalDoctors';
import { subscribeToHmsEvent } from '../../services/realtime';
import { DiagnosisAutocomplete } from '../common/DiagnosisAutocomplete';

interface ChaudharyAddPatientViewProps {
  onAddPatient: (newPatient: ChaudharyPatientRow) => void;
  onBack: () => void;
}

export const ChaudharyAddPatientView: React.FC<ChaudharyAddPatientViewProps> = ({
  onAddPatient,
  onBack,
}) => {
  // Mode: IPD or OPD
  const [admissionType, setAdmissionType] = useState<'IPD' | 'OPD'>('IPD');

  // Common Fields
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [address, setAddress] = useState('');
  const [condition, setCondition] = useState('');
  const [assignedDoctor, setAssignedDoctor] = useState('');

  // IPD Specific Fields
  const [guardianName, setGuardianName] = useState('');
  const [ipdMobile, setIpdMobile] = useState('');
  const [ipdEmail, setIpdEmail] = useState('');
  const [bedNumber, setBedNumber] = useState('');
  // No prefilled deposit amount — a recorded advance must be what was actually
  // taken from the patient, never a built-in number.
  const [depositAmount, setDepositAmount] = useState('');

  // OPD Specific Fields
  const [opdDepartment, setOpdDepartment] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [opdMobile, setOpdMobile] = useState('');

  // Feedback State
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Doctors + departments loaded live from MongoDB (never hard-coded)
  const [doctorList, setDoctorList] = useState<HospitalDoctor[]>([]);
  const [availableBeds, setAvailableBeds] = useState<string[]>([]);
  const [defaultFee, setDefaultFee] = useState('');

  const departments = Array.from(
    new Set(doctorList.map(d => d.department).filter(Boolean))
  );
  const doctors = doctorList.map(d => d.name);

  // Live free-bed list (filter by patient gender on submit side too)
  const getAvailableBeds = () => {
    if (!gender) return [];
    if (gender === 'Male') return availableBeds.filter(b => b.startsWith('Male') || b.startsWith('ICU'));
    if (gender === 'Female') return availableBeds.filter(b => b.startsWith('Female') || b.startsWith('ICU'));
    return availableBeds;
  };

  const reloadAvailableBeds = React.useCallback(async () => {
    try {
      const bedRes = await api.patients.getAvailableBeds().catch(() => null);
      if (bedRes?.success && Array.isArray(bedRes.beds)) {
        setAvailableBeds(bedRes.beds);
      }
    } catch {}
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const [docs, bedRes, setRes] = await Promise.all([
        fetchHospitalDoctors().catch(() => [] as HospitalDoctor[]),
        api.patients.getAvailableBeds().catch(() => null),
        api.settings.get().catch(() => null),
      ]);

      if (!mounted) return;

      const feeFromSettings =
        setRes?.success && setRes.settings?.['doctor-fees'] !== undefined && setRes.settings?.['doctor-fees'] !== null
          ? String(setRes.settings['doctor-fees'])
          : '';
      const fee = feeFromSettings || (docs[0]?.fee ? String(docs[0].fee) : '');

      setDoctorList(docs);
      setDefaultFee(fee);
      setAssignedDoctor(prev => (prev ? prev : docs[0]?.name ?? ''));
      if (!opdDepartment) setOpdDepartment(docs[0]?.department ?? docs[0]?.name ?? '');
      setConsultationFee(prev => (prev || fee));

      if (bedRes?.success && Array.isArray(bedRes.beds)) setAvailableBeds(bedRes.beds);
    })();

    // Instant real-time updates for beds
    const unsubBeds = subscribeToHmsEvent('bed:updated', () => reloadAvailableBeds());
    const unsubSettings = subscribeToHmsEvent('settings:updated', () => reloadAvailableBeds());
    const unsubAdmit = subscribeToHmsEvent('patient:admitted', () => reloadAvailableBeds());
    const unsubDischarge = subscribeToHmsEvent('patient:discharged', () => reloadAvailableBeds());

    const handleLocalUpdate = () => reloadAvailableBeds();
    window.addEventListener('chaudhary_beds_updated', handleLocalUpdate);

    return () => {
      mounted = false;
      unsubBeds();
      unsubSettings();
      unsubAdmit();
      unsubDischarge();
      window.removeEventListener('chaudhary_beds_updated', handleLocalUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadAvailableBeds]);

  // Reset Form
  const handleReset = () => {
    setFullName('');
    setAge('');
    setGender('');
    setAddress('');
    setCondition('');
    setAssignedDoctor(doctorList[0]?.name ?? '');
    setGuardianName('');
    setIpdMobile('');
    setIpdEmail('');
    setBedNumber('');
    setDepositAmount('');
    setOpdDepartment(departments[0] ?? '');
    setConsultationFee(defaultFee);
    setOpdMobile('');
    setErrorMsg('');
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter patient Full Name.');
      return;
    }
    if (!age || parseInt(age, 10) <= 0) {
      setErrorMsg('Please enter a valid Patient Age.');
      return;
    }
    if (!gender) {
      setErrorMsg('Please select Patient Gender.');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Please enter Full Address.');
      return;
    }

    if (admissionType === 'IPD') {
      if (!guardianName.trim()) {
        setErrorMsg('Please enter Guardian / Next of Kin Name.');
        return;
      }
      if (!ipdMobile.trim()) {
        setErrorMsg('Please enter Mobile Number.');
        return;
      }
      if (!bedNumber) {
        setErrorMsg('Please select an available Bed Number.');
        return;
      }
    } else {
      if (!condition.trim()) {
        setErrorMsg('Please enter Symptoms / Chief Complaint.');
        return;
      }
      if (!opdDepartment) {
        setErrorMsg('Please select Clinical Department.');
        return;
      }
    }

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const randomSeq = Math.floor(100 + Math.random() * 900);
    const newId = `P-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${randomSeq}`;

    // Bed is validated above for IPD; OPD patients occupy no bed
    const selectedBed = admissionType === 'IPD' ? bedNumber : '-';
    const wardName = admissionType === 'IPD' 
      ? (selectedBed.includes('ICU') ? 'ICU Critical' : (gender === 'Female' ? 'Female Ward' : 'Male Ward'))
      : 'OPD';

    // Deposit is what was actually entered — never a built-in default amount
    const deposit = parseInt(depositAmount || '0', 10) || 0;

    const newRecord: ChaudharyPatientRow = {
      id: newId,
      name: fullName.trim(),
      guardian: admissionType === 'IPD' ? guardianName.trim() : (guardianName.trim() || 'Self'),
      type: admissionType,
      specialBadge: admissionType === 'OPD' ? opdDepartment : undefined,
      age: parseInt(age, 10),
      gender: (gender === 'Female' ? 'F' : 'M'),
      bedNo: selectedBed,
      ward: wardName,
      admissionDate: dateFormatted,
      admissionTime: timeFormatted,
      status: admissionType === 'IPD' ? 'ADMITTED' : 'ACTIVE',
      payStatus: admissionType === 'IPD' ? 'PENDING' : 'PAID',
      // Only the number that was actually entered — no placeholder mobile number
      phone: (admissionType === 'IPD' ? ipdMobile : opdMobile).trim(),
      address: address.trim(),
      // Chief complaint is recorded only if the user typed one
      condition: condition.trim(),
      doctor: assignedDoctor,
      totalBilled: admissionType === 'IPD' ? `₹${deposit.toLocaleString('en-IN')}` : `₹${consultationFee}`,
      amountPaid: admissionType === 'IPD' ? '₹0' : `₹${consultationFee}`,
      amountDue: admissionType === 'IPD' ? `₹${deposit.toLocaleString('en-IN')}` : '₹0'
    };

    setIsSuccess(true);
    setTimeout(() => {
      onAddPatient(newRecord);
    }, 600);
  };

  const calculatedWard = bedNumber.includes('ICU') 
    ? 'ICU Critical' 
    : (gender === 'Female' ? 'Female Ward' : (gender === 'Male' ? 'Male Ward' : 'General Ward'));

  return (
    <div className="w-full max-w-6xl xl:max-w-7xl mx-auto flex flex-col gap-5 sm:gap-6 font-sans">
      
      {/* 1. PROFESSIONAL SAAS HEADER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-xs ${
            admissionType === 'IPD'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {admissionType === 'IPD' ? (
              <Bed className="w-6 h-6 stroke-[2.2]" />
            ) : (
              <Stethoscope className="w-6 h-6 stroke-[2.2]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                {admissionType === 'IPD' ? 'Inpatient Admission & Bed Allocation' : 'Outpatient Registration (OPD)'}
              </h2>
              <span className={`px-2.5 py-1 rounded-lg text-xs sm:text-sm font-semibold border shadow-2xs ${
                admissionType === 'IPD'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {admissionType === 'IPD' ? 'IPD Ward' : 'OPD Walk-In'}
              </span>
            </div>
          </div>
        </div>

        {/* Clean Segmented Control & Back Button */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="bg-slate-100/90 p-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setAdmissionType('IPD');
                setErrorMsg('');
              }}
              className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                admissionType === 'IPD'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bed className="w-4 h-4" />
              <span>IPD Admission</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAdmissionType('OPD');
                setErrorMsg('');
              }}
              className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                admissionType === 'OPD'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>OPD Walk-In</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {isSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2.5 text-sm font-semibold shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Patient registered successfully! Updating live hospital registry...</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-2.5 text-sm font-semibold shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. FORM BODY */}
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        
        {/* CARD 1: PATIENT DEMOGRAPHICS & CONTACT */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 lg:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs sm:text-sm shadow-2xs">
                1
              </span>
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-800">
                Patient Demographics &amp; Contact
              </h3>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
              Primary Identity
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter Full Name"
                className="w-full px-4 py-2.5 sm:py-3 bg-white border border-slate-300 rounded-xl text-sm sm:text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 outline-none transition-all shadow-2xs"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Age (Years) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                max="130"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter Age"
                className="w-full px-4 py-2.5 sm:py-3 bg-white border border-slate-300 rounded-xl text-sm sm:text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 outline-none transition-all shadow-2xs"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Gender <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={gender}
                  onChange={(e) => {
                    setGender(e.target.value as any);
                    setBedNumber('');
                  }}
                  className="w-full px-4 py-2.5 sm:py-3 bg-white border border-slate-300 rounded-xl text-sm sm:text-[15px] font-medium text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 outline-none transition-all cursor-pointer appearance-none shadow-2xs pr-10"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Guardian Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Guardian / Next of Kin {admissionType === 'IPD' && <span className="text-rose-500">*</span>}
              </label>
              <input
                type="text"
                required={admissionType === 'IPD'}
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="Enter Guardian / Next of Kin Name"
                className="w-full px-4 py-2.5 sm:py-3 bg-white border border-slate-300 rounded-xl text-sm sm:text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 outline-none transition-all shadow-2xs"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Mobile Number {admissionType === 'IPD' && <span className="text-rose-500">*</span>}
              </label>
              <div className="flex rounded-xl shadow-2xs">
                <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 text-slate-600 text-sm font-semibold">
                  +91
                </span>
                <input
                  type="tel"
                  required={admissionType === 'IPD'}
                  value={admissionType === 'IPD' ? ipdMobile : opdMobile}
                  onChange={(e) => admissionType === 'IPD' ? setIpdMobile(e.target.value) : setOpdMobile(e.target.value)}
                  placeholder="Enter 10-digit Mobile Number"
                  className="w-full px-4 py-2.5 sm:py-3 bg-white border border-slate-300 rounded-r-xl text-sm sm:text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 outline-none transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={ipdEmail}
                onChange={(e) => setIpdEmail(e.target.value)}
                placeholder="Enter Email Address"
                className="w-full px-4 py-2.5 sm:py-3 bg-white border border-slate-300 rounded-xl text-sm sm:text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 outline-none transition-all shadow-2xs"
              />
            </div>

            {/* Residential Address */}
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Residential Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter Residential Address"
                className="w-full px-4 py-2.5 sm:py-3 bg-white border border-slate-300 rounded-xl text-sm sm:text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 outline-none transition-all shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* CARD 2: ADMISSION DETAILS / CLINICAL ALLOCATION */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 lg:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm border shadow-2xs ${
                admissionType === 'IPD' 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                2
              </span>
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-800">
                {admissionType === 'IPD' ? 'Ward Allocation & Attending Doctor' : 'Clinical Department & Doctor Routing'}
              </h3>
            </div>
            <span className={`text-xs sm:text-sm font-semibold px-3 py-1 rounded-lg border ${
              admissionType === 'IPD'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {admissionType === 'IPD' ? 'Live Beds Mesh' : 'Consultation Slip'}
            </span>
          </div>

          {/* IPD CLINICAL ROUTING */}
          {admissionType === 'IPD' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {/* Bed Number */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Bed Number <span className="text-rose-500">*</span>
                  {!gender && <span className="text-xs text-amber-600 font-medium ml-1.5">(Pick gender first)</span>}
                </label>
                <div className="relative">
                  <select
                    disabled={!gender}
                    value={bedNumber}
                    onChange={(e) => setBedNumber(e.target.value)}
                    className="w-full px-4 py-2.5 sm:py-3 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed border border-slate-300 rounded-xl text-sm sm:text-[15px] font-medium text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 outline-none transition-all cursor-pointer appearance-none shadow-2xs pr-10"
                  >
                    {!gender ? (
                      <option value="">Select Gender First</option>
                    ) : getAvailableBeds().length === 0 ? (
                      <option value="">No free beds available</option>
                    ) : (
                      <>
                        <option value="">Select Available Bed</option>
                        {getAvailableBeds().map((bed) => (
                          <option key={bed} value={bed}>{bed}</option>
                        ))}
                      </>
                    )}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Assigned Ward (Auto-detected) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Assigned Ward</label>
                <div className="px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm sm:text-[15px] font-semibold text-slate-800 flex items-center justify-between shadow-2xs">
                  <span>{calculatedWard}</span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Allocated
                  </span>
                </div>
              </div>

              {/* Attending Doctor */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Attending Doctor <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={assignedDoctor}
                    onChange={(e) => setAssignedDoctor(e.target.value)}
                    className="w-full px-4 py-2.5 sm:py-3 bg-white border border-slate-300 rounded-xl text-sm sm:text-[15px] font-medium text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 outline-none transition-all cursor-pointer appearance-none shadow-2xs pr-10"
                  >
                    {doctors.length === 0 && (
                      <option value="" disabled>No doctors configured</option>
                    )}
                    {doctors.map(doc => (
                      <option key={doc} value={doc}>{doc}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Chief Complaint / Diagnosis */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Diagnosis / Chief Complaint
                  </label>
                  <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                    ⚡ Smart Auto-Suggest
                  </span>
                </div>
                <DiagnosisAutocomplete
                  value={condition}
                  onChange={setCondition}
                  placeholder="Enter Diagnosis / Chief Complaint"
                />
              </div>

              {/* Advance Deposit */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center justify-between">
                  <span>Advance Deposit (₹) <span className="text-rose-500">*</span></span>
                  <span className="text-blue-700 font-mono font-bold text-sm sm:text-base">
                    ₹{parseInt(depositAmount || '0', 10).toLocaleString('en-IN')}
                  </span>
                </label>
                <div className="flex rounded-xl shadow-2xs">
                  <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 text-slate-600 text-sm font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter Advance Deposit Amount"
                    className="w-full px-4 py-2.5 sm:py-3 bg-white border border-slate-300 rounded-r-xl text-sm sm:text-[15px] font-bold text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* OPD CLINICAL ROUTING */}
          {admissionType === 'OPD' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {/* Department */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Department <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={opdDepartment}
                    onChange={(e) => setOpdDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 sm:py-3 bg-white border border-slate-300 rounded-xl text-sm sm:text-[15px] font-medium text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 outline-none transition-all cursor-pointer appearance-none shadow-2xs pr-10"
                  >
                    {departments.length === 0 && (
                      <option value="" disabled>No departments configured</option>
                    )}
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Consultant Doctor */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Consultant Doctor <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={assignedDoctor}
                    onChange={(e) => setAssignedDoctor(e.target.value)}
                    className="w-full px-4 py-2.5 sm:py-3 bg-white border border-slate-300 rounded-xl text-sm sm:text-[15px] font-medium text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 outline-none transition-all cursor-pointer appearance-none shadow-2xs pr-10"
                  >
                    {doctors.length === 0 && (
                      <option value="" disabled>No doctors configured</option>
                    )}
                    {doctors.map((doc) => (
                      <option key={doc} value={doc}>{doc}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Consultation Fee */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center justify-between">
                  <span>Consultation Fee (₹)</span>
                  <span className="text-emerald-700 font-mono font-bold text-sm sm:text-base">₹{consultationFee}</span>
                </label>
                <div className="flex rounded-xl shadow-2xs">
                  <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 text-slate-600 text-sm font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    placeholder="Enter Consultation Fee"
                    className="w-full px-4 py-2.5 sm:py-3 bg-white border border-slate-300 rounded-r-xl text-sm sm:text-[15px] font-bold text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Symptoms / Chief Complaint */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Chief Complaint / Symptoms <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  placeholder="Enter Symptoms / Chief Complaint"
                  className="w-full px-4 py-2.5 sm:py-3 bg-white border border-slate-300 rounded-xl text-sm sm:text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 outline-none transition-all shadow-2xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* 3. PROFESSIONAL SAAS ACTION FOOTER */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Live Preview Summary */}
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl text-white font-bold text-base sm:text-lg flex items-center justify-center shrink-0 shadow-xs ${
              admissionType === 'IPD' ? 'bg-blue-600' : 'bg-emerald-600'
            }`}>
              {fullName ? fullName.charAt(0).toUpperCase() : '+'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  {fullName || 'New Patient'}
                </span>
                <span className="text-slate-300">•</span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                  admissionType === 'IPD'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {admissionType}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-sm font-medium text-slate-600 truncate">
                  {admissionType === 'IPD' ? (bedNumber ? `Bed ${bedNumber} (${calculatedWard})` : 'Bed unassigned') : opdDepartment}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {assignedDoctor} • {admissionType === 'IPD' ? `Advance: ₹${parseInt(depositAmount || '0', 10).toLocaleString('en-IN')}` : `Fee: ₹${consultationFee}`}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>Reset</span>
            </button>

            <button
              type="submit"
              className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-white text-sm sm:text-base font-bold transition-all flex items-center gap-2.5 cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98] ${
                admissionType === 'IPD'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <UserPlus className="w-5 h-5 stroke-[2.2]" />
              <span>{admissionType === 'IPD' ? 'Admit Patient & Allocate Bed' : 'Register OPD Patient'}</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
