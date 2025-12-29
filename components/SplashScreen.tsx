import React from 'react';
import { motion } from 'framer-motion';
import { Hexagon, Sparkles } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        y: -20,
        transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }
      }}
      className="fixed inset-0 z-[100] bg-[#000000] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/30 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-accent/20 rounded-full blur-[120px]" 
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.2
          }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.5)]">
            <Hexagon size={48} className="text-white fill-white/20" />
          </div>
          
          <motion.div
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0.8, 1.2, 0.8],
              rotate: [0, 90, 180]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-4 -right-4 text-brand-primary"
          >
            <Sparkles size={24} />
          </motion.div>
        </motion.div>

        {/* Text Animation */}
        <div className="mt-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-3xl font-black tracking-tighter text-white flex items-center gap-2"
          >
            CRYPTOTRACKER <span className="bg-brand-primary text-[10px] px-2 py-0.5 rounded-full self-start mt-1 shadow-[0_0_10px_rgba(59,130,246,0.4)]">PRO</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-2 text-slate-400 text-xs font-medium tracking-[0.3em] uppercase"
          >
            Intelligence in Motion
          </motion.p>
        </div>

        {/* Loading Bar */}
        <div className="mt-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut",
              repeatDelay: 0.5
            }}
            className="w-full h-full bg-gradient-to-r from-transparent via-brand-primary to-transparent"
          />
        </div>
      </div>

      {/* Footer Branding */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 text-[10px] font-bold text-slate-500 tracking-widest uppercase"
      >
        Secured by Gemini AI
      </motion.div>
    </motion.div>
  );
};