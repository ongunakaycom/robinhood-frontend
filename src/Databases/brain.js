const API_URL = "https://deep-seek-chat-bot-python.onrender.com";

/**
 * Send user message to chatbot backend for given market/coin.
 * Defaults to coinbase/btcusd if not specified.
 * 
 * @param {string} message - user input message
 * @param {string} [market='coinbase']
 * @param {string} [coin='btcusd']
 * @returns {Promise<string>} chatbot response text
 */
export const sendMessageToChatbot = async (message, market = 'coinbase', coin = 'btcusd') => {
  try {
    const url = `${API_URL}/${market}/${coin}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request: message }),
    });

    const text = await response.text(); // get raw text first

    if (!response.ok) {
      console.error('Backend error:', response.status, text);
      throw new Error(`Backend responded with status ${response.status}`);
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (jsonErr) {
      console.error('JSON parse error:', jsonErr, 'Response text:', text);
      throw new Error('Failed to parse backend JSON');
    }

    // Check for error fields anywhere expected
    if (data.error) {
      return data.error;
    }
    if (data.data?.analysis?.error) {
      return data.data.analysis.error;
    }

    // Try different response formats
    if (data.data?.analysis?.raw_response) {
      return data.data.analysis.raw_response;
    }

    // Check if analysis object exists and format it
    if (data.data?.analysis) {
      const analysis = data.data.analysis;
      const signals = data.data.signals;
      
      return `🏹 **ROBIN HOOD CRYPTO ANALYSIS** 🏹

🎯 **Signal:** ${analysis.signal_direction || signals?.mathematical_signal || 'N/A'}
📈 **Current Price:** $${(analysis.current_price || signals?.current_price)?.toLocaleString() || 'N/A'}
📊 **Price Change:** ${(analysis.price_change || signals?.price_change_percent)?.toFixed(2) || 'N/A'}%
🔥 **Confidence:** ${(analysis.confidence_level || signals?.signal_confidence || 0).toFixed(2) || 'N/A'}%

📋 **Technical Summary:** ${analysis.technical_summary || 'Mathematical analysis based on RSI, EMA, and volume patterns'}

🚀 **Next Move:** ${analysis.probable_next_move || 'Monitor key levels for breakout'}
⚡ **Momentum:** ${analysis.momentum_status || (signals?.price_change_percent > 0 ? 'positive' : 'negative')}

📊 **Key Levels:**
${analysis.key_price_levels ? 
  `• Support: $${analysis.key_price_levels.next_support?.toLocaleString() || 'N/A'}
- Resistance: $${analysis.key_price_levels.next_resistance?.toLocaleString() || 'N/A'}
- Stop Loss: $${analysis.key_price_levels.stop_loss_level?.toLocaleString() || 'N/A'}` : 
  `• Support: $${signals?.indicators?.support_level?.toLocaleString() || 'N/A'}
- Resistance: $${signals?.indicators?.resistance_level?.toLocaleString() || 'N/A'}`}

💡 **Trading Recommendation:** ${analysis.trading_recommendation || 'Hold position and monitor volume confirmation'}

⚠️ **Risk Assessment:** ${analysis.risk_assessment || 'Monitor volatility and volume for confirmation signals'}`;
    }

    // Fallback to signals data if analysis is missing
    if (data.data?.signals) {
      const signals = data.data.signals;
      return `📊 **${coin.toUpperCase()} Technical Data**

💰 **Current Price:** $${signals.current_price?.toLocaleString() || 'N/A'}
📈 **Change:** ${signals.price_change_percent?.toFixed(2) || 'N/A'}%
🎯 **Signal:** ${signals.mathematical_signal || 'N/A'}
📊 **Confidence:** ${signals.signal_confidence?.toFixed(2) || 'N/A'}%
📋 **Pattern:** ${signals.synthetic_pattern?.replace(/_/g, ' ') || 'N/A'}

📈 **Technical Indicators:**
- RSI: ${signals.indicators?.rsi?.toFixed(1) || 'N/A'}
- EMA(9): $${signals.indicators?.ema_9?.toLocaleString() || 'N/A'}
- EMA(21): $${signals.indicators?.ema_21?.toLocaleString() || 'N/A'}
- Volume Ratio: ${signals.indicators?.volume_ratio?.toFixed(2) || 'N/A'}
- Buy/Sell Ratio: ${signals.indicators?.buy_sell_ratio?.toFixed(2) || 'N/A'}`;
    }

    return "⚠️ No analysis response from server.";
      } catch (error) {
        console.error('sendMessageToChatbot catch error:', error);
        return `Sorry, something went wrong. Please try again later.\nDetails: ${error.message}`;
      }
    };

// For debug/testing
export const AyaForUser = (userInput) => {
  sendMessageToChatbot(userInput)
    .then(response => console.log("AyaForUser response:", response))
    .catch(error => console.error("AyaForUser error:", error));
};
