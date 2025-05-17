/**
 * Calendar Management JavaScript
 * Handles calendar view and event display
 */

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the calendar page
    if (document.getElementById('calendar-grid')) {
        initCalendarPage();
    }
    
    // Check if we're on the dashboard with week preview
    if (document.getElementById('week-preview')) {
        initWeekPreview();
    }
});

// Initialize the calendar page
function initCalendarPage() {
    // Set current date (remove 'let')
    currentDate = new Date();

    // Set up event listeners
    document.getElementById('prev-month').addEventListener('click', () => navigateMonth('prev'));
    document.getElementById('next-month').addEventListener('click', () => navigateMonth('next'));

    document.getElementById('today-btn').addEventListener('click', () => {
        currentDate = new Date();
        renderCalendar(currentDate);
    });

    // Category filter event listeners
    document.getElementById('filter-homework').addEventListener('change', () => renderCalendar(currentDate));
    document.getElementById('filter-assessment').addEventListener('change', () => renderCalendar(currentDate));
    document.getElementById('filter-schedule').addEventListener('change', () => renderCalendar(currentDate));

    // Initial render
    renderCalendar(currentDate);

    // Add event listener for edit task button in task details modal
    document.getElementById('edit-task-btn').addEventListener('click', () => {
        const taskId = document.getElementById('edit-task-btn').dataset.taskId;

        // Close current modal
        const detailsModal = bootstrap.Modal.getInstance(document.getElementById('taskDetailsModal'));
        detailsModal.hide();

        // Open edit modal - need to wait for the first modal to close
        setTimeout(() => {
            openEditTaskModal(taskId);
        }, 500);
    });
}

// Render the calendar for a specific month
function renderCalendar(date) {
    const calendarGrid = document.getElementById('calendar-grid');
    const calendarTitle = document.getElementById('calendar-title');
    
    // Clear calendar grid
    calendarGrid.innerHTML = '';
    
    // Set calendar title
    calendarTitle.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    // Get first day of month
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    
    // Get day of week for first day (0-6, 0 = Sunday)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Get last day of month
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Get current date for highlighting today
    const today = new Date();
    const isCurrentMonth = today.getMonth() === date.getMonth() && today.getFullYear() === date.getFullYear();
    
    // Get previous month's days to display
    const prevMonth = new Date(date.getFullYear(), date.getMonth(), 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    // Get tasks from local storage
    const tasks = JSON.parse(localStorage.getItem('student-hub-tasks')) || [];
    
    // Get checked categories
    const showHomework = document.getElementById('filter-homework').checked;
    const showAssessment = document.getElementById('filter-assessment').checked;
    const showSchedule = document.getElementById('filter-schedule').checked;
    
    // Filter tasks by categories
    const filteredTasks = tasks.filter(task => {
        return (task.category === 'homework' && showHomework) || 
               (task.category === 'assessment' && showAssessment) || 
               (task.category === 'schedule' && showSchedule);
    });
    
    // Generate days for previous month (if needed)
    for (let i = 0; i < firstDayOfWeek; i++) {
        const dayNumber = daysInPrevMonth - firstDayOfWeek + i + 1;
        const dayDate = new Date(date.getFullYear(), date.getMonth() - 1, dayNumber);
        
        const dayEvents = getEventsForDay(filteredTasks, dayDate);
        
        const dayElement = createDayElement(dayNumber, dayDate, 'other-month', dayEvents);
        calendarGrid.appendChild(dayElement);
    }
    
    // Generate days for current month
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDate = new Date(date.getFullYear(), date.getMonth(), i);
        const isToday = isCurrentMonth && today.getDate() === i;
        
        const dayEvents = getEventsForDay(filteredTasks, dayDate);
        
        const dayElement = createDayElement(i, dayDate, isToday ? 'today' : '', dayEvents);
        calendarGrid.appendChild(dayElement);
    }
    
    // Calculate remaining cells to fill out the grid
    const totalCellsGenerated = firstDayOfWeek + daysInMonth;
    const remainingCells = 42 - totalCellsGenerated; // 6 rows of 7 days
    
    // Generate days for next month (if needed)
    for (let i = 1; i <= remainingCells; i++) {
        const dayDate = new Date(date.getFullYear(), date.getMonth() + 1, i);
        
        const dayEvents = getEventsForDay(filteredTasks, dayDate);
        
        const dayElement = createDayElement(i, dayDate, 'other-month', dayEvents);
        calendarGrid.appendChild(dayElement);
    }
}

// Create an element for a calendar day
function createDayElement(dayNumber, date, extraClass = '', events = []) {
    const dayElement = document.createElement('div');
    dayElement.classList.add('calendar-day');
    if (extraClass) {
        dayElement.classList.add(extraClass);
    }
    
    // Add date number
    const dateElement = document.createElement('div');
    dateElement.classList.add('date-number');
    dateElement.textContent = dayNumber;
    dayElement.appendChild(dateElement);
    
    // Add events
    if (events.length > 0) {
        const eventsContainer = document.createElement('div');
        eventsContainer.classList.add('day-events');
        
        events.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.classList.add('day-event', event.category);
            if (event.completed) {
                eventElement.classList.add('completed');
            }
            
            // Format time
            const eventTime = new Date(event.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            eventElement.textContent = `${eventTime} - ${event.title}`;
            eventElement.dataset.id = event.id;
            
            eventElement.addEventListener('click', (e) => {
                e.stopPropagation();
                showTaskDetails(event.id);
            });
            
            eventsContainer.appendChild(eventElement);
        });
        
        dayElement.appendChild(eventsContainer);
    }
    
    return dayElement;
}

// Get events for a specific day
function getEventsForDay(tasks, date) {
    const formattedDate = date.toDateString();
    
    return tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === formattedDate;
    });
}

// Show task details in a modal
function showTaskDetails(taskId) {
    const tasks = JSON.parse(localStorage.getItem('student-hub-tasks')) || [];
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return;
    
    // Populate modal
    document.getElementById('detail-task-title').textContent = task.title;
    document.getElementById('detail-task-description').textContent = task.description || 'No description provided';
    
    // Set category badge
    const categoryBadge = document.getElementById('detail-task-category');
    categoryBadge.textContent = task.category;
    categoryBadge.className = 'badge';
    categoryBadge.classList.add(`bg-${task.category === 'homework' ? 'info' : task.category === 'assessment' ? 'danger' : 'success'}`);
    
    // Set priority badge
    const priorityBadge = document.getElementById('detail-task-priority');
    priorityBadge.textContent = `Priority: ${task.priority}`;
    priorityBadge.className = 'badge';
    priorityBadge.classList.add(`bg-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'}`);
    
    // Format due date
    const dueDate = new Date(task.dueDate);
    document.getElementById('detail-task-due-date').textContent = dueDate.toLocaleDateString() + ' ' + 
        dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Set completion status
    document.getElementById('detail-task-completed').checked = task.completed;
    
    // Set task ID for edit button
    document.getElementById('edit-task-btn').dataset.taskId = task.id;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('taskDetailsModal'));
    modal.show();
}

// Initialize week preview for dashboard
function initWeekPreview() {
    renderWeekPreview();
}

// Render the week preview calendar
function renderWeekPreview() {
    const weekPreview = document.getElementById('week-preview');
    weekPreview.innerHTML = '';
    
    // Get current date
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Calculate first day of week (Sunday)
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - currentDay);
    
    // Get tasks from local storage
    const tasks = JSON.parse(localStorage.getItem('student-hub-tasks')) || [];
    
    // Add weekday headers
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.classList.add('weekday');
        dayHeader.textContent = day;
        weekPreview.appendChild(dayHeader);
    });
    
    // Add days
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(firstDayOfWeek);
        currentDate.setDate(firstDayOfWeek.getDate() + i);
        
        const dayEvents = getEventsForDay(tasks, currentDate);
        
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        if (currentDate.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        dayElement.textContent = currentDate.getDate();
        
        // Add indicator for events
        if (dayEvents.length > 0) {
            dayElement.classList.add('has-events');
            
            // Get the most important category for the indicator
            if (dayEvents.some(e => e.category === 'assessment')) {
                dayElement.classList.add('assessment');
            } else if (dayEvents.some(e => e.category === 'homework')) {
                dayElement.classList.add('homework');
            } else if (dayEvents.some(e => e.category === 'schedule')) {
                dayElement.classList.add('schedule');
            }
            
            // Add tooltip with event count
            dayElement.title = `${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}`;
        }
        
        weekPreview.appendChild(dayElement);
    }
}

function navigateMonth(direction) {
    const calendarGrid = document.getElementById('calendar-grid');
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Create a clone of the current calendar grid
    const clone = calendarGrid.cloneNode(true);
    clone.classList.add('clone');
    
    // Set initial position for the clone
    clone.style.transform = direction === 'prev' ? 'translateX(100%)' : 'translateX(-100%)';
    
    // Add the clone to the container
    calendarGrid.parentNode.appendChild(clone);
    
    // Update the date
    if (direction === 'prev') {
        currentDate.setMonth(currentMonth - 1);
    } else {
        currentDate.setMonth(currentMonth + 1);
    }
    
    // Update the calendar title
    //updateCalendarTitle();
    
    // Force a reflow
    clone.offsetHeight;
    
    // Add slide animation classes
    calendarGrid.classList.add(direction === 'prev' ? 'slide-left-out' : 'slide-right-out');
    clone.classList.add(direction === 'prev' ? 'slide-left-in' : 'slide-right-in');
    
    // Wait for animation to complete
    setTimeout(() => {
        // Remove the clone and animation classes
        clone.remove();
        calendarGrid.classList.remove('slide-left-out', 'slide-right-out');
        // Update calendar content
        renderCalendar(currentDate); // Pass currentDate explicitly
    }, 300);
}
