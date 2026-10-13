import React from 'react';
import { ArrowLeftRight, X } from 'lucide-react';
import { ChaudharyPatientRow } from '../ChaudharyPatientsView';

export interface BedTransferModalProps {
  patient: ChaudharyPatientRow | null;
  onClose: () => void;
  availableBeds: string[];
  newBed: string;
  setNewBed: (bed: string) => void;
  dailyCharge: string;
  setDailyCharge: (charge: string) => void;
  onConfirm: () => void;
}

export const BedTransferModal: React.FC<BedTransferModalProps> = ({
  patient,
  onClose,
  availableBeds,
  newBed,
  setNewBed,
  dailyCharge,
  setDailyCharge,
  onConfirm,
}) => {
  if (!patient) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60 animate-scaleUp">
        {/* Header: Charcoal Bar with ArrowLeftRight & Close */}
        <div className="bg-[#2D3748] px-5 sm:px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <ArrowLeftRight className="w-4 h-4 text-white stroke-[2.5]" />
            <h3 className="font-bold text-white text-base tracking-tight">
              Transfer Bed
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Patient Info */}
          <div className="space-y-1.5 text-xs sm:text-sm">
            <p className="text-slate-700 font-semibold">
              <span className="font-bold text-slate-900">Patient:</span>{' '}
              <span className="text-slate-600 font-medium">{patient.name}</span>
            </p>
            <p className="text-slate-700 font-semibold">
              <span className="font-bold text-slate-900">Current Bed:</span>{' '}
              <span className="text-slate-600 font-medium">{patient.bedNo}</span>
            </p>
          </div>

          {/* Field 1: Select New Bed */}
          <div className="relative rounded-2xl border-2 border-emerald-500 bg-white px-3.5 pt-3 pb-2.5 shadow-2xs">
            <label className="absolute -top-2.5 left-3 px-1.5 bg-white text-[11px] font-bold text-emerald-600 select-none">
              Select New Bed
            </label>
            <select
              value={newBed}
              onChange={(e) => setNewBed(e.target.value)}
              className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent cursor-pointer"
            >
              <option value="">Select New Bed</option>
              {availableBeds
                .filter((b) => b !== patient.bedNo)
                .map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
            </select>
          </div>

          {/* Field 2: New Daily Charge */}
          <div className="relative rounded-2xl border border-slate-300 bg-white px-3.5 pt-3 pb-2.5 focus-within:border-emerald-500 transition-all">
            <label className="absolute -top-2.5 left-3 px-1.5 bg-white text-[11px] font-bold text-emerald-600 select-none">
              New Daily Charge (₹)
            </label>
            <input
              type="number"
              value={dailyCharge}
              onChange={(e) => setDailyCharge(e.target.value)}
              className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
              placeholder="500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={onConfirm}
              className="px-6 py-2.5 bg-[#2D3748] hover:bg-[#1E2530] text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <ArrowLeftRight className="w-4 h-4 stroke-[2.2]" />
              <span>Confirm Transfer</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-700 hover:text-slate-900 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
