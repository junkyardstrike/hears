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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans">
      <Card className="w-full max-w-md bg-card border border-border shadow-none rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="h-1 w-full bg-primary" />
        <CardHeader className="p-8 pb-4 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-md flex items-center justify-center mb-6 border border-primary/20">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground uppercase">
            ALCHEMIST SFA
          </CardTitle>
          <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">
            Secure Cloud Access
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold rounded-md flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          <Button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-md transition-all active:scale-95 flex items-center justify-center gap-3 shadow-none"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span className="uppercase tracking-widest text-xs">
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
