export interface Coin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
  sparkline: number[];
  market_cap: number;
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Transaction {
  id: string;
  coinId: string;
  amount: number;
  priceAtBuy: number;
  date: string;
  type: 'buy' | 'sell';
}

export interface BankAccount {
  id: string;
  bankName: string;
  lastFour: string;
  balance: number;
}

export type Currency = 'USD' | 'EUR' | 'JPY' | 'GBP' | 'INR';

export interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  favorites: string[]; // list of coin IDs
  portfolio: Transaction[];
  coins: Coin[];
  bankAccounts: BankAccount[];
}

export type NavigationTab = 'favorites' | 'market' | 'home' | 'buys' | 'profile';