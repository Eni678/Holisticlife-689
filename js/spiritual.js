document.addEventListener('DOMContentLoaded', function() {
    // Initialize spiritual module
    if (document.getElementById('spiritual')) {
        initSpiritual();
    }
});

function initSpiritual() {
    // Check authentication
    firebaseAuth.onAuthStateChanged(user => {
        if (user) {
            loadSpiritualData(user.uid);
            setupEventListeners();
            setupDefaultCharacterStudies();
        }
    });
}

function setupEventListeners() {
    // View selector
    document.getElementById('spiritual-view-selector').addEventListener('change', function() {
        const view = this.value;
        document.querySelectorAll('.spiritual-view-content').forEach(el => {
            el.classList.remove('active');
        });
        document.getElementById(`spiritual-${view}`).classList.add('active');
    });
    
    // Bible study actions
    document.getElementById('start-plan').addEventListener('click', startBibleReadingPlan);
    document.getElementById('mark-as-read').addEventListener('click', markBibleReadingComplete);
    document.getElementById('add-notes').addEventListener('click', showBibleNoteModal);
    document.getElementById('add-new-note').addEventListener('click', showBibleNoteModal);
    document.getElementById('cancel-bible-note').addEventListener('click', hideBibleNoteModal);
    document.getElementById('bible-note-form').addEventListener('submit', saveBibleNote);
    
    // Prayer life actions
    document.getElementById('save-prayer').addEventListener('click', savePrayer);
    document.getElementById('prayer-reminder').addEventListener('click', setPrayerReminder);
    
    // Evangelism actions
    document.getElementById('save-evangelism').addEventListener('click', saveEvangelismRecord);
    
    // Character study cards
    document.querySelectorAll('.character-card').forEach(card => {
        card.addEventListener('click', function() {
            showCharacterStudy(this.dataset.character);
        });
    });
    
    // Add activity button
    document.getElementById('add-spiritual-activity').addEventListener('click', function() {
        const currentView = document.getElementById('spiritual-view-selector').value;
        switch(currentView) {
            case 'bible':
                showBibleNoteModal();
                break;
            case 'prayer':
                // Focus on prayer textarea
                document.getElementById('prayer-text').focus();
                break;
            case 'evangelism':
                // Focus on evangelism form
                document.getElementById('evangelism-notes').focus();
                break;
            default:
                // Default to adding a bible note
                showBibleNoteModal();
        }
    });
}

function loadSpiritualData(userId) {
    // Load bible reading data
    db.collection('users').doc(userId).collection('bibleReading').doc('current')
        .onSnapshot(doc => {
            if (doc.exists) {
                updateBibleReadingUI(doc.data());
            }
        });
    
    // Load bible notes
    db.collection('users').doc(userId).collection('bibleNotes')
        .orderBy('createdAt', 'desc')
        .limit(10)
        .onSnapshot(snapshot => {
            const notesList = document.getElementById('bible-notes-list');
            notesList.innerHTML = '';
            
            snapshot.forEach(doc => {
                const note = doc.data();
                const noteElement = createBibleNoteElement(doc.id, note);
                notesList.appendChild(noteElement);
            });
        });
    
    // Load prayer data
    db.collection('users').doc(userId).collection('prayers')
        .orderBy('date', 'desc')
        .where('answered', '==', false)
        .limit(10)
        .onSnapshot(snapshot => {
            const requestsList = document.getElementById('prayer-requests-list');
            requestsList.innerHTML = '';
            
            snapshot.forEach(doc => {
                const prayer = doc.data();
                const prayerElement = createPrayerRequestElement(doc.id, prayer);
                requestsList.appendChild(prayerElement);
            });
            
            updatePrayerStats(userId);
        });
    
    // Load evangelism data
    db.collection('users').doc(userId).collection('evangelism')
        .orderBy('date', 'desc')
        .limit(10)
        .onSnapshot(snapshot => {
            const historyList = document.getElementById('evangelism-history-list');
            historyList.innerHTML = '';
            
            let conversations = 0;
            let decisions = 0;
            
            snapshot.forEach(doc => {
                const entry = doc.data();
                const entryElement = createEvangelismEntryElement(entry);
                historyList.appendChild(entryElement);
                
                conversations++;
                if (entry.outcome === 'decision') {
                    decisions++;
                }
            });
            
            document.getElementById('conversations-count').textContent = conversations;
            document.getElementById('decisions-count').textContent = decisions;
        });
    
    // Load challenges
    db.collection('spiritualChallenges')
        .where('active', '==', true)
        .limit(3)
        .get()
        .then(snapshot => {
            const challengesContainer = document.getElementById('current-challenges');
            challengesContainer.innerHTML = '';
            
            snapshot.forEach(doc => {
                const challenge = doc.data();
                const challengeElement = createChallengeElement(challenge);
                challengesContainer.appendChild(challengeElement);
            });
        });
}

function setupDefaultCharacterStudies() {
    const characters = {
        jesus: {
            name: "Jesus Christ",
            title: "The Son of God",
            description: "The central figure of Christianity, whose life, death, and resurrection are the foundation of the Christian faith.",
            progress: 0,
            lessons: [
                {
                    title: "Humility and Service",
                    content: "Jesus demonstrated ultimate humility by washing His disciples' feet and serving others.",
                    reference: "John 13:1-17"
                },
                {
                    title: "Unconditional Love",
                    content: "Jesus showed love to outcasts, sinners, and even those who crucified Him.",
                    reference: "Luke 23:34"
                }
            ]
        },
        david: {
            name: "King David",
            title: "A Man After God's Own Heart",
            description: "The second king of Israel, known for his faith, psalms, and complex relationship with God.",
            progress: 0,
            lessons: [
                {
                    title: "Heart of Worship",
                    content: "David's psalms demonstrate a deep, authentic relationship with God in all circumstances.",
                    reference: "Psalm 23"
                },
                {
                    title: "Repentance and Restoration",
                    content: "After his sin with Bathsheba, David showed genuine repentance and accepted God's discipline.",
                    reference: "Psalm 51"
                }
            ]
        },
        moses: {
            name: "Moses",
            title: "The Deliverer",
            description: "Chosen by God to lead the Israelites out of Egyptian slavery and receive the Law.",
            progress: 0,
            lessons: [
                {
                    title: "Overcoming Insecurity",
                    content: "Despite his initial reluctance, Moses trusted God to use him despite his weaknesses.",
                    reference: "Exodus 3-4"
                },
                {
                    title: "Faithful Leadership",
                    content: "Moses interceded for the people even when they rebelled against him and God.",
                    reference: "Exodus 32:11-14"
                }
            ]
        },
        daniel: {
            name: "Daniel",
            title: "The Faithful Exile",
            description: "A Jewish exile who remained faithful to God in a pagan culture and rose to prominence.",
            progress: 0,
            lessons: [
                {
                    title: "Faith Under Pressure",
                    content: "Daniel maintained his prayer routine even when it meant facing the lions' den.",
                    reference: "Daniel 6"
                },
                {
                    title: "Integrity in Workplace",
                    content: "Daniel excelled in his work without compromising his faith.",
                    reference: "Daniel 1:8-20"
                }
            ]
        }
    };
    
    // Store in memory for quick access
    window.biblicalCharacters = characters;
}

function updateBibleReadingUI(data) {
    if (!data) return;
    
    if (data.plan) {
        document.getElementById('bible-plan-selector').value = data.plan;
    }
    
    if (data.progress) {
        const percentage = Math.round(data.progress * 100);
        document.getElementById('bible-reading-percentage').textContent = `${percentage}% Complete`;
        document.getElementById('bible-reading-progress').style.width = `${percentage}%`;
    }
    
    if (data.currentBook) {
        document.getElementById('current-bible-book').textContent = data.currentBook;
    }
    
    if (data.lastRead) {
        const lastReadDate = new Date(data.lastRead.seconds * 1000);
        document.getElementById('last-bible-reading').textContent = lastReadDate.toLocaleDateString();
    }
    
    if (data.todayReading) {
        document.getElementById('todays-reading-passage').innerHTML = `
            <h4>${data.todayReading.reference}</h4>
            <p>${data.todayReading.passage || 'No passage loaded for today.'}</p>
        `;
    }
    
    // Update streak and overall progress
    if (data.streak) {
        document.getElementById('bible-streak').textContent = data.streak;
    }
    
    if (data.yearProgress) {
        document.getElementById('bible-percentage').textContent = `${Math.round(data.yearProgress * 100)}%`;
        document.getElementById('bible-progress-fill').style.width = `${Math.round(data.yearProgress * 100)}%`;
    }
}

function updatePrayerStats(userId) {
    // Get prayer statistics
    db.collection('users').doc(userId).collection('prayers')
        .get()
        .then(snapshot => {
            let total = 0;
            let answered = 0;
            const types = {
                intercession: 0,
                thanksgiving: 0,
                supplication: 0,
                praise: 0
            };
            
            snapshot.forEach(doc => {
                const prayer = doc.data();
                total++;
                
                if (prayer.answered) {
                    answered++;
                }
                
                if (prayer.type && types.hasOwnProperty(prayer.type)) {
                    types[prayer.type]++;
                }
            });
            
            document.getElementById('total-prayers').textContent = total;
            document.getElementById('answered-prayers').textContent = answered;
            
            // Update type counts
            document.getElementById('intercession-count').textContent = types.intercession;
            document.getElementById('thanksgiving-count').textContent = types.thanksgiving;
            document.getElementById('supplication-count').textContent = types.supplication;
            document.getElementById('praise-count').textContent = types.praise;
            
            // Update streak
            if (window.prayerStreak) {
                document.getElementById('prayer-streak').textContent = window.prayerStreak;
            }
            
            // Update weekly count
            if (window.weeklyPrayers) {
                document.getElementById('prayer-count').textContent = window.weeklyPrayers;
            }
            
            // Update charts
            updatePrayerCharts();
        });
}

function updatePrayerCharts() {
    // Frequency chart (example data)
    const frequencyCtx = document.getElementById('prayerFrequencyChart').getContext('2d');
    
    if (window.prayerFrequencyChart) {
        window.prayerFrequencyChart.destroy();
    }
    
    window.prayerFrequencyChart = new Chart(frequencyCtx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Prayers',
                data: [3, 5, 2, 4, 3, 1, 2],
                backgroundColor: 'rgba(98, 0, 234, 0.7)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // History chart (example data)
    const historyCtx = document.getElementById('prayerHistoryChart').getContext('2d');
    
    if (window.prayerHistoryChart) {
        window.prayerHistoryChart.destroy();
    }
    
    window.prayerHistoryChart = new Chart(historyCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Prayers',
                data: [12, 19, 15, 20, 18, 22],
                borderColor: 'rgba(98, 0, 234, 1)',
                backgroundColor: 'rgba(98, 0, 234, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function startBibleReadingPlan() {
    const plan = document.getElementById('bible-plan-selector').value;
    const userId = firebaseAuth.currentUser.uid;
    
    // In a full implementation, this would generate a reading plan
    // For now, we'll just save the selected plan
    db.collection('users').doc(userId).collection('bibleReading').doc('current').set({
        plan: plan,
        startedAt: firebase.firestore.FieldValue.serverTimestamp(),
        progress: 0,
        streak: 0
    }, { merge: true })
    .then(() => {
        alert(`Started ${plan} reading plan!`);
    })
    .catch(error => {
        console.error("Error starting reading plan: ", error);
        alert('Failed to start reading plan');
    });
}

function markBibleReadingComplete() {
    const userId = firebaseAuth.currentUser.uid;
    
    // In a full implementation, this would update progress
    db.collection('users').doc(userId).collection('bibleReading').doc('current').update({
        lastRead: firebase.firestore.FieldValue.serverTimestamp(),
        streak: firebase.firestore.FieldValue.increment(1)
    })
    .then(() => {
        alert('Marked today\'s reading as complete!');
    })
    .catch(error => {
        console.error("Error marking reading complete: ", error);
        alert('Failed to mark reading complete');
    });
}

function showBibleNoteModal(noteId = null) {
    const modal = document.getElementById('bible-note-modal');
    const form = document.getElementById('bible-note-form');
    
    if (noteId) {
        // Edit mode
        document.getElementById('bible-note-modal-title').textContent = 'Edit Bible Note';
        form.dataset.mode = 'edit';
        document.getElementById('bible-note-id').value = noteId;
        
        // Load note data
        const userId = firebaseAuth.currentUser.uid;
        db.collection('users').doc(userId).collection('bibleNotes').doc(noteId)
            .get()
            .then(doc => {
                if (doc.exists) {
                    const note = doc.data();
                    document.getElementById('bible-note-reference').value = note.reference || '';
                    document.getElementById('bible-note-title').value = note.title || '';
                    document.getElementById('bible-note-content').value = note.content || '';
                    document.getElementById('bible-note-tags').value = note.tags ? note.tags.join(', ') : '';
                }
            });
    } else {
        // Add mode
        document.getElementById('bible-note-modal-title').textContent = 'New Bible Note';
        form.dataset.mode = 'add';
        form.reset();
    }
    
    modal.style.display = 'flex';
}

function hideBibleNoteModal() {
    document.getElementById('bible-note-modal').style.display = 'none';
}

function saveBibleNote(e) {
    e.preventDefault();
    
    const form = e.target;
    const userId = firebaseAuth.currentUser.uid;
    const mode = form.dataset.mode;
    
    // Get form values
    const noteData = {
        reference: document.getElementById('bible-note-reference').value.trim(),
        title: document.getElementById('bible-note-title').value.trim(),
        content: document.getElementById('bible-note-content').value.trim(),
        tags: document.getElementById('bible-note-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Validate
    if (!noteData.reference || !noteData.title || !noteData.content) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (mode === 'add') {
        // Add new note
        noteData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        
        db.collection('users').doc(userId).collection('bibleNotes').add(noteData)
            .then(() => {
                hideBibleNoteModal();
            })
            .catch(error => {
                console.error("Error adding bible note: ", error);
                alert('Failed to save note');
            });
    } else {
        // Update existing note
        const noteId = document.getElementById('bible-note-id').value;
        
        db.collection('users').doc(userId).collection('bibleNotes').doc(noteId)
            .update(noteData)
            .then(() => {
                hideBibleNoteModal();
            })
            .catch(error => {
                console.error("Error updating bible note: ", error);
                alert('Failed to update note');
            });
    }
}

function createBibleNoteElement(noteId, note) {
    const element = document.createElement('div');
    element.className = 'bible-note';
    
    element.innerHTML = `
        <h4>
            ${note.title}
            <span class="note-reference">${note.reference}</span>
        </h4>
        <div class="note-content">${note.content}</div>
        ${note.tags && note.tags.length > 0 ? `
            <div class="note-tags">
                ${note.tags.map(tag => `<span class="note-tag">${tag}</span>`).join('')}
            </div>
        ` : ''}
        <div class="note-actions">
            <button class="btn-icon note-edit" data-id="${noteId}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon note-delete" data-id="${noteId}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Add event listeners
    element.querySelector('.note-edit').addEventListener('click', function() {
        showBibleNoteModal(this.dataset.id);
    });
    
    element.querySelector('.note-delete').addEventListener('click', function() {
        if (confirm('Are you sure you want to delete this note?')) {
            const userId = firebaseAuth.currentUser.uid;
            db.collection('users').doc(userId).collection('bibleNotes').doc(this.dataset.id).delete()
                .catch(error => {
                    console.error("Error deleting note: ", error);
                    alert('Failed to delete note');
                });
        }
    });
    
    return element;
}

function savePrayer() {
    const prayerText = document.getElementById('prayer-text').value.trim();
    if (!prayerText) {
        alert('Please enter your prayer');
        return;
    }
    
    const userId = firebaseAuth.currentUser.uid;
    
    db.collection('users').doc(userId).collection('prayers').add({
        content: prayerText,
        type: 'supplication', // Default type
        date: firebase.firestore.FieldValue.serverTimestamp(),
        answered: false
    })
    .then(() => {
        document.getElementById('prayer-text').value = '';
        alert('Prayer saved!');
    })
    .catch(error => {
        console.error("Error saving prayer: ", error);
        alert('Failed to save prayer');
    });
}

function setPrayerReminder() {
    alert('In a complete implementation, this would set a prayer reminder');
    // This would integrate with your notification system
}

function createPrayerRequestElement(prayerId, prayer) {
    const element = document.createElement('div');
    element.className = 'prayer-request';
    if (prayer.answered) {
        element.classList.add('answered');
    } else {
        element.classList.add('unanswered');
    }
    
    const prayerDate = prayer.date ? new Date(prayer.date.seconds * 1000).toLocaleDateString() : 'No date';
    
    element.innerHTML = `
        <h5>
            ${prayer.type ? formatPrayerType(prayer.type) : 'Prayer'}
            <span class="request-date">${prayerDate}</span>
        </h5>
        <div class="request-content">${prayer.content}</div>
        <div class="request-actions">
            <button class="btn-icon request-answered" data-id="${prayerId}">
                <i class="fas fa-check"></i> Mark Answered
            </button>
        </div>
    `;
    
    // Add event listener
    element.querySelector('.request-answered').addEventListener('click', function() {
        const userId = firebaseAuth.currentUser.uid;
        db.collection('users').doc(userId).collection('prayers').doc(this.dataset.id).update({
            answered: true,
            answeredAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .catch(error => {
            console.error("Error marking prayer answered: ", error);
            alert('Failed to update prayer');
        });
    });
    
    return element;
}

function saveEvangelismRecord() {
    const date = document.getElementById('evangelism-date').value;
    const type = document.getElementById('evangelism-type').value;
    const notes = document.getElementById('evangelism-notes').value.trim();
    const outcome = document.getElementById('evangelism-outcome').value;
    
    if (!date || !notes) {
        alert('Please fill in all required fields');
        return;
    }
    
    const userId = firebaseAuth.currentUser.uid;
    
    db.collection('users').doc(userId).collection('evangelism').add({
        date: new Date(date),
        type: type,
        notes: notes,
        outcome: outcome,
        recordedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        document.getElementById('evangelism-notes').value = '';
        alert('Evangelism record saved!');
    })
    .catch(error => {
        console.error("Error saving evangelism record: ", error);
        alert('Failed to save record');
    });
}

function createEvangelismEntryElement(entry) {
    const element = document.createElement('div');
    element.className = 'evangelism-entry';
    
    const entryDate = entry.date ? new Date(entry.date.seconds * 1000).toLocaleDateString() : 'No date';
    
    element.innerHTML = `
        <h5>
            ${formatEvangelismType(entry.type)}
            <span class="entry-date">${entryDate}</span>
        </h5>
        <div class="entry-content">${entry.notes}</div>
        <div class="entry-outcome ${entry.outcome}">${formatEvangelismOutcome(entry.outcome)}</div>
    `;
    
    return element;
}

function showCharacterStudy(characterId) {
    const character = window.biblicalCharacters[characterId];
    if (!character) return;
    
    const modal = document.getElementById('character-study-modal');
    const content = document.getElementById('character-study-content');
    
    document.getElementById('character-study-modal-title').textContent = `${character.name} - ${character.title}`;
    
    // Build character study content
    content.innerHTML = `
        <div class="character-header">
            <div class="character-header-image">
                <i class="fas fa-user"></i>
            </div>
            <div class="character-header-info">
                <h3>${character.name}</h3>
                <p>${character.title}</p>
            </div>
        </div>
        
        <div class="character-tabs">
            <button class="character-tab active" data-tab="overview">Overview</button>
            <button class="character-tab" data-tab="lessons">Lessons</button>
            <button class="character-tab" data-tab="timeline">Timeline</button>
        </div>
        
        <div id="character-overview" class="character-tab-content active">
            <div class="character-bio">
                <p>${character.description}</p>
            </div>
        </div>
        
        <div id="character-lessons" class="character-tab-content">
            <div class="character-lessons">
                ${character.lessons.map(lesson => `
                    <div class="lesson-item">
                        <h4>${lesson.title}</h4>
                        <p>${lesson.content}</p>
                        <div class="lesson-reference">${lesson.reference}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div id="character-timeline" class="character-tab-content">
            <p>Timeline would be displayed here in a complete implementation.</p>
        </div>
    `;
    
    // Add tab event listeners
    content.querySelectorAll('.character-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Update active tab
            content.querySelectorAll('.character-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            // Update active content
            content.querySelectorAll('.character-tab-content').forEach(c => {
                c.classList.remove('active');
            });
            document.getElementById(`character-${tabId}`).classList.add('active');
        });
    });
    
    modal.style.display = 'flex';
}

function createChallengeElement(challenge) {
    const element = document.createElement('div');
    element.className = 'challenge-card';
    
    const progressPercentage = Math.round((challenge.current / challenge.target) * 100);
    
    element.innerHTML = `
        <h4>${challenge.title}</h4>
        <p>${challenge.description}</p>
        <div class="challenge-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercentage}%"></div>
            </div>
            <span>${progressPercentage}%</span>
        </div>
    `;
    
    return element;
}

// Helper functions
function formatPrayerType(type) {
    const types = {
        'intercession': 'Intercession',
        'thanksgiving': 'Thanksgiving',
        'supplication': 'Supplication',
        'praise': 'Praise'
    };
    return types[type] || type;
}

function formatEvangelismType(type) {
    const types = {
        'personal': 'Personal Conversation',
        'group': 'Group Discussion',
        'outreach': 'Outreach Event',
        'digital': 'Digital Evangelism'
    };
    return types[type] || type;
}

function formatEvangelismOutcome(outcome) {
    const outcomes = {
        'shared': 'Shared Gospel',
        'interested': 'Expressed Interest',
        'decision': 'Made Decision',
        'followup': 'Needs Follow-up'
    };
    return outcomes[outcome] || outcome;
}