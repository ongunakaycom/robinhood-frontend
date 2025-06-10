import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getDatabase, ref } from 'firebase/database';
import DashboardHeader from './DashboardHeader/DashboardHeader';
import ChatContainer from '../ChatContainer/ChatContainer';
import Footer from '../Footer/Footer';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom'; // add this import

const Dashboard = () => {
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [userAvatar, setUserAvatar] = useState('https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png');
  const [userMessagesRef, setUserMessagesRef] = useState(null);
  const [isProUser, setIsProUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getDatabase();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const firestore = getFirestore();
        const userRef = doc(firestore, 'users', user.uid);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
          const newDisplayName = user.displayName?.split(' ')[0] || 'name';
          const newAvatar = user.photoURL || userAvatar;
          setDisplayName(newDisplayName);
          setUserAvatar(newAvatar);

          await setDoc(userRef, {
            displayName: newDisplayName,
            email: user.email || '',
            photoURL: newAvatar,
            accountStatus: 'Free',
            datingLocations: ['World'],
            datingVenues: ['Wonline'],
            createdAt: new Date(),
          });

          setIsProUser(false);
        } else {
          const userData = userSnapshot.data();
          setDisplayName(userData.displayName);
          setUserAvatar(userData.photoURL);
          setIsProUser(userData.accountStatus === 'Pro');
        }
      } else {
        setIsProUser(false);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, userAvatar]);

  useEffect(() => {
    if (userId && db) {
      const messagesRef = ref(db, `messages/${userId}`);
      setUserMessagesRef(messagesRef);
    }
  }, [userId, db]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="Dashboard">
      <DashboardHeader />
      <main className="dashboard-content">

        <div className="aya-container" style={{ display: isProUser ? 'block' : 'none' }}>
          <ChatContainer
            userMessagesRef={userMessagesRef}
            displayName={displayName}
            userAvatar={userAvatar}
            error={error}
            setError={setError}
          />
        </div>

        {!isProUser && (
          <div className="upgrade-message" style={{ padding: '20px', textAlign: 'center', color: '#555' }}>
            <p>Upgrade to Pro to unlock the full chat experience!</p>
            <button
              onClick={() => navigate('/account-settings')}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '10px',
              }}
            >
              Go to Account Settings
            </button>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
