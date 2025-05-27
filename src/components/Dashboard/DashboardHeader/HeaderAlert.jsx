import React, { useState, useEffect, useCallback } from 'react';
import { Dropdown, Badge } from 'react-bootstrap';
import { AiOutlineBell } from 'react-icons/ai';
import { ref, onValue } from 'firebase/database';
import { database } from '../../../firebase.js'; // Correct import
import './HeaderAlert.css';

// === Helper Functions ===
const checkTradeProgress = (tradeState, currentPrice, createAlert, resetTradeState) => {
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

const createTradeSignal = (signalType, price, indicators, setTradeState, createAlert) => {
  const OFFSET = 1109;
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
      `RSI: ${indicators.rsi?.toFixed(2) || 'N/A'}`,
      `MACD: ${indicators.macd_value?.toFixed(2) || 'N/A'}`
    ]
  );
};

// === Component ===
const HeaderAlert = ({ tradeState, setTradeState }) => {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAlerts, setShowAlerts] = useState(false);

  const notifyBrowser = (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  const createAlert = useCallback((type, message, price, details) => {
    const newAlert = {
      id: Date.now(),
      type,
      timestamp: new Date().toISOString(),
      price,
      message,
      details,
      read: false
    };
    setAlerts(prev => [newAlert, ...prev]);
    setUnreadCount(prev => prev + 1);
    notifyBrowser(message, `Price: $${price.toFixed(2)} (${type})`);
  }, []);

  const markAsRead = (id) => {
    setAlerts(prev => prev.map(alert => alert.id === id ? { ...alert, read: true } : alert));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
    setUnreadCount(0);
  };

  const resetTradeState = useCallback(() => {
    setTradeState({
      active: false,
      signalType: null,
      entryPrice: null,
      takeProfit: null,
      stopLoss: null
    });
  }, [setTradeState]);

  const calculateIndicators = (data) => {
    if (!data || data.length < 3) return null;
    const [market, prediction, indicators] = data;
    return {
      ...indicators,
      macdValue: prediction.macd_value,
      macdDiff: indicators.macd - indicators.macd_signal,
      price: market.price,
      ema21: prediction.ema21,
      macdCrossover: prediction.macd_crossover
    };
  };

  const analyzeOrderBook = (market) => {
    if (!market) return null;
    return {
      marketPressure: market.best_bid_quantity > market.best_ask_quantity ? "Buying_Pressure" : "Selling_Pressure",
      whaleSide: market.current_hour_volume_buy > market.current_hour_volume_sell ? "Whale_Buying" : "Whale_Selling"
    };
  };

  const checkForTradingSignals = useCallback((data) => {
    if (!data || data.length < 3) return;

    const indicators = calculateIndicators(data);
    const marketData = data[0];
    const orderBook = analyzeOrderBook(marketData);

    if (!indicators || !orderBook) return;

    if (tradeState.active) {
      checkTradeProgress(tradeState, indicators.price, createAlert, resetTradeState);
      return;
    }

    const rsiBearish = indicators.rsi < 42;
    const macdBearish = indicators.macdDiff < -0.05;
    const highVolatility = indicators.atr > (1.05 * (indicators.prev_atr || 0));
    const obvBearish = indicators.obv < indicators.prev_obv;
    const isOversold = rsiBearish && macdBearish && (highVolatility || obvBearish);
    const isBullishEngulfing = indicators.candlestick_pattern?.includes('bullish engulfing');

    if (isOversold && isBullishEngulfing &&
        orderBook.marketPressure === "Buying_Pressure" &&
        orderBook.whaleSide === "Whale_Buying") {
      createTradeSignal('BUY', indicators.price, indicators, setTradeState, createAlert);
    }
  }, [tradeState, createAlert, resetTradeState, setTradeState]);

  useEffect(() => {
    const mergedRef = ref(database, 'trading/mergedData');
    const TRIGGER_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
    let lastTriggerTime = 0;

    const unsubscribe = onValue(mergedRef, (snapshot) => {
      const mergedData = snapshot.val();
      if (!mergedData) return;

      const now = Date.now();
      if (
        now - lastTriggerTime >= TRIGGER_INTERVAL_MS &&
        mergedData.prediction_value &&
        mergedData.macd_value
      ) {
        checkForTradingSignals([mergedData, mergedData, mergedData]);
        lastTriggerTime = now;
      }
    }, (error) => {
      console.error('Firebase listener error:', error);
    });

    return () => unsubscribe();
  }, [checkForTradingSignals]);

  return (
    <Dropdown show={showAlerts} onToggle={setShowAlerts} className="me-3">
      <Dropdown.Toggle variant="transparent" className="dashboard-header-button position-relative">
        <AiOutlineBell size={24} />
        {unreadCount > 0 && (
          <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu align="end" className="p-2" style={{ width: '350px' }}>
        <div className="d-flex align-items-center mb-2">
          <div style={{ flex: 1 }}></div>
          <h6 className="mb-0 text-center flex-grow-0">BTC Trading Alerts</h6>
          <div style={{ flex: 1, textAlign: 'right' }}>
            {alerts.length > 0 && (
              <button className="btn btn-sm btn-link text-danger" onClick={clearAllAlerts}>
                Clear All
              </button>
            )}
          </div>
        </div>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {alerts.length === 0 ? (
            <div className="text-center py-3 text-muted">No alerts currently</div>
          ) : (
            alerts.map(alert => (
              <div
                key={alert.id}
                className={`alert alert-${alert.type} p-2 mb-2`}
                onClick={() => markAsRead(alert.id)}
                style={{ cursor: 'pointer', opacity: alert.read ? 0.7 : 1 }}
              >
                <div className="d-flex justify-content-between">
                  <strong>{alert.message}</strong>
                  <small className="text-muted">{new Date(alert.timestamp).toLocaleTimeString()}</small>
                </div>
                <div className="mt-1">
                  {alert.details.map((d, i) => (
                    <div key={i} className="small">{d}</div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default HeaderAlert;
