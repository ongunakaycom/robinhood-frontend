import axios from "axios"; // Ensure correct axios import

const AYA_API_URL = "https://api.deepseek.com"; // DeepSeek API Endpoint
const MODEL_NAME = "deepseek/deepseek-r1:free"; // Fixed to the free model
const ayaBackendLink = "http://127.0.0.1:5000/api/signals"; // API for fetching signals

// 🧠 Aya AI Logic
export const AyaForUser = async () => {
    const hello = async (displayName) => {
        let responseText = `Hello ${displayName}`;
        const userPrompt = `My name is ${displayName}`;
        const { text } = await getAIResponse(userPrompt);
        responseText = text || "Hey there! How are you today?";
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
                    Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`, // Ensure API key is set
                },
            });

            const responseText = response.data.choices?.[0]?.message?.content || "I didn't quite get that.";
            return { text: responseText };
        } catch (error) {
            console.error("❌ AI Response Error:", error.message);
            return { text: "Sorry, I couldn't generate a response at the moment." };
        }
    };

    const fetchSignals = async () => {
        try {
            const res = await axios.get(ayaBackendLink); // Fetch signals from your backend API
            return res.data || [];
        } catch (err) {
            console.error("❌ Error fetching signals:", err.message);
            return [];
        }
    };

    return { getAIResponse, hello, fetchSignals };
};
