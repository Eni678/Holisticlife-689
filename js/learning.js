// learning.js - Ultimate Learning Management System

// Configuration
const learningConfig = {
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
  };
  
  // Initialize Learning Module
  function initLearningModule() {
    loadLearningData();
    setupLearningListeners();
    initializeSkillChart();
    
    // Load recommendations if enabled
    if (localStorage.getItem('enableRecommendations') === 'true') {
      loadRecommendations();
    }
  }
  
  // Load Learning Data
  function loadLearningData() {
    const userId = window.firebaseAuth.currentUser.uid;
    
    // Load skills
    window.firebaseDB.collection('users').doc(userId)
      .collection('skills')
      .orderBy('lastPracticed', 'desc')
      .onSnapshot(snapshot => {
        const skills = [];
        snapshot.forEach(doc => {
          skills.push({ id: doc.id, ...doc.data() });
        });
        renderSkills(skills);
      });
    
    // Load resources
    window.firebaseDB.collection('users').doc(userId)
      .collection('resources')
      .orderBy('addedDate', 'desc')
      .onSnapshot(snapshot => {
        const resources = [];
        snapshot.forEach(doc => {
          resources.push({ id: doc.id, ...doc.data() });
        });
        renderResources(resources);
      });
    
    // Load notes
    window.firebaseDB.collection('users').doc(userId)
      .collection('knowledgeNotes')
      .orderBy('updatedAt', 'desc')
      .limit(10)
      .onSnapshot(snapshot => {
        const notes = [];
        snapshot.forEach(doc => {
          notes.push({ id: doc.id, ...doc.data() });
        });
        renderNotes(notes);
      });
  }
  
  // Setup Event Listeners
  function setupLearningListeners() {
    // Add buttons
    document.getElementById('add-learning-resource').addEventListener('click', openResourceModal);
    document.getElementById('add-new-skill').addEventListener('click', openSkillModal);
    document.getElementById('create-note').addEventListener('click', openNoteModal);
    
    // Resource tabs
    document.querySelectorAll('.resource-tab').forEach(tab => {
      tab.addEventListener('click', filterResources);
    });
    
    // Knowledge tabs
    document.querySelectorAll('.knowledge-tab').forEach(tab => {
      tab.addEventListener('click', filterNotes);
    });
    
    // Skill filter
    document.getElementById('skill-category-filter').addEventListener('change', filterSkills);
    
    // Resource search
    document.getElementById('resource-search').addEventListener('input', searchResources);
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', closeAllModals);
    });
    
    // Cancel buttons
    document.getElementById('cancel-resource').addEventListener('click', closeAllModals);
    document.getElementById('cancel-skill').addEventListener('click', closeAllModals);
    document.getElementById('cancel-note').addEventListener('click', closeAllModals);
    
    // Form submissions
    document.getElementById('resource-form').addEventListener('submit', saveResource);
    document.getElementById('skill-form').addEventListener('submit', saveSkill);
    document.getElementById('note-form').addEventListener('submit', saveNote);
  }
  
  // Render Skills
  function renderSkills(skills) {
    const container = document.querySelector('.skills-grid');
    container.innerHTML = '';
    
    skills.forEach(skill => {
      const level = learningConfig.skillLevels.find(l => l.value === skill.level) || 
                   learningConfig.skillLevels[0];
      
      const card = document.createElement('div');
      card.className = 'skill-card';
      card.innerHTML = `
        <div class="skill-header">
          <h4>${skill.name}</h4>
          <div class="skill-level" style="background: ${level.color}22; color: ${level.color}">
            ${level.label}
          </div>
        </div>
        <div class="skill-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${skill.progress || 0}%; background: ${level.color}"></div>
          </div>
          <span>${skill.progress || 0}%</span>
        </div>
        <div class="skill-meta">
          <div class="meta-item">
            <i class="fas fa-clock"></i>
            <span>${formatTimeInvestment(skill.timeInvested)}</span>
          </div>
          <div class="meta-item">
            <i class="fas fa-calendar"></i>
            <span>Last: ${formatLastPracticed(skill.lastPracticed)}</span>
          </div>
        </div>
        <div class="skill-actions">
          <button class="btn-icon skill-edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon skill-log">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      `;
      
      // Add event listeners
      card.querySelector('.skill-edit').addEventListener('click', () => editSkill(skill));
      card.querySelector('.skill-log').addEventListener('click', () => logSkillPractice(skill));
      
      container.appendChild(card);
    });
  }
  
  // Render Resources
  function renderResources(resources) {
    const container = document.querySelector('.resources-grid');
    container.innerHTML = '';
    
    resources.forEach(resource => {
      const type = learningConfig.resourceTypes.find(t => t.value === resource.type) || 
                  learningConfig.resourceTypes[learningConfig.resourceTypes.length - 1];
      
      const card = document.createElement('div');
      card.className = 'resource-card';
      card.dataset.type = resource.type;
      card.dataset.status = resource.status || 'not-started';
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
            `<i class="fas fa-${type.icon}"></i>`}
        </div>
        <div class="resource-content">
          <h4>${resource.title}</h4>
          <div class="resource-meta">
            <span class="resource-author">${resource.author || 'Unknown author'}</span>
            <span class="resource-pages">${formatResourceLength(resource)}</span>
          </div>
          <div class="resource-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${resource.progress || 0}%"></div>
            </div>
          </div>
          <div class="resource-actions">
            <button class="btn-icon resource-review">
              <i class="fas fa-star"></i>
            </button>
            <button class="btn-icon resource-notes">
              <i class="fas fa-file-alt"></i>
            </button>
          </div>
        </div>
      `;
      
      // Add event listeners
      card.addEventListener('click', () => viewResourceDetails(resource));
      card.querySelector('.resource-review').addEventListener('click', (e) => {
        e.stopPropagation();
        reviewResource(resource);
      });
      card.querySelector('.resource-notes').addEventListener('click', (e) => {
        e.stopPropagation();
        viewResourceNotes(resource);
      });
      
      container.appendChild(card);
    });
  }
  
  // Render Notes
  function renderNotes(notes) {
    const container = document.querySelector('.notes-list');
    container.innerHTML = '';
    
    notes.forEach(note => {
      const card = document.createElement('div');
      card.className = 'note-card';
      card.innerHTML = `
        <div class="note-header">
          <h4>${note.title}</h4>
          <div class="note-meta">
            <span class="note-category">${note.category || 'Uncategorized'}</span>
            <span class="note-date">${formatNoteDate(note.updatedAt)}</span>
          </div>
        </div>
        <div class="note-preview">
          ${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}
        </div>
        <div class="note-actions">
          <button class="btn-icon note-edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon note-favorite">
            <i class="fas fa-star${note.favorite ? '' : '-o'}"></i>
          </button>
        </div>
      `;
      
      // Add event listeners
      card.querySelector('.note-edit').addEventListener('click', () => editNote(note));
      card.querySelector('.note-favorite').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleNoteFavorite(note);
      });
      card.addEventListener('click', () => viewNote(note));
      
      container.appendChild(card);
    });
  }
  
  // Open Resource Modal
  function openResourceModal(resource = null) {
    const modal = document.getElementById('resource-modal');
    const form = document.getElementById('resource-form');
    
    if (resource) {
      // Edit mode
      document.getElementById('resource-title').value = resource.title;
      document.getElementById('resource-type').value = resource.type;
      document.getElementById('resource-status').value = resource.status || 'not-started';
      document.getElementById('resource-author').value = resource.author || '';
      document.getElementById('resource-url').value = resource.url || '';
      document.getElementById('resource-pages').value = resource.length || '';
      document.getElementById('resource-progress').value = resource.progress || 0;
      document.getElementById('resource-description').value = resource.description || '';
      document.getElementById('resource-skills').value = resource.skills ? resource.skills.join(', ') : '';
      
      form.dataset.mode = 'edit';
      form.dataset.resourceId = resource.id;
    } else {
      // Add mode
      form.reset();
      form.dataset.mode = 'add';
      delete form.dataset.resourceId;
    }
    
    modal.classList.add('active');
  }
  
  // Open Skill Modal
  function openSkillModal(skill = null) {
    const modal = document.getElementById('skill-modal');
    const form = document.getElementById('skill-form');
    
    if (skill) {
      // Edit mode
      document.getElementById('skill-name').value = skill.name;
      document.getElementById('skill-category').value = skill.category;
      document.getElementById('skill-level').value = skill.level;
      document.getElementById('skill-goal').value = skill.goalLevel || '';
      document.getElementById('skill-description').value = skill.description || '';
      
      form.dataset.mode = 'edit';
      form.dataset.skillId = skill.id;
    } else {
      // Add mode
      form.reset();
      form.dataset.mode = 'add';
      delete form.dataset.skillId;
    }
    
    modal.classList.add('active');
  }
  
  // Open Note Modal
  function openNoteModal(note = null) {
    const modal = document.getElementById('note-modal');
    const form = document.getElementById('note-form');
    const title = document.getElementById('note-modal-title');
    
    if (note) {
      // Edit mode
      title.textContent = 'Edit Note';
      document.getElementById('note-title').value = note.title;
      document.getElementById('note-category').value = note.category || '';
      document.getElementById('note-tags').value = note.tags ? note.tags.join(', ') : '';
      document.getElementById('note-content').value = note.content;
      
      form.dataset.mode = 'edit';
      form.dataset.noteId = note.id;
    } else {
      // Add mode
      title.textContent = 'New Note';
      form.reset();
      form.dataset.mode = 'add';
      delete form.dataset.noteId;
    }
    
    modal.classList.add('active');
  }
  
  // Close All Modals
  function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('active');
    });
  }
  
  // Save Resource
  async function saveResource(e) {
    e.preventDefault();
    
    const form = e.target;
    const userId = window.firebaseAuth.currentUser.uid;
    
    const resourceData = {
      title: document.getElementById('resource-title').value,
      type: document.getElementById('resource-type').value,
      status: document.getElementById('resource-status').value,
      author: document.getElementById('resource-author').value || null,
      url: document.getElementById('resource-url').value || null,
      length: document.getElementById('resource-pages').value || null,
      progress: parseInt(document.getElementById('resource-progress').value) || 0,
      description: document.getElementById('resource-description').value || null,
      skills: document.getElementById('resource-skills').value
        .split(',')
        .map(s => s.trim())
        .filter(s => s),
      updatedAt: new Date().toISOString()
    };
    
    if (form.dataset.mode === 'add') {
      resourceData.addedDate = new Date().toISOString();
    }
    
    try {
      if (form.dataset.mode === 'edit') {
        await window.firebaseDB.collection('users').doc(userId)
          .collection('resources')
          .doc(form.dataset.resourceId)
          .update(resourceData);
      } else {
        await window.firebaseDB.collection('users').doc(userId)
          .collection('resources')
          .add(resourceData);
      }
      
      closeAllModals();
      showToast('Resource saved successfully');
    } catch (error) {
      console.error('Error saving resource:', error);
      showToast('Error saving resource', 'error');
    }
  }
  
  // Save Skill
  async function saveSkill(e) {
    e.preventDefault();
    
    const form = e.target;
    const userId = window.firebaseAuth.currentUser.uid;
    
    const skillData = {
      name: document.getElementById('skill-name').value,
      category: document.getElementById('skill-category').value,
      level: document.getElementById('skill-level').value,
      goalLevel: document.getElementById('skill-goal').value || null,
      description: document.getElementById('skill-description').value || null,
      lastPracticed: new Date().toISOString()
    };
    
    try {
      if (form.dataset.mode === 'edit') {
        await window.firebaseDB.collection('users').doc(userId)
          .collection('skills')
          .doc(form.dataset.skillId)
          .update(skillData);
      } else {
        skillData.timeInvested = 0;
        skillData.progress = 0;
        skillData.createdAt = new Date().toISOString();
        
        await window.firebaseDB.collection('users').doc(userId)
          .collection('skills')
          .add(skillData);
      }
      
      closeAllModals();
      showToast('Skill saved successfully');
    } catch (error) {
      console.error('Error saving skill:', error);
      showToast('Error saving skill', 'error');
    }
  }
  
  // Save Note
  async function saveNote(e) {
    e.preventDefault();
    
    const form = e.target;
    const userId = window.firebaseAuth.currentUser.uid;
    
    const noteData = {
      title: document.getElementById('note-title').value,
      category: document.getElementById('note-category').value || null,
      tags: document.getElementById('note-tags').value
        .split(',')
        .map(t => t.trim())
        .filter(t => t),
      content: document.getElementById('note-content').value,
      updatedAt: new Date().toISOString()
    };
    
    try {
      if (form.dataset.mode === 'edit') {
        await window.firebaseDB.collection('users').doc(userId)
          .collection('knowledgeNotes')
          .doc(form.dataset.noteId)
          .update(noteData);
      } else {
        noteData.createdAt = new Date().toISOString();
        noteData.favorite = false;
        
        await window.firebaseDB.collection('users').doc(userId)
          .collection('knowledgeNotes')
          .add(noteData);
      }
      
      closeAllModals();
      showToast('Note saved successfully');
    } catch (error) {
      console.error('Error saving note:', error);
      showToast('Error saving note', 'error');
    }
  }
  
  // Edit Skill
  function editSkill(skill) {
    openSkillModal(skill);
  }
  
  // Log Skill Practice
  function logSkillPractice(skill) {
    // In a real app, this would open a modal to log practice time
    const minutes = prompt(`How many minutes did you practice ${skill.name}?`, '30');
    
    if (minutes && !isNaN(minutes)) {
      const userId = window.firebaseAuth.currentUser.uid;
      const practiceTime = parseInt(minutes);
      
      window.firebaseDB.collection('users').doc(userId)
        .collection('skills')
        .doc(skill.id)
        .update({
          timeInvested: (skill.timeInvested || 0) + practiceTime,
          lastPracticed: new Date().toISOString(),
          progress: calculateNewProgress(skill, practiceTime)
        })
        .then(() => {
          showToast('Practice session logged successfully');
        })
        .catch(error => {
          console.error('Error logging practice:', error);
          showToast('Error logging practice', 'error');
        });
    }
  }
  
  // View Resource Details
  function viewResourceDetails(resource) {
    // In a real app, this would open a detailed view
    alert(`Viewing details for: ${resource.title}\n\nStatus: ${formatStatus(resource.status)}\nProgress: ${resource.progress || 0}%`);
  }
  
  // Review Resource
  function reviewResource(resource) {
    const rating = prompt(`Rate "${resource.title}" (1-5 stars):`, '5');
    
    if (rating && !isNaN(rating) && rating >= 1 && rating <= 5) {
      const userId = window.firebaseAuth.currentUser.uid;
      
      window.firebaseDB.collection('users').doc(userId)
        .collection('resources')
        .doc(resource.id)
        .update({
          rating: parseInt(rating),
          lastReviewed: new Date().toISOString()
        })
        .then(() => {
          showToast('Resource rating saved');
        })
        .catch(error => {
          console.error('Error saving rating:', error);
          showToast('Error saving rating', 'error');
        });
    }
  }
  
  // View Resource Notes
  function viewResourceNotes(resource) {
    // In a real app, this would show notes for the resource
    alert(`Notes for: ${resource.title}\n\nNo notes yet. Add some insights you've gained from this resource.`);
  }
  
  // Edit Note
  function editNote(note) {
    openNoteModal(note);
  }
  
  // Toggle Note Favorite
  function toggleNoteFavorite(note) {
    const userId = window.firebaseAuth.currentUser.uid;
    const newFavorite = !note.favorite;
    
    window.firebaseDB.collection('users').doc(userId)
      .collection('knowledgeNotes')
      .doc(note.id)
      .update({
        favorite: newFavorite,
        updatedAt: new Date().toISOString()
      })
      .then(() => {
        showToast(newFavorite ? 'Note added to favorites' : 'Note removed from favorites');
      })
      .catch(error => {
        console.error('Error updating note:', error);
        showToast('Error updating note', 'error');
      });
  }
  
  // View Note
  function viewNote(note) {
    // In a real app, this would open a full view of the note
    alert(`Viewing note: ${note.title}\n\n${note.content}`);
  }
  
  // Filter Resources
  function filterResources(e) {
    const tab = e.currentTarget;
    const type = tab.dataset.resource;
    
    // Update active tab
    document.querySelectorAll('.resource-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Filter resources
    const resources = document.querySelectorAll('.resource-card');
    resources.forEach(resource => {
      if (type === 'all' || resource.dataset.type === type) {
        resource.style.display = 'block';
      } else {
        resource.style.display = 'none';
      }
    });
  }
  
  // Filter Notes
  function filterNotes(e) {
    const tab = e.currentTarget;
    const filter = tab.dataset.knowledge;
    
    // Update active tab
    document.querySelectorAll('.knowledge-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // In a real app, this would filter notes
    // Currently just shows all notes since we don't have the data
    showToast(`Showing ${filter} notes`);
  }
  
  // Filter Skills
  function filterSkills() {
    const filter = document.getElementById('skill-category-filter').value;
    const skills = document.querySelectorAll('.skill-card');
    
    skills.forEach(skill => {
      if (filter === 'all') {
        skill.style.display = 'block';
      } else {
        // In a real app, we would check the skill's category
        // For now, we'll just show all
        skill.style.display = 'block';
      }
    });
  }
  
  // Search Resources
  function searchResources() {
    const query = document.getElementById('resource-search').value.toLowerCase();
    const resources = document.querySelectorAll('.resource-card');
    
    resources.forEach(resource => {
      const title = resource.querySelector('h4').textContent.toLowerCase();
      if (title.includes(query)) {
        resource.style.display = 'block';
      } else {
        resource.style.display = 'none';
      }
    });
  }
  
  // Initialize Skill Chart
  function initializeSkillChart() {
    // In a real app, this would create a chart of skill progression
    // For now, we'll just simulate it
    setTimeout(() => {
      showToast('Skill progression chart initialized');
    }, 1000);
  }
  
  // Load Recommendations
  function loadRecommendations() {
    // In a real app, this would fetch personalized recommendations
    setTimeout(() => {
      showToast('New learning recommendations available');
    }, 2000);
  }
  
  // Helper Functions
  function formatTimeInvestment(minutes) {
    if (!minutes) return '0 minutes';
    
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
  }
  
  function formatLastPracticed(dateString) {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  }
  
  function formatStatus(status) {
    const statusMap = {
      'not-started': 'Not Started',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'abandoned': 'Abandoned'
    };
    return statusMap[status] || status;
  }
  
  function formatResourceLength(resource) {
    if (resource.type === 'book') {
      return resource.length ? `${resource.length} pages` : 'Unknown length';
    } else if (resource.type === 'course' || resource.type === 'video') {
      return resource.length ? `${resource.length} hours` : 'Unknown duration';
    } else {
      return resource.length || '';
    }
  }
  
  function formatNoteDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
  
  function calculateNewProgress(skill, practiceMinutes) {
    // Simple algorithm - in a real app, this would be more sophisticated
    const baseProgress = skill.progress || 0;
    const progressPerHour = skill.level === 'beginner' ? 5 : 
                           skill.level === 'intermediate' ? 3 : 
                           skill.level === 'advanced' ? 1 : 0.5;
    
    const progressIncrease = (practiceMinutes / 60) * progressPerHour;
    return Math.min(100, Math.round(baseProgress + progressIncrease));
  }
  
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
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
  
  // Initialize when ready
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('learning')) {
      initLearningModule();
    }
  });