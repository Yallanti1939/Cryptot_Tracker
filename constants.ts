import { Coin, User, BankAccount } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Crypto',
  email: 'alex@example.com',
  avatar: 'https://picsum.photos/200/200',
};

export const MOCK_BANK_ACCOUNTS: BankAccount[] = [
  { id: 'b1', bankName: 'Chase', lastFour: '4242', balance: 15000.50 },
  { id: 'b2', bankName: 'Wells Fargo', lastFour: '8899', balance: 2500.00 },
];

export const INITIAL_COINS: Coin[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    current_price: 64231.45,
    price_change_percentage_24h: 2.4,
    image: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    sparkline: [62000, 62500, 61800, 63000, 63500, 64231],
    market_cap: 1200000000000,
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    current_price: 3452.12,
    price_change_percentage_24h: 1.2,
    image: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    sparkline: [3300, 3350, 3320, 3400, 3420, 3452],
    market_cap: 400000000000,
  },
  {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    current_price: 145.67,
    price_change_percentage_24h: -5.4,
    image: 'https://cryptologos.cc/logos/solana-sol-logo.png',
    sparkline: [155, 154, 150, 148, 146, 145],
    market_cap: 65000000000,
  },
  {
    id: 'ripple',
    symbol: 'xrp',
    name: 'XRP',
    current_price: 0.62,
    price_change_percentage_24h: 0.5,
    image: 'https://cryptologos.cc/logos/xrp-xrp-logo.png',
    sparkline: [0.60, 0.61, 0.61, 0.62, 0.61, 0.62],
    market_cap: 34000000000,
  },
  {
    id: 'cardano',
    symbol: 'ada',
    name: 'Cardano',
    current_price: 0.45,
    price_change_percentage_24h: -1.2,
    image: 'https://cryptologos.cc/logos/cardano-ada-logo.png',
    sparkline: [0.46, 0.46, 0.45, 0.45, 0.44, 0.45],
    market_cap: 16000000000,
  },
  {
    id: 'dogecoin',
    symbol: 'doge',
    name: 'Dogecoin',
    current_price: 0.16,
    price_change_percentage_24h: 8.5,
    image: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
    sparkline: [0.14, 0.14, 0.15, 0.15, 0.16, 0.16],
    market_cap: 23000000000,
  },
  {
    id: 'polkadot',
    symbol: 'dot',
    name: 'Polkadot',
    current_price: 7.23,
    price_change_percentage_24h: -2.1,
    image: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png',
    sparkline: [7.5, 7.4, 7.3, 7.3, 7.2, 7.23],
    market_cap: 10000000000,
  },
];