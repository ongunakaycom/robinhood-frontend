import React from 'react';
import './MessageList.css'; 

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
                <p className="message-name text-light">
                  {displayname}
                </p>
                {userAvatar ? (
                  <img src={userAvatar} alt="User Avatar" className="avatar" />
                ) : (
                  <img src="/img/default-avatar.jpg" alt="User Avatar" className="avatar" />
                )}
              </div>
            )}
          </div>
          <p className="message-text text-start">{message.text}</p>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
