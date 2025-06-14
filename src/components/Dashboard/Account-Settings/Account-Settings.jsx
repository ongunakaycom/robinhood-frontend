import React, { useState, useEffect } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import DashboardHeader from '../DashboardHeader/DashboardHeader';
import { getAuth, updatePassword, deleteUser, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Link, useNavigate } from 'react-router-dom';
import './AccountSettings.css';
import Footer from '../../Footer/Footer';
import Alert from '../../Alert/Alert'; 
import useAccountStore from '../../../store/accountStore';  // Zustand store
import useTradeStore from '../../../store/tradeStore';


const AccountSettings = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState('https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png');
  const [changedPic, setChangedPic] = useState(null);
  const [changedUserName, setChangedUserName] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { accountStatus, setAccountStatus } = useAccountStore();
  const { preferredMarket, preferredCoin, setPreferredMarket, setPreferredCoin } = useTradeStore();

  const auth = getAuth();
  const navigate = useNavigate();
  const firestore = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      setEmail(user.email || '');

      const userRef = doc(firestore, "users", user.uid);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        const defaultUserData = {
          displayName: user.displayName || "User",
          email: user.email,
          photoURL: user.photoURL || '',
          createdAt: new Date(),
          accountStatus: 'Regular',
          preferredMarket: '',
          preferredCoin: '',
        };

        await setDoc(userRef, defaultUserData);
        setAccountStatus(defaultUserData.accountStatus);
        setUsername(defaultUserData.displayName);
        setProfilePicture(defaultUserData.photoURL || 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png');
        setPreferredMarket(defaultUserData.preferredMarket);
        setPreferredCoin(defaultUserData.preferredCoin);
      } else {
        const data = userSnapshot.data();
        setUsername(data.displayName || '');
        setProfilePicture(data.photoURL || 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png');
        setAccountStatus(data.accountStatus || 'Regular');
        setPreferredMarket(data.preferredMarket || '');
        setPreferredCoin(data.preferredCoin || '');
      }
    });

    return () => unsubscribe();
  }, [auth, firestore, setAccountStatus, setPreferredMarket, setPreferredCoin]);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfilePicture(URL.createObjectURL(file));
    setChangedPic(file);
  };

  const maskEmail = (email) => {
    if (!email) return '***********@****.com';
    const [userPart, domain] = email.split('@');
    const maskedUser = userPart.length > 3 ? userPart.slice(0, 3) + '*****' : '*****';
    return `${maskedUser}@${domain}`;
  };

  const handleUpdateProfilePicture = async () => {
    if (!changedPic) return;

    try {
      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(changedPic);
      });

      const userRef = doc(firestore, "users", auth.currentUser.uid);
      await updateDoc(userRef, { photoURL: base64String, updatedAt: new Date() });
      setSuccess("Profile picture updated successfully.");
      setChangedPic(null);
    } catch (err) {
      console.error(err);
      setError(`Failed to update profile picture: ${err.message}`);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      let changesMade = false;
      const userRef = doc(firestore, "users", auth.currentUser.uid);

      if (changedPic) {
        await handleUpdateProfilePicture();
        changesMade = true;
      }

      if (changedUserName && changedUserName !== username) {
        await updateDoc(userRef, { displayName: changedUserName, updatedAt: new Date() });
        setUsername(changedUserName);
        changesMade = true;
      }

      // Update preferredMarket and preferredCoin if changed
      const updates = {};
      if (preferredMarket !== undefined) updates.preferredMarket = preferredMarket;
      if (preferredCoin !== undefined) updates.preferredCoin = preferredCoin;

      if (Object.keys(updates).length > 0) {
        await updateDoc(userRef, { ...updates, updatedAt: new Date() });
        changesMade = true;
      }

      if (password) {
        await updatePassword(auth.currentUser, password);
        changesMade = true;
      }

      if (changesMade) {
        setSuccess('Account settings saved');
      } else {
        setError('No changes made.');
      }

      setChangedUserName(null);
      setChangedPic(null);
      setPassword('');

    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      const user = auth.currentUser;
      if (!user) {
        setError('No user is currently signed in.');
        return;
      }
      await deleteUser(user);
      setError('');
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="AyaFormPage">
      <DashboardHeader />
      <main className="form-page-content">
        <div className="form-page-container">
          <h2>Account Settings</h2>
          <div className="form-page-form">
            <form onSubmit={handleUpdateProfile}>
              <Row>
                <Col sm={12}>
                  <div className="profile-picture-container">
                    <input
                      type="file"
                      id="profilePictureInput"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="profilePictureInput" className="profile-picture-label">
                      <img
                        src={profilePicture}
                        alt="Profile"
                        className="profile-picture"
                      />
                      <div className="overlay">
                        <span className="pen-icon">✏️</span>
                      </div>
                    </label>
                  </div>
                </Col>
                <Col sm={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Username:</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your username"
                      value={changedUserName !== null ? changedUserName : username}
                      onChange={(e) => setChangedUserName(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <Form.Label>Preferred Market:</Form.Label>
                    <Form.Select
                      value={preferredMarket}
                      onChange={(e) => setPreferredMarket(e.target.value)}
                    >
                      <option value="">Select a market</option>
                      <option value="Coinbase">Coinbase</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <Form.Label>Preferred Coin:</Form.Label>
                    <Form.Select
                      value={preferredCoin}
                      onChange={(e) => setPreferredCoin(e.target.value)}
                    >
                      <option value="">Select a coin</option>
                      <option value="BTC">BTC</option>
                      <option value="ETH">ETH</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <div className="full-width-section mt-4">
                <div className="info-fields w-100">
                  <Form.Group className="mt-3">
                    <Form.Label>Email:</Form.Label>
                    <Form.Control
                      type="text"
                      value={maskEmail(email)}
                      readOnly
                    />
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <Form.Label>Account Status:</Form.Label>
                    <Form.Control
                      type="text"
                      readOnly
                      value={accountStatus}
                      style={{ backgroundColor: '#f9f9f9', border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}
                    />
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <Form.Label>Change Password:</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter your new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Form.Group>
                </div>
              </div>

              <div className="action-buttons mt-4 w-100">
                <button type="submit" className="submit-button w-100 mb-3">Save Changes</button>
                <button type="button" onClick={handleDeleteAccount} className="delete-button w-100">Delete Account</button>
              </div>
            </form>
          </div>

          <Alert message={error} type="error" />
          <Alert message={success} type="success" />

          <Link to="/dashboard" className="back-to-dashboard mt-4">
            ← Back to Dashboard
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccountSettings;
