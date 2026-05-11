'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, LogIn, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoginView() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'ログイン中にエラーが発生しました。');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-none paper-shadow-lg rounded-[2.5rem] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="h-2 w-full bg-primary" />
        <CardHeader className="p-8 pb-4 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-black italic tracking-tighter text-foreground uppercase font-[family-name:var(--font-outfit)]">
            ALCHEMIST SFA
          </CardTitle>
          <CardDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">
            Secure Cloud Access
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive text-sm font-bold rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          <Button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            <span className="uppercase tracking-widest text-sm">
              {loading ? 'Redirecting...' : 'Sign in with Google'}
            </span>
          </Button>
          
          <div className="text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
              Only authorized personnel.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
