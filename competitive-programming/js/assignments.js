/* ==========================================================================
   assignments.js — Renders assignment cards with due date, description,
   download action, and a submission-status selector backed by localStorage.
   ========================================================================== */

(function () {
  'use strict';
  const { initLayout, fetchJSON, escapeHTML, formatDate, daysUntil, getSubmissions, setSubmissionStatus, showToast } = window.CPPortal;

  const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  document.addEventListener('DOMContentLoaded', async () => {
    initLayout('assignments.html');
    try {
      const assignments = await fetchJSON('data/assignments.json');
      renderList(assignments);
    } catch (e) {
      document.getElementById('assignmentsList').innerHTML = `<div class="empty-state"><i class="fa-solid fa-file-pen"></i>Assignments could not be loaded.</div>`;
    }
  });

  function renderList(assignments) {
    const root = document.getElementById('assignmentsList');
    const submissions = getSubmissions();
    const sorted = [...assignments].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    root.innerHTML = sorted.map((a) => {
      const d = new Date(a.dueDate + 'T00:00:00');
      const days = daysUntil(a.dueDate);
      const status = submissions[a.id] || 'not-started';
      const overdue = days < 0 && status !== 'submitted';
      return `
        <div class="card assignment-card" id="${a.id}">
          <div class="assignment-date-block">
            <div class="day mono">${d.getDate()}</div>
            <div class="mon">${MONTHS[d.getMonth()]}</div>
          </div>
          <div class="assignment-body">
            <div class="assignment-body-top">
              <h4>${escapeHTML(a.title)}</h4>
              <span class="badge ${overdue ? 'badge-wa' : 'badge-info'}">${overdue ? 'Overdue' : escapeHTML(a.unit)}</span>
            </div>
            <p style="font-size:0.88rem;">${escapeHTML(a.description)}</p>
            <div class="problem-meta-row" style="margin-top:8px;">
              <span><i class="fa-regular fa-calendar"></i>Due ${formatDate(a.dueDate)}</span>
              <span><i class="fa-solid fa-star"></i>${a.maxMarks} marks</span>
            </div>
            <div class="assignment-actions">
              <button class="btn btn-secondary btn-sm" data-download="${escapeHTML(a.title)}"><i class="fa-solid fa-download"></i> Download</button>
              <select class="status-select" data-status-for="${a.id}">
                <option value="not-started" ${status === 'not-started' ? 'selected' : ''}>Not started</option>
                <option value="in-progress" ${status === 'in-progress' ? 'selected' : ''}>In progress</option>
                <option value="submitted" ${status === 'submitted' ? 'selected' : ''}>Submitted</option>
              </select>
            </div>
          </div>
        </div>
      `;
    }).join('');

    root.querySelectorAll('[data-download]').forEach((btn) => {
      btn.addEventListener('click', () => showToast(`Downloading "${btn.dataset.download}"`));
    });
    root.querySelectorAll('[data-status-for]').forEach((select) => {
      select.addEventListener('change', () => {
        setSubmissionStatus(select.dataset.statusFor, select.value);
        showToast('Submission status updated');
      });
    });
  }
})();
