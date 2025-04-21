import React from 'react';
import './MessageList.css';
import DOMPurify from 'dompurify';

// Format timestamp to a readable string (DD/MM/YYYY HH:MM:SS)
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

// Combined function to format and clean the message
const formatAndCleanMessage = (rawText) => {
  if (!rawText) return '';

  // Step 1: Sanitize dangerous HTML tags
  const cleaned = DOMPurify.sanitize(rawText, {
    USE_PROFILES: { html: true },
  });

  // Step 2: Custom formatting / enhancements
  const formatted = cleaned
    .replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>') // bold
    .replace(/(\*|_)(.*?)\1/g, '<em>$2</em>')           // italic
    .replace(/\n/g, '<br/>')                             // line breaks
    .replace(/(STRONG_UPTREND|NEUTRAL|FLAT|BULLISH|BEARISH)/gi, (match) => {
      if (match.includes('UP') || match.includes('BULL')) return `<span class="positive">${match}</span>`;
      if (match.includes('NEUTRAL') || match.includes('FLAT')) return `<span class="highlight">${match}</span>`;
      return `<span class="negative">${match}</span>`;
    })
    .replace(/No clear edge/gi, '<em>No clear edge</em>') // highlighting specific text
    .replace(/(-?\d+\.\d+%)/g, '<strong>$1</strong>');   // bold percentages

  // Step 3: Clean double <br> tags and leading/trailing br
  return formatted
    .replace(/^(<br\s*\/?>\s*)+/i, '')  // remove leading <br>
    .replace(/(<br\s*\/?>\s*){2,}/gi, '<br/>'); // collapse multiple <br>
};

const MessageList = ({ messages, messagesEndRef, displayname, userAvatar }) => {
  return (
    <div className="scrollbar messages">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message-container ${message.sender === 'user' ? 'user-message' : 'other-message'}`}
        >
          <div className="message-header">
            {message.sender !== 'user' ? (
              <div className="avatar-container ai-avatar">
                <img src="/img/aya-avatar.jpg" alt="Avatar" className="avatar" />
                <p className="message-name text-light">Robin Hood</p>
                <span className="message-timestamp">{formatTimestamp(message.timestamp)}</span>
              </div>
            ) : (
              <div className="avatar-container user-avatar">
                <span className="message-timestamp">{formatTimestamp(message.timestamp)}</span>
                <p className="message-name text-light">{displayname}</p>
                {userAvatar ? (
                  <img src={userAvatar} alt="User Avatar" className="avatar" />
                ) : (
                  <img src="/img/default-avatar.jpg" alt="User Avatar" className="avatar" />
                )}
              </div>
            )}
          </div>
          <div
            className="message-text formatted-message"
            dangerouslySetInnerHTML={{ __html: formatAndCleanMessage(message.text) }}
          />
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
