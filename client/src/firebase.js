// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-3b73f.firebaseapp.com",
  projectId: "mern-estate-3b73f",
  storageBucket: "mern-estate-3b73f.firebasestorage.app",
  messagingSenderId: "956712379407",
  appId: "1:956712379407:web:cb452857ed78b8a857af7a"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);