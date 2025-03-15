// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);