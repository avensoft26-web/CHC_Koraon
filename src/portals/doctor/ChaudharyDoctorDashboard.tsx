import React, { useState, useTransition } from 'react';
import { ChaudharyDoctorSidebar, DoctorNavTab } from '../../components/chaudhary/doctor/ChaudharyDoctorSidebar';
import { ChaudharyDoctorHeader } from '../../components/chaudhary/doctor/ChaudharyDoctorHeader';
import { ChaudharyDoctorHomeView } from '../../components/chaudhary/doctor/ChaudharyDoctorHomeView';
import { ChaudharyPatientsView } from '../../components/chaudhary/ChaudharyPatientsView';
import { ChaudharyAddPatientView } from '../../components/chaudhary/ChaudharyAddPatientView';
import { StaffNotesView } from '../../components/chaudhary/staff/StaffNotesView';
import { ChaudharyBillingView } from '../../components/chaudhary/ChaudharyBillingView';
import { ChaudharyAdminDischargeView } from '../../components/chaudhary/admin/ChaudharyAdminDischargeView';
import { ChaudharyAdminRecordsView } from '../../components/chaudhary/admin/ChaudharyAdminRecordsView';
import { ChaudharyAdminNotificationsView } from '../../components/chaudhary/admin/ChaudharyAdminNotificationsView';
import { ChaudharyDoctorSettingsView } from '../../components/chaudhary/doctor/ChaudharyDoctorSettingsView';
import { useHospitalContext } from '../../context/HospitalContext';

interface ChaudharyDoctorDashboardProps {
  onLogout?: () => void;
  userId?: string;
}

export const ChaudharyDoctorDashboard: React.FC<ChaudharyDoctorDashboardProps> = ({
  userId,
  onLogout,
}) => {
  const hospitalCtx = useHospitalContext();
  const [activeTab, setActiveTab] = useState<DoctorNavTab>('Home');
  const [renderedTab, setRenderedTab] = useState<DoctorNavTab>('Home');
  const [, startTransition] = useTransition();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleTabChange = (tab: DoctorNavTab) => {
    setActiveTab(tab);
    startTransition(() => {
      setRenderedTab(tab);
    });
  };

  return (
    <div className="flex h-screen w-screen bg-[#F8FAFC] font-sans text-slate-800 relative overflow-hidden select-none">
      {/* 1. Left Doctor Sidebar (Matching exact requested navigation items) */}
      <ChaudharyDoctorSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onLogout={onLogout}
        isCollapsed={isSidebarCollapsed}
        userId={userId}
      />

      {/* 2. Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <ChaudharyDoctorHeader
          activeTab={activeTab}
          userId={userId}
          onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
          onLogout={onLogout}
          onQuickConsult={() => handleTabChange('Home')}
        />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-3.5 flex flex-col pb-6">
          {renderedTab === 'Home' ? (
            <ChaudharyDoctorHomeView onNavigate={handleTabChange} />
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
          ) : renderedTab === 'Patient Records' ? (
            <ChaudharyAdminRecordsView />
          ) : renderedTab === 'Notifications' ? (
            <ChaudharyAdminNotificationsView />
          ) : renderedTab === 'Settings' ? (
            <ChaudharyDoctorSettingsView />
          ) : (
            <ChaudharyDoctorHomeView onNavigate={handleTabChange} />
          )}
        </main>
      </div>
    </div>
  );
};

export default ChaudharyDoctorDashboard;
