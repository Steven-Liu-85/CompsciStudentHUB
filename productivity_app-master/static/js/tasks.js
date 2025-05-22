// tasks.js (Firebase 연동 버전)

let tasks = [];

// Fetch tasks from Firebase
async function fetchTasks() {
  const res = await fetch('/api/tasks');
  const data = await res.json();
  tasks = data.tasks || [];
  renderTasks();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('task-list')) {
    fetchTasks();
    document.getElementById('save-task-btn').addEventListener('click', saveTask);
    document.getElementById('update-task-btn').addEventListener('click', updateTask);
    document.getElementById('delete-task-btn').addEventListener('click', deleteTask);
    document.getElementById('search-tasks').addEventListener('input', filterTasks);
    document.getElementById('search-button').addEventListener('click', filterTasks);
  }
});

function renderTasks(list = tasks) {
  const container = document.getElementById('task-list');

  // ❗#task-list가 없으면 함수 종료
  if (!container) return;

  // ✅ #empty-tasks가 없으면 생성해서 붙이기
  let empty = document.getElementById('empty-tasks');
  if (!empty) {
    empty = document.createElement('div');
    empty.id = 'empty-tasks';
    empty.className = 'text-center p-4 text-muted';
    empty.innerHTML = `
      <h5>No tasks found</h5>
      <p>Create a new task to get started</p>
    `;
    container.appendChild(empty);
  }

  // 🔁 리스트 초기화 (단, empty는 유지)
  container.innerHTML = '';
  container.appendChild(empty);

  if (!list.length) {
    empty.classList.remove('d-none');
    return;
  }
  empty.classList.add('d-none');

  list.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  list.forEach(task => {
    const item = document.createElement('div');
    item.className = `list-group-item task-item priority-${task.priority}`;
    if (task.completed) item.classList.add('completed');

    const due = new Date(task.dueDate);
    const overdue = !task.completed && new Date() > due;
    const dueText = `${overdue ? 'Overdue - ' : ''}Due: ${due.toLocaleDateString()} ${due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    item.innerHTML = `
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
            <small class="text-muted ${overdue ? 'text-danger' : ''}">${dueText}</small>
          </div>
        </div>
        <div>
          <button class="btn btn-sm btn-outline-secondary edit-task-btn" data-id="${task.id}">Edit</button>
        </div>
      </div>`;

    container.appendChild(item);
  });

  document.querySelectorAll('.edit-task-btn').forEach(btn => btn.addEventListener('click', () => openEdit(btn.dataset.id)));
  document.querySelectorAll('.task-check').forEach(box => box.addEventListener('change', () => toggleComplete(box.dataset.id, box.checked)));
}

async function saveTask() {
  const data = collect('task');
  if (!data.title || !data.dueDate) return alert('Title and Due Date required');

  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    bootstrap.Modal.getInstance(document.getElementById('addTaskModal')).hide();
    document.getElementById('task-form').reset();
    fetchTasks();
  } else alert('Failed to create task');
}

function openEdit(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  document.getElementById('edit-task-id').value = t.id;
  document.getElementById('edit-task-title').value = t.title;
  document.getElementById('edit-task-description').value = t.description;
  document.getElementById('edit-task-category').value = t.category;
  document.getElementById('edit-task-priority').value = t.priority;
  document.getElementById('edit-task-due-date').value = new Date(t.dueDate).toISOString().slice(0, 16);
  document.getElementById('edit-task-completed').checked = t.completed;
  new bootstrap.Modal(document.getElementById('editTaskModal')).show();
}

async function updateTask() {
  const id = document.getElementById('edit-task-id').value;
  const data = collect('edit-task');
  if (!data.title || !data.dueDate) return alert('Required fields missing');

  const res = await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (res.ok) {
    bootstrap.Modal.getInstance(document.getElementById('editTaskModal')).hide();
    fetchTasks();
  } else alert('Update failed');
}

async function deleteTask() {
  const id = document.getElementById('edit-task-id').value;
  if (!confirm('Delete this task?')) return;
  const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  if (res.ok) {
    bootstrap.Modal.getInstance(document.getElementById('editTaskModal')).hide();
    fetchTasks();
  } else alert('Delete failed');
}

async function toggleComplete(id, done) {
  const task = tasks.find(x => x.id === id);
  if (!task) return;
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...task, completed: done })
  });
  if (res.ok) fetchTasks();
}

function collect(prefix) {
  return {
    title: document.getElementById(`${prefix}-title`).value.trim(),
    description: document.getElementById(`${prefix}-description`).value.trim(),
    category: document.getElementById(`${prefix}-category`).value,
    priority: document.getElementById(`${prefix}-priority`).value,
    dueDate: document.getElementById(`${prefix}-due-date`).value,
    completed: prefix === 'edit-task' ? document.getElementById(`${prefix}-completed`).checked : false
  };
}

function filterTasks() {
  const q = document.getElementById('search-tasks').value.toLowerCase();
  const filtered = tasks.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  renderTasks(filtered);
}
