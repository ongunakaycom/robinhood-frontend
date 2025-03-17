import React, { useState } from 'react';
import { Navbar, Button, Row, Dropdown, Col } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithPopup } from "firebase/auth";
import { googleProvider, database, set } from "../../../firebase";
import { get, ref } from "firebase/database";
import { getAnalytics, logEvent } from "firebase/analytics";
import { AiOutlineGoogle, AiOutlineMail } from "react-icons/ai";
import Flag from 'react-world-flags';
import './WelcomePageHeader.css';
import { useTranslation } from 'react-i18next';


function WelcomePageHeader() {  
  const navigate = useNavigate();
  const analytics = getAnalytics();
  const [currentLang, setCurrentLang] = useState('en');
  const { t, i18n } = useTranslation();

  

  const handleGoogleLogin = async () => {
    const auth = getAuth();

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Reference to the user's node in the database
      const userRef = ref(database, "users/" + user.uid);

      // Check if the user already exists in the database
      const snapshot = await get(userRef);
      if (!snapshot.exists()) {
        // If the user does not exist, store their data
        await set(userRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
        console.log("New user signed in with Google and data stored!");
      } else {
        console.log("User already exists in the database.");
      }
      // Navigate to the dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  const handleEmailSignin = () => {
    logEvent(analytics, "email_signin_attempt");
    navigate("/signin");
  };

  const handleEmailSignup = () => {
    logEvent(analytics, "email_signup_attempt");
    navigate("/signup");
  };

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
    setCurrentLang(lng); // Update the language state
  };

  return (
    <Navbar sticky="top" className="custom-navbar px-4" expand="lg">
    <Navbar.Brand href="/" className="text-start flex-grow-1">
      <img
        src="./img/logo.jpg"
        alt="Aya Matchmaker Logo"
        width="40"
        height="40"
      />
    </Navbar.Brand>
  
    <Navbar.Toggle aria-controls="navbarNav" />
    <Navbar.Collapse id="navbarNav">
      <Row className="ms-auto">
        <Col className="d-flex justify-content-end align-items-center">
          {/* Language Selector */}
          <Dropdown align="end">
              <Dropdown.Toggle variant="secondary">
                <Flag code={currentLang === 'en' ? 'GB' : 'ES'} style={{ width: 20, height: 15 }} /> {/* Dynamically set flag */}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleLanguageChange('en')}>
                  <Flag code="GB" style={{ width: 20, height: 15 }} /> English
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleLanguageChange('es')}>
                  <Flag code="ES" style={{ width: 20, height: 15 }} /> Spanish
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
  
          {/* Action Buttons */}
          <Button onClick={handleGoogleLogin} className="ms-2">
            <AiOutlineGoogle className="me-1" />
            {t('signIn')}
          </Button>
  
          <Button onClick={handleEmailSignin} className="ms-2">
            <AiOutlineMail className="me-1" />
            {t('signIn')}
          </Button>
  
          <Button onClick={handleEmailSignup} className="ms-2">
            <AiOutlineMail className="me-1" />
            {t('signUp')}
          </Button>
        </Col>
      </Row>
    </Navbar.Collapse>
  </Navbar>
  );
}

export default WelcomePageHeader;
