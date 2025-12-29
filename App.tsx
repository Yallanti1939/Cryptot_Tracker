import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Favorites } from './pages/Favorites';
import { Market } from './pages/Market';
import { Buys } from './pages/Buys';
import { Profile } from './pages/Profile';
import { CoinDetail } from './pages/CoinDetail';
import { SplashScreen } from './components/SplashScreen';
import { AnimatePresence } from 'framer-motion';

const ProtectedRoute = ({ children }: React.PropsWithChildren) => {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Home />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="market" element={<Market />} />
        <Route path="buys" element={<Buys />} />
        <Route path="profile" element={<Profile />} />
        <Route path="coin/:id" element={<CoinDetail />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash for 3 seconds to ensure users see the high-quality animation
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <HashRouter>
      <AppProvider>
        <AnimatePresence mode="wait">
          {showSplash ? (
            <SplashScreen key="splash" />
          ) : (
            <AppRoutes key="app" />
          )}
        </AnimatePresence>
      </AppProvider>
    </HashRouter>
  );
};

export default App;