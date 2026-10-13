'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AccountType } from '@/types/auth';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (details: {
    email: string;
    name: string;
    accountType: AccountType;
    workplace?: string;
    organizationName?: string;
    gradeLevel?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const STORAGE_KEY = 'bopzi_auth_user';

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to parse stored auth user', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, name?: string) => {
    // If an existing registered user matches email in localStorage, restore them
    let existingProfile: UserProfile | null = null;
    try {
      const allUsers = JSON.parse(localStorage.getItem('bopzi_all_users') || '[]');
      existingProfile = allUsers.find((u: UserProfile) => u.email.toLowerCase() === email.toLowerCase()) || null;
    } catch {
      // ignore
    }

    const profile: UserProfile = existingProfile || {
      id: `usr_${Date.now()}`,
      email: email.trim().toLowerCase(),
      name: name || email.split('@')[0],
      accountType: 'teacher',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setUser(profile);
    return { success: true };
  };

  const signup = async (details: {
    email: string;
    name: string;
    accountType: AccountType;
    workplace?: string;
    organizationName?: string;
    gradeLevel?: string;
  }) => {
    const profile: UserProfile = {
      id: `usr_${Date.now()}`,
      email: details.email.trim().toLowerCase(),
      name: details.name.trim(),
      accountType: details.accountType,
      workplace: details.workplace as any,
      organizationName: details.organizationName,
      gradeLevel: details.gradeLevel,
      createdAt: new Date().toISOString(),
    };

    try {
      const allUsers = JSON.parse(localStorage.getItem('bopzi_all_users') || '[]');
      const filtered = allUsers.filter((u: UserProfile) => u.email.toLowerCase() !== profile.email);
      filtered.push(profile);
      localStorage.setItem('bopzi_all_users', JSON.stringify(filtered));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }

    setUser(profile);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
