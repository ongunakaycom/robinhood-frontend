// Define a function to fetch AI responses
const fetchAIResponse = async (inputText) => {
    try {
      const response = await fetch('https://robinhood-functions.vercel.app/api/ai-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });
  
      const data = await response.json();
      return data.response || "Sorry, I couldn't process that.";
    } catch (error) {
      console.error("Error fetching AI response:", error);
      return "An error occurred while fetching a response.";
    }
  };
  