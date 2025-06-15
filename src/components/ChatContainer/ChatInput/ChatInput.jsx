import React, { useState } from 'react'; 
import { AiOutlineSend } from 'react-icons/ai'; 
import Alert from '../../Alert/Alert';  
import useTradeStore from '../../../store/tradeStore';
import './ChatInput.css';  

const ChatInput = ({ inputText, setInputText, onSubmit, isSending }) => {   
  const [alertMessage, setAlertMessage] = useState('');
  const { preferredMarket, preferredCoin } = useTradeStore();

  const checkTradingPreferences = (message) => {
    const coinMappings = {
      'btcusd': ['btc', 'bitcoin'],
      'ethusd': ['eth', 'ethereum'], 
      'dogeusd': ['doge', 'dogecoin'],
      'xrpusd': ['xrp', 'ripple']
    };
    
    const lowerMessage = message.toLowerCase();
    
    // Get allowed coins for current preference
    const allowedCoins = coinMappings[preferredCoin] || [];
    
    // Get all other coins that should be blocked
    const blockedCoins = Object.values(coinMappings)
      .flat()
      .filter(coin => !allowedCoins.includes(coin));
    
    // Check if user is asking about coins not matching their preference
    const isBlockedCoinMentioned = blockedCoins.some(coin => 
      lowerMessage.includes(coin)
    );
    
    return isBlockedCoinMentioned;
  };

  const handleSubmit = (event) => {     
    event.preventDefault();      

    if (!inputText.trim()) {       
      setAlertMessage('Please type something');       
      setTimeout(() => setAlertMessage(''), 3000);       
      return;     
    }

    // Check trading preferences before submitting
    if (checkTradingPreferences(inputText)) {
      const coinName = preferredCoin.replace('usd', '').toUpperCase();
      setAlertMessage(`Your trading preferences: **${preferredMarket}** market, **${coinName}USD** pair. You need to change your trading preferences in account settings to change your coin settings.`);
      setTimeout(() => setAlertMessage(''), 5000);
      return;
    }

    onSubmit(event);     
    setInputText(''); // Clear input right after sending   
  };    

  return (     
    <div>       
      {alertMessage && <Alert message={alertMessage} type="error" />}        

      <form onSubmit={handleSubmit} className="chat-input-form">         
        <input           
          type="text"           
          value={inputText}           
          onChange={(e) => setInputText(e.target.value)}           
          placeholder={isSending ? "Robin Hood thinking..." : "Type here..."}           
          className="chat-text-input"           
          readOnly={isSending}         
        />         
        <button            
          type="submit"            
          className="submit-button-send-message"            
          disabled={isSending || !inputText.trim()}         
        >           
          <AiOutlineSend size={24} />         
        </button>       
      </form>     
    </div>   
  ); 
};  

export default ChatInput;