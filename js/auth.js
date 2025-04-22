// auth.js - Enhanced Authentication Module

document.addEventListener('DOMContentLoaded', function() {
  // Initialize auth state listener
  initAuthState();
  
  // Set up event listeners if on login page
  if (document.getElementById('loginForm')) {
      setupLoginListeners();
  }
});

// Initialize authentication state listener
function initAuthState() {
  window.firebaseAuth.onAuthStateChanged(user => {
      if (user) {
          handleAuthenticatedUser(user);
      } else {
          handleUnauthenticatedUser();
      }
  });
}

// Handle authenticated user flow
function handleAuthenticatedUser(user) {
  if (user.email === 'enilamaoshoriamhe687@gmail.com') {
      // Log successful authentication
      logAuthActivity(user.uid, 'authenticated');
      
      // Load user data
      loadUserData(user.uid)
          .then(userData => {
              updateUserInterface(userData);
              
              // Redirect to app if on login page
              if (window.location.pathname.endsWith('login.html')) {
                  setTimeout(() => window.location.href = 'index.html', 500);
              }
          })
          .catch(error => {
              console.error("Error loading user data:", error);
              showToast('Error loading your data. Please refresh.', 'error');
          });
  } else {
      // Handle unauthorized access
      handleUnauthorizedAccess(user);
  }
}

// Handle unauthorized access attempts
function handleUnauthorizedAccess(user) {
  logAuthActivity(user.uid, 'unauthorized_attempt', { email: user.email });
  
  // Sign out and redirect
  window.firebaseAuth.signOut()
      .then(() => {
          if (!window.location.pathname.endsWith('login.html')) {
              window.location.href = 'login.html';
          }
          showToast('Access denied. This application is restricted.', 'error');
      })
      .catch(error => {
          console.error("Sign out error:", error);
      });
}

// Handle unauthenticated user
function handleUnauthenticatedUser() {
  if (!window.location.pathname.endsWith('login.html')) {
      window.location.href = 'login.html';
  }
}

// Load user data from Firestore
async function loadUserData(userId) {
  try {
      const doc = await window.firebaseDB.collection('users').doc(userId).get();
      
      if (doc.exists) {
          return doc.data();
      } else {
          return await setupNewUser(userId);
      }
  } catch (error) {
      console.error("Error in loadUserData:", error);
      throw error;
  }
}

// Set up new user in Firestore
async function setupNewUser(userId) {
  const initialData = {
      profile: {
          name: 'Enilama Oshoriamhe',
          role: 'Biochemist | Data Engineer | Developer',
          email: 'enilamaoshoriamhe687@gmail.com',
          notificationEmail: 'enilama.oshoriamhe687@nafdac.gov.ng',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLogin: firebase.firestore.FieldValue.serverTimestamp()
      },
      domains: {
          professional: {},
          personal: {},
          financial: {},
          spiritual: {},
          emotional: {},
          relationships: {}
      },
      goals: {
          daily: [],
          weekly: [],
          monthly: [],
          quarterly: [],
          yearly: []
      },
      settings: {
          reminderFrequency: 'daily',
          selfReflectionLevel: 'intensive',
          theme: 'default'
      },
      authLogs: []
  };

  try {
      await window.firebaseDB.collection('users').doc(userId).set(initialData);
      logAuthActivity(userId, 'new_user_setup');
      return initialData;
  } catch (error) {
      console.error("Error setting up new user:", error);
      throw error;
  }
}

// Update UI with user data
function updateUserInterface(userData) {
  try {
      // Update profile section
      document.querySelector('.profile h3').textContent = userData.profile.name;
      document.querySelector('.profile p').textContent = userData.profile.role;
      
      // Initialize modules
      if (typeof loadDashboard === 'function') loadDashboard(userData);
      if (typeof loadPlanner === 'function') loadPlanner(userData);
      
      // Update last login time
      updateLastLoginTime();
  } catch (error) {
      console.error("Error updating UI:", error);
  }
}

// Update last login time in Firestore
function updateLastLoginTime() {
  const userId = window.firebaseAuth.currentUser?.uid;
  if (userId) {
      window.firebaseDB.collection('users').doc(userId).update({
          'profile.lastLogin': firebase.firestore.FieldValue.serverTimestamp()
      }).catch(error => console.error("Error updating last login:", error));
  }
}

// Log authentication activities
function logAuthActivity(userId, eventType, metadata = {}) {
  const logData = {
      eventType,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      userAgent: navigator.userAgent,
      ...metadata
  };

  // Add to user's authLogs array
  window.firebaseDB.collection('users').doc(userId).update({
      authLogs: firebase.firestore.FieldValue.arrayUnion(logData)
  }).catch(error => console.error("Error logging auth activity:", error));
}

// Set up login page event listeners
function setupLoginListeners() {
  const loginForm = document.getElementById('loginForm');
  const googleSignInBtn = document.getElementById('googleSignIn');
  const forgotPasswordLink = document.getElementById('forgotPassword');

  // Email/password login
  if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
          e.preventDefault();
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          
          // Basic validation
          if (!validateEmail(email)) {
              showToast('Please enter a valid email address', 'error');
              return;
          }
          
          if (password.length < 6) {
              showToast('Password must be at least 6 characters', 'error');
              return;
          }
          
          // Authenticate user
          window.firebaseAuth.signInWithEmailAndPassword(email, password)
              .catch(error => {
                  handleLoginError(error);
              });
      });
  }

  // Google Sign-In
  if (googleSignInBtn) {
      googleSignInBtn.addEventListener('click', function() {
          const provider = new firebase.auth.GoogleAuthProvider();
          window.firebaseAuth.signInWithPopup(provider)
              .catch(error => {
                  handleLoginError(error);
              });
      });
  }

  // Password reset
  if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener('click', function(e) {
          e.preventDefault();
          const email = document.getElementById('email').value;
          
          if (email && validateEmail(email)) {
              window.firebaseAuth.sendPasswordResetEmail(email)
                  .then(() => {
                      showToast('Password reset link sent to your email', 'success');
                  })
                  .catch(error => {
                      handleLoginError(error);
                  });
          } else {
              showToast('Please enter a valid email first', 'error');
          }
      });
  }
}

// Handle login errors
function handleLoginError(error) {
  let errorMessage = 'Login failed. Please try again.';
  
  switch (error.code) {
      case 'auth/invalid-email':
          errorMessage = 'Invalid email address format';
          break;
      case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
          errorMessage = 'Invalid email or password';
          break;
      case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Try again later or reset your password.';
          break;
  }
  
  showToast(errorMessage, 'error');
  console.error("Authentication error:", error);
}

// Email validation helper
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Toast notification
function showToast(message, type) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
      toast.classList.add('show');
      setTimeout(() => {
          toast.classList.remove('show');
          setTimeout(() => {
              document.body.removeChild(toast);
          }, 300);
      }, 3000);
  }, 100);
}

// Make logout function available globally
window.logoutUser = function() {
  window.firebaseAuth.signOut()
      .then(() => {
          window.location.href = 'login.html';
      })
      .catch(error => {
          console.error("Logout error:", error);
          showToast('Error during logout', 'error');
      });
};