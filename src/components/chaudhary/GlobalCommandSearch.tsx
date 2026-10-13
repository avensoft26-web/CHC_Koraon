import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, User, BedDouble, Stethoscope, ArrowRight, Phone, ShieldCheck } from 'lucide-react';
import { useHospitalContext } from '../../context/HospitalContext';
import { ChaudharyPatientRow } from './ChaudharyPatientsView';

interface GlobalCommandSearchProps {
  onSelectPatient?: (patient: ChaudharyPatientRow) => void;
}

export const GlobalCommandSearch: React.FC<GlobalCommandSearchProps> = ({ onSelectPatient }) => {
  const { isGlobalSearchOpen, setIsGlobalSearchOpen, patients } = useHospitalContext();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isGlobalSearchOpen) {
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isGlobalSearchOpen]);

  const filtered = useMemo(() => {
    if (!query.trim()) return patients.slice(0, 6);
    const q = query.toLowerCase().trim();
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.bedNo.toLowerCase().includes(q) ||
        p.ward.toLowerCase().includes(q) ||
        (p.phone && p.phone.includes(q)) ||
        (p.doctor && p.doctor.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [patients, query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, Math.max(0, filtered.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        if (onSelectPatient) onSelectPatient(filtered[selectedIndex]);
        setIsGlobalSearchOpen(false);
      }
    }
  };

  if (!isGlobalSearchOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={() => setIsGlobalSearchOpen(false)}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search patients by name, UHID, phone, bed, or doctor..."
            className="flex-1 bg-transparent text-sm sm:text-base font-semibold text-slate-800 placeholder-slate-400 outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
              }}
              className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-500 bg-white border border-slate-200 rounded-md shadow-2xs">
            ESC to close
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100 p-2">
          {filtered.length > 0 ? (
            filtered.map((patient, idx) => (
              <div
                key={patient.id}
                onClick={() => {
                  if (onSelectPatient) onSelectPatient(patient);
                  setIsGlobalSearchOpen(false);
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`p-2.5 sm:p-3 rounded-xl transition-colors cursor-pointer flex items-center justify-between gap-3 group ${
                  selectedIndex === idx ? 'bg-blue-50/80 border border-blue-200/60' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {patient.name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {patient.name}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        patient.type === 'IPD' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {patient.type}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 font-medium">
                        {patient.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {patient.age}y • {patient.gender} • Bed: <span className="font-bold text-slate-700">{patient.bedNo}</span> ({patient.ward}) • {patient.doctor}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    patient.status === 'ADMITTED'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : patient.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {patient.status}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs font-semibold">
              No patients found matching "{query}".
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="p-2.5 px-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">Ctrl + K</kbd> Search</span>
            <span><kbd className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">Alt + N</kbd> Add Patient</span>
          </div>
          <button
            onClick={() => setIsGlobalSearchOpen(false)}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
