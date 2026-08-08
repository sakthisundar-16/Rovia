import React, { createContext, useContext, useState } from 'react';

export type Role = 'customer' | 'renter' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: Role;
  tier?: string;
  company?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  mode: Role;
  switchMode: (mode: Role) => void;
  login: (email: string, role: Role) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<Role, UserProfile> = {
  customer: {
    id: 'usr-8842',
    name: 'Elena Vance',
    email: 'elena.vance@studio-noir.com',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    role: 'customer',
    tier: 'Gothic Noir VIP Member',
    company: 'Studio Noir Atelier'
  },
  renter: {
    id: 'rnt-3001',
    name: 'Ravi Kapoor',
    email: 'renter@urbangear-rentals.in',
    phone: '+91 98300 22110',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    role: 'renter',
    tier: 'Verified Renter Business',
    company: 'Urban Gear Rentals'
  },
  admin: {
    id: 'adm-101',
    name: 'Marcus Sterling',
    email: 'marcus.sterling@rovia-ops.com',
    phone: '+91 99000 11223',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    role: 'admin',
    company: 'ROVIA Operations HQ'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Role>('customer');
  const [user, setUser] = useState<UserProfile>(DEMO_USERS.customer);

  const switchMode = (newMode: Role) => {
    setMode(newMode);
    setUser(DEMO_USERS[newMode]);
  };

  const login = (email: string, role: Role) => {
    switchMode(role);
  };

  const logout = () => {
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
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      return updated;
    });
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
