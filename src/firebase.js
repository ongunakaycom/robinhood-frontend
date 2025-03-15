// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Import auth and google provider
import { getDatabase, set } from "firebase/database"; // Import database and set function

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAC6_C02p6t846DCOxTEC4ZVLvUEbFYqpw",
  authDomain: "robinhoodapp-65342.firebaseapp.com",
  projectId: "robinhoodapp-65342",
  storageBucket: "robinhoodapp-65342.firebasestorage.app",
  messagingSenderId: "308547885262",
  appId: "1:308547885262:web:25902c11879d5bba4d589f",
  measurementId: "G-4NB14Y5WD0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);  // Export auth
const googleProvider = new GoogleAuthProvider();  // Export google provider
const database = getDatabase(app);  // Export database
export { auth, googleProvider, database, set };  // Export necessary Firebase services
