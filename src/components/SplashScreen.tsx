'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade out animation
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative"
          >
            {/* Glow effect background */}
            <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full scale-150 animate-pulse" />
            
            <h1 className="text-4xl sm:text-8xl font-black tracking-[0.1em] sm:tracking-[0.2em] text-white italic relative z-10 text-center">
              ALCHEMIST
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.5, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="text-center mt-6 text-[10px] sm:text-base font-bold tracking-[0.3em] sm:tracking-[0.5em] text-primary uppercase relative z-10"
            >
              案件管理・ヒアリングツール
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
            className="absolute bottom-20 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent origin-center"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
