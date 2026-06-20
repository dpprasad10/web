/* ==========================================================================
   materials.js — Renders course material cards from notes.json with
   type-based filter tabs and view/download actions.
   ========================================================================== */

(function () {
  'use strict';
  const { initLayout, fetchJSON, escapeHTML, showToast } = window.CPPortal;

  let allMaterials = [];
  let activeFilter = 'all';

  const TYPE_ICON = {
    'PDF Notes': 'fa-file-pdf',
    'PPT': 'fa-file-powerpoint',
    'Code Files': 'fa-file-code',
    'Sample Programs': 'fa-laptop-code',
    'Algorithms': 'fa-diagram-project',
    'Reference Books': 'fa-book',
  };

  document.addEventListener('DOMContentLoaded', async () => {
    initLayout('materials.html');
    try {
      allMaterials = await fetchJSON('data/notes.json');
      renderGrid();
    } catch (e) {
      document.getElementById('materialsGrid').innerHTML = emptyState('Materials could not be loaded.');
    }

    document.querySelectorAll('#materialFilterTabs .tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#materialFilterTabs .tab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        renderGrid();
      });
    });
  });

  function renderGrid() {
    const grid = document.getElementById('materialsGrid');
    const filtered = activeFilter === 'all' ? allMaterials : allMaterials.filter((m) => m.type === activeFilter);
    if (!filtered.length) {
      grid.innerHTML = emptyState('No materials found for this filter.');
      return;
    }
    grid.innerHTML = filtered.map((m) => `
      <div class="card card-hover material-card" id="${m.id}">
        <div class="material-card-top">
          <div class="material-icon"><i class="fa-solid ${TYPE_ICON[m.type] || 'fa-file'}"></i></div>
          <span class="badge badge-neutral">${escapeHTML(m.unit)}</span>
        </div>
        <h4>${escapeHTML(m.title)}</h4>
        <p>${escapeHTML(m.description)}</p>
        <div class="material-tags">${m.tags.map((t) => `<span class="tag">${escapeHTML(t)}</span>`).join('')}</div>
        <div class="material-meta">${escapeHTML(m.type)} · ${escapeHTML(m.size)}</div>
        <div class="material-actions">
          <button class="btn btn-secondary btn-sm" data-view="${m.file}"><i class="fa-solid fa-eye"></i> View</button>
          <button class="btn btn-primary btn-sm" data-download="${m.file}" data-title="${escapeHTML(m.title)}"><i class="fa-solid fa-download"></i> Download</button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('[data-view]').forEach((btn) => {
      btn.addEventListener('click', () => showToast('Opening preview — connect this to your hosted file URL.', 'warn'));
    });
    grid.querySelectorAll('[data-download]').forEach((btn) => {
      btn.addEventListener('click', () => showToast(`Downloading "${btn.dataset.title}"`));
    });
  }

  function emptyState(msg) {
    return `<div class="empty-state" style="grid-column:1/-1;"><i class="fa-solid fa-folder-open"></i>${escapeHTML(msg)}</div>`;
  }
})();
