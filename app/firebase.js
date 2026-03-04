// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDir0Psa-w6PIa_tBq_gBi-jLmYHbZBMEQ",
  authDomain: "blackjack-bdb9e.firebaseapp.com",
  projectId: "blackjack-bdb9e",
  storageBucket: "blackjack-bdb9e.firebasestorage.app",
  messagingSenderId: "858409297718",
  appId: "1:858409297718:web:3692fb8e05f1efc1447597"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);