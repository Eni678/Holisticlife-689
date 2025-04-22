// reflection.js - Ultimate Reflection System

// Configuration
const reflectionConfig = {
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
  };
  
  // Initialize Reflection Module
  function initReflectionModule() {
    loadReflectionData();
    setupReflectionListeners();
    setupDailyPrompt();
    setupReviewDashboard();
    
    // Check if today's entry exists
    checkTodaysEntry();
  }
  
  // Load Reflection Data
  function loadReflectionData() {
    const userId = window.firebaseAuth.currentUser.uid;
    const today = new Date().toISOString().split('T')[0];
    
    // Load today's reflection
    window.firebaseDB.collection('users').doc(userId)
      .collection('reflections')
      .doc(today)
      .onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data();
          populateReflectionFields(data);
          updateReflectionStats();
        }
      });
    
    // Load streak data
    window.firebaseDB.collection('users').doc(userId)
      .collection('metadata')
      .doc('reflectionStats')
      .onSnapshot(doc => {
        if (doc.exists) {
          updateStatsDisplay(doc.data());
        }
      });
  }
  
  // Setup Event Listeners
  function setupReflectionListeners() {
    // Tab switching
    document.querySelectorAll('.reflection-tab').forEach(tab => {
      tab.addEventListener('click', switchReflectionTab);
    });
    
    // Save buttons
    document.getElementById('save-journal').addEventListener('click', saveJournalEntry);
    document.getElementById('save-gratitude').addEventListener('click', saveGratitudeList);
    document.getElementById('save-lessons').addEventListener('click', saveLessonsLearned);
    
    // Quick entry button
    document.getElementById('quick-journal').addEventListener('click', openQuickJournal);
    
    // Review dashboard
    document.getElementById('review-dashboard').addEventListener('click', openReviewDashboard);
    document.querySelector('#review-modal .close-modal').addEventListener('click', closeReviewDashboard);
    
    // Review tabs
    document.querySelectorAll('.review-tab').forEach(tab => {
      tab.addEventListener('click', switchReviewTab);
    });
    
    // Tags input
    document.getElementById('journal-tags-input').addEventListener('keydown', handleTagInput);
    
    // Generate insights
    document.getElementById('generate-insights').addEventListener('click', generateAIInsights);
  }
  
  // Setup Daily Prompt
  function setupDailyPrompt() {
    const promptElement = document.getElementById('daily-prompt');
    const randomIndex = Math.floor(Math.random() * reflectionConfig.journalPrompts.length);
    promptElement.textContent = reflectionConfig.journalPrompts[randomIndex];
  }
  
  // Populate Reflection Fields
  function populateReflectionFields(data) {
    // Journal
    if (data.journal) {
      document.getElementById('journal-entry').value = data.journal.entry || '';
      setMoodSelection(data.journal.mood || 3);
      renderTags(data.journal.tags || []);
    }
    
    // Gratitude
    if (data.gratitude && data.gratitude.items) {
      const inputs = document.querySelectorAll('.gratitude-input');
      data.gratitude.items.forEach((item, index) => {
        if (inputs[index]) inputs[index].value = item;
      });
    }
    
    // Lessons
    if (data.lessons) {
      document.getElementById('went-well').value = data.lessons.wentWell || '';
      document.getElementById('could-improve').value = data.lessons.couldImprove || '';
      document.getElementById('key-takeaways').value = data.lessons.keyTakeaways || '';
    }
  }
  
  // Set Mood Selection
  function setMoodSelection(value) {
    const radio = document.querySelector(`input[name="mood"][value="${value}"]`);
    if (radio) radio.checked = true;
  }
  
  // Render Tags
  function renderTags(tags) {
    const container = document.getElementById('journal-tags-container');
    container.innerHTML = '';
    
    tags.forEach(tag => {
      const tagElement = document.createElement('div');
      tagElement.className = 'tag';
      tagElement.innerHTML = `
        ${tag}
        <button class="tag-remove">&times;</button>
      `;
      container.appendChild(tagElement);
      
      // Add remove listener
      tagElement.querySelector('.tag-remove').addEventListener('click', () => {
        tagElement.remove();
      });
    });
  }
  
  // Handle Tag Input
  function handleTagInput(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = e.target;
      const tag = input.value.trim();
      
      if (tag) {
        addTag(tag);
        input.value = '';
      }
    }
  }
  
  // Add Tag
  function addTag(tag) {
    const container = document.getElementById('journal-tags-container');
    
    // Check if tag already exists
    const tags = Array.from(container.querySelectorAll('.tag'))
      .map(el => el.textContent.trim().replace('×', ''));
    
    if (!tags.includes(tag)) {
      const tagElement = document.createElement('div');
      tagElement.className = 'tag';
      tagElement.innerHTML = `
        ${tag}
        <button class="tag-remove">&times;</button>
      `;
      container.appendChild(tagElement);
      
      // Add remove listener
      tagElement.querySelector('.tag-remove').addEventListener('click', () => {
        tagElement.remove();
      });
    }
  }
  
  // Get Current Tags
  function getCurrentTags() {
    const container = document.getElementById('journal-tags-container');
    return Array.from(container.querySelectorAll('.tag'))
      .map(el => el.textContent.trim().replace('×', ''));
  }
  
  // Switch Reflection Tab
  function switchReflectionTab(e) {
    const tab = e.currentTarget;
    const tabName = tab.dataset.tab;
    
    // Remove active class from all tabs and contents
    document.querySelectorAll('.reflection-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.reflection-tab-content').forEach(c => c.classList.remove('active'));
    
    // Add active class to clicked tab
    tab.classList.add('active');
    
    // Show corresponding content
    document.getElementById(`${tabName}-tab`).classList.add('active');
  }
  
  // Save Journal Entry
  async function saveJournalEntry() {
    const userId = window.firebaseAuth.currentUser.uid;
    const today = new Date().toISOString().split('T')[0];
    const entry = document.getElementById('journal-entry').value;
    const mood = document.querySelector('input[name="mood"]:checked').value;
    const tags = getCurrentTags();
    
    await window.firebaseDB.collection('users').doc(userId)
      .collection('reflections')
      .doc(today)
      .set({
        journal: {
          entry,
          mood: parseInt(mood),
          tags,
          updatedAt: new Date().toISOString()
        }
      }, { merge: true });
    
    updateStreak();
    showToast('Journal saved successfully');
  }
  
  // Save Gratitude List
  async function saveGratitudeList() {
    const userId = window.firebaseAuth.currentUser.uid;
    const today = new Date().toISOString().split('T')[0];
    const inputs = document.querySelectorAll('.gratitude-input');
    const items = Array.from(inputs).map(input => input.value.trim()).filter(item => item);
    
    await window.firebaseDB.collection('users').doc(userId)
      .collection('reflections')
      .doc(today)
      .set({
        gratitude: {
          items,
          updatedAt: new Date().toISOString()
        }
      }, { merge: true });
    
    updateStreak();
    showToast('Gratitude list saved successfully');
  }
  
  // Save Lessons Learned
  async function saveLessonsLearned() {
    const userId = window.firebaseAuth.currentUser.uid;
    const today = new Date().toISOString().split('T')[0];
    const wentWell = document.getElementById('went-well').value;
    const couldImprove = document.getElementById('could-improve').value;
    const keyTakeaways = document.getElementById('key-takeaways').value;
    
    await window.firebaseDB.collection('users').doc(userId)
      .collection('reflections')
      .doc(today)
      .set({
        lessons: {
          wentWell,
          couldImprove,
          keyTakeaways,
          updatedAt: new Date().toISOString()
        }
      }, { merge: true });
    
    updateStreak();
    showToast('Lessons saved successfully');
  }
  
  // Check Today's Entry
  function checkTodaysEntry() {
    const userId = window.firebaseAuth.currentUser.uid;
    const today = new Date().toISOString().split('T')[0];
    
    window.firebaseDB.collection('users').doc(userId)
      .collection('reflections')
      .doc(today)
      .get()
      .then(doc => {
        if (!doc.exists) {
          showReminder('Complete your daily reflection to maintain your streak!');
        }
      });
  }
  
  // Update Streak
  function updateStreak() {
    const userId = window.firebaseAuth.currentUser.uid;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    window.firebaseDB.collection('users').doc(userId)
      .collection('metadata')
      .doc('reflectionStats')
      .get()
      .then(doc => {
        const data = doc.exists ? doc.data() : { streak: 0, lastEntry: null };
        const lastEntry = data.lastEntry ? new Date(data.lastEntry) : null;
        
        // Calculate streak
        let newStreak = data.streak || 0;
        
        if (lastEntry) {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastEntry.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
            // Consecutive day
            newStreak++;
          } else if (lastEntry.toISOString().split('T')[0] !== todayStr) {
            // Broken streak
            newStreak = 1;
          }
        } else {
          // First entry
          newStreak = 1;
        }
        
        // Update stats
        window.firebaseDB.collection('users').doc(userId)
          .collection('metadata')
          .doc('reflectionStats')
          .set({
            streak: newStreak,
            lastEntry: today.toISOString(),
            totalEntries: (data.totalEntries || 0) + 1
          }, { merge: true });
      });
  }
  
  // Update Stats Display
  function updateStatsDisplay(data) {
    document.getElementById('streak-count').textContent = data.streak || 0;
    document.getElementById('journal-count').textContent = data.totalEntries || 0;
    
    // Update mood chart if it exists
    if (window.moodChart) {
      // In a real app, you would fetch historical mood data here
      // For now, we'll simulate some data
      const moodData = generateMoodData(data.streak || 7);
      window.moodChart.data.datasets[0].data = moodData;
      window.moodChart.update();
    }
  }
  
  // Generate Mood Data (simulated)
  function generateMoodData(days = 7) {
    return Array.from({ length: days }, (_, i) => {
      // Simulate some variation
      const base = 3; // Neutral
      const variation = Math.sin(i * 0.5) * 1.5;
      return Math.min(5, Math.max(1, Math.round(base + variation)));
    });
  }
  
  // Open Quick Journal
  function openQuickJournal() {
    // Focus on journal tab and textarea
    document.querySelector('.reflection-tab[data-tab="journal"]').click();
    document.getElementById('journal-entry').focus();
    
    // Show benefits of journaling
    showToast(`Tip: ${reflectionConfig.gratitudeBenefits[Math.floor(Math.random() * reflectionConfig.gratitudeBenefits.length)]}`);
  }
  
  // Setup Review Dashboard
  function setupReviewDashboard() {
    // Initialize mood chart
    const ctx = document.getElementById('moodTrendChart').getContext('2d');
    window.moodChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toLocaleDateString('en-US', { weekday: 'short' });
        }),
        datasets: [{
          label: 'Mood (1-5 scale)',
          data: generateMoodData(),
          borderColor: '#6200ea',
          backgroundColor: 'rgba(98, 0, 234, 0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        scales: {
          y: {
            min: 1,
            max: 5,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }
  
  // Open Review Dashboard
  function openReviewDashboard() {
    document.getElementById('review-modal').classList.add('active');
    loadReviewData('weekly');
  }
  
  // Close Review Dashboard
  function closeReviewDashboard() {
    document.getElementById('review-modal').classList.remove('active');
  }
  
  // Switch Review Tab
  function switchReviewTab(e) {
    const tab = e.currentTarget;
    const reviewType = tab.dataset.review;
    
    // Remove active class from all tabs and contents
    document.querySelectorAll('.review-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.review-tab-content').forEach(c => c.classList.remove('active'));
    
    // Add active class to clicked tab
    tab.classList.add('active');
    
    // Show corresponding content
    document.getElementById(`${reviewType}-review`).classList.add('active');
    
    // Load data for this review type
    loadReviewData(reviewType);
  }
  
  // Load Review Data
  function loadReviewData(type) {
    const userId = window.firebaseAuth.currentUser.uid;
    
    // In a real app, you would fetch and process data based on the review type
    // For now, we'll simulate some data
    
    if (type === 'weekly') {
      simulateWeeklyData();
    } else if (type === 'monthly') {
      simulateMonthlyData();
    } else {
      simulateQuarterlyData();
    }
  }
  
  // Simulate Weekly Data
  function simulateWeeklyData() {
    const highlightsContainer = document.getElementById('weekly-highlights');
    const themesContainer = document.getElementById('weekly-themes');
    
    // Simulate highlights
    const highlights = [
      "Completed project milestone",
      "Consistent morning routine",
      "Great networking opportunity",
      "Personal best in workout"
    ];
    
    highlightsContainer.innerHTML = highlights.map(highlight => `
      <div class="highlight-card">${highlight}</div>
    `).join('');
    
    // Simulate themes
    const themes = ["Productivity", "Health", "Learning", "Relationships", "Growth"];
    themesContainer.innerHTML = themes.map(theme => `
      <div class="theme-tag">${theme}</div>
    `).join('');
    
    // Update weekly mood chart
    const ctx = document.getElementById('weekly-mood-chart').getContext('2d');
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
          data: generateMoodData(),
          backgroundColor: '#6200ea'
        }, {
          label: 'Productivity',
          data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 5) + 1),
          backgroundColor: '#03dac6'
        }]
      },
      options: {
        scales: {
          y: {
            min: 1,
            max: 5,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }
  
  // Simulate Monthly Data
  function simulateMonthlyData() {
    const insightsContainer = document.getElementById('monthly-insights');
    
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
  
  // Simulate Quarterly Data
  function simulateQuarterlyData() {
    const goalsContainer = document.getElementById('quarterly-goals');
    
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
          <div class="progress-fill" style="width: ${item.progress}%"></div>
        </div>
        <span>${item.progress}% completed</span>
      </div>
    `).join('');
  }
  
  // Generate AI Insights
  function generateAIInsights() {
    // In a real app, this would call an AI service or analyze your data
    // For now, we'll simulate some insights
    
    const insights = [
      "You're most productive on Tuesdays and Wednesdays",
      "Your mood improves significantly after social interactions",
      "Days with morning exercise show 30% higher productivity",
      "You tend to be more creative in the late morning hours"
    ];
    
    const randomInsights = [];
    while (randomInsights.length < 2) {
      const randomIndex = Math.floor(Math.random() * insights.length);
      if (!randomInsights.includes(insights[randomIndex])) {
        randomInsights.push(insights[randomIndex]);
      }
    }
    
    document.getElementById('ai-insights').innerHTML = randomInsights
      .map(insight => `<p>${insight}</p>`)
      .join('');
    
    showToast('New insights generated based on your reflection data');
  }
  
  // Helper Functions
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          toast.remove();
        }, 300);
      }, 3000);
    }, 100);
  }
  
  function showReminder(message) {
    const reminder = document.createElement('div');
    reminder.className = 'reminder-banner';
    reminder.innerHTML = `
      <span>${message}</span>
      <button class="btn-icon reminder-dismiss">
        <i class="fas fa-times"></i>
      </button>
    `;
    document.body.appendChild(reminder);
    
    setTimeout(() => {
      reminder.classList.add('show');
    }, 100);
    
    // Add dismiss listener
    reminder.querySelector('.reminder-dismiss').addEventListener('click', () => {
      reminder.classList.remove('show');
      setTimeout(() => {
        reminder.remove();
      }, 300);
    });
  }
  
  // Initialize when ready
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('reflection')) {
      initReflectionModule();
    }
  });