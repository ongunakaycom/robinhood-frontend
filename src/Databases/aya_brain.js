const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// ✅ Updated Backend URL
const ayaBackendLink = "https://127.0.0.1/api/signals/";

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const systemInstructions = `
You are RobinHood Crypto Trend Analyser Bot.  
- You analyze cryptocurrency market trends and provide real-time insights.  
- Generate technical analysis based on historical data, price patterns, and indicators.  
- Offer trading suggestions while maintaining a neutral, data-driven approach.  
- Store user interaction history to refine insights over time.  
- Always provide clear, well-reasoned responses without financial advice.  
`;

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  safetySettings: safetySettings,
  systemInstruction: systemInstructions,
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 400,
  responseMimeType: "text/plain",
};

// 🧠 Aya AI Logic
export const AyaForUser = async (userId) => {
  let chatHistory = await callFetchHistory(userId);
  let chatSession = model.startChat({ generationConfig, history: chatHistory });

  const reloadHistory = async () => {
      console.log("🔄 Reloading history...");
      chatHistory = await callFetchHistory(userId);
      chatSession = model.startChat({ generationConfig, history: chatHistory });
  };

  const hello = async (displayName) => {
      let responseText = `Hello ${displayName}`;
      if (chatHistory.length < 1) {
          const result = await chatSession.sendMessage(`My name is ${displayName}`);
          const response = await result.response;
          responseText = response.text();
          await callUpdateHistory(userId, await chatSession.getHistory());

          if (!responseText) responseText = "Hey there! How are you today?";
      }
      return responseText;
  };

  const getAIResponse = async (userPrompt) => {
      const result = await chatSession.sendMessage(userPrompt);
      const response = await result.response;
      const responseText = response.text();
      await callUpdateHistory(userId, await chatSession.getHistory());
      return { text: responseText };
  };

  return { getAIResponse, hello, reloadHistory };
};

// 📜 Fetch User History
const callFetchHistory = async (userId) => {
  try {
      const res = await fetch(`${ayaBackendLink}history/${userId}`);
      const data = await res.json();
      return data.history;
  } catch (err) {
      console.error("❌ Error fetching history:", err.message);
      return "Error fetching history";
  }
};

// 🔄 Update User History
const callUpdateHistory = async (userId, history) => {
  try {
      await fetch(`${ayaBackendLink}updatehistory`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userid: userId, history }),
      });
      console.log("✅ History updated successfully");
  } catch (err) {
      console.error("❌ Error updating history:", err.message);
  }
};
