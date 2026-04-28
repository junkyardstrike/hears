'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Delete } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onSuccess: () => void;
}

export function PasscodeLock({ onSuccess }: Props) {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState(false);
  
  // In a real app, this would be in the store. For now, let's use a default or localStorage
  const CORRECT_PIN = typeof window !== 'undefined' ? localStorage.getItem('alchemist_pin') || '0000' : '0000';

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === 4) {
        if (newPin === CORRECT_PIN) {
          onSuccess();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const dots = [0, 1, 2, 3];

  return (
    <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-[#050505] text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xs flex flex-col items-center"
      >
        <div className="mb-8 p-4 rounded-full bg-primary/10 border border-primary/20 glow-border">
          {pin.length === 4 && !error ? (
            <Unlock className="w-8 h-8 text-primary glow-text" />
          ) : (
            <Lock className="w-8 h-8 text-primary glow-text" />
          )}
        </div>

        <h2 className="text-xl font-bold tracking-[0.2em] mb-2 uppercase">Enter Passcode</h2>
        <p className="text-muted-foreground text-xs mb-12 opacity-50">Authorized Personnel Only</p>

        {/* Pin Dots */}
        <div className={`flex gap-6 mb-16 ${error ? 'animate-bounce text-destructive' : ''}`}>
          {dots.map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: pin.length > i ? 1.2 : 1,
                backgroundColor: pin.length > i ? 'var(--primary)' : 'rgba(255,255,255,0.1)'
              }}
              className={`w-4 h-4 rounded-full border border-white/5 ${pin.length > i ? 'glow-primary' : ''}`}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-6 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <Button
              key={num}
              variant="ghost"
              onClick={() => handleNumberClick(num)}
              className="h-16 w-16 rounded-full text-2xl font-light hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20"
            >
              {num}
            </Button>
          ))}
          <div />
          <Button
            variant="ghost"
            onClick={() => handleNumberClick('0')}
            className="h-16 w-16 rounded-full text-2xl font-light hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20"
          >
            0
          </Button>
          <Button
            variant="ghost"
            onClick={handleDelete}
            className="h-16 w-16 rounded-full flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <Delete className="w-6 h-6" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
