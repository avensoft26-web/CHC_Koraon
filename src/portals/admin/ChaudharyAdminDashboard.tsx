import React, { useState, useTransition, Suspense } from 'react';
import { ChaudharyAdminSidebar, AdminNavTab } from '../../components/chaudhary/admin/ChaudharyAdminSidebar';
import { ChaudharyAdminHeader } from '../../components/chaudhary/admin/ChaudharyAdminHeader';
import { ChaudharyAdminHomeView } from '../../components/chaudhary/admin/ChaudharyAdminHomeView';
import { useHospitalContext } from '../../context/HospitalContext';

// Lazy-loaded tab views for on-demand bundle splitting
const ChaudharyPatientsView = React.lazy(() =>
  import('../../components/chaudhary/ChaudharyPatientsView').then(m => ({ default: m.ChaudharyPatientsView }))
);
const ChaudharyAddPatientView = React.lazy(() =>
  import('../../components/chaudhary/ChaudharyAddPatientView').then(m => ({ default: m.ChaudharyAddPatientView }))
);
const StaffNotesView = React.lazy(() =>
  import('../../components/chaudhary/staff/StaffNotesView').then(m => ({ default: m.StaffNotesView }))
);
const ChaudharyBillingView = React.lazy(() =>
  import('../../components/chaudhary/ChaudharyBillingView').then(m => ({ default: m.ChaudharyBillingView }))
);
const ChaudharyAdminDischargeView = React.lazy(() =>
  import('../../components/chaudhary/admin/ChaudharyAdminDischargeView').then(m => ({ default: m.ChaudharyAdminDischargeView }))
);
const ChaudharyAdminUsersView = React.lazy(() =>
  import('../../components/chaudhary/admin/ChaudharyAdminUsersView').then(m => ({ default: m.ChaudharyAdminUsersView }))
);
const ChaudharyAdminReportsView = React.lazy(() =>
  import('../../components/chaudhary/admin/ChaudharyAdminReportsView').then(m => ({ default: m.ChaudharyAdminReportsView }))
);
const ChaudharyAdminRecordsView = React.lazy(() =>
  import('../../components/chaudhary/admin/ChaudharyAdminRecordsView').then(m => ({ default: m.ChaudharyAdminRecordsView }))
);
const ChaudharyAdminTrashView = React.lazy(() =>
  import('../../components/chaudhary/admin/ChaudharyAdminTrashView').then(m => ({ default: m.ChaudharyAdminTrashView }))
);
const ChaudharyAdminAuditView = React.lazy(() =>
  import('../../components/chaudhary/admin/ChaudharyAdminAuditView').then(m => ({ default: m.ChaudharyAdminAuditView }))
);
const ChaudharyAdminNotificationsView = React.lazy(() =>
  import('../../components/chaudhary/admin/ChaudharyAdminNotificationsView').then(m => ({ default: m.ChaudharyAdminNotificationsView }))
);
const ChaudharyAdminSettingsView = React.lazy(() =>
  import('../../components/chaudhary/admin/ChaudharyAdminSettingsView').then(m => ({ default: m.ChaudharyAdminSettingsView }))
);

function TabLoadingFallback() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[350px]">
      <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin mb-3" />
      <p className="text-xs font-semibold text-slate-500 tracking-wide">Loading module...</p>
    </div>
  );
}

interface ChaudharyAdminDashboardProps {
  onLogout?: () => void;
  userId?: string;
}

export const ChaudharyAdminDashboard: React.FC<ChaudharyAdminDashboardProps> = ({
  userId,
  onLogout,
}) => {
  const hospitalCtx = useHospitalContext();
  const [activeTab, setActiveTab] = useState<AdminNavTab>('Home');
  const [renderedTab, setRenderedTab] = useState<AdminNavTab>('Home');
  const [, startTransition] = useTransition();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleTabChange = (tab: AdminNavTab) => {
    setActiveTab(tab);
    startTransition(() => {
      setRenderedTab(tab);
    });
  };

  return (
    <div className="flex h-screen w-screen bg-[#F8FAFC] font-sans text-slate-800 relative overflow-hidden select-none">
      {/* 1. Left Admin Sidebar (Matching exact requested navigation items) */}
      <ChaudharyAdminSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onLogout={onLogout}
        isCollapsed={isSidebarCollapsed}
        userId={userId}
      />

      {/* 2. Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <ChaudharyAdminHeader
          activeTab={activeTab}
          onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
          onLogout={onLogout}
        />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-3.5 flex flex-col pb-6">
          <Suspense fallback={<TabLoadingFallback />}>
            {renderedTab === 'Home' ? (
              <ChaudharyAdminHomeView onNavigate={handleTabChange} />
            ) : renderedTab === 'Patients' ? (
              <ChaudharyPatientsView onNewAdmission={() => handleTabChange('Add Patient')} />
            ) : renderedTab === 'Add Patient' ? (
              <ChaudharyAddPatientView
                onAddPatient={async (newPatient) => {
                  await hospitalCtx.addPatient(newPatient);
                  handleTabChange('Patients');
                }}
                onBack={() => handleTabChange('Patients')}
              />
            ) : renderedTab === 'Daily Notes' ? (
              <StaffNotesView onBack={() => handleTabChange('Home')} />
            ) : renderedTab === 'Billing' ? (
              <ChaudharyBillingView />
            ) : renderedTab === 'Discharge' ? (
              <ChaudharyAdminDischargeView onBack={() => handleTabChange('Patients')} />
            ) : renderedTab === 'Users' ? (
              <ChaudharyAdminUsersView />
            ) : renderedTab === 'Reports' ? (
              <ChaudharyAdminReportsView />
            ) : renderedTab === 'Patient Records' ? (
              <ChaudharyAdminRecordsView />
            ) : renderedTab === 'Patient Trash' ? (
              <ChaudharyAdminTrashView />
            ) : renderedTab === 'Audit Trail' ? (
              <ChaudharyAdminAuditView />
            ) : renderedTab === 'Notifications' ? (
              <ChaudharyAdminNotificationsView />
            ) : renderedTab === 'Settings' ? (
              <ChaudharyAdminSettingsView />
            ) : (
              <ChaudharyAdminHomeView onNavigate={handleTabChange} />
            )}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default ChaudharyAdminDashboard;
