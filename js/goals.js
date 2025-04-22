// goals.js - World-Class Goal Management System

// ====================
// GLOBAL CONFIGURATION
// ====================
const goalConfig = {
    // Based on Google's OKR (Objectives and Key Results) framework
    okrSettings: {
      maxObjectives: 5,
      maxKeyResults: 3,
      completionThreshold: 0.7 // 70% of KRs needed to mark objective complete
    },
    
    // Incorporating Atomic Habits principles
    habitSettings: {
      habitStacking: true,
      temptationBundling: true,
      twoMinuteRule: true
    },
    
    // SMART Goal criteria
    smartCriteria: {
      specific: true,
      measurable: true,
      achievable: true,
      relevant: true,
      timeBound: true
    }
  };
  
  // =================
  // CORE FUNCTIONALITY
  // =================
  
  // Initialize Goals Module
  function initGoalsModule() {
    loadAllGoals();
    setupGoalListeners();
    renderMotivationalContent();
  }
  
  // Load All Goal Types
  function loadAllGoals() {
    const userId = window.firebaseAuth.currentUser.uid;
    
    // Load OKRs (Objectives and Key Results)
    window.firebaseDB.collection('users').doc(userId).collection('okrs')
      .where('archived', '==', false)
      .orderBy('priority', 'desc')
      .onSnapshot(handleOkrUpdate);
      
    // Load Habits (Atomic Habits system)
    window.firebaseDB.collection('users').doc(userId).collection('habits')
      .onSnapshot(handleHabitsUpdate);
      
    // Load SMART Goals
    window.firebaseDB.collection('users').doc(userId).collection('smartGoals')
      .where('completed', '==', false)
      .onSnapshot(handleSmartGoalsUpdate);
  }
  
  // ================
  // OKR SYSTEM (Google's Methodology)
  // ================
  function handleOkrUpdate(snapshot) {
    const container = document.getElementById('okr-container');
    container.innerHTML = '';
    
    snapshot.forEach(doc => {
      const okr = doc.data();
      const completionRate = calculateOkrCompletion(okr);
      
      const okrElement = document.createElement('div');
      okrElement.className = `okr-card ${completionRate >= 1 ? 'completed' : ''}`;
      okrElement.innerHTML = `
        <div class="okr-header">
          <h3>${okr.objective}</h3>
          <div class="okr-meta">
            <span class="priority-badge">Priority: ${okr.priority}</span>
            <span class="completion-rate">${Math.round(completionRate * 100)}%</span>
          </div>
        </div>
        <div class="key-results">
          ${okr.keyResults.map(kr => `
            <div class="kr-item">
              <input type="checkbox" ${kr.completed ? 'checked' : ''} 
                     data-okr-id="${doc.id}" data-kr-id="${kr.id}">
              <label>${kr.description}</label>
              <div class="kr-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${kr.progress}%"></div>
                </div>
                <span>${kr.progress}%</span>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="okr-actions">
          <button class="btn-edit-okr" data-id="${doc.id}">Edit</button>
          <button class="btn-archive-okr" data-id="${doc.id}">Archive</button>
        </div>
      `;
      container.appendChild(okrElement);
    });
  }
  
  function calculateOkrCompletion(okr) {
    const completedKRs = okr.keyResults.filter(kr => kr.completed).length;
    return completedKRs / okr.keyResults.length;
  }
  
  // ================
  // ATOMIC HABITS SYSTEM
  // ================
  function handleHabitsUpdate(snapshot) {
    const container = document.getElementById('habits-container');
    container.innerHTML = '';
    
    const today = new Date().toISOString().split('T')[0];
    
    snapshot.forEach(doc => {
      const habit = doc.data();
      const streak = calculateStreak(habit.completionDates);
      const completionToday = habit.completionDates.includes(today);
      
      const habitElement = document.createElement('div');
      habitElement.className = `habit-card ${streak > 7 ? 'golden' : streak > 3 ? 'silver' : ''}`;
      habitElement.innerHTML = `
        <div class="habit-header">
          <h4>${habit.name}</h4>
          <span class="streak-counter">🔥 ${streak}</span>
        </div>
        <p class="habit-cue">${habit.cue}</p>
        <div class="habit-actions">
          <button class="btn-complete-habit ${completionToday ? 'completed' : ''}" 
                  data-id="${doc.id}" data-date="${today}">
            ${completionToday ? 'Completed Today' : 'Mark Complete'}
          </button>
        </div>
        <div class="habit-calendar">
          ${renderMiniCalendar(habit.completionDates)}
        </div>
      `;
      container.appendChild(habitElement);
    });
  }
  
  function calculateStreak(completionDates) {
    // Implementation for streak calculation
    let streak = 0;
    const today = new Date();
    let currentDate = new Date(today);
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (completionDates.includes(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }
  
  // ================
  // SMART GOALS SYSTEM
  // ================
  function handleSmartGoalsUpdate(snapshot) {
    const container = document.getElementById('smart-goals-container');
    container.innerHTML = '';
    
    snapshot.forEach(doc => {
      const goal = doc.data();
      const progress = calculateSmartGoalProgress(goal);
      
      const goalElement = document.createElement('div');
      goalElement.className = 'smart-goal-card';
      goalElement.innerHTML = `
        <div class="goal-header">
          <h4>${goal.title}</h4>
          <span class="deadline">${new Date(goal.deadline).toLocaleDateString()}</span>
        </div>
        <div class="goal-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          <span>${progress}%</span>
        </div>
        <div class="goal-details">
          <div class="detail">
            <label>Specific:</label>
            <span>${goal.specific}</span>
          </div>
          <div class="detail">
            <label>Measurable:</label>
            <span>${goal.measurable}</span>
          </div>
          <div class="detail">
            <label>Achievable:</label>
            <span>${goal.achievable ? '✅' : '⚠️ Needs review'}</span>
          </div>
        </div>
        <div class="goal-actions">
          <button class="btn-update-goal" data-id="${doc.id}">Update</button>
          <button class="btn-complete-goal" data-id="${doc.id}">Complete</button>
        </div>
      `;
      container.appendChild(goalElement);
    });
  }
  
  // ================
  // EVENT HANDLERS
  // ================
  function setupGoalListeners() {
    // OKR Completion Toggle
    document.addEventListener('click', (e) => {
      if (e.target.matches('.key-results input[type="checkbox"]')) {
        const okrId = e.target.dataset.okrId;
        const krId = e.target.dataset.krId;
        const completed = e.target.checked;
        
        updateKeyResult(okrId, krId, completed);
      }
    });
    
    // Habit Completion
    document.addEventListener('click', (e) => {
      if (e.target.matches('.btn-complete-habit')) {
        const habitId = e.target.dataset.id;
        const date = e.target.dataset.date;
        const completed = !e.target.classList.contains('completed');
        
        updateHabitCompletion(habitId, date, completed);
      }
    });
  }
  
  // ================
  // FIREBASE OPERATIONS
  // ================
  function updateKeyResult(okrId, krId, completed) {
    const userId = window.firebaseAuth.currentUser.uid;
    
    window.firebaseDB.collection('users').doc(userId).collection('okrs')
      .doc(okrId)
      .update({
        'keyResults.$[kr].completed': completed,
        'keyResults.$[kr].lastUpdated': new Date()
      }, {
        arrayFilters: [{ 'kr.id': krId }]
      });
  }
  
  function updateHabitCompletion(habitId, date, completed) {
    const userId = window.firebaseAuth.currentUser.uid;
    const updates = {};
    
    if (completed) {
      updates.completionDates = firebase.firestore.FieldValue.arrayUnion(date);
    } else {
      updates.completionDates = firebase.firestore.FieldValue.arrayRemove(date);
    }
    
    window.firebaseDB.collection('users').doc(userId).collection('habits')
      .doc(habitId)
      .update(updates);
  }
  
  // ================
  // UI RENDERING HELPERS
  // ================
  function renderMiniCalendar(completionDates) {
    // Implementation for mini calendar rendering
    // Shows 30-day view with completion dots
    return '<div class="calendar-placeholder">Calendar visualization</div>';
  }
  
  function renderMotivationalContent() {
    const quotes = [
      "What you get by achieving your goals is not as important as what you become by achieving them.",
      "The trouble with not having a goal is that you can spend your life running up and down the field and never score.",
      "Setting goals is the first step in turning the invisible into the visible."
    ];
    
    document.getElementById('motivational-quote').textContent = 
      quotes[Math.floor(Math.random() * quotes.length)];
  }
  
  // ================
  // INITIALIZATION
  // ================
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('goals')) {
      initGoalsModule();
    }
  });