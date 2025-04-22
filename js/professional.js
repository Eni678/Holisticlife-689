// professional.js - Comprehensive Professional Development Module
document.addEventListener('DOMContentLoaded', function() {
    // Initialize professional module
    if (document.getElementById('professional')) {
        initProfessionalModule();
    }
});

// Professional Module Initialization
function initProfessionalModule() {
    // Load professional data from Firestore
    loadProfessionalData();
    
    // Set up event listeners
    setupProfessionalEventListeners();
    
    // Initialize view based on URL hash or default
    const defaultView = window.location.hash.replace('#', '') || 'dashboard';
    switchProfessionalView(defaultView);
    
    // Update professional dashboard with real-time data
    updateProfessionalDashboard();
}

// Load professional data from Firestore
function loadProfessionalData() {
    const userId = firebase.auth().currentUser.uid;
    
    firebase.firestore().collection('users').doc(userId).collection('professional').doc('data').get()
        .then(doc => {
            if (doc.exists) {
                const data = doc.data();
                renderProfessionalData(data);
            } else {
                // Initialize professional data structure for new users
                initializeProfessionalData(userId);
            }
        })
        .catch(error => {
            console.error("Error loading professional data:", error);
            showToast('Failed to load professional data', 'error');
        });
}

// Initialize professional data structure
function initializeProfessionalData(userId) {
    const initialData = {
        // Career Profile
        profile: {
            currentRole: "Data Engineer at NAFDAC",
            careerLevel: "Entry-Level",
            careerPath: "Technology & Healthcare Regulation",
            skills: ["Python", "SQL", "Data Analysis"],
            aspirations: [
                "Become a world-class data engineer",
                "Develop expertise in machine learning",
                "Master full-stack web development",
                "Gain supply chain knowledge",
                "Understand financial technology"
            ],
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        },
        
        // Skills Development Framework
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
            applications: [],
            networkingContacts: [],
            interviewPrep: {}
        },
        
        // Learning Plan
        learningPlan: {
            currentCourses: [],
            completedCourses: [],
            plannedCourses: [],
            readingList: []
        },
        
        // Performance Metrics
        metrics: {
            productivity: {},
            achievements: [],
            performanceReviews: []
        },
        
        // Long-term Career Strategy
        careerStrategy: {
            fiveYearPlan: "",
            tenYearVision: "",
            legacyGoals: ""
        }
    };
    
    firebase.firestore().collection('users').doc(userId).collection('professional').doc('data').set(initialData)
        .then(() => {
            renderProfessionalData(initialData);
            showToast('Professional profile initialized successfully', 'success');
        })
        .catch(error => {
            console.error("Error initializing professional data:", error);
            showToast('Failed to initialize professional data', 'error');
        });
}

// Render professional data to the UI
function renderProfessionalData(data) {
    // Update profile section
    updateProfileSection(data.profile);
    
    // Update skills tracking
    updateSkillsTracking(data.skills);
    
    // Update job search tracker
    updateJobSearchTracker(data.jobSearch);
    
    // Update learning plan
    updateLearningPlan(data.learningPlan);
    
    // Update performance metrics
    updatePerformanceMetrics(data.metrics);
    
    // Update career strategy
    updateCareerStrategy(data.careerStrategy);
}

// Update profile section
function updateProfileSection(profileData) {
    document.getElementById('current-role').textContent = profileData.currentRole;
    document.getElementById('career-level').textContent = profileData.careerLevel;
    document.getElementById('career-path').textContent = profileData.careerPath;
    
    const aspirationsList = document.getElementById('career-aspirations');
    aspirationsList.innerHTML = '';
    profileData.aspirations.forEach(aspiration => {
        const li = document.createElement('li');
        li.textContent = aspiration;
        aspirationsList.appendChild(li);
    });
}

// Update skills tracking
function updateSkillsTracking(skillsData) {
    // Technical skills
    const technicalSkillsContainer = document.getElementById('technical-skills-container');
    technicalSkillsContainer.innerHTML = '';
    
    for (const [skill, details] of Object.entries(skillsData.technical)) {
        technicalSkillsContainer.appendChild(createSkillCard(skill, details));
    }
    
    // Professional skills
    const professionalSkillsContainer = document.getElementById('professional-skills-container');
    professionalSkillsContainer.innerHTML = '';
    
    for (const [skill, details] of Object.entries(skillsData.professional)) {
        professionalSkillsContainer.appendChild(createSkillCard(skill, details));
    }
    
    // Domain knowledge
    const domainSkillsContainer = document.getElementById('domain-skills-container');
    domainSkillsContainer.innerHTML = '';
    
    for (const [skill, details] of Object.entries(skillsData.domain)) {
        domainSkillsContainer.appendChild(createSkillCard(skill, details));
    }
}

// Create skill card element
function createSkillCard(skillName, skillDetails) {
    const card = document.createElement('div');
    card.className = 'skill-card';
    
    const progressPercentage = (skillDetails.level / skillDetails.target) * 100;
    
    card.innerHTML = `
        <div class="skill-header">
            <h4>${skillName}</h4>
            <div class="skill-level">Level ${skillDetails.level}/${skillDetails.target}</div>
        </div>
        <div class="skill-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercentage}%"></div>
            </div>
        </div>
        <div class="skill-actions">
            <button class="btn-icon skill-edit" data-skill="${skillName}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon skill-log" data-skill="${skillName}">
                <i class="fas fa-plus"></i>
            </button>
        </div>
    `;
    
    return card;
}

// Update job search tracker
function updateJobSearchTracker(jobSearchData) {
    // Target roles
    const targetRolesList = document.getElementById('target-roles-list');
    targetRolesList.innerHTML = '';
    jobSearchData.targetRoles.forEach(role => {
        const li = document.createElement('li');
        li.textContent = role;
        targetRolesList.appendChild(li);
    });
    
    // Applications
    const applicationsContainer = document.getElementById('applications-container');
    applicationsContainer.innerHTML = '';
    
    jobSearchData.applications.forEach(application => {
        applicationsContainer.appendChild(createApplicationCard(application));
    });
    
    // Networking contacts
    const networkingContainer = document.getElementById('networking-contacts');
    networkingContainer.innerHTML = '';
    
    jobSearchData.networkingContacts.forEach(contact => {
        networkingContainer.appendChild(createContactCard(contact));
    });
}

// Create application card
function createApplicationCard(application) {
    const card = document.createElement('div');
    card.className = 'application-card';
    
    card.innerHTML = `
        <h5>${application.position}</h5>
        <p>${application.company}</p>
        <div class="application-status ${application.status.toLowerCase()}">
            ${application.status}
        </div>
        <div class="application-date">Applied: ${formatDate(application.date)}</div>
        <div class="application-actions">
            <button class="btn-icon application-update" data-id="${application.id}">
                <i class="fas fa-sync-alt"></i>
            </button>
            <button class="btn-icon application-notes" data-id="${application.id}">
                <i class="fas fa-file-alt"></i>
            </button>
        </div>
    `;
    
    return card;
}

// Update learning plan
function updateLearningPlan(learningPlanData) {
    // Current courses
    const currentCoursesContainer = document.getElementById('current-courses-container');
    currentCoursesContainer.innerHTML = '';
    
    learningPlanData.currentCourses.forEach(course => {
        currentCoursesContainer.appendChild(createLearningResourceCard(course, 'current'));
    });
    
    // Planned courses
    const plannedCoursesContainer = document.getElementById('planned-courses-container');
    plannedCoursesContainer.innerHTML = '';
    
    learningPlanData.plannedCourses.forEach(course => {
        plannedCoursesContainer.appendChild(createLearningResourceCard(course, 'planned'));
    });
    
    // Completed courses
    const completedCoursesContainer = document.getElementById('completed-courses-container');
    completedCoursesContainer.innerHTML = '';
    
    learningPlanData.completedCourses.forEach(course => {
        completedCoursesContainer.appendChild(createLearningResourceCard(course, 'completed'));
    });
    
    // Reading list
    const readingListContainer = document.getElementById('reading-list-container');
    readingListContainer.innerHTML = '';
    
    learningPlanData.readingList.forEach(book => {
        readingListContainer.appendChild(createReadingListItem(book));
    });
}

// Create learning resource card
function createLearningResourceCard(resource, status) {
    const card = document.createElement('div');
    card.className = `resource-card ${status}`;
    
    const progressPercentage = resource.progress || 0;
    
    card.innerHTML = `
        <div class="resource-header">
            <h5>${resource.title}</h5>
            <div class="resource-source">${resource.source}</div>
        </div>
        <div class="resource-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercentage}%"></div>
            </div>
            <span>${progressPercentage}% complete</span>
        </div>
        <div class="resource-meta">
            <span><i class="fas fa-calendar"></i> Started: ${formatDate(resource.startDate)}</span>
            ${resource.targetDate ? `<span><i class="fas fa-flag"></i> Target: ${formatDate(resource.targetDate)}</span>` : ''}
        </div>
        <div class="resource-actions">
            <button class="btn-icon resource-update" data-id="${resource.id}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon resource-complete" data-id="${resource.id}">
                <i class="fas fa-check"></i>
            </button>
        </div>
    `;
    
    return card;
}

// Update performance metrics
function updatePerformanceMetrics(metricsData) {
    // Productivity metrics
    if (metricsData.productivity) {
        document.getElementById('weekly-productivity').textContent = metricsData.productivity.weekly || 'N/A';
        document.getElementById('monthly-productivity').textContent = metricsData.productivity.monthly || 'N/A';
    }
    
    // Achievements
    const achievementsList = document.getElementById('achievements-list');
    achievementsList.innerHTML = '';
    
    metricsData.achievements.forEach(achievement => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${achievement.date}:</strong> ${achievement.description}
            <span class="achievement-impact">Impact: ${achievement.impact}/5</span>
        `;
        achievementsList.appendChild(li);
    });
    
    // Performance reviews
    const reviewsContainer = document.getElementById('performance-reviews');
    reviewsContainer.innerHTML = '';
    
    metricsData.performanceReviews.forEach(review => {
        reviewsContainer.appendChild(createReviewCard(review));
    });
}

// Update career strategy
function updateCareerStrategy(strategyData) {
    document.getElementById('five-year-plan').textContent = strategyData.fiveYearPlan || "Not yet defined";
    document.getElementById('ten-year-vision').textContent = strategyData.tenYearVision || "Not yet defined";
    document.getElementById('legacy-goals').textContent = strategyData.legacyGoals || "Not yet defined";
}

// Set up event listeners for professional module
function setupProfessionalEventListeners() {
    // View switching
    document.getElementById('professional-view-selector').addEventListener('change', function() {
        switchProfessionalView(this.value);
    });
    
    // Add goal button
    document.getElementById('add-professional-goal').addEventListener('click', showGoalModal);
    
    // Add skill button
    document.getElementById('add-new-skill').addEventListener('click', showSkillModal);
    
    // Add resource button
    document.getElementById('add-learning-resource').addEventListener('click', showResourceModal);
    
    // Add application button
    document.getElementById('add-application').addEventListener('click', showApplicationModal);
    
    // Form submissions
    document.getElementById('goal-form').addEventListener('submit', saveProfessionalGoal);
    document.getElementById('skill-form').addEventListener('submit', saveSkill);
    document.getElementById('resource-form').addEventListener('submit', saveLearningResource);
    document.getElementById('application-form').addEventListener('submit', saveJobApplication);
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', closeModal);
    });
    
    // Cancel buttons
    document.getElementById('cancel-goal').addEventListener('click', closeModal);
    document.getElementById('cancel-skill').addEventListener('click', closeModal);
    document.getElementById('cancel-resource').addEventListener('click', closeModal);
    document.getElementById('cancel-application').addEventListener('click', closeModal);
}

// Switch between professional views
function switchProfessionalView(view) {
    // Hide all views
    document.querySelectorAll('.professional-view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show selected view
    document.getElementById(`professional-${view}`).classList.add('active');
    
    // Update URL hash
    window.location.hash = view;
    
    // Load view-specific data if needed
    switch(view) {
        case 'skills':
            loadSkillsData();
            break;
        case 'jobhunt':
            loadJobHuntData();
            break;
        case 'learning':
            loadLearningData();
            break;
        default:
            updateProfessionalDashboard();
    }
}

// Show goal modal
function showGoalModal() {
    document.getElementById('goal-modal').classList.add('active');
    document.getElementById('goal-title').focus();
}

// Show skill modal
function showSkillModal() {
    document.getElementById('skill-modal').classList.add('active');
    document.getElementById('skill-name').focus();
}

// Show resource modal
function showResourceModal() {
    document.getElementById('resource-modal').classList.add('active');
    document.getElementById('resource-title').focus();
}

// Show application modal
function showApplicationModal() {
    document.getElementById('application-modal').classList.add('active');
    document.getElementById('application-position').focus();
}

// Close modal
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Save professional goal
function saveProfessionalGoal(e) {
    e.preventDefault();
    
    const goal = {
        title: document.getElementById('goal-title').value,
        category: document.getElementById('goal-category').value,
        deadline: document.getElementById('goal-deadline').value,
        notes: document.getElementById('goal-notes').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'active'
    };
    
    const userId = firebase.auth().currentUser.uid;
    
    firebase.firestore().collection('users').doc(userId).collection('professional').doc('data').update({
        'goals': firebase.firestore.FieldValue.arrayUnion(goal)
    })
    .then(() => {
        showToast('Goal saved successfully', 'success');
        closeModal();
        updateProfessionalDashboard();
    })
    .catch(error => {
        console.error("Error saving goal:", error);
        showToast('Failed to save goal', 'error');
    });
}

// Save skill
function saveSkill(e) {
    e.preventDefault();
    
    const skill = {
        name: document.getElementById('skill-name').value,
        category: document.getElementById('skill-category').value,
        currentLevel: document.getElementById('skill-level').value,
        targetLevel: document.getElementById('skill-goal').value || document.getElementById('skill-level').value,
        description: document.getElementById('skill-description').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const userId = firebase.auth().currentUser.uid;
    const skillPath = `skills.${skill.category}.${skill.name.replace(/\s+/g, '_')}`;
    
    firebase.firestore().collection('users').doc(userId).collection('professional').doc('data').update({
        [skillPath]: {
            level: parseInt(skill.currentLevel),
            target: parseInt(skill.targetLevel),
            resources: []
        }
    })
    .then(() => {
        showToast('Skill saved successfully', 'success');
        closeModal();
        loadSkillsData();
    })
    .catch(error => {
        console.error("Error saving skill:", error);
        showToast('Failed to save skill', 'error');
    });
}

// Save learning resource
function saveLearningResource(e) {
    e.preventDefault();
    
    const resource = {
        title: document.getElementById('resource-title').value,
        type: document.getElementById('resource-type').value,
        status: document.getElementById('resource-status').value,
        author: document.getElementById('resource-author').value,
        url: document.getElementById('resource-url').value,
        duration: document.getElementById('resource-pages').value,
        progress: parseInt(document.getElementById('resource-progress').value) || 0,
        description: document.getElementById('resource-description').value,
        skills: document.getElementById('resource-skills').value.split(',').map(s => s.trim()),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const userId = firebase.auth().currentUser.uid;
    const status = resource.status === 'completed' ? 'completedCourses' : 
                  resource.status === 'in-progress' ? 'currentCourses' : 'plannedCourses';
    
    firebase.firestore().collection('users').doc(userId).collection('professional').doc('data').update({
        [`learningPlan.${status}`]: firebase.firestore.FieldValue.arrayUnion(resource)
    })
    .then(() => {
        showToast('Resource saved successfully', 'success');
        closeModal();
        loadLearningData();
    })
    .catch(error => {
        console.error("Error saving resource:", error);
        showToast('Failed to save resource', 'error');
    });
}

// Save job application
function saveJobApplication(e) {
    e.preventDefault();
    
    const application = {
        position: document.getElementById('application-position').value,
        company: document.getElementById('application-company').value,
        date: document.getElementById('application-date').value || new Date().toISOString().split('T')[0],
        status: document.getElementById('application-status').value,
        notes: document.getElementById('application-notes').value,
        source: document.getElementById('application-source').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const userId = firebase.auth().currentUser.uid;
    
    firebase.firestore().collection('users').doc(userId).collection('professional').doc('data').update({
        'jobSearch.applications': firebase.firestore.FieldValue.arrayUnion(application)
    })
    .then(() => {
        showToast('Application saved successfully', 'success');
        closeModal();
        loadJobHuntData();
    })
    .catch(error => {
        console.error("Error saving application:", error);
        showToast('Failed to save application', 'error');
    });
}

// Update professional dashboard with summary data
function updateProfessionalDashboard() {
    const userId = firebase.auth().currentUser.uid;
    
    firebase.firestore().collection('users').doc(userId).collection('professional').doc('data').get()
        .then(doc => {
            if (doc.exists) {
                const data = doc.data();
                
                // Update quick stats
                document.getElementById('total-relationships').textContent = data.networkingContacts?.length || 0;
                document.getElementById('recent-interactions').textContent = data.recentInteractions?.length || 0;
                document.getElementById('important-relationships').textContent = data.importantContacts?.length || 0;
                
                // Update skill summary
                const technicalSkills = Object.keys(data.skills?.technical || {}).length;
                const professionalSkills = Object.keys(data.skills?.professional || {}).length;
                document.getElementById('technical-skills-count').textContent = technicalSkills;
                document.getElementById('professional-skills-count').textContent = professionalSkills;
                
                // Update learning progress
                const completedCourses = data.learningPlan?.completedCourses?.length || 0;
                const inProgressCourses = data.learningPlan?.currentCourses?.length || 0;
                document.getElementById('completed-courses-count').textContent = completedCourses;
                document.getElementById('in-progress-courses-count').textContent = inProgressCourses;
                
                // Update job search stats
                const applications = data.jobSearch?.applications?.length || 0;
                const interviews = data.jobSearch?.applications?.filter(app => app.status === 'Interview').length || 0;
                document.getElementById('applications-count').textContent = applications;
                document.getElementById('interviews-count').textContent = interviews;
                
                // Render charts
                renderProfessionalCharts(data);
            }
        })
        .catch(error => {
            console.error("Error updating dashboard:", error);
        });
}

// Render professional charts
function renderProfessionalCharts(data) {
    // Skill distribution chart
    const skillCtx = document.getElementById('skill-distribution-chart').getContext('2d');
    new Chart(skillCtx, {
        type: 'doughnut',
        data: {
            labels: ['Technical', 'Professional', 'Domain'],
            datasets: [{
                data: [
                    Object.keys(data.skills?.technical || {}).length,
                    Object.keys(data.skills?.professional || {}).length,
                    Object.keys(data.skills?.domain || {}).length
                ],
                backgroundColor: ['#6200ea', '#03dac6', '#ffab00']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Learning progress chart
    const learningCtx = document.getElementById('learning-progress-chart').getContext('2d');
    new Chart(learningCtx, {
        type: 'bar',
        data: {
            labels: ['Planned', 'In Progress', 'Completed'],
            datasets: [{
                label: 'Courses',
                data: [
                    data.learningPlan?.plannedCourses?.length || 0,
                    data.learningPlan?.currentCourses?.length || 0,
                    data.learningPlan?.completedCourses?.length || 0
                ],
                backgroundColor: ['#ffab00', '#6200ea', '#4caf50']
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Helper function to format dates
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Helper function to show toast notifications
function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Initialize professional module when DOM is loaded
if (document.getElementById('professional')) {
    initProfessionalModule();
}