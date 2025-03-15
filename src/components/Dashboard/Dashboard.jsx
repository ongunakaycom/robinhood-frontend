import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc} from "firebase/firestore"; //addDoc, query, where, onSnapshot
import { getDatabase, ref} from 'firebase/database';
import { AyaForUser} from '../../Databases/aya_brain';
import DashboardHeader from './DashboardHeader/DashboardHeader';
import ChatContainer from '../ChatContainer/ChatContainer';
import Footer from '../Footer/Footer'; 
import './Dashboard.css'; 

const Dashboard = () => {
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const defaultAvatar = 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png'; 
  const [userAvatar, setUserAvatar] = useState(defaultAvatar);
  const [aya, setAya] = useState();
  const [communicator, setCommunicator] = useState();
  const [userMessagesRef, setUserMessagesRef] = useState(null);
  const [dateManager, setDateManager] = useState();
  const auth = getAuth(); 
  const db = getDatabase();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const firestore = getFirestore();
        const ur = doc(firestore, "users", user.uid);
        const userSnapshot = await getDoc(ur);
        if (!userSnapshot.exists()) {
          console.log("user does not exist in firestore");
          setDisplayName(user.displayName.split(' ')[0] || "name");
          setUserAvatar(user.photoURL || defaultAvatar);
          // Create a new user entry
          await setDoc(ur, {
            displayName: displayName,
            email: user.email || "",
            photoURL: userAvatar,            
            datingLocations: ["World"],
            datingVenues: ["Wonline"],
            createdAt: new Date(),
          });
        } else {
          const userData = userSnapshot.data();
          setDisplayName(userData.displayName);
          setUserAvatar(userData.photoURL);
        } 
      } 
    });
    return () => unsubscribe();
  }, [auth, displayName, userAvatar]);

  useEffect(() => {
    //can go into effect above!
    if (!userId) return;
    if (!db) return;
    async function fetchAya() {
      const aya = await AyaForUser(userId);
      setAya(aya);
      const c = await Communicator(userId);
      setCommunicator(c);
      const userMessagesRef = ref(db, `messages/${userId}`);
      setUserMessagesRef(userMessagesRef);
      setDateManager(Date_Manager(userId))
    }
    fetchAya();
  }, [userId, db]);

  return (
    <div className="Dashboard">
    <DashboardHeader />
    <main className="dashboard-content">
      <ChatContainer    
        userMessagesRef={userMessagesRef}   
        displayName={displayName} 
        userAvatar={userAvatar}   
        aya={aya}  
        communicator={communicator}
        dateManager={dateManager}
        error={error}
        setError={setError}
      />
    </main>
    <Footer /> 
  </div>
  );
};

export default Dashboard;
