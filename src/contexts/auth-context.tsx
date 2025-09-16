'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import type { LoginCredentials, SignUpCredentials } from '@/lib/types';
import { useRouter } from 'next/navigation';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  signup: (credentials: SignUpCredentials) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      const token = user ? await user.getIdToken() : '';
      
      // Call API to set/clear cookie
      await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
      });

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async ({ email, password }: LoginCredentials): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    router.push('/dashboard');
    return userCredential.user;
  };

  const signup = async ({ name, email, password }: SignUpCredentials): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // You might want to create a user document in Firestore here as well
    router.push('/dashboard');
    return userCredential.user;
  };

  const logout = async () => {
    await signOut(auth);
    // API route will be hit by onAuthStateChanged to clear cookie
    router.push('/login');
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
