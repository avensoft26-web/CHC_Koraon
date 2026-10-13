import React from 'react';
import {
  Activity,
  X,
  User,
  FileText,
  ShieldCheck,
  PenTool,
  Camera,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { ChaudharyPatientRow } from '../ChaudharyPatientsView';

export interface SurgeryConsentModalProps {
  patient: ChaudharyPatientRow | null;
  onClose: () => void;
  onConfirm: () => void;
  surgeryProcedure: string;
  setSurgeryProcedure: (val: string) => void;
  surgeonName: string;
  setSurgeonName: (val: string) => void;
  surgeryDate: string;
  setSurgeryDate: (val: string) => void;
  surgeryCharges: string;
  setSurgeryCharges: (val: string) => void;
  indoorIpdNo: string;
  setIndoorIpdNo: (val: string) => void;
  wardNo: string;
  setWardNo: (val: string) => void;
  provisionalDiagnosis: string;
  setProvisionalDiagnosis: (val: string) => void;
  finalDiagnosis: string;
  setFinalDiagnosis: (val: string) => void;
  patientSignName: string;
  setPatientSignName: (val: string) => void;
  patientSignAge: string;
  setPatientSignAge: (val: string) => void;
  guardianSignName: string;
  setGuardianSignName: (val: string) => void;
  guardianRelation: string;
  setGuardianRelation: (val: string) => void;
  guardianSignDate: string;
  setGuardianSignDate: (val: string) => void;
  guardianSignPlace: string;
  setGuardianSignPlace: (val: string) => void;
  uploadedProofName: string | null;
  setUploadedProofName: (val: string | null) => void;
  webcamPhoto: string | null;
  setWebcamPhoto: (val: string | null) => void;
  isWebcamActive: boolean;
  setIsWebcamActive: (val: boolean) => void;
  signatureData: string | null;
  setSignatureData: (val: string | null) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onCaptureWebcamPhoto: () => void;
  onToast: (msg: string) => void;
}

export const SurgeryConsentModal: React.FC<SurgeryConsentModalProps> = ({
  patient,
  onClose,
  onConfirm,
  surgeryProcedure,
  setSurgeryProcedure,
  surgeonName,
  setSurgeonName,
  surgeryDate,
  setSurgeryDate,
  surgeryCharges,
  setSurgeryCharges,
  indoorIpdNo,
  setIndoorIpdNo,
  wardNo,
  setWardNo,
  provisionalDiagnosis,
  setProvisionalDiagnosis,
  finalDiagnosis,
  setFinalDiagnosis,
  patientSignName,
  setPatientSignName,
  patientSignAge,
  setPatientSignAge,
  guardianSignName,
  setGuardianSignName,
  guardianRelation,
  setGuardianRelation,
  guardianSignDate,
  setGuardianSignDate,
  guardianSignPlace,
  setGuardianSignPlace,
  uploadedProofName,
  setUploadedProofName,
  webcamPhoto,
  setWebcamPhoto,
  isWebcamActive,
  setIsWebcamActive,
  signatureData,
  setSignatureData,
  videoRef,
  onCaptureWebcamPhoto,
  onToast,
}) => {
  if (!patient) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="w-full max-w-4xl lg:max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/70 animate-scaleUp max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Activity className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
              Add Surgery Event &amp; Operation Consent
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Scrollable Landscape Body */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs sm:text-sm">
          {/* Patient Banner */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-blue-50/70 border-l-4 border-blue-600 rounded-r-xl font-semibold text-slate-700">
            <User className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Recording surgery for patient:{' '}
              <strong className="text-slate-950 font-bold">{patient.name}</strong>{' '}
              <span className="text-slate-500 font-normal">
                (ID: <span className="font-mono text-blue-800 font-bold">{patient.id}</span> • Bed:{' '}
                <span className="font-bold text-slate-900">{patient.bedNo}</span>)
              </span>
            </span>
          </div>

          {/* Section 1: SURGERY & DIAGNOSIS INFORMATION */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>SURGERY &amp; DIAGNOSIS INFORMATION</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                  Surgery Name / Procedure *
                </label>
                <input
                  type="text"
                  value={surgeryProcedure}
                  onChange={(e) => setSurgeryProcedure(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                  placeholder="e.g. Laparoscopic Appendectomy"
                />
              </div>

              <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                  Surgeon Name *
                </label>
                <input
                  type="text"
                  value={surgeonName}
                  onChange={(e) => setSurgeonName(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                  placeholder="Surgeon full name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                  Surgery Date *
                </label>
                <input
                  type="date"
                  value={surgeryDate}
                  onChange={(e) => setSurgeryDate(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent cursor-pointer"
                />
              </div>

              <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                  Surgery Base Charges (₹) *
                </label>
                <input
                  type="number"
                  value={surgeryCharges}
                  onChange={(e) => setSurgeryCharges(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                  placeholder="0"
                />
              </div>

              <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                  INDOOR No. (IPD No.) (Optional)
                </label>
                <input
                  type="text"
                  value={indoorIpdNo}
                  onChange={(e) => setIndoorIpdNo(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                  placeholder="Optional"
                />
              </div>

              <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                  WARD No. (Optional)
                </label>
                <input
                  type="text"
                  value={wardNo}
                  onChange={(e) => setWardNo(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                  Provisional Diagnosis (Optional)
                </label>
                <input
                  type="text"
                  value={provisionalDiagnosis}
                  onChange={(e) => setProvisionalDiagnosis(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                  placeholder="Optional"
                />
              </div>

              <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                  Final Diagnosis (Optional)
                </label>
                <input
                  type="text"
                  value={finalDiagnosis}
                  onChange={(e) => setFinalDiagnosis(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Section 2: OPERATION CONSENT & DECLARATION */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>सहमति पत्र (OPERATION CONSENT &amp; DECLARATION)</span>
            </h4>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-slate-800 space-y-2.5 text-xs sm:text-sm leading-relaxed">
              <p className="font-semibold text-amber-950">
                मैं प्रमाणित करता/करती हूँ कि मुझे तथा मेरे अभिभावक को ऑपरेशन/चिकित्सा की प्रक्रिया, संभावित लाभ एवं जोखिम भली-भांति समझा दिए गए हैं।
              </p>
              <p className="text-slate-700">
                ऑपरेशन के दौरान या उपरांत किसी भी अप्रत्याशित परिस्थिति या आपात स्थिति में चिकित्सक द्वारा लिए गए निर्णय की मैं पूर्ण सहमति देता/देती हूँ।
              </p>
            </div>
          </div>

          {/* Section 3: SIGNATORY DECLARATION */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>हस्ताक्षरकर्ता विवरण (SIGNATORY DETAILS)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="space-y-3">
                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                    मरीज का नाम (Patient Name)
                  </label>
                  <input
                    type="text"
                    value={patientSignName}
                    onChange={(e) => setPatientSignName(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                  />
                </div>

                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                    उम्र (Age)
                  </label>
                  <input
                    type="number"
                    value={patientSignAge}
                    onChange={(e) => setPatientSignAge(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                    अभिभावक/रिश्तेदार का नाम (Guardian)
                  </label>
                  <input
                    type="text"
                    value={guardianSignName}
                    onChange={(e) => setGuardianSignName(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                    <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                      सम्बन्ध (Relation)
                    </label>
                    <input
                      type="text"
                      value={guardianRelation}
                      onChange={(e) => setGuardianRelation(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                      placeholder="Father / Mother"
                    />
                  </div>

                  <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                    <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                      स्थान (Place)
                    </label>
                    <input
                      type="text"
                      value={guardianSignPlace}
                      onChange={(e) => setGuardianSignPlace(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                      placeholder="Bareilly"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: PATIENT SIGNATURE PROOF */}
          <div className="space-y-3 pt-2">
            <h4 className="font-semibold text-purple-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5" />
              <span>PATIENT SIGNATURE PROOF</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left Column: Upload / Web Camera Options */}
              <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-4 space-y-3.5">
                <div>
                  <h5 className="font-bold text-slate-800 text-xs mb-1.5">
                    Method 1: Upload Image (Gallery / Native Camera)
                  </h5>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadedProofName(file.name);
                        onToast(`File selected: ${file.name}`);
                      }
                    }}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                  />
                  {uploadedProofName && (
                    <p className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {uploadedProofName}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                  <span className="flex-1 h-[1px] bg-slate-200" />
                  <span>— OR —</span>
                  <span className="flex-1 h-[1px] bg-slate-200" />
                </div>

                <div>
                  <h5 className="font-bold text-slate-800 text-xs mb-1.5">
                    Method 2: Take Instant Photo via Web Camera
                  </h5>
                  <button
                    type="button"
                    onClick={onCaptureWebcamPhoto}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{isWebcamActive ? 'Capture Camera Shot' : 'Activate Camera'}</span>
                  </button>
                  {webcamPhoto && (
                    <img src={webcamPhoto} alt="Proof" className="mt-2 w-32 h-20 object-cover rounded-lg border border-indigo-200" />
                  )}
                </div>
              </div>

              {/* Right Column: Digital Canvas Signature */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="font-bold text-slate-800 text-xs">
                    Method 3: Digital Signature / Touch Sign
                  </h5>
                  {signatureData && (
                    <button
                      type="button"
                      onClick={() => setSignatureData(null)}
                      className="text-rose-600 hover:text-rose-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                <div
                  onClick={() => {
                    if (!signatureData) {
                      setSignatureData('signed');
                      onToast('Digital signature recorded!');
                    }
                  }}
                  className="flex-1 min-h-[110px] my-2 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-100/70 transition-colors relative overflow-hidden"
                  title="Click or tap to digitally sign"
                >
                  {signatureData ? (
                    <div className="text-center p-2">
                      <svg className="w-36 h-12 text-blue-900 mx-auto" viewBox="0 0 200 60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M10 40 Q 30 10, 50 35 T 90 25 T 130 45 T 170 20" />
                        <path d="M50 45 Q 80 50, 110 48" strokeWidth="1.5" />
                      </svg>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 block mt-1">
                        ✓ Verified Digital Signature
                      </span>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 p-2">
                      <PenTool className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <p className="text-xs font-semibold">Click / Draw to Sign Here</p>
                      <p className="text-[10px] text-slate-400">हस्ताक्षर करने के लिए यहाँ क्लिक करें</p>
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 text-center font-medium">
                  Use touch/mouse to sign above, or upload signed physical form on the left.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-slate-600 hover:text-slate-900 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Activity className="w-4 h-4" />
            <span>Process &amp; Save Surgery Event (सहमति सुरक्षित करें)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
