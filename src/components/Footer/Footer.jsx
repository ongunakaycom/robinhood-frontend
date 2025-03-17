import React from 'react';
import './Footer.css';
import { FaTwitter} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="dashboard-footer">
      <div className="footerCopy text-center">
        © 2025 | Follow us on{' '}
        <a
          href="https://x.com/crypto_public"
          target="_blank"
          rel="noopener noreferrer"
          className="instagram-link"
        >
          X <FaTwitter size={16} style={{ marginLeft: '5px' }} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
