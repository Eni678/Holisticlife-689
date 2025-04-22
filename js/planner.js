// planner.js - Ultimate Daily Planner System

// Configuration
const plannerConfig = {
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
  };
  
  // Initialize Planner Module
  function initPlannerModule() {
    loadPlannerData();
    setupPlannerListeners();
    renderTimeBlocks();
    updateCurrentTimeIndicator();
    setupTaskTabs();
    
    // Update current time indicator every minute
    setInterval(updateCurrentTimeIndicator, 60000);
  }
  
  // Load Planner Data
  function loadPlannerData() {
    const userId = window.firebaseAuth.currentUser.uid;
    const today = new Date().toISOString().split('T')[0];
    
    // Load time blocks
    window.firebaseDB.collection('users').doc(userId)
      .collection('timeBlocks')
      .where('date', '==', today)
      .onSnapshot(snapshot => {
        const timeBlocks = [];
        snapshot.forEach(doc => {
          timeBlocks.push({ id: doc.id, ...doc.data() });
        });
        renderTimeBlocks(timeBlocks);
      });
    
    // Load tasks
    window.firebaseDB.collection('users').doc(userId)
      .collection('tasks')
      .where('status', '!=', 'completed')
      .orderBy('dueDate')
      .onSnapshot(snapshot => {
        const tasks = [];
        snapshot.forEach(doc => {
          tasks.push({ id: doc.id, ...doc.data() });
        });
        renderTasks(tasks);
      });
  }
  
  // Setup Event Listeners
  function setupPlannerListeners() {
    // Date navigation
    document.getElementById('prev-day').addEventListener('click', navigateDate.bind(null, -1));
    document.getElementById('next-day').addEventListener('click', navigateDate.bind(null, 1));
    
    // Quick add button
    document.getElementById('quick-add').addEventListener('click', openTaskModal);
    
    // Task input
    document.getElementById('add-task-btn').addEventListener('click', addNewTask);
    document.getElementById('new-task-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addNewTask();
    });
    
    // Task modal
    document.querySelector('.close-modal').addEventListener('click', closeTaskModal);
    document.getElementById('cancel-task').addEventListener('click', closeTaskModal);
    document.getElementById('task-form').addEventListener('submit', saveTask);
    
    // Time block creation
    document.querySelector('.time-blocks').addEventListener('dblclick', createTimeBlock);
  }
  
  // Date Navigation
  function navigateDate(days) {
    const currentDate = document.getElementById('current-planner-date');
    const date = new Date(currentDate.textContent);
    date.setDate(date.getDate() + days);
    
    currentDate.textContent = formatDate(date);
    loadPlannerData();
  }
  
  // Time Block Rendering
  function renderTimeBlocks(timeBlocks = []) {
    const container = document.querySelector('.time-blocks');
    container.innerHTML = '';
    
    // Create time block elements
    timeBlocks.forEach(block => {
      const blockElement = document.createElement('div');
      blockElement.className = 'time-block';
      blockElement.style.top = `${timeToPosition(block.startTime)}px`;
      blockElement.style.height = `${durationToHeight(block.duration)}px`;
      blockElement.style.backgroundColor = plannerConfig.timeBlockColors[block.type] || plannerConfig.timeBlockColors.other;
      blockElement.innerHTML = `
        <div class="time-block-title">${block.title}</div>
        <div class="time-block-time">${formatTime(block.startTime)} - ${formatTime(block.endTime)}</div>
      `;
      blockElement.addEventListener('click', () => editTimeBlock(block));
      container.appendChild(blockElement);
    });
    
    // Create time scale
    const timeScale = document.querySelector('.time-scale');
    timeScale.innerHTML = '';
    
    for (let hour = plannerConfig.workHours.start; hour <= plannerConfig.workHours.end; hour++) {
      const timeItem = document.createElement('div');
      timeItem.className = 'time-scale-item';
      timeItem.textContent = formatHour(hour);
      timeScale.appendChild(timeItem);
    }
  }
  
  // Create Time Block
  function createTimeBlock(e) {
    const container = document.querySelector('.time-blocks');
    const rect = container.getBoundingClientRect();
    const yPosition = e.clientY - rect.top;
    
    // Calculate time based on position
    const minutesFromTop = positionToMinutes(yPosition);
    const startTime = minutesToTime(minutesFromTop);
    const endTime = minutesToTime(minutesFromTop + plannerConfig.defaultTaskDuration);
    
    // Open modal with pre-filled time
    document.getElementById('task-title').value = 'New Time Block';
    document.getElementById('task-estimate').value = `${plannerConfig.defaultTaskDuration}m`;
    document.getElementById('task-due-date').value = document.getElementById('current-planner-date').textContent;
    
    // Set time block specific fields
    // (You might want to add type selector in your modal)
    
    openTaskModal();
  }
  
  // Task Management
  function renderTasks(tasks) {
    const inboxContainer = document.getElementById('inbox-tasks');
    const scheduledContainer = document.getElementById('scheduled-tasks');
    
    inboxContainer.innerHTML = '';
    scheduledContainer.innerHTML = '';
    
    tasks.forEach(task => {
      const taskElement = document.createElement('div');
      taskElement.className = 'task-item';
      taskElement.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${task.status === 'completed' ? 'checked' : ''}>
        <span class="task-title ${task.status === 'completed' ? 'completed' : ''}">${task.title}</span>
        <div class="task-actions">
          <button class="task-btn edit-task" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="task-btn delete-task" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      `;
      
      // Add event listeners
      const checkbox = taskElement.querySelector('.task-checkbox');
      checkbox.addEventListener('change', () => toggleTaskComplete(task.id, checkbox.checked));
      
      const editBtn = taskElement.querySelector('.edit-task');
      editBtn.addEventListener('click', () => editTask(task));
      
      const deleteBtn = taskElement.querySelector('.delete-task');
      deleteBtn.addEventListener('click', () => deleteTask(task.id));
      
      // Add to appropriate container
      if (task.dueDate) {
        scheduledContainer.appendChild(taskElement);
      } else {
        inboxContainer.appendChild(taskElement);
      }
    });
  }
  
  // Task Modal Functions
  function openTaskModal(task = null) {
    const modal = document.getElementById('task-modal');
    const form = document.getElementById('task-form');
    
    if (task) {
      // Edit mode
      document.getElementById('task-title').value = task.title;
      document.getElementById('task-description').value = task.description || '';
      document.getElementById('task-due-date').value = task.dueDate || '';
      document.getElementById('task-priority').value = task.priority || 'medium';
      document.getElementById('task-estimate').value = task.timeEstimate || '';
      document.getElementById('task-energy').value = task.energyLevel || 'medium';
      
      // Set Eisenhower matrix
      const eisenhower = document.querySelector(`input[name="eisenhower"][value="${task.eisenhower || 'not-urgent-important'}"]`);
      if (eisenhower) eisenhower.checked = true;
      
      form.dataset.mode = 'edit';
      form.dataset.taskId = task.id;
    } else {
      // Add mode
      form.reset();
      form.dataset.mode = 'add';
      delete form.dataset.taskId;
    }
    
    modal.classList.add('active');
  }
  
  function closeTaskModal() {
    document.getElementById('task-modal').classList.remove('active');
  }
  
  function saveTask(e) {
    e.preventDefault();
    
    const form = e.target;
    const userId = window.firebaseAuth.currentUser.uid;
    
    const taskData = {
      title: document.getElementById('task-title').value,
      description: document.getElementById('task-description').value,
      dueDate: document.getElementById('task-due-date').value,
      priority: document.getElementById('task-priority').value,
      timeEstimate: document.getElementById('task-estimate').value,
      energyLevel: document.getElementById('task-energy').value,
      eisenhower: document.querySelector('input[name="eisenhower"]:checked').value,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    if (form.dataset.mode === 'edit') {
      // Update existing task
      window.firebaseDB.collection('users').doc(userId)
        .collection('tasks')
        .doc(form.dataset.taskId)
        .update(taskData);
    } else {
      // Add new task
      window.firebaseDB.collection('users').doc(userId)
        .collection('tasks')
        .add(taskData);
    }
    
    closeTaskModal();
  }
  
  // Task Actions
  function toggleTaskComplete(taskId, completed) {
    const userId = window.firebaseAuth.currentUser.uid;
    
    window.firebaseDB.collection('users').doc(userId)
      .collection('tasks')
      .doc(taskId)
      .update({
        status: completed ? 'completed' : 'active',
        completedAt: completed ? new Date().toISOString() : null
      });
  }
  
  function editTask(task) {
    openTaskModal(task);
  }
  
  function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
      const userId = window.firebaseAuth.currentUser.uid;
      
      window.firebaseDB.collection('users').doc(userId)
        .collection('tasks')
        .doc(taskId)
        .delete();
    }
  }
  
  // Quick Task Add
  function addNewTask() {
    const input = document.getElementById('new-task-input');
    const title = input.value.trim();
    
    if (title) {
      const userId = window.firebaseAuth.currentUser.uid;
      
      window.firebaseDB.collection('users').doc(userId)
        .collection('tasks')
        .add({
          title,
          status: 'active',
          createdAt: new Date().toISOString()
        });
      
      input.value = '';
    }
  }
  
  // Time Indicator
  function updateCurrentTimeIndicator() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    if (currentHour >= plannerConfig.workHours.start && currentHour <= plannerConfig.workHours.end) {
      const position = timeToPosition(currentHour * 60 + currentMinute);
      const indicator = document.querySelector('.current-time-indicator') || document.createElement('div');
      
      indicator.className = 'current-time-indicator';
      indicator.style.top = `${position}px`;
      
      if (!document.querySelector('.current-time-indicator')) {
        document.querySelector('.time-blocks').appendChild(indicator);
      }
    } else {
      const indicator = document.querySelector('.current-time-indicator');
      if (indicator) indicator.remove();
    }
  }
  
  // Tab System
  function setupTaskTabs() {
    const tabs = document.querySelectorAll('.task-tab');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.task-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.task-tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Show corresponding content
        const tabName = tab.dataset.tab;
        document.getElementById(`${tabName}-tab`).classList.add('active');
      });
    });
  }
  
  // Helper Functions
  function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${ampm}`;
  }
  
  function formatHour(hour) {
    const displayHour = hour % 12 || 12;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${displayHour} ${ampm}`;
  }
  
  function timeToPosition(minutes) {
    const startMinutes = plannerConfig.workHours.start * 60;
    return (minutes - startMinutes) * (60 / 60); // 1 minute = 1px
  }
  
  function positionToMinutes(position) {
    return Math.round(position / (60 / 60)) + (plannerConfig.workHours.start * 60);
  }
  
  function durationToHeight(duration) {
    return duration * (60 / 60); // 1 minute = 1px
  }
  
  function minutesToTime(minutes) {
    return minutes;
  }
  
  // Initialize when ready
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('daily')) {
      initPlannerModule();
    }
  });