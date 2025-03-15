const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);

  const ayaBackendLink = "";

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];

  const systemInstructions = "You are Aya Matchmaker, an artificial Intelligence that functions as a matchmaker Aka Dating app. You have access to a user database of individuals who are in search of their life partner. You are virtual psychologist specializing in compassionate conversations about the users love life. while you are advising about romantic relationships you engage the user in conversations to get to know them like their best friend. for example, you ask them about their past relationships and learn their way of approaching life and relationships. Further, you learn about the user's values and character from their prompts and questions and are able to match them with individuals from the database. While you are chatting with them, you create their profile, but only once they are logged in. However, while you talk to them the user has not signed up yet. Motivate them regularly to sign up with the buttons on the top of the page, so that you can actually match them to other users and set them up for dates. keep your answers short but friendly" ;
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    safetySettings: safetySettings,
    systemInstruction: systemInstructions,
    toolConfig: {functionCallingConfig: {mode: "NONE"}},
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 400,
    responseMimeType: "text/plain",
  };
  
export const AyaForGuest = async (userId) => {
  const chatHistory = await callFetchHistory(userId);
  let chatSession = model.startChat({
    generationConfig,
    history: chatHistory,
  });

  const getAIResponse = async (userPrompt) => {
    const result = await chatSession.sendMessage(userPrompt);
    const response = await result.response;
    const responseText = response.text();
    let answerText = "I'm blanking";
    if (responseText && responseText.length > 0) {
      answerText = responseText; 
    }
    const chatHistory = await chatSession.getHistory();
    await callUpdateHistory(userId, chatHistory);
    return {text:answerText, functions:[]};
  };

  const hello = async (displayName) => {
    let responseText = "Welcome Back!";
    if (chatHistory.length < 1) {
      const prompt = "Hi Aya";
      const result = await chatSession.sendMessage(prompt);
      const response = await result.response;
      responseText = response.text();
      const chatHistory = await chatSession.getHistory();
      callUpdateHistory(userId, chatHistory);
      if(!responseText || responseText.length === 0 ) {
        responseText = "Hello and welcome! I just took some initial notes to set you up. How are you today?";
      }
    }
    return responseText;
  }

  return {
    getAIResponse:getAIResponse,
    hello:hello,
  };
}

const callFetchHistory = async (userId) => {
  return await fetch(ayaBackendLink + 'fetchhistory?' + 
          new URLSearchParams({
            userId: userId }).toString())
         .then((response) => response.json())
         .then((data) => {
            return(data.history);
         })
         .catch((err) => {
            console.log(err.message);
            return("Error fetching History");
         });
};

const callUpdateHistory = async (userId, history) => {
  return await fetch(ayaBackendLink + 'updatehistory', {
    method: 'POST',
    body: JSON.stringify({
       "userid": userId,
       "history": history
    }),
    headers: {'Content-type': 'application/json; charset=UTF-8',},
  })
  .then((response) => {
    //console.log(response.status, "History updated");
  }) 
  .catch((err) => {
    console.log(err.message);
    return("[ERROR] error updating history");
});
}
