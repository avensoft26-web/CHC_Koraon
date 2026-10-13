import React, { useState, useTransition } from 'react';
import { ChaudharyDeveloperSidebar } from '../../components/chaudhary/developer/ChaudharyDeveloperSidebar';
import { ChaudharyDeveloperHeader } from '../../components/chaudhary/developer/ChaudharyDeveloperHeader';
import { AdminNavTab } from '../../components/chaudhary/admin/ChaudharyAdminSidebar';
import { ChaudharyAdminHomeView } from '../../components/chaudhary/admin/ChaudharyAdminHomeView';
import { ChaudharyDeveloperHomeView } from '../../components/chaudhary/developer/ChaudharyDeveloperHomeView';
import { ChaudharyPatientsView } from '../../components/chaudhary/ChaudharyPatientsView';
import { ChaudharyAddPatientView } from '../../components/chaudhary/ChaudharyAddPatientView';
import { StaffNotesView } from '../../components/chaudhary/staff/StaffNotesView';
import { ChaudharyBillingView } from '../../components/chaudhary/ChaudharyBillingView';
import { ChaudharyAdminDischargeView } from '../../components/chaudhary/admin/ChaudharyAdminDischargeView';
import { ChaudharyAdminUsersView } from '../../components/chaudhary/admin/ChaudharyAdminUsersView';
import { ChaudharyAdminReportsView } from '../../components/chaudhary/admin/ChaudharyAdminReportsView';
import { ChaudharyAdminRecordsView } from '../../components/chaudhary/admin/ChaudharyAdminRecordsView';
import { ChaudharyAdminNotificationsView } from '../../components/chaudhary/admin/ChaudharyAdminNotificationsView';
import { ChaudharyAdminSettingsView } from '../../components/chaudhary/admin/ChaudharyAdminSettingsView';
import { useHospitalContext } from '../../context/HospitalContext';

interface ChaudharyDeveloperDashboardProps {
  onLogout?: () => void;
  userId?: string;
}

export const ChaudharyDeveloperDashboard: React.FC<ChaudharyDeveloperDashboardProps> = ({
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
      {/* 1. Left Developer Sidebar (Contains full Admin authorities) */}
      <ChaudharyDeveloperSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onLogout={onLogout}
        isCollapsed={isSidebarCollapsed}
        userId={userId}
      />

      {/* 2. Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <ChaudharyDeveloperHeader
          activeTab={activeTab}
          onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
          onLogout={onLogout}
        />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-3.5 flex flex-col pb-6">
          {renderedTab === 'Home' ? (
            <ChaudharyDeveloperHomeView onNavigate={handleTabChange} />
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
          ) : renderedTab === 'Notifications' ? (
            <ChaudharyAdminNotificationsView />
          ) : renderedTab === 'Settings' ? (
            <ChaudharyAdminSettingsView />
          ) : (
            <ChaudharyAdminHomeView onNavigate={handleTabChange} />
          )}
        </main>
      </div>
    </div>
  );
};

export default ChaudharyDeveloperDashboard;
