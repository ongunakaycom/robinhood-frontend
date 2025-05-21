// Directly using the correct URL
const API_URL = "https://deep-seek-chat-bot-python.onrender.com";  // Direct URL

// Function to send a message to the chatbot 
export const sendMessageToChatbot = async (message) => {
    try {
        const response = await fetch(`${API_URL}/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error('Failed to send message to API');
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Error:', error);
        return 'Sorry, something went wrong. Please try again later.';
    }
};

// Example usage
export const AyaForUser = (userInput) => {
    sendMessageToChatbot(userInput)
        .then((response) => {
            console.log("AyaForUser response: ", response); // Handle the chatbot's response
            // Additional logic based on the response can be added here
        })
        .catch((error) => {
            console.error("Error with AyaForUser:", error);
        });
};
