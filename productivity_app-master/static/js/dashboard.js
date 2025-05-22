/**
 * Dashboard JavaScript
 * Handles dashboard statistics and summaries
 */
document.addEventListener('DOMContentLoaded', function() {
    // Only run if we're on the dashboard page
    if (document.getElementById('overall-progress')) {
        fetchTasksAndUpdateDashboard();
    }
});

// Fetch tasks from backend, then update dashboard
function fetchTasksAndUpdateDashboard() {
    fetch('/api/tasks')
        .then(response => response.json())
        .then(data => {
            if (data.tasks) {
                window.tasks = data.tasks;
                localStorage.setItem('student-hub-tasks', JSON.stringify(data.tasks));
            } else {
                window.tasks = [];
                localStorage.setItem('student-hub-tasks', '[]');
            }
            updateDashboard();
        })
        .catch(error => {
            console.error('Error fetching tasks from backend:', error);
            // Fallback: use localStorage if backend fails
            window.tasks = JSON.parse(localStorage.getItem('student-hub-tasks')) || [];
            updateDashboard();
        });
}

// Update every dashbord thing
function updateDashboard() {
    updateTaskStats();
    updateUpcomingTasks();
}

// Update tasks
// Update tasks
function updateTaskStats() {
    const stats = getTaskStats();
    const progressBar = document.getElementById('overall-progress');
    progressBar.style.width = `${stats.completionRate}%`;
    progressBar.setAttribute('aria-valuenow', stats.completionRate);

    document.getElementById('progress-text').textContent = `${stats.completed}/${stats.total} tasks completed`;
    document.getElementById('homework-count').textContent = stats.homework;
    document.getElementById('assessment-count').textContent = stats.assessment;
    document.getElementById('schedule-count').textContent = stats.schedule;
}

// Update upcoming tasks
function updateUpcomingTasks() {
    const upcomingTasksList = document.getElementById('upcoming-tasks');
    const upcomingTasks = getUpcomingTasks(5);

    upcomingTasksList.innerHTML = '';
    if (upcomingTasks.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.classList.add('list-group-item', 'text-center', 'text-muted');
        emptyItem.textContent = 'No upcoming tasks';
        upcomingTasksList.appendChild(emptyItem);
        return;
    }

    upcomingTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', `priority-${task.priority}`);
        const dueDate = new Date(task.dueDate);
        const formattedDate = dueDate.toLocaleDateString() + ' ' + dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const today = new Date();
        const isToday = dueDate.toDateString() === today.toDateString();
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

// Get upcoming tasks (for dashboard)
function getUpcomingTasks(limit = 5) {
    const now = new Date();
    const taskArr = typeof window.tasks !== 'undefined'
        ? window.tasks
        : (JSON.parse(localStorage.getItem('student-hub-tasks')) || []);
    return taskArr
        .filter(task => !task.completed && new Date(task.dueDate) >= now)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, limit);
}



