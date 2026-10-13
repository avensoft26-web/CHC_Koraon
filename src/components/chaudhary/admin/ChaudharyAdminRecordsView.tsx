import React, { useState, useMemo, useEffect } from 'react';
import { api } from '../../../services/api';
import { 
  Search, 
  Printer, 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  BedDouble, 
  FileText, 
  HeartPulse, 
  Pill, 
  Receipt, 
  CheckCircle2, 
  X,
  Stethoscope,
  Activity,
  UserCheck,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export interface PatientCaseHistory {
  id: string; // Indoor No. / Patient ID
  uhid?: string;
  name: string;
  fatherHusbandName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  religion: string;
  address: string;
  phone: string;
  wardNo: string;
  physicianInCharge: string;
  admissionDate: string;
  admissionTime: string;
  dischargeDate: string;
  dischargeTime: string;
  provisionalDiagnosis: string;
  finalDiagnosis: string;
  result: string;
  witness: {
    name: string;
    address: string;
    date: string;
    place: string;
  };
  guardian: {
    name: string;
    address: string;
    date: string;
    place: string;
  };
  wardStays: Array<{
    wardType: string;
    bedNo: string;
    fromDate: string;
    toDate: string;
    ratePerDay: number | string;
  }>;
  surgeries: Array<{
    procedure: string;
    surgeon: string;
    date: string;
    charges: number | string;
    guardianProof: string;
  }>;
  vitalsLogs: Array<{
    dateTime: string;
    pulse: string;
    bp: string;
    temp: string;
    spO2: string;
    rbs: string;
    urine: string;
    drain: string;
    painScore: string;
    observer: string;
  }>;
  medicationLogs: Array<{
    prescribed: string;
    medicineName: string;
    typeDose: string;
    status: string;
    administeredDetails: string;
  }>;
  financialLedger: {
    payments: Array<{
      paymentDate: string;
      mode: string;
      amountPaid: number;
    }>;
    totalBill: number;
    discount: number;
    netPayable: number;
    totalPaid: number;
    balanceDue: number;
  };
}

// Module-level cache for instant tab switching
let cachedPatientRecordsMemory: PatientCaseHistory[] = [];

export const ChaudharyAdminRecordsView: React.FC = () => {
  const [patientRecords, setPatientRecords] = useState<PatientCaseHistory[]>(() => cachedPatientRecordsMemory);
  const [isLoadingRecords, setIsLoadingRecords] = useState(() => cachedPatientRecordsMemory.length === 0);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientCaseHistory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (patientRecords.length > 0) {
      cachedPatientRecordsMemory = patientRecords;
    }
  }, [patientRecords]);

  // Build the case-history index straight from MongoDB patients + their billing
  useEffect(() => {
    let isMounted = true;

    Promise.all([
      api.patients.getAll().catch(() => null),
      api.billing.getAll().catch(() => null),
    ]).then(([patRes, billRes]) => {
      if (!isMounted) return;

      if (!patRes?.success || !Array.isArray(patRes.patients)) {
        throw new Error('Unable to load patient records');
      }

      const billings = billRes?.success && Array.isArray(billRes.billings) ? billRes.billings : [];

      const records: PatientCaseHistory[] = patRes.patients.map((dbP: any) => {
        const b = billings.find((bl: any) => bl.patient_id === dbP.patient_id || bl.uhid === dbP.patient_id);
        const admittedAt = dbP.admission_date ? new Date(dbP.admission_date) : null;
        const totalBill = Number(b?.total_amount) || 0;
        const totalPaid = Number(b?.paid_amount) || 0;

        return {
          id: dbP.patient_id || dbP._id,
          uhid: dbP.patient_id || '—',
          name: dbP.name || 'Patient',
          fatherHusbandName: dbP.guardian_name || '—',
          age: dbP.age || 0,
          gender: dbP.gender === 'Female' ? 'Female' : 'Male',
          religion: dbP.religion || '—',
          address: dbP.address || '—',
          phone: dbP.mobile || '—',
          wardNo: `${dbP.ward_type || 'General Ward'} - Bed ${dbP.bed_no || '-'}`,
          physicianInCharge: dbP.doctor_assigned || '—',
          admissionDate: admittedAt && !isNaN(admittedAt.getTime())
            ? admittedAt.toLocaleDateString('en-IN')
            : '—',
          admissionTime: admittedAt && !isNaN(admittedAt.getTime())
            ? admittedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            : '—',
          dischargeDate: dbP.status === 'Discharged' ? 'Discharged' : 'Active Inpatient',
          dischargeTime: '—',
          provisionalDiagnosis: dbP.problem || '—',
          finalDiagnosis: dbP.problem || '—',
          result: dbP.status === 'Discharged' ? 'Discharged' : 'Under Active Care',
          witness: { name: dbP.guardian_name || '—', address: dbP.address || '—', date: '—', place: '—' },
          guardian: { name: dbP.guardian_name || '—', address: dbP.address || '—', date: '—', place: '—' },
          wardStays: [{ wardType: dbP.ward_type || 'General Ward', bedNo: dbP.bed_no || '-', fromDate: '—', toDate: 'Present', ratePerDay: 0 }],
          surgeries: [],
          vitalsLogs: [],
          medicationLogs: [],
          financialLedger: {
            payments: [],
            totalBill,
            discount: 0,
            netPayable: totalBill,
            totalPaid,
            balanceDue: Math.max(0, totalBill - totalPaid),
          },
        };
      });

      setPatientRecords(records);
      setRecordsError(null);
    }).catch((err: any) => {
      if (!isMounted) return;
      setRecordsError(err?.message || 'Unable to load patient records');
    }).finally(() => {
      if (isMounted) setIsLoadingRecords(false);
    });

    return () => { isMounted = false; };
  }, []);

  // Filtered patients for dropdown matching name, ID / indoor number, or phone
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return patientRecords;
    
    // Normalize clean search term (strip formatting like '| P-...')
    const cleanTerm = q.includes('|') ? q.split('|')[0].trim() : q;

    return patientRecords.filter((p) => {
      const matchName = p.name.toLowerCase().includes(cleanTerm);
      const matchId = p.id.toLowerCase().includes(cleanTerm) || (p.uhid && p.uhid.toLowerCase().includes(cleanTerm));
      const matchPhone = p.phone.replace(/\D/g, '').includes(cleanTerm.replace(/\D/g, ''));
      return matchName || matchId || matchPhone;
    });
  }, [searchQuery, patientRecords]);

  const handleSelectPatient = (patient: PatientCaseHistory) => {
    setSelectedPatient(patient);
    setSearchQuery(`${patient.name} | ${patient.id}`);
    setIsDropdownOpen(false);
  };

  const handleClear = () => {
    setSelectedPatient(null);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchResults.length > 0) {
        handleSelectPatient(searchResults[0]);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-full flex flex-col gap-4 pb-6">
      {/* Print-specific style tag to ensure ONLY the case record sheet is printed on clean A4 */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Hide non-print areas */
          .no-print, 
          header, 
          nav, 
          aside, 
          footer {
            display: none !important;
          }
          /* Make sure printable case record sheet takes full width with crisp black/navy borders */
          #printable-case-record {
            display: block !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 12mm 15mm !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: #000000 !important;
          }
          #printable-case-record * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Top Search & Filter Bar (Hidden in Print) */}
      <div className="no-print bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 relative">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-emerald-600" />
              <span>Select Patient for Case Record</span>
            </label>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onKeyDown={handleKeyDown}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                  if (selectedPatient && e.target.value !== `${selectedPatient.name} | ${selectedPatient.id}`) {
                    setSelectedPatient(null);
                  }
                }}
                placeholder="Search patient by Name, ID (Indoor No. / UHID), or Mobile No..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-inner"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Autocomplete Dropdown */}
              {isDropdownOpen && searchQuery.trim() !== '' && (
                <div 
                  className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-72 overflow-y-auto divide-y divide-slate-100"
                >
                  {searchResults.length > 0 ? (
                    searchResults.map((pt) => (
                      <div
                        key={pt.id}
                        onMouseDown={() => handleSelectPatient(pt)}
                        className={`p-3 cursor-pointer flex items-center justify-between hover:bg-emerald-50/70 transition-colors ${
                          selectedPatient?.id === pt.id ? 'bg-emerald-50/90 border-l-4 border-emerald-600' : ''
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs sm:text-sm text-slate-900">{pt.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                              {pt.age}Y • {pt.gender}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                            <span>ID: <strong className="text-slate-700 font-mono">{pt.id}</strong></span>
                            <span>•</span>
                            <span>Phone: <strong className="text-slate-700">{pt.phone}</strong></span>
                            <span>•</span>
                            <span>Ward: {pt.wardNo}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {pt.dischargeDate === 'Discharged' ? 'Discharged' : 'Active IPD'}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1">Adm: {pt.admissionDate}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500 font-medium">
                      No matching patient found for "{searchQuery}". You can search by Name, Phone, or Patient ID.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons (Print & Clear) */}
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-end">
            {selectedPatient && (
              <button
                onClick={handleClear}
                className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Search Another</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              disabled={!selectedPatient}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all ${
                selectedPatient 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95 hover:shadow-lg' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>Print Record</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conditionally Render Printable Record Dossier OR Empty / Search Results State */}
      {selectedPatient ? (
        <div 
          id="printable-case-record"
          className="bg-white max-w-4xl mx-auto w-full p-6 sm:p-10 rounded-2xl border border-slate-200/90 shadow-md text-slate-900"
        >
        {/* Hospital Letterhead Header */}
        <div className="flex items-center justify-between pb-2">
          {/* Logo Emblem */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-blue-600 flex items-center justify-center bg-white shadow-2xs">
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full border border-red-500 flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-blue-700">
                  <span className="text-blue-700">H</span>
                  <span className="text-red-600">C</span>
                </span>
              </div>
            </div>
          </div>

          {/* Hospital Name & Subtitles */}
          <div className="text-center flex-1 px-2">
            <h1 className="text-lg sm:text-2xl font-extrabold text-blue-700 tracking-tight leading-tight">
              Chaudhary Health Care Center Koraon
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5">
              A Complete Healthcare Point
            </p>
            <p className="text-[11px] text-slate-600 font-medium">
              Koraon-Prayagraj
            </p>
            <p className="text-[11px] font-bold text-slate-800">
              Mob.: 9918333370, 8896017340
            </p>
          </div>

          {/* Spacer for symmetry */}
          <div className="w-16 sm:w-20 shrink-0 hidden sm:block"></div>
        </div>

        {/* Boxed Title */}
        <div className="flex justify-center my-2">
          <div className="border border-slate-900 px-5 py-0.5 text-center">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
              IN PATIENT RECORD
            </h2>
          </div>
        </div>

        {/* Top Dividing Line */}
        <div className="border-b-2 border-blue-600 mb-4"></div>

        {/* Patient Demographics & Admission Form with Dotted Leaders */}
        <div className="space-y-2 text-xs sm:text-[13px] leading-relaxed font-serif">
          {/* Row 1: Indoor No & Ward No */}
          <div className="flex flex-col sm:flex-row justify-between gap-1">
            <div className="flex-1 flex items-baseline">
              <span className="font-bold text-slate-900 whitespace-nowrap">INDOOR No.:</span>
              <span className="font-mono font-bold text-slate-900 px-1.5">{selectedPatient.id}</span>
              <span className="border-b border-dotted border-slate-600 flex-1 min-w-[30px]"></span>
            </div>
            <div className="w-full sm:w-64 flex items-baseline">
              <span className="font-bold text-slate-900 whitespace-nowrap">WARD No.:</span>
              <span className="font-semibold text-slate-800 px-1.5">{selectedPatient.wardNo || ''}</span>
              <span className="border-b border-dotted border-slate-600 flex-1 min-w-[40px]"></span>
            </div>
          </div>

          {/* Row 2: Patient's Name */}
          <div className="flex items-baseline">
            <span className="font-bold text-slate-900 whitespace-nowrap">Patient's Name:</span>
            <span className="font-bold text-slate-900 px-1.5">{selectedPatient.name}</span>
            <span className="border-b border-dotted border-slate-600 flex-1 min-w-[50px]"></span>
          </div>

          {/* Row 3: Fathers/Husband Name */}
          <div className="flex items-baseline">
            <span className="font-bold text-slate-900 whitespace-nowrap">Fathers/Husband Name:</span>
            <span className="font-medium text-slate-900 px-1.5">{selectedPatient.fatherHusbandName}</span>
            <span className="border-b border-dotted border-slate-600 flex-1 min-w-[50px]"></span>
          </div>

          {/* Row 4: Age, Sex, Religion */}
          <div className="flex flex-wrap items-baseline gap-4 sm:gap-6">
            <div className="flex items-baseline">
              <span className="font-bold text-slate-900">Age:</span>
              <span className="font-medium text-slate-900 px-1.5">{selectedPatient.age}</span>
              <span className="border-b border-dotted border-slate-600 w-10"></span>
            </div>
            <div className="flex items-baseline">
              <span className="font-bold text-slate-900">Sex:</span>
              <span className="font-medium text-slate-900 px-1.5">{selectedPatient.gender}</span>
              <span className="border-b border-dotted border-slate-600 w-16"></span>
            </div>
            <div className="flex-1 flex items-baseline">
              <span className="font-bold text-slate-900 whitespace-nowrap">Religion:</span>
              <span className="font-medium text-slate-900 px-1.5">{selectedPatient.religion}</span>
              <span className="border-b border-dotted border-slate-600 flex-1 min-w-[40px]"></span>
            </div>
          </div>

          {/* Row 5: Address & Mobile No */}
          <div className="flex flex-col sm:flex-row justify-between gap-1 items-start sm:items-baseline">
            <div className="flex-1 flex items-baseline w-full">
              <span className="font-bold text-slate-900 whitespace-nowrap">Address:</span>
              <span className="font-medium text-slate-900 px-1.5">{selectedPatient.address}</span>
              <span className="border-b border-dotted border-slate-600 flex-1 min-w-[20px]"></span>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-full sm:w-72 flex items-baseline">
              <span className="font-bold text-slate-900 whitespace-nowrap">Mobile No.</span>
              <span className="font-mono font-bold text-slate-900 px-1.5">{selectedPatient.phone}</span>
              <span className="border-b border-dotted border-slate-600 flex-1 min-w-[40px]"></span>
            </div>
          </div>

          {/* Row 6: Physician/Surgeon-In-Charge */}
          <div className="flex items-baseline">
            <span className="font-bold text-slate-900 whitespace-nowrap">Physician/Surgeon-In-Charge:</span>
            <span className="font-bold text-slate-900 px-1.5">{selectedPatient.physicianInCharge}</span>
            <span className="border-b border-dotted border-slate-600 flex-1 min-w-[40px]"></span>
          </div>

          {/* Row 7: Date of Admission & Time */}
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <div className="flex-1 flex items-baseline">
              <span className="font-bold text-slate-900 whitespace-nowrap">Date of Admission:</span>
              <span className="font-medium text-slate-900 px-1.5">{selectedPatient.admissionDate}</span>
              <span className="border-b border-dotted border-slate-600 flex-1 min-w-[30px]"></span>
            </div>
            <div className="w-full sm:w-64 flex items-baseline">
              <span className="font-bold text-slate-900 whitespace-nowrap">Time:</span>
              <span className="font-medium text-slate-900 px-1.5">{selectedPatient.admissionTime}</span>
              <span className="border-b border-dotted border-slate-600 flex-1 min-w-[40px]"></span>
            </div>
          </div>

          {/* Row 8: Date of Discharge & Time */}
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <div className="flex-1 flex items-baseline">
              <span className="font-bold text-slate-900 whitespace-nowrap">Date of Discharge:</span>
              <span className="font-medium text-slate-900 px-1.5">{selectedPatient.dischargeDate}</span>
              <span className="border-b border-dotted border-slate-600 flex-1 min-w-[30px]"></span>
            </div>
            <div className="w-full sm:w-64 flex items-baseline">
              <span className="font-bold text-slate-900 whitespace-nowrap">Time:</span>
              <span className="font-medium text-slate-900 px-1.5">{selectedPatient.dischargeTime}</span>
              <span className="border-b border-dotted border-slate-600 flex-1 min-w-[40px]"></span>
            </div>
          </div>

          {/* Row 9: Provisional Diagnosis */}
          <div className="flex items-baseline">
            <span className="font-bold text-slate-900 whitespace-nowrap">Provisional Diagnosis:</span>
            <span className="font-medium text-slate-900 px-1.5">{selectedPatient.provisionalDiagnosis}</span>
            <span className="border-b border-dotted border-slate-600 flex-1 min-w-[40px]"></span>
          </div>

          {/* Row 10: Final Diagnosis */}
          <div className="flex items-baseline">
            <span className="font-bold text-slate-900 whitespace-nowrap">Final Diagnosis:</span>
            <span className="font-medium text-slate-900 px-1.5">{selectedPatient.finalDiagnosis}</span>
            <span className="border-b border-dotted border-slate-600 flex-1 min-w-[40px]"></span>
          </div>

          {/* Row 11: Result */}
          <div className="flex items-baseline">
            <span className="font-bold text-slate-900 whitespace-nowrap">Result:</span>
            <span className="font-medium text-slate-900 px-1.5">{selectedPatient.result}</span>
            <span className="border-b border-dotted border-slate-600 flex-1 min-w-[40px]"></span>
          </div>
        </div>

        {/* Hindi Consent Declaration (Matching screenshot exactly) */}
        <div className="my-6 px-4 text-center">
          <p className="text-[11px] sm:text-xs text-blue-900 leading-relaxed font-serif">
            मैं एतद्द्वारा अपने रोगी के किसी प्रकार के नैदानिक परीक्षण, उपचार एवं वह हेतु आवश्यक शल्य क्रिया व नियोजक औषधियों के प्रयोग की अनुमति देता / देती हूँ। मुझे इसके सभी संभावित परिणामों से अवगत करा दिया गया है।
          </p>
        </div>

        {/* Two-Column Witness & Guardian Signature Block */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-5 font-serif text-xs leading-relaxed">
          {/* Left Column: साक्षी गवाह */}
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-xs sm:text-[13px]">
              साक्षी गवाह
            </h4>
            
            <div className="flex items-baseline pt-1">
              <span className="font-semibold text-slate-800">नाम:</span>
              <span className="border-b border-dotted border-slate-600 flex-1 ml-1 min-w-[40px]">
                {selectedPatient.witness.name}
              </span>
            </div>

            <div className="pl-4 text-[11px] text-slate-700">
              <p>{selectedPatient.witness.address}</p>
            </div>

            <div className="flex items-baseline pt-1">
              <span className="font-semibold text-slate-800">वर्तमान पता:</span>
              <span className="font-medium text-slate-900 px-1">Koraon</span>
              <span className="border-b border-dotted border-slate-600 flex-1"></span>
            </div>

            <div className="flex items-baseline">
              <span className="font-semibold text-slate-800">दिनांक:</span>
              <span className="font-medium text-slate-900 px-1">{selectedPatient.witness.date}</span>
              <span className="border-b border-dotted border-slate-600 flex-1"></span>
            </div>

            <div className="flex items-baseline">
              <span className="font-semibold text-slate-800">स्थान:</span>
              <span className="font-medium text-slate-900 px-1">{selectedPatient.witness.place}</span>
              <span className="border-b border-dotted border-slate-600 flex-1"></span>
            </div>
          </div>

          {/* Right Column: रोगी से संबंधित हस्ताक्षर */}
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-xs sm:text-[13px]">
              रोगी से संबंधित हस्ताक्षर
            </h4>

            <div className="pt-2 pb-1 text-center">
              <span className="text-slate-400 italic text-[11px]">Signature / अंगूठा</span>
              <div className="border-b border-slate-800 w-48 mx-auto mt-2"></div>
            </div>

            <div className="flex items-baseline pt-1">
              <span className="font-semibold text-slate-800">नाम:</span>
              <span className="border-b border-dotted border-slate-600 flex-1 ml-1 min-w-[40px]">
                {selectedPatient.guardian.name}
              </span>
            </div>

            <div className="pl-4 text-[11px] text-slate-700">
              <p>{selectedPatient.guardian.address}</p>
            </div>

            <div className="flex items-baseline pt-1">
              <span className="font-semibold text-slate-800">वर्तमान पता:</span>
              <span className="font-medium text-slate-900 px-1">Koraon</span>
              <span className="border-b border-dotted border-slate-600 flex-1"></span>
            </div>

            <div className="flex items-baseline">
              <span className="font-semibold text-slate-800">दिनांक:</span>
              <span className="font-medium text-slate-900 px-1">{selectedPatient.guardian.date}</span>
              <span className="border-b border-dotted border-slate-600 flex-1"></span>
            </div>

            <div className="flex items-baseline">
              <span className="font-semibold text-slate-800">स्थान:</span>
              <span className="font-medium text-slate-900 px-1">{selectedPatient.guardian.place}</span>
              <span className="border-b border-dotted border-slate-600 flex-1"></span>
            </div>
          </div>
        </div>

        {/* Dividing Border for Case History */}
        <div className="border-b-2 border-blue-600 my-6"></div>

        {/* Section Header: PATIENT COMPLETE MEDICAL JOURNEY & CASE HISTORY */}
        <div className="text-center mb-5">
          <h3 className="font-black text-blue-700 tracking-wider text-xs sm:text-sm uppercase">
            PATIENT COMPLETE MEDICAL JOURNEY &amp; CASE HISTORY
          </h3>
        </div>

        {/* Sub-Section 1: Ward & Bed Stay Timeline */}
        <div className="mb-6">
          <h4 className="font-bold text-xs text-blue-800 mb-2 flex items-center gap-1.5">
            <span>🛏️</span>
            <span>1. Ward &amp; Bed Stay Timeline</span>
          </h4>

          <div className="overflow-x-auto border border-slate-300 rounded-lg">
            <table className="w-full text-left text-[11px] sm:text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-1.5 px-3">Ward Type</th>
                  <th className="py-1.5 px-3">Bed No.</th>
                  <th className="py-1.5 px-3">From Date</th>
                  <th className="py-1.5 px-3">To Date</th>
                  <th className="py-1.5 px-3 text-right">Rate / Day</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {selectedPatient.wardStays.length > 0 ? (
                  selectedPatient.wardStays.map((stay, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 font-medium">{stay.wardType}</td>
                      <td className="py-1.5 px-3">{stay.bedNo}</td>
                      <td className="py-1.5 px-3">{stay.fromDate}</td>
                      <td className="py-1.5 px-3">{stay.toDate}</td>
                      <td className="py-1.5 px-3 text-right font-mono">₹{stay.ratePerDay}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-2 px-3 text-center text-slate-500 italic">
                      No ward transfers recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sub-Section 2: Surgeries & Interventions */}
        <div className="mb-6">
          <h4 className="font-bold text-xs text-blue-800 mb-2 flex items-center gap-1.5">
            <span>🩺</span>
            <span>2. Surgeries &amp; Interventions</span>
          </h4>

          <div className="overflow-x-auto border border-slate-300 rounded-lg">
            <table className="w-full text-left text-[11px] sm:text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-1.5 px-3">Surgery/Procedure</th>
                  <th className="py-1.5 px-3">Surgeon</th>
                  <th className="py-1.5 px-3">Date</th>
                  <th className="py-1.5 px-3">Charges</th>
                  <th className="py-1.5 px-3">Guardian Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {selectedPatient.surgeries.length > 0 ? (
                  selectedPatient.surgeries.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 font-semibold text-slate-900">{s.procedure}</td>
                      <td className="py-1.5 px-3">{s.surgeon}</td>
                      <td className="py-1.5 px-3">{s.date}</td>
                      <td className="py-1.5 px-3 font-mono">₹{s.charges}</td>
                      <td className="py-1.5 px-3 text-emerald-700 font-medium">{s.guardianProof}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-2 px-3 text-center text-slate-500 italic">
                      No surgical procedures recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sub-Section 3: Clinical Observation Chart (Vitals Log) */}
        <div className="mb-6">
          <h4 className="font-bold text-xs text-blue-800 mb-2 flex items-center gap-1.5">
            <span>📉</span>
            <span>3. Clinical Observation Chart (Vitals Log)</span>
          </h4>

          <div className="overflow-x-auto border border-slate-300 rounded-lg">
            <table className="w-full text-left text-[11px] sm:text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-1.5 px-2">Date &amp; Time</th>
                  <th className="py-1.5 px-2">Pulse</th>
                  <th className="py-1.5 px-2">BP</th>
                  <th className="py-1.5 px-2">Temp</th>
                  <th className="py-1.5 px-2">SpO2</th>
                  <th className="py-1.5 px-2">RBS</th>
                  <th className="py-1.5 px-2">Urine (ml)</th>
                  <th className="py-1.5 px-2">Drain (ml)</th>
                  <th className="py-1.5 px-2">Pain Score</th>
                  <th className="py-1.5 px-2">Observer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {selectedPatient.vitalsLogs.length > 0 ? (
                  selectedPatient.vitalsLogs.map((v, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 font-mono text-[10.5px]">
                      <td className="py-1.5 px-2 font-sans font-medium">{v.dateTime}</td>
                      <td className="py-1.5 px-2">{v.pulse}</td>
                      <td className="py-1.5 px-2">{v.bp}</td>
                      <td className="py-1.5 px-2">{v.temp}</td>
                      <td className="py-1.5 px-2">{v.spO2}</td>
                      <td className="py-1.5 px-2">{v.rbs}</td>
                      <td className="py-1.5 px-2">{v.urine}</td>
                      <td className="py-1.5 px-2">{v.drain}</td>
                      <td className="py-1.5 px-2">{v.painScore}</td>
                      <td className="py-1.5 px-2 font-sans text-slate-700">{v.observer}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="py-2 px-3 text-center text-slate-500 italic">
                      No clinical observations charted.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sub-Section 4: Medication & Treatment Logs */}
        <div className="mb-6">
          <h4 className="font-bold text-xs text-blue-800 mb-2 flex items-center gap-1.5">
            <span>💊</span>
            <span>4. Medication &amp; Treatment Logs</span>
          </h4>

          <div className="overflow-x-auto border border-slate-300 rounded-lg">
            <table className="w-full text-left text-[11px] sm:text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-1.5 px-3">Prescribed</th>
                  <th className="py-1.5 px-3">Medicine Name</th>
                  <th className="py-1.5 px-3">Type &amp; Dose</th>
                  <th className="py-1.5 px-3">Status</th>
                  <th className="py-1.5 px-3">Administered Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {selectedPatient.medicationLogs.length > 0 ? (
                  selectedPatient.medicationLogs.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 text-slate-600">{m.prescribed}</td>
                      <td className="py-1.5 px-3 font-semibold text-slate-900">{m.medicineName}</td>
                      <td className="py-1.5 px-3">{m.typeDose}</td>
                      <td className="py-1.5 px-3 text-emerald-700 font-medium">{m.status}</td>
                      <td className="py-1.5 px-3 text-slate-600">{m.administeredDetails}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-2 px-3 text-center text-slate-500 italic">
                      No medications prescribed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sub-Section 5: Final Billing & Financial Ledger */}
        <div className="mb-4">
          <h4 className="font-bold text-xs text-blue-800 mb-2 flex items-center gap-1.5">
            <span>🧾</span>
            <span>5. Final Billing &amp; Financial Ledger</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {/* Left: Payment Transactions Table */}
            <div className="border border-slate-300 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-[11px] sm:text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-1.5 px-3">Payment Date</th>
                    <th className="py-1.5 px-3">Mode</th>
                    <th className="py-1.5 px-3 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedPatient.financialLedger.payments.length > 0 ? (
                    selectedPatient.financialLedger.payments.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-1.5 px-3">{p.paymentDate}</td>
                        <td className="py-1.5 px-3 font-medium">{p.mode}</td>
                        <td className="py-1.5 px-3 text-right font-mono font-bold text-emerald-700">₹{p.amountPaid}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-3 px-3 text-center text-slate-500 italic text-[11px]">
                        No financial ledger recorded in billing.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Right: Summary Ledger Card matching screenshot */}
            <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200 space-y-1.5 text-xs font-semibold">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Total Bill:</span>
                <span className="font-mono text-slate-900 font-bold">₹{selectedPatient.financialLedger.totalBill}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Discount:</span>
                <span className="font-mono text-slate-600">₹{selectedPatient.financialLedger.discount}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="font-extrabold text-slate-900">Net Payable:</span>
                <span className="font-mono font-black text-slate-900">₹{selectedPatient.financialLedger.netPayable}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-700 font-bold">Total Paid:</span>
                <span className="font-mono font-bold text-emerald-600">₹{selectedPatient.financialLedger.totalPaid}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-red-600 font-extrabold">Balance Due:</span>
                <span className="font-mono font-black text-red-600">₹{selectedPatient.financialLedger.balanceDue}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Official Footer Stamp / Note */}
        <div className="mt-8 pt-4 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500">
          <p>Generated electronically from Chaudhary Health Care Center Hospital Information System</p>
          <p className="font-mono">Record ID: {selectedPatient.id} • Authenticated Copy</p>
        </div>
      </div>
    ) : (
      /* Empty / Search Prompt State when no patient is selected */
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-xs text-center flex flex-col items-center justify-center my-auto min-h-[380px]">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-2xs">
          <FileText className="w-8 h-8" />
        </div>
        
        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
          Search Patient for Official Case Record
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-lg mt-1 mb-6">
          Enter patient's <strong className="text-slate-800">Name</strong>, <strong className="text-slate-800">Indoor No. / UHID</strong>, or <strong className="text-slate-800">Mobile Number</strong> in the search bar above to load and print their complete medical journey and case record.
        </p>

        {/* Live data status banner */}
        {isLoadingRecords && patientRecords.length === 0 && (
          <div className="w-full max-w-2xl p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center mb-4">
            <p className="text-xs font-bold text-slate-500">Loading patient case records from database...</p>
          </div>
        )}
        {!isLoadingRecords && recordsError && (
          <div className="w-full max-w-2xl p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-center mb-4">
            <p className="text-xs font-bold text-rose-700">{recordsError}</p>
          </div>
        )}
        {!isLoadingRecords && !recordsError && patientRecords.length === 0 && (
          <div className="w-full max-w-2xl p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center mb-4">
            <p className="text-xs font-bold text-slate-500">No patient records in the database yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Admitted patients will appear here automatically.</p>
          </div>
        )}

        {/* If user is typing in search bar */}
        {searchQuery.trim() !== '' ? (
          <div className="w-full max-w-2xl">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-left flex items-center justify-between">
              <span>Matching Patients ({searchResults.length}):</span>
              <span className="text-[10px] text-slate-400">Click any patient to open record</span>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {searchResults.map((pt) => (
                  <div
                    key={pt.id}
                    onClick={() => handleSelectPatient(pt)}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex items-center justify-between cursor-pointer group shadow-2xs bg-slate-50/50"
                  >
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700">
                        {pt.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        ID: <span className="font-mono text-slate-700 font-bold">{pt.id}</span>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Phone: <span className="text-slate-700 font-semibold">{pt.phone}</span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Ward: {pt.wardNo}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-white border border-slate-200 group-hover:bg-emerald-600 group-hover:border-emerald-600 group-hover:text-white text-slate-700 transition-all shrink-0">
                      View Record →
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-amber-50/80 border border-amber-200 text-center">
                <p className="font-bold text-xs text-amber-900">
                  No patient record found matching "{searchQuery}"
                </p>
                <p className="text-[11px] text-amber-700 mt-1">
                  Please verify the spelling, Patient ID (Indoor No.), or mobile number and search again.
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    )}
    </div>
  );
};
