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

    if (!response.ok) {
      throw new Error(`Backend responded with status ${response.status}`);
    }

    const data = await response.json();
    return data.data?.analysis?.raw_response || "⚠️ No analysis response from server.";
  } catch (error) {
    console.error('sendMessageToChatbot error:', error);
    return 'Sorry, something went wrong. Please try again later.';
  }
};

// For debug/testing
export const AyaForUser = (userInput) => {
  sendMessageToChatbot(userInput)
    .then(response => console.log("AyaForUser response:", response))
    .catch(error => console.error("AyaForUser error:", error));
};
