import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnalytics, logEvent } from "firebase/analytics"; 
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getDatabase, ref } from 'firebase/database';
import WelcomePageHeader from '../WelcomePageHeader/WelcomePageHeader';
import ChatContainer from '../../ChatContainer/ChatContainer';
import Footer from '../../Footer/Footer'; 
import './GuestChatPage.css'; 

const GuestChatPage = () => {
  const [error, setError] = useState(null);
  const [guestUserId, setUserId] = useState(null); 
  const displayName = 'Guest';
  const userAvatar = 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png'; 
  const [userMessagesRef, setUserMessagesRef] = useState();
  const [aya, setAya] = useState();
  const navigate = useNavigate();
  
  const auth = getAuth(); 
  const db = getDatabase();
  const analytics = getAnalytics();

  useEffect(() => {
    logEvent(analytics, "guestchat_page_visit");
  }, [analytics]);
 
  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          if (user.isAnonymous ) {
            setUserId(user.uid);
          } else {
            navigate('/dashboard')
          }
        } else {
          signInAnonymously(auth)
          .then(() => {
            setUserId(auth.currentUser.uid);
          })
        } 
      });
      return () => unsubscribe();
  }, [auth, navigate]);


  useEffect(() => {
    if (!guestUserId) return;
    if (!db) return;
    async function fetchAya() {
      // Mock response for testing
      setAya({ id: '1', text: 'Hello, Guest!' });
      const userMessagesRef = ref(db, `messages/guestsessions/${guestUserId}`);
      setUserMessagesRef(userMessagesRef);
    }
    fetchAya();
  }, [db, guestUserId]);
  

  return (
    <div className="GuestChatPage">
    <WelcomePageHeader />
    <main className="GuestChatPage-content">
      <ChatContainer
        userMessagesRef={userMessagesRef}   
        displayName={displayName} 
        userAvatar={userAvatar}   
        aya={aya}  
        communicator={null}
        dateManager={null}
        error={error}
        setError={setError}
      />
    </main>
    <Footer /> 
  </div>
  );
};

export default GuestChatPage;
