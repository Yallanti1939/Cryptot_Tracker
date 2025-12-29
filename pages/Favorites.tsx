import React from 'react';
import { useApp } from '../context/AppContext';
import { CryptoCard } from '../components/CryptoCard';
import { HeartOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Favorites: React.FC = () => {
  const { coins, favorites, toggleFavorite } = useApp();
  const navigate = useNavigate();

  const favoriteCoins = coins.filter(c => favorites.includes(c.id));

  if (favoriteCoins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
        <div className="bg-slate-800 p-6 rounded-full mb-4">
          <HeartOff size={48} className="text-slate-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">No Favorites Yet</h2>
        <p className="text-slate-400 mb-6">Add coins to your favorites list to track them here.</p>
        <button 
          onClick={() => navigate('/market')}
          className="bg-brand-primary px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
        >
          Browse Market
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {favoriteCoins.map(coin => (
        <CryptoCard 
          key={coin.id} 
          coin={coin} 
          isFavorite={true}
          onToggleFavorite={toggleFavorite}
        />
      ))}
    </div>
  );
};