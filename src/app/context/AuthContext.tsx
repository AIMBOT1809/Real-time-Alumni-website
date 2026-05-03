import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, CURRENT_USER, ALUMNI_DATA } from '../data/mock';

interface AuthContextType {
  user: UserProfile | null;
  login: (role: 'student' | 'graduate' | 'alumni' | 'faculty') => void;
  logout: () => void;
  isAuthenticated: boolean;
  role: 'student' | 'graduate' | 'alumni' | 'faculty' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Check local storage or session for existing login
    const savedRole = localStorage.getItem('allumini_role');
    if (savedRole) {
      if (savedRole === 'student') setUser(CURRENT_USER);
      else {
        const alumni = ALUMNI_DATA.find(a => a.role === savedRole);
        if (alumni) setUser(alumni);
      }
    }
  }, []);

  const login = (role: 'student' | 'graduate' | 'alumni' | 'faculty') => {
    // Mock login logic
    if (role === 'student') {
      setUser(CURRENT_USER);
    } else {
      // Find a mock user with this role
      const alumni = ALUMNI_DATA.find(a => a.role === role);
      if (alumni) setUser(alumni);
      else setUser({ ...CURRENT_USER, role: role }); // Fallback
    }
    localStorage.setItem('allumini_role', role);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('allumini_role');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, role: user?.role || null }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}