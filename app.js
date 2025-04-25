const firebaseConfig = {
  apiKey: "AIzaSyC2ENtW2hXHkLUPK38GurWbDnuIq9BAUsY",
  authDomain: "holisitic-life.firebaseapp.com",
  projectId: "holisitic-life",
  storageBucket: "holisitic-life.appspot.com", // Corrected from firebasestorage.app if using appspot
  messagingSenderId: "650093402954",
  appId: "1:650093402954:web:ae6fa3518fcbf0d85d7fb3",
  measurementId: "G-SXR7DV0TZJ"
};

// Initialize Firebase
// Check if Firebase is already initialized to prevent errors on hot-reloads or multiple script includes
let app;
if (!firebase.apps.length) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app(); // If already initialized, use the existing app
}

// Initialize services and make them globally available (optional, but matches original)
// Use the app instance for initialization
const auth = firebase.auth(app);
const db = firebase.firestore(app);

// Make Firebase services available globally
window.firebaseAuth = auth;
window.firebaseDB = db;


// ==================================
// 2. Global Configuration Objects
// ==================================
const config = {
  // Auth configuration
  auth: {
    allowedEmail: 'enilamaoshoriamhe687@gmail.com'
  },

  // Dashboard configuration
  dashboard: {
    workHours: {
      start: 8, // 8 AM
      end: 22   // 10 PM
    },
    timeBlockColors: {
      work: '#4285F4',
      personal: '#EA4335',
      learning: '#FBBC05',
      health: '#34A853',
      other: '#9E9E9E'
    },
    defaultTaskDuration: 30 // minutes
  },

  // Finance configuration (Ray Dalio's Principles)
  finance: {
    diversification: {
      assets: ["Stocks", "Real Estate", "Bonds", "Commodities", "Cash", "Crypto"],
      allocation: [30, 25, 20, 15, 5, 5] // Percentage allocation
    },
    riskManagement: {
      emergencyFund: 6, // Months of expenses
      debtRatio: 0.3 // Max debt-to-income ratio
    }
  },

  // Goals configuration
  goals: {
    okrSettings: {
      maxObjectives: 5,
      maxKeyResults: 3,
      completionThreshold: 0.7 // 70% of KRs needed to mark objective complete
    },
    habitSettings: {
      habitStacking: true,
      temptationBundling: true,
      twoMinuteRule: true
    },
    smartCriteria: {
      specific: true,
      measurable: true,
      achievable: true,
      relevant: true,
      timeBound: true
    }
  },

  // Learning configuration
  learning: {
    skillLevels: [
      { value: 'beginner', label: 'Beginner', color: '#FF9800' },
      { value: 'intermediate', label: 'Intermediate', color: '#2196F3' },
      { value: 'advanced', label: 'Advanced', color: '#4CAF50' },
      { value: 'expert', label: 'Expert', color: '#9C27B0' }
    ],
    resourceTypes: [
      { value: 'book', label: 'Book', icon: 'book', color: '#2196F3' },
      { value: 'course', label: 'Course', icon: 'graduation-cap', color: '#4CAF50' },
      { value: 'article', label: 'Article', icon: 'newspaper', color: '#FF9800' },
      { value: 'video', label: 'Video', icon: 'video', color: '#E91E63' },
      { value: 'podcast', label: 'Podcast', icon: 'podcast', color: '#9C27B0' },
      { value: 'other', label: 'Other', icon: 'file-alt', color: '#9E9E9E' }
    ],
    defaultTimeUnit: 'hours',
    recommendationEngines: {
      books: 'https://www.goodreads.com/review/list',
      courses: 'https://www.coursera.org',
      articles: 'https://medium.com'
    }
  },

  // Reflection configuration
  reflection: {
    journalPrompts: [
      "What was the most meaningful moment of your day and why?",
      "What challenged you today and how did you respond?",
      "Describe a moment when you felt truly alive today",
      "What did you learn about yourself today?",
      "How did you move toward your goals today?",
      "What would make tomorrow even better?",
      "What are you currently worried about and why?",
      "Describe a conversation that impacted you today"
    ],
    gratitudeBenefits: [
      "Improves sleep quality",
      "Reduces stress and anxiety",
      "Increases happiness levels",
      "Strengthens relationships",
      "Boosts immune system",
      "Enhances self-esteem"
    ],
    analysisParameters: {
      moodWeight: 0.6,
      productivityWeight: 0.3,
      socialWeight: 0.1
    }
  }
};

// Global variable for Character data (used by spiritual module)
let biblicalCharacters = {}; // Initialize here

// ==================================
// 3. Utility Functions (Common Helpers)
// ==================================

/**
 * Displays a transient message toast.
 * @param {string} message - The message to display.
 * @param {'success' | 'error' | 'warning'} type - The type of toast (for styling).
 */
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  // Ensure there's a place to append, e.g., body
  if (document.body) {
    document.body.appendChild(toast);

    // Force a reflow before adding the 'show' class
    // eslint-disable-next-line no-unused-expressions
    toast.offsetHeight;

    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300); // Match CSS fade-out duration
    }, 3000); // How long the toast stays visible
  } else {
      console.warn("showToast called before document.body is available.");
  }
}

/**
 * Formats a number as Nigerian Naira currency.
 * @param {number} amount - The amount to format.
 * @returns {string} The formatted currency string.
 */
function formatCurrency(amount) {
  // Ensure amount is a number, default to 0 if not valid
  const numericAmount = typeof amount === 'number' ? amount : 0;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0 // No decimal places for Naira
  }).format(numericAmount);
}

/**
 * Formats a date string or Date object into a readable string.
 * @param {string | Date} dateInput - The date to format.
 * @returns {string} The formatted date string.
 */
function formatDate(dateInput) {
  if (!dateInput) return 'N/A';

  let date;
  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'string') {
    try {
        date = new Date(dateInput);
        if (isNaN(date.getTime())) { // Check for invalid date
            return 'Invalid Date';
        }
    } catch (e) {
        console.error("Error parsing date string:", dateInput, e);
        return 'Invalid Date';
    }
  } else if (dateInput && typeof dateInput.toDate === 'function') { // Handle Firestore Timestamp
      try {
          date = dateInput.toDate();
      } catch (e) {
          console.error("Error converting Firestore Timestamp to Date:", dateInput, e);
          return 'Invalid Date';
      }
  }
  else {
    return 'N/A'; // Handle other input types
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Validates an email address format.
 * @param {string} email - The email string to validate.
 * @returns {boolean} True if the email format is valid, false otherwise.
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Make logout function available globally
window.logoutUser = function() {
  // Use the auth instance defined earlier
  auth.signOut()
    .then(() => {
      // Redirect to login page after successful sign out
      window.location.href = 'login.html';
    })
    .catch(error => {
      console.error("Logout error:", error);
      showToast('Error during logout', 'error');
    });
};


// ==================================
// 4. Authentication Module
// ==================================

// Initialize authentication state listener
// This is the *entry point* after Firebase SDK loads and DOM is ready
function initAuthState() {
  // Use the auth instance defined earlier
  auth.onAuthStateChanged(user => {
    if (user) {
      handleAuthenticatedUser(user);
    } else {
      handleUnauthenticatedUser();
    }
  });
}

// Handle authenticated user flow
async function handleAuthenticatedUser(user) {
  // Use the allowed email from the global config
  if (user.email === config.auth.allowedEmail) {
    // Log successful authentication
    logAuthActivity(user.uid, 'authenticated');

    try {
      // Load user data
      const userData = await loadUserData(user.uid);

      // Update UI and initialize modules only AFTER user data is loaded
      updateUserInterface(userData);
      updateLastLoginTime(); // Update last login async

      // Redirect logic (only if on login page)
      if (window.location.pathname.endsWith('login.html')) {
        setTimeout(() => window.location.href = 'index.html', 500);
      } else {
         // For non-login pages, initialize the specific module for the current page
         const path = window.location.pathname;
         const page = path.split('/').pop().replace('.html', '') || 'index'; // Handles index.html and root /
         initializeModuleForPage(page);
      }

    } catch (error) {
      console.error("Error loading user data or initializing modules:", error);
      showToast('Error loading your data. Please refresh.', 'error');
      // Potentially force sign out if data loading fails critically
      auth.signOut();
    }

  } else {
    // Handle unauthorized access
    handleUnauthorizedAccess(user);
  }
}

// Handle unauthorized access attempts
function handleUnauthorizedAccess(user) {
  // Use the auth instance defined earlier
  logAuthActivity(user.uid, 'unauthorized_attempt', { email: user.email });

  // Sign out and redirect
  auth.signOut()
    .then(() => {
      // Redirect only if not already on the login page
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
  // Redirect only if not already on the login page
  if (!window.location.pathname.endsWith('login.html')) {
    window.location.href = 'login.html';
  }
}

// Load user data from Firestore
async function loadUserData(userId) {
  try {
    // Use the db instance defined earlier
    const doc = await db.collection('users').doc(userId).get();

    if (doc.exists) {
      return doc.data();
    } else {
      // If user document doesn't exist, set up a new one
      return await setupNewUser(userId);
    }
  } catch (error) {
    console.error("Error in loadUserData:", error);
    throw error; // Re-throw to be caught by the caller
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
    // Use the db instance defined earlier
    await db.collection('users').doc(userId).set(initialData);
    logAuthActivity(userId, 'new_user_setup');
    return initialData; // Return initial data so the UI can be updated immediately
  } catch (error) {
    console.error("Error setting up new user:", error);
    throw error; // Re-throw to be caught by the caller
  }
}

// Update UI with user data (e.g., name, role in header)
function updateUserInterface(userData) {
  try {
    // Check if elements exist before updating
    const profileNameEl = document.querySelector('.profile h3');
    const profileRoleEl = document.querySelector('.profile p');

    if (profileNameEl && userData?.profile?.name) {
      profileNameEl.textContent = userData.profile.name;
    }
    if (profileRoleEl && userData?.profile?.role) {
      profileRoleEl.textContent = userData.profile.role;
    }

    // Note: Module-specific UI updates happen within the initModuleForPage calls
    // where specific page elements are expected to exist.

  } catch (error) {
    console.error("Error updating UI:", error);
  }
}

// Update last login time in Firestore
function updateLastLoginTime() {
  // Use the auth instance defined earlier
  const userId = auth.currentUser?.uid; // Use optional chaining
  if (userId) {
    // Use the db instance defined earlier
    db.collection('users').doc(userId).update({
      'profile.lastLogin': firebase.firestore.FieldValue.serverTimestamp()
    }).catch(error => console.error("Error updating last login:", error));
  }
}

// Log authentication activities
function logAuthActivity(userId, eventType, metadata = {}) {
  // Use the db instance defined earlier
  const logData = {
    eventType,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    userAgent: navigator.userAgent,
    ...metadata
  };

  // Add to user's authLogs array
  db.collection('users').doc(userId).update({
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

      // Basic validation using utility function
      if (!validateEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
      }

      if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
      }

      // Authenticate user using the auth instance
      auth.signInWithEmailAndPassword(email, password)
        .catch(handleLoginError);
    });
  }

  // Google Sign-In
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', function() {
      const provider = new firebase.auth.GoogleAuthProvider();
      // Authenticate using popup with the auth instance
      auth.signInWithPopup(provider)
        .catch(handleLoginError);
    });
  }

  // Password reset
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', function(e) {
      e.preventDefault();
      const emailInput = document.getElementById('email');
      const email = emailInput ? emailInput.value : '';

      if (email && validateEmail(email)) {
        // Send password reset email using the auth instance
        auth.sendPasswordResetEmail(email)
          .then(() => {
            showToast('Password reset link sent to your email', 'success');
          })
          .catch(handleLoginError);
      } else {
        showToast('Please enter a valid email first', 'error');
      }
    });
  }
}

// Handle login errors (using utility function)
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
    default:
        errorMessage = `Login failed: ${error.message}`; // Catch other errors
        break;
  }

  showToast(errorMessage, 'error');
  console.error("Authentication error:", error);
}


// ==================================
// 5. Module Initialization Dispatcher
// ==================================

/**
 * Initializes the appropriate module based on the current page.
 * This is called *only after* a user is authenticated and data is loaded.
 * @param {string} page - The base name of the current HTML file (e.g., 'dashboard', 'finance').
 */
function initializeModuleForPage(page) {
     // Check if the main element for the page exists before initializing
     // This prevents errors if a module function is called on the wrong page template
    switch(page) {
      case 'index':
      case 'dashboard':
        if (document.getElementById('dashboard')) {
          console.log("Initializing Dashboard Module");
          initDashboard();
        } else {
            console.warn(`Dashboard element not found on page: ${page}. Skipping Dashboard init.`);
        }
        break;
      case 'finance':
         if (document.getElementById('finance')) {
            console.log("Initializing Finance Module");
            initFinanceModule();
         } else {
             console.warn(`Finance element not found on page: ${page}. Skipping Finance init.`);
         }
        break;
      case 'goals':
         if (document.getElementById('goals')) {
            console.log("Initializing Goals Module");
            initGoalsModule();
         } else {
              console.warn(`Goals element not found on page: ${page}. Skipping Goals init.`);
         }
        break;
      case 'learning':
        if (document.getElementById('learning')) {
            console.log("Initializing Learning Module");
            initLearningModule();
        } else {
             console.warn(`Learning element not found on page: ${page}. Skipping Learning init.`);
        }
        break;
      case 'planner':
         if (document.getElementById('daily')) { // Assuming planner page ID is 'daily' based on original initPlannerModule
            console.log("Initializing Planner Module");
            initPlannerModule();
         } else {
             console.warn(`Planner element not found on page: ${page}. Skipping Planner init.`);
         }
        break;
      case 'professional':
        if (document.getElementById('professional')) {
             console.log("Initializing Professional Module");
             initProfessionalModule();
        } else {
            console.warn(`Professional element not found on page: ${page}. Skipping Professional init.`);
        }
        break;
      case 'reflection':
        if (document.getElementById('reflection')) {
            console.log("Initializing Reflection Module");
            initReflectionModule();
        } else {
            console.warn(`Reflection element not found on page: ${page}. Skipping Reflection init.`);
        }
        break;
      case 'relationships':
         if (document.getElementById('relationships')) {
            console.log("Initializing Relationships Module");
            initRelationships();
         } else {
            console.warn(`Relationships element not found on page: ${page}. Skipping Relationships init.`);
         }
        break;
      case 'spiritual':
        if (document.getElementById('spiritual')) {
            console.log("Initializing Spiritual Module");
            initSpiritual();
        } else {
            console.warn(`Spiritual element not found on page: ${page}. Skipping Spiritual init.`);
        }
        break;
      case 'login':
        // Login page handles its own setup via setupLoginListeners
        console.log("On Login Page, skipping module initialization.");
        break;
      default:
        console.warn(`No specific module initialization for page: ${page}`);
        break;
    }
}


// ==================================
// 6. Dashboard Module
// ==================================

function initDashboard() {
  // Ensure elements exist before trying to update them
  if (document.getElementById('dashboard')) {
    updateDateTime();
    // Clear previous intervals before setting a new one
    if (window._dashboardDateTimeInterval) clearInterval(window._dashboardDateTimeInterval);
    window._dashboardDateTimeInterval = setInterval(updateDateTime, 60000); // Update every minute

    loadGoalProgress();
    initializeCharts();
    loadDeadlines();
    loadProjectProgress();
  } else {
      console.warn("initDashboard called, but #dashboard element not found.");
  }
}

function updateDateTime() {
  const now = new Date();
  const dateEl = document.getElementById('current-date');
  const timeEl = document.getElementById('current-time');

  if (dateEl) {
    dateEl.textContent =
      now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
  }
  if (timeEl) {
    timeEl.textContent =
      now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
  }
}

function loadGoalProgress() {
  // Use the auth and db instances defined earlier
  const userId = auth.currentUser?.uid;
  if (!userId) return; // Ensure user is logged in

  const today = new Date().toISOString().split('T')[0];

  db.collection('users').doc(userId).collection('dailyTasks')
    .where('date', '==', today)
    .onSnapshot(snapshot => {
      let completed = 0;
      let total = 0;

      snapshot.forEach(doc => {
        total++;
        if (doc.data().completed) completed++;
      });

      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      updateProgressCircle(progress);
      // Assuming updateGoalProgressBars exists or is intended to be added
      // updateGoalProgressBars(completed, total);
    }, error => {
        console.error("Error loading daily tasks for goal progress:", error);
        // Handle snapshot error if needed
    });
}

function updateProgressCircle(percentage) {
  const circle = document.querySelector('.progress-circle');
  const valueEl = document.querySelector('.progress-value');
  if (circle) {
    circle.style.background =
      `conic-gradient(var(--primary-color) ${percentage}%, var(--gray-color) 0)`;
  }
  if (valueEl) {
      valueEl.textContent = `${percentage}%`;
  }
}

// Placeholder for updateGoalProgressBars if it's used elsewhere
function updateGoalProgressBars(completed, total) {
    // Implementation needed if this function is actually used in the UI
    // console.log(`Daily goals: ${completed} / ${total}`);
}


function loadProjectProgress() {
  // Use the auth and db instances defined earlier
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  db.collection('users').doc(userId).collection('projects')
    .where('status', '==', 'active')
    // Add ordering if needed, e.g., orderBy('deadline')
    .onSnapshot(snapshot => {
      const container = document.getElementById('project-progress');
      if (!container) return;

      container.innerHTML = ''; // Clear current projects

      snapshot.forEach(doc => {
        const project = doc.data();
        // Ensure project.target is not zero to avoid division by zero
        const progress = project.target > 0 ? Math.round((project.current / project.target) * 100) : 0;

        const projectEl = document.createElement('div');
        projectEl.className = 'project-item';

        // Safely format deadline
        const deadlineDate = project.deadline ? formatDate(project.deadline.toDate()) : 'No deadline';

        projectEl.innerHTML = `
          <div class="project-header">
            <h4>${project.name || 'Unnamed Project'}</h4>
            <span>${progress}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          <div class="project-meta">
            <span>${project.current || 0}/${project.target || 0} ${project.unit || ''}</span>
            <span>Due: ${deadlineDate}</span>
          </div>
        `;
        container.appendChild(projectEl);
      });

       if (snapshot.empty && container.parentNode) {
           // Display a message if no active projects
           container.parentNode.innerHTML = '<p>No active projects to display.</p>';
       }

    }, error => {
        console.error("Error loading project progress:", error);
        // Handle snapshot error
    });
}


function initializeCharts() {
    // Check if Chart is available (from CDN) and if the canvas elements exist
    if (typeof Chart === 'undefined') {
        console.error("Chart.js is not loaded. Skipping chart initialization.");
        return;
    }

    const focusCtx = document.getElementById('focusChart')?.getContext('2d');
    const growthCtx = document.getElementById('growthChart')?.getContext('2d');

    if (focusCtx) {
        // Destroy existing chart instance if it exists to prevent duplicates
        if (focusCtx.chart) focusCtx.chart.destroy();

        focusCtx.chart = new Chart(focusCtx, { // Store chart instance on context
            type: 'doughnut',
            data: {
                labels: ['Professional', 'Learning', 'Health', 'Relationships', 'Financial'],
                datasets: [{
                    data: [30, 25, 20, 15, 10], // Example data
                    backgroundColor: [
                        '#6200ea', '#03dac6', '#4caf50', '#ff9800', '#e91e63'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: { enabled: true }
                }
            }
        });
    } else {
        console.warn("focusChart canvas not found.");
    }

    if (growthCtx) {
        // Destroy existing chart instance
        if (growthCtx.chart) growthCtx.chart.destroy();

        growthCtx.chart = new Chart(growthCtx, { // Store chart instance on context
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], // Example labels
                datasets: [{
                    label: 'Overall Progress',
                    data: [65, 70, 68, 75, 82, 87], // Example data
                    borderColor: '#6200ea',
                    tension: 0.3,
                    fill: true,
                    backgroundColor: 'rgba(98, 0, 234, 0.1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { callback: value => `${value}%` }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => `Progress: ${ctx.parsed.y}%`
                        }
                    }
                }
            }
        });
    } else {
        console.warn("growthChart canvas not found.");
    }
}


function loadDeadlines() {
  // Use the auth and db instances defined earlier
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  const now = new Date();
  // Set time to start of day for comparison
  now.setHours(0, 0, 0, 0);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  db.collection('users').doc(userId).collection('deadlines')
    .where('date', '>=', now)
    .where('date', '<=', nextWeek)
    .orderBy('date', 'asc') // Order by date
    .onSnapshot(snapshot => {
      const container = document.querySelector('.deadline-list');
      if (!container) return;

      container.innerHTML = ''; // Clear current deadlines

      if (snapshot.empty) {
          container.innerHTML = '<li>No upcoming deadlines this week.</li>';
          return;
      }

      snapshot.forEach(doc => {
        const deadline = doc.data();
        // Ensure deadline.date is a Firestore Timestamp before converting
        const date = deadline.date && typeof deadline.date.toDate === 'function' ? deadline.date.toDate() : new Date('Invalid Date');

        if (isNaN(date.getTime())) {
            console.warn("Invalid deadline date found:", deadline);
            return; // Skip this deadline if date is invalid
        }

        // Calculate days left relative to *today*
        const today = new Date();
        today.setHours(0,0,0,0);
        const deadlineDateStartOfDay = new Date(date);
        deadlineDateStartOfDay.setHours(0,0,0,0);

        const daysLeft = Math.ceil((deadlineDateStartOfDay - today) / (1000 * 60 * 60 * 24));

        const deadlineEl = document.createElement('li');
        deadlineEl.innerHTML = `
          <span class="deadline-date ${daysLeft <= 3 ? 'urgent' : ''}">
            ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          ${deadline.title || 'Unnamed Deadline'}
          ${daysLeft < 0 ? '<span class="badge overdue">Overdue</span>' :
           (daysLeft === 0 ? '<span class="badge urgent">Due Today</span>' :
            `<span class="days-left">${daysLeft}d left</span>`)}
        `;
        container.appendChild(deadlineEl);
      });
    }, error => {
        console.error("Error loading deadlines:", error);
        const container = document.querySelector('.deadline-list');
         if (container) {
             container.innerHTML = '<li>Error loading deadlines.</li>';
         }
    });
}


// ==================================
// 7. Finance Module
// ==================================

// Ray Dalio's Principles Configuration - Already defined in Global Config (section 2)
// const dalioPrinciples = config.finance; // Access from config object

function initFinanceModule() {
    // Check if element exists
    if (document.getElementById('finance')) {
        console.log("Initializing Finance Module");
        loadFinancialHealth();
        setupFinanceListeners();
        loadWealthBuildingStrategies();
        loadPurchaseGoals();
    } else {
        console.warn("initFinanceModule called, but #finance element not found.");
    }
}

// Financial Health Dashboard
function loadFinancialHealth() {
    // Use the auth and db instances defined earlier
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Listen to the 'currentState' document in the user's finance subcollection
    db.collection('users').doc(userId).collection('finance')
        .doc('currentState').onSnapshot(doc => {
            if (doc.exists) {
                const data = doc.data();
                updateFinancialOverview(data);
                createNetWorthProjection(data); // This function might need data.monthlySavings
                generateAdvice(data); // This function needs data.monthlyExpenses
            } else {
                console.warn("Finance currentState document not found for user:", userId);
                // Optionally, initialize default finance state here or prompt user
                // initializeFinanceState(userId); // Need to implement this function
            }
        }, error => {
             console.error("Error loading financial health data:", error);
             showToast('Error loading financial health data', 'error');
        });
}

// Placeholder for initializeFinanceState
// async function initializeFinanceState(userId) {
//     const initialFinanceData = {
//         savings: 0,
//         monthlyIncome: 0,
//         monthlyExpenses: 0,
//         netWorth: 0,
//         variableIncome: 0,
//         monthlySavings: 0, // Add monthlySavings if needed for projection
//     };
//     try {
//         await db.collection('users').doc(userId).collection('finance').doc('currentState').set(initialFinanceData);
//         console.log("Initial finance state set up for user:", userId);
//         updateFinancialOverview(initialFinanceData);
//         createNetWorthProjection(initialFinanceData);
//         generateAdvice(initialFinanceData);
//     } catch (error) {
//         console.error("Error initializing finance state:", error);
//         showToast('Failed to initialize finance data', 'error');
//     }
// }


function updateFinancialOverview(data) {
    // Use optional chaining and nullish coalescing for robustness
    const savingsEl = document.getElementById('current-savings');
    const incomeEl = document.getElementById('monthly-income');
    const netWorthEl = document.getElementById('net-worth');

    if (savingsEl) savingsEl.textContent = formatCurrency(data?.savings ?? 0);
    if (incomeEl) incomeEl.textContent = formatCurrency(data?.monthlyIncome ?? 0);
    if (netWorthEl) netWorthEl.textContent = formatCurrency(data?.netWorth ?? 0);

    // Income Breakdown Chart
    const incomeCtx = document.getElementById('incomeChart')?.getContext('2d');
    if (incomeCtx) {
         // Destroy existing chart instance
        if (incomeCtx.chart) incomeCtx.chart.destroy();

        incomeCtx.chart = new Chart(incomeCtx, {
            type: 'doughnut',
            data: {
                labels: ['Fixed Income', 'Allowances', 'Variable Income'],
                // Ensure data points are numbers
                datasets: [{
                    data: [
                        data?.fixedIncome ?? 153000, // Example default if not provided
                        data?.allowances ?? 1684800, // Example default
                        data?.variableIncome ?? 0
                    ],
                    backgroundColor: ['#4CAF50', '#2196F3', '#FF9800']
                }]
            },
            options: {
                 responsive: true,
                 maintainAspectRatio: false,
                 plugins: {
                     legend: { position: 'bottom' },
                     tooltip: { enabled: true }
                 }
            }
        });
    } else {
         console.warn("incomeChart canvas not found.");
    }
}

// Wealth Building Engine
function createNetWorthProjection(data) {
    const netWorthCtx = document.getElementById('netWorthChart')?.getContext('2d');
    if (!netWorthCtx) {
        console.warn("netWorthChart canvas not found.");
        return;
    }

     // Destroy existing chart instance
    if (netWorthCtx.chart) netWorthCtx.chart.destroy();


    const projectionYears = 10;
    const projections = [];
    // Use data from the loaded state, default to 0 if undefined
    let currentNetWorth = data?.netWorth ?? 0;
    // Assuming monthlySavings is a field in your finance currentState document
    const monthlyInvestment = data?.monthlySavings ?? 0;
    const annualInvestment = monthlyInvestment * 12;

    for (let year = 1; year <= projectionYears; year++) {
        currentNetWorth += annualInvestment;
        // Compound interest at conservative 10% annual return (0.10)
        // Apply interest after adding investment
        currentNetWorth *= 1.10;
        projections.push(Math.round(currentNetWorth)); // Round to nearest whole number
    }

    netWorthCtx.chart = new Chart(netWorthCtx, {
        type: 'line',
        data: {
            labels: Array.from({length: projectionYears}, (_, i) => `Year ${i+1}`),
            datasets: [{
                label: 'Projected Net Worth',
                data: projections,
                borderColor: '#6200ea',
                tension: 0.3,
                fill: false // Line chart without fill
            }]
        },
         options: {
             responsive: true,
             maintainAspectRatio: false,
             scales: {
                 y: {
                     beginAtZero: true,
                     ticks: {
                         callback: function(value) {
                             // Format tick labels as currency
                             return formatCurrency(value);
                         }
                     }
                 }
             },
              plugins: {
                  legend: { display: true },
                  tooltip: {
                      callbacks: {
                          label: function(context) {
                              let label = context.dataset.label || '';
                              if (label) {
                                  label += ': ';
                              }
                              label += formatCurrency(context.parsed.y);
                              return label;
                          }
                      }
                  }
              }
         }
    });
}

// Personalized Advice Generator
function generateAdvice(data) {
    const adviceContainer = document.getElementById('financial-advice');
     if (!adviceContainer) {
        console.warn("financial-advice container not found.");
        return;
     }

    // Use data from the loaded state, default to reasonable values if undefined
    const savings = data?.savings ?? 0;
    const monthlyExpenses = data?.monthlyExpenses ?? 100000; // Default if expenses are not set
    const netWorth = data?.netWorth ?? 0;

    // Access Dalio principles from config
    const emergencyFundMonths = config.finance.riskManagement.emergencyFund;
    const emergencyFundTarget = monthlyExpenses * emergencyFundMonths;

    let adviceHTML = '';

    // Emergency Fund Advice
    const monthsCoverage = monthlyExpenses > 0 ? Math.round((savings / monthlyExpenses) * 100) / 100 : 0;
     if (savings < emergencyFundTarget) {
         adviceHTML += `
            <div class="advice-card critical">
                <h4>🛑 Immediate Action Required</h4>
                <p>Your current savings (₦${formatCurrency(savings)}) only cover
                ${monthsCoverage} months of expenses.
                Build your emergency fund to ₦${formatCurrency(emergencyFundTarget)} (${emergencyFundMonths} months coverage).</p>
            </div>
         `;
     } else {
          adviceHTML += `
             <div class="advice-card success">
                 <h4>✅ Emergency Fund Status</h4>
                 <p>Great job! Your emergency fund covers ${monthsCoverage} months of expenses, exceeding the ${emergencyFundMonths}-month target.</p>
             </div>
          `;
     }


    // Dalio's Allocation Strategy Advice
    adviceHTML += `
        <div class="advice-card">
            <h4>💡 Dalio's Allocation Strategy</h4>
            <p>Consider diversifying your investments according to Ray Dalio's All-Weather portfolio principles:</p>
            <ul>
                ${config.finance.diversification.assets.map((asset, index) =>
                    `<li>${asset}: ${config.finance.diversification.allocation[index]}%</li>`
                ).join('')}
            </ul>
             <p>Note: This is a general principle. Adjust based on your personal risk tolerance and financial goals.</p>
        </div>
    `;

    // Over-Liquidity Warning (if savings are a large portion of net worth)
    if (netWorth > 0 && (savings / netWorth) > 0.5 && savings > emergencyFundTarget * 2) { // Only warn if net worth is positive and savings are significant
        adviceHTML += `
            <div class="advice-card warning">
                <h4>⚠️ Over-Liquidity Warning</h4>
                <p>You're holding a significant amount of cash (${Math.round((savings / netWorth) * 100)}% of your net worth).
                While essential for emergencies, consider allocating funds beyond your emergency target to income-generating assets for growth.</p>
            </div>
        `;
    }

    // Debt Ratio Advice (assuming you have a debt field in finance state)
    // const debt = data?.debt ?? 0;
    // const annualIncome = (data?.monthlyIncome ?? 0) * 12;
    // const debtToIncomeRatio = annualIncome > 0 ? debt / annualIncome : 0;
    // if (debtToIncomeRatio > config.finance.riskManagement.debtRatio) {
    //      adviceHTML += `
    //         <div class="advice-card critical">
    //             <h4>❗️ High Debt-to-Income Ratio</h4>
    //             <p>Your debt-to-income ratio (${debtToIncomeRatio.toFixed(2)}) exceeds the recommended ${config.finance.riskManagement.debtRatio}. Prioritize reducing high-interest debt.</p>
    //         </div>
    //      `;
    // }


    adviceContainer.innerHTML = adviceHTML;
}

// Savings Goal System
function setupFinanceListeners() {
    const saveGoalForm = document.getElementById('saveGoalForm');
    if (saveGoalForm) {
        saveGoalForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Use the auth and db instances defined earlier
            const userId = auth.currentUser?.uid;
             if (!userId) {
                showToast('User not authenticated', 'error');
                return;
             }

            // Get form values, ensure parsing to numbers where needed
            const goal = {
                name: document.getElementById('goalName').value.trim(),
                target: parseFloat(document.getElementById('goalAmount').value) || 0,
                current: parseFloat(document.getElementById('currentSaved').value) || 0,
                deadline: new Date(document.getElementById('goalDeadline').value), // Store as Date or Timestamp
                created: firebase.firestore.FieldValue.serverTimestamp(), // Use server timestamp
                status: 'active' // Add status field
            };

            // Basic validation
            if (!goal.name || goal.target <= 0 || isNaN(goal.deadline.getTime())) {
                 showToast('Please enter valid goal details', 'error');
                 return;
            }

            try {
                await db.collection('users').doc(userId).collection('financialGoals').add(goal);

                showToast('Savings goal added successfully');
                saveGoalForm.reset(); // Reset form
            } catch (error) {
                console.error("Error adding savings goal:", error);
                showToast('Failed to add savings goal', 'error');
            }
        });
    } else {
        console.warn("saveGoalForm not found. Skipping finance listeners setup.");
    }
}

// Purchase Tracking System
function loadPurchaseGoals() {
     // Use the auth and db instances defined earlier
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const container = document.getElementById('purchase-goals');
    if (!container) {
        console.warn("purchase-goals container not found.");
        return;
    }

    db.collection('users').doc(userId).collection('purchaseGoals')
        .where('status', '!=', 'completed') // Only show active goals
        .orderBy('deadline') // Order by deadline
        .onSnapshot(snapshot => {
            container.innerHTML = ''; // Clear current goals

             if (snapshot.empty) {
                 container.innerHTML = '<p>No active purchase goals.</p>';
                 return;
             }

            snapshot.forEach(doc => {
                const goal = doc.data();
                const goalId = doc.id; // Get document ID

                // Ensure current and target are numbers, default to 0
                const currentSaved = goal?.current ?? 0;
                const targetAmount = goal?.target ?? 0;

                const progress = targetAmount > 0 ? (currentSaved / targetAmount) * 100 : 0;

                // Calculate months left safely
                 let monthsLeft = 0;
                 if (goal.deadline && goal.deadline.toDate) { // Check if it's a Firestore Timestamp
                      const deadlineDate = goal.deadline.toDate();
                      const now = new Date();
                      const diffTime = deadlineDate.getTime() - now.getTime();
                      monthsLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44))); // Average days in month
                 } else if (goal.deadline instanceof Date) { // Check if it's a Date object
                     const now = new Date();
                     const diffTime = goal.deadline.getTime() - now.getTime();
                     monthsLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44)));
                 } else {
                     console.warn("Invalid deadline date for purchase goal:", goal.name, goal.deadline);
                 }


                const neededPerMonth = monthsLeft > 0 ? (targetAmount - currentSaved) / monthsLeft : (targetAmount - currentSaved);

                const goalHTML = `
                    <div class="purchase-card" data-id="${goalId}">
                        <div class="purchase-header">
                            <h4>${goal.name || 'Unnamed Goal'}</h4>
                            <span>${progress.toFixed(1)}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${Math.min(100, progress)}%"></div>
                        </div>
                        <div class="purchase-meta">
                            <span>₦${formatCurrency(currentSaved)}/₦${formatCurrency(targetAmount)}</span>
                            <span>${monthsLeft} ${monthsLeft === 1 ? 'month' : 'months'} left</span>
                        </div>
                        <div class="saving-plan">
                            Need to save ₦${formatCurrency(Math.max(0, neededPerMonth))}/month
                        </div>
                         <div class="purchase-actions">
                             <button class="btn-icon btn-add-saving" data-id="${goalId}"><i class="fas fa-plus"></i></button>
                              <button class="btn-icon btn-edit-goal" data-id="${goalId}"><i class="fas fa-edit"></i></button>
                              <button class="btn-icon btn-delete-goal" data-id="${goalId}"><i class="fas fa-trash"></i></button>
                         </div>
                    </div>
                `;

                container.insertAdjacentHTML('beforeend', goalHTML);
            });

             // Add event listeners to newly added buttons
             container.querySelectorAll('.btn-add-saving').forEach(button => {
                 button.addEventListener('click', handleAddSavingClick);
             });
              container.querySelectorAll('.btn-edit-goal').forEach(button => {
                  button.addEventListener('click', handleEditPurchaseGoalClick);
              });
               container.querySelectorAll('.btn-delete-goal').forEach(button => {
                  button.addEventListener('click', handleDeletePurchaseGoalClick);
              });

        }, error => {
             console.error("Error loading purchase goals:", error);
             if (container) {
                 container.innerHTML = '<p>Error loading purchase goals.</p>';
             }
        });
}

// Handle adding savings to a purchase goal (Placeholder)
function handleAddSavingClick(e) {
    const goalId = e.currentTarget.dataset.id;
    const amountStr = prompt("Enter amount saved:");
     const amount = parseFloat(amountStr);

     if (amountStr !== null && !isNaN(amount) && amount > 0) {
         const userId = auth.currentUser?.uid;
         if (!userId) return;

         // Fetch current goal data first
         db.collection('users').doc(userId).collection('purchaseGoals').doc(goalId).get()
            .then(doc => {
                if (doc.exists) {
                    const currentGoal = doc.data();
                    const newCurrent = (currentGoal.current || 0) + amount;

                    // Update the document
                    db.collection('users').doc(userId).collection('purchaseGoals').doc(goalId).update({
                        current: newCurrent,
                         updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    })
                    .then(() => {
                         showToast(`Added ₦${formatCurrency(amount)} to goal`);
                         // UI will update automatically via snapshot listener
                    })
                    .catch(error => {
                        console.error("Error updating purchase goal current amount:", error);
                        showToast('Failed to update goal', 'error');
                    });
                } else {
                    showToast('Goal not found', 'error');
                }
            })
            .catch(error => {
                 console.error("Error fetching purchase goal for update:", error);
                 showToast('Failed to fetch goal data', 'error');
            });
     } else if (amountStr !== null) {
         showToast('Please enter a valid positive number', 'warning');
     }
}

// Handle editing a purchase goal (Placeholder)
function handleEditPurchaseGoalClick(e) {
    const goalId = e.currentTarget.dataset.id;
    showToast(`Edit goal feature not fully implemented for ID: ${goalId}`, 'info');
    // In a full app, you'd open a modal pre-filled with goal data
    // and allow editing name, target, deadline, etc.
}

// Handle deleting a purchase goal (Placeholder)
function handleDeletePurchaseGoalClick(e) {
    const goalId = e.currentTarget.dataset.id;
    if (confirm('Are you sure you want to delete this purchase goal?')) {
        const userId = auth.currentUser?.uid;
         if (!userId) return;

        db.collection('users').doc(userId).collection('purchaseGoals').doc(goalId).delete()
            .then(() => {
                 showToast('Purchase goal deleted');
                 // UI will update automatically via snapshot listener
            })
            .catch(error => {
                console.error("Error deleting purchase goal:", error);
                showToast('Failed to delete goal', 'error');
            });
    }
}


// ==================================
// 8. Goals Module
// ==================================

// Global Configuration - Already defined in Section 2
// const goalConfig = config.goals;

// Initialize Goals Module
function initGoalsModule() {
     // Check if element exists
    if (document.getElementById('goals')) {
         console.log("Initializing Goals Module");
        loadAllGoals();
        setupGoalListeners();
        renderMotivationalContent();
    } else {
         console.warn("initGoalsModule called, but #goals element not found.");
    }
}

// Load All Goal Types
function loadAllGoals() {
    // Use the auth and db instances defined earlier
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Load OKRs (Objectives and Key Results)
    db.collection('users').doc(userId).collection('okrs')
      .where('archived', '==', false)
      .orderBy('priority', 'desc')
      .onSnapshot(handleOkrUpdate, error => {
          console.error("Error loading OKRs:", error);
          showToast('Error loading OKRs', 'error');
      });

    // Load Habits (Atomic Habits system)
    db.collection('users').doc(userId).collection('habits')
      .onSnapshot(handleHabitsUpdate, error => {
           console.error("Error loading Habits:", error);
           showToast('Error loading Habits', 'error');
      });

    // Load SMART Goals
    db.collection('users').doc(userId).collection('smartGoals')
      .where('completed', '==', false)
      .orderBy('deadline', 'asc') // Order by deadline
      .onSnapshot(handleSmartGoalsUpdate, error => {
           console.error("Error loading SMART Goals:", error);
           showToast('Error loading SMART Goals', 'error');
      });
}

// ================
// OKR SYSTEM (Google's Methodology)
// ================
function handleOkrUpdate(snapshot) {
    const container = document.getElementById('okr-container');
     if (!container) {
        console.warn("okr-container not found.");
        return;
     }
    container.innerHTML = ''; // Clear existing OKRs

    if (snapshot.empty) {
        container.innerHTML = '<p>No active OKRs. Time to set some objectives!</p>';
        return;
    }

    snapshot.forEach(doc => {
      const okr = doc.data();
      const completionRate = calculateOkrCompletion(okr);

      const okrElement = document.createElement('div');
      okrElement.className = `okr-card ${completionRate >= config.goals.okrSettings.completionThreshold ? 'completed' : ''}`; // Use config threshold
      okrElement.dataset.id = doc.id; // Add ID for actions

      okrElement.innerHTML = `
        <div class="okr-header">
          <h3>${okr.objective || 'Unnamed Objective'}</h3>
          <div class="okr-meta">
            <span class="priority-badge">Priority: ${okr.priority || 'N/A'}</span>
            <span class="completion-rate">${Math.round(completionRate * 100)}%</span>
          </div>
        </div>
        <div class="key-results">
          ${Array.isArray(okr.keyResults) ? okr.keyResults.map(kr => `
            <div class="kr-item" data-krid="${kr.id}">
              <input type="checkbox" ${kr.completed ? 'checked' : ''}
                     data-okr-id="${doc.id}" data-kr-id="${kr.id}">
              <label>${kr.description || 'Unnamed Key Result'}</label>
              <div class="kr-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${kr.progress || 0}%"></div>
                </div>
                <span>${kr.progress || 0}%</span>
              </div>
            </div>
          `).join('') : '<p>No Key Results defined.</p>'}
        </div>
        <div class="okr-actions">
          <button class="btn btn-sm btn-edit-okr" data-id="${doc.id}">Edit</button>
          <button class="btn btn-sm btn-archive-okr" data-id="${doc.id}">Archive</button>
        </div>
      `;
      container.appendChild(okrElement);
    });
}

function calculateOkrCompletion(okr) {
    if (!okr || !Array.isArray(okr.keyResults) || okr.keyResults.length === 0) {
        return 0; // No key results or invalid data means 0% completion
    }
    const completedKRs = okr.keyResults.filter(kr => kr.completed).length;
    return completedKRs / okr.keyResults.length;
}

// ================
// ATOMIC HABITS SYSTEM
// ================
function handleHabitsUpdate(snapshot) {
    const container = document.getElementById('habits-container');
     if (!container) {
         console.warn("habits-container not found.");
         return;
     }
    container.innerHTML = ''; // Clear existing habits

    if (snapshot.empty) {
        container.innerHTML = '<p>No habits tracked. Start building better habits!</p>';
        return;
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    snapshot.forEach(doc => {
      const habit = doc.data();
      const habitId = doc.id; // Get habit ID
      // Ensure completionDates is an array, default to empty array if null/undefined
      const completionDates = Array.isArray(habit.completionDates) ? habit.completionDates : [];

      const streak = calculateStreak(completionDates);
      const completionToday = completionDates.includes(todayStr);

      const habitElement = document.createElement('div');
      habitElement.className = `habit-card ${streak >= 30 ? 'platinum' : streak >= 7 ? 'golden' : streak >= 3 ? 'silver' : ''}`; // Tiers for streaks
      habitElement.dataset.id = habitId; // Add ID for actions

      habitElement.innerHTML = `
        <div class="habit-header">
          <h4>${habit.name || 'Unnamed Habit'}</h4>
          <span class="streak-counter">🔥 ${streak}</span>
        </div>
        <p class="habit-cue">${habit.cue || 'No cue defined.'}</p>
        <div class="habit-actions">
          <button class="btn btn-sm btn-complete-habit ${completionToday ? 'completed' : ''}"
                  data-id="${habitId}" data-date="${todayStr}">
            ${completionToday ? 'Completed Today' : 'Mark Complete'}
          </button>
           <button class="btn btn-sm btn-edit-habit" data-id="${habitId}">Edit</button>
           <button class="btn btn-sm btn-delete-habit" data-id="${habitId}">Delete</button>
        </div>
        <div class="habit-calendar">
          ${renderMiniCalendar(completionDates)}
        </div>
      `;
      container.appendChild(habitElement);
    });
}

function calculateStreak(completionDates) {
    if (!Array.isArray(completionDates) || completionDates.length === 0) {
        return 0;
    }

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to start of day

    // Sort dates descending for easier checking from most recent
    const sortedDates = [...completionDates].sort().reverse();

    let currentDate = new Date(today);

    for (let i = 0; i < sortedDates.length; i++) {
        const compDate = new Date(sortedDates[i]);
         compDate.setHours(0, 0, 0, 0); // Normalize completion date

        const timeDiff = currentDate.getTime() - compDate.getTime();
        const diffDays = Math.round(timeDiff / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            // It's today, continue checking yesterday next iteration
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (diffDays === 1) {
            // It was yesterday, continue checking the day before next iteration
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (diffDays > 1) {
            // There's a gap of more than 1 day, streak is broken
             if (i === 0) { // If the most recent date was > 1 day ago, streak is 0
                 streak = 0;
             }
            break; // Stop checking as streak is broken
        }
         // If diffDays is negative, this date is in the future (shouldn't happen with sorted dates from past)
         // If diffDays is > 1, the loop breaks
    }

    // Special case: If the most recent date is today, the streak is based on how many consecutive days led up to today.
    // If the most recent date is yesterday, the streak is based on how many consecutive days led up to yesterday.
    // The loop correctly counts consecutive days *backwards* from today if today is completed, or from yesterday if yesterday is the last completion.

    // Re-calculate based on consecutive days backwards from today/yesterday
    let actualStreak = 0;
    let checkDate = new Date(today); // Start checking from today
    const todayStrForCheck = today.toISOString().split('T')[0];
     const yesterday = new Date(today);
     yesterday.setDate(yesterday.getDate() - 1);
     const yesterdayStr = yesterday.toISOString().split('T')[0];


    // Check if today is completed
    if (completionDates.includes(todayStrForCheck)) {
        actualStreak = 1;
        checkDate.setDate(checkDate.getDate() - 1); // Move to yesterday
    } else if (completionDates.includes(yesterdayStr)) {
         // If today is not completed, but yesterday was, the streak ended yesterday
         // We need to find the streak UP TO yesterday. Start checking from yesterday.
         actualStreak = 1;
         checkDate = yesterday; // Start checking from yesterday
         checkDate.setDate(checkDate.getDate() - 1); // Move to the day before yesterday
     } else {
         // Neither today nor yesterday are completed. Streak is 0.
         return 0;
     }


     // Now count backwards from the date before the last completed day
    while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (completionDates.includes(dateStr)) {
            actualStreak++;
            checkDate.setDate(checkDate.getDate() - 1); // Move back another day
        } else {
            break; // Streak broken
        }
    }

    return actualStreak;
}

// ================
// SMART GOALS SYSTEM
// ================
function handleSmartGoalsUpdate(snapshot) {
    const container = document.getElementById('smart-goals-container');
     if (!container) {
         console.warn("smart-goals-container not found.");
         return;
     }
    container.innerHTML = ''; // Clear existing goals

     if (snapshot.empty) {
         container.innerHTML = '<p>No active SMART goals. Define some specific goals!</p>';
         return;
     }

    snapshot.forEach(doc => {
      const goal = doc.data();
      const goalId = doc.id; // Get goal ID

      // Ensure progress is a number
      const progress = goal.progress || 0;

      const goalElement = document.createElement('div');
      goalElement.className = 'smart-goal-card';
      goalElement.dataset.id = goalId; // Add ID for actions

      // Safely format deadline date
       const deadlineDate = goal.deadline && goal.deadline.toDate ? formatDate(goal.deadline.toDate()) : (goal.deadline ? formatDate(new Date(goal.deadline)) : 'No Deadline');

      goalElement.innerHTML = `
        <div class="goal-header">
          <h4>${goal.title || 'Unnamed SMART Goal'}</h4>
          <span class="deadline">${deadlineDate}</span>
        </div>
        <div class="goal-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${Math.min(100, progress)}%"></div>
          </div>
          <span>${progress}%</span>
        </div>
        <div class="goal-details">
          <div class="detail">
            <label>Specific:</label>
            <span>${goal.specific ? '✅' : '❌'}</span>
          </div>
          <div class="detail">
            <label>Measurable:</label>
            <span>${goal.measurable ? '✅' : '❌'}</span>
          </div>
          <div class="detail">
            <label>Achievable:</label>
            <span>${goal.achievable ? '✅' : '⚠️'}</span>
          </div>
          <div class="detail">
            <label>Relevant:</label>
            <span>${goal.relevant ? '✅' : '❌'}</span>
          </div>
           <div class="detail">
            <label>Time-Bound:</label>
            <span>${goal.timeBound ? '✅' : '❌'}</span>
          </div>
        </div>
        <div class="goal-actions">
          <button class="btn btn-sm btn-update-goal" data-id="${goalId}">Update Progress</button>
          <button class="btn btn-sm btn-complete-goal" data-id="${goalId}">Complete</button>
           <button class="btn btn-sm btn-edit-smart-goal" data-id="${goalId}">Edit</button>
           <button class="btn btn-sm btn-delete-smart-goal" data-id="${goalId}">Delete</button>
        </div>
      `;
      container.appendChild(goalElement);
    });
}

// ================
// EVENT HANDLERS
// ================
function setupGoalListeners() {
    // Use event delegation on the main container to handle clicks on dynamic elements
    const goalsContainer = document.getElementById('goals'); // Assuming the main div has ID 'goals'
     if (!goalsContainer) {
         console.warn("Main '#goals' container not found. Skipping goal listeners setup.");
         return;
     }

    goalsContainer.addEventListener('click', (e) => {
        // OKR Completion Toggle
        if (e.target.matches('.key-results input[type="checkbox"]')) {
            const checkbox = e.target;
            const okrId = checkbox.dataset.okrId;
            const krId = checkbox.dataset.krId;
            const completed = checkbox.checked;

            if (okrId && krId) {
                updateKeyResult(okrId, krId, completed);
            } else {
                 console.warn("Missing okrId or krId for checkbox:", checkbox);
                 showToast("Error updating Key Result. Data missing.", "error");
            }
        }

        // Habit Completion
        if (e.target.matches('.btn-complete-habit')) {
            const button = e.target;
            const habitId = button.dataset.id;
            const date = button.dataset.date; // date is already formatted as YYYY-MM-DD
            const completed = !button.classList.contains('completed'); // Toggle state

            if (habitId && date) {
                 // Optimistic UI update
                 button.classList.toggle('completed');
                 button.textContent = completed ? 'Completed Today' : 'Mark Complete';

                 updateHabitCompletion(habitId, date, completed).catch(() => {
                     // Revert UI on error
                     button.classList.toggle('completed');
                     button.textContent = completed ? 'Mark Complete' : 'Completed Today';
                 });
            } else {
                 console.warn("Missing habitId or date for complete button:", button);
                 showToast("Error updating habit. Data missing.", "error");
            }
        }

        // SMART Goal Actions (Update Progress, Complete, Edit, Delete)
         if (e.target.matches('.btn-update-goal')) {
             const goalId = e.target.dataset.id;
             if (goalId) {
                 handleUpdateSmartGoalProgress(goalId);
             }
         }
         if (e.target.matches('.btn-complete-goal')) {
             const goalId = e.target.dataset.id;
              if (goalId) {
                 handleCompleteSmartGoal(goalId);
              }
         }
         if (e.target.matches('.btn-edit-smart-goal')) {
              const goalId = e.target.dataset.id;
              if (goalId) {
                  handleEditSmartGoal(goalId);
              }
         }
          if (e.target.matches('.btn-delete-smart-goal')) {
              const goalId = e.target.dataset.id;
              if (goalId && confirm('Are you sure you want to delete this SMART goal?')) {
                  handleDeleteSmartGoal(goalId);
              }
          }
        // OKR Actions (Edit, Archive)
        if (e.target.matches('.btn-edit-okr')) {
             const okrId = e.target.dataset.id;
              if (okrId) {
                  handleEditOkr(okrId);
              }
        }
        if (e.target.matches('.btn-archive-okr')) {
             const okrId = e.target.dataset.id;
             if (okrId && confirm('Are you sure you want to archive this OKR?')) {
                 handleArchiveOkr(okrId);
             }
        }
        // Habit Actions (Edit, Delete)
        if (e.target.matches('.btn-edit-habit')) {
             const habitId = e.target.dataset.id;
             if (habitId) {
                  handleEditHabit(habitId);
             }
        }
        if (e.target.matches('.btn-delete-habit')) {
             const habitId = e.target.dataset.id;
             if (habitId && confirm('Are you sure you want to delete this habit?')) {
                  handleDeleteHabit(habitId);
             }
        }

    });

     // Add specific form listeners if you have forms for adding/editing goals
     // Example: Add New OKR Button listener
     const addOkrBtn = document.getElementById('add-new-okr'); // Assuming an ID like this exists
      if (addOkrBtn) {
          addOkrBtn.addEventListener('click', handleAddOkr);
      }
     // Example: Add New Habit Button listener
     const addHabitBtn = document.getElementById('add-new-habit'); // Assuming an ID like this exists
      if (addHabitBtn) {
           addHabitBtn.addEventListener('click', handleAddHabit);
      }
      // Example: Add New SMART Goal Button listener
     const addSmartGoalBtn = document.getElementById('add-new-smart-goal'); // Assuming an ID like this exists
      if (addSmartGoalBtn) {
          addSmartGoalBtn.addEventListener('click', handleAddSmartGoal);
      }
}

// ================
// FIREBASE OPERATIONS (Goals Module)
// ================

async function updateKeyResult(okrId, krId, completed) {
    // Use the auth and db instances defined earlier
    const userId = auth.currentUser?.uid;
    if (!userId) {
        showToast("User not authenticated", "error");
        return;
    }

    try {
        await db.collection('users').doc(userId).collection('okrs')
            .doc(okrId)
            .update({
                // Use arrayFilters to update the specific element in the keyResults array
                'keyResults': db.firestore.FieldValue.arrayRemove( // Remove old KR
                     { id: krId, description: '', completed: !completed, progress: 0 } // You might need to fetch the old KR to remove it accurately
                 )
             })
         // This is tricky. Updating items within an array directly is complex in Firestore.
         // A common pattern is to fetch the document, update the array in memory, and then save the whole document.
         // Or, if Key Results have their own subcollection, update the KR document directly.
         // Given the current structure, fetching and updating the whole OKR is safer/easier.

         // Let's refetch and update the array
         const okrRef = db.collection('users').doc(userId).collection('okrs').doc(okrId);
         const okrDoc = await okrRef.get();

         if (okrDoc.exists) {
             const okrData = okrDoc.data();
             const updatedKeyResults = okrData.keyResults.map(kr => {
                 if (kr.id === krId) {
                     return { ...kr, completed: completed, lastUpdated: new Date().toISOString() };
                 }
                 return kr;
             });

             await okrRef.update({ keyResults: updatedKeyResults });
             showToast('Key Result updated');
         } else {
             showToast('OKR not found', 'error');
         }

    } catch (error) {
        console.error("Error updating key result:", error);
        showToast('Failed to update Key Result', 'error');
        throw error; // Re-throw for optimistic UI rollback
    }
}

async function updateHabitCompletion(habitId, date, completed) {
    // Use the auth and db instances defined earlier
    const userId = auth.currentUser?.uid;
    if (!userId) {
        showToast("User not authenticated", "error");
        return;
    }

    const habitRef = db.collection('users').doc(userId).collection('habits').doc(habitId);
    const updates = {};

    if (completed) {
        // Add the date to the array if marking complete
        updates.completionDates = firebase.firestore.FieldValue.arrayUnion(date);
         updates.lastCompleted = new Date(); // Add a timestamp for the last completion
    } else {
        // Remove the date from the array if unmarking complete
        updates.completionDates = firebase.firestore.FieldValue.arrayRemove(date);
         // Recalculate lastCompleted or leave it as the previous last date? Leaving for simplicity now.
    }

    try {
        await habitRef.update(updates);
        // showToast(`Habit marked ${completed ? 'complete' : 'incomplete'}`); // Toast is handled by listener
    } catch (error) {
        console.error("Error updating habit completion:", error);
        showToast('Failed to update habit completion', 'error');
        throw error; // Re-throw for optimistic UI rollback
    }
}

// Placeholder functions for other goal actions
function handleAddOkr() {
    showToast('Add OKR feature not implemented yet', 'info');
    // Implement modal or form to add new OKR
}

function handleEditOkr(okrId) {
    showToast(`Edit OKR feature not implemented yet for ID: ${okrId}`, 'info');
     // Implement modal or form to edit existing OKR
}

function handleArchiveOkr(okrId) {
    // Use the auth and db instances defined earlier
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    db.collection('users').doc(userId).collection('okrs').doc(okrId).update({
        archived: true,
        archivedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => showToast('OKR archived'))
    .catch(error => {
        console.error("Error archiving OKR:", error);
        showToast('Failed to archive OKR', 'error');
    });
}

function handleAddHabit() {
     showToast('Add Habit feature not implemented yet', 'info');
    // Implement modal or form to add new Habit
}

function handleEditHabit(habitId) {
     showToast(`Edit Habit feature not implemented yet for ID: ${habitId}`, 'info');
    // Implement modal or form to edit existing Habit
}

function handleDeleteHabit(habitId) {
     // Use the auth and db instances defined earlier
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    db.collection('users').doc(userId).collection('habits').doc(habitId).delete()
        .then(() => showToast('Habit deleted'))
        .catch(error => {
             console.error("Error deleting Habit:", error);
             showToast('Failed to delete Habit', 'error');
        });
}

function handleAddSmartGoal() {
     showToast('Add SMART Goal feature not implemented yet', 'info');
    // Implement modal or form to add new SMART Goal
}

function handleUpdateSmartGoalProgress(goalId) {
    const newProgressStr = prompt("Enter new progress percentage (0-100):");
    const newProgress = parseInt(newProgressStr);

     if (newProgressStr !== null && !isNaN(newProgress) && newProgress >= 0 && newProgress <= 100) {
         // Use the auth and db instances defined earlier
         const userId = auth.currentUser?.uid;
         if (!userId) return;

         db.collection('users').doc(userId).collection('smartGoals').doc(goalId).update({
             progress: newProgress,
             updatedAt: firebase.firestore.FieldValue.serverTimestamp()
         })
         .then(() => showToast('Goal progress updated'))
         .catch(error => {
              console.error("Error updating SMART Goal progress:", error);
              showToast('Failed to update goal progress', 'error');
         });
     } else if (newProgressStr !== null) {
         showToast('Please enter a valid number between 0 and 100', 'warning');
     }
}

function handleCompleteSmartGoal(goalId) {
     // Use the auth and db instances defined earlier
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    db.collection('users').doc(userId).collection('smartGoals').doc(goalId).update({
        completed: true,
        completedAt: firebase.firestore.FieldValue.serverTimestamp(),
         status: 'completed' // Add a status field
    })
    .then(() => showToast('SMART Goal marked as complete'))
    .catch(error => {
         console.error("Error completing SMART Goal:", error);
         showToast('Failed to complete goal', 'error');
    });
}

function handleEditSmartGoal(goalId) {
     showToast(`Edit SMART Goal feature not implemented yet for ID: ${goalId}`, 'info');
    // Implement modal or form to edit existing SMART Goal
}

function handleDeleteSmartGoal(goalId) {
     // Use the auth and db instances defined earlier
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    db.collection('users').doc(userId).collection('smartGoals').doc(goalId).delete()
        .then(() => showToast('SMART Goal deleted'))
        .catch(error => {
             console.error("Error deleting SMART Goal:", error);
             showToast('Failed to delete goal', 'error');
        });
}


// ================
// UI RENDERING HELPERS (Goals Module)
// ================
function renderMiniCalendar(completionDates) {
    // Placeholder for a mini calendar visualization
    // This would typically render the last X days with dots for completed days
     if (!Array.isArray(completionDates)) {
         completionDates = [];
     }

    const container = document.createElement('div');
    container.className = 'mini-calendar';
    const daysToShow = 30;
    const today = new Date();

    for (let i = 0; i < daysToShow; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        const isCompleted = completionDates.includes(dateString);

        const dayElement = document.createElement('span');
        dayElement.className = `calendar-day ${isCompleted ? 'completed' : ''}`;
        // Optionally add day number or tooltip
        // dayElement.textContent = date.getDate();
        container.appendChild(dayElement);
    }
    return container.outerHTML; // Return the HTML string
}

function renderMotivationalContent() {
    const quotes = [
      "What you get by achieving your goals is not as important as what you become by achieving them.",
      "The trouble with not having a goal is that you can spend your life running up and down the field and never score.",
      "Setting goals is the first step in turning the invisible into the visible.",
      "A goal properly set is halfway reached.",
      "Our goals can only be reached through a vehicle of a plan, in which we must fervently believe, and upon which we must vigorously act. There is no other route to success."
    ];

    const quoteElement = document.getElementById('motivational-quote');
     if (quoteElement) {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        quoteElement.textContent = quotes[randomIndex];
     } else {
         console.warn("Motivational quote element not found.");
     }
}


// ==================================
// 9. Learning Module
// ==================================

// Configuration - Already defined in Section 2
// const learningConfig = config.learning;

// Initialize Learning Module
function initLearningModule() {
     // Check if element exists
    if (document.getElementById('learning')) {
        console.log("Initializing Learning Module");
        loadLearningData();
        setupLearningListeners();
        initializeSkillChart(); // Placeholder for a chart
        loadRecommendations(); // Placeholder for recommendations
    } else {
         console.warn("initLearningModule called, but #learning element not found.");
    }
}

// Load Learning Data
function loadLearningData() {
    // Use the auth and db instances defined earlier
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Load skills
    db.collection('users').doc(userId)
      .collection('skills')
      .orderBy('lastPracticed', 'desc')
      .onSnapshot(snapshot => {
        const skills = [];
        snapshot.forEach(doc => {
          skills.push({ id: doc.id, ...doc.data() });
        });
        renderSkills(skills);
      }, error => {
          console.error("Error loading skills:", error);
          showToast('Error loading skills', 'error');
      });

    // Load resources
    db.collection('users').doc(userId)
      .collection('resources')
      .orderBy('addedDate', 'desc')
      .onSnapshot(snapshot => {
        const resources = [];
        snapshot.forEach(doc => {
          resources.push({ id: doc.id, ...doc.data() });
        });
        renderResources(resources);
      }, error => {
          console.error("Error loading resources:", error);
          showToast('Error loading resources', 'error');
      });

    // Load notes
    db.collection('users').doc(userId)
      .collection('knowledgeNotes')
      .orderBy('updatedAt', 'desc')
      .limit(10) // Load only recent notes
      .onSnapshot(snapshot => {
        const notes = [];
        snapshot.forEach(doc => {
          notes.push({ id: doc.id, ...doc.data() });
        });
        renderNotes(notes);
      }, error => {
          console.error("Error loading notes:", error);
          showToast('Error loading notes', 'error');
      });
}

// Setup Event Listeners
function setupLearningListeners() {
    // Add buttons
    const addResourceBtn = document.getElementById('add-learning-resource');
    const addSkillBtn = document.getElementById('add-new-skill');
    const createNoteBtn = document.getElementById('create-note');

    if (addResourceBtn) addResourceBtn.addEventListener('click', () => openLearningModal('resource'));
    if (addSkillBtn) addSkillBtn.addEventListener('click', () => openLearningModal('skill'));
    if (createNoteBtn) createNoteBtn.addEventListener('click', () => openLearningModal('note'));

    // Resource tabs
    document.querySelectorAll('.resource-tab').forEach(tab => {
      tab.addEventListener('click', filterResources);
    });

    // Knowledge tabs (Placeholder - needs data-knowledge attributes)
    document.querySelectorAll('.knowledge-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const filter = e.currentTarget.dataset.knowledge;
            console.log(`Filtering notes by: ${filter}`);
            showToast(`Feature: Filter notes by '${filter}'`);
            // Implement actual filtering logic here if notes UI supports it
        });
    });


    // Skill filter
    const skillCategoryFilter = document.getElementById('skill-category-filter');
     if (skillCategoryFilter) {
         skillCategoryFilter.addEventListener('change', filterSkills);
     }


    // Resource search
    const resourceSearchInput = document.getElementById('resource-search');
     if (resourceSearchInput) {
         resourceSearchInput.addEventListener('input', searchResources);
     }


    // Modal close buttons (using a generic close function)
    document.querySelectorAll('.modal .close-modal').forEach(btn => { // Select only modal close buttons
      btn.addEventListener('click', closeAllLearningModals);
    });

    // Cancel buttons (using a generic close function)
    document.querySelectorAll('.modal .btn-cancel').forEach(btn => {
         btn.addEventListener('click', closeAllLearningModals);
    });


    // Form submissions - Add specific listeners to each form
    const resourceForm = document.getElementById('resource-form');
    const skillForm = document.getElementById('skill-form');
    const noteForm = document.getElementById('note-form');

    if (resourceForm) resourceForm.addEventListener('submit', saveLearningResource);
    if (skillForm) skillForm.addEventListener('submit', saveLearningSkill);
    if (noteForm) noteForm.addEventListener('submit', saveKnowledgeNote);


     // Event delegation for dynamic elements (skill/resource/note actions)
     const learningContent = document.getElementById('learning'); // Assuming the main container ID is 'learning'
      if (learningContent) {
          learningContent.addEventListener('click', (e) => {
              // Skill actions
              if (e.target.closest('.skill-edit')) {
                   const skillCard = e.target.closest('.skill-card');
                   if (skillCard) {
                        // Need to get skill data based on card ID or name to open edit modal
                        // This implies storing data or getting ID on the card
                        const skillId = skillCard.dataset.id; // Assuming skill ID is stored
                        if (skillId) fetchAndOpenSkillModal(skillId); // Need to implement fetchAndOpenSkillModal
                   }
              }
              if (e.target.closest('.skill-log')) {
                   const skillCard = e.target.closest('.skill-card');
                   if (skillCard) {
                        const skillId = skillCard.dataset.id; // Assuming skill ID is stored
                        const skillName = skillCard.querySelector('h4')?.textContent; // Assuming skill name is in h4
                        if (skillId && skillName) logSkillPractice(skillId, skillName); // Pass ID and Name
                   }
              }
              // Resource actions (view details, review, notes - clicks handled on card or specific buttons)
               if (e.target.closest('.resource-card')) {
                   // If click is on the card itself (not an action button)
                   if (!e.target.closest('.resource-actions')) {
                        const resourceCard = e.target.closest('.resource-card');
                         if (resourceCard) {
                              const resourceId = resourceCard.dataset.id; // Assuming resource ID is stored
                              if (resourceId) fetchAndOpenResourceModal(resourceId, true); // Open for viewing
                         }
                   }
               }
               if (e.target.closest('.resource-review')) {
                   const resourceCard = e.target.closest('.resource-card');
                   if (resourceCard) {
                        const resourceId = resourceCard.dataset.id;
                         const resourceTitle = resourceCard.querySelector('h4')?.textContent;
                        if (resourceId && resourceTitle) handleReviewResource(resourceId, resourceTitle); // Pass ID and Title
                   }
               }
                if (e.target.closest('.resource-notes')) {
                   const resourceCard = e.target.closest('.resource-card');
                   if (resourceCard) {
                        const resourceId = resourceCard.dataset.id;
                        if (resourceId) viewResourceNotes(resourceId); // Pass ID
                   }
               }

              // Note actions
              if (e.target.closest('.note-edit')) {
                   const noteCard = e.target.closest('.note-card');
                   if (noteCard) {
                        const noteId = noteCard.dataset.id; // Assuming note ID is stored
                        if (noteId) fetchAndOpenNoteModal(noteId); // Need to implement fetchAndOpenNoteModal
                   }
              }
               if (e.target.closest('.note-favorite i')) { // Click on the icon inside favorite button
                   const noteCard = e.target.closest('.note-card');
                    if (noteCard) {
                         const noteId = noteCard.dataset.id; // Assuming note ID is stored
                         if (noteId) toggleNoteFavorite(noteId); // Pass ID
                    }
               }
                if (e.target.closest('.note-card')) {
                    // If click is on the card itself (not an action button)
                   if (!e.target.closest('.note-actions')) {
                        const noteCard = e.target.closest('.note-card');
                         if (noteCard) {
                              const noteId = noteCard.dataset.id; // Assuming note ID is stored
                              if (noteId) viewNote(noteId); // Pass ID
                         }
                   }
               }
          });
      } else {
          console.warn("#learning container not found. Skipping learning event delegation.");
      }
}

// Render Skills
function renderSkills(skills) {
    const container = document.querySelector('.skills-grid');
    if (!container) {
        console.warn("skills-grid container not found.");
        return;
    }
    container.innerHTML = ''; // Clear existing skills

     if (skills.length === 0) {
         container.innerHTML = '<p>No skills tracked yet. Add your skills!</p>';
         return;
     }

    skills.forEach(skill => {
      const level = config.learning.skillLevels.find(l => l.value === skill.level) ||
                   config.learning.skillLevels[0]; // Default to first level if not found

      const card = document.createElement('div');
      card.className = 'skill-card';
      card.dataset.id = skill.id; // Store ID for actions

      // Ensure timeInvested and progress are numbers
      const timeInvestedMinutes = skill.timeInvested || 0;
      const skillProgress = skill.progress || 0;
      const lastPracticedDate = skill.lastPracticed ? new Date(skill.lastPracticed) : null;


      card.innerHTML = `
        <div class="skill-header">
          <h4>${skill.name || 'Unnamed Skill'}</h4>
          <div class="skill-level" style="background: ${level.color}22; color: ${level.color}">
            ${level.label}
          </div>
        </div>
        <div class="skill-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${Math.min(100, skillProgress)}%; background: ${level.color}"></div>
          </div>
          <span>${skillProgress}%</span>
        </div>
        <div class="skill-meta">
          <div class="meta-item">
            <i class="fas fa-clock"></i>
            <span>${formatTimeInvestment(timeInvestedMinutes)}</span>
          </div>
          <div class="meta-item">
            <i class="fas fa-calendar"></i>
            <span>Last: ${formatLastPracticed(lastPracticedDate)}</span>
          </div>
        </div>
        <div class="skill-actions">
          <button class="btn-icon skill-edit" title="Edit Skill" data-id="${skill.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon skill-log" title="Log Practice" data-id="${skill.id}">
            <i class="fas fa-plus"></i>
          </button>
           <button class="btn-icon skill-delete" title="Delete Skill" data-id="${skill.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;

       // Add specific listeners for delete (edit/log handled by delegation)
        card.querySelector('.skill-delete').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click event
            if (confirm(`Are you sure you want to delete the skill "${skill.name}"?`)) {
                 handleDeleteSkill(skill.id);
            }
        });


      container.appendChild(card);
    });
}

// Render Resources
function renderResources(resources) {
    const container = document.querySelector('.resources-grid');
    if (!container) {
        console.warn("resources-grid container not found.");
        return;
    }
    container.innerHTML = ''; // Clear existing resources

    if (resources.length === 0) {
        container.innerHTML = '<p>No learning resources added yet. Add a book, course, or article!</p>';
        return;
    }

    resources.forEach(resource => {
      const type = config.learning.resourceTypes.find(t => t.value === resource.type) ||
                  config.learning.resourceTypes[config.learning.resourceTypes.length - 1]; // Default to 'other' if type not found

      const card = document.createElement('div');
      card.className = 'resource-card';
      card.dataset.id = resource.id; // Store ID for actions
      card.dataset.type = resource.type;
      card.dataset.status = resource.status || 'not-started'; // Default status

       const resourceProgress = resource.progress || 0;

      card.innerHTML = `
        <div class="resource-badge ${resource.type}" style="background: ${type.color}">
          ${type.label}
        </div>
        <div class="resource-status ${resource.status || 'not-started'}">
          ${formatStatus(resource.status)}
        </div>
        <div class="resource-image">
          ${resource.imageUrl ?
            `<img src="${resource.imageUrl}" alt="${resource.title}">` :
            `<i class="fas fa-${type.icon || 'file-alt'}"></i>`}
        </div>
        <div class="resource-content">
          <h4>${resource.title || 'Unnamed Resource'}</h4>
          <div class="resource-meta">
            <span class="resource-author">${resource.author || 'Unknown author'}</span>
            <span class="resource-pages">${formatResourceLength(resource)}</span>
          </div>
          <div class="resource-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${Math.min(100, resourceProgress)}%"></div>
            </div>
          </div>
          <div class="resource-actions">
            <button class="btn-icon resource-review" title="Review Resource" data-id="${resource.id}">
              <i class="fas fa-star"></i>
            </button>
            <button class="btn-icon resource-notes" title="View/Add Notes" data-id="${resource.id}">
              <i class="fas fa-file-alt"></i>
            </button>
             <button class="btn-icon resource-edit" title="Edit Resource" data-id="${resource.id}">
              <i class="fas fa-edit"></i>
            </button>
             <button class="btn-icon resource-delete" title="Delete Resource" data-id="${resource.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
        // Add specific listeners for edit/delete (review/notes handled by delegation)
         card.querySelector('.resource-edit').addEventListener('click', (e) => {
             e.stopPropagation();
             fetchAndOpenResourceModal(resource.id); // Pass ID to fetch data for edit
         });
          card.querySelector('.resource-delete').addEventListener('click', (e) => {
             e.stopPropagation();
              if (confirm(`Are you sure you want to delete the resource "${resource.title}"?`)) {
                 handleDeleteResource(resource.id);
              }
         });


      container.appendChild(card);
    });
}

// Render Notes
function renderNotes(notes) {
    const container = document.querySelector('.notes-list');
    if (!container) {
        console.warn("notes-list container not found.");
        return;
    }
    container.innerHTML = ''; // Clear existing notes

    if (notes.length === 0) {
        container.innerHTML = '<p>No knowledge notes saved yet. Create a note!</p>';
        return;
    }

    notes.forEach(note => {
      const card = document.createElement('div');
      card.className = 'note-card';
      card.dataset.id = note.id; // Store ID for actions


      card.innerHTML = `
        <div class="note-header">
          <h4>${note.title || 'Unnamed Note'}</h4>
          <div class="note-meta">
            <span class="note-category">${note.category || 'Uncategorized'}</span>
            <span class="note-date">${formatNoteDate(note.updatedAt)}</span>
          </div>
        </div>
        <div class="note-preview">
          ${note.content ? (note.content.substring(0, 150) + (note.content.length > 150 ? '...' : '')) : 'No content'}
        </div>
        <div class="note-actions">
          <button class="btn-icon note-edit" title="Edit Note" data-id="${note.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon note-favorite" title="${note.favorite ? 'Unfavorite' : 'Favorite'}" data-id="${note.id}">
            <i class="fas fa-star${note.favorite ? '' : '-o'}"></i>
          </button>
           <button class="btn-icon note-delete" title="Delete Note" data-id="${note.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
       // Add specific listeners for delete (edit/favorite handled by delegation)
        card.querySelector('.note-delete').addEventListener('click', (e) => {
            e.stopPropagation();
             if (confirm(`Are you sure you want to delete the note "${note.title}"?`)) {
                 handleDeleteNote(note.id);
             }
        });


      container.appendChild(card);
    });
}

// --- Modal Handling ---

/**
 * Opens a generic modal based on type.
 * @param {'resource' | 'skill' | 'note'} type - The type of item to add/edit.
 * @param {object} [data=null] - Optional data object for editing.
 */
function openLearningModal(type, data = null) {
    closeAllLearningModals(); // Close any open modals first

    const modalId = `${type}-modal`;
    const modal = document.getElementById(modalId);
    const form = document.getElementById(`${type}-form`);

    if (!modal || !form) {
        console.error(`Modal or form not found for type: ${type}`);
        return;
    }

    // Reset form and set mode
    form.reset();
    form.dataset.mode = data ? 'edit' : 'add';
    form.dataset.itemId = data ? data.id : ''; // Store item ID for edit mode

    // Populate fields if in edit mode
    if (data) {
        if (type === 'resource') {
            document.getElementById('resource-title').value = data.title || '';
            document.getElementById('resource-type').value = data.type || '';
            document.getElementById('resource-status').value = data.status || 'not-started';
            document.getElementById('resource-author').value = data.author || '';
            document.getElementById('resource-url').value = data.url || '';
            document.getElementById('resource-length').value = data.length || ''; // Use resource-length ID
            document.getElementById('resource-progress').value = data.progress || 0;
            document.getElementById('resource-description').value = data.description || '';
            document.getElementById('resource-skills').value = Array.isArray(data.skills) ? data.skills.join(', ') : '';
        } else if (type === 'skill') {
            document.getElementById('skill-name').value = data.name || '';
            document.getElementById('skill-category').value = data.category || '';
            document.getElementById('skill-level').value = data.level || 'beginner'; // Use skill-level ID
            document.getElementById('skill-goal-level').value = data.goalLevel || 'expert'; // Use skill-goal-level ID
            document.getElementById('skill-description').value = data.description || '';
        } else if (type === 'note') {
            document.getElementById('note-title').value = data.title || '';
            document.getElementById('note-category').value = data.category || '';
            document.getElementById('note-tags').value = Array.isArray(data.tags) ? data.tags.join(', ') : '';
            document.getElementById('note-content').value = data.content || '';
             const noteModalTitle = document.getElementById('note-modal-title');
             if(noteModalTitle) noteModalTitle.textContent = 'Edit Note'; // Update modal title
        }
    } else {
         // Reset modal title for add mode
         if (type === 'note') {
             const noteModalTitle = document.getElementById('note-modal-title');
             if(noteModalTitle) noteModalTitle.textContent = 'New Note';
         }
    }

    modal.classList.add('active');
}


// Need helper functions to fetch data for editing if only ID is available from UI
async function fetchAndOpenResourceModal(resourceId) {
     const userId = auth.currentUser?.uid;
     if (!userId) return;
     try {
         const doc = await db.collection('users').doc(userId).collection('resources').doc(resourceId).get();
         if (doc.exists) {
             openLearningModal('resource', { id: doc.id, ...doc.data() });
         } else {
             showToast('Resource not found', 'error');
         }
     } catch (error) {
         console.error("Error fetching resource for edit:", error);
         showToast('Failed to load resource data', 'error');
     }
}

async function fetchAndOpenSkillModal(skillId) {
     const userId = auth.currentUser?.uid;
     if (!userId) return;
     try {
         const doc = await db.collection('users').doc(userId).collection('skills').doc(skillId).get();
         if (doc.exists) {
             openLearningModal('skill', { id: doc.id, ...doc.data() });
         } else {
             showToast('Skill not found', 'error');
         }
     } catch (error) {
         console.error("Error fetching skill for edit:", error);
         showToast('Failed to load skill data', 'error');
     }
}

async function fetchAndOpenNoteModal(noteId) {
     const userId = auth.currentUser?.uid;
     if (!userId) return;
     try {
         const doc = await db.collection('users').doc(userId).collection('knowledgeNotes').doc(noteId).get();
         if (doc.exists) {
             openLearningModal('note', { id: doc.id, ...doc.data() });
         } else {
             showToast('Note not found', 'error');
         }
     } catch (error) {
         console.error("Error fetching note for edit:", error);
         showToast('Failed to load note data', 'error');
     }
}


// Close All Modals
function closeAllLearningModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('active');
      // Reset forms when closing?
      const form = modal.querySelector('form');
      if (form) form.reset();
    });
}

// Save Resource
async function saveLearningResource(e) {
    e.preventDefault();

    const form = e.target;
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Get form values
    const resourceData = {
      title: document.getElementById('resource-title').value.trim(),
      type: document.getElementById('resource-type').value,
      status: document.getElementById('resource-status').value,
      author: document.getElementById('resource-author').value.trim() || null,
      url: document.getElementById('resource-url').value.trim() || null,
      length: document.getElementById('resource-length').value || null, // Use resource-length ID
      progress: parseInt(document.getElementById('resource-progress').value) || 0,
      description: document.getElementById('resource-description').value.trim() || null,
      skills: document.getElementById('resource-skills').value
        .split(',')
        .map(s => s.trim())
        .filter(s => s),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Basic validation
    if (!resourceData.title || !resourceData.type) {
        showToast('Title and Type are required for resources', 'error');
        return;
    }


    try {
      if (form.dataset.mode === 'edit' && form.dataset.itemId) {
        await db.collection('users').doc(userId)
          .collection('resources')
          .doc(form.dataset.itemId)
          .update(resourceData);
         showToast('Resource updated successfully');
      } else {
        resourceData.addedDate = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('users').doc(userId)
          .collection('resources')
          .add(resourceData);
         showToast('Resource added successfully');
      }

      closeAllLearningModals();
    } catch (error) {
      console.error('Error saving resource:', error);
      showToast('Error saving resource', 'error');
    }
}

// Save Skill
async function saveLearningSkill(e) {
    e.preventDefault();

    const form = e.target;
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Get form values
    const skillData = {
      name: document.getElementById('skill-name').value.trim(),
      category: document.getElementById('skill-category').value,
      level: document.getElementById('skill-level').value || 'beginner', // Use skill-level ID, default
      goalLevel: document.getElementById('skill-goal-level').value || 'expert', // Use skill-goal-level ID, default
      description: document.getElementById('skill-description').value.trim() || null,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp() // Track updates
    };

    // Basic validation
    if (!skillData.name || !skillData.category) {
        showToast('Name and Category are required for skills', 'error');
        return;
    }

    try {
      if (form.dataset.mode === 'edit' && form.dataset.itemId) {
        // Update existing skill
        await db.collection('users').doc(userId)
          .collection('skills')
          .doc(form.dataset.itemId)
          .update(skillData);
         showToast('Skill updated successfully');
      } else {
        // Add new skill
        skillData.timeInvested = 0; // Initialize time invested
        skillData.progress = 0; // Initialize progress
        skillData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
         skillData.lastPracticed = firebase.firestore.FieldValue.serverTimestamp(); // Initialize last practiced date

        await db.collection('users').doc(userId)
          .collection('skills')
          .add(skillData);
         showToast('Skill added successfully');
      }

      closeAllLearningModals();
    } catch (error) {
      console.error('Error saving skill:', error);
      showToast('Error saving skill', 'error');
    }
}

// Save Note
async function saveKnowledgeNote(e) {
    e.preventDefault();

    const form = e.target;
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Get form values
    const noteData = {
      title: document.getElementById('note-title').value.trim(),
      category: document.getElementById('note-category').value || null,
      tags: document.getElementById('note-tags').value
        .split(',')
        .map(t => t.trim())
        .filter(t => t),
      content: document.getElementById('note-content').value.trim(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Basic validation
    if (!noteData.title || !noteData.content) {
        showToast('Title and Content are required for notes', 'error');
        return;
    }

    try {
      if (form.dataset.mode === 'edit' && form.dataset.itemId) {
         // Update existing note
        await db.collection('users').doc(userId)
          .collection('knowledgeNotes')
          .doc(form.dataset.itemId)
          .update(noteData);
         showToast('Note updated successfully');
      } else {
        // Add new note
        noteData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        noteData.favorite = false; // Default to not favorite

        await db.collection('users').doc(userId)
          .collection('knowledgeNotes')
          .add(noteData);
         showToast('Note added successfully');
      }

      closeAllLearningModals();
    } catch (error) {
      console.error('Error saving note:', error);
      showToast('Error saving note', 'error');
    }
}


// Handle Skill Actions
// Log Skill Practice
async function logSkillPractice(skillId, skillName) {
    const minutesStr = prompt(`How many minutes did you practice ${skillName}?`, '30');
    const minutes = parseInt(minutesStr);

    if (minutesStr !== null && !isNaN(minutes) && minutes > 0) {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const practiceTime = minutes;

      try {
        // Fetch current skill data to calculate new progress
        const skillDoc = await db.collection('users').doc(userId).collection('skills').doc(skillId).get();
        if (!skillDoc.exists) {
             showToast('Skill not found', 'error');
             return;
        }
        const currentSkill = skillDoc.data();
        const currentProgress = currentSkill.progress || 0;
        const currentTotalTime = currentSkill.timeInvested || 0;
        const currentLevel = currentSkill.level || 'beginner';


        // Calculate new progress based on practice time and level
        const newProgress = calculateNewProgress(currentProgress, currentLevel, practiceTime);


        await db.collection('users').doc(userId)
          .collection('skills')
          .doc(skillId)
          .update({
            timeInvested: currentTotalTime + practiceTime,
            lastPracticed: firebase.firestore.FieldValue.serverTimestamp(),
            progress: newProgress,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });

        showToast('Practice session logged successfully');
      } catch (error) {
        console.error('Error logging practice:', error);
        showToast('Error logging practice', 'error');
      }
    } else if (minutesStr !== null) {
        showToast('Please enter a valid positive number of minutes', 'warning');
    }
}

// Handle Resource Actions
// View Resource Details (Placeholder)
function viewResourceDetails(resourceId) {
    // In a real app, this would open a detailed view of the resource
    showToast(`Feature: View details for resource ID: ${resourceId}`);
    // You would fetch the resource data by ID and render it in a modal or new page
}

// Review Resource
async function handleReviewResource(resourceId, resourceTitle) {
    const ratingStr = prompt(`Rate "${resourceTitle}" (1-5 stars):`, '5');
    const rating = parseInt(ratingStr);

    if (ratingStr !== null && !isNaN(rating) && rating >= 1 && rating <= 5) {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      try {
        await db.collection('users').doc(userId)
          .collection('resources')
          .doc(resourceId)
          .update({
            rating: rating,
            lastReviewed: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });

        showToast('Resource rating saved');
      } catch (error) {
        console.error('Error saving rating:', error);
        showToast('Error saving rating', 'error');
      }
    } else if (ratingStr !== null) {
        showToast('Please enter a valid rating between 1 and 5', 'warning');
    }
}

// View Resource Notes (Placeholder)
function viewResourceNotes(resourceId) {
     showToast(`Feature: View/Add notes for resource ID: ${resourceId}`);
    // In a real app, you would link this resource to notes or show notes related to it.
    // You might fetch notes tagged with this resource's ID or title.
}

// Handle Note Actions
// Toggle Note Favorite
async function toggleNoteFavorite(noteId) {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

     try {
        const noteRef = db.collection('users').doc(userId).collection('knowledgeNotes').doc(noteId);
        const doc = await noteRef.get();
        if (!doc.exists) {
             showToast('Note not found', 'error');
             return;
        }
        const currentFavoriteStatus = doc.data().favorite || false;
        const newFavorite = !currentFavoriteStatus;

        await noteRef.update({
            favorite: newFavorite,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showToast(newFavorite ? 'Note added to favorites' : 'Note removed from favorites');
        // UI update happens via snapshot listener
     } catch (error) {
        console.error('Error toggling note favorite status:', error);
        showToast('Failed to update note', 'error');
     }
}

// View Note (Placeholder)
function viewNote(noteId) {
    showToast(`Feature: View full note for ID: ${noteId}`);
    // In a real app, you would fetch the note data by ID and render it
}

// Handle Delete Actions
async function handleDeleteSkill(skillId) {
     const userId = auth.currentUser?.uid;
     if (!userId) return;

     try {
         await db.collection('users').doc(userId).collection('skills').doc(skillId).delete();
         showToast('Skill deleted successfully');
         // UI update happens via snapshot listener
     } catch (error) {
         console.error('Error deleting skill:', error);
         showToast('Failed to delete skill', 'error');
     }
}

async function handleDeleteResource(resourceId) {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      try {
          await db.collection('users').doc(userId).collection('resources').doc(resourceId).delete();
          showToast('Resource deleted successfully');
           // UI update happens via snapshot listener
      } catch (error) {
          console.error('Error deleting resource:', error);
          showToast('Failed to delete resource', 'error');
      }
}

async function handleDeleteNote(noteId) {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      try {
          await db.collection('users').doc(userId).collection('knowledgeNotes').doc(noteId).delete();
          showToast('Note deleted successfully');
           // UI update happens via snapshot listener
      } catch (error) {
          console.error('Error deleting note:', error);
          showToast('Failed to delete note', 'error');
      }
}


// --- Filtering and Searching ---
function filterResources(e) {
    const tab = e.currentTarget;
    const type = tab.dataset.resource; // Filter by resource type (e.g., 'book', 'course', 'all')

    // Update active tab
    document.querySelectorAll('.resource-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Filter resources in the grid
    const resources = document.querySelectorAll('.resources-grid .resource-card');
    resources.forEach(resource => {
      // Check data-type attribute set during rendering
      if (type === 'all' || resource.dataset.type === type) {
        resource.style.display = 'block';
      } else {
        resource.style.display = 'none';
      }
    });
}

function filterSkills() {
    const filter = document.getElementById('skill-category-filter').value; // Filter by skill category
    console.log("Filtering skills by category:", filter);

    // In a real app, you would filter the skills array *before* rendering
    // or use CSS classes/data attributes on skill cards.
    // For demonstration, let's assume skill cards have a data-category attribute.

     const skills = document.querySelectorAll('.skills-grid .skill-card');
     skills.forEach(skill => {
          // This assumes skill cards have a data-category attribute
         const skillCategory = skill.dataset.category || 'uncategorized'; // Default category if none set
         if (filter === 'all' || skillCategory === filter) {
             skill.style.display = 'block';
         } else {
             skill.style.display = 'none';
         }
     });
     showToast(`Feature: Filtering skills by '${filter}'`);
}

function searchResources() {
    const query = document.getElementById('resource-search').value.toLowerCase();
    const resources = document.querySelectorAll('.resources-grid .resource-card');

    resources.forEach(resource => {
      const title = resource.querySelector('h4')?.textContent.toLowerCase() || '';
      const author = resource.querySelector('.resource-author')?.textContent.toLowerCase() || '';
      const description = resource.querySelector('.resource-description')?.textContent.toLowerCase() || ''; // Assuming description is visible/available in card
      const tags = resource.querySelectorAll('.resource-tag') ? Array.from(resource.querySelectorAll('.resource-tag')).map(t => t.textContent.toLowerCase()).join(' ') : '';


      // Check if query is found in title, author, description, or tags
      if (title.includes(query) || author.includes(query) || description.includes(query) || tags.includes(query)) {
        resource.style.display = 'block';
      } else {
        resource.style.display = 'none';
      }
    });
}

// --- Charts and Recommendations ---
function initializeSkillChart() {
    // Placeholder for a skill progression chart using Chart.js
     console.log("Feature: Initializing Skill Progression Chart");
     const skillChartCtx = document.getElementById('skillProgressionChart')?.getContext('2d');
      if (skillChartCtx && typeof Chart !== 'undefined') {
          // Destroy existing chart instance
          if (skillChartCtx.chart) skillChartCtx.chart.destroy();

           // Example Data (replace with actual user skill progression data)
           const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']; // Time periods
           const pythonProgress = [60, 65, 70, 75, 78, 80];
           const sqlProgress = [50, 55, 60, 62, 65, 68];
           const jsProgress = [40, 45, 50, 55, 60, 63];


          skillChartCtx.chart = new Chart(skillChartCtx, {
              type: 'line',
              data: {
                  labels: labels,
                  datasets: [
                      {
                          label: 'Python',
                          data: pythonProgress,
                          borderColor: config.learning.skillLevels.find(l => l.value === 'advanced')?.color || '#4CAF50',
                          fill: false,
                          tension: 0.1
                      },
                      {
                           label: 'SQL',
                           data: sqlProgress,
                           borderColor: config.learning.skillLevels.find(l => l.value === 'intermediate')?.color || '#2196F3',
                           fill: false,
                           tension: 0.1
                       },
                       {
                            label: 'JavaScript',
                            data: jsProgress,
                            borderColor: config.learning.skillLevels.find(l => l.value === 'beginner')?.color || '#FF9800',
                            fill: false,
                            tension: 0.1
                        }
                  ]
              },
              options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                      y: {
                          beginAtZero: true,
                          max: 100,
                          ticks: {
                             callback: (value) => value + '%'
                          }
                      }
                  },
                   plugins: {
                       legend: {
                           position: 'bottom',
                       }
                   }
              }
          });
      } else {
          console.warn("Skill progression chart canvas or Chart.js not found.");
      }
}

function loadRecommendations() {
    // Placeholder for fetching personalized learning recommendations
    // This would involve analyzing user's skills, goals, and completed resources
     console.log("Feature: Loading learning recommendations");
    if (localStorage.getItem('enableRecommendations') === 'true') {
         showToast('Fetching personalized recommendations...');
        // Simulate async fetch
        setTimeout(() => {
             const container = document.getElementById('recommendations-list'); // Assuming a container ID
              if (container) {
                  container.innerHTML = `
                     <div class="recommendation-item">Recommended Course: Intro to Machine Learning</div>
                     <div class="recommendation-item">Recommended Book: Deep Work</div>
                     <div class="recommendation-item">Recommended Article: The Power of Deliberate Practice</div>
                  `;
              }
            showToast('New learning recommendations available');
        }, 2000);
    }
}

// --- Helper Functions (Learning Module) ---
function formatTimeInvestment(minutes) {
    if (typeof minutes !== 'number' || isNaN(minutes) || minutes < 0) return '0 minutes';

    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
       if (mins === 0) return `${hours} hours`;
      return `${hours}h ${mins}m`;
    }
}

function formatLastPracticed(dateObject) {
    if (!dateObject || isNaN(dateObject.getTime())) return 'Never';

    const now = new Date();
    const diffTime = now.getTime() - dateObject.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return dateObject.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return dateObject.toLocaleDateString(); // Full date for > 1 year
}

function formatStatus(status) {
    const statusMap = {
      'not-started': 'Not Started',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'abandoned': 'Abandoned'
    };
    return statusMap[status] || status || 'Unknown';
}

function formatResourceLength(resource) {
     // Use resource.length as the generic field for duration/pages/etc.
    const length = resource.length;
     if (!length) return 'Unknown length';

    switch (resource.type) {
        case 'book':
            return `${length} pages`;
        case 'course':
        case 'video':
             // Assuming length is in hours or minutes, adjust format as needed
            return `${length} hours`;
        case 'article':
            // Might be reading time or words
            return `${length} min read`; // Example
        default:
            return `${length}`;
    }
}

function formatNoteDate(dateInput) {
     if (!dateInput) return '';
    // Use the global formatDate utility, but perhaps a shorter version for notes
    let date;
    if (dateInput instanceof Date) {
        date = dateInput;
    } else if (dateInput && typeof dateInput.toDate === 'function') { // Firestore Timestamp
         date = dateInput.toDate();
    } else if (typeof dateInput === 'string') {
        date = new Date(dateInput);
    } else {
        return '';
    }

     if (isNaN(date.getTime())) return 'Invalid Date';

    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(); // Standard format for older dates
}

/**
 * Calculates new skill progress (simplified).
 * @param {number} currentProgress - Current progress percentage (0-100).
 * @param {string} skillLevel - Current skill level ('beginner', 'intermediate', etc.).
 * @param {number} practiceMinutes - Minutes practiced.
 * @returns {number} The new progress percentage (capped at 100).
 */
function calculateNewProgress(currentProgress, skillLevel, practiceMinutes) {
    // Define progress increase rate per hour based on level
    const progressRatePerHour = {
        'beginner': 10, // Faster progress at beginner
        'intermediate': 6,
        'advanced': 3,
        'expert': 1, // Slower progress at expert
        'default': 5
    };
    const rate = progressRatePerHour[skillLevel] || progressRatePerHour['default'];

    const progressIncrease = (practiceMinutes / 60) * rate;

    return Math.min(100, Math.round(currentProgress + progressIncrease));
}

// ==================================
// 10. Planner Module
// ==================================

// Configuration - Already defined in Section 2
// const plannerConfig = config.dashboard; // Assuming planner uses dashboard config for hours/colors

// Initialize Planner Module
function initPlannerModule() {
    // Check if element exists
    if (document.getElementById('daily')) { // Assuming the main planner div has ID 'daily'
        console.log("Initializing Planner Module");
        // Date header update - might be on index page or planner page
        updatePlannerDateHeader();
        // Initialize time scale and current time indicator immediately
        renderTimeScale(); // Render time scale based on config
        updateCurrentTimeIndicator();
        // Update current time indicator every minute
        if (window._plannerTimeIndicatorInterval) clearInterval(window._plannerTimeIndicatorInterval);
        window._plannerTimeIndicatorInterval = setInterval(updateCurrentTimeIndicator, 60000);

        // Load data depends on auth state, called from handleAuthenticatedUser
        loadPlannerData(); // This fetches data for the current date

        setupPlannerListeners();
        setupTaskTabs(); // Setup the tabs for inbox/scheduled tasks
    } else {
         console.warn("initPlannerModule called, but #daily element not found.");
    }
}

// Update Planner Date Header (Can be used on dashboard or planner)
function updatePlannerDateHeader() {
    const dateElement = document.getElementById('current-planner-date');
    if (dateElement) {
        // Default to today's date
        const today = new Date();
        dateElement.textContent = formatDate(today);
         // Store current date for navigation if needed
         dateElement.dataset.currentDate = today.toISOString().split('T')[0];
    } else {
         console.warn("#current-planner-date element not found.");
    }
}

// Date Navigation
function navigateDate(days) {
    const currentDateEl = document.getElementById('current-planner-date');
    if (!currentDateEl || !currentDateEl.dataset.currentDate) {
         console.warn("Cannot navigate date, element or data missing.");
        return;
    }

    const currentDateStr = currentDateEl.dataset.currentDate;
    const currentDate = new Date(currentDateStr);
    currentDate.setDate(currentDate.getDate() + days);

    const newDateStr = currentDate.toISOString().split('T')[0];

    currentDateEl.textContent = formatDate(currentDate);
    currentDateEl.dataset.currentDate = newDateStr; // Update stored date

    // Reload planner data for the new date
    loadPlannerData(newDateStr);
}


// Load Planner Data for a specific date
function loadPlannerData(date = new Date().toISOString().split('T')[0]) {
    // Use the auth and db instances defined earlier
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Load time blocks for the specific date
    db.collection('users').doc(userId)
      .collection('timeBlocks')
      .where('date', '==', date)
      .orderBy('startTime', 'asc') // Order by time
      .onSnapshot(snapshot => {
        const timeBlocks = [];
        snapshot.forEach(doc => {
          timeBlocks.push({ id: doc.id, ...doc.data() });
        });
        renderTimeBlocks(timeBlocks);
      }, error => {
           console.error(`Error loading time blocks for ${date}:`, error);
           showToast('Error loading daily schedule', 'error');
      });

    // Load tasks (inbox, scheduled, maybe filtered by date later)
    // For now, load all active tasks regardless of date for the task list tabs
     if (date === new Date().toISOString().split('T')[0]) { // Only load task list once for today's view
        db.collection('users').doc(userId)
            .collection('tasks')
            .where('status', '!=', 'completed')
            .orderBy('createdAt', 'desc') // Order by creation or priority/dueDate
            .onSnapshot(snapshot => {
                const tasks = [];
                snapshot.forEach(doc => {
                tasks.push({ id: doc.id, ...doc.data() });
                });
                renderTasks(tasks);
            }, error => {
                console.error("Error loading tasks:", error);
                 showToast('Error loading tasks', 'error');
            });
     } else {
          // If navigating to a different date, you might only want to show tasks *scheduled* for that date
          // Or just clear the task list. For now, the task list is static for the "current" view (today).
          console.log("Navigated to a different date, task list remains focused on today/active tasks.");
     }
}

// Time Block Rendering
function renderTimeBlocks(timeBlocks = []) {
    const container = document.querySelector('.time-blocks .blocks-container'); // Use .blocks-container
    if (!container) {
         console.warn("time-blocks .blocks-container not found.");
         return;
    }
    container.innerHTML = ''; // Clear current time blocks

    // Render time block elements
    timeBlocks.forEach(block => {
      const blockElement = document.createElement('div');
      blockElement.className = 'time-block';
      blockElement.dataset.id = block.id; // Store ID for actions

      // Calculate position and height (assuming 1 minute = 1px or scale factor)
       const scaleFactor = 1; // 1px per minute
       const totalMinutesInDay = 24 * 60;
       const startHour = plannerConfig.workHours.start;
       const endHour = plannerConfig.workHours.end;
       const minutesFromDayStart = block.startTime; // Assuming block.startTime is minutes from 00:00
       const minutesFromWorkStart = minutesFromDayStart - (startHour * 60);
       const durationMinutes = block.duration;

       // Position relative to the start of the visible work hours
      blockElement.style.top = `${minutesFromWorkStart * scaleFactor}px`;
      blockElement.style.height = `${durationMinutes * scaleFactor}px`;
      blockElement.style.backgroundColor = plannerConfig.timeBlockColors[block.type] || plannerConfig.timeBlockColors.other;

       const startTimeFormatted = formatMinutesToAmPm(block.startTime);
       const endTimeFormatted = formatMinutesToAmPm(block.startTime + block.duration);


      blockElement.innerHTML = `
        <div class="time-block-title">${block.title || 'Unnamed Block'}</div>
        <div class="time-block-time">${startTimeFormatted} - ${endTimeFormatted}</div>
      `;

      // Add event listeners for editing/deleting? (Delegation might be better)
       blockElement.addEventListener('click', () => editTimeBlock(block.id)); // Pass ID
        // Add context menu or hover actions for edit/delete?
    });

     if (timeBlocks.length === 0) {
          // Optionally display a message if no blocks
          // container.innerHTML = '<p style="padding: 20px; text-align: center;">No time blocks scheduled.</p>';
     }
}

// Render Time Scale
function renderTimeScale() {
    const timeScale = document.querySelector('.time-scale');
     if (!timeScale) {
         console.warn("time-scale element not found.");
         return;
     }
    timeScale.innerHTML = ''; // Clear existing scale

    const startHour = plannerConfig.workHours.start;
    const endHour = plannerConfig.workHours.end;

    for (let hour = startHour; hour <= endHour; hour++) {
        const timeItem = document.createElement('div');
        timeItem.className = 'time-scale-item';
        timeItem.textContent = formatHour(hour);
        timeScale.appendChild(timeItem);
    }
}


// Create Time Block (via DblClick)
function createTimeBlock(e) {
    const container = document.querySelector('.time-blocks .blocks-container');
    if (!container) {
         console.warn("time-blocks .blocks-container not found for create.");
        return;
    }

    const rect = container.getBoundingClientRect();
    const yPosition = e.clientY - rect.top;

    // Calculate time based on position (assuming 1px = 1 minute scale)
    const scaleFactor = 1; // Must match rendering scale
    const startHour = plannerConfig.workHours.start;
    const minutesFromWorkStart = Math.round(yPosition / scaleFactor); // Rounded to nearest minute
    const startTimeMinutes = (startHour * 60) + minutesFromWorkStart;

    // Adjust to nearest interval if needed (e.g., nearest 15 or 30 minutes)
    const interval = plannerConfig.defaultTaskDuration; // Use default duration as snap interval
    const snappedStartTimeMinutes = Math.round(startTimeMinutes / interval) * interval;

    const defaultDuration = plannerConfig.defaultTaskDuration; // Default duration in minutes
    const endTimeMinutes = snappedStartTimeMinutes + defaultDuration;

     const today = document.getElementById('current-planner-date')?.dataset.currentDate || new Date().toISOString().split('T')[0];


    // Open a modal or form to get details (title, type, confirm time)
    // For now, let's simulate getting title and type
     const title = prompt('Enter time block title:', 'Scheduled Task');
     if (!title) return; // User cancelled

     // In a real modal, you'd have a type selector
     const type = prompt('Enter block type (work, personal, learning, health, other):', 'work') || 'work';
     if (!plannerConfig.timeBlockColors[type] && type !== 'other') {
         showToast('Invalid type, defaulting to "other"', 'warning');
         type = 'other';
     }


    // Construct the time block data
     const timeBlockData = {
        title: title.trim(),
        type: type.toLowerCase(),
        date: today, // Associate with the current planner date
        startTime: snappedStartTimeMinutes, // Minutes from start of day (00:00)
        duration: defaultDuration, // in minutes
        endTime: endTimeMinutes, // Minutes from start of day (calculated)
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
     };

     // Save to Firestore
     saveTimeBlock(timeBlockData, 'add'); // Pass 'add' mode
}

// Task Management
function renderTasks(tasks) {
    const inboxContainer = document.getElementById('inbox-tasks');
    const scheduledContainer = document.getElementById('scheduled-tasks');
    const completedContainer = document.getElementById('completed-tasks'); // Assuming a completed tab/section

    if (!inboxContainer || !scheduledContainer) {
        console.warn("Task containers (inbox, scheduled) not found.");
        return;
    }

    inboxContainer.innerHTML = '';
    scheduledContainer.innerHTML = '';
     if (completedContainer) completedContainer.innerHTML = '';


    // Separate tasks by status/scheduling
    const inboxTasks = tasks.filter(task => !task.dueDate);
    const scheduledTasks = tasks.filter(task => task.dueDate && task.status !== 'completed');
     const completedTasks = tasks.filter(task => task.status === 'completed');


    // Render Inbox Tasks
    if (inboxTasks.length === 0) {
        inboxContainer.innerHTML = '<p>Your inbox is empty. Add a task!</p>';
    } else {
        inboxTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            inboxContainer.appendChild(taskElement);
        });
    }

    // Render Scheduled Tasks
    if (scheduledTasks.length === 0) {
        scheduledContainer.innerHTML = '<p>No tasks scheduled.</p>';
    } else {
        scheduledTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            scheduledContainer.appendChild(taskElement);
        });
    }

     // Render Completed Tasks (if container exists)
     if (completedContainer) {
         if (completedTasks.length === 0) {
             completedContainer.innerHTML = '<p>No tasks completed yet.</p>';
         } else {
             completedTasks.forEach(task => {
                 const taskElement = createTaskElement(task); // Reuse element creation
                 completedContainer.appendChild(taskElement);
             });
         }
     }
}

// Create Task Element (Reusable)
function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-item';
    taskElement.dataset.id = task.id; // Store ID
    taskElement.dataset.status = task.status; // Store status

     const isCompleted = task.status === 'completed';

    taskElement.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${isCompleted ? 'checked' : ''}>
        <span class="task-title ${isCompleted ? 'completed' : ''}">${task.title || 'Unnamed Task'}</span>
        <div class="task-meta">
             ${task.dueDate ? `<span class="task-due-date"><i class="fas fa-calendar-alt"></i> ${formatDate(task.dueDate)}</span>` : ''}
             ${task.priority ? `<span class="task-priority priority-${task.priority}">${task.priority.toUpperCase()}</span>` : ''}
              ${task.timeEstimate ? `<span class="task-estimate"><i class="fas fa-clock"></i> ${task.timeEstimate}</span>` : ''}
        </div>
        <div class="task-actions">
          <button class="task-btn edit-task" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="task-btn delete-task" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
    `;

    // Add event listeners directly to buttons (or use delegation)
    const checkbox = taskElement.querySelector('.task-checkbox');
    const editBtn = taskElement.querySelector('.edit-task');
    const deleteBtn = taskElement.querySelector('.delete-task');

     if (checkbox) {
         checkbox.addEventListener('change', () => toggleTaskComplete(task.id, checkbox.checked));
     }
     if (editBtn) {
          editBtn.addEventListener('click', () => editTask(task.id)); // Pass ID
     }
     if (deleteBtn) {
          deleteBtn.addEventListener('click', () => deleteTask(task.id)); // Pass ID
     }


    return taskElement;
}


// --- Task Modal Functions ---
function openTaskModal(taskId = null) {
    const modal = document.getElementById('task-modal');
    const form = document.getElementById('task-form');

    if (!modal || !form) {
         console.warn("Task modal or form not found.");
         return;
    }


    if (taskId) {
      // Edit mode - Fetch task data first
      document.getElementById('task-modal-title').textContent = 'Edit Task'; // Assuming a title element
      form.dataset.mode = 'edit';
      form.dataset.taskId = taskId; // Store ID


       // Fetch task data from Firestore
       const userId = auth.currentUser?.uid;
       if (!userId) {
           showToast('User not authenticated', 'error');
           closeTaskModal();
           return;
       }

       db.collection('users').doc(userId).collection('tasks').doc(taskId).get()
        .then(doc => {
            if (doc.exists) {
                const task = doc.data();
                document.getElementById('task-title').value = task.title || '';
                document.getElementById('task-description').value = task.description || '';
                 // Format dueDate to YYYY-MM-DD for input type="date"
                document.getElementById('task-due-date').value = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
                document.getElementById('task-priority').value = task.priority || 'medium';
                document.getElementById('task-estimate').value = task.timeEstimate || '';
                document.getElementById('task-energy').value = task.energyLevel || 'medium';

                // Set Eisenhower matrix radio button
                const eisenhowerValue = task.eisenhower || 'not-urgent-important'; // Default
                const eisenhowerRadio = form.querySelector(`input[name="eisenhower"][value="${eisenhowerValue}"]`);
                if (eisenhowerRadio) eisenhowerRadio.checked = true;

                 modal.classList.add('active'); // Show modal after data is populated

            } else {
                showToast('Task not found', 'error');
                 closeTaskModal();
            }
        })
        .catch(error => {
            console.error("Error fetching task for edit:", error);
            showToast('Failed to load task data', 'error');
             closeTaskModal();
        });


    } else {
      // Add mode
      document.getElementById('task-modal-title').textContent = 'Add New Task'; // Assuming a title element
      form.reset();
      form.dataset.mode = 'add';
      delete form.dataset.taskId; // Ensure taskId is not present
      // Set default Eisenhower matrix radio button if none is checked after reset
       const defaultEisenhower = form.querySelector('input[name="eisenhower"][value="not-urgent-important"]');
       if (defaultEisenhower) defaultEisenhower.checked = true;

      modal.classList.add('active'); // Show modal immediately for add mode
    }
}

function closeTaskModal() {
    const modal = document.getElementById('task-modal');
     if (modal) {
        modal.classList.remove('active');
        const form = document.getElementById('task-form');
        if (form) form.reset(); // Reset form on close
     }
}

async function saveTask(e) {
    e.preventDefault();

    const form = e.target;
    const userId = auth.currentUser?.uid;
    if (!userId) {
        showToast('User not authenticated', 'error');
        return;
    }

    // Get form values
    const taskData = {
      title: document.getElementById('task-title').value.trim(),
      description: document.getElementById('task-description').value.trim() || null,
      dueDate: document.getElementById('task-due-date').value || null, // YYYY-MM-DD string
      priority: document.getElementById('task-priority').value || 'medium',
      timeEstimate: document.getElementById('task-estimate').value.trim() || null, // Keep as string like "30m", "1h"
      energyLevel: document.getElementById('task-energy').value || 'medium',
      eisenhower: form.querySelector('input[name="eisenhower"]:checked')?.value || 'not-urgent-important', // Default
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Basic validation
    if (!taskData.title) {
        showToast('Task title is required', 'error');
        return;
    }


    try {
      if (form.dataset.mode === 'edit' && form.dataset.taskId) {
        // Update existing task
        await db.collection('users').doc(userId)
          .collection('tasks')
          .doc(form.dataset.taskId)
          .update(taskData);
        showToast('Task updated successfully');
      } else {
        // Add new task
        taskData.status = 'active'; // New tasks are active
        taskData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('users').doc(userId)
          .collection('tasks')
          .add(taskData);
         showToast('Task added successfully');
      }

      closeTaskModal();
    } catch (error) {
      console.error('Error saving task:', error);
      showToast('Error saving task', 'error');
    }
}


// --- Time Block Modal/Form ---
// You would need a similar modal and save function for Time Blocks
// For now, createTimeBlock uses prompts, but a modal is better UX.

async function saveTimeBlock(timeBlockData, mode = 'add', timeBlockId = null) {
     const userId = auth.currentUser?.uid;
     if (!userId) {
         showToast('User not authenticated', 'error');
         return;
     }

     try {
         if (mode === 'edit' && timeBlockId) {
             await db.collection('users').doc(userId).collection('timeBlocks').doc(timeBlockId).update(timeBlockData);
             showToast('Time Block updated');
         } else { // Add mode
             await db.collection('users').doc(userId).collection('timeBlocks').add(timeBlockData);
             showToast('Time Block added');
         }
         // Close time block modal if you implement one
     } catch (error) {
          console.error('Error saving time block:', error);
          showToast('Failed to save time block', 'error');
     }
}

// Placeholder for editing time blocks
function editTimeBlock(timeBlockId) {
    showToast(`Feature: Edit Time Block ID: ${timeBlockId}`);
    // In a real app, fetch the time block data and open a modal pre-filled
    // openTimeBlockModal(timeBlockId); // Need to implement openTimeBlockModal
}


// --- Task Actions ---
async function toggleTaskComplete(taskId, completed) {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
        await db.collection('users').doc(userId)
            .collection('tasks')
            .doc(taskId)
            .update({
                status: completed ? 'completed' : 'active',
                completedAt: completed ? firebase.firestore.FieldValue.serverTimestamp() : null,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        showToast(`Task marked as ${completed ? 'completed' : 'active'}`);
        // UI update happens via snapshot listener
    } catch (error) {
        console.error("Error toggling task completion:", error);
        showToast('Failed to update task status', 'error');
    }
}

function editTask(taskId) {
    openTaskModal(taskId); // Open the task modal in edit mode
}

async function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      try {
          await db.collection('users').doc(userId)
              .collection('tasks')
              .doc(taskId)
              .delete();
           showToast('Task deleted successfully');
           // UI update happens via snapshot listener
      } catch (error) {
           console.error("Error deleting task:", error);
           showToast('Failed to delete task', 'error');
      }
    }
}


// Quick Task Add (using input field and button)
function addNewTask() {
    const input = document.getElementById('new-task-input');
    if (!input) {
         console.warn("#new-task-input not found for quick add.");
         return;
    }
    const title = input.value.trim();

    if (title) {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        showToast('User not authenticated', 'error');
        return;
      }

      db.collection('users').doc(userId)
        .collection('tasks')
        .add({
          title,
          status: 'active',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
           updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            input.value = ''; // Clear input on success
            showToast('Task added to inbox');
        })
        .catch(error => {
            console.error("Error adding quick task:", error);
            showToast('Failed to add task', 'error');
        });

    } else {
        showToast('Please enter a task title', 'warning');
    }
}


// --- Tab System ---
function setupTaskTabs() {
    const tabsContainer = document.querySelector('.task-tabs'); // Assuming a container for tabs
    if (!tabsContainer) {
         console.warn(".task-tabs container not found.");
         return;
    }

    const tabs = tabsContainer.querySelectorAll('.task-tab');
    const contents = document.querySelectorAll('.task-tab-content'); // Select all content areas

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs and contents
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        // Add active class to clicked tab
        tab.classList.add('active');

        // Show corresponding content based on data-tab attribute
        const tabName = tab.dataset.tab; // e.g., 'inbox', 'scheduled', 'completed'
        const targetContent = document.getElementById(`${tabName}-tab-content`); // Assuming content IDs like inbox-tab-content
        if (targetContent) {
            targetContent.classList.add('active');
        } else {
            console.warn(`Task tab content not found for tab: ${tabName}`);
        }
      });
    });

     // Activate the first tab by default if none are active initially
     if (tabs.length > 0 && !tabsContainer.querySelector('.task-tab.active')) {
         tabs[0].click();
     }
}


// --- Time Indicator ---
function updateCurrentTimeIndicator() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentMinutesFromDayStart = (currentHour * 60) + currentMinute;

    const startHour = plannerConfig.workHours.start;
    const endHour = plannerConfig.workHours.end;
    const totalWorkMinutes = (endHour - startHour) * 60;

    const timeBlocksContainer = document.querySelector('.time-blocks .blocks-container'); // Position relative to this container
     if (!timeBlocksContainer) {
         // Indicator requires the time blocks area
         const indicator = document.querySelector('.current-time-indicator');
          if (indicator) indicator.remove(); // Remove if container disappears
         return;
     }


    // Only show indicator within the defined work hours range
    if (currentHour >= startHour && currentHour <= endHour) {
      // Calculate position relative to the start of work hours
       const minutesIntoWorkday = currentMinutesFromDayStart - (startHour * 60);
       // Ensure position is not negative or beyond the container height
      const position = Math.max(0, Math.min(totalWorkMinutes, minutesIntoWorkday)); // Position in 'pixels' (assuming 1px per minute scale)

      let indicator = timeBlocksContainer.querySelector('.current-time-indicator');

      if (!indicator) {
          indicator = document.createElement('div');
          indicator.className = 'current-time-indicator';
          timeBlocksContainer.appendChild(indicator); // Append to the blocks container
      }

      // Update position
      indicator.style.top = `${position}px`;
      indicator.style.display = 'block'; // Ensure it's visible
    } else {
      // Hide indicator if outside work hours
      const indicator = timeBlocksContainer.querySelector('.current-time-indicator');
      if (indicator) indicator.style.display = 'none';
    }
}


// --- Helper Functions (Planner Module) ---
// formatDate is in Utilities (Section 3)

/**
 * Formats minutes from start of day (0-1439) to AM/PM string.
 * @param {number} totalMinutes - Minutes from midnight (00:00).
 * @returns {string} Formatted time string (e.g., "8:00 AM").
 */
function formatMinutesToAmPm(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM/PM
    const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
}

/**
 * Formats an hour number (0-23) to AM/PM string for time scale.
 * @param {number} hour - Hour (0-23).
 * @returns {string} Formatted hour string (e.g., "8 AM").
 */
function formatHour(hour) {
    const displayHour = hour % 12 || 12;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${displayHour} ${ampm}`;
}

// timeToPosition, positionToMinutes, durationToHeight might be better handled directly within render/create functions
// or made flexible based on a global scale factor config if the time scale needs adjustment.
// For now, inline calculations assuming 1px per minute are sufficient if the CSS grid/flex layout handles vertical spacing correctly.

// ==================================
// 11. Professional Module
// ==================================

// Initialize Professional Module
function initProfessionalModule() {
    // Check if element exists
    if (document.getElementById('professional')) {
         console.log("Initializing Professional Module");
        // Load professional data from Firestore - Called by handleAuthenticatedUser
        // setupProfessionalEventListeners(); // Setup listeners immediately
        // Initialize view based on URL hash or default
        const defaultView = window.location.hash.replace('#', '') || 'dashboard';
        // switchProfessionalView(defaultView); // Switch view after data is loaded
         // Update professional dashboard with real-time data - Called after data load
        loadProfessionalData(); // This will trigger rendering and potential view switching
        setupProfessionalEventListeners(); // Setup listeners after main element is confirmed
    } else {
         console.warn("initProfessionalModule called, but #professional element not found.");
    }
}

// Load professional data from Firestore
function loadProfessionalData() {
    // Use the auth and db instances defined earlier
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    db.collection('users').doc(userId).collection('professional').doc('data').onSnapshot(doc => {
        if (doc.exists) {
            const data = doc.data();
            renderProfessionalData(data);
             // Switch view after data is loaded/rendered
            const defaultView = window.location.hash.replace('#', '') || 'dashboard';
            switchProfessionalView(defaultView);
        } else {
            console.warn("Professional data document not found for user:", userId);
            // Initialize professional data structure for new users if not found
            initializeProfessionalData(userId);
             // After initialization, the snapshot listener will fire and render
        }
    }, error => {
        console.error("Error loading professional data:", error);
        showToast('Failed to load professional data', 'error');
    });
}

// Initialize professional data structure
async function initializeProfessionalData(userId) {
     // Use the db instance defined earlier
    const initialData = {
        // Career Profile
        profile: {
            currentRole: "Biochemist | Data Engineer | Developer", // Match profile defaults
            careerLevel: "Entry-Level",
            careerPath: "Technology & Healthcare Regulation",
            skills: ["Python", "SQL", "Data Analysis"], // Simple list
            aspirations: [
                "Become a world-class data engineer",
                "Develop expertise in machine learning",
                "Master full-stack web development",
                "Gain supply chain knowledge",
                "Understand financial technology"
            ],
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        },

        // Skills Development Framework (More detailed tracking)
        skills: {
            technical: {
                "Python": { level: 3, target: 5, resources: [] },
                "SQL": { level: 3, target: 5, resources: [] },
                "Data Engineering": { level: 2, target: 5, resources: [] },
                "Machine Learning": { level: 1, target: 5, resources: [] },
                "Web Development": { level: 2, target: 5, resources: [] }
            },
            professional: {
                "Communication": { level: 3, target: 5, resources: [] },
                "Project Management": { level: 2, target: 4, resources: [] },
                "Leadership": { level: 2, target: 4, resources: [] }
            },
            domain: {
                "Healthcare Regulation": { level: 2, target: 4, resources: [] },
                "Supply Chain": { level: 1, target: 4, resources: [] },
                "Financial Technology": { level: 1, target: 4, resources: [] }
            }
        },

        // Job Search Tracker
        jobSearch: {
            targetRoles: [
                "Senior Data Engineer",
                "Machine Learning Engineer",
                "Full-Stack Developer",
                "Technical Product Manager"
            ],
            applications: [], // Array of application objects
            networkingContacts: [], // Array of contact objects
            interviewPrep: {} // Object for tracking prep
        },

        // Learning Plan
        learningPlan: {
            currentCourses: [], // Array of course objects
            completedCourses: [],
            plannedCourses: [],
            readingList: [] // Array of book objects
        },

        // Performance Metrics
        metrics: {
            productivity: { // Example structure
                 weekly: 'N/A',
                 monthly: 'N/A'
             },
            achievements: [], // Array of achievement objects
            performanceReviews: [] // Array of review objects
        },

        // Long-term Career Strategy
        careerStrategy: {
            fiveYearPlan: "Develop deep expertise in Data Engineering and ML. Lead complex data projects. Mentor junior engineers.",
            tenYearVision: "Be a recognized leader in the Tech & Healthcare Regulation space. Influence data strategy at a high level or start my own venture.",
            legacyGoals: "Inspire and enable others, especially in Africa, to pursue impactful careers in technology and science."
        }
    };

    try {
        await db.collection('users').doc(userId).collection('professional').doc('data').set(initialData);
        console.log("Professional profile initialized successfully for user:", userId);
        // Data will be rendered by the snapshot listener
        // showToast('Professional profile initialized successfully', 'success');
    } catch (error) {
        console.error("Error initializing professional data:", error);
        showToast('Failed to initialize professional data', 'error');
        throw error; // Re-throw if needed by caller
    }
}

// Render professional data to the UI
function renderProfessionalData(data) {
    // Update UI sections if they exist
    if (document.getElementById('professional')) { // Check if on the professional page
        console.log("Rendering professional data...");
        updateProfileSection(data.profile || {}); // Pass empty object if data is null
        updateSkillsTracking(data.skills || {});
        updateJobSearchTracker(data.jobSearch || {});
        updateLearningPlan(data.learningPlan || {});
        updatePerformanceMetrics(data.metrics || {});
        updateCareerStrategy(data.careerStrategy || {});
        updateProfessionalDashboard(data); // Update summary dashboard stats/charts
    } else {
         console.warn("renderProfessionalData called, but not on professional page.");
    }
}

// Update profile section
function updateProfileSection(profileData) {
    const roleEl = document.getElementById('current-role');
    const levelEl = document.getElementById('career-level');
    const pathEl = document.getElementById('career-path');
    const aspirationsList = document.getElementById('career-aspirations');

    if (roleEl) roleEl.textContent = profileData.currentRole || 'N/A';
    if (levelEl) levelEl.textContent = profileData.careerLevel || 'N/A';
    if (pathEl) pathEl.textContent = profileData.careerPath || 'N/A';

    if (aspirationsList) {
        aspirationsList.innerHTML = '';
        const aspirations = Array.isArray(profileData.aspirations) ? profileData.aspirations : [];
        if (aspirations.length === 0) {
             aspirationsList.innerHTML = '<li>No aspirations defined yet.</li>';
        } else {
            aspirations.forEach(aspiration => {
                const li = document.createElement('li');
                li.textContent = aspiration;
                aspirationsList.appendChild(li);
            });
        }
    }
}

// Update skills tracking
function updateSkillsTracking(skillsData) {
    const technicalSkillsContainer = document.getElementById('technical-skills-container');
    const professionalSkillsContainer = document.getElementById('professional-skills-container');
    const domainSkillsContainer = document.getElementById('domain-skills-container');

     if (technicalSkillsContainer) technicalSkillsContainer.innerHTML = '';
     if (professionalSkillsContainer) professionalSkillsContainer.innerHTML = '';
     if (domainSkillsContainer) domainSkillsContainer.innerHTML = '';


    // Technical skills
    const technicalSkills = skillsData.technical || {};
    const professionalSkills = skillsData.professional || {};
    const domainSkills = skillsData.domain || {};


     if (technicalSkillsContainer && Object.keys(technicalSkills).length === 0) {
          technicalSkillsContainer.innerHTML = '<p>No technical skills added yet.</p>';
     } else {
         for (const [skillName, details] of Object.entries(technicalSkills)) {
             if (technicalSkillsContainer) technicalSkillsContainer.appendChild(createProfessionalSkillCard(skillName, details, 'technical'));
         }
     }

     if (professionalSkillsContainer && Object.keys(professionalSkills).length === 0) {
          professionalSkillsContainer.innerHTML = '<p>No professional skills added yet.</p>';
     } else {
         for (const [skillName, details] of Object.entries(professionalSkills)) {
              if (professionalSkillsContainer) professionalSkillsContainer.appendChild(createProfessionalSkillCard(skillName, details, 'professional'));
         }
     }

     if (domainSkillsContainer && Object.keys(domainSkills).length === 0) {
          domainSkillsContainer.innerHTML = '<p>No domain skills added yet.</p>';
     } else {
         for (const [skillName, details] of Object.entries(domainSkills)) {
             if (domainSkillsContainer) domainSkillsContainer.appendChild(createProfessionalSkillCard(skillName, details, 'domain'));
         }
     }
}

// Create professional skill card element (slightly different from learning module)
function createProfessionalSkillCard(skillName, skillDetails, category) {
    const card = document.createElement('div');
    card.className = 'skill-card';
    card.dataset.category = category; // Add category data attribute for filtering
    card.dataset.name = skillName.replace(/\s+/g, '_'); // Use a clean name for data attribute

    // Ensure details and levels are numbers, default to 1
    const currentLevel = skillDetails?.level ?? 1;
    const targetLevel = skillDetails?.target ?? 5; // Default target level

    const progressPercentage = targetLevel > 0 ? (currentLevel / targetLevel) * 100 : 0;

    card.innerHTML = `
        <div class="skill-header">
            <h4>${skillName}</h4>
            <div class="skill-level">Level ${currentLevel}/${targetLevel}</div>
        </div>
        <div class="skill-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min(100, progressPercentage)}%"></div>
            </div>
        </div>
        <div class="skill-actions">
             <button class="btn btn-sm btn-icon professional-skill-edit" title="Edit Skill Level">
                 <i class="fas fa-edit"></i>
             </button>
             <button class="btn btn-sm btn-icon professional-skill-delete" title="Delete Skill">
                 <i class="fas fa-trash"></i>
             </button>
        </div>
    `;

     // Add event listeners via delegation on a parent container if possible
     // Or attach listeners here if the number of cards is manageable
     card.querySelector('.professional-skill-edit').addEventListener('click', (e) => {
         e.stopPropagation();
         handleEditProfessionalSkill(category, skillName); // Pass category and name
     });
     card.querySelector('.professional-skill-delete').addEventListener('click', (e) => {
         e.stopPropagation();
         if (confirm(`Are you sure you want to delete the skill "${skillName}"?`)) {
             handleDeleteProfessionalSkill(category, skillName); // Pass category and name
         }
     });


    return card;
}

// Update job search tracker
function updateJobSearchTracker(jobSearchData) {
    const targetRolesList = document.getElementById('target-roles-list');
    const applicationsContainer = document.getElementById('applications-container');
    const networkingContainer = document.getElementById('networking-contacts');

     if (targetRolesList) {
        targetRolesList.innerHTML = '';
         const targetRoles = Array.isArray(jobSearchData.targetRoles) ? jobSearchData.targetRoles : [];
         if (targetRoles.length === 0) {
              targetRolesList.innerHTML = '<li>No target roles defined yet.</li>';
         } else {
             targetRoles.forEach(role => {
                 const li = document.createElement('li');
                 li.textContent = role;
                 targetRolesList.appendChild(li);
             });
         }
     }


     if (applicationsContainer) {
        applicationsContainer.innerHTML = '';
         const applications = Array.isArray(jobSearchData.applications) ? jobSearchData.applications : [];
         if (applications.length === 0) {
             applicationsContainer.innerHTML = '<p>No job applications tracked yet.</p>';
         } else {
             applications.forEach(application => {
                 // Applications likely don't have Firestore doc IDs here unless fetched separately
                 // Use a unique identifier if available, or just render data
                 applicationsContainer.appendChild(createApplicationCard(application));
             });
         }
     }


     if (networkingContainer) {
         networkingContainer.innerHTML = '';
          const networkingContacts = Array.isArray(jobSearchData.networkingContacts) ? jobSearchData.networkingContacts : [];
          if (networkingContacts.length === 0) {
              networkingContainer.innerHTML = '<p>No networking contacts added yet.</p>';
          } else {
              networkingContacts.forEach(contact => {
                   // Contacts might have IDs if stored in a subcollection, or just render array data
                   networkingContainer.appendChild(createContactCard(contact));
               });
          }
     }
}

// Create application card
function createApplicationCard(application) {
    const card = document.createElement('div');
    card.className = 'application-card';
    // If applications are just array items, they don't have a Firestore doc ID
    // Add data attributes for details if needed
     card.dataset.position = application.position;
     card.dataset.company = application.company;


    // Safely format date
     const applicationDate = application.date ? formatDate(new Date(application.date)) : 'N/A'; // Assuming date is YYYY-MM-DD string

    card.innerHTML = `
        <h5>${application.position || 'Unnamed Position'}</h5>
        <p>${application.company || 'Unnamed Company'}</p>
        <div class="application-status ${application.status?.toLowerCase() || 'unknown'}">
            ${application.status || 'Unknown Status'}
        </div>
        <div class="application-date">Applied: ${applicationDate}</div>
        <div class="application-actions">
             <button class="btn btn-sm btn-icon application-update" title="Update Status">
                 <i class="fas fa-sync-alt"></i>
             </button>
             <button class="btn btn-sm btn-icon application-notes" title="View Notes">
                 <i class="fas fa-file-alt"></i>
             </button>
              <button class="btn btn-sm btn-icon application-delete" title="Delete Application">
                 <i class="fas fa-trash"></i>
             </button>
        </div>
    `;

     // Add event listeners via delegation on a parent container if possible
      card.querySelector('.application-delete').addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`Are you sure you want to delete the application for "${application.position}" at "${application.company}"?`)) {
               handleDeleteApplication(application); // Pass the full object or a unique identifier
          }
      });
      // Add update/notes listeners similarly
       card.querySelector('.application-update').addEventListener('click', (e) => {
           e.stopPropagation();
           handleUpdateApplicationStatus(application); // Pass object
       });
        card.querySelector('.application-notes').addEventListener('click', (e) => {
           e.stopPropagation();
           handleViewApplicationNotes(application); // Pass object
       });


    return card;
}

// Create networking contact card (Placeholder)
function createContactCard(contact) {
    const card = document.createElement('div');
    card.className = 'contact-card';
     card.dataset.name = contact.name?.replace(/\s+/g, '_'); // Unique identifier

    card.innerHTML = `
         <h5>${contact.name || 'Unnamed Contact'}</h5>
         <p>${contact.title || ''} at ${contact.company || ''}</p>
         <div class="contact-meta">
             <span><i class="fas fa-calendar-alt"></i> Last Interaction: ${contact.lastInteraction ? formatDate(new Date(contact.lastInteraction)) : 'N/A'}</span>
         </div>
          <div class="contact-actions">
             <button class="btn btn-sm btn-icon contact-log-interaction" title="Log Interaction">
                 <i class="fas fa-plus"></i>
             </button>
              <button class="btn btn-sm btn-icon contact-delete" title="Delete Contact">
                 <i class="fas fa-trash"></i>
             </button>
          </div>
     `;
      card.querySelector('.contact-delete').addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`Are you sure you want to delete the contact "${contact.name}"?`)) {
               handleDeleteContact(contact); // Pass object
          }
      });
       card.querySelector('.contact-log-interaction').addEventListener('click', (e) => {
          e.stopPropagation();
          handleLogContactInteraction(contact); // Pass object
       });

    return card;
}


// Update learning plan
function updateLearningPlan(learningPlanData) {
    const currentCoursesContainer = document.getElementById('professional-current-courses-container'); // Use professional- prefix
    const plannedCoursesContainer = document.getElementById('professional-planned-courses-container'); // Use professional- prefix
    const completedCoursesContainer = document.getElementById('professional-completed-courses-container'); // Use professional- prefix
    const readingListContainer = document.getElementById('professional-reading-list-container'); // Use professional- prefix

    const currentCourses = Array.isArray(learningPlanData.currentCourses) ? learningPlanData.currentCourses : [];
    const plannedCourses = Array.isArray(learningPlanData.plannedCourses) ? learningPlanData.plannedCourses : [];
    const completedCourses = Array.isArray(learningPlanData.completedCourses) ? learningPlanData.completedCourses : [];
    const readingList = Array.isArray(learningPlanData.readingList) ? learningPlanData.readingList : [];

     if (currentCoursesContainer) {
        currentCoursesContainer.innerHTML = '';
        if (currentCourses.length === 0) {
             currentCoursesContainer.innerHTML = '<p>No courses in progress.</p>';
        } else {
             currentCourses.forEach(course => {
                 currentCoursesContainer.appendChild(createProfessionalLearningResourceCard(course, 'current'));
             });
        }
     }
     if (plannedCoursesContainer) {
        plannedCoursesContainer.innerHTML = '';
         if (plannedCourses.length === 0) {
             plannedCoursesContainer.innerHTML = '<p>No courses planned.</p>';
         } else {
             plannedCourses.forEach(course => {
                 plannedCoursesContainer.appendChild(createProfessionalLearningResourceCard(course, 'planned'));
             });
         }
     }
     if (completedCoursesContainer) {
        completedCoursesContainer.innerHTML = '';
        if (completedCourses.length === 0) {
            completedCoursesContainer.innerHTML = '<p>No courses completed yet.</p>';
        } else {
             completedCourses.forEach(course => {
                 completedCoursesContainer.appendChild(createProfessionalLearningResourceCard(course, 'completed'));
             });
        }
     }
     if (readingListContainer) {
         readingListContainer.innerHTML = '';
         if (readingList.length === 0) {
             readingListContainer.innerHTML = '<p>Your reading list is empty.</p>';
         } else {
              readingList.forEach(book => {
                  readingListContainer.appendChild(createProfessionalReadingListItem(book));
              });
         }
     }
}

// Create professional learning resource card
function createProfessionalLearningResourceCard(resource, status) {
    const card = document.createElement('div');
    card.className = `resource-card ${status}`;
    // Use a unique identifier if available, otherwise use properties
     card.dataset.title = resource.title?.replace(/\s+/g, '_');


    const progressPercentage = resource.progress || 0;

    card.innerHTML = `
        <div class="resource-header">
            <h5>${resource.title || 'Unnamed Resource'}</h5>
            <div class="resource-source">${resource.source || 'Unknown Source'}</div>
        </div>
        <div class="resource-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min(100, progressPercentage)}%"></div>
            </div>
            <span>${progressPercentage}% complete</span>
        </div>
        <div class="resource-meta">
            <span><i class="fas fa-calendar"></i> Started: ${resource.startDate ? formatDate(new Date(resource.startDate)) : 'N/A'}</span>
            ${resource.targetDate ? `<span><i class="fas fa-flag"></i> Target: ${formatDate(new Date(resource.targetDate))}</span>` : ''}
        </div>
        <div class="resource-actions">
            <button class="btn btn-sm btn-icon professional-resource-update" title="Update Progress">
                <i class="fas fa-edit"></i>
            </button>
            ${status !== 'completed' ? `
                <button class="btn btn-sm btn-icon professional-resource-complete" title="Mark Complete">
                    <i class="fas fa-check"></i>
                </button>
            ` : ''}
             <button class="btn btn-sm btn-icon professional-resource-delete" title="Delete Resource">
                 <i class="fas fa-trash"></i>
             </button>
        </div>
    `;
     card.querySelector('.professional-resource-delete').addEventListener('click', (e) => {
         e.stopPropagation();
         if (confirm(`Are you sure you want to delete the resource "${resource.title}"?`)) {
              handleDeleteProfessionalResource(resource, status); // Pass object and status
         }
     });
      if (status !== 'completed') {
          card.querySelector('.professional-resource-complete').addEventListener('click', (e) => {
              e.stopPropagation();
              handleCompleteProfessionalResource(resource, status); // Pass object and status
          });
      }
       card.querySelector('.professional-resource-update').addEventListener('click', (e) => {
           e.stopPropagation();
           handleUpdateProfessionalResource(resource, status); // Pass object and status
       });


    return card;
}

// Create professional reading list item (Placeholder)
function createProfessionalReadingListItem(book) {
     const li = document.createElement('li');
     li.className = 'reading-list-item';
      li.dataset.title = book.title?.replace(/\s+/g, '_');

     li.innerHTML = `
        <span>${book.title || 'Unnamed Book'} by ${book.author || 'Unknown Author'}</span>
        <div class="item-actions">
             <button class="btn btn-sm btn-icon reading-item-complete" title="Mark Read">
                 <i class="fas fa-check"></i>
             </button>
             <button class="btn btn-sm btn-icon reading-item-delete" title="Remove">
                 <i class="fas fa-trash"></i>
             </button>
        </div>
     `;
      li.querySelector('.reading-item-delete').addEventListener('click', (e) => {
         e.stopPropagation();
         if (confirm(`Remove "${book.title}" from reading list?`)) {
             handleDeleteReadingItem(book); // Pass object
         }
     });
       li.querySelector('.reading-item-complete').addEventListener('click', (e) => {
         e.stopPropagation();
         handleCompleteReadingItem(book); // Pass object
     });

     return li;
}


// Update performance metrics
function updatePerformanceMetrics(metricsData) {
    const weeklyProdEl = document.getElementById('weekly-productivity');
    const monthlyProdEl = document.getElementById('monthly-productivity');
    const achievementsList = document.getElementById('achievements-list');
    const reviewsContainer = document.getElementById('performance-reviews');

    // Productivity metrics
    if (weeklyProdEl) weeklyProdEl.textContent = metricsData.productivity?.weekly || 'N/A';
    if (monthlyProdEl) monthlyProdEl.textContent = metricsData.productivity?.monthly || 'N/A';

    // Achievements
    if (achievementsList) {
        achievementsList.innerHTML = '';
        const achievements = Array.isArray(metricsData.achievements) ? metricsData.achievements : [];
        if (achievements.length === 0) {
             achievementsList.innerHTML = '<li>No achievements recorded yet.</li>';
        } else {
             // Sort achievements by date descending
             achievements.sort((a, b) => new Date(b.date) - new Date(a.date));
             achievements.forEach(achievement => {
                 const li = document.createElement('li');
                 li.innerHTML = `
                    <strong>${achievement.date ? formatDate(new Date(achievement.date)) : 'N/A'}:</strong> ${achievement.description || 'Unnamed achievement'}
                    <span class="achievement-impact">Impact: ${achievement.impact}/5</span>
                    <div class="achievement-actions">
                        <button class="btn btn-sm btn-icon achievement-edit" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-icon achievement-delete" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                 `;
                  li.querySelector('.achievement-delete').addEventListener('click', (e) => {
                     e.stopPropagation();
                     if (confirm('Delete this achievement?')) {
                         handleDeleteAchievement(achievement); // Pass object
                     }
                 });
                  li.querySelector('.achievement-edit').addEventListener('click', (e) => {
                     e.stopPropagation();
                     handleEditAchievement(achievement); // Pass object
                 });

                 achievementsList.appendChild(li);
             });
        }
    }

    // Performance reviews
    if (reviewsContainer) {
         reviewsContainer.innerHTML = '';
          const performanceReviews = Array.isArray(metricsData.performanceReviews) ? metricsData.performanceReviews : [];
          if (performanceReviews.length === 0) {
               reviewsContainer.innerHTML = '<p>No performance reviews recorded yet.</p>';
          } else {
              performanceReviews.forEach(review => {
                  // Reviews might have IDs or just be array items
                  reviewsContainer.appendChild(createReviewCard(review));
              });
          }
    }
}

// Create review card (Placeholder)
function createReviewCard(review) {
     const card = document.createElement('div');
     card.className = 'review-card';
      card.dataset.date = review.date; // Unique identifier

     card.innerHTML = `
         <h5>Review on ${review.date ? formatDate(new Date(review.date)) : 'N/A'}</h5>
         <p>Rating: ${review.rating}/5</p>
         <div class="review-actions">
             <button class="btn btn-sm btn-icon review-view" title="View Details">
                 <i class="fas fa-eye"></i>
             </button>
              <button class="btn btn-sm btn-icon review-delete" title="Delete Review">
                 <i class="fas fa-trash"></i>
             </button>
         </div>
     `;
      card.querySelector('.review-delete').addEventListener('click', (e) => {
         e.stopPropagation();
         if (confirm('Delete this review record?')) {
             handleDeleteReview(review); // Pass object
         }
     });
      card.querySelector('.review-view').addEventListener('click', (e) => {
         e.stopPropagation();
         handleViewReview(review); // Pass object
     });


     return card;
}


// Update career strategy
function updateCareerStrategy(strategyData) {
    const fiveYearEl = document.getElementById('five-year-plan');
    const tenYearEl = document.getElementById('ten-year-vision');
    const legacyEl = document.getElementById('legacy-goals');

    if (fiveYearEl) fiveYearEl.textContent = strategyData.fiveYearPlan || "Not yet defined";
    if (tenYearEl) tenYearEl.textContent = strategyData.tenYearVision || "Not yet defined";
    if (legacyEl) legacyEl.textContent = strategyData.legacyGoals || "Not yet defined";
}


// Set up event listeners for professional module
function setupProfessionalEventListeners() {
    // Check if the main container exists
    const professionalContainer = document.getElementById('professional');
    if (!professionalContainer) {
        console.warn("Professional container not found. Skipping event listeners setup.");
        return;
    }

    // View switching
    const viewSelector = document.getElementById('professional-view-selector');
    if (viewSelector) {
         viewSelector.addEventListener('change', function() {
             switchProfessionalView(this.value);
         });
          // Set initial value if a view is active on load
         const activeView = professionalContainer.querySelector('.professional-view.active');
         if (activeView && activeView.id) {
              viewSelector.value = activeView.id.replace('professional-', '');
         }
    }


    // Add buttons - Use the existing openModal functions from Learning or create specific ones
    const addGoalBtn = document.getElementById('add-professional-goal'); // Assuming an ID like this
    const addSkillBtn = document.getElementById('add-professional-skill'); // Assuming an ID like this
    const addResourceBtn = document.getElementById('add-professional-learning'); // Assuming an ID like this
    const addApplicationBtn = document.getElementById('add-professional-application'); // Assuming an ID like this
    const addContactBtn = document.getElementById('add-professional-contact'); // Assuming an ID like this
    const addAchievementBtn = document.getElementById('add-professional-achievement'); // Assuming an ID like this
    const addReviewBtn = document.getElementById('add-professional-review'); // Assuming an ID like this


     if (addGoalBtn) addGoalBtn.addEventListener('click', () => openProfessionalModal('goal'));
     if (addSkillBtn) addSkillBtn.addEventListener('click', () => openProfessionalModal('skill'));
     if (addResourceBtn) addResourceBtn.addEventListener('click', () => openProfessionalModal('learning'));
     if (addApplicationBtn) addApplicationBtn.addEventListener('click', () => openProfessionalModal('application'));
     if (addContactBtn) addContactBtn.addEventListener('click', () => openProfessionalModal('contact'));
     if (addAchievementBtn) addAchievementBtn.addEventListener('click', () => openProfessionalModal('achievement'));
     if (addReviewBtn) addReviewBtn.addEventListener('click', () => openProfessionalModal('review'));


    // Form submissions - Add specific listeners to each form
    const goalForm = document.getElementById('professional-goal-form'); // Assuming form IDs
    const skillForm = document.getElementById('professional-skill-form');
    const resourceForm = document.getElementById('professional-learning-form');
    const applicationForm = document.getElementById('professional-application-form');
    const contactForm = document.getElementById('professional-contact-form');
    const achievementForm = document.getElementById('professional-achievement-form');
    const reviewForm = document.getElementById('professional-review-form');


    if (goalForm) goalForm.addEventListener('submit', saveProfessionalGoal);
    if (skillForm) skillForm.addEventListener('submit', saveProfessionalSkill);
    if (resourceForm) resourceForm.addEventListener('submit', saveProfessionalLearningResource);
    if (applicationForm) applicationForm.addEventListener('submit', saveJobApplication);
    if (contactForm) contactForm.addEventListener('submit', saveProfessionalContact);
    if (achievementForm) achievementForm.addEventListener('submit', saveProfessionalAchievement);
    if (reviewForm) reviewForm.addEventListener('submit', savePerformanceReview);


    // Modal close buttons (using a generic close function)
    document.querySelectorAll('#professional .modal .close-modal').forEach(button => {
        button.addEventListener('click', closeProfessionalModal);
    });

     // Cancel buttons (using a generic close function)
     document.querySelectorAll('#professional .modal .btn-cancel').forEach(btn => {
         btn.addEventListener('click', closeProfessionalModal);
     });


     // Add delegation listeners for edit/delete/update actions on dynamically rendered items
     professionalContainer.addEventListener('click', (e) => {
         // Skill actions (handled within createProfessionalSkillCard listeners for simplicity)
         // Application actions (handled within createApplicationCard listeners)
         // Learning Resource actions (handled within createProfessionalLearningResourceCard listeners)
         // Reading List actions (handled within createProfessionalReadingListItem listeners)
         // Achievement actions (handled within updatePerformanceMetrics listeners)
         // Review actions (handled within updatePerformanceMetrics listeners)
          // Contact actions (handled within createContactCard listeners)

     });
}

// Switch between professional views
function switchProfessionalView(view) {
    // Hide all views
    document.querySelectorAll('.professional-view').forEach(viewElement => {
        viewElement.classList.remove('active');
    });

    // Show selected view
    const targetView = document.getElementById(`professional-${view}`);
    if (targetView) {
        targetView.classList.add('active');
        // Update URL hash (optional, but good practice)
        history.replaceState(null, '', `#${view}`);
         console.log(`Switched Professional View to: ${view}`);

         // Optionally, re-render specific view components if they aren't handled by snapshot listeners
         // e.g., if a view has complex interactions not suited for simple HTML rendering from snapshots
         // loadViewSpecificData(view); // Need to implement this if necessary
    } else {
        console.warn(`Professional view element not found for: ${view}`);
         // Default to dashboard if view not found
         const dashboardView = document.getElementById('professional-dashboard');
         if (dashboardView) {
              dashboardView.classList.add('active');
              history.replaceState(null, '', '#dashboard');
              console.log("Defaulted to dashboard view.");
         }
    }
}

// --- Professional Modal Handling ---
/**
 * Opens a professional module modal based on type.
 * @param {'goal' | 'skill' | 'learning' | 'application' | 'contact' | 'achievement' | 'review'} type - The type of item.
 * @param {object} [data=null] - Optional data object for editing.
 */
function openProfessionalModal(type, data = null) {
    closeProfessionalModal(); // Close any open modals first

    const modalId = `professional-${type}-modal`; // Assuming IDs like professional-goal-modal
    const modal = document.getElementById(modalId);
    const form = document.getElementById(`professional-${type}-form`); // Assuming form IDs like professional-goal-form
     const titleElement = document.getElementById(`professional-${type}-modal-title`); // Assuming title elements

    if (!modal || !form) {
        console.error(`Professional Modal or form not found for type: ${type}`);
        return;
    }

    // Reset form and set mode
    form.reset();
    form.dataset.mode = data ? 'edit' : 'add';
    form.dataset.itemId = data ? data.id || (data.name || data.title || data.date || '').replace(/\s+/g, '_') : ''; // Use ID if available, otherwise a unique property


    // Set modal title
    if (titleElement) {
        titleElement.textContent = data ? `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}` : `Add New ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    }

    // Populate fields if in edit mode
    if (data) {
        if (type === 'goal') {
             document.getElementById('professional-goal-title').value = data.title || '';
             document.getElementById('professional-goal-category').value = data.category || '';
             document.getElementById('professional-goal-deadline').value = data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : '';
             document.getElementById('professional-goal-notes').value = data.notes || '';
             // Add status field if editing
             const statusField = document.getElementById('professional-goal-status');
             if(statusField) statusField.value = data.status || 'active';

        } else if (type === 'skill') {
             document.getElementById('professional-skill-name').value = data.name || '';
             document.getElementById('professional-skill-category').value = data.category || '';
             document.getElementById('professional-skill-level').value = data.level || 'beginner';
             document.getElementById('professional-skill-goal-level').value = data.target || 'expert'; // Target level
             document.getElementById('professional-skill-description').value = data.description || '';

        } else if (type === 'learning') {
            document.getElementById('professional-resource-title').value = data.title || '';
            document.getElementById('professional-resource-type').value = data.type || '';
            document.getElementById('professional-resource-status').value = data.status || 'not-started';
            document.getElementById('professional-resource-author').value = data.author || '';
            document.getElementById('professional-resource-url').value = data.url || '';
            document.getElementById('professional-resource-length').value = data.duration || ''; // Use duration? Or length?
            document.getElementById('professional-resource-progress').value = data.progress || 0;
            document.getElementById('professional-resource-description').value = data.description || '';
            document.getElementById('professional-resource-skills').value = Array.isArray(data.skills) ? data.skills.join(', ') : '';
             document.getElementById('professional-resource-source').value = data.source || ''; // Add source field?
             document.getElementById('professional-resource-start-date').value = data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '';
             document.getElementById('professional-resource-target-date').value = data.targetDate ? new Date(data.targetDate).toISOString().split('T')[0] : '';


        } else if (type === 'application') {
            document.getElementById('professional-application-position').value = data.position || '';
            document.getElementById('professional-application-company').value = data.company || '';
            document.getElementById('professional-application-date').value = data.date || '';
            document.getElementById('professional-application-status').value = data.status || 'applied';
            document.getElementById('professional-application-notes').value = data.notes || '';
             document.getElementById('professional-application-source').value = data.source || '';

        } else if (type === 'contact') {
            document.getElementById('professional-contact-name').value = data.name || '';
            document.getElementById('professional-contact-title').value = data.title || '';
            document.getElementById('professional-contact-company').value = data.company || '';
            document.getElementById('professional-contact-email').value = data.email || '';
            document.getElementById('professional-contact-phone').value = data.phone || '';
            document.getElementById('professional-contact-linkedin').value = data.linkedin || '';
            document.getElementById('professional-contact-notes').value = data.notes || '';
             // No lastInteractionDate field typically in the form

        } else if (type === 'achievement') {
            document.getElementById('professional-achievement-date').value = data.date || '';
            document.getElementById('professional-achievement-description').value = data.description || '';
            document.getElementById('professional-achievement-impact').value = data.impact || 3;

        } else if (type === 'review') {
            document.getElementById('professional-review-date').value = data.date || '';
            document.getElementById('professional-review-rating').value = data.rating || 3;
            document.getElementById('professional-review-notes').value = data.notes || '';
        }
    }

    modal.classList.add('active');
}

// Close modal
function closeProfessionalModal() {
    document.querySelectorAll('#professional .modal').forEach(modal => {
        modal.classList.remove('active');
         const form = modal.querySelector('form');
          if (form) form.reset(); // Reset form on close
    });
}

// --- Save Functions (Professional Module) ---

// Save professional goal (goals are stored in an array in the 'data' document)
async function saveProfessionalGoal(e) {
    e.preventDefault();

    const form = e.target;
    const userId = auth.currentUser?.uid;
    if (!userId) {
        showToast('User not authenticated', 'error');
        return;
    }

    const goalData = {
        title: document.getElementById('professional-goal-title').value.trim(),
        category: document.getElementById('professional-goal-category').value,
        deadline: document.getElementById('professional-goal-deadline').value || null, // YYYY-MM-DD string
        notes: document.getElementById('professional-goal-notes').value.trim() || null,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
         // status will be added/updated separately
    };

    // Basic validation
    if (!goalData.title || !goalData.category) {
        showToast('Goal title and category are required', 'error');
        return;
    }

    // Get current data to modify the array
    try {
        const docRef = db.collection('users').doc(userId).collection('professional').doc('data');
        const doc = await docRef.get();
        const currentData = doc.exists ? doc.data() : {};
        const currentGoals = Array.isArray(currentData.goals) ? currentData.goals : [];

        if (form.dataset.mode === 'edit' && form.dataset.itemId) {
            const itemId = form.dataset.itemId; // This was likely the original title or a generated ID

            // Find the goal by its original identifier and update it
            const updatedGoals = currentGoals.map(goal => {
                // Need a robust way to identify the item being edited
                // If you added a unique 'id' field when creating, use that.
                // Otherwise, rely on unique properties like 'title' + 'createdAt' or add an ID on creation.
                 // Assuming 'title' + 'createdAt' is unique enough for this example
                 const originalItemIdentifier = form.dataset.originalIdentifier; // You would set this when opening the modal for edit
                 if (goal.title === itemId /* && match other properties */) { // Simple check, needs refinement
                      // Include status field from the form if editing
                      goalData.status = document.getElementById('professional-goal-status').value || 'active';
                     return { ...goal, ...goalData }; // Merge updated data
                 }
                 return goal;
            });
             // Note: Modifying arrays directly like this in Firestore is safe with .update if the array is small.
            await docRef.update({ goals: updatedGoals });
            showToast('Goal updated successfully');

        } else { // Add mode
            goalData.status = 'active'; // New goals are active
            goalData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            // Add a unique client-side ID if you didn't add one in the initial setup
             // goalData.id = 'goal_' + Date.now() + Math.random().toString(16).slice(2); // Simple unique ID

            const newGoals = [...currentGoals, goalData];
            await docRef.update({ goals: newGoals }); // Add new goal to the array
            showToast('Goal added successfully');
        }

        closeProfessionalModal();
         // Snapshot listener will re-render the list
        // updateProfessionalDashboard(); // Update dashboard summary
    } catch (error) {
        console.error("Error saving professional goal:", error);
        showToast('Failed to save professional goal', 'error');
    }
}

// Save skill (skills are stored in nested objects in the 'data' document)
async function saveProfessionalSkill(e) {
    e.preventDefault();

    const form = e.target;
    const userId = auth.currentUser?.uid;
    if (!userId) {
        showToast('User not authenticated', 'error');
        return;
    }

    const skillName = document.getElementById('professional-skill-name').value.trim();
    const category = document.getElementById('professional-skill-category').value;

    const skillData = {
        level: parseInt(document.getElementById('professional-skill-level').value) || 1,
        target: parseInt(document.getElementById('professional-skill-goal-level').value) || 5,
        description: document.getElementById('professional-skill-description').value.trim() || null,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
         // resources array might be managed separately
    };

     // Basic validation
     if (!skillName || !category) {
         showToast('Skill name and category are required', 'error');
         return;
     }

    // Use dot notation path for updating nested object
    const skillPath = `skills.${category}.${skillName.replace(/[.#$/\[\]]/g, '_')}`; // Sanitize skill name for Firestore field key

    try {
      if (form.dataset.mode === 'edit' && form.dataset.itemId) {
        // Editing existing skill - Update specific fields
        // The item ID might help find the original skill if name/category changed
         // Assuming the form dataset has the original category and name
         const originalCategory = form.dataset.originalCategory || category;
         const originalName = form.dataset.originalName || skillName;
          const originalSkillPath = `skills.${originalCategory}.${originalName.replace(/[.#$/\[\]]/g, '_')}`;

          // If category or name changed, you might need to delete the old field and set the new one
          if (originalCategory !== category || originalName !== skillName) {
              if (confirm(`Skill name or category changed. This will create a new skill and remove the old one "${originalName}" from "${originalCategory}". Continue?`)) {
                  // Fetch current resources for the old skill before deleting
                   const docRef = db.collection('users').doc(userId).collection('professional').doc('data');
                   const doc = await docRef.get();
                   const currentSkills = doc.exists ? doc.data().skills || {} : {};
                   const oldSkillDetails = currentSkills[originalCategory]?.[originalName.replace(/[.#$/\[\]]/g, '_')] || {};
                   skillData.resources = oldSkillDetails.resources || []; // Preserve resources if any

                  // Delete old field
                  await docRef.update({
                       [originalSkillPath]: firebase.firestore.FieldValue.delete()
                   });
                   // Set new field
                  skillData.createdAt = oldSkillDetails.createdAt || firebase.firestore.FieldValue.serverTimestamp(); // Keep creation timestamp if possible
                   skillData.timeInvested = oldSkillDetails.timeInvested || 0; // Keep time invested if possible
                   await docRef.update({
                       [skillPath]: skillData
                   });
                  showToast(`Skill "${originalName}" moved/renamed to "${skillName}" in "${category}"`);

              } else {
                  // User cancelled the change
                  closeProfessionalModal();
                  return;
              }
          } else {
              // Simple update of an existing skill's details
              await db.collection('users').doc(userId).collection('professional').doc('data').update({
                  [skillPath]: skillData // This will merge with existing fields (like createdAt, timeInvested, resources)
              });
               showToast('Skill updated successfully');
          }

      } else { // Add mode
         // Initialize fields for a new skill
        skillData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        skillData.timeInvested = 0;
        skillData.resources = []; // Initialize resources array

         // Set the new skill using the calculated path
        await db.collection('users').doc(userId).collection('professional').doc('data').update({
            [skillPath]: skillData // Firestore automatically creates nested objects if they don't exist
        });
         showToast('Skill added successfully');
      }

      closeProfessionalModal();
       // Snapshot listener will re-render the list
      // updateSkillsTracking(fetchedData); // Or manually update UI if not using listener for this view
    } catch (error) {
        console.error("Error saving professional skill:", error);
        showToast('Failed to save professional skill', 'error');
    }
}

// Save learning resource (professional context) - (resources stored in arrays)
async function saveProfessionalLearningResource(e) {
    e.preventDefault();

    const form = e.target;
    const userId = auth.currentUser?.uid;
    if (!userId) {
        showToast('User not authenticated', 'error');
        return;
    }

    const resourceData = {
        title: document.getElementById('professional-resource-title').value.trim(),
        type: document.getElementById('professional-resource-type').value,
        status: document.getElementById('professional-resource-status').value,
        author: document.getElementById('professional-resource-author').value.trim() || null,
        url: document.getElementById('professional-resource-url').value.trim() || null,
        duration: document.getElementById('professional-resource-length').value || null, // Use duration field
        progress: parseInt(document.getElementById('professional-resource-progress').value) || 0,
        description: document.getElementById('professional-resource-description').value.trim() || null,
        skills: document.getElementById('professional-resource-skills').value.split(',').map(s => s.trim()).filter(s => s),
        source: document.getElementById('professional-resource-source').value.trim() || null, // Assuming source field
        startDate: document.getElementById('professional-resource-start-date').value || null, // YYYY-MM-DD string
        targetDate: document.getElementById('professional-resource-target-date').value || null, // YYYY-MM-DD string
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

     // Basic validation
    if (!resourceData.title || !resourceData.type || !resourceData.status) {
         showToast('Resource title, type, and status are required', 'error');
         return;
     }


    // Determine the target array based on status
    let targetArrayName;
    switch (resourceData.status) {
        case 'completed': targetArrayName = 'completedCourses'; break;
        case 'in-progress': targetArrayName = 'currentCourses'; break;
        case 'planned': targetArrayName = 'plannedCourses'; break;
        default:
            showToast('Invalid resource status selected', 'error');
            return;
    }

    // Get current data to modify the array
    try {
        const docRef = db.collection('users').doc(userId).collection('professional').doc('data');
        const doc = await docRef.get();
        const currentData = doc.exists ? doc.data() : {};
        const currentLearningPlan = currentData.learningPlan || {};

        if (form.dataset.mode === 'edit' && form.dataset.itemId) {
            const itemId = form.dataset.itemId; // This is a unique identifier (e.g., generated ID or combination of properties)

            // Need to find the item across *all* learning plan arrays and update it
             // This is complex. A better approach is often to store these in a subcollection.
             // If keeping arrays, you'd iterate through currentCourses, plannedCourses, completedCourses, readingList
             // find the one matching itemId, update it in its array, and remove it from any other array it might have been in if status changed.

             // For simplicity, this example assumes you're only editing within its current array,
             // and changing status means deleting from old array and adding to new.

             // Let's simulate deleting from old array and adding to new if status changed
             const originalStatus = form.dataset.originalStatus || 'planned'; // You'd set this when opening modal
             const originalArrayName = originalStatus === 'completed' ? 'completedCourses' :
                                       originalStatus === 'in-progress' ? 'currentCourses' : 'plannedCourses';

             let itemsToKeep = [];
             let itemToUpdate = null;
             let found = false;

              // Find the item in its original array
             if (currentLearningPlan[originalArrayName]) {
                 itemsToKeep = currentLearningPlan[originalArrayName].filter(item => {
                     // Need a robust comparison, assuming title + source + type is unique enough for demo
                     if (item.title === itemId /* && item.source === itemSource && item.type === itemType */) {
                         itemToUpdate = item;
                         found = true;
                         return false; // Remove the original item
                     }
                     return true; // Keep other items
                 });
             }


             if (!found) {
                 showToast('Resource not found in learning plan', 'error');
                 return;
             }

             // Add creation timestamp if preserving data across status changes
             resourceData.createdAt = itemToUpdate.createdAt || firebase.firestore.FieldValue.serverTimestamp();


             // Update the original array (if status didn't change) or the new array (if status changed)
             const updates = {};
             if (originalArrayName === targetArrayName) {
                 // Status didn't change, just update the item within the same array
                  const updatedItems = itemsToKeep.map(item => {
                       // Find the item again - this logic is flawed if title isn't the unique ID
                       // A unique 'id' field on each item is strongly recommended
                       if (item.title === itemId) { return { ...item, ...resourceData }; }
                       return item;
                  });
                 updates[`learningPlan.${targetArrayName}`] = updatedItems;
             } else {
                 // Status changed, remove from old array and add to new
                 updates[`learningPlan.${originalArrayName}`] = itemsToKeep; // Array with original item removed
                 updates[`learningPlan.${targetArrayName}`] = firebase.firestore.FieldValue.arrayUnion({
                      // Add updated data to the new array
                     ...resourceData,
                     // Include original unique identifier properties if needed
                     // id: originalItemId, // if you used IDs
                     // createdAt: resourceData.createdAt, // use the preserved creation date
                 });
             }

            await docRef.update(updates);
            showToast('Learning resource updated successfully');

        } else { // Add mode
            resourceData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
             // Add a unique client-side ID
             resourceData.id = 'lr_' + Date.now() + Math.random().toString(16).slice(2);

            // Add to the target array using arrayUnion
            const updates = {};
            updates[`learningPlan.${targetArrayName}`] = firebase.firestore.FieldValue.arrayUnion(resourceData);

            await docRef.update(updates);
            showToast('Learning resource added successfully');
        }

        closeProfessionalModal();
        // Snapshot listener will re-render the list
        // updateLearningPlan(fetchedData); // Or manually update UI if not using listener
    } catch (error) {
        console.error("Error saving professional learning resource:", error);
        showToast('Failed to save learning resource', 'error');
    }
}

// Save job application (applications stored in an array)
async function saveJobApplication(e) {
    e.preventDefault();

    const form = e.target;
    const userId = auth.currentUser?.uid;
    if (!userId) {
        showToast('User not authenticated', 'error');
        return;
    }

    const applicationData = {
        position: document.getElementById('professional-application-position').value.trim(),
        company: document.getElementById('professional-application-company').value.trim(),
        date: document.getElementById('professional-application-date').value || null, // YYYY-MM-DD
        status: document.getElementById('professional-application-status').value || 'applied',
        notes: document.getElementById('professional-application-notes').value.trim() || null,
        source: document.getElementById('professional-application-source').value.trim() || null,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

     // Basic validation
    if (!applicationData.position || !applicationData.company || !applicationData.date) {
        showToast('Position, company, and date applied are required', 'error');
        return;
    }

    // Get current data to modify the array
    try {
        const docRef = db.collection('users').doc(userId).collection('professional').doc('data');
        const doc = await docRef.get();
        const currentData = doc.exists ? doc.data() : {};
        const currentApplications = Array.isArray(currentData.jobSearch?.applications) ? currentData.jobSearch.applications : [];

        if (form.dataset.mode === 'edit' && form.dataset.itemId) {
            const itemId = form.dataset.itemId; // Unique identifier (e.g., generated ID)

             // Find the application by its unique ID and update it
             const updatedApplications = currentApplications.map(app => {
                 if (app.id === itemId) { // Assuming you added an 'id' field on creation
                     return { ...app, ...applicationData }; // Merge updated data
                 }
                 return app;
             });

             await docRef.update({ 'jobSearch.applications': updatedApplications });
             showToast('Application updated successfully');

        } else { // Add mode
            applicationData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
             // Add a unique client-side ID
             applicationData.id = 'app_' + Date.now() + Math.random().toString(16).slice(2);

            const newApplications = [...currentApplications, applicationData];
            await docRef.update({ 'jobSearch.applications': newApplications }); // Add new application
            showToast('Application added successfully');
        }

        closeProfessionalModal();
         // Snapshot listener will re-render the list
        // updateJobSearchTracker(fetchedData); // Or manually update UI
    } catch (error) {
        console.error("Error saving job application:", error);
        showToast('Failed to save application', 'error');
    }
}

// Save professional contact (contacts stored in an array)
async function saveProfessionalContact(e) {
    e.preventDefault();

    const form = e.target;
    const userId = auth.currentUser?.uid;
    if (!userId) {
        showToast('User not authenticated', 'error');
        return;
    }

    const contactData = {
        name: document.getElementById('professional-contact-name').value.trim(),
        title: document.getElementById('professional-contact-title').value.trim() || null,
        company: document.getElementById('professional-contact-company').value.trim() || null,
        email: document.getElementById('professional-contact-email').value.trim() || null,
        phone: document.getElementById('professional-contact-phone').value.trim() || null,
        linkedin: document.getElementById('professional-contact-linkedin').value.trim() || null,
        notes: document.getElementById('professional-contact-notes').value.trim() || null,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
         // lastInteractionDate field will be updated when logging interactions
    };

     // Basic validation
    if (!contactData.name || (!contactData.email && !contactData.phone && !contactData.linkedin)) {
        showToast('Contact name and at least one contact method (email, phone, or LinkedIn) are required', 'error');
        return;
    }

    // Get current data to modify the array
    try {
        const docRef = db.collection('users').doc(userId).collection('professional').doc('data');
        const doc = await docRef.get();
        const currentData = doc.exists ? doc.data() : {};
        const currentContacts = Array.isArray(currentData.jobSearch?.networkingContacts) ? currentData.jobSearch.networkingContacts : [];

        if (form.dataset.mode === 'edit' && form.dataset.itemId) {
             const itemId = form.dataset.itemId; // Unique identifier (e.g., generated ID)

              // Find the contact by its unique ID and update it
             const updatedContacts = currentContacts.map(contact => {
                 if (contact.id === itemId) { // Assuming you added an 'id' field on creation
                     return { ...contact, ...contactData }; // Merge updated data
                 }
                 return contact;
             });

             await docRef.update({ 'jobSearch.networkingContacts': updatedContacts });
             showToast('Contact updated successfully');

        } else { // Add mode
            contactData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
             // Add a unique client-side ID
             contactData.id = 'contact_' + Date.now() + Math.random().toString(16).slice(2);

            const newContacts = [...currentContacts, contactData];
            await docRef.update({ 'jobSearch.networkingContacts': newContacts }); // Add new contact
            showToast('Contact added successfully');
        }

        closeProfessionalModal();
         // Snapshot listener will re-render the list
        // updateJobSearchTracker(fetchedData); // Or manually update UI
    } catch (error) {
        console.error("Error saving professional contact:", error);
        showToast('Failed to save contact', 'error');
    }
}

// Save professional achievement (achievements stored in an array)
async function saveProfessionalAchievement(e) {
    e.preventDefault();

    const form = e.target;
    const userId = auth.currentUser?.uid;
    if (!userId) {
        showToast('User not authenticated', 'error');
        return;
    }

    const achievementData = {
        date: document.getElementById('professional-achievement-date').value || null, // YYYY-MM-DD
        description: document.getElementById('professional-achievement-description').value.trim(),
        impact: parseInt(document.getElementById('professional-achievement-impact').value) || 3, // 1-5 scale
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Basic validation
    if (!achievementData.date || !achievementData.description) {
        showToast('Achievement date and description are required', 'error');
        return;
    }
     if (achievementData.impact < 1 || achievementData.impact > 5) {
         showToast('Impact rating must be between 1 and 5', 'error');
         return;
     }


    // Get current data to modify the array
    try {
        const docRef = db.collection('users').doc(userId).collection('professional').doc('data');
        const doc = await docRef.get();
        const currentData = doc.exists ? doc.data() : {};
        const currentAchievements = Array.isArray(currentData.metrics?.achievements) ? currentData.metrics.achievements : [];

        if (form.dataset.mode === 'edit' && form.dataset.itemId) {
             const itemId = form.dataset.itemId; // Unique identifier (e.g., generated ID)

              // Find the achievement by its unique ID and update it
             const updatedAchievements = currentAchievements.map(achievement => {
                 if (achievement.id === itemId) { // Assuming you added an 'id' field on creation
                     return { ...achievement, ...achievementData }; // Merge updated data
                 }
                 return achievement;
             });

             await docRef.update({ 'metrics.achievements': updatedAchievements });
             showToast('Achievement updated successfully');

        } else { // Add mode
            achievementData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
             // Add a unique client-side ID
             achievementData.id = 'ach_' + Date.now() + Math.random().toString(16).slice(2);

            const newAchievements = [...currentAchievements, achievementData];
            await docRef.update({ 'metrics.achievements': newAchievements }); // Add new achievement
            showToast('Achievement added successfully');
        }

        closeProfessionalModal();
         // Snapshot listener will re-render the list
        // updatePerformanceMetrics(fetchedData); // Or manually update UI
    } catch (error) {
        console.error("Error saving professional achievement:", error);
        showToast('Failed to save achievement', 'error');
    }
}

// Save performance review (reviews stored in an array)
async function savePerformanceReview(e) {
    e.preventDefault();

    const form = e.target;
    const userId = auth.currentUser?.uid;
    if (!userId) {
        showToast('User not authenticated', 'error');
        return;
    }

    const reviewData = {
        date: document.getElementById('professional-review-date').value || null, // YYYY-MM-DD
        rating: parseInt(document.getElementById('professional-review-rating').value) || 3, // 1-5 scale
        notes: document.getElementById('professional-review-notes').value.trim() || null,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

     // Basic validation
    if (!reviewData.date || reviewData.rating < 1 || reviewData.rating > 5) {
        showToast('Review date and valid rating (1-5) are required', 'error');
        return;
    }

    // Get current data to modify the array
    try {
        const docRef = db.collection('users').doc(userId).collection('professional').doc('data');
        const doc = await docRef.get();
        const currentData = doc.exists ? doc.data() : {};
        const currentReviews = Array.isArray(currentData.metrics?.performanceReviews) ? currentData.metrics.performanceReviews : [];

        if (form.dataset.mode === 'edit' && form.dataset.itemId) {
             const itemId = form.dataset.itemId; // Unique identifier (e.g., generated ID)

              // Find the review by its unique ID and update it
             const updatedReviews = currentReviews.map(review => {
                 if (review.id === itemId) { // Assuming you added an 'id' field on creation
                     return { ...review, ...reviewData }; // Merge updated data
                 }
                 return review;
             });

             await docRef.update({ 'metrics.performanceReviews': updatedReviews });
             showToast('Review updated successfully');

        } else { // Add mode
            reviewData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
             // Add a unique client-side ID
             reviewData.id = 'rev_' + Date.now() + Math.random().toString(16).slice(2);

            const newReviews = [...currentReviews, reviewData];
            await docRef.update({ 'metrics.performanceReviews': newReviews }); // Add new review
            showToast('Review added successfully');
        }

        closeProfessionalModal();
         // Snapshot listener will re-render the list
        // updatePerformanceMetrics(fetchedData); // Or manually update UI
    } catch (error) {
        console.error("Error saving performance review:", error);
        showToast('Failed to save performance review', 'error');
    }
}


// --- Delete Functions (Professional Module - Array items) ---

async function handleDeleteProfessionalGoal(goalToDelete) {
     const userId = auth.currentUser?.uid;
     if (!userId) return;

     try {
         const docRef = db.collection('users').doc(userId).collection('professional').doc('data');
         const doc = await docRef.get();
         const currentData = doc.exists ? doc.data() : {};
         const currentGoals = Array.isArray(currentData.goals) ? currentData.goals : [];

         // Filter out the goal to delete (assuming goalToDelete has a unique 'id' or can be matched by properties)
         const updatedGoals = currentGoals.filter(goal => goal.id !== goalToDelete.id /* Add more robust check if needed */);

         await docRef.update({ 'goals': updatedGoals });
         showToast('Goal deleted successfully');
     } catch (error) {
         console.error('Error deleting professional goal:', error);
         showToast('Failed to delete goal', 'error');
     }
}

async function handleDeleteProfessionalSkill(category, skillName) {
     const userId = auth.currentUser?.uid;
     if (!userId) return;
     const skillPath = `skills.${category}.${skillName.replace(/[.#$/\[\]]/g, '_')}`;

     try {
         const docRef = db.collection('users').doc(userId).collection('professional').doc('data');
         // Use FieldValue.delete() to remove the nested field
         await docRef.update({
             [skillPath]: firebase.firestore.FieldValue.delete()
         });
         showToast('Skill deleted successfully');
     } catch (error) {
         console.error('Error deleting professional skill:', error);
         showToast('Failed to delete skill', 'error');
     }
}

async function handleDeleteProfessionalResource(resourceToDelete, status) {
     const userId = auth.currentUser?.uid;
     if (!userId) return;

     let targetArrayName;
     switch (status) {
         case 'completed': targetArrayName = 'completedCourses'; break;
         case 'in-progress': targetArrayName = 'currentCourses'; break;
         case 'planned': targetArrayName = 'plannedCourses'; break;
         case 'readingList': targetArrayName = 'readingList'; break; // Handle reading list separately? Or use resource type?
         default:
             showToast('Invalid resource status for deletion', 'error');
             return;
     }
     const arrayPath = `learningPlan.${targetArrayName}`;

     try {
         const docRef = db.collection('users').doc(userId).collection('professional').doc('data');
         // Use arrayRemove to remove the specific item from the array
         // This requires the item to exactly match the data stored, including server timestamps.
         // It's generally safer to fetch, filter, and update the whole array for complex objects.
         // Or, add a unique 'id' field to each array item on creation and filter by ID.

          // Fetch, filter, update approach:
          const doc = await docRef.get();
          const currentData = doc.exists ? doc.data() : {};
          const currentArray = Array.isArray(currentData.learningPlan?.[targetArrayName]) ? currentData.learningPlan[targetArrayName] : [];

          // Filter out the resource to delete (assuming resourceToDelete has a unique 'id')
          const updatedArray = currentArray.filter(item => item.id !== resourceToDelete.id /* Add more robust check if needed */);

          await docRef.update({ [arrayPath]: updatedArray });

         showToast('Learning resource deleted');
     } catch (error) {
         console.error('Error deleting professional learning resource:', error);
         showToast('Failed to delete resource', 'error');
     }
}

async function handleDeleteReadingItem(bookToDelete) {
    // Similar logic to handleDeleteProfessionalResource but targeting 'readingList'
     const userId = auth.currentUser?.uid;
      if (!userId) return;
     const arrayPath = `learningPlan.readingList`;

      try {
          const docRef = db.collection('users').doc(userId).collection('professional').doc('data');
          const doc = await docRef.get();
          const currentData = doc.exists ? doc.data() : {};
          const currentArray = Array.isArray(currentData.learningPlan?.readingList) ? currentData.learningPlan.readingList : [];

          // Filter out the book to delete (assuming bookToDelete has a unique 'id' or can be matched by properties)
          const updatedArray = currentArray.filter(item => item.id !== bookToDelete.id /* Add more robust check if needed */);

          await docRef.update({ [arrayPath]: updatedArray });
          showToast('Reading list item removed');
      } catch (error) {
          console.error('Error deleting reading list item:', error);
          showToast('Failed to remove item', 'error');
      }
}

async function handleDeleteApplication(applicationToDelete) {
     const userId = auth.currentUser?.uid;
     if (!userId) return;

     try {
         const docRef = db.collection('users').doc(userId).collection('professional').doc('data');
         const doc = await docRef.get();
         const currentData = doc.exists ? doc.data() : {};
         const currentApplications = Array.isArray(currentData.jobSearch?.applications) ? currentData.jobSearch.applications : [];

         // Filter out the application to delete (assuming applicationToDelete has a unique 'id')
         const updatedApplications = currentApplications.filter(app => app.id !== applicationToDelete.id /* Add more robust check if needed */);

         await docRef.update({ 'jobSearch.applications': updatedApplications });
         showToast('Application deleted successfully');
     } catch (error) {
         console.error('Error deleting job application:', error);
         showToast('Failed to delete application', 'error');
     }
}

async function handleDeleteContact(contactToDelete) {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

     try {
         const docRef = db.collection('users').doc(userId).collection('professional').doc('data');
         const doc = await docRef.get();
         const currentData = doc.exists ? doc.data() : {};
         const currentContacts = Array.isArray(currentData.jobSearch?.networkingContacts) ? currentData.jobSearch.networkingContacts : [];

         // Filter out the contact to delete (assuming contactToDelete has a unique 'id')
         const updatedContacts = currentContacts.filter(contact => contact.id !== contactToDelete.id /* Add more robust check if needed */);

         await docRef.update({ 'jobSearch.networkingContacts': updatedContacts });
         showToast('Contact deleted successfully');
     } catch (error) {
         console.error('Error deleting professional contact:', error);
         showToast('Failed to delete contact', 'error');
     }
}

async function handleDeleteAchievement(achievementToDelete) {
     const userId = auth.currentUser?.uid;
     if (!userId) return;

     try {
         const docRef = db.collection('users').doc(userId).collection('professional').doc('data');
         const doc = await docRef.get();
         const currentData = doc.exists ? doc.data() : {};
         const currentAchievements = Array.isArray(currentData.metrics?.achievements) ? currentData.metrics.achievements : [];

         // Filter out the achievement to delete (assuming achievementToDelete has a unique 'id')
         const updatedAchievements = currentAchievements.filter(ach => ach.id !== achievementToDelete.id /* Add more robust check if needed */);

         await docRef.update({ 'metrics.achievements': updatedAchievements });
         showToast('Achievement deleted successfully');
     } catch (error) {
         console.error('Error deleting professional achievement:', error);
         showToast('Failed to delete achievement', 'error');
     }
}

async function handleDeleteReview(reviewToDelete) {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      try {
          const docRef = db.collection('users').doc(userId).collection('professional').doc('data');
          const doc = await docRef.get();
          const currentData = doc.exists ? doc.data() : {};
          const currentReviews = Array.isArray(currentData.metrics?.performanceReviews) ? currentData.metrics.performanceReviews : [];

          // Filter out the review to delete (assuming reviewToDelete has a unique 'id')
          const updatedReviews = currentReviews.filter(rev => rev.id !== reviewToDelete.id /* Add more robust check if needed */);

          await docRef.update({ 'metrics.performanceReviews': updatedReviews });
          showToast('Performance review deleted successfully');
      } catch (error) {
          console.error('Error deleting performance review:', error);
          showToast('Failed to delete review', 'error');
      }
}

// --- Update Handlers (Professional Module - Array items) ---
// Implement handlers for updating status/progress/notes for items in arrays
function handleUpdateApplicationStatus(application) {
    showToast(`Feature: Update status for application: ${application.position} at ${application.company}`);
    // Open a modal or prompt to change status (Applied, Interview, Offer, Rejected)
}

function handleViewApplicationNotes(application) {
     showToast(`Notes for application: ${application.position} at ${application.company}\n\n${application.notes || 'No notes.'}`);
     // Could open a modal to view/edit notes
}

function handleLogContactInteraction(contact) {
    showToast(`Feature: Log interaction with ${contact.name}`);
    // Open a modal to log interaction details and update lastInteractionDate
}

function handleUpdateProfessionalResource(resource, status) {
    showToast(`Feature: Update progress for resource: ${resource.title} (${status})`);
    // Open a modal/prompt to update progress, dates, etc.
    // Then save using saveProfessionalLearningResource in edit mode
}

async function handleCompleteProfessionalResource(resource, status) {
     const userId = auth.currentUser?.uid;
      if (!userId) return;

      if (status === 'completed') return; // Already complete

     try {
         const docRef = db.collection('users').doc(userId).collection('professional').doc('data');
         const doc = await docRef.get();
         const currentData = doc.exists ? doc.data() : {};
         const currentArrayName = status === 'in-progress' ? 'currentCourses' : 'plannedCourses';
         const currentArray = Array.isArray(currentData.learningPlan?.[currentArrayName]) ? currentData.learningPlan[currentArrayName] : [];
         const completedArray = Array.isArray(currentData.learningPlan?.completedCourses) ? currentData.learningPlan.completedCourses : [];

         // Find and remove from the current array
         const updatedCurrentArray = currentArray.filter(item => item.id !== resource.id); // Assuming 'id' exists

         // Add to the completed array (update status and add completion date)
         const completedResource = {
             ...resource,
             status: 'completed',
             progress: 100, // Mark as 100% complete
             completionDate: firebase.firestore.FieldValue.serverTimestamp(),
             updatedAt: firebase.firestore.FieldValue.serverTimestamp()
         };
         const updatedCompletedArray = [...completedArray, completedResource];

         const updates = {};
         updates[`learningPlan.${currentArrayName}`] = updatedCurrentArray;
         updates['learningPlan.completedCourses'] = updatedCompletedArray;

         await docRef.update(updates);
         showToast(`Resource "${resource.title}" marked as completed!`);

     } catch (error) {
         console.error('Error marking resource complete:', error);
         showToast('Failed to mark resource complete', 'error');
     }
}

async function handleCompleteReadingItem(book) {
     const userId = auth.currentUser?.uid;
      if (!userId) return;

     try {
         const docRef = db.collection('users').doc(userId).collection('professional').doc('data');
         const doc = await docRef.get();
         const currentData = doc.exists ? doc.data() : {};
         const readingList = Array.isArray(currentData.learningPlan?.readingList) ? currentData.learningPlan.readingList : [];
         const completedArray = Array.isArray(currentData.learningPlan?.completedCourses) ? currentData.learningPlan.completedCourses : []; // Add to completed courses? Or a separate list?

         // Find and remove from reading list
         const updatedReadingList = readingList.filter(item => item.id !== book.id); // Assuming 'id' exists

         // Option 1: Just remove from list (simpler)
         // Option 2: Add to a "completed books" or "completed learning resources" list
         // Let's use Option 2, add to completedCourses assuming structure compatibility
         const completedBook = {
             ...book,
             type: 'book', // Ensure type is set
             status: 'completed',
             progress: 100,
             completionDate: firebase.firestore.FieldValue.serverTimestamp(),
             updatedAt: firebase.firestore.FieldValue.serverTimestamp()
         };
          const updatedCompletedArray = [...completedArray, completedBook];

         const updates = {};
         updates['learningPlan.readingList'] = updatedReadingList;
         updates['learningPlan.completedCourses'] = updatedCompletedArray;


         await docRef.update(updates);
         showToast(`Book "${book.title}" marked as read!`);

     } catch (error) {
         console.error('Error marking book as read:', error);
         showToast('Failed to mark book as read', 'error');
     }
}

function handleEditAchievement(achievement) {
    showToast(`Feature: Edit Achievement: ${achievement.description}`);
    // Open modal pre-filled with achievement data
    // openProfessionalModal('achievement', achievement); // Requires achievement to have an ID
}

function handleViewReview(review) {
     showToast(`Review Details (${formatDate(new Date(review.date))}):\n\nRating: ${review.rating}/5\nNotes: ${review.notes || 'No notes.'}`);
    // Could open a modal to view the full review details
}


// Update professional dashboard with summary data
// This is now called by renderProfessionalData whenever the data updates
function updateProfessionalDashboard(data) {
     // Check if we are on the dashboard view
    if (document.getElementById('professional-dashboard') && document.getElementById('professional-dashboard').classList.contains('active')) {
        console.log("Updating Professional Dashboard UI...");

        // Ensure data exists and has nested properties
        const profileData = data?.profile || {};
        const skillsData = data?.skills || {};
        const learningPlanData = data?.learningPlan || {};
        const jobSearchData = data?.jobSearch || {};
        const metricsData = data?.metrics || {};

        // Update quick stats
        const totalRelationshipsEl = document.getElementById('professional-total-relationships'); // Use professional- prefix
        const recentInteractionsEl = document.getElementById('professional-recent-interactions');
        const importantRelationshipsEl = document.getElementById('professional-important-relationships');


        if (totalRelationshipsEl) totalRelationshipsEl.textContent = jobSearchData.networkingContacts?.length || 0;
        // Need to calculate recent interactions based on interaction data (not stored directly in the 'data' document currently)
        if (recentInteractionsEl) recentInteractionsEl.textContent = 'N/A'; // Requires querying interactions subcollection or storing summary
        if (importantRelationshipsEl) importantRelationshipsEl.textContent = 'N/A'; // Requires tracking importance in contacts


        // Update skill summary
        const technicalSkillsCountEl = document.getElementById('professional-technical-skills-count');
        const professionalSkillsCountEl = document.getElementById('professional-professional-skills-count');
        const domainSkillsCountEl = document.getElementById('professional-domain-skills-count');

        const technicalSkillsCount = Object.keys(skillsData.technical || {}).length;
        const professionalSkillsCount = Object.keys(skillsData.professional || {}).length;
        const domainSkillsCount = Object.keys(skillsData.domain || {}).length;

        if (technicalSkillsCountEl) technicalSkillsCountEl.textContent = technicalSkillsCount;
        if (professionalSkillsCountEl) professionalSkillsCountEl.textContent = professionalSkillsCount;
        if (domainSkillsCountEl) domainSkillsCountEl.textContent = domainSkillsCount;


        // Update learning progress
        const completedCoursesCountEl = document.getElementById('professional-completed-courses-count');
        const inProgressCoursesCountEl = document.getElementById('professional-in-progress-courses-count');

        const completedCoursesCount = learningPlanData.completedCourses?.length || 0;
        const inProgressCoursesCount = learningPlanData.currentCourses?.length || 0;

        if (completedCoursesCountEl) completedCoursesCountEl.textContent = completedCoursesCount;
        if (inProgressCoursesCountEl) inProgressCoursesCountEl.textContent = inProgressCoursesCount;


        // Update job search stats
        const applicationsCountEl = document.getElementById('professional-applications-count');
        const interviewsCountEl = document.getElementById('professional-interviews-count');

        const applicationsCount = jobSearchData.applications?.length || 0;
        const interviewsCount = jobSearchData.applications?.filter(app => app.status === 'Interview').length || 0;

        if (applicationsCountEl) applicationsCountEl.textContent = applicationsCount;
        if (interviewsCountEl) interviewsCountEl.textContent = interviewsCount;


        // Update achievement stats
         const achievementsCountEl = document.getElementById('professional-achievements-count');
         if (achievementsCountEl) achievementsCountEl.textContent = metricsData.achievements?.length || 0;

        // Render charts
        renderProfessionalCharts(data);

    } else {
        // console.log("Not on Professional Dashboard view. Skipping dashboard UI update.");
    }
}


// Render professional charts
function renderProfessionalCharts(data) {
    if (typeof Chart === 'undefined') {
        console.error("Chart.js is not loaded. Skipping professional chart initialization.");
        return;
    }

    const skillsData = data?.skills || {};
    const learningPlanData = data?.learningPlan || {};
    const jobSearchData = data?.jobSearch || {};


    // Skill distribution chart
    const skillCtx = document.getElementById('skill-distribution-chart')?.getContext('2d');
    if (skillCtx) {
        // Destroy existing chart instance
        if (skillCtx.chart) skillCtx.chart.destroy();

        skillCtx.chart = new Chart(skillCtx, {
            type: 'doughnut',
            data: {
                labels: ['Technical', 'Professional', 'Domain'],
                datasets: [{
                    data: [
                        Object.keys(skillsData.technical || {}).length,
                        Object.keys(skillsData.professional || {}).length,
                        Object.keys(skillsData.domain || {}).length
                    ],
                    backgroundColor: ['#6200ea', '#03dac6', '#ffab00'],
                     borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                     tooltip: { enabled: true }
                },
                 cutout: '70%' // Add a hole
            }
        });
    } else {
         console.warn("skill-distribution-chart canvas not found.");
    }


    // Learning progress chart
    const learningCtx = document.getElementById('learning-progress-chart')?.getContext('2d');
     if (learningCtx) {
         // Destroy existing chart instance
         if (learningCtx.chart) learningCtx.chart.destroy();

         learningCtx.chart = new Chart(learningCtx, {
             type: 'bar',
             data: {
                 labels: ['Planned', 'In Progress', 'Completed'],
                 datasets: [{
                     label: 'Courses/Resources',
                     data: [
                         learningPlanData.plannedCourses?.length || 0,
                         learningPlanData.currentCourses?.length || 0,
                         learningPlanData.completedCourses?.length || 0
                     ],
                     backgroundColor: ['#ffab00', '#6200ea', '#4caf50']
                 }]
             },
             options: {
                 responsive: true,
                 maintainAspectRatio: false,
                 scales: {
                     y: {
                         beginAtZero: true,
                          ticks: {
                             stepSize: 1,
                             callback: (value) => Number.isInteger(value) ? value : '' // Show whole numbers
                         }
                     },
                      x: {
                         grid: { display: false } // Hide x-axis grid lines
                     }
                 },
                  plugins: {
                      legend: { display: false },
                      tooltip: { enabled: true }
                  }
             }
         });
     } else {
         console.warn("learning-progress-chart canvas not found.");
     }


    // Job Application Status Chart (Example)
     const applicationCtx = document.getElementById('application-status-chart')?.getContext('2d');
      if (applicationCtx) {
           if (applicationCtx.chart) applicationCtx.chart.destroy();

           const applications = jobSearchData.applications || [];
           const statusCounts = {
               'applied': 0,
               'interview': 0,
               'offer': 0,
               'rejected': 0,
               'other': 0
           };
            applications.forEach(app => {
                const statusKey = app.status?.toLowerCase() || 'other';
                if (statusCounts.hasOwnProperty(statusKey)) {
                    statusCounts[statusKey]++;
                } else {
                    statusCounts.other++;
                }
            });

           applicationCtx.chart = new Chart(applicationCtx, {
               type: 'pie', // Or doughnut
               data: {
                   labels: ['Applied', 'Interview', 'Offer', 'Rejected', 'Other'],
                   datasets: [{
                       data: [
                            statusCounts.applied,
                            statusCounts.interview,
                            statusCounts.offer,
                            statusCounts.rejected,
                            statusCounts.other
                       ],
                       backgroundColor: ['#2196F3', '#FFC107', '#4CAF50', '#F44336', '#9E9E9E'],
                        borderWidth: 1,
                        borderColor: '#ffffff'
                   }]
               },
               options: {
                   responsive: true,
                   maintainAspectRatio: false,
                    plugins: {
                       legend: { position: 'bottom' },
                       tooltip: { enabled: true }
                    }
               }
           });
      } else {
          console.warn("application-status-chart canvas not found.");
      }

}


// --- Helper Functions (Professional Module) ---
// formatDate, showToast are in Utilities (Section 3)


// ==================================
// 12. Reflection Module
// ==================================

// Configuration - Already defined in Section 2
// const reflectionConfig = config.reflection;

// Global Chart instances for Reflection Module
let moodChart;
let weeklyMoodChart;

// Initialize Reflection Module
function initReflectionModule() {
     // Check if element exists
     if (document.getElementById('reflection')) {
         console.log("Initializing Reflection Module");
         // Load reflection data - Called by handleAuthenticatedUser
         // setupReflectionListeners(); // Setup listeners immediately
         // setupDailyPrompt(); // Setup prompt immediately
         setupReviewDashboard(); // Setup charts immediately (they will be updated with data later)
         // checkTodaysEntry(); // Check for entry immediately
         loadReflectionData(); // This fetches data and updates UI
         setupReflectionListeners(); // Setup listeners after main element is confirmed
         setupDailyPrompt(); // Setup prompt now that config is loaded
     } else {
         console.warn("initReflectionModule called, but #reflection element not found.");
     }
}

// Load Reflection Data
function loadReflectionData() {
    // Use the auth and db instances defined earlier
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Load today's reflection entry
    // Use onSnapshot for real-time updates if the user is actively editing
    db.collection('users').doc(userId)
      .collection('reflections')
      .doc(today)
      .onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data();
          populateReflectionFields(data);
           // updateReflectionStats(); // This might need more historical data, handle separately
           console.log("Today's reflection data loaded.");
        } else {
             // Clear fields if no entry for today
             populateReflectionFields({}); // Pass empty object
             console.log("No reflection entry for today.");
        }
         // After loading today's entry, check if it was empty to prompt
         checkTodaysEntry(doc.exists);

      }, error => {
           console.error(`Error loading today's reflection (${today}):`, error);
           showToast('Error loading today\'s reflection', 'error');
           // Clear fields on error
           populateReflectionFields({});
      });

    // Load streak data (stored in metadata)
    db.collection('users').doc(userId)
      .collection('metadata')
      .doc('reflectionStats')
      .onSnapshot(doc => {
        if (doc.exists) {
          updateStatsDisplay(doc.data());
        } else {
            // Initialize stats if not present
            updateStatsDisplay({ streak: 0, totalEntries: 0 });
        }
      }, error => {
          console.error("Error loading reflection stats:", error);
          // Display default/zero stats on error
          updateStatsDisplay({ streak: 0, totalEntries: 0 });
      });

     // Load historical data for charts and review dashboard
     loadHistoricalReflectionData(userId);
}

// Load Historical Reflection Data (for charts and review)
function loadHistoricalReflectionData(userId) {
     // Example: Fetch last 30 days of entries for charts/trends
     const thirtyDaysAgo = new Date();
     thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
     thirtyDaysAgo.setHours(0,0,0,0); // Start of day


     db.collection('users').doc(userId).collection('reflections')
         .where(firebase.firestore.FieldPath.documentId(), '>=', thirtyDaysAgo.toISOString().split('T')[0]) // Filter by document ID (date string)
         .orderBy(firebase.firestore.FieldPath.documentId(), 'desc') // Order by date desc
         .onSnapshot(snapshot => {
             const recentReflections = {};
             snapshot.forEach(doc => {
                 recentReflections[doc.id] = doc.data(); // Store by date (doc.id)
             });
              console.log("Loaded recent reflections:", recentReflections);
             updateReflectionStats(recentReflections); // Update stats that need historical data
             // Update review dashboard data if it's open
             updateReviewDashboardData(recentReflections);

         }, error => {
             console.error("Error loading historical reflection data:", error);
             // Handle error
         });

}


// Setup Event Listeners
function setupReflectionListeners() {
    // Check if main container exists
    const reflectionContainer = document.getElementById('reflection');
     if (!reflectionContainer) {
         console.warn("Reflection container not found. Skipping event listeners setup.");
         return;
     }


    // Tab switching
    document.querySelectorAll('.reflection-tab').forEach(tab => {
      tab.addEventListener('click', switchReflectionTab);
    });

    // Save buttons
    const saveJournalBtn = document.getElementById('save-journal');
    const saveGratitudeBtn = document.getElementById('save-gratitude');
    const saveLessonsBtn = document.getElementById('save-lessons');

     if (saveJournalBtn) saveJournalBtn.addEventListener('click', saveJournalEntry);
     if (saveGratitudeBtn) saveGratitudeBtn.addEventListener('click', saveGratitudeList);
     if (saveLessonsBtn) saveLessonsBtn.addEventListener('click', saveLessonsLearned);


    // Quick entry button
    const quickJournalBtn = document.getElementById('quick-journal');
     if (quickJournalBtn) quickJournalBtn.addEventListener('click', openQuickJournal);


    // Review dashboard
    const reviewDashboardBtn = document.getElementById('review-dashboard');
    const reviewModalCloseBtn = document.querySelector('#review-modal .close-modal');

     if (reviewDashboardBtn) reviewDashboardBtn.addEventListener('click', openReviewDashboard);
     if (reviewModalCloseBtn) reviewModalCloseBtn.addEventListener('click', closeReviewDashboard);


    // Review tabs (within the modal)
    document.querySelectorAll('#review-modal .review-tab').forEach(tab => { // Select tabs within the modal
      tab.addEventListener('click', switchReviewTab);
    });

    // Tags input for Journal
    const journalTagsInput = document.getElementById('journal-tags-input');
     if (journalTagsInput) {
         journalTagsInput.addEventListener('keydown', handleTagInput);
          // Add listener for click on remove button (using delegation or adding listener when tags are rendered)
          const tagsContainer = document.getElementById('journal-tags-container');
           if (tagsContainer) {
               tagsContainer.addEventListener('click', (e) => {
                   if (e.target.classList.contains('tag-remove')) {
                       e.target.closest('.tag').remove();
                   }
               });
           }
     }


    // Generate insights button
    const generateInsightsBtn = document.getElementById('generate-insights');
     if (generateInsightsBtn) {
         generateInsightsBtn.addEventListener('click', generateAIInsights);
     }

     // Mood radio buttons listener (using delegation)
     const moodSelector = document.querySelector('.mood-selector'); // Assuming a container for mood radios
      if (moodSelector) {
           moodSelector.addEventListener('change', (e) => {
               if (e.target.name === 'mood') {
                   console.log("Mood changed to:", e.target.value);
                   // Optional: Auto-save mood on change, or rely on save button
               }
           });
      }
}

// Setup Daily Prompt
function setupDailyPrompt() {
    const promptElement = document.getElementById('daily-prompt');
     if (promptElement && Array.isArray(reflectionConfig.journalPrompts)) {
        const randomIndex = Math.floor(Math.random() * reflectionConfig.journalPrompts.length);
        promptElement.textContent = reflectionConfig.journalPrompts[randomIndex];
     } else {
          console.warn("Daily prompt element or prompts configuration missing.");
     }
}

// Populate Reflection Fields with loaded data
function populateReflectionFields(data) {
    // Journal Tab
    const journalEntryEl = document.getElementById('journal-entry');
    const moodSelector = document.querySelector('.mood-selector');
    const tagsContainer = document.getElementById('journal-tags-container');


    if (journalEntryEl) journalEntryEl.value = data?.journal?.entry || '';

    // Populate mood radios
    if (moodSelector) {
         const moodValue = data?.journal?.mood ?? 3; // Default to neutral (3)
         const radio = moodSelector.querySelector(`input[name="mood"][value="${moodValue}"]`);
         if (radio) radio.checked = true;
    }


    // Populate tags
    if (tagsContainer) {
        tagsContainer.innerHTML = ''; // Clear existing tags
        const tags = Array.isArray(data?.journal?.tags) ? data.journal.tags : [];
        tags.forEach(tag => addTag(tag, tagsContainer)); // Use helper to add tag element
    }


    // Gratitude Tab
    const gratitudeInputs = document.querySelectorAll('.gratitude-input');
    if (gratitudeInputs.length > 0) {
        const gratitudeItems = Array.isArray(data?.gratitude?.items) ? data.gratitude.items : [];
         gratitudeInputs.forEach((input, index) => {
             input.value = gratitudeItems[index] || ''; // Populate inputs sequentially
         });
    }


    // Lessons Tab
    const wentWellEl = document.getElementById('went-well');
    const couldImproveEl = document.getElementById('could-improve');
    const keyTakeawaysEl = document.getElementById('key-takeaways');

    if (wentWellEl) wentWellEl.value = data?.lessons?.wentWell || '';
    if (couldImproveEl) couldImproveEl.value = data?.lessons?.couldImprove || '';
    if (keyTakeawaysEl) keyTakeawaysEl.value = data?.lessons?.keyTakeaways || '';

}

// Helper to add a tag element to the container
function addTag(tag, container = document.getElementById('journal-tags-container')) {
    if (!container || !tag) return;

     // Check if tag already exists to avoid duplicates
     const existingTags = Array.from(container.querySelectorAll('.tag')).map(el => el.textContent.trim().replace('×', ''));
     if (existingTags.includes(tag)) {
         return;
     }

    const tagElement = document.createElement('div');
    tagElement.className = 'tag';
    tagElement.innerHTML = `
        ${tag}
        <button class="tag-remove">&times;</button>
    `;
    container.appendChild(tagElement);

    // Listener for removing tag is handled by delegation in setupReflectionListeners
}

// Get Current Tags from the UI container
function getCurrentTags() {
    const container = document.getElementById('journal-tags-container');
     if (!container) return [];
    return Array.from(container.querySelectorAll('.tag'))
      .map(el => el.textContent.trim().replace('×', '')); // Remove the '×' symbol if present
}


// Switch Reflection Tab
function switchReflectionTab(e) {
    const tab = e.currentTarget;
    const tabName = tab.dataset.tab; // e.g., 'journal', 'gratitude', 'lessons'

    // Remove active class from all tabs and contents within the reflection section
    const tabs = document.querySelectorAll('#reflection .reflection-tab');
    const contents = document.querySelectorAll('#reflection .reflection-tab-content');

    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    // Add active class to clicked tab
    tab.classList.add('active');

    // Show corresponding content
    const targetContent = document.getElementById(`${tabName}-tab`);
     if (targetContent) {
         targetContent.classList.add('active');
     } else {
         console.warn(`Reflection tab content not found for: ${tabName}`);
     }
}


// Save Journal Entry
async function saveJournalEntry() {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        showToast('User not authenticated', 'error');
        return;
    }
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const entry = document.getElementById('journal-entry').value.trim();
    const mood = document.querySelector('input[name="mood"]:checked')?.value;
    const tags = getCurrentTags();

     if (!entry) {
         showToast('Journal entry cannot be empty', 'warning');
         return;
     }
     if (!mood) {
          showToast('Please select your mood', 'warning');
         return;
     }


    const journalData = {
      entry,
      mood: parseInt(mood),
      tags,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      // Use set with merge: true to update only the journal field
      await db.collection('users').doc(userId)
        .collection('reflections')
        .doc(today)
        .set({ journal: journalData }, { merge: true });

      showToast('Journal saved successfully');
      // Streak update is handled by the snapshot listener on reflectionStats metadata
      // updateStreak(); // This function is reactive to snapshot, no need to call manually
    } catch (error) {
      console.error("Error saving journal entry:", error);
      showToast('Failed to save journal', 'error');
    }
}

// Save Gratitude List
async function saveGratitudeList() {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        showToast('User not authenticated', 'error');
        return;
    }
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const inputs = document.querySelectorAll('.gratitude-input');
    const items = Array.from(inputs).map(input => input.value.trim()).filter(item => item); // Filter out empty items

     if (items.length === 0) {
         showToast('Please list at least one thing you are grateful for', 'warning');
         return;
     }


    const gratitudeData = {
      items,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      await db.collection('users').doc(userId)
        .collection('reflections')
        .doc(today)
        .set({ gratitude: gratitudeData }, { merge: true });

      showToast('Gratitude list saved successfully');
    } catch (error) {
      console.error("Error saving gratitude list:", error);
      showToast('Failed to save gratitude list', 'error');
    }
}

// Save Lessons Learned
async function saveLessonsLearned() {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        showToast('User not authenticated', 'error');
        return;
    }
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const wentWell = document.getElementById('went-well').value.trim();
    const couldImprove = document.getElementById('could-improve').value.trim();
    const keyTakeaways = document.getElementById('key-takeaways').value.trim();

     if (!wentWell && !couldImprove && !keyTakeaways) {
         showToast('Lessons learned fields are empty', 'warning');
         return;
     }


    const lessonsData = {
      wentWell,
      couldImprove,
      keyTakeaways,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      await db.collection('users').doc(userId)
        .collection('reflections')
        .doc(today)
        .set({ lessons: lessonsData }, { merge: true });

      showToast('Lessons saved successfully');
    } catch (error) {
      console.error("Error saving lessons learned:", error);
      showToast('Failed to save lessons', 'error');
    }
}

// Check Today's Entry (Called after loading today's entry)
function checkTodaysEntry(entryExists) {
    // Check if today's entry document existed
    if (!entryExists) {
        // Use the specific reminder show function
        showReflectionReminder('Complete your daily reflection to maintain your streak!');
    } else {
        // Remove any existing reminder if entry is now present
        const reminder = document.querySelector('.reminder-banner');
        if (reminder) {
             reminder.classList.remove('show');
              // Allow transition before removing
             setTimeout(() => {
                 if (reminder.parentNode) reminder.parentNode.removeChild(reminder);
             }, 300);
        }
    }
}

// Update Streak and Total Entries (Called by reflectionStats snapshot)
function updateStatsDisplay(data) {
    const streakCountEl = document.getElementById('streak-count');
    const journalCountEl = document.getElementById('journal-count');

    if (streakCountEl) streakCountEl.textContent = data?.streak || 0;
    if (journalCountEl) journalCountEl.textContent = data?.totalEntries || 0;

     // Update mood chart if it's on the main page (initial mood chart)
     // The historical data update for charts happens in updateReflectionStats
}

// Update Reflection Stats (like streak) based on historical data
// This is called after loadHistoricalReflectionData
function updateReflectionStats(recentReflections) {
     const userId = auth.currentUser?.uid;
     if (!userId) return;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Calculate streak based on recent entries
    let streak = 0;
    let checkDate = new Date(today);
    checkDate.setHours(0, 0, 0, 0);

    let lastCompletedDate = null;
    let checkedToday = false;

    // Check backwards from today for consecutive entries
    for (let i = 0; i < 365; i++) { // Check up to a year back
        const dateStr = checkDate.toISOString().split('T')[0];

        // Is there an entry for this date?
        if (recentReflections[dateStr] && recentReflections[dateStr].journal?.entry) { // Consider an entry complete if journal entry exists
             if (!checkedToday) {
                  // If we are checking today's date and an entry exists
                  lastCompletedDate = new Date(checkDate);
                  checkedToday = true;
                  streak++;
             } else if (lastCompletedDate && Math.round((lastCompletedDate.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24)) === 1) {
                  // If this date is exactly one day before the last completed date
                   lastCompletedDate = new Date(checkDate);
                   streak++;
             } else if (lastCompletedDate && Math.round((lastCompletedDate.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24)) > 1) {
                 // Gap detected
                 break;
             } else if (!lastCompletedDate && checkedToday) {
                  // This case should not happen with logic above, but as a fallback
                  break; // Should have set lastCompletedDate when checkedToday became true
             }

        } else if (!checkedToday && dateStr === todayStr) {
             // Today's entry doesn't exist, the streak ended yesterday (or before)
             // We need to find the streak up to yesterday.
             checkedToday = true; // Mark today as checked (and not completed)
             // continue loop to check yesterday
        } else if (checkedToday && dateStr !== todayStr) {
             // If we already checked today (and it wasn't completed), and there's no entry for this date,
             // and it's not the day immediately preceding the last completed day, the streak is broken.
             // Note: This logic can be simplified. If the current date (checkDate) is not today, and it's not in recentReflections, the streak is broken unless the *previous* day was the last completed day.
             // Let's simplify: Start from today, count backward as long as consecutive dates have entries.
             break; // Simplified break condition
        }
        // If the loop continues, move to the previous day
        checkDate.setDate(checkDate.getDate() - 1);

        // Stop if we go too far back or hit a significant gap (already handled by break)
    }
}



    // Simplified Streak Calculation:
    let simpleStreak = 0;
    let streakCheckDate = new Date(today);
    streakCheckDate.setHours(0, 0, 0, 0);

    while(true) {
        const dateStr = streakCheckDate.toISOString().split('T')[0];
        const yesterday = new Date(streakCheckDate);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];


        if (recentReflections[dateStr] && recentReflections[dateStr].journal?.entry) {
            // Entry exists for this day
            simpleStreak++;
            streakCheckDate.setDate(streakCheckDate.getDate() - 1); // Move to the previous day
        } else if (dateStr === todayStr) {
             // No entry for today, streak is 0 (or ended yesterday)
             // Need to check if yesterday has an entry
             if (recentReflections[yesterdayStr] && recentReflections[yesterdayStr].journal?.entry) {
                  // Yesterday had an entry, continue checking backwards from yesterday
                  // This path is complex. Let's assume the loop below handles it correctly.
                  // If today doesn't have an entry, the streak calculation below (starting from today) will stop immediately if yesterday also doesn't have one.
                  // If today doesn't have an entry but yesterday does, the streak ended yesterday.
                  // We need to find the length of the streak ending yesterday.
                   if (!recentReflections[todayStr]?.journal?.entry && recentReflections[yesterdayStr]?.journal?.entry) {
                        // Streak ended yesterday. Recalculate streak ending yesterday.
                        let tempStreak = 0;
                        let tempCheckDate = new Date(yesterday);
                        tempCheckDate.setHours(0,0,0,0);
                         for (let i = 0; i < 365; i++) {
                              const tempDateStr = tempCheckDate.toISOString().split('T')[0];
                               if (recentReflections[tempDateStr] && recentReflections[tempDateStr].journal?.entry) {
                                    tempStreak++;
                                    tempCheckDate.setDate(tempCheckDate.getDate() - 1);
                               } else {
                                    break; // Streak broken before yesterday
                               }
                         }
                         simpleStreak = tempStreak; // The streak length ending yesterday
                   } else {
                       // Today has an entry (handled above), or neither today nor yesterday has an entry.
                       // If neither has an entry, simpleStreak is 0, which is correct.
                   }
                  break; // Stop loop after handling today/yesterday
             }
         else {
            // No entry for this day, and it's not today
            break; // Streak broken
         }
    }


     // Calculate total entries based on loaded data count
     const totalEntries = Object.keys(recentReflections).length;


    // Update stats in Firestore (using set with merge to avoid overwriting other metadata)
    db.collection('users').doc(userId)
      .collection('metadata')
      .doc('reflectionStats')
      .set({
        streak: simpleStreak, // Use simplified streak
        totalEntries: totalEntries, // Use count from loaded data
        lastEntry: recentReflections[todayStr]?.journal?.updatedAt ? new Date(recentReflections[todayStr].journal.updatedAt) : (data?.lastEntry?.toDate() || null)
      }, { merge: true })
      .then(() => console.log("Reflection stats updated"))
      .catch(error => console.error("Error updating reflection stats:", error));


    // Update mood chart data (if it exists and is the main one)
    // This chart shows recent mood trend
     const chartElement = document.getElementById('moodTrendChart');
    if (chartElement && window.moodChart) { // Check if canvas element and Chart instance exist
         const moodData = [];
         const productivityData = []; // Assuming productivity is also tracked and affects this chart
         const labels = [];

         // Get dates for the last X days
         const chartDays = 30; // Or fewer, matching your data fetch
         for (let i = chartDays - 1; i >= 0; i--) {
             const date = new Date(today);
             date.setDate(today.getDate() - i);
             const dateStr = date.toISOString().split('T')[0];
             labels.push(date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));

             const reflection = recentReflections[dateStr];
             // Use average score or just mood for simplicity
              const dailyScore = calculateDailyReflectionScore(reflection); // Need a helper function
              const mood = reflection?.journal?.mood ?? null; // null for missing data
              const productivity = reflection?.lessons?.wentWell || reflection?.lessons?.keyTakeaways ? 4 : 2; // Simple heuristic

              moodData.push(mood); // Push mood (can be null)
              productivityData.push(productivity); // Push productivity (can be null)
         }


         // Update the chart data
         if (window.moodChart.data.datasets.length > 0) {
             window.moodChart.data.labels = labels;
              // Update mood dataset
              const moodDataset = window.moodChart.data.datasets.find(ds => ds.label === 'Mood (1-5 scale)');
              if (moodDataset) moodDataset.data = moodData;

              // Add/Update productivity dataset if needed in this chart
              let productivityDataset = window.moodChart.data.datasets.find(ds => ds.label === 'Productivity');
               if (!productivityDataset) {
                  productivityDataset = {
                       label: 'Productivity',
                       data: productivityData,
                       borderColor: '#03dac6', // Example color
                       backgroundColor: 'rgba(3, 218, 198, 0.1)', // Example color
                       tension: 0.3,
                       fill: true
                  };
                   window.moodChart.data.datasets.push(productivityDataset);
               } else {
                   productivityDataset.data = productivityData;
               }


             window.moodChart.update(); // Redraw the chart
         } else {
             console.warn("Mood chart datasets not initialized.");
         }
    }
}

// Calculate a simple daily reflection score (Placeholder)
function calculateDailyReflectionScore(reflection) {
     if (!reflection) return null; // Return null if no reflection for the day

     const mood = reflection.journal?.mood ?? 3; // Default mood to neutral
     const productivity = (reflection.lessons?.wentWell || reflection.lessons?.keyTakeaways) ? 1 : 0; // Simple binary: 1 if lessons/well exist, 0 otherwise
     const social = reflection.gratitude?.items?.length > 0 ? 1 : 0; // Simple binary: 1 if any gratitude items exist

      // Apply weights from config (example calculation)
      const weightedScore =
           (mood / 5) * reflectionConfig.analysisParameters.moodWeight + // Scale mood to 0-1
           productivity * reflectionConfig.analysisParameters.productivityWeight +
           social * reflectionConfig.analysisParameters.socialWeight;

      // Scale score back to a meaningful range, e.g., 1-5 or 1-10
      // This is a very basic example; a real score needs more sophisticated logic
      // Let's just return the mood for now, as it's a direct 1-5 scale
      return mood; // Use mood directly for simple score visualization


     // Or return a score based on combination:
     // return Math.round(weightedScore * 5); // Scale back to 1-5? Needs careful mapping

}


// Open Quick Journal (using UI elements)
function openQuickJournal() {
    const journalTabButton = document.querySelector('.reflection-tab[data-tab="journal"]');
    const journalEntryTextarea = document.getElementById('journal-entry');

    if (journalTabButton) {
        journalTabButton.click(); // Simulate clicking the journal tab
    }
    if (journalEntryTextarea) {
        journalEntryTextarea.focus(); // Focus the textarea
    }

    // Show a random gratitude benefit as a tip
     if (Array.isArray(reflectionConfig.gratitudeBenefits) && reflectionConfig.gratitudeBenefits.length > 0) {
        const randomIndex = Math.floor(Math.random() * reflectionConfig.gratitudeBenefits.length);
        showToast(`Tip: ${reflectionConfig.gratitudeBenefits[randomIndex]}`, 'info'); // Use info type for tips
     }
}

// Setup Review Dashboard (Initial chart setup)
function setupReviewDashboard() {
    // Initialize mood trend chart on the main page (if it exists)
     const mainMoodChartCtx = document.getElementById('moodTrendChart')?.getContext('2d');
     if (mainMoodChartCtx && typeof Chart !== 'undefined') {
         if (window.moodChart) window.moodChart.destroy(); // Destroy previous instance

          window.moodChart = new Chart(mainMoodChartCtx, {
            type: 'line',
            data: {
              labels: [], // Labels will be populated by loadHistoricalReflectionData
              datasets: [{
                label: 'Mood (1-5 scale)',
                data: [], // Data will be populated
                borderColor: '#6200ea',
                backgroundColor: 'rgba(98, 0, 234, 0.1)',
                tension: 0.3,
                fill: true
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  min: 1,
                  max: 5,
                  ticks: {
                    stepSize: 1
                  }
                },
                x: {
                    grid: { display: false }
                }
              },
               plugins: {
                   legend: { display: true },
                   tooltip: { enabled: true }
               }
            }
          });
     } else {
          console.warn("Main mood trend chart canvas or Chart.js not found.");
     }


    // Initialize charts within the Review Modal (they will be populated by loadReviewData)
     const weeklyMoodChartCtx = document.getElementById('weekly-mood-chart')?.getContext('2d');
      if (weeklyMoodChartCtx && typeof Chart !== 'undefined') {
          // Don't initialize data here, loadReviewData will do it
           // Destroy existing chart instance
           if (window.weeklyMoodChart) window.weeklyMoodChart.destroy();
           // Store context for later use by Chart constructor in simulateWeeklyData
            window.weeklyMoodChartContext = weeklyMoodChartCtx;
      } else {
          console.warn("Weekly mood chart canvas or Chart.js not found.");
      }

}

// Open Review Dashboard Modal
function openReviewDashboard() {
    const modal = document.getElementById('review-modal');
     if (modal) {
        modal.classList.add('active');
        // Load data for the default review tab (e.g., 'weekly')
        // Find the default active tab or click the first one
        const defaultTab = document.querySelector('#review-modal .review-tab.active') || document.querySelector('#review-modal .review-tab');
         if (defaultTab) {
             defaultTab.click(); // This will call switchReviewTab which calls loadReviewData
         } else {
             console.warn("No review tabs found in modal.");
             loadReviewData('weekly'); // Fallback to loading weekly data directly
         }
     } else {
         console.warn("Review modal not found.");
     }
}

// Close Review Dashboard Modal
function closeReviewDashboard() {
    const modal = document.getElementById('review-modal');
     if (modal) {
        modal.classList.remove('active');
     }
}

// Switch Review Tab (within the modal)
function switchReviewTab(e) {
    const tab = e.currentTarget;
    const reviewType = tab.dataset.review; // e.g., 'weekly', 'monthly', 'quarterly'

    // Remove active class from all tabs and contents within the review modal
    const tabs = document.querySelectorAll('#review-modal .review-tab');
    const contents = document.querySelectorAll('#review-modal .review-tab-content');

    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    // Add active class to clicked tab
    tab.classList.add('active');

    // Show corresponding content
    const targetContent = document.getElementById(`${reviewType}-review`);
     if (targetContent) {
         targetContent.classList.add('active');
         // Load data for this review type based on the historical reflections
         loadReviewData(reviewType);
     } else {
         console.warn(`Review tab content not found for: ${reviewType}`);
     }
}

// Load Review Data (within the modal)
// This function uses the already loaded `recentReflections` data
function loadReviewData(type) {
    // Get the historical reflection data
     const userId = auth.currentUser?.uid;
     if (!userId) {
         console.error("User not authenticated for review data.");
         return;
     }

    // Use the data loaded by loadHistoricalReflectionData
    // For now, simulate data as originally implemented, but ideally use loaded data
    console.log(`Loading ${type} review data... (using simulated data)`);

    // Check which tab content is active to render data there
    const contentContainerId = `${type}-review`;
    const contentContainer = document.getElementById(contentContainerId);
    if (!contentContainer) {
         console.warn(`Content container for ${type} review not found.`);
         return;
    }

    if (type === 'weekly') {
      simulateWeeklyData(contentContainer); // Pass container to render into
    } else if (type === 'monthly') {
      simulateMonthlyData(contentContainer); // Pass container
    } else if (type === 'quarterly') {
      simulateQuarterlyData(contentContainer); // Pass container
    } else {
        console.warn(`Unknown review type: ${type}`);
    }
}

// Simulate Weekly Data (renders into passed container)
function simulateWeeklyData(container) {
    const highlightsContainer = container.querySelector('#weekly-highlights'); // Select within the container
    const themesContainer = container.querySelector('#weekly-themes');
     const weeklyMoodChartCanvas = container.querySelector('#weekly-mood-chart');


    // Simulate highlights (ideally extract from recent reflections)
    const highlights = [
      "Completed project milestone",
      "Consistent morning routine",
      "Great networking opportunity",
      "Personal best in workout"
    ];

     if (highlightsContainer) {
        highlightsContainer.innerHTML = highlights.map(highlight => `
          <div class="highlight-card">${highlight}</div>
        `).join('');
     }

    // Simulate themes (ideally extract tags/keywords from recent reflections)
    const themes = ["Productivity", "Health", "Learning", "Relationships", "Growth"];
     if (themesContainer) {
        themesContainer.innerHTML = themes.map(theme => `
          <div class="theme-tag">${theme}</div>
        `).join('');
     }


    // Update weekly mood chart
     if (weeklyMoodChartCanvas && typeof Chart !== 'undefined') {
        const ctx = weeklyMoodChartCanvas.getContext('2d');
        if (window.weeklyMoodChart) {
          window.weeklyMoodChart.destroy();
        }

        window.weeklyMoodChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Array.from({ length: 7 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              return d.toLocaleDateString('en-US', { weekday: 'short' });
            }),
            datasets: [{
              label: 'Mood',
              data: generateMoodData(7), // Use simulated data for 7 days
              backgroundColor: '#6200ea'
            }, {
              label: 'Productivity',
              data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 5) + 1), // Simulated productivity
              backgroundColor: '#03dac6'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                min: 1,
                max: 5,
                ticks: {
                  stepSize: 1
                }
              },
               x: { grid: { display: false } }
            },
             plugins: {
                 legend: { position: 'bottom' },
                 tooltip: { enabled: true }
             }
          }
        });
     } else {
         console.warn("Weekly mood chart canvas or Chart.js not found for rendering.");
     }
}

// Simulate Monthly Data (renders into passed container)
function simulateMonthlyData(container) {
    const insightsContainer = container.querySelector('#monthly-insights');
     if (!insightsContainer) {
         console.warn("#monthly-insights container not found for rendering.");
         return;
     }

    // Simulate insights (ideally generated from historical data analysis)
    const insights = [
      "Your most productive time is between 9-11 AM",
      "You consistently report higher mood on days with exercise",
      "Social interactions boost your energy levels",
      "Your focus declines after 3 PM most days"
    ];

    insightsContainer.innerHTML = insights.map(insight => `
      <div class="highlight-card">${insight}</div>
    `).join('');
}

// Simulate Quarterly Data (renders into passed container)
function simulateQuarterlyData(container) {
    const goalsContainer = container.querySelector('#quarterly-goals');
     if (!goalsContainer) {
         console.warn("#quarterly-goals container not found for rendering.");
         return;
     }

    // Simulate goals progress (ideally fetched from Goals module or user data)
    const goals = [
      { goal: "Complete certification course", progress: 65 },
      { goal: "Establish morning routine", progress: 90 },
      { goal: "Read 12 books", progress: 75 },
      { goal: "Network with 10 professionals", progress: 40 }
    ];

    goalsContainer.innerHTML = goals.map(item => `
      <div class="progress-item">
        <h5>${item.goal}</h5>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${Math.min(100, item.progress)}%"></div>
        </div>
        <span>${item.progress}% completed</span>
      </div>
    `).join('');
}


// Generate AI Insights (Placeholder)
function generateAIInsights() {
    // In a real app, this would trigger a background process to analyze data
    // and update a field in Firestore that a snapshot listener reads.
    // For now, we'll just simulate some static insights.

    const insightsContainer = document.getElementById('ai-insights'); // Assuming this is in the review modal
     if (!insightsContainer) {
         showToast('AI insights container not found.', 'error');
         return;
     }

    const insights = [
      "You're most productive on Tuesdays and Wednesdays.",
      "Your mood improves significantly after social interactions.",
      "Days with morning exercise show 30% higher productivity.",
      "You tend to be more creative in the late morning hours."
    ];

    const randomInsights = [];
    // Pick 2 random unique insights
    while (randomInsights.length < 2 && insights.length > 0) {
      const randomIndex = Math.floor(Math.random() * insights.length);
      const insight = insights.splice(randomIndex, 1)[0]; // Remove to prevent duplicates
      randomInsights.push(insight);
    }

    insightsContainer.innerHTML = randomInsights
      .map(insight => `<p>${insight}</p>`)
      .join('');

    showToast('New insights generated based on your reflection data');
}


// Helper Functions (Reflection Module)
// showToast is in Utilities (Section 3)

/**
 * Displays a specific reminder banner for reflection.
 * @param {string} message - The reminder message.
 */
function showReflectionReminder(message) {
    // Check if a reminder is already visible
    if (document.querySelector('.reminder-banner')) {
        return; // Don't show multiple reminders
    }

    const reminder = document.createElement('div');
    reminder.className = 'reminder-banner';
    reminder.innerHTML = `
      <span>${message}</span>
      <button class="btn-icon reminder-dismiss" title="Dismiss">
        <i class="fas fa-times"></i>
      </button>
    `;
    // Append to a specific area if available, otherwise body
    const reminderArea = document.getElementById('reflection-reminder-area'); // Assuming an area
     if (reminderArea) {
         reminderArea.appendChild(reminder);
     } else {
         document.body.appendChild(reminder);
     }


    setTimeout(() => {
      reminder.classList.add('show');
    }, 100); // Short delay for CSS transition

    // Add dismiss listener
    const dismissButton = reminder.querySelector('.reminder-dismiss');
     if (dismissButton) {
         dismissButton.addEventListener('click', () => {
           reminder.classList.remove('show');
           setTimeout(() => {
             if (reminder.parentNode) {
                 reminder.parentNode.removeChild(reminder);
             }
           }, 300); // Match CSS fade-out duration
         });
     }
}

// Simulate Mood Data (used by charts)
function generateMoodData(days = 7) {
     const data = [];
    for (let i = 0; i < days; i++) {
        // Simulate values between 1 and 5
        // Example: Base mood (3) + some random fluctuation
        const mood = Math.max(1, Math.min(5, Math.round(3 + (Math.random() - 0.5) * 3)));
        data.push(mood);
    }
    return data;
}


// ==================================
// 13. Relationships Module
// ==================================

// Initialize Relationships Module
function initRelationships() {
    // Check if element exists
    if (document.getElementById('relationships')) {
        console.log("Initializing Relationships Module");
        // Load relationships data - Called by handleAuthenticatedUser
        // setupEventListeners(); // Setup listeners immediately
        loadRelationships(); // This fetches data and updates UI
        setupEventListeners(); // Setup listeners after main element is confirmed
    } else {
        console.warn("initRelationships called, but #relationships element not found.");
    }
}

// Setup Event Listeners
function setupEventListeners() {
     // Check if main container exists
     const relationshipsContainer = document.getElementById('relationships');
      if (!relationshipsContainer) {
          console.warn("Relationships container not found. Skipping event listeners setup.");
          return;
      }

    // Add relationship button
    const addRelationshipBtn = document.getElementById('add-relationship');
    if (addRelationshipBtn) addRelationshipBtn.addEventListener('click', () => showRelationshipModal()); // Open add modal

    // Cancel buttons for modals
    const cancelRelationshipBtn = document.getElementById('cancel-relationship');
    const cancelInteractionBtn = document.getElementById('cancel-interaction');

     if (cancelRelationshipBtn) cancelRelationshipBtn.addEventListener('click', hideRelationshipModal);
     if (cancelInteractionBtn) cancelInteractionBtn.addEventListener('click', hideInteractionModal);

    // Form submissions for modals
    const relationshipForm = document.getElementById('relationship-form');
    const interactionForm = document.getElementById('interaction-form');

    if (relationshipForm) relationshipForm.addEventListener('submit', saveRelationship);
    if (interactionForm) interactionForm.addEventListener('submit', saveInteraction);


    // Follow-up checkbox (within interaction modal)
    const interactionFollowupCheckbox = document.getElementById('interaction-followup');
    const interactionFollowupDateInput = document.getElementById('interaction-followup-date');
    if (interactionFollowupCheckbox && interactionFollowupDateInput) {
        interactionFollowupCheckbox.addEventListener('change', function() {
            interactionFollowupDateInput.disabled = !this.checked;
             if (this.checked) {
                 // Set default date to a week from now
                 const defaultDate = new Date();
                 defaultDate.setDate(defaultDate.getDate() + 7);
                 interactionFollowupDateInput.value = defaultDate.toISOString().split('T')[0];
             } else {
                 interactionFollowupDateInput.value = ''; // Clear date if unchecked
             }
        });
         // Initialize state on load
        interactionFollowupDateInput.disabled = !interactionFollowupCheckbox.checked;
         if (!interactionFollowupCheckbox.checked) interactionFollowupDateInput.value = '';

    }

    // Category filter for relationship cards
    const categoryFilter = document.getElementById('relationship-category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterRelationships);
    }


     // Tags input for Relationship Modal
    const relationshipTagsInput = document.getElementById('relationship-tags');
    const relationshipTagsContainer = document.getElementById('relationship-tags-container');
    if (relationshipTagsInput && relationshipTagsContainer) {
        relationshipTagsInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const tag = this.value.trim();
                if (tag) {
                    addTagToRelationshipsContainer(tag, relationshipTagsContainer);
                    this.value = '';
                }
            }
        });
         // Add listener for click on remove button (using delegation)
          relationshipTagsContainer.addEventListener('click', (e) => {
              if (e.target.classList.contains('tag-remove')) {
                  e.target.closest('.tag').remove();
              }
          });
    }


     // Add event delegation for dynamic elements (log interaction, view details, delete, etc.)
     relationshipsContainer.addEventListener('click', (e) => {
          // Log Interaction button
         if (e.target.closest('.btn-log-interaction')) {
             const card = e.target.closest('.relationship-card');
             if (card?.dataset.id) {
                 showInteractionModal(card.dataset.id); // Pass relationship ID
             }
         }
          // View Details button
          if (e.target.closest('.btn-view-details')) {
              const card = e.target.closest('.relationship-card');
             if (card?.dataset.id) {
                 viewRelationshipDetails(card.dataset.id); // Pass relationship ID
             }
         }
          // Edit Relationship button (if added to card)
          if (e.target.closest('.btn-edit-relationship')) { // Assuming an edit button exists
               const card = e.target.closest('.relationship-card');
               if (card?.dataset.id) {
                   showRelationshipModal(card.dataset.id); // Pass relationship ID to open in edit mode
               }
          }
          // Delete Relationship button (if added to card)
           if (e.target.closest('.btn-delete-relationship')) { // Assuming a delete button exists
               const card = e.target.closest('.relationship-card');
               if (card?.dataset.id) {
                    if (confirm('Are you sure you want to delete this relationship?')) {
                        handleDeleteRelationship(card.dataset.id); // Pass relationship ID
                    }
               }
          }
     });
}

// Load Relationships data
function loadRelationships() {
    // Use the auth and db instances defined earlier
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    db.collection('users').doc(userId).collection('relationships')
        .orderBy('name') // Order alphabetically
        .onSnapshot(snapshot => {
            const relationships = [];
            snapshot.forEach(doc => {
                relationships.push({ id: doc.id, ...doc.data() });
            });

            updateRelationshipsUI(relationships);
            updateSummaryStats(relationships); // Update stats and chart using the loaded data
        }, error => {
            console.error("Error loading relationships: ", error);
             showToast('Error loading relationships', 'error');
        });
}

function updateRelationshipsUI(relationships) {
    const container = document.getElementById('relationship-cards-container');
    if (!container) {
         console.warn("relationship-cards-container not found.");
         return;
    }
    container.innerHTML = ''; // Clear existing cards

    if (relationships.length === 0) {
        container.innerHTML = '<p>No relationships added yet. Connect with someone!</p>';
        return;
    }

    relationships.forEach(relationship => {
        const card = createRelationshipCard(relationship);
        container.appendChild(card);
    });

     // Re-apply filter after rendering
     filterRelationships();
}

// Create Relationship Card Element
function createRelationshipCard(relationship) {
    const card = document.createElement('div');
    card.className = 'relationship-card';
    card.dataset.id = relationship.id; // Store Firestore document ID
    card.dataset.category = relationship.category; // Store category for filtering


    // Format last interaction date if exists
     let lastInteractionDate = 'No interactions yet';
     if (relationship.lastInteractionDate) {
         // Check if it's a Firestore Timestamp or a Date string/object
         const dateObj = relationship.lastInteractionDate.toDate ? relationship.lastInteractionDate.toDate() : new Date(relationship.lastInteractionDate);
         if (!isNaN(dateObj.getTime())) {
             lastInteractionDate = dateObj.toLocaleDateString();
         } else {
              console.warn("Invalid lastInteractionDate for relationship:", relationship.id, relationship.lastInteractionDate);
         }
     }


    // Format emotion icon
    let emotionIcon = '😐';
    let emotionClass = 'neutral';
    switch (relationship.emotion) {
        case 'positive': emotionIcon = '😊'; emotionClass = 'positive'; break;
        case 'negative': emotionIcon = '😞'; emotionClass = 'negative'; break;
        case 'neutral': emotionIcon = '😐'; emotionClass = 'neutral'; break;
        default: emotionIcon = '😐'; emotionClass = 'neutral'; // Default
    }


    card.innerHTML = `
        <div class="relationship-header">
            <h3 class="relationship-name">${relationship.name || 'Unnamed Relationship'}</h3>
            <span class="relationship-category ${relationship.category || 'other'}">${formatCategory(relationship.category)}</span>
        </div>

        <div class="relationship-meta">
            <div class="meta-item">
                <i class="fas fa-star"></i>
                <span>${formatImportance(relationship.importance)}</span>
            </div>
            <div class="meta-item">
                <i class="fas fa-calendar-alt"></i>
                <span>Last: ${lastInteractionDate}</span>
            </div>
        </div>

        <div class="relationship-emotion">
            <span class="emotion-icon ${emotionClass}">${emotionIcon}</span>
            <span>Current feeling: ${formatEmotion(relationship.emotion)}</span>
        </div>

        ${relationship.notes ? `<div class="relationship-notes">${relationship.notes}</div>` : ''}

        ${Array.isArray(relationship.tags) && relationship.tags.length > 0 ? `
            <div class="relationship-tags">
                ${relationship.tags.map(tag => `<span class="relationship-tag">${tag}</span>`).join('')}
            </div>
        ` : ''}

        <div class="relationship-actions">
            <button class="btn btn-sm btn-log-interaction" data-id="${relationship.id}" title="Log Interaction">
                <i class="fas fa-plus"></i> Log Interaction
            </button>
            <button class="btn btn-sm btn-view-details" data-id="${relationship.id}" title="View Details">
                View Details <i class="fas fa-chevron-right"></i>
            </button>
             <button class="btn btn-sm btn-edit-relationship" data-id="${relationship.id}" title="Edit Relationship">
                <i class="fas fa-edit"></i>
            </button>
             <button class="btn btn-sm btn-delete-relationship" data-id="${relationship.id}" title="Delete Relationship">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    // Event listeners are handled by delegation in setupEventListeners

    return card;
}

function updateSummaryStats(relationships) {
    const totalRelationshipsEl = document.getElementById('total-relationships');
    const recentInteractionsEl = document.getElementById('recent-interactions'); // Need to calculate this
    const importantRelationshipsEl = document.getElementById('important-relationships');
    const sentimentChartCanvas = document.getElementById('sentimentChart');


    if (totalRelationshipsEl) totalRelationshipsEl.textContent = relationships.length;

    // Calculate important relationships
    const importantCount = relationships.filter(rel =>
        rel.importance === 'high' || rel.importance === 'critical'
    ).length;
    if (importantRelationshipsEl) importantRelationshipsEl.textContent = importantCount;


     // Calculating "Recent Interactions" is tricky here as interaction dates are in a subcollection.
     // You'd typically query the subcollection to get recent interactions or store a summary field on the relationship document.
     // For now, keep it as N/A or calculate based on the `lastInteractionDate` field.
     const recentThreshold = new Date();
     recentThreshold.setDate(recentThreshold.getDate() - 30); // Last 30 days

     const recentCount = relationships.filter(rel => {
         if (rel.lastInteractionDate) {
              const dateObj = rel.lastInteractionDate.toDate ? rel.lastInteractionDate.toDate() : new Date(rel.lastInteractionDate);
             return !isNaN(dateObj.getTime()) && dateObj > recentThreshold;
         }
         return false;
     }).length;
     if (recentInteractionsEl) recentInteractionsEl.textContent = recentCount;


    // Update sentiment chart
    if (sentimentChartCanvas && typeof Chart !== 'undefined') {
        const ctx = sentimentChartCanvas.getContext('2d');

        // Count emotions
        const emotionCounts = {
            positive: 0,
            neutral: 0,
            negative: 0
        };

        relationships.forEach(rel => {
            // Ensure emotion is a valid string key before counting
            if (rel.emotion && emotionCounts.hasOwnProperty(rel.emotion)) {
                emotionCounts[rel.emotion]++;
            } else {
                // Count relationships with no emotion or invalid emotion as neutral for the chart
                 emotionCounts.neutral++;
            }
        });


        // Destroy previous chart if exists
        if (window.sentimentChart) {
            window.sentimentChart.destroy();
        }

        window.sentimentChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Positive', 'Neutral', 'Negative'],
                datasets: [{
                    data: [emotionCounts.positive, emotionCounts.neutral, emotionCounts.negative],
                    backgroundColor: [
                        '#4CAF50', // Green
                        '#FFC107', // Amber/Yellow
                        '#F44336'  // Red
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                     tooltip: { enabled: true }
                }
            }
        });
    } else {
        console.warn("sentimentChart canvas or Chart.js not found.");
    }
}

function filterRelationships() {
    const categoryFilter = document.getElementById('relationship-category-filter');
    if (!categoryFilter) {
         console.warn("relationship-category-filter not found for filtering.");
         return;
    }
    const category = categoryFilter.value; // e.g., 'all', 'family', 'friends'
    const cards = document.querySelectorAll('#relationship-cards-container .relationship-card'); // Select cards within container

    cards.forEach(card => {
        // Check data-category attribute set during rendering
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}


// --- Relationships Modal Handling ---
function showRelationshipModal(relationshipId = null) {
    const modal = document.getElementById('relationship-modal');
    const form = document.getElementById('relationship-form');
    const titleElement = document.getElementById('relationship-modal-title');
    const tagsContainer = document.getElementById('relationship-tags-container');


    if (!modal || !form || !titleElement || !tagsContainer) {
        console.warn("Relationship modal, form, title, or tags container not found.");
        return;
    }

     // Reset form and tags container
    form.reset();
    tagsContainer.innerHTML = '';


    if (relationshipId) {
        // Edit mode - Fetch relationship data first
        titleElement.textContent = 'Edit Relationship';
        form.dataset.mode = 'edit';
        form.dataset.id = relationshipId; // Store ID

        // Fetch relationship data from Firestore
        const userId = auth.currentUser?.uid;
        if (!userId) {
             showToast('User not authenticated', 'error');
             hideRelationshipModal();
             return;
        }

        db.collection('users').doc(userId).collection('relationships').doc(relationshipId)
            .get()
            .then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    document.getElementById('relationship-name').value = data.name || '';
                    document.getElementById('relationship-category').value = data.category || '';
                    document.getElementById('relationship-importance').value = data.importance || 'medium';
                    document.getElementById('relationship-contact').value = data.contact || ''; // Contact info field?
                    document.getElementById('relationship-notes').value = data.notes || '';

                    // Set emotion radio button
                    const emotionValue = data.emotion || 'neutral'; // Default
                    const emotionRadio = form.querySelector(`input[name="emotion"][value="${emotionValue}"]`);
                    if (emotionRadio) emotionRadio.checked = true;

                    // Populate tags
                    const tags = Array.isArray(data.tags) ? data.tags : [];
                    tags.forEach(tag => {
                        addTagToRelationshipsContainer(tag, tagsContainer); // Use helper
                    });

                    modal.classList.add('active'); // Show modal after data is populated

                } else {
                    showToast('Relationship not found', 'error');
                    hideRelationshipModal();
                }
            })
            .catch(error => {
                console.error("Error fetching relationship for edit:", error);
                showToast('Failed to load relationship data', 'error');
                hideRelationshipModal();
            });

    } else {
        // Add mode
        titleElement.textContent = 'New Relationship';
        form.dataset.mode = 'add';
        delete form.dataset.id; // Ensure ID is not present
         // Set default emotion radio button
         const defaultEmotion = form.querySelector('input[name="emotion"][value="neutral"]');
         if (defaultEmotion) defaultEmotion.checked = true;

        modal.classList.add('active'); // Show modal immediately for add mode
    }
}

function hideRelationshipModal() {
    const modal = document.getElementById('relationship-modal');
     if (modal) {
        modal.classList.remove('active');
     }
}


// --- Interaction Modal Handling ---
function showInteractionModal(relationshipId) {
    const modal = document.getElementById('interaction-modal');
    const form = document.getElementById('interaction-form');
    const relationshipIdInput = document.getElementById('interaction-relationship-id');
    const interactionDateInput = document.getElementById('interaction-date');
    const followupCheckbox = document.getElementById('interaction-followup');
    const followupDateInput = document.getElementById('interaction-followup-date');


     if (!modal || !form || !relationshipIdInput || !interactionDateInput || !followupCheckbox || !followupDateInput) {
         console.warn("Interaction modal elements not found.");
         return;
     }

    // Set relationship ID on the form
    relationshipIdInput.value = relationshipId;

    // Set today's date as default for interaction date
    const today = new Date().toISOString().split('T')[0];
    interactionDateInput.value = today;

    // Reset form fields except relationship ID and date
     form.reset(); // Resets other fields like type, duration, notes, emotions, followup
     interactionDateInput.value = today; // Re-set date after reset

    // Reset followup state
     followupCheckbox.checked = false;
     followupDateInput.disabled = true;
     followupDateInput.value = '';


    modal.classList.add('active'); // Show the modal
}

function hideInteractionModal() {
    const modal = document.getElementById('interaction-modal');
     if (modal) {
        modal.classList.remove('active');
     }
}


// --- Save Functions (Relationships Module) ---
async function saveRelationship(e) {
    e.preventDefault();

    const form = e.target;
    const userId = auth.currentUser?.uid;
    if (!userId) {
        showToast('User not authenticated', 'error');
        return;
    }
    const mode = form.dataset.mode; // 'add' or 'edit'
    const relationshipId = form.dataset.id; // Only exists in 'edit' mode

    // Get form values
    const relationshipData = {
        name: document.getElementById('relationship-name').value.trim(),
        category: document.getElementById('relationship-category').value,
        importance: document.getElementById('relationship-importance').value || 'medium',
        contact: document.getElementById('relationship-contact').value.trim() || null, // Contact info field
        notes: document.getElementById('relationship-notes').value.trim() || null,
        emotion: form.querySelector('input[name="emotion"]:checked')?.value || 'neutral', // Ensure emotion is captured
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        tags: getTagsFromRelationshipsContainer(document.getElementById('relationship-tags-container')) // Use helper
    };

    // Basic validation
    if (!relationshipData.name || !relationshipData.category) {
        showToast('Name and Category are required', 'error');
        return;
    }

    try {
        if (mode === 'edit' && relationshipId) {
            // Update existing relationship
            await db.collection('users').doc(userId).collection('relationships').doc(relationshipId).update(relationshipData);
            showToast('Relationship updated successfully');
        } else {
            // Add new relationship
            relationshipData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            // Note: Firestore `add` automatically generates a unique ID

            await db.collection('users').doc(userId).collection('relationships').add(relationshipData);
            showToast('Relationship added successfully');
        }

        hideRelationshipModal();
        // UI update happens via snapshot listener on `loadRelationships`
    } catch (error) {
        console.error("Error saving relationship: ", error);
        showToast('Failed to save relationship', 'error');
    }
}

async function saveInteraction(e) {
    e.preventDefault();

    const form = e.target;
    const userId = auth.currentUser?.uid;
    if (!userId) {
        showToast('User not authenticated', 'error');
        return;
    }
    const relationshipId = document.getElementById('interaction-relationship-id')?.value;
    if (!relationshipId) {
        console.error("Relationship ID missing for saving interaction.");
        showToast('Error saving interaction: Missing relationship ID', 'error');
        return;
    }

    // Get form values
    const interactionData = {
        date: document.getElementById('interaction-date').value || null, // YYYY-MM-DD
        type: document.getElementById('interaction-type').value || null,
        duration: parseInt(document.getElementById('interaction-duration').value) || null, // duration in minutes?
        emotion: form.querySelector('input[name="interaction-emotion"]:checked')?.value || null, // Emotion related to interaction
        notes: document.getElementById('interaction-notes').value.trim() || null,
        followUp: document.getElementById('interaction-followup').checked || false,
        followUpDate: document.getElementById('interaction-followup').checked ?
            document.getElementById('interaction-followup-date').value || null : null, // YYYY-MM-DD
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Basic validation
    if (!interactionData.date || !interactionData.notes) {
        showToast('Interaction date and notes are required', 'error');
        return;
    }
    if (!interactionData.type) {
         showToast('Interaction type is required', 'error');
         return;
    }


    try {
        // Save interaction as a subcollection document
        await db.collection('users').doc(userId).collection('relationships').doc(relationshipId)
            .collection('interactions').add(interactionData);

        // Update last interaction date on the main relationship document
        // Use a transaction if updating the relationship document based on interaction data (e.g., recalculating average emotion)
        // For just updating the last interaction date, a simple update is often fine.
        await db.collection('users').doc(userId).collection('relationships').doc(relationshipId)
            .update({
                lastInteractionDate: firebase.firestore.FieldValue.serverTimestamp(), // Use server timestamp for consistency
                // Optionally update primary emotion on the relationship based on the latest interaction emotion
                // emotion: interactionData.emotion || 'neutral',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

        showToast('Interaction saved successfully');
        hideInteractionModal();
        // UI update for relationships list happens via snapshot listener on `loadRelationships`
        // The `lastInteractionDate` change will trigger it.
    } catch (error) {
        console.error("Error saving interaction: ", error);
        showToast('Failed to save interaction', 'error');
    }
}


// --- View/Delete Functions (Relationships Module) ---
function viewRelationshipDetails(relationshipId) {
    // In a complete implementation, this would show a detailed view
    // with all interactions, statistics, etc.
    showToast(`Feature: Detailed view for relationship ID: ${relationshipId}`);
    // You would typically fetch the relationship data by ID,
    // and then query the 'interactions' subcollection for that relationship.
    // Then render this data in a new page or a dedicated modal.
}

async function handleDeleteRelationship(relationshipId) {
     const userId = auth.currentUser?.uid;
      if (!userId) return;

     try {
         // Note: Deleting the relationship document does NOT automatically delete its subcollection documents (interactions).
         // You should handle deleting the subcollection explicitly using batch writes or callable Cloud Functions for production apps.
         // For a simple client-side app, you might just delete the main document and accept orphaned subcollection docs, or add a cleanup process.
         // For this example, we'll just delete the main document.

         await db.collection('users').doc(userId).collection('relationships').doc(relationshipId).delete();
         showToast('Relationship deleted successfully');
         // UI update happens via snapshot listener on `loadRelationships`
     } catch (error) {
         console.error('Error deleting relationship:', error);
         showToast('Failed to delete relationship', 'error');
     }
}


// --- Helper Functions (Relationships Module) ---
function formatCategory(category) {
    const categories = {
        'family': 'Family',
        'romantic': 'Romantic',
        'friends': 'Friends',
        'professional': 'Professional',
        'spiritual': 'Spiritual',
        'other': 'Other' // Added default 'other'
    };
    return categories[category] || category || 'Other'; // Default to 'Other' if category is null/unknown
}

function formatImportance(importance) {
    const levels = {
        'low': 'Low Importance',
        'medium': 'Medium Importance',
        'high': 'High Importance',
        'critical': 'Critical'
    };
    return levels[importance] || importance || 'Medium Importance'; // Default
}

function formatEmotion(emotion) {
    const emotions = {
        'positive': 'Positive',
        'neutral': 'Neutral',
        'negative': 'Negative'
    };
    return emotions[emotion] || emotion || 'Neutral'; // Default
}


// Helper to add a tag element to the relationships container
function addTagToRelationshipsContainer(tag, container) {
    if (!container || !tag) return;

     // Check if tag already exists to avoid duplicates
     const existingTags = Array.from(container.querySelectorAll('.tag')).map(el => el.textContent.trim().replace('×', ''));
     if (existingTags.includes(tag)) {
         return;
     }

    const tagElement = document.createElement('div');
    tagElement.className = 'tag';
    tagElement.innerHTML = `
        ${tag}
        <button class="tag-remove">&times;</button>
    `;
    container.appendChild(tagElement);

    // Listener for removing tag is handled by delegation in setupEventListeners
}

// Get Current Tags from the relationships UI container
function getTagsFromRelationshipsContainer(container) {
     if (!container) return [];
    const tags = [];
    container.querySelectorAll('.tag').forEach(tagElement => {
        const tagText = tagElement.textContent.replace('×', '').trim();
        if (tagText) {
            tags.push(tagText);
        }
    });
    return tags;
}


// ==================================
// 14. Spiritual Module
// ==================================

// Global Chart instances for Spiritual Module
let prayerFrequencyChart;
let prayerHistoryChart;

// Initialize Spiritual Module
function initSpiritual() {
    // Check if element exists
    if (document.getElementById('spiritual')) {
         console.log("Initializing Spiritual Module");
        // Load spiritual data - Called by handleAuthenticatedUser
        // setupEventListeners(); // Setup listeners immediately
        setupDefaultCharacterStudies(); // Setup default character data structure
        loadSpiritualData(); // This fetches data and updates UI
        setupEventListeners(); // Setup listeners after main element is confirmed
    } else {
        console.warn("initSpiritual called, but #spiritual element not found.");
    }
}

// Setup Event Listeners
function setupEventListeners() {
     // Check if main container exists
     const spiritualContainer = document.getElementById('spiritual');
      if (!spiritualContainer) {
          console.warn("Spiritual container not found. Skipping event listeners setup.");
          return;
      }


    // View selector
    const viewSelector = document.getElementById('spiritual-view-selector');
    if (viewSelector) {
         viewSelector.addEventListener('change', function() {
             switchSpiritualView(this.value);
         });
          // Set initial value if a view is active on load
         const activeView = spiritualContainer.querySelector('.spiritual-view-content.active');
         if (activeView && activeView.id) {
              viewSelector.value = activeView.id.replace('spiritual-', '');
         }
    }


    // Bible study actions (on Bible tab)
    const startPlanBtn = document.getElementById('start-plan');
    const markAsReadBtn = document.getElementById('mark-as-read');
    const addBibleNotesBtn = document.getElementById('add-notes'); // Existing button on tab
    const addNewBibleNoteBtn = document.getElementById('add-new-note'); // Button likely in notes list


    if (startPlanBtn) startPlanBtn.addEventListener('click', startBibleReadingPlan);
    if (markAsReadBtn) markAsReadBtn.addEventListener('click', markBibleReadingComplete);
    // These buttons now open the Bible Note Modal
    if (addBibleNotesBtn) addBibleNotesBtn.addEventListener('click', () => showBibleNoteModal());
    if (addNewBibleNoteBtn) addNewBibleNoteBtn.addEventListener('click', () => showBibleNoteModal());


    // Bible Note Modal buttons
    const cancelBibleNoteBtn = document.getElementById('cancel-bible-note');
    const bibleNoteForm = document.getElementById('bible-note-form');

    if (cancelBibleNoteBtn) cancelBibleNoteBtn.addEventListener('click', hideBibleNoteModal);
    if (bibleNoteForm) bibleNoteForm.addEventListener('submit', saveBibleNote);


    // Prayer life actions (on Prayer tab)
    const savePrayerBtn = document.getElementById('save-prayer');
    const prayerReminderBtn = document.getElementById('prayer-reminder');
    const prayerForm = document.getElementById('prayer-form'); // Assuming a form for prayers

    if (savePrayerBtn) savePrayerBtn.addEventListener('click', savePrayer);
    if (prayerReminderBtn) prayerReminderBtn.addEventListener('click', setPrayerReminder);


    // Evangelism actions (on Evangelism tab)
    const saveEvangelismBtn = document.getElementById('save-evangelism');
    const evangelismForm = document.getElementById('evangelism-form'); // Assuming a form for evangelism

     if (saveEvangelismBtn) saveEvangelismBtn.addEventListener('click', saveEvangelismRecord);


    // Character study cards (Delegation is better here as they might be dynamically rendered)
    const characterStudyContainer = document.getElementById('character-studies'); // Assuming container ID
    if (characterStudyContainer) {
         characterStudyContainer.addEventListener('click', (e) => {
              const card = e.target.closest('.character-card');
              if (card?.dataset.character) {
                   showCharacterStudyModal(card.dataset.character); // Open modal
              }
         });
    }
     // Character Study Modal Close Button
     const closeCharacterModalBtn = document.querySelector('#character-study-modal .close-modal');
     if (closeCharacterModalBtn) {
         closeCharacterModalBtn.addEventListener('click', hideCharacterStudyModal);
     }


    // Add activity button (This button needs to know which tab is active)
    const addSpiritualActivityBtn = document.getElementById('add-spiritual-activity');
    if (addSpiritualActivityBtn) {
        addSpiritualActivityBtn.addEventListener('click', handleAddSpiritualActivityClick);
    }

     // Add delegation listeners for dynamically rendered elements (Bible notes, Prayers, Evangelism entries, Challenges)
     spiritualContainer.addEventListener('click', (e) => {
         // Bible Note actions (Edit, Delete)
          if (e.target.closest('.bible-note .note-edit')) {
               const noteElement = e.target.closest('.bible-note');
               if (noteElement?.dataset.id) {
                   showBibleNoteModal(noteElement.dataset.id); // Pass note ID to open in edit mode
               }
          }
          if (e.target.closest('.bible-note .note-delete')) {
               const noteElement = e.target.closest('.bible-note');
               if (noteElement?.dataset.id) {
                    if (confirm('Are you sure you want to delete this Bible note?')) {
                       handleDeleteBibleNote(noteElement.dataset.id); // Pass note ID
                   }
               }
          }
         // Prayer Request actions (Mark Answered)
          if (e.target.closest('.prayer-request .request-answered')) {
              const requestElement = e.target.closest('.prayer-request');
               if (requestElement?.dataset.id) {
                   handleMarkPrayerAnswered(requestElement.dataset.id); // Pass prayer ID
               }
          }
          // Evangelism Entry actions (Edit, Delete - if implemented)
           // Challenge actions (View details? - if implemented)
     });


     // Add tags input for Bible Notes Modal
     const bibleNoteTagsInput = document.getElementById('bible-note-tags');
     const bibleNoteTagsContainer = document.getElementById('bible-note-tags-container');
     if (bibleNoteTagsInput && bibleNoteTagsContainer) {
          bibleNoteTagsInput.addEventListener('keydown', function(e) {
              if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  const tag = this.value.trim();
                  if (tag) {
                       addTagToContainer(tag, bibleNoteTagsContainer); // Use generic addTagToContainer helper
                      this.value = '';
                  }
              }
          });
           // Add listener for click on remove button (using delegation)
           bibleNoteTagsContainer.addEventListener('click', (e) => {
               if (e.target.classList.contains('tag-remove')) {
                   e.target.closest('.tag').remove();
               }
           });
     }
}

// Switch Spiritual View
function switchSpiritualView(view) {
    // Hide all views
    document.querySelectorAll('.spiritual-view-content').forEach(viewElement => {
        viewElement.classList.remove('active');
    });

    // Show selected view
    const targetView = document.getElementById(`spiritual-${view}`);
    if (targetView) {
        targetView.classList.add('active');
         console.log(`Switched Spiritual View to: ${view}`);
         // Optionally, trigger view-specific updates if needed
         // loadViewSpecificSpiritualData(view);
    } else {
        console.warn(`Spiritual view element not found for: ${view}`);
         // Default to dashboard or Bible view if not found
         const defaultView = document.getElementById('spiritual-bible'); // Assuming 'bible' is default
         if (defaultView) {
              defaultView.classList.add('active');
              document.getElementById('spiritual-view-selector').value = 'bible';
              console.log("Defaulted to Bible view.");
         }
    }
}

// Handle Add Spiritual Activity Button Click
function handleAddSpiritualActivityClick() {
    const activeView = document.querySelector('.spiritual-view-content.active');
    if (!activeView) {
         console.warn("No active spiritual view found to determine activity type.");
         showToast("Cannot add activity: Active view unknown.", "error");
        return;
    }

    const viewId = activeView.id; // e.g., 'spiritual-bible', 'spiritual-prayer'

    if (viewId === 'spiritual-bible') {
        showBibleNoteModal(); // Open modal to add a Bible note
    } else if (viewId === 'spiritual-prayer') {
         // Focus on the prayer text area to add a new prayer
         const prayerTextarea = document.getElementById('prayer-text');
          if (prayerTextarea) {
              prayerTextarea.focus();
              showToast('Enter your prayer below and save', 'info');
          } else {
               showToast('Prayer input area not found.', 'error');
          }
    } else if (viewId === 'spiritual-evangelism') {
         // Focus on the evangelism notes text area or open a dedicated add form modal if needed
         const evangelismNotesTextarea = document.getElementById('evangelism-notes'); // Assuming direct input
          if (evangelismNotesTextarea) {
               evangelismNotesTextarea.focus();
               showToast('Enter evangelism details and save', 'info');
          } else {
               showToast('Evangelism notes area not found.', 'error');
          }
    } else if (viewId === 'spiritual-characters') {
        showToast('Feature: Add new Character Study (requires content)', 'info');
        // Maybe open a modal to define a character study?
    }
    // Add logic for other views if they support adding activities
}


// Load Spiritual Data
function loadSpiritualData() {
     // Use the auth and db instances defined earlier
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Load bible reading data (realtime)
    db.collection('users').doc(userId).collection('bibleReading').doc('current')
        .onSnapshot(doc => {
            updateBibleReadingUI(doc.data());
        }, error => {
            console.error("Error loading bible reading data: ", error);
            showToast('Error loading bible reading progress', 'error');
        });

    // Load bible notes (realtime, limited)
    db.collection('users').doc(userId).collection('bibleNotes')
        .orderBy('createdAt', 'desc') // Order by creation date
        .limit(10) // Only load the 10 most recent
        .onSnapshot(snapshot => {
            const notesList = document.getElementById('bible-notes-list');
            if (!notesList) {
                console.warn("bible-notes-list not found.");
                return;
            }
            notesList.innerHTML = ''; // Clear existing notes

            if (snapshot.empty) {
                notesList.innerHTML = '<p>No Bible notes saved yet.</p>';
                return;
            }

            snapshot.forEach(doc => {
                const note = doc.data();
                const noteElement = createBibleNoteElement(doc.id, note);
                notesList.appendChild(noteElement);
            });
        }, error => {
            console.error("Error loading bible notes: ", error);
            showToast('Error loading Bible notes', 'error');
            const notesList = document.getElementById('bible-notes-list');
             if (notesList) notesList.innerHTML = '<p>Error loading Bible notes.</p>';
        });

    // Load prayer data (realtime, limited unanswered requests)
    db.collection('users').doc(userId).collection('prayers')
        .orderBy('date', 'desc') // Order by date
        // .where('answered', '==', false) // Filter only unanswered - depends on your UI design
        // Maybe load ALL prayers for stats, but only display a few recent ones or unanswered ones
        // For stats, let's load all
        .onSnapshot(snapshot => {
            const allPrayers = [];
            snapshot.forEach(doc => {
                 allPrayers.push({ id: doc.id, ...doc.data() });
            });

            // Separate into unanswered and answered (or just display recent)
            const unansweredRequests = allPrayers.filter(p => !p.answered).slice(0, 10); // Show recent 10 unanswered
             const recentPrayers = allPrayers.slice(0, 10); // Show 10 most recent overall

            const requestsList = document.getElementById('prayer-requests-list'); // Assuming this lists unanswered
            const historyList = document.getElementById('prayer-history-list'); // Assuming this lists recent or answered

            if (requestsList) {
                requestsList.innerHTML = '';
                if (unansweredRequests.length === 0) {
                    requestsList.innerHTML = '<p>No unanswered prayer requests.</p>';
                } else {
                    unansweredRequests.forEach(prayer => {
                        const prayerElement = createPrayerRequestElement(prayer.id, prayer);
                        requestsList.appendChild(prayerElement);
                    });
                }
            } else { console.warn("prayer-requests-list not found."); }

             if (historyList) {
                  historyList.innerHTML = ''; // Assuming a separate list for history/recent
                   recentPrayers.forEach(prayer => {
                       // You might create a different element style for history
                       const prayerElement = createPrayerRequestElement(prayer.id, prayer); // Reuse for simplicity
                        historyList.appendChild(prayerElement);
                   });
                   if (recentPrayers.length === 0) historyList.innerHTML = '<p>No recent prayer history.</p>';
             } else { console.warn("prayer-history-list not found."); }


            updatePrayerStats(allPrayers); // Calculate stats from ALL prayers
        }, error => {
            console.error("Error loading prayer data: ", error);
            showToast('Error loading prayer data', 'error');
             const requestsList = document.getElementById('prayer-requests-list');
              if (requestsList) requestsList.innerHTML = '<p>Error loading prayer requests.</p>';
        });

    // Load evangelism data (realtime, limited)
    db.collection('users').doc(userId).collection('evangelism')
        .orderBy('date', 'desc') // Order by date
        .limit(10) // Only load the 10 most recent
        .onSnapshot(snapshot => {
            const historyList = document.getElementById('evangelism-history-list');
             if (!historyList) {
                 console.warn("evangelism-history-list not found.");
                 return;
             }
            historyList.innerHTML = ''; // Clear existing entries

            let conversations = 0;
            let decisions = 0;
            const entries = [];

            snapshot.forEach(doc => {
                const entry = doc.data();
                 entries.push(entry);
                const entryElement = createEvangelismEntryElement(doc.id, entry); // Pass doc.id
                historyList.appendChild(entryElement);

                conversations++; // Count all entries as conversations
                if (entry.outcome === 'decision') {
                    decisions++;
                }
            });

             if (entries.length === 0) {
                 historyList.innerHTML = '<p>No evangelism records saved yet.</p>';
             }


            // Update stats display
            const conversationsCountEl = document.getElementById('conversations-count');
            const decisionsCountEl = document.getElementById('decisions-count');

            if (conversationsCountEl) conversationsCountEl.textContent = conversations;
            if (decisionsCountEl) decisionsCountEl.textContent = decisions;

        }, error => {
             console.error("Error loading evangelism data: ", error);
             showToast('Error loading evangelism data', 'error');
              const historyList = document.getElementById('evangelism-history-list');
              if (historyList) historyList.innerHTML = '<p>Error loading evangelism history.</p>';
        });

    // Load challenges (fetch once, not realtime unless challenges are updated frequently)
     // Assuming spiritualChallenges collection is global, not per user
     db.collection('spiritualChallenges')
        .where('active', '==', true) // Filter for active challenges
        .limit(3) // Show up to 3 active challenges
        .get() // Use get() for a single fetch
        .then(snapshot => {
            const challengesContainer = document.getElementById('current-challenges');
             if (!challengesContainer) {
                 console.warn("current-challenges container not found.");
                 return;
             }
            challengesContainer.innerHTML = ''; // Clear existing

             if (snapshot.empty) {
                 challengesContainer.innerHTML = '<p>No active spiritual challenges right now.</p>';
                 return;
             }

            snapshot.forEach(doc => {
                const challenge = doc.data();
                // Assuming challenge document includes 'title', 'description', 'target' fields
                // 'current' progress needs to be tracked per user. This requires a separate user-specific field or subcollection.
                // For now, let's assume challenge data includes example 'current' or calculate 0 progress if no user data linkage.
                 // A real implementation would likely need to fetch user progress for each challenge.
                const userChallengeProgress = 0; // Placeholder - need to fetch user data
                const challengeElement = createChallengeElement({ id: doc.id, ...challenge, current: userChallengeProgress });
                challengesContainer.appendChild(challengeElement);
            });
        })
        .catch(error => {
            console.error("Error loading challenges: ", error);
            showToast('Error loading challenges', 'error');
             const challengesContainer = document.getElementById('current-challenges');
             if (challengesContainer) challengesContainer.innerHTML = '<p>Error loading challenges.</p>';
        });
}

// Setup Default Character Studies (Initialize in memory)
function setupDefaultCharacterStudies() {
    // This function populates the global `biblicalCharacters` object in memory.
    // This data isn't fetched from Firestore in this implementation but is defined here.
    console.log("Setting up default biblical character studies.");
    window.biblicalCharacters = {
        jesus: {
            name: "Jesus Christ",
            title: "The Son of God",
            description: "The central figure of Christianity, whose life, death, and resurrection are the foundation of the Christian faith. Key aspects of His character include love, humility, obedience, compassion, truthfulness, and holiness.",
            progress: 0, // User's study progress on this character
            lessons: [ // Example key lessons
                {
                    title: "Humility and Service",
                    content: "Jesus demonstrated ultimate humility by washing His disciples' feet and serving others, showing that true leadership is service.",
                    reference: "John 13:1-17"
                },
                {
                    title: "Unconditional Love",
                    content: "Jesus showed love to outcasts, sinners, and even prayed for those who crucified Him, embodying sacrificial and unconditional love.",
                    reference: "Luke 23:34"
                },
                 {
                     title: "Obedience to the Father",
                     content: "Jesus perfectly obeyed the will of God the Father, even to death on the cross, providing a model of perfect submission and trust.",
                     reference: "Philippians 2:5-8"
                 }
            ],
             scriptures: [ // Example related scriptures
                 "Matthew", "Mark", "Luke", "John", "Philippians 2:5-11", "Hebrews 4:14-16"
             ]
        },
        david: {
            name: "King David",
            title: "A Man After God's Own Heart",
            description: "The second and greatest king of Israel. Known for his courage as a young shepherd (defeating Goliath), military leadership, beautiful psalms, deep repentance after sin, and establishing Jerusalem as the capital. His life shows both great faith and significant failure, highlighting God's grace and forgiveness.",
            progress: 0,
            lessons: [
                {
                    title: "Heart of Worship",
                    content: "David's psalms express the full range of human emotion in honest communication with God, demonstrating authentic relationship and deep worship.",
                    reference: "Psalm 23, Psalm 51"
                },
                {
                    title: "Repentance and Restoration",
                    content: "After his sin with Bathsheba and murder of Uriah, David responded with genuine, brokenhearted repentance, and God, while bringing consequences, did not abandon him.",
                    reference: "Psalm 51, 2 Samuel 12"
                },
                 {
                     title: "Faithfulness in Waiting",
                     content: "David was anointed king years before he actually took the throne, enduring persecution from Saul. His patience and trust in God during this time are noteworthy.",
                     reference: "1 Samuel 16-31"
                 }
            ],
             scriptures: [
                 "1 Samuel 16 - 2 Samuel 24", "1 Kings 1-2", "Psalms (many)"
             ]
        },
        moses: {
            name: "Moses",
            title: "The Deliverer and Lawgiver",
            description: "Chosen by God from an improbable beginning to lead the Israelites out of centuries of slavery in Egypt, through the wilderness for 40 years, and to the edge of the Promised Land. He was the recipient of the Ten Commandments and the Law, and a key intercessor for the people.",
            progress: 0,
            lessons: [
                {
                    title: "Overcoming Insecurity",
                    content: "Despite his initial reluctance and feelings of inadequacy (Exodus 3-4), Moses trusted God to empower and use him, showing that God's call comes with His provision.",
                    reference: "Exodus 3-4"
                },
                {
                    title: "Faithful Leadership",
                    content: "Moses faithfully led a stubborn and rebellious people, often interceding for them when God's wrath was kindled, demonstrating perseverance and compassion.",
                    reference: "Exodus 32:11-14, Numbers 14:13-20"
                },
                 {
                     title: "Intimacy with God",
                     content: "Moses had a unique relationship with God, speaking with Him 'face to face, as a man speaks with his friend,' highlighting the importance of personal relationship.",
                     reference: "Exodus 33:11"
                 }
            ],
             scriptures: [
                 "Exodus 1 - Deuteronomy 34", "Acts 7:20-44", "Hebrews 11:23-28"
             ]
        },
        daniel: {
            name: "Daniel",
            title: "The Faithful Exile and Prophet",
            description: "A young man exiled from Jerusalem to Babylon. He and his friends determined to remain faithful to God's commands in a foreign, pagan culture. Daniel rose to positions of influence in the Babylonian and Persian empires, known for his wisdom, integrity, and prophetic visions.",
            progress: 0,
            lessons: [
                {
                    title: "Faith Under Pressure",
                    content: "Daniel maintained his prayer routine even when a decree made it punishable by death, showing unwavering commitment to God above human law.",
                    reference: "Daniel 6"
                },
                {
                    title: "Integrity in the Workplace",
                    content: "Daniel consistently demonstrated exceptional competence and integrity in his government roles, earning respect even from pagan kings, showing how faith can be lived out professionally.",
                    reference: "Daniel 1:8-20, Daniel 6:1-4"
                },
                 {
                     title: "Wisdom and Discernment",
                     content: "God granted Daniel unique wisdom and the ability to interpret dreams and visions, demonstrating the importance of spiritual discernment in navigating complex situations.",
                     reference: "Daniel 2"
                 }
            ],
             scriptures: [
                 "Book of Daniel"
             ]
        },
         paul: {
             name: "Apostle Paul",
             title: "Apostle to the Gentiles",
             description: "Originally Saul, a persecutor of Christians, who had a dramatic conversion experience and became the most prolific writer of the New Testament and a tireless missionary, spreading Christianity throughout the Roman Empire. His life exemplifies transformation, dedication, and perseverance in the face of hardship.",
             progress: 0,
             lessons: [
                 {
                      title: "Transformation and Redemption",
                     content: "Paul's conversion from persecutor to passionate follower demonstrates God's power to transform anyone, regardless of their past.",
                     reference: "Acts 9, Galatians 1:13-24"
                 },
                 {
                      title: "Perseverance in Ministry",
                     content: "Paul endured immense suffering, imprisonment, and opposition for the sake of the gospel, illustrating unwavering commitment and reliance on God's strength.",
                     reference: "2 Corinthians 11:23-28, Philippians 4:12-13"
                 },
                 {
                      title: "Grace and Justification by Faith",
                     content: "Paul's writings deeply explore the concepts of God's grace and justification (being declared righteous) by faith in Jesus, not by works of the Law.",
                     reference: "Romans, Galatians"
                 }
             ],
              scriptures: [
                 "Acts 9, 13-28", "Romans", "1 & 2 Corinthians", "Galatians", "Ephesians",
                 "Philippians", "Colossians", "1 & 2 Thessalonians", "1 & 2 Timothy",
                 "Titus", "Philemon"
              ]
         }
    };

     // Render the default character cards if on the spiritual page and container exists
     const characterContainer = document.getElementById('character-studies');
     if (characterContainer) {
         renderCharacterCards(window.biblicalCharacters);
     }
}

// Render Character Study Cards
function renderCharacterCards(characters) {
    const container = document.getElementById('character-studies');
    if (!container) {
        console.warn("character-studies container not found for rendering.");
        return;
    }
    container.innerHTML = ''; // Clear existing

     for (const charId in characters) {
         if (characters.hasOwnProperty(charId)) {
             const character = characters[charId];
             const card = document.createElement('div');
             card.className = 'character-card';
             card.dataset.character = charId; // Store character ID


              // Simulate progress (ideally loaded from user data)
             const simulatedProgress = Math.round(Math.random() * 100); // Example simulated progress
             character.progress = simulatedProgress; // Update progress in memory for display


             card.innerHTML = `
                 <div class="character-image">
                      <i class="fas fa-user-circle"></i> <!-- Placeholder Icon -->
                 </div>
                 <div class="character-info">
                     <h4>${character.name}</h4>
                     <p>${character.title}</p>
                      <div class="character-progress">
                          <div class="progress-bar">
                              <div class="progress-fill" style="width: ${Math.min(100, character.progress)}%;"></div>
                          </div>
                           <span>${character.progress}%</span>
                      </div>
                 </div>
             `;
             // Event listener is handled by delegation
             container.appendChild(card);
         }
     }
}


function updateBibleReadingUI(data) {
    // Ensure elements exist before updating
    const planSelector = document.getElementById('bible-plan-selector');
    const percentageEl = document.getElementById('bible-reading-percentage');
    const progressBarFill = document.getElementById('bible-reading-progress'); // Assuming this is the fill div
    const currentBookEl = document.getElementById('current-bible-book');
    const lastReadEl = document.getElementById('last-bible-reading');
    const todaysReadingArea = document.getElementById('todays-reading-passage');
    const streakEl = document.getElementById('bible-streak');
    const overallPercentageEl = document.getElementById('bible-percentage'); // Assuming overall year progress
    const overallProgressBarFill = document.getElementById('bible-progress-fill'); // Assuming overall fill div


    if (!data) {
        // Reset UI if no data
         if (planSelector) planSelector.value = '';
         if (percentageEl) percentageEl.textContent = '0% Complete';
         if (progressBarFill) progressBarFill.style.width = '0%';
         if (currentBookEl) currentBookEl.textContent = 'No Plan Selected';
         if (lastReadEl) lastReadEl.textContent = 'N/A';
         if (todaysReadingArea) todaysReadingArea.innerHTML = '<h4>Today\'s Reading</h4><p>Select a plan or manually add passage.</p>';
         if (streakEl) streakEl.textContent = '0';
         if (overallPercentageEl) overallPercentageEl.textContent = '0%';
         if (overallProgressBarFill) overallProgressBarFill.style.width = '0%';
        return;
    }


    if (planSelector && data.plan) {
        planSelector.value = data.plan;
    }

    const readingProgress = data.progress ?? 0; // Use nullish coalescing
    if (percentageEl) percentageEl.textContent = `${Math.round(readingProgress * 100)}% Complete`;
    if (progressBarFill) progressBarFill.style.width = `${Math.min(100, Math.round(readingProgress * 100))}%`; // Cap at 100%

    if (currentBookEl) currentBookEl.textContent = data.currentBook || 'No Plan Selected';

    if (lastReadEl && data.lastRead) {
        const lastReadDate = data.lastRead.toDate ? data.lastRead.toDate() : new Date(data.lastRead); // Handle Timestamp or other formats
        if (!isNaN(lastReadDate.getTime())) {
            lastReadEl.textContent = lastReadDate.toLocaleDateString();
        } else {
            lastReadEl.textContent = 'Invalid Date';
        }
    } else if (lastReadEl) {
        lastReadEl.textContent = 'Never';
    }


    if (todaysReadingArea && data.todayReading) {
        todaysReadingArea.innerHTML = `
            <h4>${data.todayReading.reference || 'Today\'s Reading'}</h4>
            <p>${data.todayReading.passage || 'No passage loaded for today.'}</p>
        `;
    } else if (todaysReadingArea) {
        todaysReadingArea.innerHTML = '<h4>Today\'s Reading</h4><p>No reading assigned for today.</p>';
    }


    if (streakEl) streakEl.textContent = data.streak || 0; // Display streak


    const yearProgress = data.yearProgress ?? 0; // Assuming yearProgress is 0-1
    if (overallPercentageEl) overallPercentageEl.textContent = `${Math.round(yearProgress * 100)}%`;
    if (overallProgressBarFill) overallProgressBarFill.style.width = `${Math.min(100, Math.round(yearProgress * 100))}%`;

}

// Update Prayer Statistics display and charts
function updatePrayerStats(allPrayers) {
    // Ensure elements exist
    const totalPrayersEl = document.getElementById('total-prayers');
    const answeredPrayersEl = document.getElementById('answered-prayers');
     const intercessionCountEl = document.getElementById('intercession-count');
     const thanksgivingCountEl = document.getElementById('thanksgiving-count');
     const supplicationCountEl = document.getElementById('supplication-count');
     const praiseCountEl = document.getElementById('praise-count');
     const prayerStreakEl = document.getElementById('prayer-streak'); // If tracking prayer streak
     const weeklyPrayerCountEl = document.getElementById('prayer-count'); // If tracking weekly count


     if (totalPrayersEl) totalPrayersEl.textContent = allPrayers.length;

    let answered = 0;
    const types = {
        intercession: 0,
        thanksgiving: 0,
        supplication: 0,
        praise: 0,
         other: 0
    };

    allPrayers.forEach(prayer => {
        if (prayer.answered) {
            answered++;
        }
        // Count types
        const typeKey = prayer.type?.toLowerCase() || 'other';
        if (types.hasOwnProperty(typeKey)) {
            types[typeKey]++;
        } else {
             types.other++;
        }
    });

     if (answeredPrayersEl) answeredPrayersEl.textContent = answered;

     if (intercessionCountEl) intercessionCountEl.textContent = types.intercession;
     if (thanksgivingCountEl) thanksgivingCountEl.textContent = types.thanksgiving;
     if (supplicationCountEl) supplicationCountEl.textContent = types.supplication;
     if (praiseCountEl) praiseCountEl.textContent = types.praise;
     // If you have elements for other/total type counts, update them too


     // Streak and Weekly count require analyzing dates from `allPrayers` array
     // Calculate streak (similar logic to Reflection streak)
     const today = new Date();
     today.setHours(0,0,0,0);
     let prayerStreak = 0;
     let checkDate = new Date(today);
     checkDate.setHours(0,0,0,0);
     const prayerDates = allPrayers
         .map(p => p.date?.toDate ? p.date.toDate().toISOString().split('T')[0] : (p.date ? new Date(p.date).toISOString().split('T')[0] : null))
         .filter(date => date) // Remove null dates
         .filter((value, index, self) => self.indexOf(value) === index) // Get unique dates
         .sort(); // Sort ascending

     while(true) {
          const dateStr = checkDate.toISOString().split('T')[0];
          if (prayerDates.includes(dateStr)) {
              prayerStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
          } else if (dateStr === today.toISOString().split('T')[0]) {
               // If today doesn't have an entry, streak is broken unless yesterday has one
               const yesterday = new Date(today);
               yesterday.setDate(yesterday.getDate() - 1);
               const yesterdayStr = yesterday.toISOString().split('T')[0];
                if (!prayerDates.includes(today.toISOString().split('T')[0]) && prayerDates.includes(yesterdayStr)) {
                   // Streak ended yesterday. Calculate streak ending yesterday.
                   let tempStreak = 0;
                   let tempCheckDate = new Date(yesterday);
                   tempCheckDate.setHours(0,0,0,0);
                   while(true) {
                       const tempDateStr = tempCheckDate.toISOString().split('T')[0];
                       if (prayerDates.includes(tempDateStr)) {
                            tempStreak++;
                            tempCheckDate.setDate(tempCheckDate.getDate() - 1);
                       } else {
                           break;
                       }
                   }
                    prayerStreak = tempStreak;
                } else {
                    // Neither today nor yesterday have entries, streak is 0
                    prayerStreak = 0;
                }
               break; // Stop checking after handling today/yesterday
          } else {
              break; // Streak broken
          }
     }


     // Calculate weekly count (last 7 days)
     const sevenDaysAgo = new Date(today);
     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
     const weeklyPrayers = allPrayers.filter(prayer => {
          if (prayer.date) {
               const dateObj = prayer.date.toDate ? prayer.date.toDate() : new Date(prayer.date);
               return !isNaN(dateObj.getTime()) && dateObj >= sevenDaysAgo && dateObj <= today; // >= 7 days ago, up to and including today
          }
          return false;
     }).length;


     if (prayerStreakEl) prayerStreakEl.textContent = prayerStreak;
     if (weeklyPrayerCountEl) weeklyPrayerCountEl.textContent = weeklyPrayers;


    // Update charts
    updatePrayerCharts(allPrayers); // Pass all prayer data to potentially use for charts
}

// Update Prayer Charts (using data from updatePrayerStats)
function updatePrayerCharts(allPrayers) {
     if (typeof Chart === 'undefined') {
         console.error("Chart.js is not loaded. Skipping prayer chart initialization.");
         return;
     }

    // Frequency chart (e.g., prayers per day of week)
     const frequencyCtx = document.getElementById('prayerFrequencyChart')?.getContext('2d');
     if (frequencyCtx) {
         if (window.prayerFrequencyChart) {
             window.prayerFrequencyChart.destroy();
         }

         // Calculate prayers per day of week for recent period (e.g., last 30 days)
         const thirtyDaysAgo = new Date();
         thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
         thirtyDaysAgo.setHours(0,0,0,0);

         const prayersLast30Days = allPrayers.filter(prayer => {
             if (prayer.date) {
                  const dateObj = prayer.date.toDate ? prayer.date.toDate() : new Date(prayer.date);
                  return !isNaN(dateObj.getTime()) && dateObj >= thirtyDaysAgo;
             }
             return false;
         });

         const dayOfWeekCounts = {
             0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 // Sunday=0, Monday=1, etc.
         };

          prayersLast30Days.forEach(prayer => {
              const dateObj = prayer.date.toDate ? prayer.date.toDate() : new Date(prayer.date);
               if (!isNaN(dateObj.getTime())) {
                    dayOfWeekCounts[dateObj.getDay()]++;
               }
          });

         // Chart labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
         // Chart data: Needs to be ordered by day of week starting Monday
         const orderedDays = [1, 2, 3, 4, 5, 6, 0]; // Monday to Sunday
         const dataOrderedByDay = orderedDays.map(dayIndex => dayOfWeekCounts[dayIndex]);
         const labelsOrdered = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];


         window.prayerFrequencyChart = new Chart(frequencyCtx, {
             type: 'bar',
             data: {
                 labels: labelsOrdered,
                 datasets: [{
                     label: 'Prayers (Last 30 Days)',
                     data: dataOrderedByDay,
                     backgroundColor: 'rgba(98, 0, 234, 0.7)'
                 }]
             },
             options: {
                 responsive: true,
                 maintainAspectRatio: false,
                 scales: {
                     y: {
                         beginAtZero: true,
                          ticks: { stepSize: 1, callback: (value) => Number.isInteger(value) ? value : '' }
                     },
                      x: { grid: { display: false } }
                 },
                  plugins: {
                       legend: { display: true },
                       tooltip: { enabled: true }
                  }
             }
         });
     } else {
          console.warn("prayerFrequencyChart canvas or Chart.js not found.");
     }


    // History chart (e.g., prayers per month over the last year)
     const historyCtx = document.getElementById('prayerHistoryChart')?.getContext('2d');
     if (historyCtx) {
         if (window.prayerHistoryChart) {
             window.prayerHistoryChart.destroy();
         }

          // Calculate prayers per month for the last 12 months
          const now = new Date();
          const twelveMonthsAgo = new Date(now);
          twelveMonthsAgo.setMonth(now.getMonth() - 11); // Go back 11 months to include the current month + 11 previous
          twelveMonthsAgo.setDate(1); // Start from the 1st of that month
          twelveMonthsAgo.setHours(0,0,0,0);

          const monthlyCounts = {};
          const monthLabels = [];

          // Initialize counts and labels for the last 12 months
          for (let i = 0; i < 12; i++) {
               const date = new Date(twelveMonthsAgo);
               date.setMonth(twelveMonthsAgo.getMonth() + i);
               const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`; // e.g., "2023-10"
               monthlyCounts[monthKey] = 0;
               monthLabels.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
          }


          allPrayers.forEach(prayer => {
              if (prayer.date) {
                  const dateObj = prayer.date.toDate ? prayer.date.toDate() : new Date(prayer.date);
                   if (!isNaN(dateObj.getTime()) && dateObj >= twelveMonthsAgo && dateObj <= now) {
                        const monthKey = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}`;
                         if (monthlyCounts.hasOwnProperty(monthKey)) {
                              monthlyCounts[monthKey]++;
                         }
                   }
              }
          });

          const dataOrderedByMonth = Object.values(monthlyCounts);


         window.prayerHistoryChart = new Chart(historyCtx, {
             type: 'line',
             data: {
                 labels: monthLabels,
                 datasets: [{
                     label: 'Prayers per Month',
                     data: dataOrderedByMonth,
                     borderColor: 'rgba(98, 0, 234, 1)',
                     backgroundColor: 'rgba(98, 0, 234, 0.1)',
                     fill: true,
                      tension: 0.3
                 }]
             },
             options: {
                 responsive: true,
                 maintainAspectRatio: false,
                  scales: {
                       y: {
                           beginAtZero: true,
                            ticks: { stepSize: 1, callback: (value) => Number.isInteger(value) ? value : '' }
                       },
                        x: { grid: { display: false } }
                  },
                  plugins: {
                       legend: { display: true },
                       tooltip: { enabled: true }
                  }
             }
         });
     } else {
          console.warn("prayerHistoryChart canvas or Chart.js not found.");
     }
}


// --- Bible Study Actions ---
function startBibleReadingPlan() {
    const planSelector = document.getElementById('bible-plan-selector');
     if (!planSelector) {
         showToast('Bible plan selector not found', 'error');
         return;
     }
    const plan = planSelector.value;

    if (!plan) {
        showToast('Please select a reading plan', 'warning');
        return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) {
        showToast('User not authenticated', 'error');
        return;
    }

    // In a full implementation, this would load the plan details (e.g., passages for each day)
    // and store the plan structure or reference under the user's bibleReading document.
    // For now, we'll just save the selected plan name and reset progress.

    // IMPORTANT: This will overwrite any existing plan data under /users/{userId}/bibleReading/current
    // Add confirmation or more sophisticated handling if needed.
    if (!confirm(`Are you sure you want to start the "${plan}" reading plan? This will reset your current Bible reading progress.`)) {
         return;
    }

    db.collection('users').doc(userId).collection('bibleReading').doc('current').set({
        plan: plan,
        startedAt: firebase.firestore.FieldValue.serverTimestamp(),
        progress: 0, // Reset progress
        streak: 0, // Reset streak
        lastRead: null, // Reset last read date
        todayReading: null // Clear today's reading
    })
    .then(() => {
        showToast(`Started "${plan}" reading plan!`);
        // Ideally, load the first day's reading passage here
        // loadTodaysBibleReading(userId, plan); // Need to implement
    })
    .catch(error => {
        console.error("Error starting reading plan: ", error);
        showToast('Failed to start reading plan', 'error');
    });
}

// Placeholder for loading today's reading passage based on plan
// async function loadTodaysBibleReading(userId, plan) {
//     // Logic to determine today's passage based on the plan and user's progress
//     // Fetch plan details (if stored separately) and user progress
//     // Find the correct passage for today
//     // Update the /users/{userId}/bibleReading/current document with todayReading field
// }


async function markBibleReadingComplete() {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        showToast('User not authenticated', 'error');
        return;
    }

    // In a full implementation, this would verify that the user actually read today's passage
    // and update the plan-specific progress (e.g., increment day count in a 365-day plan).
    // It would also update the streak and last read date.
    // For now, we'll just update the streak and last read date.

     const currentReadingRef = db.collection('users').doc(userId).collection('bibleReading').doc('current');

     try {
         // Fetch current data to update streak correctly
         const doc = await currentReadingRef.get();
         const data = doc.exists ? doc.data() : { streak: 0, lastRead: null };
         const lastReadDate = data.lastRead?.toDate ? data.lastRead.toDate() : null; // Handle Timestamp


         let newStreak = data.streak || 0;
         const today = new Date();
         today.setHours(0,0,0,0);
         const todayStr = today.toISOString().split('T')[0];

         if (lastReadDate) {
             const lastReadStr = new Date(lastReadDate).toISOString().split('T')[0];
             const yesterday = new Date(today);
             yesterday.setDate(yesterday.getDate() - 1);
             const yesterdayStr = yesterday.toISOString().split('T')[0];

              if (lastReadStr === todayStr) {
                  // Already marked complete today, do nothing or inform user
                  showToast("You've already marked today's reading complete!", 'info');
                  return;
              } else if (lastReadStr === yesterdayStr) {
                  // Completed yesterday, this extends the streak
                   newStreak++;
              } else {
                  // Gap since last completion, start a new streak
                   newStreak = 1;
              }
         } else {
             // First time marking complete
             newStreak = 1;
         }


         await currentReadingRef.update({
             lastRead: firebase.firestore.FieldValue.serverTimestamp(),
             streak: newStreak,
             // Also update plan progress here based on your plan tracking logic
             // e.g., progress: firebase.firestore.FieldValue.increment(1/totalDaysInPlan)
             updatedAt: firebase.firestore.FieldValue.serverTimestamp()
         });

         showToast('Marked today\'s reading as complete!');
         // UI update happens via snapshot listener
     } catch (error) {
         console.error("Error marking reading complete: ", error);
         showToast('Failed to mark reading complete', 'error');
     }
}

// --- Bible Notes Modal ---
function showBibleNoteModal(noteId = null) {
    const modal = document.getElementById('bible-note-modal');
    const form = document.getElementById('bible-note-form');
    const titleElement = document.getElementById('bible-note-modal-title');
    const noteIdInput = document.getElementById('bible-note-id');
     const tagsContainer = document.getElementById('bible-note-tags-container');


    if (!modal || !form || !titleElement || !noteIdInput || !tagsContainer) {
         console.warn("Bible note modal elements not found.");
        return;
    }

     // Reset form and tags
    form.reset();
     tagsContainer.innerHTML = '';


    if (noteId) {
        // Edit mode - Fetch note data first
        titleElement.textContent = 'Edit Bible Note';
        form.dataset.mode = 'edit';
        noteIdInput.value = noteId; // Store ID

        // Fetch note data from Firestore
        const userId = auth.currentUser?.uid;
        if (!userId) {
             showToast('User not authenticated', 'error');
             hideBibleNoteModal();
             return;
        }

        db.collection('users').doc(userId).collection('bibleNotes').doc(noteId)
            .get()
            .then(doc => {
                if (doc.exists) {
                    const note = doc.data();
                    document.getElementById('bible-note-reference').value = note.reference || '';
                    document.getElementById('bible-note-title').value = note.title || '';
                    document.getElementById('bible-note-content').value = note.content || '';

                     // Populate tags
                     const tags = Array.isArray(note.tags) ? note.tags : [];
                     tags.forEach(tag => {
                         addTagToContainer(tag, tagsContainer); // Use generic helper
                     });


                    modal.classList.add('active'); // Show modal after data is populated

                } else {
                    showToast('Bible note not found', 'error');
                    hideBibleNoteModal();
                }
            })
            .catch(error => {
                console.error("Error fetching bible note for edit: ", error);
                showToast('Failed to load Bible note', 'error');
                hideBibleNoteModal();
            });

    } else {
        // Add mode
        titleElement.textContent = 'New Bible Note';
        form.dataset.mode = 'add';
        noteIdInput.value = ''; // Clear ID
        modal.classList.add('active'); // Show modal immediately
    }
}

function hideBibleNoteModal() {
    const modal = document.getElementById('bible-note-modal');
     if (modal) {
        modal.classList.remove('active');
     }
}


// --- Save Functions (Spiritual Module) ---
async function saveBibleNote(e) {
    e.preventDefault();

    const form = e.target;
    const userId = auth.currentUser?.uid;
    if (!userId) {
        showToast('User not authenticated', 'error');
        return;
    }
    const mode = form.dataset.mode; // 'add' or 'edit'
    const noteId = document.getElementById('bible-note-id')?.value; // Exists in 'edit' mode

    // Get form values
    const noteData = {
        reference: document.getElementById('bible-note-reference').value.trim(),
        title: document.getElementById('bible-note-title').value.trim(),
        content: document.getElementById('bible-note-content').value.trim(),
        tags: getTagsFromContainer(document.getElementById('bible-note-tags-container')), // Use generic helper
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Basic validation
    if (!noteData.reference || !noteData.title || !noteData.content) {
        showToast('Reference, Title, and Content are required for notes', 'error');
        return;
    }

    try {
        if (mode === 'edit' && noteId) {
            // Update existing note
            await db.collection('users').doc(userId).collection('bibleNotes').doc(noteId).update(noteData);
            showToast('Bible note updated successfully');
        } else {
            // Add new note
            noteData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            // Note: Firestore `add` automatically generates a unique ID

            await db.collection('users').doc(userId).collection('bibleNotes').add(noteData);
            showToast('Bible note added successfully');
        }

        hideBibleNoteModal();
        // UI update happens via snapshot listener on `loadSpiritualData`
    } catch (error) {
        console.error("Error saving bible note: ", error);
        showToast('Failed to save note', 'error');
    }
}


async function savePrayer(e) {
     e.preventDefault(); // Prevent default form submission if using a form

    const prayerTextarea = document.getElementById('prayer-text');
    if (!prayerTextarea) {
         console.warn("Prayer textarea not found.");
         return;
    }

    const prayerText = prayerTextarea.value.trim();
    if (!prayerText) {
        showToast('Please enter your prayer', 'warning');
        return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) {
        showToast('User not authenticated', 'error');
        return;
    }

    // Assuming a simple add prayer action from a textarea
    const prayerData = {
        content: prayerText,
        type: 'supplication', // Default type, add a selector for types if needed
        date: firebase.firestore.FieldValue.serverTimestamp(), // Use server timestamp
        answered: false, // Default status
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection('users').doc(userId).collection('prayers').add(prayerData);
        prayerTextarea.value = ''; // Clear textarea on success
        showToast('Prayer saved!');
        // UI updates happen via snapshot listener
    } catch (error) {
        console.error("Error saving prayer: ", error);
        showToast('Failed to save prayer', 'error');
    }
}

function setPrayerReminder() {
     showToast('Feature: Set Prayer Reminder');
    // This would typically integrate with a notification system (browser, push notifications)
    // Requires user permission and possibly server-side logic for push notifications.
}

async function saveEvangelismRecord(e) {
    e.preventDefault();

    const form = e.target; // Assuming this is a form for evangelism records
     if (!form) {
         console.warn("Evangelism form not found.");
         return;
     }

    const dateInput = document.getElementById('evangelism-date');
    const typeInput = document.getElementById('evangelism-type');
    const notesInput = document.getElementById('evangelism-notes');
    const outcomeInput = document.getElementById('evangelism-outcome');

     if (!dateInput || !typeInput || !notesInput || !outcomeInput) {
          console.warn("Evangelism form inputs not found.");
          return;
     }


    const date = dateInput.value; // YYYY-MM-DD
    const type = typeInput.value;
    const notes = notesInput.value.trim();
    const outcome = outcomeInput.value;

    if (!date || !notes) {
        showToast('Date and notes are required for Evangelism record', 'error');
        return;
    }
    if (!type) {
         showToast('Evangelism type is required', 'error');
         return;
    }
    if (!outcome) {
         showToast('Evangelism outcome is required', 'error');
         return;
    }


    const userId = auth.currentUser?.uid;
    if (!userId) {
        showToast('User not authenticated', 'error');
        return;
    }

    const recordData = {
        date: new Date(date), // Store as Date object or Firestore Timestamp
        type: type,
        notes: notes,
        outcome: outcome,
        recordedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection('users').doc(userId).collection('evangelism').add(recordData);
        form.reset(); // Clear form on success
        showToast('Evangelism record saved!');
        // UI updates happen via snapshot listener
    } catch (error) {
        console.error("Error saving evangelism record: ", error);
        showToast('Failed to save record', 'error');
    }
}


// --- Render Element Helpers (Spiritual Module) ---
function createBibleNoteElement(noteId, note) {
    const element = document.createElement('div');
    element.className = 'bible-note';
    element.dataset.id = noteId; // Store Firestore document ID


    element.innerHTML = `
        <h4>
            ${note.title || 'Unnamed Note'}
            <span class="note-reference">${note.reference || 'No Reference'}</span>
        </h4>
        <div class="note-content">${note.content ? (note.content.substring(0, 200) + (note.content.length > 200 ? '...' : '')) : 'No content'}</div>
        ${Array.isArray(note.tags) && note.tags.length > 0 ? `
            <div class="note-tags">
                ${note.tags.map(tag => `<span class="note-tag">${tag}</span>`).join('')}
            </div>
        ` : ''}
        <div class="note-actions">
            <button class="btn btn-sm btn-icon note-edit" data-id="${noteId}" title="Edit Note">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-icon note-delete" data-id="${noteId}" title="Delete Note">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    // Event listeners are handled by delegation in setupEventListeners

    return element;
}


function createPrayerRequestElement(prayerId, prayer) {
    const element = document.createElement('div');
    element.className = 'prayer-request';
     // Add data-id for actions
     element.dataset.id = prayerId;

    if (prayer.answered) {
        element.classList.add('answered');
    } else {
        element.classList.add('unanswered');
    }

    const prayerDate = prayer.date ? (prayer.date.toDate ? prayer.date.toDate().toLocaleDateString() : new Date(prayer.date).toLocaleDateString()) : 'No date'; // Handle Timestamp or Date

    element.innerHTML = `
        <h5>
            ${prayer.type ? formatPrayerType(prayer.type) : 'Prayer'}
            <span class="request-date">${prayerDate}</span>
        </h5>
        <div class="request-content">${prayer.content ? (prayer.content.substring(0, 200) + (prayer.content.length > 200 ? '...' : '')) : 'No content'}</div>
        <div class="request-actions">
            ${!prayer.answered ? `
                <button class="btn btn-sm btn-icon request-answered" data-id="${prayerId}" title="Mark Answered">
                    <i class="fas fa-check"></i> Mark Answered
                </button>
            ` : '<span class="answered-status">Answered</span>'}
             <button class="btn btn-sm btn-icon request-delete" data-id="${prayerId}" title="Delete Prayer">
                 <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    // Add delete listener directly (mark answered handled by delegation)
     element.querySelector('.request-delete')?.addEventListener('click', (e) => {
         e.stopPropagation();
          if (confirm('Are you sure you want to delete this prayer record?')) {
             handleDeletePrayer(prayerId);
          }
     });


    return element;
}

function createEvangelismEntryElement(entryId, entry) { // Pass entryId if needed for delete
    const element = document.createElement('div');
    element.className = 'evangelism-entry';
     element.dataset.id = entryId; // Store ID if needed

    const entryDate = entry.date ? (entry.date.toDate ? entry.date.toDate().toLocaleDateString() : new Date(entry.date).toLocaleDateString()) : 'No date'; // Handle Timestamp or Date

    element.innerHTML = `
        <h5>
            ${entry.type ? formatEvangelismType(entry.type) : 'Evangelism Record'}
            <span class="entry-date">${entryDate}</span>
        </h5>
        <div class="entry-content">${entry.notes ? (entry.notes.substring(0, 200) + (entry.notes.length > 200 ? '...' : '')) : 'No notes'}</div>
        <div class="entry-outcome ${entry.outcome || 'unknown'}">${formatEvangelismOutcome(entry.outcome)}</div>
         <div class="entry-actions">
            <button class="btn btn-sm btn-icon entry-delete" data-id="${entryId}" title="Delete Record">
                 <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
     // Add delete listener directly (edit if implemented would be similar)
      element.querySelector('.entry-delete')?.addEventListener('click', (e) => {
          e.stopPropagation();
           if (confirm('Are you sure you want to delete this evangelism record?')) {
              handleDeleteEvangelismRecord(entryId);
           }
      });

    return element;
}

function createChallengeElement(challenge) {
    const element = document.createElement('div');
    element.className = 'challenge-card';
     element.dataset.id = challenge.id; // Store ID if from Firestore


    // Ensure challenge has target and current progress is a number
    const target = challenge.target ?? 1; // Default target to 1 to avoid division by zero
    const current = challenge.current ?? 0;
    const progressPercentage = target > 0 ? Math.round((current / target) * 100) : 0;

    element.innerHTML = `
        <h4>${challenge.title || 'Unnamed Challenge'}</h4>
        <p>${challenge.description ? (challenge.description.substring(0, 100) + (challenge.description.length > 100 ? '...' : '')) : 'No description'}</p>
        <div class="challenge-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min(100, progressPercentage)}%"></div>
            </div>
            <span>${progressPercentage}%</span>
        </div>
         <div class="challenge-actions">
             <button class="btn btn-sm btn-icon challenge-view" data-id="${challenge.id}" title="View Challenge">
                 <i class="fas fa-eye"></i>
             </button>
              <button class="btn btn-sm btn-icon challenge-update" data-id="${challenge.id}" title="Update Progress">
                 <i class="fas fa-sync-alt"></i>
             </button>
         </div>
    `;
     // Add view/update listeners directly
      element.querySelector('.challenge-view')?.addEventListener('click', (e) => {
          e.stopPropagation();
          handleViewChallenge(challenge.id);
      });
       element.querySelector('.challenge-update')?.addEventListener('click', (e) => {
          e.stopPropagation();
          handleUpdateChallengeProgress(challenge.id);
      });


    return element;
}


// --- View/Delete/Update Actions (Spiritual Module) ---

// Handle Mark Prayer Answered
async function handleMarkPrayerAnswered(prayerId) {
     const userId = auth.currentUser?.uid;
     if (!userId) return;

     try {
         await db.collection('users').doc(userId).collection('prayers').doc(prayerId).update({
             answered: true,
             answeredAt: firebase.firestore.FieldValue.serverTimestamp(),
             updatedAt: firebase.firestore.FieldValue.serverTimestamp() // Update general updated timestamp
         });
         showToast('Prayer marked as answered!');
         // UI update via snapshot listener
     } catch (error) {
         console.error("Error marking prayer answered: ", error);
         showToast('Failed to update prayer', 'error');
     }
}

// Handle Delete Actions
async function handleDeleteBibleNote(noteId) {
     const userId = auth.currentUser?.uid;
      if (!userId) return;
     if (!confirm('Are you sure you want to delete this Bible note?')) {
         return;
     }

     try {
         await db.collection('users').doc(userId).collection('bibleNotes').doc(noteId).delete();
         showToast('Bible note deleted successfully');
          // UI update via snapshot listener
     } catch (error) {
         console.error("Error deleting bible note: ", error);
         showToast('Failed to delete note', 'error');
     }
}

async function handleDeletePrayer(prayerId) {
     const userId = auth.currentUser?.uid;
      if (!userId) return;
      if (!confirm('Are you sure you want to delete this prayer record?')) {
          return;
      }

     try {
         await db.collection('users').doc(userId).collection('prayers').doc(prayerId).delete();
         showToast('Prayer record deleted successfully');
          // UI update via snapshot listener
     } catch (error) {
         console.error("Error deleting prayer record: ", error);
         showToast('Failed to delete prayer record', 'error');
     }
}

async function handleDeleteEvangelismRecord(entryId) {
     const userId = auth.currentUser?.uid;
      if (!userId) return;
      if (!confirm('Are you sure you want to delete this evangelism record?')) {
          return;
      }

     try {
         await db.collection('users').doc(userId).collection('evangelism').doc(entryId).delete();
         showToast('Evangelism record deleted successfully');
          // UI update via snapshot listener
     } catch (error) {
         console.error("Error deleting evangelism record: ", error);
         showToast('Failed to delete record', 'error');
     }
}


// --- Character Study Modal ---
function showCharacterStudyModal(characterId) {
    const character = window.biblicalCharacters[characterId];
    if (!character) {
         console.warn("Character data not found for ID:", characterId);
        return;
    }

    const modal = document.getElementById('character-study-modal');
    const content = document.getElementById('character-study-content');
     const modalTitle = document.getElementById('character-study-modal-title');


    if (!modal || !content || !modalTitle) {
         console.warn("Character study modal elements not found.");
         return;
    }

    modalTitle.textContent = `${character.name} - ${character.title}`;

    // Build character study content
    content.innerHTML = `
        <div class="character-header">
            <div class="character-header-image">
                <i class="fas fa-user"></i> <!-- Use a placeholder icon -->
            </div>
            <div class="character-header-info">
                <h3>${character.name}</h3>
                <p>${character.title}</p>
            </div>
        </div>

        <div class="character-tabs">
            <button class="btn btn-sm character-tab active" data-tab="overview">Overview</button>
            <button class="btn btn-sm character-tab" data-tab="lessons">Lessons</button>
             <button class="btn btn-sm character-tab" data-tab="scriptures">Scriptures</button>
            <button class="btn btn-sm character-tab" data-tab="timeline">Timeline</button>
             <button class="btn btn-sm character-tab" data-tab="my-notes">My Notes</button>
        </div>

        <div id="character-overview" class="character-tab-content active">
            <div class="character-bio">
                <p>${character.description || 'No description available.'}</p>
            </div>
             ${character.progress > 0 ? `
                <div class="character-progress-summary">
                     <h5>Your Study Progress</h5>
                     <div class="progress-bar">
                         <div class="progress-fill" style="width: ${Math.min(100, character.progress)}%;"></div>
                     </div>
                      <span>${character.progress}% Studied</span>
                </div>
             ` : ''}
        </div>

        <div id="character-lessons" class="character-tab-content">
            <div class="character-lessons">
                ${Array.isArray(character.lessons) && character.lessons.length > 0 ? character.lessons.map(lesson => `
                    <div class="lesson-item">
                        <h4>${lesson.title || 'Unnamed Lesson'}</h4>
                        <p>${lesson.content || 'No content available.'}</p>
                        <div class="lesson-reference">${lesson.reference || 'No Reference'}</div>
                    </div>
                `).join('') : '<p>No specific lessons defined for this character yet.</p>'}
            </div>
        </div>

         <div id="character-scriptures" class="character-tab-content">
             <div class="character-scriptures-list">
                 ${Array.isArray(character.scriptures) && character.scriptures.length > 0 ? character.scriptures.map(ref => `
                     <div class="scripture-reference-item">${ref}</div>
                 `).join('') : '<p>No specific scripture references listed yet.</p>'}
             </div>
         </div>


        <div id="character-timeline" class="character-tab-content">
            <p>Timeline visualization would be displayed here in a complete implementation.</p>
            <p>Key events in ${character.name}'s life:</p>
             <ul>
                 ${character.name === 'Jesus Christ' ? `
                    <li>Birth in Bethlehem</li>
                    <li>Baptism by John</li>
                    <li>Temptation in the Wilderness</li>
                    <li>Beginning of Ministry (Galilee)</li>
                    <li>Sermon on the Mount</li>
                    <li>Calling of Disciples</li>
                    <li>Miracles and Healings</li>
                    <li>Teaching Parables</li>
                    <li>Transfiguration</li>
                    <li>Entry into Jerusalem</li>
                    <li>Last Supper</li>
                    <li>Crucifixion</li>
                    <li>Resurrection</li>
                    <li>Ascension</li>
                 ` : character.name === 'King David' ? `
                     <li>Anointing by Samuel</li>
                     <li>Defeat of Goliath</li>
                     <li>Fleeing from Saul</li>
                     <li>Friendship with Jonathan</li>
                     <li>Becoming King of Judah</li>
                     <li>Becoming King of all Israel</li>
                     <li>Capturing Jerusalem</li>
                     <li>Bringing the Ark to Jerusalem</li>
                     <li>Sin with Bathsheba and Uriah</li>
                     <li>Nathan's Rebuke and David's Repentance</li>
                     <li>Absalom's Rebellion</li>
                     <li>Census and Plague</li>
                     <li>Preparations for the Temple</li>
                     <li>Death</li>
                 ` // Add other character timelines
                 : '<p>Timeline data not available.</p>'}
             </ul>
        </div>

         <div id="character-my-notes" class="character-tab-content">
              <h5>My Notes on ${character.name}</h5>
               <div class="my-character-notes-list">
                    <p>Loading your notes...</p>
                    <!-- Notes related to this character will be loaded here -->
               </div>
               <button class="btn btn-sm btn-primary add-character-note" data-character-id="${characterId}">Add Note</button>
         </div>
    `;

    // Add tab event listeners (using delegation)
     content.querySelector('.character-tabs').addEventListener('click', (e) => {
         if (e.target.classList.contains('character-tab')) {
             const tabButton = e.target;
             const tabId = tabButton.dataset.tab;

             // Update active tab styling
             content.querySelectorAll('.character-tab').forEach(t => {
                 t.classList.remove('active');
             });
             tabButton.classList.add('active');

             // Update active content visibility
             content.querySelectorAll('.character-tab-content').forEach(c => {
                 c.classList.remove('active');
             });
             const targetContent = document.getElementById(`character-${tabId}`);
             if (targetContent) {
                 targetContent.classList.add('active');
                 // If the "My Notes" tab is active, load notes
                 if (tabId === 'my-notes') {
                      loadCharacterNotes(characterId, targetContent.querySelector('.my-character-notes-list')); // Load notes for this character
                 }
             } else {
                  console.warn(`Character study tab content not found for: ${tabId}`);
             }
         }
     });

     // Add event listener for adding a note from within the modal
     content.addEventListener('click', (e) => {
         if (e.target.classList.contains('add-character-note')) {
              const charId = e.target.dataset.characterId;
              showBibleNoteModal(null, charId); // Open Bible Note modal, pass character ID
         }
     });


    // Show the modal
    modal.classList.add('active');
}

// Hide Character Study Modal
function hideCharacterStudyModal() {
    const modal = document.getElementById('character-study-modal');
     if (modal) {
        modal.classList.remove('active');
        // Clear content if needed
        const content = document.getElementById('character-study-content');
         if (content) content.innerHTML = '';
     }
}


// Load Notes specifically related to a character study
function loadCharacterNotes(characterId, container) {
     if (!container) return;
     container.innerHTML = '<p>Loading notes...</p>'; // Loading indicator


    const userId = auth.currentUser?.uid;
    if (!userId) {
        container.innerHTML = '<p>User not authenticated to load notes.</p>';
        return;
    }

    // Find notes tagged with the character's name or ID
    // This assumes notes have a 'tags' array and character names/IDs are used as tags.
     // A better approach might be a dedicated 'relatedCharacters' array on the note or a 'notes' subcollection per character study document.
     const characterName = window.biblicalCharacters[characterId]?.name;
     if (!characterName) {
         container.innerHTML = '<p>Character name not found to filter notes.</p>';
         return;
     }


     db.collection('users').doc(userId).collection('knowledgeNotes')
         .where('tags', 'array-contains', characterName) // Filter by notes tagged with character name
          // Or use a dedicated field: .where('relatedCharacters', 'array-contains', characterId)
         .orderBy('updatedAt', 'desc')
         .get() // Fetch all relevant notes, not just recent 10
         .then(snapshot => {
              container.innerHTML = ''; // Clear loading indicator

             if (snapshot.empty) {
                 container.innerHTML = '<p>No notes found related to this character.</p>';
                 return;
             }

             snapshot.forEach(doc => {
                  // Render notes similar to the main notes list, but perhaps simpler
                  const note = doc.data();
                   const noteElement = document.createElement('div');
                   noteElement.className = 'character-note-item'; // Use a different class
                   noteElement.dataset.id = doc.id; // Store ID

                    noteElement.innerHTML = `
                        <h5>${note.title || 'Unnamed Note'} <span class="note-reference">${note.reference || ''}</span></h5>
                         <div class="note-preview">${note.content ? (note.content.substring(0, 150) + (note.content.length > 150 ? '...' : '')) : 'No content'}</div>
                          <div class="note-actions">
                               <button class="btn btn-sm btn-icon view-full-note" data-id="${doc.id}" title="View Full Note"><i class="fas fa-eye"></i></button>
                                <button class="btn btn-sm btn-icon edit-character-note" data-id="${doc.id}" title="Edit Note"><i class="fas fa-edit"></i></button>
                          </div>
                    `;
                    // Add listeners for actions on notes within this list
                    noteElement.querySelector('.view-full-note')?.addEventListener('click', (e) => {
                        e.stopPropagation();
                         viewNote(doc.id); // Reuse the generic viewNote function
                    });
                     noteElement.querySelector('.edit-character-note')?.addEventListener('click', (e) => {
                         e.stopPropagation();
                          showBibleNoteModal(doc.id); // Reuse showBibleNoteModal for editing
                     });


                   container.appendChild(noteElement);
             });
         })
         .catch(error => {
             console.error(`Error loading notes for character ${characterId}:`, error);
             container.innerHTML = '<p>Error loading notes.</p>';
         });
}


// Handle Challenge Actions (Placeholders)
function handleViewChallenge(challengeId) {
    showToast(`Feature: View details for challenge ID: ${challengeId}`);
    // Fetch challenge data and render in a modal/page
}

function handleUpdateChallengeProgress(challengeId) {
    const newProgressStr = prompt("Enter your current progress (e.g., days read, amount contributed):");
    const newProgress = parseFloat(newProgressStr);

    if (newProgressStr !== null && !isNaN(newProgress) && newProgress >= 0) {
         showToast(`Feature: Update progress for challenge ID: ${challengeId} to ${newProgress}`);
         // Fetch the challenge and the user's progress record for it
         // Update the user's specific progress value in Firestore
    } else if (newProgressStr !== null) {
         showToast('Please enter a valid positive number or zero', 'warning');
    }
}


// --- Helper Functions (Spiritual Module) ---
// formatCategory is already in Relationships Helpers
// formatImportance is already in Relationships Helpers
// formatEmotion is already in Relationships Helpers
// addTagToContainer is a generic helper used by Reflection and Spiritual

function formatPrayerType(type) {
    const types = {
        'intercession': 'Intercession',
        'thanksgiving': 'Thanksgiving',
        'supplication': 'Supplication',
        'praise': 'Praise',
         'confession': 'Confession', // Added confession
         'other': 'Prayer' // Default
    };
    return types[type] || type || 'Prayer';
}

function formatEvangelismType(type) {
    const types = {
        'personal': 'Personal Conversation',
        'group': 'Group Discussion',
        'outreach': 'Outreach Event',
        'digital': 'Digital Evangelism',
         'service': 'Service/Mission', // Added service
         'other': 'Evangelism Activity' // Default
    };
    return types[type] || type || 'Evangelism Activity';
}

function formatEvangelismOutcome(outcome) {
    const outcomes = {
        'shared': 'Shared Gospel',
        'interested': 'Expressed Interest',
        'decision': 'Made Decision',
        'followup': 'Needs Follow-up',
         'planted': 'Seed Planted', // Added planted
         'other': 'Outcome Recorded' // Default
    };
    return outcomes[outcome] || outcome || 'Outcome Recorded';
}


// ==================================
// 15. Initial DOMContentLoaded Listener
// ==================================

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM fully loaded. Starting app initialization...");

  // Initialize authentication state listener
  // This is the primary entry point after the DOM is ready and Firebase SDKs are loaded.
  // initAuthState will handle redirects for unauthenticated users
  // and call module initialization for authenticated users.
  initAuthState();

   // Set up login page specific listeners if on the login page.
   // This needs to happen regardless of auth state, but only on the login page.
    if (document.getElementById('login')) { // Assuming the main login div has ID 'login'
        console.log("Setting up login listeners...");
        setupLoginListeners();
    } else {
        console.log("Not on login page.");
    }

});

// Add event listener to clear intervals on page unload to prevent memory leaks in SPAs
// This is less critical for multi-page apps but good practice.
window.addEventListener('beforeunload', function() {
    console.log("Unloading page. Clearing intervals...");
    if (window._dashboardDateTimeInterval) clearInterval(window._dashboardDateTimeInterval);
    if (window._plannerTimeIndicatorInterval) clearInterval(window._plannerTimeIndicatorInterval);
    // Clear any other intervals you might set
});
