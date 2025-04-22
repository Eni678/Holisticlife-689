// Initialize dashboard
function loadDashboard() {
    updateDateTime();
    setInterval(updateDateTime, 60000);
    loadGoalProgress();
    initializeCharts();
    loadDeadlines();
    loadProjectProgress();
}

// Date & Time Display
function updateDateTime() {
    const now = new Date();
    document.getElementById('current-date').textContent = 
        now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    document.getElementById('current-time').textContent = 
        now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
}

// Goal Progress Tracking
function loadGoalProgress() {
    const userId = window.firebaseAuth.currentUser.uid;
    const today = new Date().toISOString().split('T')[0];
    
    window.firebaseDB.collection('users').doc(userId).collection('dailyTasks')
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
            updateGoalProgressBars(completed, total);
        });
}

function updateProgressCircle(percentage) {
    const circle = document.querySelector('.progress-circle');
    circle.style.background = 
        `conic-gradient(var(--primary-color) ${percentage}%, var(--gray-color) 0)`;
    document.querySelector('.progress-value').textContent = `${percentage}%`;
}

// Project Progress Bars
function loadProjectProgress() {
    const userId = window.firebaseAuth.currentUser.uid;
    
    window.firebaseDB.collection('users').doc(userId).collection('projects')
        .where('status', '==', 'active')
        .onSnapshot(snapshot => {
            const container = document.getElementById('project-progress');
            container.innerHTML = '';
            
            snapshot.forEach(doc => {
                const project = doc.data();
                const progress = Math.round((project.current / project.target) * 100);
                
                const projectEl = document.createElement('div');
                projectEl.className = 'project-item';
                projectEl.innerHTML = `
                    <div class="project-header">
                        <h4>${project.name}</h4>
                        <span>${progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="project-meta">
                        <span>${project.current}/${project.target} ${project.unit}</span>
                        <span>Due: ${project.deadline.toDate().toLocaleDateString()}</span>
                    </div>
                `;
                container.appendChild(projectEl);
            });
        });
}

// Charts
function initializeCharts() {
    // Focus Areas Doughnut Chart
    const focusCtx = document.getElementById('focusChart').getContext('2d');
    new Chart(focusCtx, {
        type: 'doughnut',
        data: {
            labels: ['Professional', 'Learning', 'Health', 'Relationships', 'Financial'],
            datasets: [{
                data: [30, 25, 20, 15, 10],
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

    // Growth Line Chart
    const growthCtx = document.getElementById('growthChart').getContext('2d');
    new Chart(growthCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Overall Progress',
                data: [65, 70, 68, 75, 82, 87],
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
}

// Deadline Management
function loadDeadlines() {
    const userId = window.firebaseAuth.currentUser.uid;
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    window.firebaseDB.collection('users').doc(userId).collection('deadlines')
        .where('date', '>=', now)
        .where('date', '<=', nextWeek)
        .onSnapshot(snapshot => {
            const container = document.querySelector('.deadline-list');
            container.innerHTML = '';
            
            snapshot.forEach(doc => {
                const deadline = doc.data();
                const date = deadline.date.toDate();
                const daysLeft = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
                
                const deadlineEl = document.createElement('li');
                deadlineEl.innerHTML = `
                    <span class="deadline-date ${daysLeft <= 3 ? 'urgent' : ''}">
                        ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    ${deadline.title}
                    ${daysLeft <= 0 ? '<span class="badge overdue">Overdue</span>' : 
                     `<span class="days-left">${daysLeft}d left</span>`}
                `;
                container.appendChild(deadlineEl);
            });
        });
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('dashboard')) {
        loadDashboard();
    }
});