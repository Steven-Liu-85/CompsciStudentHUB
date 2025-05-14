/**
 * Tasks Management JavaScript
 * Handles task creation, editing, deletion, and filtering
 */

// Store tasks in local storage
let tasks = JSON.parse(localStorage.getItem('student-hub-tasks')) || [];

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize task handling if we're on the tasks page
    if (document.getElementById('task-list')) {
        initTaskPage();
    }
    
    // Initialize add task functionality that might be available on any page
    const saveTaskBtn = document.getElementById('save-task-btn');
    if (saveTaskBtn) {
        saveTaskBtn.addEventListener('click', saveTask);
    }
});

// Initialize the task page
function initTaskPage() {
    // Load tasks
    renderTasks();
    
    // Set up event listeners
    document.getElementById('save-task-btn').addEventListener('click', saveTask);
    document.getElementById('update-task-btn').addEventListener('click', updateTask);
    document.getElementById('delete-task-btn').addEventListener('click', deleteTask);
    
    // Set up search event listeners
    document.getElementById('search-tasks').addEventListener('input', filterTasks);
    document.getElementById('search-button').addEventListener('click', filterTasks);
}

// Create a new task
function saveTask() {
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const category = document.getElementById('task-category').value;
    const priority = document.getElementById('task-priority').value;
    const dueDate = document.getElementById('task-due-date').value;
    
    // Validate form
    if (!title || !dueDate) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Create task object
    const task = {
        id: Date.now().toString(),
        title,
        description,
        category,
        priority,
        dueDate,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    // Add to tasks array
    tasks.push(task);
    
    // Save to local storage
    localStorage.setItem('student-hub-tasks', JSON.stringify(tasks));
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addTaskModal'));
    modal.hide();
    
    // Reset form
    document.getElementById('task-form').reset();
    
    // Render tasks
    renderTasks();
    
    // Update dashboard if we're on that page
    if (typeof updateDashboard === 'function') {
        updateDashboard();
    }
}

// Render tasks to the task list
function renderTasks(filteredTasks) {
    const taskList = document.getElementById('task-list');
    if (!taskList) return; // We're not on the tasks page
    
    const displayTasks = filteredTasks || tasks;
    
    // Clear task list
    taskList.innerHTML = '';
    
    if (displayTasks.length === 0) {
        document.getElementById('empty-tasks').classList.remove('d-none');
        return;
    }
    
    document.getElementById('empty-tasks').classList.add('d-none');
    
    // Sort tasks by due date
    displayTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    // Add tasks to list
    displayTasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.classList.add('list-group-item', 'task-item', `priority-${task.priority}`);
        if (task.completed) {
            taskItem.classList.add('completed');
        }
        
        // Format due date
        const dueDate = new Date(task.dueDate);
        const formattedDate = dueDate.toLocaleDateString() + ' ' + dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Check if task is overdue
        const isOverdue = !task.completed && new Date() > dueDate;
        
        taskItem.innerHTML = `
            <div class="d-flex w-100 justify-content-between align-items-center">
                <div>
                    <div class="form-check">
                        <input class="form-check-input task-check" type="checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                        <h5 class="mb-1 task-title">${task.title}</h5>
                    </div>
                    <p class="mb-1 text-truncate" style="max-width: 500px;">${task.description || 'No description provided'}</p>
                    <div>
                        <span class="badge category-badge ${task.category}">${task.category}</span>
                        <span class="badge bg-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'}">${task.priority}</span>
                        <small class="text-muted ${isOverdue ? 'text-danger' : ''}">
                            ${isOverdue ? 'Overdue - ' : ''}
                            Due: ${formattedDate}
                        </small>
                    </div>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-secondary edit-task-btn" data-id="${task.id}">
                        Edit
                    </button>
                </div>
            </div>
        `;
        
        taskList.appendChild(taskItem);
    });
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-task-btn').forEach(button => {
        button.addEventListener('click', () => {
            openEditTaskModal(button.dataset.id);
        });
    });
    
    // Add event listeners to checkboxes
    document.querySelectorAll('.task-check').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            toggleTaskCompletion(checkbox.dataset.id, checkbox.checked);
        });
    });
}

// Open the edit task modal
function openEditTaskModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-task-title').value = task.title;
    document.getElementById('edit-task-description').value = task.description;
    document.getElementById('edit-task-category').value = task.category;
    document.getElementById('edit-task-priority').value = task.priority;
    document.getElementById('edit-task-due-date').value = new Date(task.dueDate).toISOString().slice(0, 16);
    document.getElementById('edit-task-completed').checked = task.completed;
    
    const modal = new bootstrap.Modal(document.getElementById('editTaskModal'));
    modal.show();
}

// Update an existing task
function updateTask() {
    const taskId = document.getElementById('edit-task-id').value;
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) return;
    
    const title = document.getElementById('edit-task-title').value.trim();
    const description = document.getElementById('edit-task-description').value.trim();
    const category = document.getElementById('edit-task-category').value;
    const priority = document.getElementById('edit-task-priority').value;
    const dueDate = document.getElementById('edit-task-due-date').value;
    const completed = document.getElementById('edit-task-completed').checked;
    
    // Validate form
    if (!title || !dueDate) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Update task
    tasks[taskIndex] = {
        ...tasks[taskIndex],
        title,
        description,
        category,
        priority,
        dueDate,
        completed,
        updatedAt: new Date().toISOString()
    };
    
    // Save to local storage
    localStorage.setItem('student-hub-tasks', JSON.stringify(tasks));
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
    modal.hide();
    
    // Render tasks
    renderTasks();
    
    // Update dashboard if we're on that page
    if (typeof updateDashboard === 'function') {
        updateDashboard();
    }
}

// Delete a task
function deleteTask() {
    const taskId = document.getElementById('edit-task-id').value;
    
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    // Remove task from array
    tasks = tasks.filter(t => t.id !== taskId);
    
    // Save to local storage
    localStorage.setItem('student-hub-tasks', JSON.stringify(tasks));
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
    modal.hide();
    
    // Render tasks
    renderTasks();
    
    // Update dashboard if we're on that page
    if (typeof updateDashboard === 'function') {
        updateDashboard();
    }
}

// Toggle task completion status
function toggleTaskCompletion(taskId, completed) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) return;
    
    // Update completion status
    tasks[taskIndex].completed = completed;
    
    // Save to local storage
    localStorage.setItem('student-hub-tasks', JSON.stringify(tasks));
    
    // Render tasks
    renderTasks();
    
    // Update dashboard if we're on that page
    if (typeof updateDashboard === 'function') {
        updateDashboard();
    }
}

// Filter tasks based on search query
function filterTasks() {
    const searchQuery = document.getElementById('search-tasks').value.toLowerCase();
    
    // Filter by search query
    let filteredTasks = tasks.filter(task => {
        const searchMatch = task.title.toLowerCase().includes(searchQuery) || 
                          task.description.toLowerCase().includes(searchQuery);
        
        return searchMatch;
    });
    
    // Sort tasks by due date
    filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    renderTasks(filteredTasks);
}

// Get upcoming tasks (for dashboard)
function getUpcomingTasks(limit = 5) {
    const now = new Date();
    return tasks.filter(task => !task.completed && new Date(task.dueDate) >= now)
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .slice(0, limit);
}

// Get task statistics
function getTaskStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const homework = tasks.filter(task => task.category === 'homework').length;
    const assessment = tasks.filter(task => task.category === 'assessment').length;
    const schedule = tasks.filter(task => task.category === 'schedule').length;
    
    return {
        total,
        completed,
        homework,
        assessment,
        schedule,
        completionRate: total > 0 ? (completed / total) * 100 : 0
    };
}
