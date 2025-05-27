// src/utils/tradeUtils.js
export const checkTradeProgress = (tradeState, currentPrice, createAlert, resetTradeState) => {
  const { active, signalType, entryPrice, takeProfit, stopLoss } = tradeState;
  if (!active || entryPrice === null) return;

  const isProfit = currentPrice >= takeProfit;
  const isLoss = currentPrice <= stopLoss;

  if (signalType === 'BUY' && (isProfit || isLoss)) {
    const type = isProfit ? 'success' : 'danger';
    const outcome = isProfit ? '🎯 Take Profit Reached' : '🚨 Stop Loss Triggered';
    const value = isProfit ? (currentPrice - entryPrice) : (entryPrice - currentPrice);

    createAlert(type, outcome, currentPrice, [
      `${signalType} Trade Closed`,
      `Entry: $${entryPrice.toFixed(2)}`,
      `Exit: $${currentPrice.toFixed(2)}`,
      `${isProfit ? 'Profit' : 'Loss'}: $${value.toFixed(2)}`,
    ]);

    resetTradeState();
  }
};

export const createTradeSignal = (signalType, price, marketData, setTradeState, createAlert) => {
  const OFFSET = 1109;
  const takeProfit = signalType === 'BUY' ? price + OFFSET : null;
  const stopLoss = signalType === 'BUY' ? price - OFFSET : null;

  setTradeState({
    active: true,
    signalType,
    entryPrice: price,
    takeProfit,
    stopLoss,
  });

  createAlert(
    signalType === 'BUY' ? 'bullish' : 'bearish',
    `BTC ${signalType} SIGNAL`,
    price,
    [
      `Entry Price: $${price.toFixed(2)}`,
      `Take Profit: $${takeProfit.toFixed(2)}`,
      `Stop Loss: $${stopLoss.toFixed(2)}`,
      `RSI: ${marketData.rsi?.toFixed(2) || 'N/A'}`,
      `MACD: ${marketData.macd_value?.toFixed(2) || 'N/A'}`,
    ]
  );
};
