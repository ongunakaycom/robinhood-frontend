import React, { useState, useEffect } from 'react';
import { Row, Col } from "react-bootstrap";
import DashboardHeader from '../DashboardHeader/DashboardHeader';
import { getAuth, updatePassword, deleteUser, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Link, useNavigate } from 'react-router-dom';
import './AccountSettings.css';
import Footer from '../../Footer/Footer';
import Alert from '../../Alert/Alert'; 
import useAccountStore from '../../../store/accountStore';  // Zustand store

const AccountSettings = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState('https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png');
  const [changedPic, setChangedPic] = useState(null);
  const [changedUserName, setChangedUserName] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { accountStatus, setAccountStatus } = useAccountStore();  // Get Zustand store data

  const auth = getAuth();
  const navigate = useNavigate();
  const firestore = getFirestore();

  // Fetch and update user data from Firestore when logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setEmail(user.email);

        const userRef = doc(firestore, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
          // Create user document with default data
          await setDoc(userRef, {
            displayName: user.displayName || "User",
            email: user.email,
            photoURL: user.photoURL || '',
            createdAt: new Date(),
            accountStatus: 'Regular',  // Default account status
          });
          setAccountStatus('Regular'); // Update Zustand store with default status
        } else {
          const userData = userSnapshot.data();
          setUsername(userData.displayName);
          setProfilePicture(userData.photoURL);
          setAccountStatus(userData.accountStatus || 'Regular'); // Update Zustand store with user status
        }
      }
    });

    return () => unsubscribe();
  }, [auth, firestore, setAccountStatus]);

  // Handle Profile Picture Change
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(URL.createObjectURL(file));
      setChangedPic(file);
    }
  };

    // Function to mask the email
    const maskEmail = (email) => {
      if (!email) return '***********@****.com'; // Default fallback
      const [username, domain] = email.split('@');
      const maskedUsername = username.slice(0, 3) + '*****'; // Show only the first 3 characters of the email before the '@'
      return `${maskedUsername}@${domain}`;
    };

  // Handle Profile Picture Update
  const handleUpdateProfilePicture = async () => {
    if (changedPic) {
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result;
          const userRef = doc(firestore, "users", auth.currentUser.uid);

          // Update the photoURL in Firestore
          await updateDoc(userRef, { photoURL: base64String, updatedAt: new Date() });
          setSuccess("Profile picture updated successfully.");
          setChangedPic(null);
        };
        reader.readAsDataURL(changedPic);
      } catch (err) {
        console.error("Error updating profile picture:", err);
        setError(`Failed to update profile picture: ${err.message}`);
      }
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
  
    try {
      let changesMade = false;
  
      // Update profile picture if changed
      if (changedPic) {
        await handleUpdateProfilePicture();
        changesMade = true;
      }
  
      // Update username
      if (changedUserName) {
        const userRef = doc(firestore, "users", auth.currentUser.uid);
        await updateDoc(userRef, { displayName: changedUserName, updatedAt: new Date() });
        changesMade = true;
      }
  
      // Update password
      if (password) {
        await updatePassword(auth.currentUser, password);
        changesMade = true;
      }
  
      if (changesMade) {
        setSuccess('Profile updated successfully.');
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
  
  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        const user = auth.currentUser;
        if (user) {
          await deleteUser(user);
          setError(null);
          navigate('/');
        } else {
          setError('No user is currently signed in.');
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

// Handle Upgrade to Pro (UPDATED)
const handleUpgradeToPro = () => {
  window.open("https://nowpayments.io/payment/?iid=4937355411", "_blank");
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
                <Col sm={4}>
                  {/* Profile Picture Upload */}
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
                <Col sm={8}>
                  {/* Username Field */}
                  <div className="form-group mb-3">
                    <label className="text-start w-100">
                      Username:
                      <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => { setUsername(e.target.value); setChangedUserName(e.target.value); }}
                        className="w-100"
                      />
                    </label>
                  </div>
                </Col>
              </Row>

              {/* Full Width Section (Upgrade, Email, Account Status, Change Password) */}
              <div className="full-width-section mt-4">
                {accountStatus !== 'Pro' && (
                  <button
                    type="button"
                    onClick={handleUpgradeToPro}
                    className="delete-button w-100 mb-3"
                  >
                    Upgrade to Pro
                  </button>
                )}

                <div className="info-fields w-100">
                  {/* Styled Email Display */}
                  <div className="form-group mt-3">
                    <label className="text-start w-100">
                      Email:
                      <input
                        type="text"  // Use text input because it's readonly
                        value={maskEmail(email)}  // Masked email
                        readOnly
                        className="w-100"  // Make sure it's full-width
                      />
                    </label>
                  </div>

                  <div className="form-group mt-3">
                    <label className="text-start w-100">Account Status:</label>
                    <input 
                      type="text" 
                      readOnly 
                      className="w-100" 
                      value={accountStatus} 
                      style={{ backgroundColor: '#f9f9f9', border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }} 
                    />
                  </div>


                  {/* Change Password Field */}
                  <div className="form-group mt-3">
                    <label className="text-start w-100">
                      Change Password:
                      <input
                        type="password"
                        placeholder="Enter your new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-100"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit and Delete Buttons */}
              <div className="action-buttons mt-4 w-100">
                <button type="submit" className="submit-button w-100 mb-3">
                  Save Changes
                </button>
                <button type="button" onClick={handleDeleteAccount} className="delete-button w-100">
                  Delete Account
                </button>
              </div>
            </form>
          </div>

          {/* Alert Messages */}
          <Alert message={error} type="error" />
          <Alert message={success} type="success" />

          {/* Back to Dashboard */}
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
