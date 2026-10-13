import { useEffect } from 'react';
import { useHospitalContext } from '../context/HospitalContext';

export const useHospitalHotkeys = (onOpenNewPatient?: () => void) => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    isNewPatientModalOpen,
    setIsNewPatientModalOpen,
  } = useHospitalContext();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Ctrl + K or Cmd + K: Toggle Global Patient Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(!isGlobalSearchOpen);
        return;
      }

      // 2. Alt + N: Quick New Patient Admission
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (onOpenNewPatient) {
          onOpenNewPatient();
        } else {
          setIsNewPatientModalOpen(!isNewPatientModalOpen);
        }
        return;
      }

      // 3. Escape: Close any open modal or search
      if (e.key === 'Escape') {
        if (isGlobalSearchOpen) {
          setIsGlobalSearchOpen(false);
        }
        if (isNewPatientModalOpen) {
          setIsNewPatientModalOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    isNewPatientModalOpen,
    setIsNewPatientModalOpen,
    onOpenNewPatient,
  ]);
};
