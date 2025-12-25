import React from 'react';
import './Footer.css';
import { FaInstagram, FaTelegram, FaYoutube } from 'react-icons/fa';

// TradingView logo (from public folder)
const TradingViewLogo = () => (
  <img
    src="/img/white-short-logo.svg"
    alt="TradingView"
    width="40"
    height="40"
  />
);

const Footer = () => {
  return (
    <footer className="dashboard-footer">
      <div className="footerCopy text-center">

        {/* Instagram */}
        <a
          href="https://www.instagram.com/cryptocurrency_signals_channel/"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
        >
          <FaInstagram size={24} style={{ color: '#E4405F' }} />
        </a>

        {/* Telegram */}
        <a
          href="https://t.me/BitcoinSignalsChannel"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
        >
          <FaTelegram size={24} style={{ color: '#0088cc' }} />
        </a>

        {/* YouTube */}
        <a
          href="https://www.youtube.com/@CryptoSignalsChannel"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
        >
          <FaYoutube size={24} style={{ color: '#FF0000' }} />
        </a>

        {/* TradingView */}
        <a
          href="https://www.tradingview.com/u/CryptoSignalsChannel/"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
        >
          <TradingViewLogo />
        </a>

      </div>
    </footer>
  );
};

export default Footer;