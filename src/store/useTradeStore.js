// src/stores/useTradeStore.js
import { create } from 'zustand';

const useTradeStore = create((set) => ({
    tradeState: {
    active: false,
    signalType: 'neutral', // was null
    entryPrice: null,
    takeProfit: null,
    stopLoss: null,
  },
  setTradeState: (newState) => set({ tradeState: newState }),
  resetTradeState: () =>
    set({
      tradeState: {
        active: false,
        signalType: 'neutral',
        entryPrice: null,
        takeProfit: null,
        stopLoss: null,
      },
    }),
}));

export default useTradeStore;
