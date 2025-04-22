document.addEventListener('DOMContentLoaded', function() {
    // Initialize relationships module
    if (document.getElementById('relationships')) {
        initRelationships();
    }
});

function initRelationships() {
    // Check authentication
    firebaseAuth.onAuthStateChanged(user => {
        if (user) {
            loadRelationships(user.uid);
            setupEventListeners();
        }
    });
}

function setupEventListeners() {
    // Add relationship button
    document.getElementById('add-relationship').addEventListener('click', showRelationshipModal);
    
    // Cancel buttons
    document.getElementById('cancel-relationship').addEventListener('click', hideRelationshipModal);
    document.getElementById('cancel-interaction').addEventListener('click', hideInteractionModal);
    
    // Form submissions
    document.getElementById('relationship-form').addEventListener('submit', saveRelationship);
    document.getElementById('interaction-form').addEventListener('submit', saveInteraction);
    
    // Follow-up checkbox
    document.getElementById('interaction-followup').addEventListener('change', function() {
        document.getElementById('interaction-followup-date').disabled = !this.checked;
    });
    
    // Category filter
    document.getElementById('relationship-category-filter').addEventListener('change', filterRelationships);
}

function loadRelationships(userId) {
    db.collection('users').doc(userId).collection('relationships')
        .orderBy('name')
        .onSnapshot(snapshot => {
            const relationships = [];
            snapshot.forEach(doc => {
                relationships.push({ id: doc.id, ...doc.data() });
            });
            
            updateRelationshipsUI(relationships);
            updateSummaryStats(relationships);
        }, error => {
            console.error("Error loading relationships: ", error);
        });
}

function updateRelationshipsUI(relationships) {
    const container = document.getElementById('relationship-cards-container');
    container.innerHTML = '';
    
    relationships.forEach(relationship => {
        const card = createRelationshipCard(relationship);
        container.appendChild(card);
    });
}

function createRelationshipCard(relationship) {
    const card = document.createElement('div');
    card.className = 'relationship-card';
    card.dataset.id = relationship.id;
    card.dataset.category = relationship.category;
    
    // Format last interaction date if exists
    const lastInteraction = relationship.lastInteractionDate ? 
        new Date(relationship.lastInteractionDate.seconds * 1000).toLocaleDateString() : 
        'No interactions yet';
    
    // Format emotion icon
    let emotionIcon = '😐';
    let emotionClass = 'neutral';
    if (relationship.emotion === 'positive') {
        emotionIcon = '😊';
        emotionClass = 'positive';
    } else if (relationship.emotion === 'negative') {
        emotionIcon = '😞';
        emotionClass = 'negative';
    }
    
    card.innerHTML = `
        <div class="relationship-header">
            <h3 class="relationship-name">${relationship.name}</h3>
            <span class="relationship-category ${relationship.category}">${formatCategory(relationship.category)}</span>
        </div>
        
        <div class="relationship-meta">
            <div class="meta-item">
                <i class="fas fa-star"></i>
                <span>${formatImportance(relationship.importance)}</span>
            </div>
            <div class="meta-item">
                <i class="fas fa-calendar-alt"></i>
                <span>Last: ${lastInteraction}</span>
            </div>
        </div>
        
        <div class="relationship-emotion">
            <span class="emotion-icon ${emotionClass}">${emotionIcon}</span>
            <span>Current feeling: ${formatEmotion(relationship.emotion)}</span>
        </div>
        
        ${relationship.notes ? `<div class="relationship-notes">${relationship.notes}</div>` : ''}
        
        ${relationship.tags && relationship.tags.length > 0 ? `
            <div class="relationship-tags">
                ${relationship.tags.map(tag => `<span class="relationship-tag">${tag}</span>`).join('')}
            </div>
        ` : ''}
        
        <div class="relationship-actions">
            <button class="btn-log-interaction" data-id="${relationship.id}">
                <i class="fas fa-plus"></i> Log Interaction
            </button>
            <button class="btn-view-details" data-id="${relationship.id}">
                View Details <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;
    
    // Add event listeners to the buttons we just created
    card.querySelector('.btn-log-interaction').addEventListener('click', function() {
        showInteractionModal(this.dataset.id);
    });
    
    card.querySelector('.btn-view-details').addEventListener('click', function() {
        viewRelationshipDetails(this.dataset.id);
    });
    
    return card;
}

function updateSummaryStats(relationships) {
    document.getElementById('total-relationships').textContent = relationships.length;
    
    // Calculate recent interactions (last 30 days)
    const recentThreshold = new Date();
    recentThreshold.setDate(recentThreshold.getDate() - 30);
    
    const recentCount = relationships.filter(rel => 
        rel.lastInteractionDate && 
        new Date(rel.lastInteractionDate.seconds * 1000) > recentThreshold
    ).length;
    
    document.getElementById('recent-interactions').textContent = recentCount;
    
    // Calculate important relationships
    const importantCount = relationships.filter(rel => 
        rel.importance === 'high' || rel.importance === 'critical'
    ).length;
    
    document.getElementById('important-relationships').textContent = importantCount;
    
    // Update sentiment chart
    updateSentimentChart(relationships);
}

function updateSentimentChart(relationships) {
    const ctx = document.getElementById('sentimentChart').getContext('2d');
    
    // Count emotions
    const emotionCounts = {
        positive: 0,
        neutral: 0,
        negative: 0
    };
    
    relationships.forEach(rel => {
        if (rel.emotion) {
            emotionCounts[rel.emotion]++;
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
                    '#4CAF50',
                    '#FFC107',
                    '#F44336'
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
                }
            }
        }
    });
}

function filterRelationships() {
    const category = document.getElementById('relationship-category-filter').value;
    const cards = document.querySelectorAll('.relationship-card');
    
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function showRelationshipModal(relationshipId = null) {
    const modal = document.getElementById('relationship-modal');
    const form = document.getElementById('relationship-form');
    
    if (relationshipId) {
        // Edit mode
        document.getElementById('relationship-modal-title').textContent = 'Edit Relationship';
        form.dataset.mode = 'edit';
        form.dataset.id = relationshipId;
        
        // Load relationship data
        const userId = firebaseAuth.currentUser.uid;
        db.collection('users').doc(userId).collection('relationships').doc(relationshipId)
            .get()
            .then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    document.getElementById('relationship-name').value = data.name || '';
                    document.getElementById('relationship-category').value = data.category || '';
                    document.getElementById('relationship-importance').value = data.importance || 'medium';
                    document.getElementById('relationship-contact').value = data.contact || '';
                    document.getElementById('relationship-notes').value = data.notes || '';
                    
                    // Set emotion
                    if (data.emotion) {
                        document.querySelector(`input[name="emotion"][value="${data.emotion}"]`).checked = true;
                    }
                    
                    // Set tags
                    const tagsContainer = document.getElementById('relationship-tags-container');
                    tagsContainer.innerHTML = '';
                    if (data.tags && data.tags.length > 0) {
                        data.tags.forEach(tag => {
                            addTagToContainer(tag, tagsContainer);
                        });
                    }
                }
            });
    } else {
        // Add mode
        document.getElementById('relationship-modal-title').textContent = 'New Relationship';
        form.dataset.mode = 'add';
        form.reset();
        document.getElementById('relationship-tags-container').innerHTML = '';
    }
    
    modal.style.display = 'flex';
}

function hideRelationshipModal() {
    document.getElementById('relationship-modal').style.display = 'none';
}

function showInteractionModal(relationshipId) {
    const modal = document.getElementById('interaction-modal');
    const form = document.getElementById('interaction-form');
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('interaction-date').value = today;
    
    // Set relationship ID
    document.getElementById('interaction-relationship-id').value = relationshipId;
    
    // Reset form
    form.reset();
    document.getElementById('interaction-followup-date').disabled = true;
    
    modal.style.display = 'flex';
}

function hideInteractionModal() {
    document.getElementById('interaction-modal').style.display = 'none';
}

function saveRelationship(e) {
    e.preventDefault();
    
    const form = e.target;
    const userId = firebaseAuth.currentUser.uid;
    const mode = form.dataset.mode;
    
    // Get form values
    const relationshipData = {
        name: document.getElementById('relationship-name').value.trim(),
        category: document.getElementById('relationship-category').value,
        importance: document.getElementById('relationship-importance').value,
        contact: document.getElementById('relationship-contact').value.trim(),
        notes: document.getElementById('relationship-notes').value.trim(),
        emotion: document.querySelector('input[name="emotion"]:checked').value,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        tags: getTagsFromContainer(document.getElementById('relationship-tags-container'))
    };
    
    // Validate
    if (!relationshipData.name || !relationshipData.category) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (mode === 'add') {
        // Add new relationship
        relationshipData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        
        db.collection('users').doc(userId).collection('relationships').add(relationshipData)
            .then(() => {
                hideRelationshipModal();
            })
            .catch(error => {
                console.error("Error adding relationship: ", error);
                alert('Failed to save relationship');
            });
    } else {
        // Update existing relationship
        const relationshipId = form.dataset.id;
        
        db.collection('users').doc(userId).collection('relationships').doc(relationshipId)
            .update(relationshipData)
            .then(() => {
                hideRelationshipModal();
            })
            .catch(error => {
                console.error("Error updating relationship: ", error);
                alert('Failed to update relationship');
            });
    }
}

function saveInteraction(e) {
    e.preventDefault();
    
    const form = e.target;
    const userId = firebaseAuth.currentUser.uid;
    const relationshipId = document.getElementById('interaction-relationship-id').value;
    
    // Get form values
    const interactionData = {
        date: document.getElementById('interaction-date').value,
        type: document.getElementById('interaction-type').value,
        duration: parseInt(document.getElementById('interaction-duration').value) || 0,
        emotion: document.querySelector('input[name="interaction-emotion"]:checked').value,
        notes: document.getElementById('interaction-notes').value.trim(),
        followUp: document.getElementById('interaction-followup').checked,
        followUpDate: document.getElementById('interaction-followup').checked ? 
            document.getElementById('interaction-followup-date').value : null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Validate
    if (!interactionData.date || !interactionData.type || !interactionData.notes) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Save interaction
    db.collection('users').doc(userId).collection('relationships').doc(relationshipId)
        .collection('interactions').add(interactionData)
        .then(() => {
            // Update last interaction date on the relationship
            return db.collection('users').doc(userId).collection('relationships').doc(relationshipId)
                .update({
                    lastInteractionDate: firebase.firestore.FieldValue.serverTimestamp()
                });
        })
        .then(() => {
            hideInteractionModal();
        })
        .catch(error => {
            console.error("Error saving interaction: ", error);
            alert('Failed to save interaction');
        });
}

function viewRelationshipDetails(relationshipId) {
    // In a complete implementation, this would show a detailed view
    // with all interactions, statistics, etc.
    alert('Detailed view would open for relationship ID: ' + relationshipId);
}

// Helper functions
function formatCategory(category) {
    const categories = {
        'family': 'Family',
        'romantic': 'Romantic',
        'friends': 'Friends',
        'professional': 'Professional',
        'spiritual': 'Spiritual'
    };
    return categories[category] || category;
}

function formatImportance(importance) {
    const levels = {
        'low': 'Low Importance',
        'medium': 'Medium Importance',
        'high': 'High Importance',
        'critical': 'Critical'
    };
    return levels[importance] || importance;
}

function formatEmotion(emotion) {
    const emotions = {
        'positive': 'Positive',
        'neutral': 'Neutral',
        'negative': 'Negative'
    };
    return emotions[emotion] || emotion;
}

function addTagToContainer(tag, container) {
    const tagElement = document.createElement('div');
    tagElement.className = 'tag';
    tagElement.innerHTML = `
        ${tag}
        <button class="tag-remove" data-tag="${tag}">&times;</button>
    `;
    
    tagElement.querySelector('.tag-remove').addEventListener('click', function() {
        container.removeChild(tagElement);
    });
    
    container.appendChild(tagElement);
}

function getTagsFromContainer(container) {
    const tags = [];
    container.querySelectorAll('.tag').forEach(tagElement => {
        const tagText = tagElement.textContent.replace('×', '').trim();
        if (tagText) {
            tags.push(tagText);
        }
    });
    return tags;
}

// Initialize tags input
document.getElementById('relationship-tags').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const tag = this.value.trim();
        if (tag) {
            addTagToContainer(tag, document.getElementById('relationship-tags-container'));
            this.value = '';
        }
    }
});