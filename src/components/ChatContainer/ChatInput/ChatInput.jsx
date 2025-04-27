import React, { useState, useEffect } from 'react';
import { AiOutlineSend } from 'react-icons/ai';
import Alert from '../../Alert/Alert'; 
import './ChatInput.css';
import { firestore } from '../../../firebase';
import { doc, getDoc } from "firebase/firestore";

const ChatInput = ({ inputText, setInputText, onSubmit, isSending, userId }) => {
  const [alertMessage, setAlertMessage] = useState('');
  const [isProAccount, setIsProAccount] = useState(false); // Default to false for safety
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Fetch account status from Firestore when the component mounts
  useEffect(() => {
    const fetchAccountStatus = async () => {
      try {
        if (!userId) {
          setIsLoading(false);
          return;
        }

        const userRef = doc(firestore, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const accountStatus = userDoc.data().accountStatus;
          setIsProAccount(accountStatus === 'Pro');
          
          if (accountStatus !== 'Pro') {
            setAlertMessage('Your account is not Pro. You need to upgrade to Pro.');
          }
        } else {
          // If user document doesn't exist, treat as non-Pro
          setIsProAccount(false);
          setAlertMessage('Your account is not Pro. You need to upgrade to Pro.');
        }
      } catch (error) {
        console.error("Error fetching account status:", error);
        // Default to non-Pro on error
        setIsProAccount(false);
        setAlertMessage('Error verifying account status. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountStatus();
  }, [userId]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!inputText.trim()) {
      setAlertMessage('Please type something');
      setTimeout(() => setAlertMessage(''), 3000);
      return;
    }

    onSubmit(event);
  };

  if (isLoading) {
    return <div className="chat-input-form">Loading account status...</div>;
  }

  return (
    <div>
      {alertMessage && <Alert message={alertMessage} type="error" />}

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isProAccount ? (isSending ? "Robin Hood typing..." : "Type here...") : "Upgrade to Pro to chat"}
          className="chat-text-input"
          disabled={!isProAccount || isSending}
        />
        <button 
          type="submit" 
          className="submit-button-send-message" 
          disabled={!isProAccount || isSending || !inputText.trim()}
        >
          <AiOutlineSend size={24} />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;