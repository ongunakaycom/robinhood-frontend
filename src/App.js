import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Lazy load components
const WelcomePage = React.lazy(() => import('./components/WelcomePage/WelcomePage'));
const Dashboard = React.lazy(() => import('./components/Dashboard/Dashboard.jsx'));
const SignupWithEmail = React.lazy(() => import('./components/WelcomePage/Signup/Signup'));
const Signin = React.lazy(() => import('./components/WelcomePage/Signin/Signin'));
const PasswordRetrieve = React.lazy(() => import('./components/WelcomePage/Signin/PasswordRetrieve/PasswordRetrieve'));
const AccountSettings = React.lazy(() => import('./components/Dashboard/Account-Settings/Account-Settings'));
const AboutPage = React.lazy(() => import('./components/WelcomePage/AboutPage/AboutPage.jsx'));
const GoPremium = React.lazy(() => import('./components/CheckoutForm/CheckoutForm.jsx'));
const VerificationPage = React.lazy(() => import('./components/WelcomePage/Signup/VerificationPage/VerificationPage.jsx'));
const ProtectedRoute = React.lazy(() => import('./components/WelcomePage/ProtectedRoute/ProtectedRoute.jsx'));

function App() {
  return (
    <Router>
      <div className="App">
        {/* Suspense component provides fallback loading UI while the component is being loaded */}
        <Suspense fallback={<div>Loading...</div>}>
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
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
