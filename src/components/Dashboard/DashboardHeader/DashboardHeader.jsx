import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { AiOutlineUser, AiOutlineLogout, AiOutlineSetting } from 'react-icons/ai';
import { BsChatLeft } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import HeaderAlert from './HeaderAlert';
import './DashboardHeader.css';

const DashboardHeader = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [tradeState, setTradeState] = useState({
    active: false,
    signalType: null,
    entryPrice: null,
    takeProfit: null,
    stopLoss: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate('/');
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      navigate('/');
    }
  };

  return (
    <header className='dashboard-header px-4'>
      <div className="dashboard-title">
        <img src="./img/logo.jpg" alt="Logo" width="40" height="40" className="DashboardLogo" />
      </div>

      <div className="d-flex align-items-center">
        <HeaderAlert tradeState={tradeState} setTradeState={setTradeState} />

        <Dropdown>
          <Dropdown.Toggle variant="transparent" className="dashboard-header-button">
            <AiOutlineUser size={30} />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => navigate('/dashboard')}>
              <BsChatLeft /> Chat with Robin Hood
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate('/account-settings')}>
              <AiOutlineSetting /> Account Settings
            </Dropdown.Item>
            <Dropdown.Item onClick={handleLogout}>
              <AiOutlineLogout /> Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
};

export default DashboardHeader;
