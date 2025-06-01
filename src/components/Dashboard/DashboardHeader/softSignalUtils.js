// === Shared Utilities ---
const isValidData = (indicators, market) =>
  indicators && market && indicators.price != null;

// === Coinbase Pressure Analysis ---
export const assessCoinbasePressure = (coinbase) => {
  const spread = coinbase.BEST_ASK - coinbase.BEST_BID;
  const imbalance = coinbase.BEST_ASK_QUANTITY - coinbase.BEST_BID_QUANTITY;
  const volumeDiff = coinbase.CURRENT_HOUR_VOLUME_BUY - coinbase.CURRENT_HOUR_VOLUME_SELL;
  const lastTradeSide = coinbase.LAST_PROCESSED_TRADE_SIDE;

  let pressure = 'neutral';
  if (volumeDiff < -10 && imbalance > 0.5) pressure = 'selling';
  else if (volumeDiff > 10 && imbalance < -0.5) pressure = 'buying';

  return {
    spread,
    imbalance,
    volumeDiff,
    pressure,
    lastTradeSide,
  };
};

// === Main Detection Function ---
export const detectSoftSignals = (indicators, market) => {
  if (!isValidData(indicators, market)) {
    console.log('[SoftSignals] Invalid input data:', { indicators, market });
    return { type: 'none' };
  }

  const { price, trend, volume } = indicators;
  const pressure = (market.marketPressure || 'Neutral').replace(/_Market$/, '');

  const bollLower = indicators?.BollingerBands?.lower ?? null;
  const atr = indicators?.ATR ?? null;
  const priceBelowLowerBand = bollLower !== null && price < bollLower;

  console.log('[SoftSignals] Input Summary:', {
    price,
    trend,
    pressure,
    volume,
    priceBelowLowerBand,
    atr,
  });

  // === Soft Downtrend Signal ===
  const isSoftDowntrend =
    ['Downtrend', 'Sideways'].includes(trend) &&
    ['Selling_Pressure', 'Neutral'].includes(pressure) &&
    volume > 0 &&
    priceBelowLowerBand;

  if (isSoftDowntrend) {
    return {
      type: 'soft-downtrend',
      price,
      details: {
        priceBelowLowerBand,
        pressure,
        volume,
        atr: atr?.toFixed(2) || 'N/A',
      },
    };
  }

  // === Relaxed Neutral Signal ===
  const isRelaxedNeutral =
    ['Sideways', 'Uptrend', 'Downtrend'].includes(trend) &&
    ['Neutral', 'Mixed', 'Low', 'Balanced', 'Buying', 'Selling'].includes(pressure);

  if (isRelaxedNeutral) {
    console.log('[SoftSignals] Relaxed Neutral Triggered');
    return {
      type: 'neutral',
      price,
      details: {
        reason: 'Price trend is sideways or indecisive with no strong pressure',
        trend,
        marketPressure: pressure,
        volume,
      },
    };
  }

  return { type: 'none' };
};
