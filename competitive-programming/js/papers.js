/* ==========================================================================
   papers.js — Groups previous question papers by academic year and renders
   them as cards with a type badge and download action.
   ========================================================================== */

(function () {
  'use strict';
  const { initLayout, fetchJSON, escapeHTML, showToast } = window.CPPortal;

  const TYPE_BADGE = { 'Mid Exam': 'badge-pending', 'Semester Exam': 'badge-wa', 'Practice Papers': 'badge-info' };
  const TYPE_ICON = { 'Mid Exam': 'fa-clipboard-list', 'Semester Exam': 'fa-graduation-cap', 'Practice Papers': 'fa-pen' };

  document.addEventListener('DOMContentLoaded', async () => {
    initLayout('papers.html');
    try {
      const papers = await fetchJSON('data/papers.json');
      renderByYear(papers);
    } catch (e) {
      document.getElementById('papersByYear').innerHTML = `<div class="empty-state"><i class="fa-solid fa-file-lines"></i>Papers could not be loaded.</div>`;
    }
  });

  function renderByYear(papers) {
    const root = document.getElementById('papersByYear');
    const years = [...new Set(papers.map((p) => p.year))].sort().reverse();

    root.innerHTML = years.map((year) => {
      const items = papers.filter((p) => p.year === year);
      return `
        <div class="section">
          <div class="section-head"><h2><span class="unit-no mono">${year}</span> Academic Year</h2></div>
          <div class="grid grid-3">
            ${items.map((p) => `
              <div class="card card-hover material-card">
                <div class="material-card-top">
                  <div class="material-icon"><i class="fa-solid ${TYPE_ICON[p.type]}"></i></div>
                  <span class="badge ${TYPE_BADGE[p.type]}">${escapeHTML(p.type)}</span>
                </div>
                <h4>${escapeHTML(p.title)}</h4>
                <div class="material-actions">
                  <button class="btn btn-primary btn-sm" data-download="${escapeHTML(p.title)} (${year})"><i class="fa-solid fa-download"></i> Download</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');

    root.querySelectorAll('[data-download]').forEach((btn) => {
      btn.addEventListener('click', () => showToast(`Downloading "${btn.dataset.download}"`));
    });
  }
})();
