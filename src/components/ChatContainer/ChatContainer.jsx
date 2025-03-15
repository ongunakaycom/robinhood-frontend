import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'; 
import MessageList from './MessageList/MessageList.jsx';
import ChatInput from './ChatInput/ChatInput.jsx';
import { onValue, push, query, limitToLast, orderByChild} from 'firebase/database';
import './ChatContainer.css'; 

const ChatContainer = ({
  userMessagesRef,
  displayName,
  userAvatar,
  aya,
  communicator,
  dateManager,
  error,
  setError,
}) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [loadingAya, setLoadingAya] = useState(true);  // Add state to track if Aya is loading
  const messagesEndRef = useRef(null);

  // Initialize `addMessage` function
  const addMessage = useCallback(async (sender, text) => {
    const Message = {
      text: text,
      timestamp: Date.now(),
      sender: sender
    };
    await push(userMessagesRef, Message);
  }, [userMessagesRef]);

  // Initialize `fetchBotResponse` function
  const fetchBotResponse = async (inputText) => {
    setIsSending(true); 
    setAyaTyping();

    try {
      const aiResponse = await aya.getAIResponse(inputText);
      if (aiResponse) {
        if (aiResponse.functions) {
          handleFunctions(aiResponse.functions);  // Call `handleFunctions` here
        }    
        return aiResponse.text;
      } else {
        console.log("aiResponse either empty or not existent: " + aiResponse);
        return 'I understand your input, but I have no words, sorry.'; 
      } 
    } catch (error) {
      const erroranswer = handleResponseError(error);
      return erroranswer; 
    } finally {
      setIsSending(false); // Reset the sending state regardless of success or failure
    }
  };

  // Function to handle error responses from the bot
  const handleResponseError = (error) => {
    let answer = 'I understand your input, but I’m currently unable to fetch a response. Please check your internet connection and try again.';
    if (error.message.includes('[GoogleGenerativeAI Error]: Candidate was blocked due to SAFETY')) {
      answer = "Looks like I thought something I shouldn't have! My message got blocked :(";
    } else if (error.message.includes('contents.parts must not be empty.')) {
      answer = "Sorry, I have this problem sometimes, not sure what is going on. Can you please reload the page?";
    }
    console.error('Error fetching bot response:', error);
    return answer;
  };

  // Handle message submission and interact with bot
  const handleSubmitMessage = async (event) => {
    event.preventDefault();

    if (loadingAya) {
      setError('Aya is still loading. Please wait a moment.');
      return;
    }

    if (!aya) {
      console.error("Aya not initialized");
      setError('Aya is not initialized. Please try again later.');
      return;
    }

    if (!inputText.trim()) {
      console.error("No Input on Submit");
      return;
    }

    try {
      await addMessage('user', inputText);   // Send the user's message
      setInputText('');                       // Clear the input field
      const responseText = await fetchBotResponse(inputText);  // Get bot's response
      await addMessage('bot', responseText);  // Send the bot's response
    } catch (error) {
      console.error('Error with handling submit message:', error);
      setError('Error with handling submit message');
    }
  };

  // Function to handle the execution of different functions (e.g., matching, user, venue info)
  const handleFunctions = (funcArray) => {
    let responseExpected = false;
    for (let f of funcArray) {
      if (f.name.includes("match") || f.name.includes("venueinfo") || f.name.includes("setupdate")) {
        responseExpected = true;
      }
    }

    if (responseExpected) {
      generateFunctionTextResponses(funcArray);
    } else {
      for (let f of funcArray) {
        if (f.name.includes("user")) {
          aya.calluserfunction(f.name, f.args.profile);  // Call user-related function
        } else if (f.name.includes("communicate")) {
          communicator.approach(f.args);  // Call communication-related function
        } else {
          console.log("unknown function call:", f);  // Handle unknown function calls
        }
      }
    }
  };

  // Function to generate text responses based on function calls
  const generateFunctionTextResponses = async (funcArray) => {
    setAyaTyping();

    let funAnswers = [];
    for (let f of funcArray) {
      let answer = { about: f.name + " is not a known function" };
      if (f.name.includes("match")) {
        answer = await aya.callMatch();
      } else if (f.name.includes("user")) {
        answer = await aya.calluserfunction(f.name, f.args.profile);
      } else if (f.name.includes("venueinfo")) {
        answer = await dateManager.getLocations(f.args.matchUserId);
      } else if (f.name.includes("setupdate")) {
        console.log("call create date");
        answer = await dateManager.createDate(f.args);
        // TODO: Inform BOTH users about date setup
      }
      const functionResponse = { functionResponse: { name: f.name, response: answer } };
      funAnswers.push(functionResponse);
    }

    const aiResponse = await aya.getAIResponse(funAnswers);
    if (aiResponse) {
      await addMessage('bot', aiResponse.text);  
    } else {
      console.log("sent match result to AI but looks like no generation of content");
    }
  };

  // Handle Aya initialization
  useEffect(() => {
    if (aya) {
      setLoadingAya(false);  // Set to false once Aya is initialized
    }
  }, [aya]);

  // Scroll to the bottom of the message list when new messages are added
  useLayoutEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } 
  }, [messages]);

  // Function to simulate Aya typing
  const setAyaTyping = () => {
    const typingMessage = {
      id: 'typing',
      text: 'Aya is typing...',
      timestamp: Date.now(),
      sender: 'bot',
    };
    setMessages((prevMessages) => [...prevMessages, typingMessage]);
  };

  // Monitor new messages in the database
  useEffect(() => {
    if (!userMessagesRef) return;

    const messagesQuery = query(userMessagesRef, orderByChild('timestamp'), limitToLast(50));

    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        if (aya) {
          setAyaTyping();
          const aiResponse = aya.hello(displayName);  // Ensure you define how to fetch this properly
          addMessage('bot', aiResponse);
        }
      } else {
        const lastObject = Object.keys(data)[Object.keys(data).length - 1];
        if (data[lastObject].author && aya) {
          aya.reloadhistory();
        }
        const messageList = Object.entries(data).map(([id, message]) => ({ id, ...message }));
        setMessages(messageList);
      }
    });

    return () => unsubscribe();
  }, [userMessagesRef, aya, addMessage, displayName]);

  return (
    <div className="aya-container">
      {loadingAya && <div className="loading-message">Aya is loading...</div>}
      <MessageList
        messages={messages}
        messagesEndRef={messagesEndRef}
        displayName={displayName}
        userAvatar={userAvatar}
      />
      <ChatInput
        inputText={inputText}
        setInputText={setInputText}
        onSubmit={handleSubmitMessage}
        isSending={isSending}
      />
    </div>
  );
};

export default ChatContainer;
