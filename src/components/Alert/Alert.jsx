import React from 'react';
import './Alert.css';

const Alert = ({ type = 'info', message, details = [], timestamp, onClick, read = false }) => {
  if (!message) return null;

  return (
    <div
      className={`alert alert-${type} p-2 mb-2 cursor-pointer ${read ? 'alert-read' : ''}`}
      onClick={onClick}
    >
      <div className="d-flex align-items-center" style={{ justifyContent: 'space-evenly' }}>
        <strong>{message}</strong>
        {timestamp && (
          <small className="text-muted">{new Date(timestamp).toLocaleTimeString()}</small>
        )}
      </div>
      {details.length > 0 && (
        <div className="mt-1">
          {details.map((detail, idx) => (
            <div key={idx} className="small">{detail}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alert;
