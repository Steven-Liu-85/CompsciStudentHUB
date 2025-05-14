/**
 * Notes Management JavaScript
 * Handles note creation, editing, deletion, and display using localStorage
 */

// Store notes in local storage
let notes = JSON.parse(localStorage.getItem('student-hub-notes')) || [];

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Initialize notes page
    if (document.getElementById('notes-grid')) {
        initNotesPage();
    }
    
    // Initialize add note functionality
    const saveNoteBtn = document.getElementById('save-note-btn');
    if (saveNoteBtn) {
        saveNoteBtn.addEventListener('click', saveNote);
    }
    
    // Initialize edit note functionality
    const updateNoteBtn = document.getElementById('update-note-btn');
    if (updateNoteBtn) {
        updateNoteBtn.addEventListener('click', updateNote);
    }
    
    // Initialize delete note functionality
    const deleteNoteBtn = document.getElementById('delete-note-btn');
    if (deleteNoteBtn) {
        deleteNoteBtn.addEventListener('click', deleteNote);
    }
});

// Initialize the notes page
function initNotesPage() {
    renderNotes();
}

// Render all notes
function renderNotes() {
    const notesGrid = document.getElementById('notes-grid');
    notesGrid.innerHTML = '';
    
    notes.forEach(note => {
        const noteCard = createNoteCard(note);
        notesGrid.appendChild(noteCard);
    });
}

// Create a note card element
function createNoteCard(note) {
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-4';
    
    const card = document.createElement('div');
    card.className = 'card h-100';
    
    // Set card color based on category
    const categoryColors = {
        'lecture': 'bg-info bg-opacity-10',
        'assignment': 'bg-warning bg-opacity-10',
        'study': 'bg-success bg-opacity-10',
        'other': 'bg-secondary bg-opacity-10'
    };
    card.classList.add(categoryColors[note.category] || 'bg-secondary bg-opacity-10');
    
    card.innerHTML = `
        <div class="card-header">
            <h5 class="card-title mb-0">${note.title}</h5>
        </div>
        <div class="card-body">
            <p class="card-text">${note.content.substring(0, 150)}${note.content.length > 150 ? '...' : ''}</p>
            <div class="d-flex justify-content-between align-items-center">
                <span class="badge bg-${getCategoryColor(note.category)}">${note.category}</span>
                <small class="text-muted">${new Date(note.createdAt).toLocaleDateString()}</small>
            </div>
        </div>
        <div class="card-footer">
            <button class="btn btn-sm btn-outline-primary edit-note-btn" data-note-id="${note.id}">
                <i class="fas fa-edit"></i> Edit
            </button>
        </div>
    `;
    
    // Add edit button event listener
    const editBtn = card.querySelector('.edit-note-btn');
    editBtn.addEventListener('click', () => openEditNoteModal(note.id));
    
    col.appendChild(card);
    return col;
}

// Get category color for badge
function getCategoryColor(category) {
    const colors = {
        'lecture': 'info',
        'assignment': 'warning',
        'study': 'success',
        'other': 'secondary'
    };
    return colors[category] || 'secondary';
}

// Create a new note
function saveNote() {
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();
    const category = document.getElementById('note-category').value;
    
    // Validate form
    if (!title || !content) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Create note object
    const note = {
        id: Date.now().toString(),
        title,
        content,
        category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Add to notes array
    notes.push(note);
    
    // Save to local storage
    localStorage.setItem('student-hub-notes', JSON.stringify(notes));
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addNoteModal'));
    modal.hide();
    
    // Reset form
    document.getElementById('note-form').reset();
    
    // Render notes
    renderNotes();
    
    showNotification("Note created successfully", "success");
}

// Open edit note modal
function openEditNoteModal(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    // Populate form
    document.getElementById('edit-note-id').value = note.id;
    document.getElementById('edit-note-title').value = note.title;
    document.getElementById('edit-note-content').value = note.content;
    document.getElementById('edit-note-category').value = note.category;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editNoteModal'));
    modal.show();
}

// Update an existing note
function updateNote() {
    const noteId = document.getElementById('edit-note-id').value;
    const noteIndex = notes.findIndex(n => n.id === noteId);
    
    if (noteIndex === -1) return;
    
    const title = document.getElementById('edit-note-title').value.trim();
    const content = document.getElementById('edit-note-content').value.trim();
    const category = document.getElementById('edit-note-category').value;
    
    // Validate form
    if (!title || !content) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Update note
    notes[noteIndex] = {
        ...notes[noteIndex],
        title,
        content,
        category,
        updatedAt: new Date().toISOString()
    };
    
    // Save to local storage
    localStorage.setItem('student-hub-notes', JSON.stringify(notes));
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editNoteModal'));
    modal.hide();
    
    // Render notes
    renderNotes();
    
    showNotification("Note updated successfully", "success");
}

// Delete a note
function deleteNote() {
    const noteId = document.getElementById('edit-note-id').value;
    
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }
    
    // Remove note from array
    notes = notes.filter(n => n.id !== noteId);
    
    // Save to local storage
    localStorage.setItem('student-hub-notes', JSON.stringify(notes));
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editNoteModal'));
    modal.hide();
    
    // Render notes
    renderNotes();
    
    showNotification("Note deleted successfully", "success");
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification container if it doesn't exist
    let notificationContainer = document.getElementById('notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '1050';
        document.body.appendChild(notificationContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.classList.add('toast', 'show');
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Set background color based on type
    let bgClass = 'bg-primary';
    switch(type) {
        case 'success':
            bgClass = 'bg-success';
            break;
        case 'warning':
            bgClass = 'bg-warning';
            break;
        case 'error':
            bgClass = 'bg-danger';
            break;
        case 'info':
            bgClass = 'bg-info';
            break;
    }
    
    toast.classList.add(bgClass, 'text-white');
    
    // Set toast content
    toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">Student Hub</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    // Add to container
    notificationContainer.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
} 