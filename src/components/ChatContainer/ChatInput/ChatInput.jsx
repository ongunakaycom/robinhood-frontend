import React, { useState } from 'react';
import { AiOutlineSend } from 'react-icons/ai';
import Alert from '../../Alert/Alert'; 
import './ChatInput.css';

const ChatInput = ({ inputText, setInputText, onSubmit, isSending }) => {
  const [alertMessage, setAlertMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();  // Correctly prevent default action

    if (!inputText.trim()) {
      setAlertMessage('Please type something');
      setTimeout(() => setAlertMessage(''), 3000);
      return;
    }

    onSubmit(event);  // Pass the event to onSubmit
  };

  return (
    <div>
      {alertMessage && <Alert message={alertMessage} type="error" />}

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type here..."
          className="chat-text-input"
          disabled={isSending}
        />
        <button 
          type="submit" 
          className="submit-button-send-message" 
          disabled={isSending}
        >
          <AiOutlineSend size={24} />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
