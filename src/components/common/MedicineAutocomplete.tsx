// ==============================================================
// CHAUDHARY HOSPITAL MANAGEMENT SYSTEM - MEDICINE AUTOCOMPLETE
// Smart typeahead search for hospital formulary with salt composition,
// dosage form tags, and automated clinical frequency/timing filling
// ==============================================================

import React, { useState, useEffect, useRef } from 'react';
import { Pill, Syringe, Beaker, Droplet, Wind, Sparkles, X, ChevronRight } from 'lucide-react';
import {
  searchMedicinesFormulary,
  MedicineFormularyItem,
  MedicineFormType
} from '../../data/medicinesDictionary';

interface MedicineAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectMedicine?: (medicine: MedicineFormularyItem) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
  id?: string;
}

export const MedicineAutocomplete: React.FC<MedicineAutocompleteProps> = ({
  value,
  onChange,
  onSelectMedicine,
  placeholder = 'e.g. Tab. Pan-D / Augmentin / Paracetamol...',
  required = false,
  className = '',
  inputClassName = '',
  autoFocus = false,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<MedicineFormularyItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search when typing
  useEffect(() => {
    if (value && value.trim().length >= 1) {
      const results = searchMedicinesFormulary(value, 8);
      setSuggestions(results);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: MedicineFormularyItem) => {
    onChange(item.name);
    if (onSelectMedicine) {
      onSelectMedicine(item);
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

  const getFormIcon = (type: MedicineFormType) => {
    switch (type) {
      case 'Injection':
        return <Syringe className="w-3.5 h-3.5 text-rose-600" />;
      case 'Syrup':
        return <Beaker className="w-3.5 h-3.5 text-amber-600" />;
      case 'IV Fluid':
      case 'Drops':
        return <Droplet className="w-3.5 h-3.5 text-sky-600" />;
      case 'Inhaler':
      case 'Respule':
        return <Wind className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Pill className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  const getFormBadge = (type: MedicineFormType) => {
    switch (type) {
      case 'Injection':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Syrup':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'IV Fluid':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Drops':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Inhaler':
      case 'Respule':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Capsule':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (value && value.trim().length >= 1) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          className={
            inputClassName ||
            'w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500 font-semibold text-slate-800 transition-colors'
          }
        />
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            title="Clear medicine"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150 min-w-[300px]">
          <div className="px-3.5 py-2 bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border-b border-emerald-100/60 flex items-center justify-between text-xs text-slate-700 font-bold">
            <span className="flex items-center gap-1.5 text-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              Chaudhary Hospital Formulary Suggestions ({suggestions.length})
            </span>
            <span className="text-slate-400 font-normal hidden sm:inline">Use ↑↓ keys & Enter</span>
          </div>

          {suggestions.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full text-left px-3.5 py-2.5 transition-all flex items-start justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50/80 text-emerald-950 font-semibold'
                    : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className="mt-0.5 p-1.5 rounded-md bg-slate-100 flex-shrink-0">
                    {getFormIcon(item.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-900">
                        {item.name}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded border ${getFormBadge(
                          item.type
                        )}`}
                      >
                        {item.type}
                      </span>
                    </div>

                    {/* Generic Salt / Composition */}
                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                      <span className="text-slate-400">Salt:</span> {item.composition}
                    </p>

                    {/* Quick dosage suggestion badge */}
                    <div className="flex items-center gap-2 mt-1 text-xs text-emerald-700">
                      <span className="bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200/60">
                        {item.defaultFrequency}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 font-medium">{item.defaultFoodRelation}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 flex items-center gap-1 mt-1">
                  <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 hidden md:inline">
                    {item.category.split('&')[0]}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
