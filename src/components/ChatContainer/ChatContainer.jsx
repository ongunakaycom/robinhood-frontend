import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import MessageList from './MessageList/MessageList.jsx';
import ChatInput from './ChatInput/ChatInput.jsx';
import { onValue, push, query, limitToLast, orderByChild } from 'firebase/database';
import { sendMessageToChatbot } from '../../Databases/brain';
import useTradeStore from '../../store/tradeStore';
import './ChatContainer.css';

const ChatContainer = ({ userMessagesRef, displayName, userAvatar, error, setError }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const { preferredMarket = 'coinbase', preferredCoin = 'btcusd' } = useTradeStore();

  const addMessage = useCallback(async (sender, text) => {
    if (!userMessagesRef) return;
    const message = { text, timestamp: Date.now(), sender };
    await push(userMessagesRef, message);
  }, [userMessagesRef]);

  useEffect(() => {
    if (!userMessagesRef) return;
    const messagesQuery = query(userMessagesRef, orderByChild('timestamp'), limitToLast(5));
    const unsubscribe = onValue(messagesQuery, snapshot => {
      const data = snapshot.val();
      if (data) {
        const msgs = Object.entries(data).map(([id, msg]) => ({ id, ...msg }));
        setMessages(msgs);
      }
    });
    return () => unsubscribe();
  }, [userMessagesRef]);

  useLayoutEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmitMessage = async (event) => {
    event.preventDefault();
    if (!inputText.trim()) return;

    setIsSending(true);

    // Save the user's message first
    await addMessage('user', inputText);

    try {
      // Send message to chatbot with error handling
      const responseText = await sendMessageToChatbot(inputText, preferredMarket, preferredCoin);

      // If responseText is empty or contains error, provide fallback
      const botMessage = responseText || '⚠️ Chatbot did not respond. Please try again later.';
      await addMessage('bot', botMessage);
      setInputText('');
    } catch (err) {
      console.error('Chatbot submission error:', err);
      setError('Something went wrong when sending your message.');
      await addMessage('bot', '⚠️ Failed to get a response from the chatbot.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
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
    </>
  );
};

export default ChatContainer;
