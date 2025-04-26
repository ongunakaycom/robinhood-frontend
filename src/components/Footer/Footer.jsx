import React from 'react';
import './Footer.css';
import { FaInstagram, FaTelegram } from 'react-icons/fa'; // Import other icons

const XLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ margin: '0 10px', color: '#fff' }}
    className="x-logo"  // Add a class here for specific styling
  >
    <path d="M4 4l16 16M4 20L20 4" />
  </svg>
);


const Footer = () => {
  return (
    <footer className="dashboard-footer">
      <div className="footerCopy text-center">
        {/* Social Media Links with Icons */}
        <a
          href="https://x.com/crypto_public"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
        >
          <XLogo /> {/* Replace the old Twitter icon with X logo */}
        </a>
        <a
          href="https://www.instagram.com/robinhoodtradebot/"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
        >
          <FaInstagram size={24} style={{ margin: '0 10px', color: '#E4405F' }} />
        </a>
        <a
          href="https://t.me/RobinHoodCryptoTradersClub"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
        >
          <FaTelegram size={24} style={{ margin: '0 10px', color: '#0088cc' }} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
