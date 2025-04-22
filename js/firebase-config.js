  // Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2ENtW2hXHkLUPK38GurWbDnuIq9BAUsY",
  authDomain: "holisitic-life.firebaseapp.com",
  projectId: "holisitic-life",
  storageBucket: "holisitic-life.firebasestorage.app",
  messagingSenderId: "650093402954",
  appId: "1:650093402954:web:ae6fa3518fcbf0d85d7fb3",
  measurementId: "G-SXR7DV0TZJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = firebase.auth();
const db = firebase.firestore();