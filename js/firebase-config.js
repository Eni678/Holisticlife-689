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

// Initialize services and make them globally available
window.firebaseAuth = firebase.auth(app);
window.firebaseDB = firebase.firestore(app);

// Optional: Initialize analytics if needed
// window.firebaseAnalytics = firebase.analytics(app);