// ==============================================================
// CHAUDHARY HOSPITAL MANAGEMENT SYSTEM - OFFLINE STATUS & PWA INSTALLER
// Displays network status, pending vitals count, and PWA installation prompt
// ==============================================================

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, Download, CheckCircle2, CloudUpload } from 'lucide-react';
import { getPendingVitalsCount, syncPendingVitals } from '../../services/offlineSyncService';

export const OfflineStatusIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState<number>(getPendingVitalsCount());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessToast, setSyncSuccessToast] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-trigger sync on reconnect
      handleSyncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleQueueChange = (e: any) => {
      setPendingCount(e.detail?.pendingCount ?? getPendingVitalsCount());
    };

    const handleSynced = (e: any) => {
      const count = e.detail?.count || 1;
      setSyncSuccessToast(`✅ ${count} ऑफ़लाइन वाइटल्स बैकएंड में सफलतापूर्वक सिंक हो गए!`);
      setPendingCount(getPendingVitalsCount());
      setTimeout(() => {
        setSyncSuccessToast(null);
      }, 5000);
    };

    // Capture PWA install event
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline-vitals-changed', handleQueueChange);
    window.addEventListener('offline-vitals-synced', handleSynced);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline-vitals-changed', handleQueueChange);
      window.removeEventListener('offline-vitals-synced', handleSynced);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleSyncNow = async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await syncPendingVitals();
      setPendingCount(getPendingVitalsCount());
      if (res.synced > 0) {
        setSyncSuccessToast(`✅ ${res.synced} ऑफ़लाइन वाइटल्स बैकएंड में सिंक हो गए!`);
        setTimeout(() => setSyncSuccessToast(null), 4000);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('[PWA] User accepted Chaudhary HMS app installation');
      setDeferredPrompt(null);
    }
  };

  return (
    <>
      {/* ── 1. Top Offline Alert Banner (Visible when device Wi-Fi disconnects) ── */}
      {!isOnline && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between text-xs sm:text-sm font-medium z-50 transition-all border-b border-amber-800 animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-800/80 rounded-full animate-pulse">
              <WifiOff className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <span className="font-bold tracking-wide">ऑफ़लाइन मोड सक्रिय (Offline Mode)</span>
              <span className="hidden sm:inline text-amber-100 ml-2">
                — वाई-फ़ाई बंद है। वाइटल्स सुरक्षित लोकल मेमोरी में सहेजे जा रहे हैं।
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1 sm:mt-0">
            {pendingCount > 0 && (
              <span className="bg-amber-900/90 text-amber-200 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-inner">
                <CloudUpload className="w-3.5 h-3.5" />
                {pendingCount} वाइटल्स सिंक के लिए कतारबद्ध
              </span>
            )}
            <span className="text-[11px] text-amber-200 bg-amber-800/60 px-2 py-0.5 rounded">
              नेटवर्क आते ही स्वतः सिंक होगा
            </span>
          </div>
        </div>
      )}

      {/* ── 2. Sync Success Floating Toast ── */}
      {syncSuccessToast && (
        <div className="fixed top-4 right-4 z-[9999] bg-emerald-900/95 backdrop-blur-md text-emerald-100 text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl shadow-2xl border border-emerald-600 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{syncSuccessToast}</span>
        </div>
      )}

      {/* ── 3. Bottom Float Bar when Online with Pending Items (Manual Sync Option) ── */}
      {isOnline && pendingCount > 0 && (
        <div className="fixed bottom-6 left-6 z-[999] bg-slate-900/95 backdrop-blur-md text-white text-xs font-medium px-4 py-3 rounded-2xl shadow-2xl border border-amber-500/50 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span>{pendingCount} ऑफ़लाइन वाइटल्स बैकएंड में सिंक होने बाकी हैं</span>
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="ml-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'सिंक हो रहा है...' : 'अभी सिंक करें'}
          </button>
        </div>
      )}

      {/* ── 4. PWA 1-Click App Installation Prompt (Mobile/Tablet/Desktop) ── */}
      {deferredPrompt && !isInstalled && (
        <div className="fixed bottom-6 right-6 z-[998] bg-slate-900/95 backdrop-blur-md text-white text-xs p-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 max-w-sm animate-in slide-in-from-bottom-4">
          <div className="p-2 bg-blue-600/30 text-blue-400 rounded-xl">
            <Download className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-100">Chaudhary HMS App Install करें</p>
            <p className="text-[11px] text-slate-400">टैबलेट/मोबाइल पर 1-टैप में ऐप की तरह खोलें (ऑफलाइन सक्षम)</p>
          </div>
          <button
            onClick={handleInstallClick}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer shadow-md transition-all shrink-0"
          >
            Install
          </button>
        </div>
      )}
    </>
  );
};
