import { Dropdown } from 'react-bootstrap';
import { AiOutlineUser, AiOutlineLogout, AiOutlineSetting } from 'react-icons/ai';
import { BsChatLeft } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import './DashboardHeader.css';

const DashboardHeader = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [isProUser, setIsProUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/');
      } else {
        const firestore = getFirestore();
        const userDoc = doc(firestore, 'users', user.uid);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setIsProUser(userData.accountStatus === 'Pro');
        }
      }
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
        <Dropdown>
          <Dropdown.Toggle variant="transparent" className="dashboard-header-button">
            <AiOutlineUser size={30} />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {isProUser && (
              <Dropdown.Item onClick={() => navigate('/dashboard')}>
                <BsChatLeft /> Chat with Robin Hood
              </Dropdown.Item>
            )}
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
