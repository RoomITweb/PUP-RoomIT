// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCRECobtfYrJBMS1RQA_gMVFTTl5b5B0V0",
  authDomain: "roomit-web-824b8.firebaseapp.com",
  databaseURL: "https://roomit-web-824b8-default-rtdb.firebaseio.com",
  projectId: "roomit-web-824b8",
  storageBucket: "roomit-web-824b8.appspot.com",
  messagingSenderId: "692026645559",
  appId: "1:692026645559:web:46809e2aaf83e91d5fb3b2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export {app, auth, db, firebaseConfig};