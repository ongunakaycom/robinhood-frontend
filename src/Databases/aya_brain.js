// Ensure the function is exported correctly
export const AyaForUser = (userId) => {
  // Logic to create and return Aya instance for the user
  // Example:
  const aya = {
    userId,
    getAIResponse: async (inputText) => {
      // Your AI response fetching logic
      const response = await fetchAIResponse(inputText); // Assuming fetchAIResponse is defined elsewhere
      return response;
    },
    // You can add more methods as needed
  };

  return aya;
};

export const fetchAIResponse = async (inputText) => {
  try {
    const response = await fetch("https://robinhood-functions.vercel.app/api/ai-response", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userPrompt: inputText }),
    });

    const data = await response.json();
    return data.response || "Sorry, I couldn't process that.";
  } catch (error) {
    console.error("Error fetching AI response:", error);
    return "An error occurred while fetching a response.";
  }
};

