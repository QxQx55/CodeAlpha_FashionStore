import React, { createContext, useContext, useEffect, useState } from 'react';
import { blink } from '@/lib/blink';
import type { BlinkUser } from '@blinkdotnew/sdk';

interface AuthContextType {
  user: BlinkUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (redirectUrl?: string) => void;
  signUp: (data: any) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<BlinkUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      if (!state.isLoading) setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = (redirectUrl?: string) => blink.auth.login(redirectUrl);
  const signUp = async (data: any) => {
    await blink.auth.signUp(data);
  };
  const signIn = async (email: string, pass: string) => {
    await blink.auth.signInWithEmail(email, pass);
  };
  const logout = () => blink.auth.signOut();

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signUp,
        signIn,
        logout,
      }}
    >
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
