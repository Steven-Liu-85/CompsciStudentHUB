/**
 * Dashboard JavaScript
 * Handles dashboard statistics and summaries
 */
document.addEventListener('DOMContentLoaded', function() {
    // Only run if we're on the dashboard page
    if (document.getElementById('overall-progress')) {
        // Initialize dashboard
        updateDashboard();
    }
});

// Update every dashbord thing
function updateDashboard() {
    updateTaskStats();
    updateUpcomingTasks();
}

// Update tasks
function updateTaskStats() {
    // Get tasks
    const stats = getTaskStats();
    
    // Update progress line
    const progressBar = document.getElementById('overall-progress');
    progressBar.style.width = `${stats.completionRate}%`;
    progressBar.setAttribute('aria-valuenow', stats.completionRate);
    
    // Update text
    document.getElementById('progress-text').textContent = `${stats.completed}/${stats.total} tasks completed`;
    
    // Update catogory
    document.getElementById('homework-count').textContent = stats.homework;
    document.getElementById('assessment-count').textContent = stats.assessment;
    document.getElementById('schedule-count').textContent = stats.schedule;
}

// Update upcoming tasks
function updateUpcomingTasks() {
    const upcomingTasksList = document.getElementById('upcoming-tasks');
    
    // Get upcoming tasks
    const upcomingTasks = getUpcomingTasks(5);
    
    // Clear the ist
    upcomingTasksList.innerHTML = '';
    
    // Check if there are any tasks
    if (upcomingTasks.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.classList.add('list-group-item', 'text-center', 'text-muted');
        emptyItem.textContent = 'No upcoming tasks';
        upcomingTasksList.appendChild(emptyItem);
        return;
    }
    
    // Add tasks to list
    upcomingTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', `priority-${task.priority}`);
        
        // Format due date
        const dueDate = new Date(task.dueDate);
        const formattedDate = dueDate.toLocaleDateString() + ' ' + dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Check if task is due today
        const today = new Date();
        const isToday = dueDate.toDateString() === today.toDateString();
        
        // Check if task is overdue
        const isOverdue = today > dueDate;
        
        taskItem.innerHTML = `
            <div>
                <h6 class="mb-0">${task.title}</h6>
                <div>
                    <span class="badge category-badge ${task.category}">${task.category}</span>
                    <small class="text-muted ${isOverdue ? 'text-danger' : isToday ? 'text-warning' : ''}">
                        ${isOverdue ? 'Overdue' : isToday ? 'Today' : formattedDate}
                    </small>
                </div>
            </div>
            <span class="badge bg-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'} rounded-pill">${task.priority}</span>
        `;
        
        upcomingTasksList.appendChild(taskItem);
    });
}


