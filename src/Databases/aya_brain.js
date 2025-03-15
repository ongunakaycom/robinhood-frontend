import axios from "axios";

const AYA_API_URL = "https://api.deepseek.com"; // DeepSeek API Endpoint
const MODEL_NAME = "deepseek/deepseek-r1:free"; // Fixed to the free model
const ayaBackendLink = "http://127.0.0.1:5000/api/signals/"; // ✅ Updated Backend URL

// 🧠 Aya AI Logic
export const AyaForUser = async (userId) => {
    // Fetch chat history from the backend
    let chatHistory = await callFetchHistory(userId);

    // Reload history if needed
    const reloadHistory = async () => {
        console.log("🔄 Reloading history...");
        chatHistory = await callFetchHistory(userId);
    };

    // Greet user or respond based on the history
    const hello = async (displayName) => {
        let responseText = `Hello ${displayName}`;
        if (chatHistory.length < 1) {
            const userPrompt = `My name is ${displayName}`;
            const { text } = await getAIResponse(userPrompt);
            responseText = text || "Hey there! How are you today?";
        }
        return responseText;
    };

    // Get AI response
    const getAIResponse = async (userPrompt) => {
        try {
            const payload = {
                model: MODEL_NAME,
                messages: [{ role: "user", content: userPrompt }],
            };

            // Call the DeepSeek API to get the response
            const response = await axios.post(`${AYA_API_URL}/generate`, payload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.REACT_APP_DEEPSEEK_API_KEY}`, // Use your environment variable
                },
            });

            // Extract response text
            const responseText =
                response.data.choices?.[0]?.message?.content || "I didn't quite get that.";

            // Update user history in the backend
            await callUpdateHistory(userId, [
                ...chatHistory,
                { role: "user", content: userPrompt },
                { role: "assistant", content: responseText },
            ]);

            return { text: responseText };
        } catch (error) {
            console.error("❌ AI Response Error:", error.message);
            return { text: "Sorry, I couldn't generate a response at the moment." };
        }
    };

    // Return functions for user interaction
    return { getAIResponse, hello, reloadHistory };
};

// 📜 Fetch User History from the backend
const callFetchHistory = async (userId) => {
    try {
        const res = await axios.get(`${ayaBackendLink}user-history/${userId}`); // Updated path to fetch user history
        return res.data.history || [];
    } catch (err) {
        console.error("❌ Error fetching history:", err.message);
        return [];
    }
};

// 🔄 Update User History on the backend
const callUpdateHistory = async (userId, history) => {
    try {
        await axios.post(`${ayaBackendLink}updatehistory`, {
            userid: userId,
            history,
        });
        console.log("✅ History updated successfully");
    } catch (err) {
        console.error("❌ Error updating history:", err.message);
    }
};
