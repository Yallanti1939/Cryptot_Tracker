import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { User, CreditCard, ShieldCheck, Settings, LogOut, ChevronRight, Wallet, Globe, X, Banknote, Smartphone, AlertTriangle, ArrowLeft, Loader2, History, ArrowUpRight, ArrowDownLeft, FileText, Bell, Phone, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Currency } from '../types';
import { AnimatePresence, motion } from 'framer-motion';

// Rates must match AppContext for consistent logic
const CURRENCY_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  JPY: 150.5,
  GBP: 0.79,
  INR: 83.50,
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  JPY: '¥',
  GBP: '£',
  INR: '₹',
};

// Updated UPI Apps list with branded colors
const UPI_APPS = [
  { id: 'paypal', name: 'PayPal', color: 'bg-[#003087]', textColor: 'text-white' },
  { id: 'mobikwik', name: 'MobiKwik', color: 'bg-[#009CDA]', textColor: 'text-white' },
  { id: 'gpay', name: 'Google Pay', color: 'bg-white', textColor: 'text-gray-800' },
  { id: 'phonepe', name: 'PhonePe', color: 'bg-[#6739b7]', textColor: 'text-white' },
  { id: 'paytm', name: 'Paytm', color: 'bg-[#00baf2]', textColor: 'text-white' },
  { id: 'other', name: 'Other', color: 'bg-slate-700', textColor: 'text-slate-300' },
];

export const Profile: React.FC = () => {
  const { user, logout, bankAccounts, currency, setCurrency, fiatBalance, withdrawFunds, formatPrice, portfolio, coins } = useApp();
  const navigate = useNavigate();
  
  // Modal States
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  
  // Withdraw State
  const [withdrawTab, setWithdrawTab] = useState<'bank' | 'upi'>('bank');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string | null>(null);
  
  // Form Data
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState(''); // Account Number or UPI ID
  const [ifsc, setIfsc] = useState('');

  // Flow State
  const [withdrawStep, setWithdrawStep] = useState<'input' | 'confirm' | 'processing' | 'success'>('input');
  
  // Permissions State
  const [permissions, setPermissions] = useState({ phone: false, notifications: true });

  // Currency Logic
  const currentRate = CURRENCY_RATES[currency] || 1;
  const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';
  const maxWithdrawableAmount = fiatBalance * currentRate;

  // Transactions sorted chronologically (Newest first)
  const sortedTransactions = [...portfolio]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openWithdrawModal = () => {
    setWithdrawStep('input');
    setAmount('');
    setDestination('');
    setIfsc('');
    setSelectedUpiApp(null);
    setIsWithdrawOpen(true);
  };

  const handleMaxAmount = () => {
    setAmount(maxWithdrawableAmount.toFixed(2));
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!amount || val <= 0) return;
    if (val > maxWithdrawableAmount) return; 
    
    if (!destination) return;
    if (withdrawTab === 'bank' && !ifsc) return;
    
    setWithdrawStep('confirm');
  };

  const handleConfirmWithdraw = () => {
    setWithdrawStep('processing');
    const amountInUsd = parseFloat(amount) / currentRate;
    setTimeout(() => {
      const success = withdrawFunds(amountInUsd);
      if (success) {
        setWithdrawStep('success');
        setTimeout(() => {
          setIsWithdrawOpen(false);
        }, 2500);
      } else {
        setWithdrawStep('input');
      }
    }, 2000);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <div className="bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex items-center gap-4 shadow-lg">
        <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full border-2 border-brand-primary shadow-[0_0_15px_rgba(59,130,246,0.4)]" />
        <div className="flex-1">
           <h2 className="text-xl font-bold text-white">{user.name}</h2>
           <p className="text-slate-400 text-sm">{user.email}</p>
           <div className="flex items-center gap-2 mt-2">
             <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-green-500/20">
               <ShieldCheck size={12} /> Verified
             </span>
           </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        
        {/* Finance Section */}
        <section>
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2 ml-1">Finance</h3>
          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-sm">
             
             {/* Balance */}
             <div className="p-6 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-white/5">
                <p className="text-slate-400 text-xs font-medium uppercase mb-1">Available Cash</p>
                <div className="flex justify-between items-center">
                   <h2 className="text-2xl font-bold text-white tracking-tight">{formatPrice(fiatBalance)}</h2>
                   <div className="bg-green-500/10 text-green-400 p-2 rounded-full">
                      <Wallet size={20} />
                   </div>
                </div>
             </div>

             {/* Withdraw */}
             <div 
                onClick={openWithdrawModal}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-700/40 transition-colors border-b border-white/5"
             >
                <div className="flex items-center gap-3">
                  <div className="bg-brand-primary/20 text-brand-primary p-2 rounded-lg">
                    <Banknote size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Withdraw Funds</p>
                    <p className="text-xs text-slate-400">Transfer to Bank or UPI</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-500" />
             </div>
             
             <button className="w-full py-3 text-center text-brand-primary text-sm font-medium hover:bg-slate-800/50 transition-colors">
               + Add Bank Account
             </button>
          </div>
        </section>

        {/* Transaction History Section */}
        <section>
           <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2 ml-1">Transaction History</h3>
           <div className="space-y-3">
             {sortedTransactions.length > 0 ? (
               sortedTransactions.map(tx => {
                 const coin = coins.find(c => c.id === tx.coinId);
                 if (!coin) return null;
                 
                 const isBuy = tx.type === 'buy';
                 const executionValue = tx.priceAtBuy * tx.amount;
                 const currentValue = coin.current_price * tx.amount;
                 const gain = currentValue - executionValue;
                 const gainPercentage = executionValue > 0 ? (gain / executionValue) * 100 : 0;
                 const isGain = gain >= 0;

                 return (
                   <motion.div 
                     key={tx.id} 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 hover:bg-slate-700/40 transition-all duration-300"
                   >
                     <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-xl ${isBuy ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                           {isBuy ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                         </div>
                         <div>
                           <p className="font-bold text-white text-sm flex items-center gap-1.5">
                             {coin.name}
                             <span className={`text-[10px] px-1 py-0.5 rounded border ${isBuy ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400'}`}>
                               {isBuy ? 'BUY' : 'SELL'}
                             </span>
                           </p>
                           <p className="text-[10px] text-slate-500 font-medium">{tx.date} @ {formatPrice(tx.priceAtBuy)}</p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className={`font-bold text-sm ${isBuy ? 'text-white' : 'text-slate-300'}`}>
                           {isBuy ? '+' : '-'}{tx.amount} <span className="text-[10px] opacity-60 uppercase">{coin.symbol}</span>
                         </p>
                         <p className="text-[10px] text-slate-500">Value: {formatPrice(executionValue)}</p>
                       </div>
                     </div>

                     {/* Holding stats only relevant for buys usually, but let's show market comparison for context */}
                     {isBuy && (
                       <div className="bg-slate-900/40 rounded-xl p-2.5 border border-white/5 flex items-center justify-between">
                         <div>
                           <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tight mb-0.5">Market Value</p>
                           <p className="text-xs font-semibold text-slate-200">{formatPrice(currentValue)}</p>
                         </div>
                         <div className="text-right">
                           <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tight mb-0.5">Net Profit/Loss</p>
                           <div className={`flex items-center gap-1 justify-end text-xs font-bold ${isGain ? 'text-green-400' : 'text-red-400'}`}>
                             {isGain ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                             <span>{isGain ? '+' : ''}{formatPrice(gain)} ({gainPercentage.toFixed(1)}%)</span>
                           </div>
                         </div>
                       </div>
                     )}
                   </motion.div>
                 );
               })
             ) : (
               <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-8 text-center text-slate-500 text-sm">
                 <History size={32} className="mx-auto mb-3 opacity-20" />
                 No transactions found
               </div>
             )}
           </div>
        </section>

        {/* Preferences Section */}
        <section>
           <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2 ml-1">Preferences</h3>
           <div className="bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-sm">
              
              <div className="p-4 flex items-center justify-between border-b border-white/5">
                 <div className="flex items-center gap-3">
                   <div className="bg-purple-500/20 text-purple-400 p-2 rounded-lg">
                      <Globe size={20} />
                   </div>
                   <span>Currency</span>
                 </div>
                 <select 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block p-2"
                 >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                 </select>
              </div>

              {/* Rules & Permissions */}
              <div 
                onClick={() => setIsRulesOpen(true)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-700/40 transition-colors"
              >
                 <div className="flex items-center gap-3">
                   <div className="bg-yellow-500/20 text-yellow-400 p-2 rounded-lg">
                      <FileText size={20} />
                   </div>
                   <span>Safety & Permissions</span>
                 </div>
                 <ChevronRight size={18} className="text-slate-500" />
              </div>

           </div>
        </section>

        <Button variant="danger" fullWidth onClick={handleLogout} className="mt-8 flex items-center justify-center gap-2 shadow-red-500/20">
           <LogOut size={20} />
           Sign Out
        </Button>
      </div>

      {/* Rules & Permissions Modal */}
      <AnimatePresence>
        {isRulesOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsRulesOpen(false)} />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-900 w-full max-w-sm rounded-2xl border border-white/10 p-6 z-10 relative">
               <button onClick={() => setIsRulesOpen(false)} className="absolute top-4 right-4 text-slate-500"><X size={20}/></button>
               <h2 className="text-xl font-bold mb-4">App Permissions</h2>
               <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Bell size={20} className="text-blue-400" />
                      <div>
                        <p className="font-semibold text-sm">Notifications</p>
                        <p className="text-xs text-slate-400">Price alerts & updates</p>
                      </div>
                    </div>
                    <div 
                      onClick={() => setPermissions(p => ({...p, notifications: !p.notifications}))}
                      className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${permissions.notifications ? 'bg-brand-primary' : 'bg-slate-600'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${permissions.notifications ? 'left-5' : 'left-1'}`}></div>
                    </div>
                 </div>
                 <div className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Phone size={20} className="text-green-400" />
                      <div>
                        <p className="font-semibold text-sm">Phone State</p>
                        <p className="text-xs text-slate-400">Secure identity verification</p>
                      </div>
                    </div>
                    <div 
                      onClick={() => setPermissions(p => ({...p, phone: !p.phone}))}
                      className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${permissions.phone ? 'bg-brand-primary' : 'bg-slate-600'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${permissions.phone ? 'left-5' : 'left-1'}`}></div>
                    </div>
                 </div>
               </div>
               <div className="mt-6 pt-6 border-t border-white/10">
                 <h3 className="font-bold mb-2 text-sm">Usage Rules</h3>
                 <ul className="text-xs text-slate-400 list-disc pl-4 space-y-1">
                   <li>Do not share your API keys or passwords.</li>
                   <li>Withdrawals take 2-4 business hours.</li>
                   <li>Verify UPI IDs before confirming transfers.</li>
                 </ul>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Withdrawal Modal */}
      <AnimatePresence>
      {isWithdrawOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/80 backdrop-blur-md"
               onClick={() => setIsWithdrawOpen(false)}
            />
            <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               transition={{ type: "spring", bounce: 0.3 }}
               className="bg-slate-900/90 backdrop-blur-2xl w-full max-w-md rounded-3xl border border-white/10 p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden z-10"
            >
               <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-primary/10 to-transparent pointer-events-none"></div>

               {withdrawStep !== 'processing' && withdrawStep !== 'success' && (
                  <button 
                    onClick={() => setIsWithdrawOpen(false)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-20"
                  >
                    <X size={24} />
                  </button>
               )}

               <AnimatePresence mode="wait">
               {withdrawStep === 'success' ? (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="py-10 flex flex-col items-center justify-center text-center">
                     <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]"><ShieldCheck size={40} /></div>
                     <h3 className="text-2xl font-bold text-white mb-2">Withdrawal Successful!</h3>
                     <p className="text-slate-400">Your funds have been securely transferred.</p>
                  </motion.div>
               ) : withdrawStep === 'processing' ? (
                  <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10 flex flex-col items-center justify-center text-center">
                      <div className="relative w-24 h-24 mb-6"><div className="absolute inset-0 border-4 border-slate-700/50 rounded-full"></div><div className="absolute inset-0 border-4 border-brand-primary rounded-full border-t-transparent animate-spin"></div><Wallet className="absolute inset-0 m-auto text-brand-primary animate-pulse" size={32} /></div>
                      <h3 className="text-xl font-bold text-white mb-2">Processing Withdrawal</h3>
                  </motion.div>
               ) : withdrawStep === 'confirm' ? (
                  <motion.div key="confirm" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="relative z-10">
                     <div className="flex items-center gap-2 mb-6 text-slate-400 cursor-pointer hover:text-white transition-colors w-fit group" onClick={() => setWithdrawStep('input')}>
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> <span className="text-sm font-medium">Back to Edit</span>
                     </div>
                     <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-16 h-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mb-4"><AlertTriangle size={32} /></div>
                        <h2 className="text-xl font-bold text-white">Confirm Withdrawal</h2>
                     </div>
                     <div className="bg-slate-800/60 rounded-xl p-4 space-y-3 mb-6 border border-white/10 shadow-inner">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5"><span className="text-slate-400 text-sm">Method</span><span className="font-semibold text-white">{withdrawTab === 'bank' ? 'Bank Transfer' : selectedUpiApp ? UPI_APPS.find(a=>a.id===selectedUpiApp)?.name : 'UPI'}</span></div>
                        <div className="flex justify-between items-center"><span className="text-slate-400 text-sm">Destination</span><span className="font-semibold text-white font-mono">{destination}</span></div>
                        <div className="flex justify-between items-center pt-2 border-t border-white/10"><span className="text-slate-400 text-sm">Amount</span><span className="font-bold text-brand-primary text-xl">{formatPrice(parseFloat(amount) / currentRate)}</span></div>
                     </div>
                     <Button onClick={handleConfirmWithdraw} fullWidth>Confirm & Withdraw</Button>
                  </motion.div>
               ) : (
                  <motion.div key="input" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="relative z-10">
                     <h2 className="text-2xl font-bold mb-1">Withdraw Funds</h2>
                     
                     <div className="flex bg-slate-800/50 p-1 rounded-xl mb-6 border border-white/5">
                        <button onClick={() => setWithdrawTab('bank')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${withdrawTab === 'bank' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><Banknote size={16} /> Bank</button>
                        <button onClick={() => setWithdrawTab('upi')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${withdrawTab === 'upi' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><Smartphone size={16} /> UPI</button>
                     </div>

                     <form onSubmit={handleReview} className="space-y-4">
                        <div className="space-y-2">
                           <div className="flex justify-between"><label className="text-sm font-medium text-slate-300">Amount</label><span className="text-xs text-brand-primary cursor-pointer hover:underline" onClick={handleMaxAmount}>Available: {formatPrice(fiatBalance)}</span></div>
                           <div className="relative group">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold group-focus-within:text-brand-primary">{currencySymbol}</span>
                              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-8 pr-4 text-white focus:outline-none focus:border-brand-primary transition-all" required max={maxWithdrawableAmount} step="0.01"/>
                           </div>
                        </div>

                        {withdrawTab === 'bank' ? (
                           <>
                              <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Account Number" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-primary transition-all" required />
                              <input type="text" value={ifsc} onChange={(e) => setIfsc(e.target.value)} placeholder="IFSC Code" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-primary transition-all uppercase" required />
                           </>
                        ) : (
                           <div className="space-y-3">
                              {!selectedUpiApp ? (
                                <div className="grid grid-cols-2 gap-3">
                                  {UPI_APPS.map(app => (
                                    <button 
                                       key={app.id} 
                                       type="button" 
                                       onClick={() => setSelectedUpiApp(app.id)} 
                                       className={`flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-white/20 transition-all active:scale-95 text-left group overflow-hidden relative`}
                                    >
                                       <div className={`absolute inset-0 opacity-10 ${app.color} group-hover:opacity-20 transition-opacity`}></div>
                                       <div className={`w-10 h-10 rounded-lg ${app.color} flex items-center justify-center font-bold text-lg shadow-sm ${app.textColor}`}>
                                          {app.name.charAt(0)}
                                       </div>
                                       <span className="text-sm font-medium text-slate-200">{app.name}</span>
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <div className="space-y-2 animate-in fade-in slide-in-from-right-4">
                                   <div className="flex items-center justify-between">
                                      <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${UPI_APPS.find(a=>a.id===selectedUpiApp)?.color} ${UPI_APPS.find(a=>a.id===selectedUpiApp)?.textColor}`}>
                                            {UPI_APPS.find(a=>a.id===selectedUpiApp)?.name.charAt(0)}
                                        </div>
                                        {UPI_APPS.find(a=>a.id===selectedUpiApp)?.name} ID
                                      </label>
                                      <button type="button" onClick={() => setSelectedUpiApp(null)} className="text-xs text-brand-primary hover:text-white transition-colors">Change App</button>
                                   </div>
                                   <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="username@upi" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-primary transition-all" required />
                                </div>
                              )}
                           </div>
                        )}
                        <div className="pt-2"><Button type="submit" fullWidth disabled={!!amount && parseFloat(amount) > maxWithdrawableAmount || (withdrawTab==='upi' && !selectedUpiApp)}>Review Withdrawal</Button></div>
                     </form>
                  </motion.div>
               )}
               </AnimatePresence>
            </motion.div>
         </div>
      )}
      </AnimatePresence>
    </div>
  );
};