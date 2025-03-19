// Directly using the correct URL
const API_URL = "https://sunny-empathy-production-491e.up.railway.app";  // Direct URL

// Function to send a message to the chatbot via Railway API Gateway
export const sendMessageToChatbot = async (message) => {
    try {
        const response = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        });

        // Check if the response is successful
        if (!response.ok) {
            throw new Error('Failed to send message to Railway API');
        }

        // Parse the response from Railway API (which forwards it to Render API)
        const data = await response.json();
        
        // Assuming the Render API sends a "response" property
        return data.response;  // Make sure the response structure is correct
    } catch (error) {
        console.error('Error:', error);
        return 'Sorry, something went wrong. Please try again later.';  // Fallback message
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
