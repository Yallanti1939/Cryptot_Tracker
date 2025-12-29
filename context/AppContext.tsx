import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Coin, Transaction, BankAccount, Currency } from '../types';
import { MOCK_USER, INITIAL_COINS, MOCK_BANK_ACCOUNTS } from '../constants';

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  register: () => void;
  coins: Coin[];
  favorites: string[];
  toggleFavorite: (coinId: string) => void;
  portfolio: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  bankAccounts: BankAccount[];
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceInUsd: number) => string;
  fiatBalance: number;
  withdrawFunds: (amount: number) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock Conversion Rates (Base USD)
const CURRENCY_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  JPY: 150.5,
  GBP: 0.79,
  INR: 83.50,
};

const CURRENCY_LOCALES: Record<Currency, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  JPY: 'ja-JP',
  GBP: 'en-GB',
  INR: 'en-IN',
};

export const AppProvider = ({ children }: React.PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [coins, setCoins] = useState<Coin[]>(INITIAL_COINS);
  const [favorites, setFavorites] = useState<string[]>(['bitcoin', 'solana']);
  const [portfolio, setPortfolio] = useState<Transaction[]>([
    { id: 't1', coinId: 'bitcoin', amount: 0.05, priceAtBuy: 55000, date: '2023-11-15', type: 'buy' },
    { id: 't2', coinId: 'ethereum', amount: 1.5, priceAtBuy: 2800, date: '2024-01-10', type: 'buy' }
  ]);
  const [bankAccounts] = useState<BankAccount[]>(MOCK_BANK_ACCOUNTS);
  
  // Initialize currency from localStorage
  const [currency, _setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem('preferred_currency');
    const validCurrencies: Currency[] = ['USD', 'EUR', 'JPY', 'GBP', 'INR'];
    if (saved && validCurrencies.includes(saved as Currency)) {
      return saved as Currency;
    }
    return 'USD';
  });

  const [fiatBalance, setFiatBalance] = useState<number>(12450.00); // Mock starting balance

  // Simulate Real-time Price Updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins(currentCoins => 
        currentCoins.map(coin => {
          const volatility = 0.005; // 0.5% max change
          const change = 1 + (Math.random() * volatility * 2 - volatility);
          const newPrice = coin.current_price * change;
          
          // Update sparkline
          const newSparkline = [...coin.sparkline.slice(1), newPrice];
          
          return {
            ...coin,
            current_price: newPrice,
            sparkline: newSparkline,
            price_change_percentage_24h: coin.price_change_percentage_24h + (Math.random() * 0.2 - 0.1)
          };
        })
      );
    }, 5000); 

    return () => clearInterval(interval);
  }, []);

  const login = () => {
    setUser(MOCK_USER);
    setIsAuthenticated(true);
  };

  const register = () => {
    setUser(MOCK_USER);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const toggleFavorite = (coinId: string) => {
    setFavorites(prev => 
      prev.includes(coinId) 
        ? prev.filter(id => id !== coinId) 
        : [...prev, coinId]
    );
  };

  const addTransaction = (transaction: Transaction) => {
    setPortfolio(prev => [transaction, ...prev]);
  };

  // Wrapper to persist currency selection
  const setCurrency = (newCurrency: Currency) => {
    _setCurrency(newCurrency);
    localStorage.setItem('preferred_currency', newCurrency);
  };

  const formatPrice = (priceInUsd: number): string => {
    const rate = CURRENCY_RATES[currency];
    const convertedPrice = priceInUsd * rate;
    return new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(convertedPrice);
  };

  const withdrawFunds = (amount: number): boolean => {
    if (amount > fiatBalance) return false;
    setFiatBalance(prev => prev - amount);
    return true;
  };

  return (
    <AppContext.Provider value={{
      user,
      isAuthenticated,
      login,
      logout,
      register,
      coins,
      favorites,
      toggleFavorite,
      portfolio,
      addTransaction,
      bankAccounts,
      currency,
      setCurrency,
      formatPrice,
      fiatBalance,
      withdrawFunds
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};