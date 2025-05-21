// ✅ Define separate constants for each endpoint
const CHATBOT_URL = "https://deep-seek-chat-bot-python.onrender.com/ask"; // For chatbot POST
const MERGED_DATA_URL = "https://deep-seek-chat-bot-python.onrender.com/api/merged-data"; // For merged trading data GET

// ✅ Send a message to the chatbot (POST /ask)
export const sendMessageToChatbot = async (message) => {
    try {
        const response = await fetch(CHATBOT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error('Failed to send message to the chatbot API');
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Chatbot Error:', error);
        return 'Sorry, something went wrong. Please try again later.';
    }
};

// ✅ Get merged trading data (GET /api/merged-data)
export const getMergedData = async () => {
    try {
        const response = await fetch(MERGED_DATA_URL, {
            method: 'GET',
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch merged data');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Merged Data Error:', error);
        return null;
    }
};

// ✅ Example usage function
export const AyaForUser = (userInput) => {
    sendMessageToChatbot(userInput)
        .then((response) => {
            console.log("💬 AyaForUser response: ", response);
            // Add UI update or response handling logic here
        })
        .catch((error) => {
            console.error("❌ AyaForUser Error:", error);
        });
};
