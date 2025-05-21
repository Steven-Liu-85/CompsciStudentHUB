let notes = [];

async function fetchNotes() {
  const res = await fetch('/api/notes');
  const data = await res.json();
  notes = data.notes || [];
  updateTagFilter();
  renderNotes();
}

document.addEventListener('DOMContentLoaded', () => {
  fetchNotes();
  document.getElementById('add-note-btn').addEventListener('click', () => openModal());
  document.getElementById('note-search').addEventListener('input', renderNotes);
  document.getElementById('note-sort').addEventListener('change', renderNotes);
  document.getElementById('tag-filter').addEventListener('change', renderNotes);
  document.getElementById('save-note-btn').addEventListener('click', handleSave);
  document.getElementById('delete-note-btn').addEventListener('click', handleDelete);
});

function updateTagFilter() {
  const select = document.getElementById('tag-filter');
  const tags = Array.from(new Set(notes.flatMap(n => n.tags || []))).sort();
  select.innerHTML = '<option value="">All Tags</option>' + tags.map(t => `<option value="${t}">${t}</option>`).join('');
}

function renderNotes() {
  const grid = document.getElementById('notes-grid');
  const search = document.getElementById('note-search').value.toLowerCase();
  const sortBy = document.getElementById('note-sort').value;
  const tagFilter = document.getElementById('tag-filter').value;

  let filtered = notes.filter(n =>
    (n.title.toLowerCase() + ' ' + n.content.toLowerCase()).includes(search) &&
    (tagFilter === '' || (n.tags || []).includes(tagFilter))
  );

  if (sortBy === 'title') filtered.sort((a,b)=>a.title.localeCompare(b.title));
  else if (sortBy === 'category') filtered.sort((a,b)=>a.category.localeCompare(b.category));
  else if (sortBy === 'pinned') filtered.sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0));
  else filtered.sort((a,b)=>new Date(b.updatedAt||b.createdAt) - new Date(a.updatedAt||a.createdAt));

  grid.innerHTML = '';
  filtered.forEach(n => grid.appendChild(createCard(n)));
}

function createCard(note) {
  const col = document.createElement('div');
  col.className = 'col-md-4 mb-3';
  const div = document.createElement('div');
  div.className = 'card h-100 d-flex flex-column justify-content-between';
  div.style.cursor = 'pointer';
  const catColors = { lecture:'info',assignment:'warning',study:'success',other:'secondary' };

  div.innerHTML = `
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0 text-truncate" title="${note.title}">${note.title}</h5>
      ${note.pinned ? '<i class="fas fa-thumbtack text-warning"></i>' : ''}
    </div>
    <div class="card-body overflow-hidden">
      <div class="card-text" style="max-height:4.5em; overflow:hidden;">${marked.parseInline(note.content.length>150 ? note.content.slice(0,150)+'...' : note.content)}</div>
      <div class="mt-2">${(note.tags||[]).map(t=>`<span class="badge bg-light text-dark me-1">#${t}</span>`).join('')}</div>
    </div>
    <div class="card-footer text-muted">${note.category}</div>
  `;
  div.addEventListener('click', () => openModal(note));
  col.appendChild(div);
  return col;
}

function openModal(note={}) {
  const modalEl = document.getElementById('noteModal');
  const modal = new bootstrap.Modal(modalEl);
  document.getElementById('modal-title').textContent = note.id ? 'Edit Note' : 'New Note';
  document.getElementById('note-id').value = note.id || '';
  document.getElementById('note-title').value = note.title || '';
  document.getElementById('note-content').value = note.content || '';
  document.getElementById('note-category').value = note.category || 'lecture';
  document.getElementById('note-tags').value = (note.tags||[]).join(', ');
  document.getElementById('note-pinned').checked = !!note.pinned;
  document.getElementById('delete-note-btn').style.display = note.id ? 'inline-block' : 'none';
  modal.show();
}

function collect() {
  return {
    title: document.getElementById('note-title').value.trim(),
    content: document.getElementById('note-content').value.trim(),
    category: document.getElementById('note-category').value,
    tags: document.getElementById('note-tags').value.split(',').map(t=>t.trim()).filter(Boolean),
    pinned: document.getElementById('note-pinned').checked
  };
}

async function handleSave() {
  const id = document.getElementById('note-id').value;
  const payload = collect();
  if(!payload.title||!payload.content) return alert('Title and content required');
  const url = id? `/api/notes/${id}` : '/api/notes';
  const method = id? 'PUT':'POST';
  const res = await fetch(url, {method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)});
  if(res.ok) { document.querySelector('#noteModal .btn-close').click(); fetchNotes(); }
  else alert('Save failed');
}

async function handleDelete() {
  const id = document.getElementById('note-id').value;
  if(!id||!confirm('Delete this note?')) return;
  const res = await fetch(`/api/notes/${id}`, {method:'DELETE'});
  if(res.ok) { document.querySelector('#noteModal .btn-close').click(); fetchNotes(); }
  else alert('Delete failed');
}
