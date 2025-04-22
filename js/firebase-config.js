// firebase-config.js
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
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Make available globally
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDB = db;