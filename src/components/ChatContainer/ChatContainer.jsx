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
    const messagesEndRef = useRef(null);
    // eslint-disable-next-line no-unused-vars
    // const [isTyping, setIsTyping] = useState(false);
    
    const handleResponseError = (error) => {
      let answer = 'I understand your input, but I’m currently unable to fetch a response. Please check your internet connection and try again.'
      if (error.message.includes('[GoogleGenerativeAI Error]: Candidate was blocked due to SAFETY')) {
        answer = "Looks like I thought something I shouldn't have! My message got blocked :("
      } else if (error.message.includes('contents.parts must not be empty.')){
        answer = "Sorry, I have this problem sometimes, not sure what is going on. Can you please reload the page?";
      }
      console.error('Error fetching bot response:', error);
      return answer;
    };

    const addMessage = useCallback(async (sender, text) => {
      const Message = {
        text: text,
        timestamp: Date.now(),
        sender: sender
      };
      await push(userMessagesRef, Message);
    }, [userMessagesRef])
    
    useEffect(() => {
      if (!userMessagesRef) return;
      const messagesQuery = query(userMessagesRef, orderByChild('timestamp'), limitToLast(50));
      const unsubscribe = onValue(messagesQuery, (snapshot) => {
        const data = snapshot.val();
        if(!data){
          if (!aya) return;
          async function callAI() {    
            setAyaTyping();
            const aiResponse = await aya.hello(displayName);
            await addMessage('bot',aiResponse);
          }
          callAI();
        } else {
          const lastobject = Object.keys(data)[Object.keys(data).length-1];
          if (data[lastobject].author && aya) {
            aya.reloadhistory();
          }
          if (data) {
            const messageList = Object.entries(data).map(([id, message]) => ({ id, ...message }));
            setMessages(messageList);
          }
        }
      });
      return () => unsubscribe();
    }, [userMessagesRef, aya, addMessage, displayName]);

    useLayoutEffect(() => {
      if (messages.length > 0) {
        scrollToBottom();
      } 
    }, [messages]);

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const generateFunctionTextResponses = async (funcArray) => {
      setAyaTyping();

      /* Why so complicated?
      // Please ensure that the number of function response parts should be 
      // equal to number of function call parts of the function call turn.
      */

      let funAnswers = [];
      for(let f of funcArray) {
        let answer = {about: f.name + " is not a known function"};
        if(f.name.includes("match")) {
          answer = await aya.callMatch();
        } else if(f.name.includes("user")) {
          answer = await aya.calluserfunction(f.name, f.args.profile);
        } else if(f.name.includes("venueinfo")) {
          answer = await dateManager.getLocations(f.args.matchUserId);
        } else if(f.name.includes("setupdate")) {
          console.log("call create date");
          answer = await dateManager.createDate(f.args);
          // TODO inform BOTH users about date setup
        } 
        const functionResponse = {functionResponse: {name: f.name, response: answer}};
        funAnswers.push(functionResponse);
      }
      console.log(funAnswers);
      const aiResponse = await aya.getAIResponse(funAnswers);
      if (aiResponse) {
        await addMessage('bot',aiResponse.text);  
      } else {
        console.log("sent match result to AI but looks like no generation of content");
      } 
    };
    
    const handleFunctions = (funcArray) => {
      let responseExpected = false;
      for(let f of funcArray) {
        if(f.name.includes("match") || f.name.includes("venueinfo") || f.name.includes("setupdate")){
          responseExpected = true;
        }
      }
      if(responseExpected) {
        generateFunctionTextResponses(funcArray);
      } else {
        for(let f of funcArray) {
          if(f.name.includes("user")) {
            aya.calluserfunction(f.name, f.args.profile);
          } else if(f.name.includes("communicate")) {
            communicator.approach(f.args);
          } else {
            console.log("unknown function call:", f);
          }          
        }
      }
    };

    const fetchBotResponse = async (inputText) => {
      //setIsTyping(true);
      setIsSending(true); 
      setAyaTyping();

      try {
        const aiResponse = await aya.getAIResponse(inputText);
        //console.log(aiResponse);
        if (aiResponse) {
          if (aiResponse.functions) {
            handleFunctions(aiResponse.functions);
          }    
          return aiResponse.text;
        } else {
          console.log("aiResponse either empty or not existant: " + aiResponse);
          return 'I understand your input, but I have no words, sorry.'; 
        } 
      } catch (error) {
          const erroranswer = handleResponseError(error);
          return erroranswer; 
      } finally {
        setIsSending(false); // Reset the sending state regardless of success or failure
      }

      /*
      if (responseText && responseText.length > 0) { 
      if(! responseText.startsWith("```")){
        answerText = responseText;
      }   }*/
   
    };

    const setAyaTyping = () => {
      const typingMessage = {
        id: 'typing',
        text: 'Aya is typing...',
        timestamp: Date.now(),
        sender: 'bot',
      };
      setMessages((prevMessages) => [...prevMessages, typingMessage]);

      //reset function
      /*setMessages((prevMessages) =>
        prevMessages.filter((message) => message.id !== 'typing')
      );*/
      //resets by itself 
    }

    const handleSubmitMessage = async (event) => {
      event.preventDefault();
      if (!aya) {
        console.error("Aya not initialized");
        return;
      }
      if (!inputText.trim()) {
        console.error("No Input on Submit");
        return;
      }
      
      try {
        await addMessage('user',inputText);   
        setInputText('');
        const responseText = await fetchBotResponse(inputText);
        await addMessage('bot',responseText);    
      } catch (error) {
        console.error('Error with handling submit message:', error);
        setError('Error with handling submit message');
      }
    }; 

    return (
      <div className="aya-container">
        <MessageList
          messages={messages}
          messagesEndRef={messagesEndRef}
          displayname={displayName}
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
