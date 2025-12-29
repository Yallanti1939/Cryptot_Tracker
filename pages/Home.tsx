import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp } from 'lucide-react';
import { CryptoCard } from '../components/CryptoCard';
import { useNavigate } from 'react-router-dom';

export const Home: React.FC = () => {
  const { portfolio, coins, favorites, toggleFavorite, formatPrice } = useApp();
  const navigate = useNavigate();

  const totalBalance = useMemo(() => {
    return portfolio.reduce((acc, tx) => {
      const coin = coins.find(c => c.id === tx.coinId);
      if (!coin) return acc;
      
      const value = coin.current_price * tx.amount;
      // Subtract value if it's a sell transaction, add if it's a buy
      return tx.type === 'sell' ? acc - value : acc + value;
    }, 0);
  }, [portfolio, coins]);

  // Mocking 24h PNL
  const pnl = totalBalance * 0.052; 
  const isPnlPositive = true;

  const topMovers = [...coins].sort((a, b) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h)).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Portfolio Card */}
      <div className="bg-gradient-to-br from-blue-600/90 to-purple-700/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-blue-500/20 text-white relative overflow-hidden border border-white/10 group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl group-hover:scale-110 transition-transform duration-700"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
             <div>
                <p className="text-blue-100 text-sm font-medium">Total Balance</p>
                <h2 className="text-3xl font-bold mt-1 tracking-tight">{formatPrice(Math.max(0, totalBalance))}</h2>
             </div>
             <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md shadow-lg">
               <Wallet className="text-white" size={24} />
             </div>
          </div>
          
          <div className="flex items-center gap-2 bg-black/20 self-start inline-flex px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/5">
             {isPnlPositive ? <ArrowUpRight size={16} className="text-green-300"/> : <ArrowDownRight size={16} className="text-red-300"/>}
             <span className="font-semibold">{isPnlPositive ? '+' : ''}{formatPrice(pnl)} (5.2%)</span>
             <span className="text-blue-200 text-xs ml-1">Today</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => navigate('/market')} className="bg-slate-800/40 backdrop-blur-md p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border border-white/5 hover:bg-slate-700/60 active:scale-95 transition-all duration-200 shadow-lg">
            <div className="bg-green-500/20 p-3 rounded-full text-green-500 shadow-inner">
               <ArrowUpRight size={24} />
            </div>
            <span className="font-semibold text-sm text-slate-200">Buy</span>
        </button>
        <button className="bg-slate-800/40 backdrop-blur-md p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border border-white/5 hover:bg-slate-700/60 active:scale-95 transition-all duration-200 shadow-lg">
            <div className="bg-red-500/20 p-3 rounded-full text-red-500 shadow-inner">
               <ArrowDownRight size={24} />
            </div>
            <span className="font-semibold text-sm text-slate-200">Sell</span>
        </button>
      </div>

      {/* Top Movers */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp size={20} className="text-brand-primary" />
            Top Movers
          </h3>
          <button onClick={() => navigate('/market')} className="text-sm text-brand-primary hover:text-blue-400 transition-colors">See All</button>
        </div>
        
        <div className="space-y-2">
           {topMovers.map(coin => (
             <CryptoCard 
               key={coin.id} 
               coin={coin} 
               isFavorite={favorites.includes(coin.id)}
               onToggleFavorite={toggleFavorite}
             />
           ))}
        </div>
      </div>
    </div>
  );
};