import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, clearTokens } from '../services/apiClient';

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
  login: (email: string, role: Role, password?: string) => Promise<void>;
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

const SESSION_KEY = 'rovia_session';

const loadSession = (): { user: UserProfile; mode: Role } | null => {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.user && parsed?.mode) return parsed;
    }
  } catch (_) {}
  return null;
};

const saveSession = (user: UserProfile, mode: Role) => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user, mode }));
  } catch (_) {}
};

const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (_) {}
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const session = loadSession();
  const [mode, setMode] = useState<Role>(session?.mode ?? 'customer');
  const [user, setUser] = useState<UserProfile>(session?.user ?? DEMO_USERS.customer);

  // Persist session on every change
  useEffect(() => {
    if (user && user.id !== 'guest') {
      saveSession(user, mode);
    }
  }, [user, mode]);

  const switchMode = (newMode: Role) => {
    const newUser = DEMO_USERS[newMode];
    setMode(newMode);
    setUser(newUser);
  };

  const login = async (email: string, role: Role, password?: string) => {
    // Try real backend login if password provided
    if (password) {
      const tokens = await authApi.login(email, password);
      if (tokens) {
        // Fetch real user info from backend
        const me = await authApi.me();
        if (me) {
          const backendRole: Role =
            me.role === 'ADMIN' ? 'admin'
            : me.role === 'OPERATIONS' ? 'renter'
            : 'customer';
          const loggedInUser: UserProfile = {
            id: String(me.id),
            name: `${me.first_name} ${me.last_name}`,
            email: me.email,
            phone: '',
            avatar: '',
            role: backendRole,
          };
          setMode(backendRole);
          setUser(loggedInUser);
          saveSession(loggedInUser, backendRole);
          return;
        }
      }
    }
    // Fallback: demo login (role-based, no real backend auth)
    const baseUser = DEMO_USERS[role];
    const loggedInUser: UserProfile = { ...baseUser, email };
    setMode(role);
    setUser(loggedInUser);
    saveSession(loggedInUser, role);
  };

  const logout = () => {
    clearSession();
    clearTokens();
    setMode('customer');
    setUser(DEMO_USERS.customer);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      saveSession(updated, mode);
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
