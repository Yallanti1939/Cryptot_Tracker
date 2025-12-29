import React, { useRef, useState, useEffect } from 'react';
import { Coin } from '../types';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Heart, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

interface CryptoCardProps {
  coin: Coin;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClick?: () => void;
  onAnalyze?: () => void;
}

export const CryptoCard: React.FC<CryptoCardProps> = ({ coin, isFavorite, onToggleFavorite, onClick, onAnalyze }) => {
  const { formatPrice } = useApp();
  const navigate = useNavigate();
  const isPositive = coin.price_change_percentage_24h >= 0;
  const chartColor = isPositive ? '#10b981' : '#ef4444';

  const data = coin.sparkline.map((val, i) => ({ i, value: val }));

  // Price Flash Effect
  const prevPriceRef = useRef(coin.current_price);
  const [flashClass, setFlashClass] = useState('');

  useEffect(() => {
    if (coin.current_price > prevPriceRef.current) {
      setFlashClass('text-green-400 scale-105');
      setTimeout(() => setFlashClass(''), 1000);
    } else if (coin.current_price < prevPriceRef.current) {
      setFlashClass('text-red-400 scale-105');
      setTimeout(() => setFlashClass(''), 1000);
    }
    prevPriceRef.current = coin.current_price;
  }, [coin.current_price]);

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/coin/${coin.id}`);
    }
  };

  return (
    <div 
      className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-3 mb-3 flex items-center gap-3 border border-white/5 hover:bg-slate-700/50 hover:border-white/10 hover:shadow-lg hover:shadow-brand-primary/10 transition-all duration-300 cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-2 shrink-0">
        <img src={coin.image} alt={coin.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-md" />
        <div className="min-w-0">
          <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-[80px] sm:max-w-none">{coin.name}</h3>
          <span className="text-[10px] text-slate-400 uppercase">{coin.symbol}</span>
        </div>
      </div>

      <div className="flex-1 h-10 max-w-[60px] hidden sm:block">
         <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={chartColor} 
                fill={chartColor} 
                fillOpacity={0.1} 
                strokeWidth={2}
              />
            </AreaChart>
         </ResponsiveContainer>
      </div>

      <div className="text-right shrink-0">
        <p className={`font-bold text-sm sm:text-base tracking-wide transition-all duration-300 ${flashClass || 'text-white'}`}>
            {formatPrice(coin.current_price)}
        </p>
        <p className={`text-[10px] font-medium ${isPositive ? 'text-brand-success' : 'text-brand-danger'}`}>
          {isPositive ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-auto">
        {onAnalyze && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAnalyze();
            }}
            className="flex items-center gap-1 px-2 py-2 rounded-xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-300 border border-brand-primary/20"
            title="Get AI Analysis"
          >
            <Sparkles size={16} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">AI</span>
          </button>
        )}
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(coin.id);
          }}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <Heart size={20} className={isFavorite ? 'fill-brand-accent text-brand-accent' : 'text-slate-500'} />
        </button>
      </div>
    </div>
  );
};