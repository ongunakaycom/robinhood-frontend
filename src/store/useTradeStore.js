// src/stores/useTradeStore.js
import { create } from 'zustand';

const useTradeStore = create((set) => ({
  tradeState: {
    active: false,
    signalType: null,
    entryPrice: null,
    takeProfit: null,
    stopLoss: null,
  },
  setTradeState: (newState) => set({ tradeState: newState }),
  resetTradeState: () =>
    set({
      tradeState: {
        active: false,
        signalType: null,
        entryPrice: null,
        takeProfit: null,
        stopLoss: null,
      },
    }),
}));

export default useTradeStore;
