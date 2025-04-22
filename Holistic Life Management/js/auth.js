document.addEventListener('DOMContentLoaded', function() {
    auth.onAuthStateChanged(user => {
      if (user) {
        if (user.email === 'enilamaoshoriamhe687@gmail.com') {
          loadUserData(user.uid);
        } else {
          alert('Access denied. This application is restricted.');
          auth.signOut();
        }
      } else {
        window.location.href = 'login.html';
      }
    });
  });
  
  function loadUserData(userId) {
    db.collection('users').doc(userId).get()
      .then(doc => {
        if (doc.exists) {
          updateUserInterface(doc.data());
        } else {
          setupNewUser(userId);
        }
      })
      .catch(console.error);
  }
  
  function setupNewUser(userId) {
    const initialData = {
      profile: {
        name: 'Enilama Oshoriamhe',
        role: 'Biochemist | Data Engineer | Developer',
        email: 'enilamaoshoriamhe687@gmail.com',
        notificationEmail: 'enilama.oshoriamhe687@nafdac.gov.ng',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
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
      }
      // ... rest of initial data structure
    };
    
    db.collection('users').doc(userId).set(initialData)
      .then(() => updateUserInterface(initialData))
      .catch(console.error);
  }
  
  function updateUserInterface(userData) {
    document.querySelector('.profile h3').textContent = userData.profile.name;
    if (typeof loadDashboard === 'function') loadDashboard();
    if (typeof loadPlanner === 'function') loadPlanner();
  }