import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'; 
import MessageList from './MessageList/MessageList.jsx';
import ChatInput from './ChatInput/ChatInput.jsx';
import { onValue, push, query, limitToLast, orderByChild } from 'firebase/database';
import { sendMessageToChatbot } from '../../Databases/aya_brain'; // Import the function to communicate with DeepSeek API
import './ChatContainer.css'; 

const ChatContainer = ({
  userMessagesRef,
  displayName,
  userAvatar,
  error,
  setError,
}) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const addMessage = useCallback(async (sender, text) => {
    const Message = {
      text: text,
      timestamp: Date.now(),
      sender: sender,
    };
    await push(userMessagesRef, Message);
  }, [userMessagesRef]);

  useEffect(() => {
    if (!userMessagesRef) return;
    const messagesQuery = query(userMessagesRef, orderByChild('timestamp'), limitToLast(50));
    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.entries(data).map(([id, message]) => ({ id, ...message }));
        setMessages(messageList);
      }
    });
    return () => unsubscribe();
  }, [userMessagesRef]);

  useLayoutEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchBotResponse = async (inputText) => {
    setIsSending(true);

    // Use DeepSeek API to get a response
    try {
      const botResponse = await sendMessageToChatbot(inputText);
      setIsSending(false); // Reset sending state
      return botResponse;
    } catch (error) {
      console.error("Error with DeepSeek API:", error);
      setIsSending(false); // Reset sending state
      return 'Sorry, something went wrong. Please try again later.'; // Fallback message
    }
  };

  const handleSubmitMessage = async (event) => {
    event.preventDefault();
    if (!inputText.trim()) {
      console.error("No Input on Submit");
      return;
    }

    try {
      await addMessage('user', inputText);
      setInputText('');
      const responseText = await fetchBotResponse(inputText);
      await addMessage('bot', responseText);
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
