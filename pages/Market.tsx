import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CryptoCard } from '../components/CryptoCard';
import { Search, Sparkles, X, BrainCircuit } from 'lucide-react';
import { getMarketAnalysis } from '../services/geminiService';
import { Coin } from '../types';
import { AnimatePresence, motion } from 'framer-motion';

export const Market: React.FC = () => {
  const { coins, favorites, toggleFavorite } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  const filteredCoins = coins.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAiAnalysis = async (coin: Coin) => {
    setSelectedCoin(coin);
    setLoadingAi(true);
    setAiAnalysis('');
    
    // Simulate loading for better UX
    const analysis = await getMarketAnalysis(coin);
    setAiAnalysis(analysis);
    setLoadingAi(false);
  };

  const closeAnalysis = () => {
    setSelectedCoin(null);
    setAiAnalysis('');
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search coins (e.g. Bitcoin)" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-primary transition-colors"
        />
      </div>

      {/* Live Indicator Header */}
      <div className="flex items-center justify-between px-2 mb-3">
         <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Market Assets</h3>
         <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs text-green-400 font-bold tracking-wide">LIVE PRICES</span>
         </div>
      </div>

      <motion.div layout className="space-y-2 pb-20">
        <AnimatePresence>
        {filteredCoins.map(coin => (
          <motion.div
            key={coin.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout
          >
            <CryptoCard 
              coin={coin} 
              isFavorite={favorites.includes(coin.id)}
              onToggleFavorite={toggleFavorite}
              onAnalyze={() => handleAiAnalysis(coin)}
            />
          </motion.div>
        ))}
        </AnimatePresence>
      </motion.div>

      {/* AI Analysis Modal (Bottom Sheet style) */}
      <AnimatePresence>
      {selectedCoin && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAnalysis}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Bottom Sheet */}
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-slate-900/95 backdrop-blur-xl w-full max-w-3xl rounded-t-3xl border-t border-white/10 p-6 pb-8 shadow-2xl relative z-10 max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
             
             <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6 shrink-0 opacity-50"></div>
             
             <button 
                onClick={closeAnalysis}
                className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
             >
                <X size={24} />
             </button>

             <div className="flex items-center gap-4 mb-6 shrink-0">
                <div className="relative">
                   <img src={selectedCoin.image} alt={selectedCoin.name} className="w-14 h-14 rounded-full border-2 border-brand-primary/50 shadow-lg shadow-brand-primary/20" />
                   <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-1 border border-brand-primary/50">
                      <BrainCircuit size={14} className="text-brand-primary" />
                   </div>
                </div>
                <div>
                   <h2 className="text-xl font-bold text-white">{selectedCoin.name} Analysis</h2>
                   <div className="flex items-center gap-2">
                     <p className="text-slate-400 text-sm">Powered by Gemini AI</p>
                     {loadingAi && <span className="flex h-2 w-2 rounded-full bg-brand-primary animate-pulse"></span>}
                   </div>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto mb-6 pr-1 no-scrollbar">
               <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5 min-h-[120px] shadow-inner relative overflow-hidden group">
                  {/* Decorative background glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-brand-primary/10 transition-colors duration-700"></div>

                  {loadingAi ? (
                    <div className="flex flex-col items-center justify-center h-32 gap-3 py-4 text-brand-primary/80">
                      <Sparkles className="animate-spin" size={28} />
                      <span className="text-sm font-medium animate-pulse">Generating insights...</span>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="relative z-10"
                    >
                      <p className="text-slate-200 leading-relaxed text-lg font-light whitespace-pre-wrap">{aiAnalysis}</p>
                    </motion.div>
                  )}
               </div>
             </div>

             <motion.button 
               whileTap={{ scale: 0.98 }}
               onClick={closeAnalysis}
               className="w-full py-4 bg-gradient-to-r from-brand-primary to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 shrink-0"
             >
               Done
             </motion.button>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
};