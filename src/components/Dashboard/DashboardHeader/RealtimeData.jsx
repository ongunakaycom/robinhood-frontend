// RealtimeData.jsx
import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../../firebase';

const RealtimeData = ({ onData }) => {
  const [coinbaseData, setCoinbaseData] = useState(null);
  const [binanceData, setBinanceData] = useState(null);
  const [quantumData, setQuantumData] = useState(null);

  useEffect(() => {
    const coinbaseRef = ref(database, 'coinbase');
    const binanceRef = ref(database, 'binance_data');
    const quantumRef = ref(database, 'quantum');

    const unsubscribeCoinbase = onValue(coinbaseRef, (snapshot) => {
      setCoinbaseData(snapshot.val());
    }, (error) => {
      console.error(`❌ Coinbase read error: ${error?.message || error}`);
    });

    const unsubscribeBinance = onValue(binanceRef, (snapshot) => {
      setBinanceData(snapshot.val());
    }, (error) => {
      console.error(`❌ Binance read error: ${error?.message || error}`);
    });

    const unsubscribeQuantum = onValue(quantumRef, (snapshot) => {
      setQuantumData(snapshot.val());
    }, (error) => {
      console.error(`❌ Quantum read error: ${error?.message || error}`);
    });

    return () => {
      unsubscribeCoinbase();
      unsubscribeBinance();
      unsubscribeQuantum();
    };
  }, []); // Empty dependency array to subscribe only once

  useEffect(() => {
    if (coinbaseData && binanceData && quantumData) {
      try {
        const latestCoinbase = Object.values(coinbaseData || {}).sort().pop();
        const binanceMarketEntries = binanceData?.market_data || {};
        const binanceTAEntries = binanceData?.technical_analysis || {};

        // Find the latest key that exists in BOTH market_data and technical_analysis
        const binanceMarketKeys = Object.keys(binanceMarketEntries).sort();
        const binanceTAKeys = Object.keys(binanceTAEntries).sort();
        let latestBinanceKey = null;
        for (let i = binanceMarketKeys.length - 1; i >= 0; i--) {
          const key = binanceMarketKeys[i];
          if (binanceTAKeys.includes(key)) {
            latestBinanceKey = key;
            break;
          }
        }

        if (!latestBinanceKey) {
           // console.warn('⚠️ No matching timestamp key found in both Binance market and TA data.');
           // We might still want to process with partial data or wait.
           // For now, log and return if no core binance data is available.
           if (!latestCoinbase || !quantumData) {
             // Not enough data to form a useful structure
             console.warn('⚠️ Insufficient data received from Firebase streams.');
             return;
           }
           console.warn('⚠️ Using partial data due to missing latest Binance key.');
           // Proceed with available data if possible, maybe fill gaps with null/defaults
           const priceData = {
             open: parseFloat(latestCoinbase?.CURRENT_DAY_OPEN) || 0,
             high: parseFloat(latestCoinbase?.CURRENT_DAY_HIGH) || 0,
             low: parseFloat(latestCoinbase?.CURRENT_DAY_LOW) || 0,
             close: parseFloat(latestCoinbase?.LAST_PROCESSED_TRADE_PRICE) || 0,
             volume: parseFloat(latestCoinbase?.CURRENT_HOUR_VOLUME) || 0,
           };

            const mergedData = {
               timestamp: latestCoinbase?.timestamp || Date.now(), // Use coinbase timestamp or current
               priceData,
               technical_analysis: null, // Missing
               order_book: null, // Missing
               volume_avg: parseFloat(quantumData?.volume_avg) || 1,
               quantum: quantumData,
               coinbase: latestCoinbase
             };
             console.log('✅ Merged realtime data from Binance, Coinbase, and Quantum (Partial).', mergedData);
             onData(mergedData);
             return; // Stop processing the full case
        }


        const binanceMarket = binanceMarketEntries[latestBinanceKey];
        const binanceTA = binanceTAEntries[latestBinanceKey];

         if (!binanceMarket || !binanceTA || !latestCoinbase || !quantumData) {
            console.warn('⚠️ One or more critical data sources (Binance Market/TA, Coinbase, Quantum) are missing for the latest timestamp.');
            return; // Requires all core data points for reliable signals
         }


        const priceData = {
          open: parseFloat(latestCoinbase?.CURRENT_DAY_OPEN) || 0,
          high: parseFloat(latestCoinbase?.CURRENT_DAY_HIGH) || 0,
          low: parseFloat(latestCoinbase?.CURRENT_DAY_LOW) || 0,
          close: parseFloat(latestCoinbase?.LAST_PROCESSED_TRADE_PRICE) || 0,
          volume: parseFloat(latestCoinbase?.CURRENT_HOUR_VOLUME) || 0,
        };


        const mergedData = {
          timestamp: latestBinanceKey,
          priceData,
          technical_analysis: binanceTA,
          order_book: binanceMarket?.orderbook || {},
          volume_avg: parseFloat(quantumData?.volume_avg) || 1,
          quantum: quantumData, // Pass raw quantum data
          coinbase: latestCoinbase // Pass raw latest coinbase entry
        };

        console.log('✅ Merged realtime data from Binance, Coinbase, and Quantum.', mergedData);
        onData(mergedData);

      } catch (error) {
        console.error(`❌ Error processing streamed data: ${error?.message || error}`, error);
      }
    }
  }, [coinbaseData, binanceData, quantumData, onData]); // Re-run when any source data updates

  return null; // This component does not render anything itself
};

export default RealtimeData;