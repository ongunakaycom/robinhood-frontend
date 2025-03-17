import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase.js"; 
import { getAnalytics, logEvent } from "firebase/analytics";
import "./Signin.css";
import WelcomePageHeader from "../WelcomePageHeader/WelcomePageHeader";
import { useNavigate } from "react-router-dom";
import Alert from "../../Alert/Alert"; 
import HCaptcha from "@hcaptcha/react-hcaptcha"; // Import the hCaptcha component

const SignInComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null); 
  const analytics = getAnalytics();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null); 
  const [messageType, setMessageType] = useState(""); 

  logEvent(analytics, "login", {
    method: "email",
  });

  const displayMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
  
    if (!captchaToken) {
      displayMessage("Please complete the CAPTCHA verification to proceed.", "error");
      return;
    }
  
    try {
      // Attempt to sign in directly with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Reload the user to ensure the emailVerified status is up to date
      await user.reload();

      if (!user.emailVerified) {
        // Email not verified
        displayMessage("Please verify your email address before signing in.", "error");
        return;
      }

      // Email verified, show success message and redirect
      displayMessage(
        "Your email and password are correct. Redirecting you to your dashboard...",
        "success"
      );
  
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000); // Redirect after 3000ms
    } catch (err) {
      console.error(err); // Log the error for debugging

      // Handle different error scenarios
      let errorMessage;
      switch (err.code) {
        case "auth/user-not-found":
          errorMessage = "We couldn't find an account with that email. Please check and try again.";
          break;
        case "auth/wrong-password":
          errorMessage = "The password you entered is incorrect. Please check and try again.";
          break;
        case "auth/invalid-credential":
          errorMessage = "There seems to be an issue with your credentials. Please make sure your email and password are correct and try again.";
          break;
        default:
          errorMessage = "An unexpected error occurred. Please try again later.";
          break;
      }
      displayMessage(errorMessage, "error");
    }
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token); 
  };

  return (
    <div className="AyaFormPage">
      <WelcomePageHeader />
      <main className="form-page-content">
        <div className="form-page-container">
          <h2>Sign in to your account</h2>

          <a href="/Signup">Don't have an account? Sign up here!</a>

          <div className="form-page-form">
            {message && <Alert type={messageType} message={message} />}
            <form onSubmit={handleSignIn}>
              <label className="text-light text-start">
                Email:
                <input
                  className="w-100"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label className="text-light text-start">
                Password:
                <input
                  className="w-100"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>

              <div className="recaptcha-container">
                {/* Replace ReCAPTCHA with hCaptcha */}
                <HCaptcha
                  sitekey={process.env.REACT_APP_HCAPTCHA_SITE_KEY}  // This should be correct
                  onVerify={handleCaptchaChange}  // Handles the token after successful verification
                />
              </div>

              <a href="/password-retrieve">Forgot password? | Can't log in?</a>
              <br></br>
              <button type="submit" className="submit-button">
                Sign In
              </button>
            </form>
          </div>

          <a href="/" className="back-to-home">
            ← Back to Home
          </a>
        </div>
      </main>
    </div>
  );
};

export default SignInComponent;
