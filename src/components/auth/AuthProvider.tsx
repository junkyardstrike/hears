'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { LoginView } from './LoginView';
import { useHearsStore } from '@/store/useHearsStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) {
        useHearsStore.getState().loadFromCloud(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
      if (session) {
        useHearsStore.getState().loadFromCloud(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    const unsubscribe = useHearsStore.subscribe((state, prevState) => {
      // Ignore non-data changes (e.g., UI state, sync status)
      if (
        state.projects === prevState.projects &&
        state.cases === prevState.cases &&
        state.clients === prevState.clients &&
        state.globalFinance === prevState.globalFinance &&
        state.globalGenres === prevState.globalGenres
      ) {
        return;
      }

      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

      syncTimeoutRef.current = setTimeout(async () => {
        state.setSyncStatus('syncing');
        try {
          const payload = {
            projects: state.projects,
            cases: state.cases,
            clients: state.clients,
            globalFinance: state.globalFinance,
            globalGenres: state.globalGenres,
          };

          const { error } = await supabase.from('user_state').upsert({
            user_id: session.user.id,
            state: payload,
            updated_at: new Date().toISOString(),
          });

          if (error) throw error;
          useHearsStore.getState().setSyncStatus('idle');
        } catch (err) {
          console.error('Auto-sync failed:', err);
          useHearsStore.getState().setSyncStatus('error');
        }
      }, 3000); // 3 second debounce
    });

    return () => {
      unsubscribe();
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black tracking-widest uppercase text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <LoginView />;
  }

  return <>{children}</>;
}
