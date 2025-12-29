import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Heart, TrendingUp, Home, ShoppingBag, User, Hexagon, ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getTitle = () => {
    if (location.pathname.startsWith('/coin/')) return 'Asset Details';
    switch(location.pathname) {
      case '/': return 'Home';
      case '/favorites': return 'Favorites';
      case '/market': return 'Market';
      case '/buys': return 'Portfolio';
      case '/profile': return 'Profile';
      default: return 'CryptoTracker';
    }
  };

  const isDetailPage = location.pathname.startsWith('/coin/');

  const pageVariants = {
    initial: { opacity: 0, y: 10, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.98 }
  };

  return (
    <div className="bg-brand-dark min-h-screen text-white font-sans selection:bg-brand-primary selection:text-white pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-brand-dark/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
         <div className="flex items-center gap-3">
           {isDetailPage && (
             <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors">
               <ArrowLeft size={24} />
             </button>
           )}
           <motion.h1 
             key={location.pathname}
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
           >
             {getTitle()}
           </motion.h1>
         </div>
         
         {/* App Logo */}
         <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 hidden sm:block">CRYPTO PRO</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Hexagon size={24} className="text-white fill-white/20" />
            </div>
         </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation - Hide on Detail Pages */}
      {!isDetailPage && (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 pb-safe pt-2 z-50">
          <div className="max-w-3xl mx-auto flex justify-around items-center px-2">
            
            <NavItem to="/favorites" icon={<Heart size={24} />} label="Favs" />
            <NavItem to="/market" icon={<TrendingUp size={24} />} label="Market" />
            
            {/* Main Home Button (Elevated) */}
            <div className="relative -top-5">
              <NavLink to="/" className={({ isActive }) => `
                  flex items-center justify-center w-14 h-14 rounded-full shadow-lg shadow-blue-500/40 transition-transform duration-200 active:scale-95
                  ${isActive ? 'bg-brand-primary text-white scale-110' : 'bg-slate-700 text-slate-300'}
              `}>
                <Home size={28} />
              </NavLink>
            </div>

            <NavItem to="/buys" icon={<ShoppingBag size={24} />} label="Buys" />
            <NavItem to="/profile" icon={<User size={24} />} label="Profile" />
          </div>
        </nav>
      )}
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `
    flex flex-col items-center justify-center p-2 rounded-xl w-16 transition-colors duration-200
    ${isActive ? 'text-brand-primary' : 'text-slate-500 hover:text-slate-300'}
  `}>
    <div className="mb-1">{icon}</div>
    <span className="text-[10px] font-medium">{label}</span>
  </NavLink>
);