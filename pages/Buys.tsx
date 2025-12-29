import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TrendingUp, TrendingDown, Clock, Plus, X, AlertTriangle, ArrowDownLeft, ArrowUpRight, DollarSign } from 'lucide-react';
import { Button } from '../components/Button';
import { Transaction } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export const Buys: React.FC = () => {
  const { portfolio, coins, addTransaction, formatPrice } = useApp();
  const location = useLocation();
  
  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  // Form Data
  const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy');
  const [selectedCoinId, setSelectedCoinId] = useState<string>(coins[0]?.id || '');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Handle incoming state from navigation
  useEffect(() => {
    if (location.state && location.state.coinId) {
      setSelectedCoinId(location.state.coinId);
      if (location.state.type) {
        setTransactionType(location.state.type);
      }
      setIsFormOpen(true);
    }
  }, [location.state]);

  // Derived Values
  const selectedCoin = coins.find(c => c.id === selectedCoinId);
  const estimatedPrice = selectedCoin?.current_price || 0;
  const estimatedTotal = (parseFloat(amount) || 0) * estimatedPrice;

  // Sort portfolio chronologically (Newest first)
  const sortedPortfolio = [...portfolio].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormOpen(false);
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!selectedCoin) return;
    
    const newTx: Transaction = {
      id: Date.now().toString(),
      coinId: selectedCoinId,
      amount: parseFloat(amount),
      priceAtBuy: estimatedPrice, // Captures execution price for both buy and sell
      date: date,
      type: transactionType
    };
    
    addTransaction(newTx);
    setIsConfirmOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setAmount('');
    setTransactionType('buy');
    setDate(new Date().toISOString().split('T')[0]);
    setSelectedCoinId(coins[0]?.id || '');
  };

  const handleCancelConfirm = () => {
    setIsConfirmOpen(false);
    setIsFormOpen(true);
  };

  return (
    <div className="relative pb-24">
      <div className="mb-6 flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold mb-1">Transactions</h2>
           <p className="text-slate-400 text-sm">History of your buys and sells.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFormOpen(true)}
          className="bg-brand-primary p-3 rounded-xl text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-colors"
          aria-label="Add Transaction"
        >
          <Plus size={24} />
        </motion.button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
        {sortedPortfolio.map((tx, index) => {
          const coin = coins.find(c => c.id === tx.coinId);
          if (!coin) return null;
          
          const isBuy = tx.type === 'buy';
          
          // Value Calculations
          const executionValue = tx.priceAtBuy * tx.amount; // Cost for Buy, Proceeds for Sell
          const currentValue = coin.current_price * tx.amount; // Current market value of this amount
          
          // PnL (Only relevant for Buys that are still held)
          const gain = currentValue - executionValue;
          const gainPercentage = executionValue > 0 ? (gain / executionValue) * 100 : 0;
          const isGain = gain >= 0;

          return (
            <motion.div 
              key={tx.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 hover:bg-slate-700/40 hover:border-white/10 transition-colors duration-300 group"
            >
              
              {/* Top Row: Icon, Name, Date, Amount */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                   <div className={`p-2.5 rounded-xl ${isBuy ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {isBuy ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                   </div>
                   <div>
                     <h3 className="font-bold text-white flex items-center gap-2">
                       {coin.name} 
                       <span className={`text-[10px] px-1.5 py-0.5 rounded border ${isBuy ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400'}`}>
                         {isBuy ? 'BUY' : 'SELL'}
                       </span>
                     </h3>
                     <p className="text-xs text-slate-500 font-medium">{tx.date}</p>
                   </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${isBuy ? 'text-white' : 'text-slate-300'}`}>
                    {isBuy ? '+' : '-'}{tx.amount} <span className="text-sm font-medium opacity-60">{coin.symbol.toUpperCase()}</span>
                  </p>
                  <p className="text-xs text-slate-500">@ {formatPrice(tx.priceAtBuy)}</p>
                </div>
              </div>

              {/* Bottom Row: Financials */}
              <div className="bg-slate-900/40 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                 {isBuy ? (
                   <>
                     <div>
                       <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Current Value</p>
                       <p className="font-semibold text-slate-200">{formatPrice(currentValue)}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Return</p>
                       <div className={`flex items-center gap-1.5 font-bold ${isGain ? 'text-green-400' : 'text-red-400'}`}>
                          <span>{isGain ? '+' : ''}{formatPrice(gain)}</span>
                          <span className={`text-[10px] px-1 py-0.5 rounded ${isGain ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                            {isGain ? '+' : ''}{gainPercentage.toFixed(1)}%
                          </span>
                       </div>
                     </div>
                   </>
                 ) : (
                   <>
                     <div className="flex items-center gap-2 text-slate-400">
                       <DollarSign size={16} />
                       <span className="text-sm font-medium">Proceeds</span>
                     </div>
                     <div>
                       <p className="font-bold text-white tracking-wide">{formatPrice(executionValue)}</p>
                     </div>
                   </>
                 )}
              </div>

            </motion.div>
          );
        })}
        </AnimatePresence>

        {portfolio.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="bg-slate-800/50 p-6 rounded-full mb-4">
               <Clock size={40} className="opacity-40" />
            </div>
            <p className="text-lg font-semibold text-slate-400">No transactions yet</p>
            <p className="text-sm opacity-60">Tap the + button to add your first trade.</p>
          </div>
        )}
      </div>

      {/* Input Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
             />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-slate-900/90 backdrop-blur-xl w-full max-w-md rounded-3xl border border-white/10 p-6 shadow-2xl relative z-10"
            >
              <button 
                onClick={() => setIsFormOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-xl font-bold mb-6">Add Transaction</h2>
              
              <form onSubmit={handleReview} className="space-y-4">
                
                {/* Type Switcher */}
                <div className="flex bg-slate-800 p-1 rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => setTransactionType('buy')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${transactionType === 'buy' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionType('sell')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${transactionType === 'sell' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    Sell
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Asset</label>
                  <div className="relative">
                    <select 
                      value={selectedCoinId}
                      onChange={(e) => setSelectedCoinId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-primary appearance-none cursor-pointer"
                    >
                      {coins.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.symbol.toUpperCase()})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Amount</label>
                      <input 
                        type="number" 
                        step="any"
                        min="0.00000001"
                        placeholder="0.00" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-primary placeholder:text-slate-600"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Date</label>
                      <input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-primary [color-scheme:dark]"
                      />
                   </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4 mt-4 border border-slate-700/50">
                   <div className="flex justify-between text-sm mb-2">
                     <span className="text-slate-400">Market Price</span>
                     <span>{formatPrice(estimatedPrice)}</span>
                   </div>
                   <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-700">
                     <span>{transactionType === 'buy' ? 'Total Cost' : 'Total Proceeds'}</span>
                     <span className={transactionType === 'buy' ? 'text-white' : 'text-brand-success'}>{formatPrice(estimatedTotal)}</span>
                   </div>
                </div>

                <Button type="submit" fullWidth disabled={!amount || parseFloat(amount) <= 0}>
                  Review Transaction
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
      {isConfirmOpen && selectedCoin && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={handleCancelConfirm}
             className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="bg-slate-900/90 backdrop-blur-xl w-full max-w-sm rounded-3xl border border-white/10 p-6 shadow-2xl relative z-10"
          >
            <div className="flex flex-col items-center text-center mb-6">
               <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg ${transactionType === 'buy' ? 'bg-green-500/20 text-green-500 shadow-green-500/20' : 'bg-red-500/20 text-red-500 shadow-red-500/20'}`}>
                  {transactionType === 'buy' ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
               </div>
               <h2 className="text-xl font-bold text-white">Confirm {transactionType === 'buy' ? 'Purchase' : 'Sale'}</h2>
               <p className="text-slate-400 text-sm mt-2">
                 Verify the details below.
               </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-4 space-y-3 mb-6 border border-slate-700/50">
               <div className="flex justify-between items-center">
                 <span className="text-slate-400 text-sm">Asset</span>
                 <div className="flex items-center gap-2">
                    <img src={selectedCoin.image} alt={selectedCoin.name} className="w-5 h-5 rounded-full" />
                    <span className="font-semibold text-white">{selectedCoin.name}</span>
                 </div>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-400 text-sm">Date</span>
                 <span className="font-medium text-white text-sm">{date}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-400 text-sm">Amount</span>
                 <span className={`font-semibold ${transactionType === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                    {transactionType === 'buy' ? '+' : '-'}{amount} {selectedCoin.symbol.toUpperCase()}
                 </span>
               </div>
               <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
                 <span className="text-slate-400 text-sm">Total Value</span>
                 <span className="font-bold text-white text-lg">{formatPrice(estimatedTotal)}</span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <Button variant="secondary" onClick={handleCancelConfirm}>
                 Cancel
               </Button>
               <Button onClick={handleConfirm} className={transactionType === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>
                 Confirm
               </Button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
};