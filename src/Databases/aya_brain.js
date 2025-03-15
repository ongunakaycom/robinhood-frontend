const axios = require("axios");

const AYA_API_URL = "https://api.deepseek.com"; // DeepSeek API Endpoint
const MODEL_NAME = "deepseek/deepseek-r1:free"; // Fixed to the free model

const ayaBackendLink = "https://127.0.0.1/api/signals/"; // ✅ Updated Backend URL

// eslint-disable-next-line no-unused-vars
const systemInstructions = `
You are crypto trade bot BTC USDT analyser.
`;

// 🧠 Aya AI Logic
export const AyaForUser = async (userId) => {
    let chatHistory = await callFetchHistory(userId);

    const reloadHistory = async () => {
        console.log("🔄 Reloading history...");
        chatHistory = await callFetchHistory(userId);
    };

    const hello = async (displayName) => {
        let responseText = `Hello ${displayName}`;
        if (chatHistory.length < 1) {
            const userPrompt = `My name is ${displayName}`;
            const { text } = await getAIResponse(userPrompt);
            responseText = text || "Hey there! How are you today?";
        }
        return responseText;
    };

    const getAIResponse = async (userPrompt) => {
        try {
            const payload = {
                model: MODEL_NAME,
                messages: [{ role: "user", content: userPrompt }],
            };

            const response = await axios.post(`${AYA_API_URL}/generate`, payload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                },
            });

            const responseText = response.data.choices?.[0]?.message?.content || "I didn't quite get that.";
            await callUpdateHistory(userId, [...chatHistory, { role: "user", content: userPrompt }, { role: "assistant", content: responseText }]);
            return { text: responseText };
        } catch (error) {
            console.error("❌ AI Response Error:", error.message);
            return { text: "Sorry, I couldn't generate a response at the moment." };
        }
    };

    return { getAIResponse, hello, reloadHistory };
};

// 📜 Fetch User History
const callFetchHistory = async (userId) => {
    try {
        const res = await fetch(`${ayaBackendLink}history/${userId}`);
        const data = await res.json();
        return data.history || [];
    } catch (err) {
        console.error("❌ Error fetching history:", err.message);
        return [];
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
