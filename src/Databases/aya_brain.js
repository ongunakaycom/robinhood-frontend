// ✅ API Base
const API_BASE = "https://deep-seek-chat-bot-python.onrender.com";

// ✅ Endpoints
const ASK_ENDPOINT = `${API_BASE}/ask`;

// ✅ Send user message to Flask chatbot, optionally with signal data
export const sendMessageToChatbot = async (message, signalData = null) => {
    try {
        const payload = { message };
        if (signalData) {
            payload.signal_data = signalData;
        }

        const response = await fetch(ASK_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error('❌ Failed to send message to the chatbot API');
        }

        const data = await response.json();
        return data.response || "⚠️ No response from AI.";
    } catch (error) {
        console.error('💥 Chatbot Error:', error);
        return '❌ Something went wrong. Please try again later.';
    }
};

// ✅ Example usage function for debugging / UI integration
export const AyaForUser = async (userInput, signalData = null) => {
    const aiResponse = await sendMessageToChatbot(userInput, signalData);
    console.log("💬 Aya says:", aiResponse);
    // 🔁 TODO: Plug this into UI update logic
};
