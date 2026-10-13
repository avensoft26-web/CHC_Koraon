import { useState, useEffect } from 'react';
import { AuthUser } from '../features/auth/LoginPage';

export const getStoredAuthUser = (): AuthUser => {
  try {
    const raw = localStorage.getItem('chaudhary_auth_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.name || parsed.email)) {
        return parsed;
      }
    }
  } catch {
    // Ignore error
  }
  return {
    id: '',
    name: 'Hospital User',
    role: 'ADMIN',
    email: '',
    avatarUrl: '',
    department: 'Hospital Administration',
  };
};

export const useAuthUser = (): AuthUser => {
  const [user, setUser] = useState<AuthUser>(getStoredAuthUser);

  useEffect(() => {
    const updateUser = () => {
      setUser(getStoredAuthUser());
    };
    window.addEventListener('storage', updateUser);
    window.addEventListener('chaudhary_auth_updated', updateUser);
    return () => {
      window.removeEventListener('storage', updateUser);
      window.removeEventListener('chaudhary_auth_updated', updateUser);
    };
  }, []);

  return user;
};
