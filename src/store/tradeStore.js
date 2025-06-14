import { create } from 'zustand';

const useTradeStore = create((set) => ({
  preferredMarket: 'coinbase',
  preferredCoin: 'btcusd',
  setPreferredMarket: (market) => set({ preferredMarket: market }),
  setPreferredCoin: (coin) => set({ preferredCoin: coin }),
}));

export default useTradeStore;
