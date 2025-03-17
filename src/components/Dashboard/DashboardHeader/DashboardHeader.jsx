// DashboardHeader.jsx
import React, { useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';
import { AiOutlineUser, AiOutlineLogout, AiOutlineSetting, AiOutlineHeart } from 'react-icons/ai';
import { BsChatLeft } from "react-icons/bs";
import { useNavigate } from 'react-router-dom'; 
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import './DashboardHeader.css';

const DashboardHeader = () => {
  const navigate = useNavigate(); 
  const auth = getAuth(); 

  const navigateToAccountSettings = () => {
    navigate('/account-settings');  
  };
  const navigateToDates = () => {
    navigate('/mydates');  
  };
  const navigateToDashboard = () => {
    navigate('/dashboard');  
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      navigate('/');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
          navigate('/'); 
        }
    });
    return () => unsubscribe();
}, [auth, navigate]);

  return (
    <header className='dashboard-header px-4'>
      <div className="dashboard-title" >
      <img
        src="./img/logo.svg"
        alt="Aya Matchmaker Logo"
        width="40"
        height="40"
        className="d-inline-block align-top DashboardLogo"
      />
      </div>
      <Dropdown>
        <Dropdown.Toggle variant="transparent" className="dashboard-header-button">
          <AiOutlineUser size={30} />
        </Dropdown.Toggle>
        <Dropdown.Menu>
        <Dropdown.Item onClick={navigateToDashboard}>
            <BsChatLeft /> Chat with Aya
          </Dropdown.Item>
        <Dropdown.Item onClick={navigateToDates}>
            <AiOutlineHeart /> My Dates
          </Dropdown.Item>
          <Dropdown.Item onClick={navigateToAccountSettings}>
            <AiOutlineSetting /> Account Settings
          </Dropdown.Item>
          <Dropdown.Item onClick={handleLogout}>
            <AiOutlineLogout /> Logout
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </header>
  );
};

export default DashboardHeader;
