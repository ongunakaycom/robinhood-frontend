// Importing necessary dependencies
const API_URL = 'https://deep-seek-chat-bot-python.onrender.com'; // The chatbot endpoint

// Function to send a message to the chatbot and get the response
export const sendMessageToChatbot = async (message) => {
    try {
        // Sending a POST request to the chatbot API
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST', // We are sending a POST request
            headers: {
                'Content-Type': 'application/json', // Set the content type to JSON
            },
            body: JSON.stringify({ message: message }), // Body of the request with the user message
        });

        // Check if the response is successful
        if (!response.ok) {
            throw new Error('Failed to send message to chatbot');
        }

        // Parse the JSON response from the API
        const data = await response.json();
        
        // Assuming the chatbot API responds with a message property
        return data.message; 
    } catch (error) {
        console.error('Error:', error);
        return 'Sorry, something went wrong. Please try again later.'; // Fallback message
    }
};
