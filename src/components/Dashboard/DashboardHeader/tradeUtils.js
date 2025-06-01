export const handleSoftSignalAlert = (softSignalResult, indicators, price, createAlert, tradeState) => {
  if (!softSignalResult || !softSignalResult.type) return;

  if (softSignalResult.type === 'soft-downtrend' && tradeState.signalType !== 'SELL') {
    createAlert('info', '📉 Possible downtrend forming (early signal)', price, [
      `Price: $${price.toFixed(2)}`,
      `Condition: Price is below Bollinger Lower Band: ${softSignalResult.details.priceBelowLowerBand ? 'Yes' : 'No'}`,
      `Trend Summary: ${indicators.trendSummary || 'N/A'}`,
      `Market Pressure: ${softSignalResult.details.marketPressure}`,
      `ATR: ${softSignalResult.details.atr}`,
    ]);
  }

};


export const checkTradeProgress = (tradeState, currentPrice, createAlert, resetTradeState) => {
  const { active, signalType, entryPrice, takeProfit, stopLoss } = tradeState;
  if (!active || entryPrice === null) return;

  const isProfit = currentPrice >= takeProfit;
  const isLoss = currentPrice <= stopLoss;

  if (signalType === 'BUY' && (isProfit || isLoss)) {
    const type = isProfit ? 'success' : 'danger';
    const outcome = isProfit ? '🎯 Take Profit Reached' : '🚨 Stop Loss Triggered';
    const value = Math.abs(currentPrice - entryPrice);

    createAlert(type, outcome, currentPrice, [
      `${signalType} Trade Closed`,
      `Entry: $${entryPrice.toFixed(2)}`,
      `Exit: $${currentPrice.toFixed(2)}`,
      `${isProfit ? 'Profit' : 'Loss'}: $${value.toFixed(2)}`
    ]);

    resetTradeState();
  }
};

export const createTradeSignal = (signalType, price, indicators, setTradeState, createAlert) => {
  const OFFSET = 1109; // Consider making this dynamic or configurable
  const takeProfit = signalType === 'BUY' ? price + OFFSET : null;
  const stopLoss = signalType === 'BUY' ? price - OFFSET : null;

  setTradeState({ active: true, signalType, entryPrice: price, takeProfit, stopLoss });

  createAlert(
    signalType === 'BUY' ? 'bullish' : 'bearish',
    `BTC ${signalType} SIGNAL`,
    price,
    [
      `Entry Price: $${price.toFixed(2)}`,
      `Take Profit: $${takeProfit?.toFixed(2) || 'N/A'}`,
      `Stop Loss: $${stopLoss?.toFixed(2) || 'N/A'}`,
      `RSI: ${indicators.RSI?.toFixed(2) || 'N/A'}`, // Corrected indicator path
      `MACD Crossover: ${indicators.MACD?.crossover || 'N/A'}`, // Corrected indicator path
      `Volume Ratio: ${indicators.volumeRatio?.toFixed(4) || 'N/A'}`
    ]
  );
};

// Placeholder function - implement actual market analysis logic
export const analyzeMarketConditions = (indicators) => {
  // Analyze indicators (e.g., price, volume, trend, RSI, MACD, order book imbalance)
  // and return a summary of market conditions.
  // Example placeholder logic:
  const marketPressure = (indicators?.coinbase?.volumeBuy1h ?? 0) > (indicators?.coinbase?.volumeSell1h ?? 0) ? 'Buying' : 'Selling';
  const trendSummary = indicators?.trendSummary ?? 'Unknown';
  const regime = indicators?.regime ?? 'Unknown';

  return {
    marketPressure, // e.g., 'Buying', 'Selling', 'Balanced'
    trendSummary,   // e.g., 'Uptrend', 'Downtrend', 'Sideways'
    regime,         // e.g., 'Trending', 'Ranging'
    // Add other relevant market state indicators
  };
};

// Placeholder function - implement actual buy signal logic
export const shouldTriggerBuySignal = (indicators, market) => {
  // Determine if conditions are met to trigger a *strong* BUY signal
  // based on the extracted indicators and the market analysis.
  // This logic should be comprehensive and specific to your strategy.
  // Example placeholder logic (highly simplified):
  const isRSIBullish = (indicators?.RSI ?? 0) > 55;
  const isMACDBullishCrossover = indicators?.MACD?.crossover === 'bullish';
  const isUptrend = indicators?.trendSummary === 'Uptrend';
  const isBuyingPressure = market?.marketPressure === 'Buying';
  const hasVolumeConfirmation = (indicators?.volumeRatio ?? 0) > 1.2; // Example: volume higher than avg

  // This is a very basic placeholder example; replace with your actual signal logic
  const trigger = isRSIBullish && isMACDBullishCrossover && isUptrend && isBuyingPressure && hasVolumeConfirmation;

  return trigger;
};