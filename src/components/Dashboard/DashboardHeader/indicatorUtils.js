export const extractIndicatorsFromNewSchema = (data) => {
  // Ensure core data sources are present before proceeding
  if (!data?.priceData || !data?.technical_analysis || !data?.order_book) {
    // Added a more specific warning for debugging input data issues
    console.warn("Missing essential data for indicator extraction. priceData:", !!data?.priceData, "technical_analysis:", !!data?.technical_analysis, "order_book:", !!data?.order_book, "Returning null.");
    return null;
  }

  const ta = data.technical_analysis;
  const quantum = data.quantum; // Optional source
  const coinbase = data.coinbase; // Optional source
  const priceData = data.priceData;
  const order_book = data.order_book;

  // --- Basic Price/Volume(from priceData and ta) ---
  const { close: price, volume = 0 } = priceData;
  const normalizedVolume = volume;
  const avgVolume = ta?.volume_avg || 1; // Default to 1 to prevent division by zero
  const volumeRatio = avgVolume > 0 ? volume / avgVolume : 0; // Calculate safely

  // OHL C derived from priceData - Ensure all components are explicitly extracted/defaulted
  const ohlc = priceData ? {
    open: priceData.open ?? null,
    high: priceData.high ?? null,
    low: priceData.low ?? null,
    close: priceData.close ?? null,
  } : null;

  // --- Technical Analysis Indicators ---
  // Prioritizing Quantum where overlap exists for fields used elsewhere (like soft signals)
  const ATR = quantum?.indicators?.ATR ?? ta?.indicators?.ATR ?? null;
  const MACD = { // Use Quantum MACD structure as it contains 'crossover'
    crossover: quantum?.indicators?.MACD?.crossover ?? null,
    histogram: quantum?.indicators?.MACD?.histogram ?? null,
  };
  const RSI = quantum?.indicators?.RSI ?? ta?.indicators?.RSI ?? null;
  const BollingerBands = ta?.indicators?.BollingerBands ?? null; // Only in TA

  // --- Trend & Regime ---
  // Use 'trend' key for consistency with soft signal log
  const trend = ta?.trend ?? 'Unknown'; // Primary trend from TA
  const trendStrength = quantum?.trend_strength ?? null; // Strength from Quantum
  const regime = quantum?.market_regime?.type ?? null; // Regime type from Quantum

  // --- EMAs (only in Quantum) ---
  const ema = {
    ema13: quantum?.indicators?.ema13 ?? null,
    ema13_slope: quantum?.indicators?.ema13_slope ?? null,
    ema21: quantum?.indicators?.ema21 ?? null,
    ema21_slope: quantum?.indicators?.ema21_slope ?? null,
    ema26: quantum?.indicators?.ema26 ?? null,
    ema26_slope: quantum?.indicators?.ema26_slope ?? null,
  };

  // --- Candlestick Pattern (from TA) ---
  const candlestickPattern = ta?.candle_pattern ?
    (ta.candle_pattern.toLowerCase().includes("bullish") ? "bullish_engulfing" :
     ta.candle_pattern.toLowerCase().includes("bearish") ? "bearish_engulfing" : null)
    : null;

  // --- Order Book Data ---
  const bids = order_book.bids || []; // Default to empty array
  const asks = order_book.asks || []; // Default to empty array

  // --- Coinbase Specific Data ---
  const coinbaseData = coinbase ?
    {
      bestBid: coinbase.BEST_BID ?? null,
      bestBidQty: coinbase.BEST_BID_QUANTITY ?? null,
      bestAsk: coinbase.BEST_ASK ?? null,
      bestAskQty: coinbase.BEST_ASK_QUANTITY ?? null,
      lastTradePrice: coinbase.LAST_PROCESSED_TRADE_PRICE ?? null,
      lastTradeQty: coinbase.LAST_PROCESSED_TRADE_QUANTITY ?? null,
      lastTradeSide: coinbase.LAST_PROCESSED_TRADE_SIDE ?? null,
      quoteVol1h: coinbase.CURRENT_HOUR_QUOTE_VOLUME ?? null,
      volumeBuy1h: coinbase.CURRENT_HOUR_VOLUME_BUY ?? null,
      volumeSell1h: coinbase.CURRENT_HOUR_VOLUME_SELL ?? null,
      volumeBuy24h: coinbase.MOVING_24_HOUR_VOLUME_BUY ?? null,
      volumeSell24h: coinbase.MOVING_24_HOUR_VOLUME_SELL ?? null,
      quoteVol24h: coinbase.MOVING_24_HOUR_QUOTE_VOLUME ?? null,
    } : null;

  // --- Derived/Calculated Fields ---
  const priceBelowLowerBand = (price !== null && BollingerBands?.lower !== null)
    ? (price < BollingerBands.lower)
    : false;

  // Simple Pressure calculation (example based on 1h Coinbase volume)
  const buyVolume1h = coinbaseData?.volumeBuy1h ?? 0;
  const sellVolume1h = coinbaseData?.volumeSell1h ?? 0;
  const totalVolume1h = buyVolume1h + sellVolume1h;
  const pressure = totalVolume1h > 0
    ? (buyVolume1h / totalVolume1h > 0.55 ? 'Buying' : sellVolume1h / totalVolume1h > 0.55 ? 'Selling' : 'Balanced')
    : 'Unknown';

  const extracted = {
    // Basic Price/Volume
    price,
    volume: normalizedVolume,
    avgVolume, // Average volume from TA
    volumeRatio, // Volume / Avg Volume

    // OHL C structure (matches soft signal input log keys)
    ohlc,

    // Technical Analysis Indicators
    candlestickPattern,
    trend,   
    BollingerBands,
    // Quantum Indicators
    ATR, // Matches 'atr' key in soft signal log
    MACD, // Nested structure
    RSI,
    ema, // Nested structure
    trendStrength, // Matches 'trendStrength' key in soft signal log
    regime,

    // Derived/Calculated
    pressure, // Matches 'pressure' key in soft signal log
    priceBelowLowerBand, // Matches 'priceBelowLowerBand' key in soft signal log

    // Order Book
    bids,
    asks,

    // Coinbase Specific Data
    coinbase: coinbaseData,

    // Include raw priceData if needed
    priceData,
  };

  // Add a log here to inspect the object *immediately* after extraction
  console.log("Extracted Indicators (Debug Log):", extracted);


  return extracted;
};