// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCvhA6gm467UzkiGp1cuSfQPHqAOR3riec",
  authDomain: "workbnb-cc81f.firebaseapp.com",
  projectId: "workbnb-cc81f",
  storageBucket: "workbnb-cc81f.firebasestorage.app",
  messagingSenderId: "959273024806",
  appId: "1:959273024806:web:79fd53094fdc83242315e7",
  measurementId: "G-XD2X1KMRTZ"
};

import { getAuth } from "firebase/auth";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };
