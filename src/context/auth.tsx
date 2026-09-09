import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, UserRole } from '../types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  role: UserRole | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (params: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role: 'client' | 'business';
  }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  role: null,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Erreur de récupération du profil:', error.message);
        return null;
      }
      return data as Profile;
    } catch (err) {
      console.warn('Exception fetchProfile:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    const p = await fetchProfile(user.id);
    if (p) setProfile(p);
  };

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          const prof = await fetchProfile(initialSession.user.id);
          if (isMounted) setProfile(prof);
        }
      } catch (e) {
        console.warn('Erreur session initiale:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        if (!isMounted) return;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const prof = await fetchProfile(currentSession.user.id);
          if (isMounted) setProfile(prof);
        } else {
          if (isMounted) setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };

      if (data.user) {
        const prof = await fetchProfile(data.user.id);
        setProfile(prof);
      }
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async ({
    email,
    password,
    fullName,
    phone,
    role,
  }: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role: 'client' | 'business';
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            role,
          },
        },
      });

      if (error) return { error };

      if (data.user) {
        // Fallback insertion au cas où le trigger n'a pas encore tourné
        const newProfile: Partial<Profile> = {
          id: data.user.id,
          full_name: fullName,
          phone,
          role,
        };
        await supabase.from('profiles').upsert(newProfile);
        const prof = await fetchProfile(data.user.id);
        setProfile(prof ?? (newProfile as Profile));
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const currentRole: UserRole | null = profile?.role ?? (user?.user_metadata?.role as UserRole) ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        role: currentRole,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
