import React, { createContext, useContext, useEffect, useState } from 'react';
import { blink, type StoreUser } from '@/lib/blink';

interface AuthContextType {
  user: StoreUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (redirectUrl?: string) => void;
  signUp: (data: { email: string; password: string; displayName: string }) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoreUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged(({ user: nextUser, isLoading: loading }) => {
      setUser(nextUser);
      setIsLoading(loading);
    });
    blink.auth.getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to restore sign-in session:', error);
        setIsLoading(false);
      });
    return unsubscribe;
  }, []);

  const login = (redirectUrl?: string) => blink.auth.login(redirectUrl);
  const signUp = async (data: { email: string; password: string; displayName: string }) => {
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
