import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import '../src/components/I18/i18n.js';

// 🔹 LogRocket import ve init
import LogRocket from 'logrocket';
LogRocket.init('k5mhyl/ongunakaycom');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
