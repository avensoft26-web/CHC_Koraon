// ==============================================================
// CHAUDHARY HOSPITAL MANAGEMENT SYSTEM - DIAGNOSIS AUTOCOMPLETE
// Smart typeahead search for clinical diagnoses with Hindi translations
// ==============================================================

import React, { useState, useEffect, useRef } from 'react';
import { Stethoscope, Check, X, Sparkles, ChevronDown } from 'lucide-react';
import { searchDiagnoses, MedicalDiagnosisItem } from '../../data/medicalDiagnoses';

interface DiagnosisAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  onSelectDepartment?: (dept: string) => void;
}

export const DiagnosisAutocomplete: React.FC<DiagnosisAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Enter Diagnosis / Chief Complaint',
  required = false,
  className = '',
  onSelectDepartment
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<MedicalDiagnosisItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search whenever user types
  useEffect(() => {
    if (value && value.trim().length >= 1) {
      const results = searchDiagnoses(value, 7);
      setSuggestions(results);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: MedicalDiagnosisItem) => {
    onChange(item.name);
    if (onSelectDepartment && item.department) {
      onSelectDepartment(item.department);
    }
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getSeverityBadge = (sev?: string) => {
    if (sev === 'Critical') {
      return (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
          🚨 Critical
        </span>
      );
    }
    if (sev === 'Urgent') {
      return (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
          ⚠️ Urgent
        </span>
      );
    }
    return (
      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
        Routine
      </span>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <Stethoscope className="w-4 h-4 text-blue-600 absolute left-3.5 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          required={required}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (value && value.trim().length >= 1) {
              setSuggestions(searchDiagnoses(value, 7));
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-10 pr-9 py-2.5 sm:py-3 bg-white hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 rounded-xl text-sm sm:text-[15px] font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 shadow-2xs ${className}`}
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
            title="Clear"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Auto-suggest Dropdown Menu ── */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-200 max-h-80 overflow-y-auto">
          <div className="bg-slate-50/90 px-3.5 py-2 text-xs font-bold text-slate-600 flex items-center justify-between uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              सुझाव (Suggested Diagnoses)
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              ↑↓ एरो से चुनें, Enter दबाएँ
            </span>
          </div>

          {suggestions.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={item.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item);
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`p-3 sm:px-4 sm:py-3 cursor-pointer flex items-start justify-between gap-2.5 transition-colors ${
                  isSelected ? 'bg-blue-50/80' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm sm:text-[15px] font-bold text-slate-900 leading-snug">
                      {item.name}
                    </span>
                    {getSeverityBadge(item.severity)}
                  </div>
                  <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                    <span className="text-xs sm:text-[13px] font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">
                      🇮🇳 {item.hindiName}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      • {item.department}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 pt-0.5 text-blue-600">
                  {value.toLowerCase() === item.name.toLowerCase() ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-300" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
