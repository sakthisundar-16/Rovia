import React, { createContext, useContext, useState } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: 'customer' | 'admin';
  tier?: string;
  company?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  mode: 'customer' | 'admin';
  switchMode: (mode: 'customer' | 'admin') => void;
  login: (email: string, role: 'customer' | 'admin') => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'customer' | 'admin'>('customer');
  
  const [user, setUser] = useState<UserProfile>({
    id: 'usr-8842',
    name: 'Elena Vance',
    email: 'elena.vance@studio-noir.com',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    role: 'customer',
    tier: 'Gothic Noir VIP Member',
    company: 'Studio Noir Atelier'
  });

  const switchMode = (newMode: 'customer' | 'admin') => {
    setMode(newMode);
    if (newMode === 'admin') {
      setUser({
        id: 'adm-101',
        name: 'Marcus Sterling',
        email: 'marcus.sterling@rovia-ops.com',
        phone: '+91 99000 11223',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
        role: 'admin',
        company: 'ROVIA Operations Head Office'
      });
    } else {
      setUser({
        id: 'usr-8842',
        name: 'Elena Vance',
        email: 'elena.vance@studio-noir.com',
        phone: '+91 98765 43210',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        role: 'customer',
        tier: 'Gothic Noir VIP Member',
        company: 'Studio Noir Atelier'
      });
    }
  };

  const login = (email: string, role: 'customer' | 'admin') => {
    switchMode(role);
  };

  const logout = () => {
    // Keep a simulated state
    setUser({
      id: 'guest',
      name: 'Guest User',
      email: '',
      phone: '',
      avatar: '',
      role: mode
    });
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider value={{ user, mode, switchMode, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
