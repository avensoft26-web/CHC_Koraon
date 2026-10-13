import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Bed,
  CreditCard,
  Save,
  RotateCcw,
  CheckCircle2,
  Info,
  Plus,
  Trash2,
  Users,
  Palette,
  Eye,
  Phone,
  Mail,
  MapPin,
  Globe,
  Activity,
  DoorClosed,
  UserCheck,
  Sliders,
  Receipt,
  ShieldCheck,
  ChevronRight,
  Stethoscope,
  Sparkles,
  Layers,
  Hash
} from 'lucide-react';
import { api } from '../../../services/api';
import { subscribeToHmsEvent } from '../../../services/realtime';

interface DoctorItem {
  id: string;
  name: string;
  department: string;
  fees: number;
}

export const ChaudharyAdminSettingsView: React.FC = () => {
  // Active Tab: 'general' | 'beds' | 'billing'
  const [activeTab, setActiveTab] = useState<'general' | 'beds' | 'billing'>('general');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 1. General - Hospital Information State
  const [hospitalInfo, setHospitalInfo] = useState({
    name: 'Chaudhary Health Care Center',
    address: 'Koraon Prayagraj',
    contact: '7992054663',
    email: 'dk21230621@gmail.com',
    website: 'www.cityhospital.com',
    registrationNumber: 'HOSP/2024/001'
  });

  // 2. General - Doctor Management State (loaded live from MongoDB)
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newDoctorDept, setNewDoctorDept] = useState('');
  const [newDoctorFee, setNewDoctorFee] = useState('');

  // 3. General - Appearance & Themes State
  const [appearance, setAppearance] = useState({
    themeMode: 'Dark Mode',
    colorPalette: 'Forest Green',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12 Hour (AM/PM)',
    language: 'English (Professional)'
  });

  // 4. Bed Management State
  const [maleWardBeds, setMaleWardBeds] = useState(14);
  const [femaleWardBeds, setFemaleWardBeds] = useState(20);
  const [icuWardBeds, setIcuWardBeds] = useState(7);
  const [privateRoomBeds, setPrivateRoomBeds] = useState(5);

  // 5. Billing - Rates & Tariffs State
  const [billingRates, setBillingRates] = useState({
    currencySymbol: '₹',
    taxRate: 18,
    consultationFee: 0,
    doctorFees: 200,
    generalWardCharge: 500,
    icuCharge: 5000,
    emergencyCharge: 1000
  });

  // 6. Billing - Invoice Configurations State
  const [invoiceConfig, setInvoiceConfig] = useState({
    invoicePrefix: 'CHC-INV',
    nextInvoiceId: 1001,
    autoCompileSummary: false
  });

  const totalBedsCount = maleWardBeds + femaleWardBeds + icuWardBeds + privateRoomBeds;
  const hasLoadedInitialSettings = useRef(false);

  // Fetch saved settings from MongoDB
  const loadFromDb = () => {
    api.settings.get().then((res) => {
      if (res?.success && res.settings) {
        const s = res.settings;
        if (s.hospitalInfo) setHospitalInfo(s.hospitalInfo);
        if (s.appearance) setAppearance(s.appearance);
        if (s.billingRates) setBillingRates(s.billingRates);
        if (s.invoiceConfig) setInvoiceConfig(s.invoiceConfig);
        if (s.beds) {
          if (s.beds.maleWardBeds !== undefined) setMaleWardBeds(Number(s.beds.maleWardBeds));
          if (s.beds.femaleWardBeds !== undefined) setFemaleWardBeds(Number(s.beds.femaleWardBeds));
          if (s.beds.icuWardBeds !== undefined) setIcuWardBeds(Number(s.beds.icuWardBeds));
          if (s.beds.privateRoomBeds !== undefined) setPrivateRoomBeds(Number(s.beds.privateRoomBeds));
        } else if (s['hospital-beds']) {
          const arr = String(s['hospital-beds']).split(',').map((x: string) => x.trim()).filter(Boolean);
          const m = arr.filter((x: string) => x.toUpperCase().startsWith('MALE')).length;
          const f = arr.filter((x: string) => x.toUpperCase().startsWith('FEMALE')).length;
          const i = arr.filter((x: string) => x.toUpperCase().startsWith('ICU')).length;
          const p = arr.filter((x: string) => x.toUpperCase().startsWith('PVT') || x.toUpperCase().startsWith('PRIVATE')).length;
          if (m) setMaleWardBeds(m);
          if (f) setFemaleWardBeds(f);
          if (i) setIcuWardBeds(i);
          if (p) setPrivateRoomBeds(p);
        }
      }
      setTimeout(() => {
        hasLoadedInitialSettings.current = true;
      }, 300);
    }).catch(() => {
      hasLoadedInitialSettings.current = true;
    });

    api.doctors.getAll().then((res) => {
      if (res?.success && Array.isArray(res.doctors)) {
        setDoctors(res.doctors.map((d: any, idx: number) => ({
          id: d._id || d.id || `${idx + 1}`,
          name: d.name,
          department: d.specialty || d.department || 'General Medicine',
          // Blank when no fee is recorded — never invent a consultation fee
          fees: d.fee || d.fees || 0,
        })));
      }
    }).catch(() => { });
  };

  useEffect(() => {
    loadFromDb();

    // Cross-session real-time synchronization via Socket.IO
    const unsubscribe = subscribeToHmsEvent('settings:updated', () => {
      loadFromDb();
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Automatic real-time persistence & broadcast on bed count adjustments
  useEffect(() => {
    if (!hasLoadedInitialSettings.current) return;
    const timer = setTimeout(async () => {
      try {
        await api.settings.update({
          beds: { maleWardBeds, femaleWardBeds, icuWardBeds, privateRoomBeds }
        });
        window.dispatchEvent(new Event('chaudhary_beds_updated'));
      } catch (err) {
        console.error('Real-time bed update sync error:', err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [maleWardBeds, femaleWardBeds, icuWardBeds, privateRoomBeds]);

  // Handlers
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.settings.update({
        hospitalInfo,
        appearance,
        billingRates,
        invoiceConfig,
        beds: { maleWardBeds, femaleWardBeds, icuWardBeds, privateRoomBeds }
      });

      // Synchronize doctor fees to MongoDB User records
      if (Array.isArray(doctors) && doctors.length > 0) {
        for (const doc of doctors) {
          if (doc.id && /^[a-f\d]{24}$/i.test(doc.id)) {
            api.doctors.update(doc.id, { fee: doc.fees }).catch(() => { });
          }
        }
      }

      window.dispatchEvent(new Event('chaudhary_beds_updated'));

      if (res?.success) {
        setToastMessage('Hospital settings & live beds successfully saved and synchronized to MongoDB!');
      } else {
        setToastMessage('Hospital settings saved!');
      }
    } catch (err: any) {
      setToastMessage(err?.message || 'Settings saved locally!');
    } finally {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    }
  };

  // Reset = discard local unsaved edits and reload the settings stored in MongoDB
  const handleReset = () => {
    loadFromDb();
    setToastMessage('Settings reloaded from database!');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctorName.trim()) return;
    const newDoc: DoctorItem = {
      id: Date.now().toString(),
      name: newDoctorName.trim(),
      department: newDoctorDept.trim() || 'General',
      fees: Number(newDoctorFee) || 0
    };
    setDoctors([...doctors, newDoc]);
    setNewDoctorName('');
    setNewDoctorDept('');
    setNewDoctorFee('');
  };

  const handleDeleteDoctor = (id: string) => {
    setDoctors(doctors.filter((d) => d.id !== id));
  };

  return (
    <div className="min-h-full flex flex-col gap-5 max-w-7xl mx-auto pb-8">
      {/* 1. Header Card with Title, Actions & Live Breadcrumb */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Hospital Settings
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                Admin Master
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage hospital identity, medical staff tariff, gender-based ward beds & billing structures.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {savedSuccess && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{toastMessage}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:border-slate-300 active:scale-95"
            title="Reset to default settings"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Settings</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* 2. Top Navigation Bar: High-Clarity Elevated 3 Tabs */}
      <div className="bg-slate-100/90 p-2 sm:p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Tab 1: General */}
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl transition-all cursor-pointer ${activeTab === 'general'
            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/30'
            : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${activeTab === 'general' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
            }`}>
            <Sliders className="w-4 h-4" />
          </div>
          <span className="text-sm font-black tracking-tight">General</span>
          <span className={`text-[11px] px-2.5 py-0.5 rounded-lg font-bold transition-colors ${activeTab === 'general'
            ? 'bg-emerald-700/80 text-white'
            : 'bg-slate-100 text-slate-700 border border-slate-200/80'
            }`}>
            Profile & Themes
          </span>
        </button>

        {/* Tab 2: Bed Management */}
        <button
          type="button"
          onClick={() => setActiveTab('beds')}
          className={`flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl transition-all cursor-pointer ${activeTab === 'beds'
            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/30'
            : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${activeTab === 'beds' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'
            }`}>
            <Bed className="w-4 h-4" />
          </div>
          <span className="text-sm font-black tracking-tight">Bed Management</span>
          <span className={`text-[11px] px-2.5 py-0.5 rounded-lg font-black transition-colors ${activeTab === 'beds'
            ? 'bg-emerald-700/80 text-white'
            : 'bg-purple-50 text-purple-700 border border-purple-200'
            }`}>
            {totalBedsCount} Beds
          </span>
        </button>

        {/* Tab 3: Billing */}
        <button
          type="button"
          onClick={() => setActiveTab('billing')}
          className={`flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl transition-all cursor-pointer ${activeTab === 'billing'
            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/30'
            : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${activeTab === 'billing' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'
            }`}>
            <CreditCard className="w-4 h-4" />
          </div>
          <span className="text-sm font-black tracking-tight">Billing</span>
          <span className={`text-[11px] px-2.5 py-0.5 rounded-lg font-bold transition-colors ${activeTab === 'billing'
            ? 'bg-emerald-700/80 text-white'
            : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
            Rates & Invoices
          </span>
        </button>
      </div>

      {/* 3. Tab Contents with Perfectly Balanced Layouts */}

      {/* ===================== TAB 1: GENERAL ===================== */}
      {activeTab === 'general' && (
        <div className="space-y-5">
          {/* Top Row: Balanced 2-Column Grid (Hospital Information + Appearance & Themes) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left Card (7 cols): HOSPITAL INFORMATION */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        HOSPITAL INFORMATION
                      </h2>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Primary registration and public contact credentials
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase">
                    VERIFIED CAMPUS
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Hospital Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      Hospital Name
                    </label>
                    <input
                      type="text"
                      value={hospitalInfo.name}
                      onChange={(e) => setHospitalInfo({ ...hospitalInfo, name: e.target.value })}
                      placeholder="Chaudhary Health Care Center"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>

                  {/* Hospital Address */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      Hospital Address
                    </label>
                    <input
                      type="text"
                      value={hospitalInfo.address}
                      onChange={(e) => setHospitalInfo({ ...hospitalInfo, address: e.target.value })}
                      placeholder="Koraon Prayagraj"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>

                  {/* Contact Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      Contact Number
                    </label>
                    <input
                      type="text"
                      value={hospitalInfo.contact}
                      onChange={(e) => setHospitalInfo({ ...hospitalInfo, contact: e.target.value })}
                      placeholder="7992054663"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-mono"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-emerald-600" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={hospitalInfo.email}
                      onChange={(e) => setHospitalInfo({ ...hospitalInfo, email: e.target.value })}
                      placeholder="dk21230621@gmail.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>

                  {/* Website */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-600" />
                      Website
                    </label>
                    <input
                      type="text"
                      value={hospitalInfo.website}
                      onChange={(e) => setHospitalInfo({ ...hospitalInfo, website: e.target.value })}
                      placeholder="www.cityhospital.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-mono"
                    />
                  </div>

                  {/* Registration Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Registration Number
                    </label>
                    <input
                      type="text"
                      value={hospitalInfo.registrationNumber}
                      onChange={(e) => setHospitalInfo({ ...hospitalInfo, registrationNumber: e.target.value })}
                      placeholder="HOSP/2024/001"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Status Note inside Left Card */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Facility ID: <span className="font-mono font-bold text-slate-600">UP-PRAYAGRAJ-7992</span></span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> License Active
                </span>
              </div>
            </div>

            {/* Right Card (5 cols): APPEARANCE & THEMES + BED QUICK LINK */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        APPEARANCE & THEMES
                      </h2>
                      <p className="text-[11px] text-slate-400 font-medium">
                        System visual aesthetics & formats
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-extrabold uppercase">
                    DISPLAY
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  {/* Theme Mode */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Theme Mode</label>
                    <select
                      value={appearance.themeMode}
                      onChange={(e) => setAppearance({ ...appearance, themeMode: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:bg-white focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="Dark Mode">Dark Mode</option>
                      <option value="Light Mode">Light Mode</option>
                      <option value="System Default">System Default</option>
                    </select>
                  </div>

                  {/* Theme Color Palette */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Theme Color Palette</label>
                    <select
                      value={appearance.colorPalette}
                      onChange={(e) => setAppearance({ ...appearance, colorPalette: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:bg-white focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="Forest Green">Forest Green</option>
                      <option value="Emerald Healthcare">Emerald Healthcare</option>
                      <option value="Teal Precision">Teal Precision</option>
                      <option value="Ocean Blue">Ocean Blue</option>
                    </select>
                  </div>

                  {/* Date Format */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Date Format</label>
                    <select
                      value={appearance.dateFormat}
                      onChange={(e) => setAppearance({ ...appearance, dateFormat: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:bg-white focus:border-emerald-500 cursor-pointer font-mono"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  {/* Time Format */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Time Format</label>
                    <select
                      value={appearance.timeFormat}
                      onChange={(e) => setAppearance({ ...appearance, timeFormat: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:bg-white focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="12 Hour (AM/PM)">12 Hour (AM/PM)</option>
                      <option value="24 Hour">24 Hour</option>
                    </select>
                  </div>

                  {/* Language */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-700">Language</label>
                    <select
                      value={appearance.language}
                      onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:bg-white focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="English (Professional)">English (Professional)</option>
                      <option value="Hindi (हिंदी)">Hindi (हिंदी)</option>
                      <option value="Bilingual (En + Hi)">Bilingual (En + Hi)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bed Configuration Banner Embedded at Bottom of Right Card */}
              <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Bed className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">Bed Configuration</h4>
                    <p className="text-[11px] text-emerald-800">Customize 46 ward beds & live layout</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('beds')}
                  className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs whitespace-nowrap"
                >
                  <span>Go to Beds</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Section: DOCTOR MANAGEMENT (Symmetrical 2-Column: Add Form + Directory Table) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                    Doctor Management
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                      {doctors.length} Doctors Registered
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Configure attending physicians, specialty departments & consultation fee tariffs
                  </p>
                </div>
              </div>
            </div>

            {/* 2-Column: Left (Add Form) & Right (Doctor Table) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column (5 cols): Add New Doctor Form */}
              <div className="lg:col-span-5 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-3.5">
                <div className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Register New Doctor</span>
                </div>

                <form onSubmit={handleAddDoctor} className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Doctor Name</label>
                    <input
                      type="text"
                      value={newDoctorName}
                      onChange={(e) => setNewDoctorName(e.target.value)}
                      placeholder="e.g. Dr. John Doe"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Department</label>
                    <input
                      type="text"
                      value={newDoctorDept}
                      onChange={(e) => setNewDoctorDept(e.target.value)}
                      placeholder="e.g. Cardiology, Ortho, Eye..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Consultation Fee (₹)</label>
                    <input
                      type="number"
                      value={newDoctorFee}
                      onChange={(e) => setNewDoctorFee(e.target.value)}
                      placeholder="500"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-98"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Doctor to Staff</span>
                  </button>
                </form>
              </div>

              {/* Right Column (7 cols): Doctors Directory Table */}
              <div className="lg:col-span-7 border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Doctor Name</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Fees</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {doctors.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-[10px] border border-emerald-100">
                            Dr
                          </div>
                          <div>
                            <div>{doc.name}</div>
                            <span className="text-[10px] text-slate-400 font-normal">Active Staff</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px]">
                            {doc.department}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800 text-sm">
                          {doc.fees ? `₹${doc.fees}` : '—'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteDoctor(doc.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Doctor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: BED MANAGEMENT ===================== */}
      {activeTab === 'beds' && (
        <div className="space-y-5">
          {/* Header & Guidance Notice */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Title Card (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Bed className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 tracking-tight">
                    Bed Management
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Configure ward - wise bed allocation for your hospital
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-black">
                  {totalBedsCount} Beds
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Syncing...' : 'Save Beds'}</span>
                </button>
              </div>
            </div>

            {/* Gender Alert Banner (7 cols) */}
            <div className="lg:col-span-7 bg-amber-50/90 border border-amber-200 rounded-3xl p-4.5 flex items-start gap-3 text-xs text-amber-950 shadow-xs">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="leading-relaxed">
                <span className="font-bold text-amber-900">Gender-Based Filtering: </span>
                Male gender select karne par sirf <span className="font-bold text-blue-700">Male Ward</span> beds dikhenge, Female select karne par sirf <span className="font-bold text-pink-700">Female Ward</span> beds dikhenge. <span className="font-bold text-slate-900">ICU</span> aur <span className="font-bold text-amber-700">Private Room</span> dono genders ke liye common hain.
              </div>
            </div>
          </div>

          {/* 4 Ward Cards in a Balanced 4-Column Row (or 2x2 on tablet) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Male Ward */}
            <div className="bg-white rounded-3xl p-5 border-t-4 border-t-blue-500 border border-slate-200/90 shadow-xs flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                      ♂
                    </div>
                    <h3 className="font-black text-slate-900 text-sm">Male Ward</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                    Male Only
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">General Ward — Male Only</p>
              </div>

              <div className="text-center py-2">
                <div className="inline-flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setMaleWardBeds(Math.max(1, maleWardBeds - 1))}
                    className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-black text-base border border-slate-200 shadow-2xs flex items-center justify-center transition-all cursor-pointer active:scale-95"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={maleWardBeds}
                    onChange={(e) => setMaleWardBeds(Math.max(1, parseInt(e.target.value) || 1))}
                    className="text-2xl font-black text-slate-900 w-14 text-center font-mono bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-blue-400 rounded-lg py-0.5"
                  />
                  <button
                    type="button"
                    onClick={() => setMaleWardBeds(maleWardBeds + 1)}
                    className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-black text-base border border-slate-200 shadow-2xs flex items-center justify-center transition-all cursor-pointer active:scale-95"
                  >
                    +
                  </button>
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mt-2 tracking-wider">
                  TOTAL BEDS
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-mono text-center pt-2 border-t border-slate-100">
                Prefix: Male-G1, Male-G2...
              </div>
            </div>

            {/* 2. Female Ward */}
            <div className="bg-white rounded-3xl p-5 border-t-4 border-t-pink-500 border border-slate-200/90 shadow-xs flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center font-bold text-xs">
                      ♀
                    </div>
                    <h3 className="font-black text-slate-900 text-sm">Female Ward</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 text-[10px] font-bold">
                    Female Only
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">General Ward — Female Only</p>
              </div>

              <div className="text-center py-2">
                <div className="inline-flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setFemaleWardBeds(Math.max(1, femaleWardBeds - 1))}
                    className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-black text-base border border-slate-200 shadow-2xs flex items-center justify-center transition-all cursor-pointer active:scale-95"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={femaleWardBeds}
                    onChange={(e) => setFemaleWardBeds(Math.max(1, parseInt(e.target.value) || 1))}
                    className="text-2xl font-black text-slate-900 w-14 text-center font-mono bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-pink-400 rounded-lg py-0.5"
                  />
                  <button
                    type="button"
                    onClick={() => setFemaleWardBeds(femaleWardBeds + 1)}
                    className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-black text-base border border-slate-200 shadow-2xs flex items-center justify-center transition-all cursor-pointer active:scale-95"
                  >
                    +
                  </button>
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mt-2 tracking-wider">
                  TOTAL BEDS
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-mono text-center pt-2 border-t border-slate-100">
                Prefix: Female-G1, Female-G2...
              </div>
            </div>

            {/* 3. ICU Ward */}
            <div className="bg-white rounded-3xl p-5 border-t-4 border-t-red-500 border border-slate-200/90 shadow-xs flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">
                      <Activity className="w-4 h-4" />
                    </div>
                    <h3 className="font-black text-slate-900 text-sm">ICU Ward</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-bold">
                    Critical Care
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Intensive Care — Common (All Genders)</p>
              </div>

              <div className="text-center py-2">
                <div className="inline-flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIcuWardBeds(Math.max(1, icuWardBeds - 1))}
                    className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-black text-base border border-slate-200 shadow-2xs flex items-center justify-center transition-all cursor-pointer active:scale-95"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={icuWardBeds}
                    onChange={(e) => setIcuWardBeds(Math.max(1, parseInt(e.target.value) || 1))}
                    className="text-2xl font-black text-slate-900 w-14 text-center font-mono bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-red-400 rounded-lg py-0.5"
                  />
                  <button
                    type="button"
                    onClick={() => setIcuWardBeds(icuWardBeds + 1)}
                    className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-black text-base border border-slate-200 shadow-2xs flex items-center justify-center transition-all cursor-pointer active:scale-95"
                  >
                    +
                  </button>
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mt-2 tracking-wider">
                  TOTAL BEDS
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-mono text-center pt-2 border-t border-slate-100">
                Prefix: ICU-1, ICU-2...
              </div>
            </div>

            {/* 4. Private Room */}
            <div className="bg-white rounded-3xl p-5 border-t-4 border-t-amber-500 border border-slate-200/90 shadow-xs flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                      <DoorClosed className="w-4 h-4" />
                    </div>
                    <h3 className="font-black text-slate-900 text-sm">Private Room</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                    Private Suite
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Private Rooms — Common (All Genders)</p>
              </div>

              <div className="text-center py-2">
                <div className="inline-flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setPrivateRoomBeds(Math.max(1, privateRoomBeds - 1))}
                    className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-black text-base border border-slate-200 shadow-2xs flex items-center justify-center transition-all cursor-pointer active:scale-95"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={privateRoomBeds}
                    onChange={(e) => setPrivateRoomBeds(Math.max(1, parseInt(e.target.value) || 1))}
                    className="text-2xl font-black text-slate-900 w-14 text-center font-mono bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-amber-400 rounded-lg py-0.5"
                  />
                  <button
                    type="button"
                    onClick={() => setPrivateRoomBeds(privateRoomBeds + 1)}
                    className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-black text-base border border-slate-200 shadow-2xs flex items-center justify-center transition-all cursor-pointer active:scale-95"
                  >
                    +
                  </button>
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mt-2 tracking-wider">
                  TOTAL BEDS
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-mono text-center pt-2 border-t border-slate-100">
                Prefix: Private-1, Private-2...
              </div>
            </div>
          </div>

          {/* Live Bed Preview Container with Grid Distribution */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 tracking-tight">
                    Live Bed Preview
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Real-time visualization of bed IDs allocated across active hospital wards
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-xs">
                  <Bed className="w-4 h-4" />
                  <span>Total: {totalBedsCount} Beds</span>
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Syncing...' : 'Save & Sync Beds'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Male Ward Pills */}
              <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-blue-800">
                  <span>♂ Male Ward ({maleWardBeds} beds)</span>
                  <span className="text-[11px] text-blue-600 font-normal">Male Only Admission</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: maleWardBeds }).map((_, i) => (
                    <span
                      key={`male-${i}`}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold font-mono shadow-2xs hover:bg-blue-100 transition-colors"
                    >
                      Male-G{i + 1}
                    </span>
                  ))}
                </div>
              </div>

              {/* Female Ward Pills */}
              <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-pink-800">
                  <span>♀ Female Ward ({femaleWardBeds} beds)</span>
                  <span className="text-[11px] text-pink-600 font-normal">Female Only Admission</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: femaleWardBeds }).map((_, i) => (
                    <span
                      key={`female-${i}`}
                      className="px-2.5 py-1 rounded-lg bg-pink-50 text-pink-700 border border-pink-200 text-[11px] font-semibold font-mono shadow-2xs hover:bg-pink-100 transition-colors"
                    >
                      Female-G{i + 1}
                    </span>
                  ))}
                </div>
              </div>

              {/* Symmetrical 2-Column for ICU & Private Rooms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ICU Ward Pills */}
                <div className="p-4 rounded-2xl bg-red-50/40 border border-red-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-red-800">
                    <span>⚡ ICU Ward ({icuWardBeds} beds)</span>
                    <span className="text-[11px] text-red-600 font-normal">Common (All Genders)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: icuWardBeds }).map((_, i) => (
                      <span
                        key={`icu-${i}`}
                        className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 text-[11px] font-semibold font-mono shadow-2xs hover:bg-red-100 transition-colors"
                      >
                        ICU-{i + 1}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Private Room Pills */}
                <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                    <span>🚪 Private Room ({privateRoomBeds} beds)</span>
                    <span className="text-[11px] text-amber-600 font-normal">Common (All Genders)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: privateRoomBeds }).map((_, i) => (
                      <span
                        key={`private-${i}`}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold font-mono shadow-2xs hover:bg-amber-100 transition-colors"
                      >
                        Private-{i + 1}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: BILLING ===================== */}
      {activeTab === 'billing' && (
        <div className="space-y-5">
          {/* Top Row: Balanced Symmetrical 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left Card (6 cols): RATES & CONSULTATION CHARGES */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        RATES & CONSULTATION CHARGES
                      </h2>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Standard tariffs for admissions, consults & emergency
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase">
                    CURRENCY: {billingRates.currencySymbol}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  {/* Currency Symbol */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Currency Symbol</label>
                    <input
                      type="text"
                      value={billingRates.currencySymbol}
                      onChange={(e) => setBillingRates({ ...billingRates, currencySymbol: e.target.value })}
                      placeholder="₹"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 font-mono"
                    />
                  </div>

                  {/* Tax Rate (%) */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Tax Rate (%)</label>
                    <input
                      type="number"
                      value={billingRates.taxRate}
                      onChange={(e) => setBillingRates({ ...billingRates, taxRate: Number(e.target.value) })}
                      placeholder="18"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 font-mono"
                    />
                  </div>

                  {/* Consultation Fee (₹) */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Consultation Fee ({billingRates.currencySymbol})</label>
                    <input
                      type="number"
                      value={billingRates.consultationFee}
                      onChange={(e) => setBillingRates({ ...billingRates, consultationFee: Number(e.target.value) })}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 font-mono"
                    />
                  </div>

                  {/* Doctor Fees (₹) */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Doctor Fees ({billingRates.currencySymbol})</label>
                    <input
                      type="number"
                      value={billingRates.doctorFees}
                      onChange={(e) => setBillingRates({ ...billingRates, doctorFees: Number(e.target.value) })}
                      placeholder="200"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 font-mono"
                    />
                  </div>

                  {/* General Ward Charge/Day (₹) */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">General Ward Charge/Day ({billingRates.currencySymbol})</label>
                    <input
                      type="number"
                      value={billingRates.generalWardCharge}
                      onChange={(e) => setBillingRates({ ...billingRates, generalWardCharge: Number(e.target.value) })}
                      placeholder="500"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 font-mono"
                    />
                  </div>

                  {/* ICU Charge/Day (₹) */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">ICU Charge/Day ({billingRates.currencySymbol})</label>
                    <input
                      type="number"
                      value={billingRates.icuCharge}
                      onChange={(e) => setBillingRates({ ...billingRates, icuCharge: Number(e.target.value) })}
                      placeholder="5000"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 font-mono"
                    />
                  </div>

                  {/* Emergency Charge (₹) */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-700">Emergency Charge ({billingRates.currencySymbol})</label>
                    <input
                      type="number"
                      value={billingRates.emergencyCharge}
                      onChange={(e) => setBillingRates({ ...billingRates, emergencyCharge: Number(e.target.value) })}
                      placeholder="1000"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                Tariffs apply across outpatient receipts & daily inpatient charge sheets.
              </div>
            </div>

            {/* Right Card (6 cols): INVOICE CONFIGURATIONS & AUTOMATION */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        INVOICE CONFIGURATIONS
                      </h2>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Serial sequence numbering & automated discharge invoices
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase">
                    AUTO-SEQUENCE
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  {/* Invoice Prefix */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Invoice Prefix</label>
                    <input
                      type="text"
                      value={invoiceConfig.invoicePrefix}
                      onChange={(e) => setInvoiceConfig({ ...invoiceConfig, invoicePrefix: e.target.value })}
                      placeholder="CHC-INV"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400">Sample: <span className="font-bold text-slate-700">{invoiceConfig.invoicePrefix}-{invoiceConfig.nextInvoiceId}</span></p>
                  </div>

                  {/* Next Invoice ID */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Next Invoice ID</label>
                    <input
                      type="number"
                      value={invoiceConfig.nextInvoiceId}
                      onChange={(e) => setInvoiceConfig({ ...invoiceConfig, nextInvoiceId: Number(e.target.value) })}
                      placeholder="1001"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400">Auto-increments upon final bill approval</p>
                  </div>
                </div>

                {/* Discharge Automatic Billing Checkbox */}
                <div className="mt-5">
                  <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={invoiceConfig.autoCompileSummary}
                      onChange={(e) => setInvoiceConfig({ ...invoiceConfig, autoCompileSummary: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 mt-1 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Automatically compile bill summary upon patient discharge
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5 leading-relaxed">
                        When checked, the billing module aggregates all bed daily tariffs, doctor visits, nursing fees, and pharmacy charges during discharge summary generation.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="mt-5 p-3 rounded-xl bg-slate-100 text-slate-500 text-[11px] flex items-center justify-between">
                <span>Next Generated Receipt:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {invoiceConfig.invoicePrefix}-{invoiceConfig.nextInvoiceId}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
