import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDbSTtl2VmcPNwCzgJs7naTYVBrOXUp8f4",
  authDomain: "react-firebase-auth-app-4981b.firebaseapp.com",
  projectId: "react-firebase-auth-app-4981b",
  storageBucket: "react-firebase-auth-app-4981b.firebasestorage.app",
  messagingSenderId: "434575673774",
  appId: "1:434575673774:web:2e7f5ada744d7abc28603f",
  measurementId: "G-KHELZ6P5KC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); //ここ