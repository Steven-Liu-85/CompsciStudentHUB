// ✅ FINALIZED calendar.js (Mon-Sun, API tasks, animation, filter, edit, done-checkbox, modal)

let currentDate = new Date();
let tasks = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (document.getElementById('calendar-grid')) {
    await fetchTasksFromServer();
    initCalendarPage();
  }
  if (document.getElementById('week-preview')) {
    await fetchTasksFromServer();
    initWeekPreview();
  }
});

async function fetchTasksFromServer() {
  try {
    const response = await fetch('/api/tasks');
    if (response.ok) {
      const data = await response.json();
      tasks = data.tasks || [];
      localStorage.setItem('student-hub-tasks', JSON.stringify(tasks));
    } else {
      tasks = [];
    }
  } catch {
    tasks = [];
  }
}

function renderWeekdaysHeader() {
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const calendarHeader = document.querySelector('.calendar-header');
  calendarHeader.innerHTML = '';
  weekdays.forEach(day => {
    const div = document.createElement('div');
    div.className = 'weekday';
    div.textContent = day;
    calendarHeader.appendChild(div);
  });
}

function initCalendarPage() {
  document.getElementById('prev-month').addEventListener('click', () => navigateMonth('prev'));
  document.getElementById('next-month').addEventListener('click', () => navigateMonth('next'));
  document.getElementById('today-btn').addEventListener('click', () => {
    currentDate = new Date();
    renderCalendar(currentDate);
  });

  ['homework', 'assessment', 'schedule'].forEach(cat => {
    document.getElementById(`filter-${cat}`).addEventListener('change', () => renderCalendar(currentDate));
  });

  document.getElementById('edit-task-btn').addEventListener('click', () => {
    const taskId = document.getElementById('edit-task-btn').dataset.taskId;
    bootstrap.Modal.getInstance(document.getElementById('taskDetailsModal')).hide();
    setTimeout(() => openEditTaskModal(taskId), 500);
  });

  renderCalendar(currentDate);
}

function renderCalendar(date) {
  renderWeekdaysHeader();
  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';

  document.getElementById('calendar-title').textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  let firstWeekday = firstDay.getDay();
  firstWeekday = firstWeekday === 0 ? 6 : firstWeekday - 1;

  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  const show = ['homework', 'assessment', 'schedule'].filter(cat => document.getElementById(`filter-${cat}`).checked);
  const filtered = tasks.filter(t => show.includes(t.category));

  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = 0; i < firstWeekday; i++) {
    const dayNum = prevMonthDays - firstWeekday + i + 1;
    fillDay(dayNum, new Date(year, month - 1, dayNum), 'other-month');
  }

  for (let i = 1; i <= daysInMonth; i++) {
    fillDay(i, new Date(year, month, i), isCurrentMonth && today.getDate() === i ? 'today' : '');
  }

  const total = firstWeekday + daysInMonth;
  for (let i = 1; i <= 42 - total; i++) {
    fillDay(i, new Date(year, month + 1, i), 'other-month');
  }

  function fillDay(num, dateObj, className) {
    const events = getEventsForDay(filtered, dateObj);
    grid.appendChild(createDayElement(num, dateObj, className, events));
  }
}

function createDayElement(dayNum, date, extraClass = '', events = []) {
  const day = document.createElement('div');
  day.className = `calendar-day ${extraClass}`;

  const num = document.createElement('div');
  num.className = 'date-number';
  num.textContent = dayNum;
  day.appendChild(num);

  if (events.length) {
    const container = document.createElement('div');
    container.className = 'day-events';

    events.forEach(event => {
      const e = document.createElement('div');
      e.className = `day-event ${event.category}${event.completed ? ' completed' : ''}`;
      const time = new Date(event.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      e.textContent = `${time} - ${event.title}`;
      e.dataset.id = event.id;
      e.onclick = ev => { ev.stopPropagation(); showTaskDetails(event.id); };
      container.appendChild(e);
    });

    day.appendChild(container);
  }
  return day;
}

function getEventsForDay(tasksArr, date) {
  const formattedDate = date.toISOString().slice(0, 10);
  return tasksArr.filter(t => {
    const due = typeof t.dueDate === 'string' ? t.dueDate.slice(0, 10) : new Date(t.dueDate).toISOString().slice(0, 10);
    return due === formattedDate;
  });
}

function showTaskDetails(taskId) {
  const task = (JSON.parse(localStorage.getItem('student-hub-tasks')) || []).find(t => t.id === taskId);
  if (!task) return;

  document.getElementById('detail-task-title').textContent = task.title;
  document.getElementById('detail-task-description').textContent = task.description || 'No description provided';

  const category = document.getElementById('detail-task-category');
  category.textContent = task.category;
  category.className = `badge bg-${task.category === 'homework' ? 'info' : task.category === 'assessment' ? 'danger' : 'success'}`;

  const priority = document.getElementById('detail-task-priority');
  priority.textContent = `Priority: ${task.priority}`;
  priority.className = `badge bg-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'}`;

  const due = new Date(task.dueDate);
  document.getElementById('detail-task-due-date').textContent = due.toLocaleDateString() + ' ' + due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  document.getElementById('detail-task-completed').checked = task.completed;
  document.getElementById('edit-task-btn').dataset.taskId = task.id;

  new bootstrap.Modal(document.getElementById('taskDetailsModal')).show();
}

function navigateMonth(dir) {
  const grid = document.getElementById('calendar-grid');
  const clone = grid.cloneNode(true);
  clone.classList.add('clone');
  clone.style.transform = dir === 'prev' ? 'translateX(100%)' : 'translateX(-100%)';
  grid.parentNode.appendChild(clone);

  currentDate.setMonth(currentDate.getMonth() + (dir === 'prev' ? -1 : 1));
  clone.offsetHeight;

  grid.classList.add(dir === 'prev' ? 'slide-left-out' : 'slide-right-out');
  clone.classList.add(dir === 'prev' ? 'slide-left-in' : 'slide-right-in');

  setTimeout(() => {
    clone.remove();
    grid.classList.remove('slide-left-out', 'slide-right-out');
    renderCalendar(currentDate);
  }, 300);
}

function initWeekPreview() {
  renderWeekPreview();
}

function renderWeekPreview() {
  const weekPreview = document.getElementById('week-preview');
  weekPreview.innerHTML = '';
  const today = new Date();
  const currentDay = today.getDay();
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - ((currentDay + 6) % 7));
  const tasksArr = tasks;

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  weekdays.forEach(day => {
    const dayHeader = document.createElement('div');
    dayHeader.classList.add('weekday');
    dayHeader.textContent = day;
    weekPreview.appendChild(dayHeader);
  });

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(firstDayOfWeek);
    currentDate.setDate(firstDayOfWeek.getDate() + i);
    const dayEvents = getEventsForDay(tasksArr, currentDate);

    const dayElement = document.createElement('div');
    dayElement.classList.add('day');
    if (currentDate.toDateString() === today.toDateString()) dayElement.classList.add('today');
    dayElement.textContent = currentDate.getDate();
    if (dayEvents.length > 0) {
      dayElement.classList.add('has-events');
      if (dayEvents.some(e => e.category === 'assessment')) dayElement.classList.add('assessment');
      else if (dayEvents.some(e => e.category === 'homework')) dayElement.classList.add('homework');
      else if (dayEvents.some(e => e.category === 'schedule')) dayElement.classList.add('schedule');
      dayElement.title = `${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}`;
    }
    weekPreview.appendChild(dayElement);
  }
}