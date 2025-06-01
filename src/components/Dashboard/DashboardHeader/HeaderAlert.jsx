import React, { useState, useCallback } from 'react';
import { Dropdown, Badge } from 'react-bootstrap';
import { AiOutlineBell } from 'react-icons/ai';
import { useTranslation } from 'react-i18next';

import './HeaderAlert.css';
import useTradeStore from '../../../store/useTradeStore.js';
import RealtimeData from './RealtimeData';
import Alert from '../../Alert/Alert';

import { detectSoftSignals } from './softSignalUtils';
import { extractIndicatorsFromNewSchema } from './indicatorUtils';

import {
  checkTradeProgress,
  createTradeSignal,
  analyzeMarketConditions,
  shouldTriggerBuySignal,
  handleSoftSignalAlert,
} from './tradeUtils';

const HeaderAlert = () => {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAlerts, setShowAlerts] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [marketCondition, setMarketCondition] = useState(null);

  

  const { tradeState, setTradeState } = useTradeStore();
  const { t } = useTranslation();

  const createAlert = useCallback((type, message, price, details) => {
    const timestamp = new Date().toISOString();
    const newAlert = {
      id: Date.now() + Math.random(),
      type,
      timestamp,
      price,
      message,
      details,
      read: false,
    };

    setAlerts(prev => {
      const exists = prev.some(a =>
        a.message === newAlert.message &&
        a.price === newAlert.price &&
        (Date.now() - new Date(a.timestamp).getTime()) < 60000
      );
      return exists ? prev : [newAlert, ...prev].slice(0, 50);
    });

    setUnreadCount(prev => prev + 1);
  }, []);

  const markAsRead = id => {
    setAlerts(prev =>
      prev.map(alert => alert.id === id ? { ...alert, read: true } : alert)
    );
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
      stopLoss: null,
    });
  }, [setTradeState]);

  const checkForTradingSignals = useCallback((data) => {
    if (!data || !data.priceData || !data.technical_analysis || !data.order_book || !data.quantum || !data.coinbase || data.priceData.close == null) {
      return;
    }

    const indicators = extractIndicatorsFromNewSchema(data);
    const market = analyzeMarketConditions(indicators);
    setMarketCondition(market?.marketPressure || 'unknown');
    const price = indicators.price;
    setCurrentPrice(price);

    if (tradeState.active) {
      checkTradeProgress(tradeState, price, createAlert, resetTradeState);
    }

    if (!tradeState.active && shouldTriggerBuySignal(indicators, market)) {
      createTradeSignal('BUY', price, indicators, setTradeState, createAlert);
      return;
    }

    const quantum = data.quantum;
    const coinbase = data.coinbase;
    const rsi = quantum?.indicators?.rsi || 0;
    const macd = quantum?.indicators?.macdCrossover;
    const momentum = quantum?.indicators?.momentum;
    

    if (tradeState.signalType !== 'SELL' && macd === 'bullish' && rsi > 50 && momentum === 'rising') {
      createAlert('soft-uptrend', '📈 Possible uptrend forming (early signal)', price, [
        `Price: ${price.toFixed(2)} USDT`,
        `RSI: ${rsi.toFixed(2)}`,
        `MACD: ${macd}`,
        `Momentum: ${momentum}`,
        `Spread: ${coinbase?.spread ?? 'N/A'}`,
        `Volume Ratio: ${indicators.volumeRatio?.toFixed(4) ?? 'N/A'}`,
        `Market Pressure: ${market.marketPressure}`,
      ]);
      return;
    }

    const softSignalResult = detectSoftSignals(indicators, market);
    handleSoftSignalAlert(softSignalResult, indicators, price, createAlert, tradeState);

    // Removed explicit creation of neutral alert
  }, [tradeState, createAlert, resetTradeState, setTradeState]);

  return (
    <>
      <RealtimeData onData={checkForTradingSignals} />

      <Dropdown show={showAlerts} onToggle={setShowAlerts} className="me-3">
        <Dropdown.Toggle variant="transparent" className="dashboard-header-button position-relative">
          <AiOutlineBell size={24} />
          {unreadCount > 0 && (
            <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">
              {unreadCount}
            </Badge>
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu align="end" className="p-3 alert-dropdown" style={{ width: 350 }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0 text-center flex-grow-1">{t('alerts.title')}</h6>
            {alerts.length > 0 && (
              <button type="button" className="btn btn-sm btn-link text-danger ms-2" onClick={clearAllAlerts}>
                {t('alerts.clearAll')}
              </button>
            )}
          </div>

          <div className="alert-list">
           {alerts.length === 0 ? (
              <div className="text-center py-3 text-muted">
                {currentPrice !== null ? `Price: ${currentPrice.toFixed(2)} USDT` : 'Fetching price...'}
                <br />
                {marketCondition && `${t('alerts.marketCondition')}: ${marketCondition.charAt(0).toUpperCase() + marketCondition.slice(1)}`}
                <br />
                {t('alerts.noAlerts')}
              </div>
            ) : (
              alerts.map(alert => (
                <Alert
                  key={alert.id}
                  type={alert.type}
                  message={alert.message}
                  details={alert.details}
                  timestamp={alert.timestamp}
                  read={alert.read}
                  onClick={() => markAsRead(alert.id)}
                />
              ))
            )}
          </div>
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};

export default HeaderAlert;
