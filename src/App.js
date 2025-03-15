import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import WelcomePage from './components/WelcomePage/WelcomePage';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import SignupWithEmail from './components/WelcomePage/Signup/Signup';
import Signin from './components/WelcomePage/Signin/Signin';
import PasswordRetrieve from './components/WelcomePage/Signin/PasswordRetrieve/PasswordRetrieve';
import AccountSettings from './components/Dashboard/Account-Settings/Account-Settings';
import AboutPage from './components/WelcomePage/AboutPage/AboutPage.jsx';
import GoPremium from './components/CheckoutForm/CheckoutForm.jsx';
import VerificationPage from './components/WelcomePage/Signup/VerificationPage/VerificationPage.jsx';
import ProtectedRoute from './components/WelcomePage/ProtectedRoute/ProtectedRoute.jsx';
import GuestChatPage from './components/WelcomePage/GuestChatPage/GuestChatPage.jsx';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />
          <Route path="/signup" element={<SignupWithEmail />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/password-retrieve" element={<PasswordRetrieve />} />
          <Route path="/account-settings" element={<AccountSettings />} />
          <Route path="/go-premium" element={<GoPremium />} />
          <Route path="/verification" element={<VerificationPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/guestchat" element={<GuestChatPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
