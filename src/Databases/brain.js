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
  const url = `${API_URL}/${market}/${coin}`;
  console.log('Sending message to chatbot:', url, { message });

  try {
    // Add fetch timeout (10 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request: message }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // If network-level error, response may be undefined
    if (!response) throw new Error('No response from server');

    const text = await response.text();

    if (!response.ok) {
      console.error('Backend error:', response.status, text);
      return `⚠️ Backend error: ${response.status}`;
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (jsonErr) {
      console.warn('Failed to parse JSON, returning raw text');
      return text || '⚠️ Empty response from server';
    }

    // Early returns for known error fields
    if (data.error) return data.error;
    if (data.data?.analysis?.error) return data.data.analysis.error;
    if (data.data?.analysis?.raw_response) return data.data.analysis.raw_response;

    return '⚠️ No analysis response from server';
  } catch (err) {
    console.error('sendMessageToChatbot catch error:', err);

    if (err.name === 'AbortError') {
      return '⏱ Request timed out. Please try again.';
    }

    return `❌ Something went wrong. Details: ${err.message}`;
  }
};
