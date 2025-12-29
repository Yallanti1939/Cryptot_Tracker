import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Brush } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity, DollarSign, BarChart3, Clock, Wallet, Maximize2, Minimize2, X, Share2, Check, TrendingUp, TrendingDown, Sparkles, BrainCircuit, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPricePrediction, PredictionData } from '../services/geminiService';

export const CoinDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { coins, formatPrice, toggleFavorite, favorites } = useApp();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(true);

  const coin = coins.find(c => c.id === id);

  useEffect(() => {
    if (coin) {
      setLoadingPrediction(true);
      getPricePrediction(coin).then(data => {
        setPrediction(data);
        setLoadingPrediction(false);
      });
    }
  }, [id]);

  if (!coin) {
    return <div className="p-4 text-center text-slate-400">Coin not found</div>;
  }

  const isPositive = coin.price_change_percentage_24h >= 0;
  const chartColor = isPositive ? '#10b981' : '#ef4444';

  const chartData = coin.sparkline.map((val, i) => {
    const hoursAgo = (coin.sparkline.length - 1 - i) * 4;
    const now = new Date();
    const dateAtPoint = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    
    const prevVal = i > 0 ? coin.sparkline[i - 1] : val;
    const change = val - prevVal;
    const changePct = prevVal !== 0 ? (change / prevVal) * 100 : 0;
    
    return {
      timeIndex: i,
      price: val,
      change,
      changePct,
      relativeTime: hoursAgo === 0 ? 'Now' : `${hoursAgo}h ago`,
      fullTime: dateAtPoint.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: dateAtPoint.toLocaleDateString([], { month: 'short', day: 'numeric' })
    };
  });

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const handleShare = async () => {
    const shareData = {
      title: `${coin.name} (${coin.symbol.toUpperCase()}) - CryptoTracker Pro`,
      text: `Check out ${coin.name} at ${formatPrice(coin.current_price)} on CryptoTracker Pro!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  const handleTrade = (type: 'buy' | 'sell') => {
    navigate('/buys', { state: { coinId: coin.id, type } });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const pointIsPositive = data.change >= 0;
      
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-slate-900/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl ring-1 ring-white/5 min-w-[180px]"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-1">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Timestamp</span>
                <span className="text-xs font-bold text-white">{data.fullTime}, {data.date}</span>
              </div>
              <span className="text-[10px] bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded-full font-bold">
                {data.relativeTime}
              </span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-white">{formatPrice(data.price)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${pointIsPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {pointIsPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{pointIsPositive ? '+' : ''}{data.changePct.toFixed(2)}%</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium italic">vs prev. point</span>
            </div>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 relative pb-24">
      {/* Header Info */}
      <motion.div 
        animate={{ 
          opacity: isExpanded ? 0 : 1,
          y: isExpanded ? -20 : 0,
          scale: isExpanded ? 0.95 : 1
        }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <img src={coin.image} alt={coin.name} className="w-16 h-16 rounded-full shadow-lg" />
          <div>
            <h2 className="text-3xl font-bold text-white">{coin.name}</h2>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium tracking-widest">{coin.symbol.toUpperCase()}</span>
              <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300">Rank #1</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-2xl font-bold text-white tracking-wide">{formatPrice(coin.current_price)}</p>
            <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
               {isPositive ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
               <span className="font-bold">{Math.abs(coin.price_change_percentage_24h).toFixed(2)}%</span>
            </div>
          </div>
          
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="bg-slate-800/60 hover:bg-slate-700/80 p-2.5 rounded-xl border border-white/10 text-slate-300 transition-colors shadow-lg flex items-center gap-2"
            >
              {copied ? <Check size={18} className="text-green-400" /> : <Share2 size={18} />}
              <span className="text-xs font-bold uppercase tracking-tight pr-1">Share</span>
            </motion.button>
            <AnimatePresence>
              {copied && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-brand-primary text-[10px] font-bold py-1 px-2 rounded-lg text-white shadow-xl z-20"
                >
                  COPIED!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Chart Layout Container */}
      <div className="relative">
        {/* Invisible placeholder for layout stability when fixed */}
        <div className="h-[420px] w-full invisible pointer-events-none" aria-hidden="true" />
        
        <motion.div 
          layout
          transition={{
            layout: { type: "spring", stiffness: 300, damping: 30, mass: 1 },
            opacity: { duration: 0.2 }
          }}
          className={`
            bg-slate-900 border border-white/5 shadow-2xl overflow-hidden transition-all duration-300
            ${isExpanded ? 'fixed inset-0 z-[100] rounded-none' : 'absolute top-0 left-0 w-full h-[420px] rounded-3xl'}
          `}
        >
          {/* Chart Controls */}
          <div className={`absolute top-4 right-4 z-[110] flex gap-2 ${isExpanded ? 'mt-4 mr-4' : ''}`}>
            <motion.button 
               layout
               onClick={toggleExpand}
               className="bg-slate-700/50 hover:bg-slate-600 p-2.5 rounded-xl text-white backdrop-blur-md transition-colors border border-white/5"
               title={isExpanded ? "Minimize Graph" : "Maximize Graph"}
            >
              {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </motion.button>
            {isExpanded && (
               <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={toggleExpand}
                  className="bg-red-500/20 hover:bg-red-500 hover:text-white p-2.5 rounded-xl text-red-500 backdrop-blur-md transition-colors border border-red-500/20"
               >
                  <X size={20} />
               </motion.button>
            )}
          </div>

          <motion.div 
            layout
            className={`absolute top-4 left-4 z-[110] flex gap-2 ${isExpanded ? 'mt-8 ml-8' : ''}`}
          >
             {['1H', '1D', '1W', '1M', '1Y'].map((tf, i) => (
               <button key={tf} className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${i === 1 ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>
                 {tf}
               </button>
             ))}
          </motion.div>

          <motion.div 
            layout
            className={`w-full h-full p-4 ${isExpanded ? 'pt-32 px-6 sm:px-12 pb-12' : 'pt-16'}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis 
                  dataKey="fullTime" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }} 
                  minTickGap={40}
                  dy={10}
                />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ stroke: chartColor, strokeWidth: 1.5, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke={chartColor} 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  animationDuration={1500}
                  activeDot={{ 
                    r: 6, 
                    fill: chartColor, 
                    stroke: '#fff', 
                    strokeWidth: 2,
                    className: "animate-pulse" 
                  }}
                />
                <Brush 
                   dataKey="timeIndex" 
                   height={40} 
                   stroke={chartColor}
                   fill="#0f172a"
                   tickFormatter={() => ''}
                   travellerWidth={12}
                   gap={1}
                >
                  <AreaChart>
                    <Area dataKey="price" stroke={chartColor} fill={chartColor} fillOpacity={0.1} />
                  </AreaChart>
                </Brush>
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </motion.div>
      </div>

      {/* AI Prediction Section */}
      <motion.div 
        animate={{ 
          opacity: isExpanded ? 0 : 1, 
          y: isExpanded ? 40 : 0,
          scale: isExpanded ? 0.9 : 1
        }}
        transition={{ duration: 0.4, delay: isExpanded ? 0 : 0.1, ease: [0.4, 0, 0.2, 1] }}
        className="bg-slate-800/40 backdrop-blur-xl border border-brand-primary/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-brand-primary/10 transition-colors duration-700"></div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-brand-primary/20 p-2 rounded-xl text-brand-primary">
              <BrainCircuit size={20} />
            </div>
            <h3 className="font-bold text-white tracking-tight">AI Price Prediction (24h)</h3>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-900/50 border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-400 tracking-tighter uppercase">Gemini Intelligence</span>
          </div>
        </div>

        {loadingPrediction ? (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
             <Sparkles className="text-brand-primary animate-spin" size={32} />
             <p className="text-xs font-semibold text-slate-500 animate-pulse tracking-widest uppercase">Calculating Trajectory...</p>
          </div>
        ) : prediction ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Expected Sentiment</span>
                <div className={`flex items-center gap-2 text-xl font-black ${prediction.sentiment.toLowerCase().includes('bull') ? 'text-green-400' : prediction.sentiment.toLowerCase().includes('bear') ? 'text-red-400' : 'text-slate-200'}`}>
                  {prediction.sentiment.toLowerCase().includes('bull') ? <TrendingUp size={24} /> : prediction.sentiment.toLowerCase().includes('bear') ? <TrendingDown size={24} /> : <Activity size={24} />}
                  {prediction.sentiment}
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">AI Confidence</span>
                <div className="flex items-center gap-2">
                   <span className="text-xl font-black text-white">{prediction.confidence}%</span>
                   <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${prediction.confidence}%` }}
                        className="h-full bg-brand-primary"
                      />
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Target Range</p>
              <p className="text-lg font-bold text-slate-200 mb-3">{prediction.predictionRange}</p>
              <div className="h-px bg-white/5 w-full mb-3" />
              <div className="flex gap-3">
                <div className="p-1.5 bg-brand-primary/10 rounded-lg h-fit">
                  <Sparkles size={16} className="text-brand-primary" />
                </div>
                <p className="text-sm text-slate-300 italic leading-relaxed">
                  "{prediction.reasoning}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
               <ShieldAlert size={14} className="text-yellow-500" />
               <p className="text-[10px] text-yellow-500 font-medium">Predictions are based on algorithmic trends and are not financial advice.</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500">
            <p className="text-sm">Unable to generate prediction at this time.</p>
          </div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        animate={{ 
          opacity: isExpanded ? 0 : 1,
          y: isExpanded ? 60 : 0,
          scale: isExpanded ? 0.9 : 1
        }}
        transition={{ duration: 0.4, delay: isExpanded ? 0.05 : 0.05, ease: [0.4, 0, 0.2, 1] }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="bg-slate-800/40 border border-white/5 p-4 rounded-2xl">
           <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
             <Activity size={16} />
             <span>Market Cap</span>
           </div>
           <p className="text-white font-bold text-lg">{formatPrice(coin.market_cap)}</p>
        </div>
        <div className="bg-slate-800/40 border border-white/5 p-4 rounded-2xl">
           <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
             <BarChart3 size={16} />
             <span>Volume (24h)</span>
           </div>
           <p className="text-white font-bold text-lg">{formatPrice(coin.market_cap * 0.05)}</p>
        </div>
        <div className="bg-slate-800/40 border border-white/5 p-4 rounded-2xl">
           <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
             <Clock size={16} />
             <span>All Time High</span>
           </div>
           <p className="text-white font-bold text-lg">{formatPrice(coin.current_price * 1.4)}</p>
        </div>
        <div className="bg-slate-800/40 border border-white/5 p-4 rounded-2xl">
           <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
             <Wallet size={16} />
             <span>Circulating Supply</span>
           </div>
           <p className="text-white font-bold text-lg">19.2M {coin.symbol.toUpperCase()}</p>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        animate={{ 
          opacity: isExpanded ? 0 : 1,
          y: isExpanded ? 100 : 0,
          pointerEvents: isExpanded ? 'none' : 'auto' 
        }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 z-40"
      >
        <div className="max-w-3xl mx-auto flex gap-4">
           <button 
             onClick={() => handleTrade('buy')}
             className="flex-1 bg-green-600 hover:bg-green-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-900/20 transition-all active:scale-95"
           >
             Buy {coin.symbol.toUpperCase()}
           </button>
           <button 
             onClick={() => handleTrade('sell')}
             className="flex-1 bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-red-900/20 transition-all active:scale-95"
           >
             Sell {coin.symbol.toUpperCase()}
           </button>
        </div>
      </motion.div>
    </div>
  );
};