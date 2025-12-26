import "./WelcomePage.css";
import { Container, Row, Col, Button } from "react-bootstrap";
import Footer from "../Footer/Footer";
import CookieDisclaimer from "./CookieDisclaimer/CookieDisclaimer.jsx";
import WelcomePageHeader from "./WelcomePageHeader/WelcomePageHeader.jsx";
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react'; // Fix: import useState

function WelcomePage() {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const cookieAccepted = localStorage.getItem('cookieAccepted');
    if (!cookieAccepted) {
      setShow(true);
    }
  }, []); 

  const handleAccept = () => {
    localStorage.setItem('cookieAccepted', 'true');
    setShow(false);
  };

  // If cookie is already accepted, don't show the Cookie Disclaimer.
  if (!show) {
    return null;
  }

  return (
    <div className="WelcomePage">
      <WelcomePageHeader />
      <main className="welcome-container">
        <Container>
          <Row>
            <Col md={6} className="w-100">
              <h1 className="mb-4 mt-5 pt-3 text-white">
                {t('heading')}
              </h1>
              <p className="text-white">
                {t('subheading')}
              </p>
            </Col>
          </Row>
          <Row>
            <p><img src="/img/aya-avatar.jpg" alt="Avatar" className="ayaphoto" /></p>
            <p>
              <a 
                href="https://t.me/BitcoinSignalsChannel" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button>{t('learnMore')}</Button>
              </a>
            </p>            
          </Row>
          <Row>
            <span className="small text-white mb-2">
              <b>{t('cryptoSignals')}</b>
            </span>
          </Row>
        </Container>
      </main>
      <Footer />
      <CookieDisclaimer 
        message={`${t('cookieDisclaimer.messagePart1')} 
                 <a href='/terms'>{t('cookieDisclaimer.termsLinkText')}</a>`} 
        acceptButton={t('cookieDisclaimer.acceptButton')} 
        handleAccept={handleAccept} 
      />
    </div>
  );
}

export default WelcomePage;
