// Importing necessary dependencies
const API_URL = 'https://deep-seek-chat-bot-python.onrender.com'; // The chatbot endpoint

// Function to send a message to the chatbot and get the response
export const sendMessageToChatbot = async (message) => {
    try {
        // Using the API_URL variable in the fetch request
        const response = await fetch(`${API_URL}/ask`, {  // Use the full URL now
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
        
        // Assuming the chatbot API responds with a response property
        return data.response;  // Ensure this matches the backend response structure
    } catch (error) {
        console.error('Error:', error);
        return 'Sorry, something went wrong. Please try again later.'; // Fallback message
    }
};

// Function for AyaForUser (you can modify this logic as needed)
export const AyaForUser = (userInput) => {
    // Example function that uses sendMessageToChatbot
    // You can customize this function to handle specific logic related to "AyaForUser"
    
    // This can be the function that will be called when you want to interact with the chatbot
    sendMessageToChatbot(userInput)
        .then((response) => {
            console.log("AyaForUser response: ", response); // Log or handle the chatbot's response
            // Additional logic based on the response can be added here
        })
        .catch((error) => {
            console.error("Error with AyaForUser:", error);
        });
};
