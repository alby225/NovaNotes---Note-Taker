/**
 * NovaNotes Application Client
 * Full-Stack CRUD integration with Express.js REST API & MongoDB
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    notes: [],
    search: '',
    category: 'All',
    priority: 'All',
    sortBy: 'updated',
    pinnedOnly: false,
    editingNoteId: null,
    deletingNoteId: null,
    selectedColor: '#4f46e5',
  };

  // DOM Elements
  const notesGrid = document.getElementById('notesGrid');
  const pinnedNotesGrid = document.getElementById('pinnedNotesGrid');
  const pinnedNotesGroup = document.getElementById('pinnedNotesGroup');
  const allNotesGroup = document.getElementById('allNotesGroup');
  const allNotesTitle = document.getElementById('allNotesTitle');
  const loadingState = document.getElementById('loadingState');
  const emptyState = document.getElementById('emptyState');
  const emptyTitle = document.getElementById('emptyTitle');
  const emptySubtitle = document.getElementById('emptySubtitle');

  // Metrics
  const statTotalNotes = document.getElementById('statTotalNotes');
  const statPinnedNotes = document.getElementById('statPinnedNotes');
  const statCategories = document.getElementById('statCategories');
  const statHighPriority = document.getElementById('statHighPriority');
  const pinnedCount = document.getElementById('pinnedCount');
  const allNotesCount = document.getElementById('allNotesCount');

  // Controls
  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const priorityFilter = document.getElementById('priorityFilter');
  const sortBySelect = document.getElementById('sortBySelect');
  const pinnedOnlyCheck = document.getElementById('pinnedOnlyCheck');
  const categoryPills = document.getElementById('categoryPills');
  const dbStatusBadge = document.getElementById('dbStatusBadge');

  // Modals & Forms
  const noteModal = document.getElementById('noteModal');
  const noteForm = document.getElementById('noteForm');
  const modalTitle = document.getElementById('modalTitle');
  const modalHeaderIcon = document.getElementById('modalHeaderIcon');
  const saveBtnText = document.getElementById('saveBtnText');
  const noteIdInput = document.getElementById('noteId');
  const formTitle = document.getElementById('formTitle');
  const formCategory = document.getElementById('formCategory');
  const formPriority = document.getElementById('formPriority');
  const formContent = document.getElementById('formContent');
  const formTags = document.getElementById('formTags');
  const formIsPinned = document.getElementById('formIsPinned');
  const formColor = document.getElementById('formColor');
  const titleCharCount = document.getElementById('titleCharCount');
  const contentMeta = document.getElementById('contentMeta');
  const colorPickerGroup = document.getElementById('colorPickerGroup');

  // Buttons
  const openCreateModalBtn = document.getElementById('openCreateModalBtn');
  const emptyCreateBtn = document.getElementById('emptyCreateBtn');
  const closeNoteModalBtn = document.getElementById('closeNoteModalBtn');
  const cancelNoteModalBtn = document.getElementById('cancelNoteModalBtn');

  // Delete Modal Elements
  const deleteConfirmModal = document.getElementById('deleteConfirmModal');
  const deleteNoteTitlePreview = document.getElementById('deleteNoteTitlePreview');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');

  // API Docs Modal Elements
  const apiDocsModal = document.getElementById('apiDocsModal');
  const openApiDocsBtn = document.getElementById('openApiDocsBtn');
  const closeApiDocsBtn = document.getElementById('closeApiDocsBtn');
  const closeApiDocsBtnFooter = document.getElementById('closeApiDocsBtnFooter');

  const toastContainer = document.getElementById('toastContainer');

  // ==========================================================================
  // Utility Functions
  // ==========================================================================

  const escapeHTML = (str) => {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-solid fa-circle-check';
    if (type === 'error') iconClass = 'fa-solid fa-circle-exclamation';
    if (type === 'info') iconClass = 'fa-solid fa-circle-info';

    toast.innerHTML = `
      <i class="${iconClass} toast-icon"></i>
      <span class="toast-message">${escapeHTML(message)}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px) scale(0.95)';
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSec = Math.floor((now - date) / 1000);

    if (diffInSec < 60) return 'Just now';
    const diffInMin = Math.floor(diffInSec / 60);
    if (diffInMin < 60) return `${diffInMin}m ago`;
    const diffInHours = Math.floor(diffInMin / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const debounce = (func, wait = 300) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // ==========================================================================
  // API Calls
  // ==========================================================================

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        dbStatusBadge.innerHTML = `
          <span class="status-dot"></span>
          <span class="status-label">MongoDB: ${data.database.status} (${data.memoryUsage.heapUsed})</span>
        `;
        dbStatusBadge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      }
    } catch (err) {
      dbStatusBadge.innerHTML = `
        <span class="status-dot" style="background:#ef4444; box-shadow:0 0 8px #ef4444;"></span>
        <span class="status-label" style="color:#f87171;">Server Offline</span>
      `;
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/notes/stats/overview');
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.data) {
        statTotalNotes.textContent = json.data.totalNotes || 0;
        statPinnedNotes.textContent = json.data.pinnedNotes || 0;
        statCategories.textContent = json.data.categories ? json.data.categories.length : 0;
        statHighPriority.textContent = json.data.priorities ? json.data.priorities.High || 0 : 0;
      }
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
    }
  };

  const fetchNotes = async () => {
    loadingState.style.display = 'flex';
    emptyState.style.display = 'none';

    try {
      const params = new URLSearchParams();
      if (state.search) params.append('search', state.search);
      if (state.category && state.category !== 'All') params.append('category', state.category);
      if (state.priority && state.priority !== 'All') params.append('priority', state.priority);
      if (state.pinnedOnly) params.append('isPinned', 'true');
      if (state.sortBy) params.append('sortBy', state.sortBy);
      params.append('limit', '100');

      const res = await fetch(`/api/notes?${params.toString()}`);
      const result = await res.json();

      loadingState.style.display = 'none';

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch notes');
      }

      state.notes = result.data || [];
      renderNotes();
      fetchStats();
    } catch (error) {
      loadingState.style.display = 'none';
      showToast(error.message, 'error');
    }
  };

  // ==========================================================================
  // Render Engine
  // ==========================================================================

  const createNoteCardHTML = (note) => {
    const priorityClass = `priority-${(note.priority || 'medium').toLowerCase()}`;
    const formattedDate = formatRelativeTime(note.updatedAt || note.createdAt);

    const tagsHTML = (note.tags || [])
      .map((tag) => `<span class="tag-pill">#${escapeHTML(tag)}</span>`)
      .join('');

    return `
      <article class="note-card" data-id="${note._id}" style="--card-accent-color: ${note.color || '#4f46e5'};">
        <div class="card-top">
          <div class="card-badges">
            <span class="badge-category">${escapeHTML(note.category || 'General')}</span>
            <span class="badge-priority ${priorityClass}">
              <i class="fa-solid fa-flag"></i> ${escapeHTML(note.priority || 'Medium')}
            </span>
          </div>

          <button
            class="card-pin-btn ${note.isPinned ? 'pinned' : ''}"
            data-id="${note._id}"
            title="${note.isPinned ? 'Unpin note' : 'Pin note to top'}"
          >
            <i class="fa-solid fa-thumbtack"></i>
          </button>
        </div>

        <div>
          <h3 class="card-title">${escapeHTML(note.title)}</h3>
          <div class="card-content">${escapeHTML(note.content)}</div>
        </div>

        ${tagsHTML ? `<div class="card-tags">${tagsHTML}</div>` : ''}

        <div class="card-footer">
          <div class="card-timestamp" title="${new Date(note.updatedAt || note.createdAt).toLocaleString()}">
            <i class="fa-regular fa-clock"></i>
            <span>${formattedDate}</span>
          </div>

          <div class="card-actions">
            <button class="action-btn copy-btn" data-id="${note._id}" title="Copy content to clipboard">
              <i class="fa-regular fa-copy"></i>
            </button>
            <button class="action-btn edit-btn" data-id="${note._id}" title="Edit note">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button class="action-btn delete-btn" data-id="${note._id}" title="Delete note">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>
      </article>
    `;
  };

  const renderNotes = () => {
    notesGrid.innerHTML = '';
    pinnedNotesGrid.innerHTML = '';

    if (state.notes.length === 0) {
      pinnedNotesGroup.style.display = 'none';
      allNotesGroup.style.display = 'none';
      emptyState.style.display = 'flex';

      if (state.search || state.category !== 'All' || state.priority !== 'All' || state.pinnedOnly) {
        emptyTitle.textContent = 'No Matching Notes';
        emptySubtitle.textContent = 'No notes matched your search filters. Try clearing some criteria.';
      } else {
        emptyTitle.textContent = 'No Notes Yet';
        emptySubtitle.textContent = 'Create your first note to experience full CRUD persistence in MongoDB.';
      }
      return;
    }

    emptyState.style.display = 'none';

    // Separate into pinned and other notes if not filtering pinnedOnly
    const pinned = state.notes.filter((n) => n.isPinned);
    const others = state.notes.filter((n) => !n.isPinned);

    // Render Pinned Section
    if (pinned.length > 0 && !state.pinnedOnly) {
      pinnedNotesGroup.style.display = 'flex';
      pinnedCount.textContent = pinned.length;
      pinnedNotesGrid.innerHTML = pinned.map(createNoteCardHTML).join('');
    } else {
      pinnedNotesGroup.style.display = 'none';
    }

    // Render Other / All Notes Section
    allNotesGroup.style.display = 'flex';
    const renderList = state.pinnedOnly ? pinned : (pinned.length > 0 ? others : state.notes);
    allNotesCount.textContent = renderList.length;
    allNotesTitle.innerHTML = state.pinnedOnly
      ? `<i class="fa-solid fa-thumbtack group-icon amber-icon"></i> Pinned Notes (${renderList.length})`
      : (pinned.length > 0 ? `<i class="fa-solid fa-bars-staggered group-icon"></i> Other Notes` : `<i class="fa-solid fa-grip-vertical group-icon"></i> All Notes`);

    notesGrid.innerHTML = renderList.map(createNoteCardHTML).join('');
  };

  // ==========================================================================
  // Modal Handlers
  // ==========================================================================

  const openNoteModal = (note = null) => {
    noteForm.reset();
    updateCharAndWordCounters();

    if (note) {
      state.editingNoteId = note._id;
      modalTitle.textContent = 'Edit Note';
      modalHeaderIcon.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
      saveBtnText.textContent = 'Update Note';

      noteIdInput.value = note._id;
      formTitle.value = note.title || '';
      formCategory.value = note.category || 'General';
      formPriority.value = note.priority || 'Medium';
      formContent.value = note.content || '';
      formTags.value = (note.tags || []).join(', ');
      formIsPinned.checked = Boolean(note.isPinned);
      formColor.value = note.color || '#4f46e5';
      selectColorSwatch(note.color || '#4f46e5');
    } else {
      state.editingNoteId = null;
      modalTitle.textContent = 'Create New Note';
      modalHeaderIcon.innerHTML = '<i class="fa-solid fa-plus"></i>';
      saveBtnText.textContent = 'Save Note';
      noteIdInput.value = '';
      formCategory.value = state.category !== 'All' ? state.category : 'General';
      formPriority.value = 'Medium';
      formIsPinned.checked = false;
      formColor.value = '#4f46e5';
      selectColorSwatch('#4f46e5');
    }

    updateCharAndWordCounters();
    noteModal.classList.add('active');
    setTimeout(() => formTitle.focus(), 100);
  };

  const closeNoteModal = () => {
    noteModal.classList.remove('active');
    state.editingNoteId = null;
  };

  const selectColorSwatch = (color) => {
    state.selectedColor = color;
    formColor.value = color;
    document.querySelectorAll('.color-swatch').forEach((swatch) => {
      if (swatch.dataset.color.toLowerCase() === color.toLowerCase()) {
        swatch.classList.add('active');
      } else {
        swatch.classList.remove('active');
      }
    });
  };

  const updateCharAndWordCounters = () => {
    const titleLen = formTitle.value.length;
    titleCharCount.textContent = `${titleLen}/150`;

    const contentVal = formContent.value.trim();
    const words = contentVal ? contentVal.split(/\s+/).length : 0;
    const chars = formContent.value.length;
    contentMeta.textContent = `${words} words • ${chars} chars`;
  };

  // ==========================================================================
  // Form Submit (Create & Update CRUD)
  // ==========================================================================

  noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = formTitle.value.trim();
    const content = formContent.value.trim();
    const category = formCategory.value;
    const priority = formPriority.value;
    const tags = formTags.value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const isPinned = formIsPinned.checked;
    const color = formColor.value;

    if (!title) {
      showToast('Note title is required', 'error');
      formTitle.focus();
      return;
    }

    if (!content) {
      showToast('Note content is required', 'error');
      formContent.focus();
      return;
    }

    const payload = {
      title,
      content,
      category,
      priority,
      tags,
      isPinned,
      color,
    };

    saveBtnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    try {
      let res;
      if (state.editingNoteId) {
        // PUT /api/notes/:id
        res = await fetch(`/api/notes/${state.editingNoteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // POST /api/notes
        res = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save note');
      }

      showToast(state.editingNoteId ? 'Note updated successfully!' : 'Note created successfully!', 'success');
      closeNoteModal();
      fetchNotes();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      saveBtnText.textContent = state.editingNoteId ? 'Update Note' : 'Save Note';
    }
  });

  // ==========================================================================
  // Card Actions Event Delegation (Pin, Edit, Delete, Copy)
  // ==========================================================================

  document.addEventListener('click', async (e) => {
    // Pin / Unpin Button
    const pinBtn = e.target.closest('.card-pin-btn');
    if (pinBtn) {
      const id = pinBtn.dataset.id;
      try {
        const res = await fetch(`/api/notes/${id}/pin`, { method: 'PATCH' });
        const json = await res.json();
        if (res.ok && json.success) {
          showToast(json.message || 'Pin status updated', 'info');
          fetchNotes();
        } else {
          showToast(json.error || 'Failed to toggle pin', 'error');
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
      return;
    }

    // Edit Button
    const editBtn = e.target.closest('.edit-btn');
    if (editBtn) {
      const id = editBtn.dataset.id;
      const note = state.notes.find((n) => n._id === id);
      if (note) {
        openNoteModal(note);
      }
      return;
    }

    // Delete Button
    const deleteBtn = e.target.closest('.delete-btn');
    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      const note = state.notes.find((n) => n._id === id);
      if (note) {
        state.deletingNoteId = id;
        deleteNoteTitlePreview.textContent = `"${note.title}"`;
        deleteConfirmModal.classList.add('active');
      }
      return;
    }

    // Copy Content Button
    const copyBtn = e.target.closest('.copy-btn');
    if (copyBtn) {
      const id = copyBtn.dataset.id;
      const note = state.notes.find((n) => n._id === id);
      if (note) {
        navigator.clipboard.writeText(`${note.title}\n\n${note.content}`).then(() => {
          showToast('Note copied to clipboard!', 'info');
        }).catch(() => {
          showToast('Failed to copy to clipboard', 'error');
        });
      }
      return;
    }
  });

  // Confirm Delete Action
  confirmDeleteBtn.addEventListener('click', async () => {
    if (!state.deletingNoteId) return;

    confirmDeleteBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Deleting...';

    try {
      const res = await fetch(`/api/notes/${state.deletingNoteId}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete note');
      }

      showToast('Note permanently deleted', 'success');
      deleteConfirmModal.classList.remove('active');
      state.deletingNoteId = null;
      fetchNotes();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      confirmDeleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i> <span>Delete Note</span>';
    }
  });

  cancelDeleteBtn.addEventListener('click', () => {
    deleteConfirmModal.classList.remove('active');
    state.deletingNoteId = null;
  });

  closeDeleteModalBtn.addEventListener('click', () => {
    deleteConfirmModal.classList.remove('active');
    state.deletingNoteId = null;
  });

  // ==========================================================================
  // Toolbar Listeners (Search, Filter, Sort)
  // ==========================================================================

  // Live Search with Debounce
  const onSearchInput = debounce((val) => {
    state.search = val.trim();
    fetchNotes();
  }, 300);

  searchInput.addEventListener('input', (e) => {
    const val = e.target.value;
    searchClearBtn.style.display = val ? 'flex' : 'none';
    onSearchInput(val);
  });

  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchClearBtn.style.display = 'none';
    state.search = '';
    fetchNotes();
  });

  // Priority Filter
  priorityFilter.addEventListener('change', (e) => {
    state.priority = e.target.value;
    fetchNotes();
  });

  // Sort Order
  sortBySelect.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    fetchNotes();
  });

  // Pinned Only Toggle
  pinnedOnlyCheck.addEventListener('change', (e) => {
    state.pinnedOnly = e.target.checked;
    fetchNotes();
  });

  // Category Pills
  categoryPills.addEventListener('click', (e) => {
    const pill = e.target.closest('.pill');
    if (!pill) return;

    document.querySelectorAll('.pill').forEach((p) => p.classList.remove('active'));
    pill.classList.add('active');

    state.category = pill.dataset.category || 'All';
    fetchNotes();
  });

  // Swatch Color Click
  colorPickerGroup.addEventListener('click', (e) => {
    const swatch = e.target.closest('.color-swatch');
    if (swatch) {
      selectColorSwatch(swatch.dataset.color);
    }
  });

  // Live Input Counters
  formTitle.addEventListener('input', updateCharAndWordCounters);
  formContent.addEventListener('input', updateCharAndWordCounters);

  // Modal Open/Close Controls
  openCreateModalBtn.addEventListener('click', () => openNoteModal());
  emptyCreateBtn.addEventListener('click', () => openNoteModal());
  closeNoteModalBtn.addEventListener('click', closeNoteModal);
  cancelNoteModalBtn.addEventListener('click', closeNoteModal);

  // API Docs Modal Controls
  openApiDocsBtn.addEventListener('click', () => apiDocsModal.classList.add('active'));
  closeApiDocsBtn.addEventListener('click', () => apiDocsModal.classList.remove('active'));
  closeApiDocsBtnFooter.addEventListener('click', () => apiDocsModal.classList.remove('active'));

  // Close modals on outside click
  window.addEventListener('click', (e) => {
    if (e.target === noteModal) closeNoteModal();
    if (e.target === deleteConfirmModal) deleteConfirmModal.classList.remove('active');
    if (e.target === apiDocsModal) apiDocsModal.classList.remove('active');
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // Press '/' to focus search input
    if (e.key === '/' && document.activeElement !== searchInput && document.activeElement !== formTitle && document.activeElement !== formContent) {
      e.preventDefault();
      searchInput.focus();
    }
    // Press 'Escape' to close any active modal
    if (e.key === 'Escape') {
      if (noteModal.classList.contains('active')) closeNoteModal();
      if (deleteConfirmModal.classList.contains('active')) deleteConfirmModal.classList.remove('active');
      if (apiDocsModal.classList.contains('active')) apiDocsModal.classList.remove('active');
    }
  });

  // ==========================================================================
  // Application Bootstrap
  // ==========================================================================
  fetchHealth();
  fetchNotes();
  setInterval(fetchHealth, 15000); // Poll health check every 15s
});
