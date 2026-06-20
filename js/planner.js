/* ==========================================================================
   planner.js — Renders the 16-week semester planner as a vertical timeline,
   highlighting weeks that contain an assignment or quiz.
   ========================================================================== */

(function () {
  'use strict';
  const { initLayout, fetchJSON, escapeHTML } = window.CPPortal;

  document.addEventListener('DOMContentLoaded', async () => {
    initLayout('planner.html');
    try {
      const planner = await fetchJSON('data/planner.json');
      renderTimeline(planner);
    } catch (e) {
      document.getElementById('plannerTimeline').innerHTML = `<div class="empty-state"><i class="fa-solid fa-calendar-days"></i>Planner could not be loaded.</div>`;
    }
  });

  function renderTimeline(weeks) {
    const root = document.getElementById('plannerTimeline');
    root.innerHTML = weeks.map((w) => {
      const cls = [w.assignment ? 'has-assignment' : '', w.quiz ? 'has-quiz' : ''].filter(Boolean).join(' ');
      return `
        <div class="timeline-item ${cls}">
          <div class="timeline-dot"></div>
          <div class="card timeline-card">
            <div class="timeline-week-label">Week ${w.week}</div>
            <h4>${escapeHTML(w.topics.join(' · '))}</h4>
            <div class="timeline-topics">
              ${w.topics.map((t) => `<span class="tag">${escapeHTML(t)}</span>`).join('')}
            </div>
            <div class="timeline-meta-row">
              ${w.notes ? `<span><i class="fa-solid fa-note-sticky text-faint"></i>${escapeHTML(w.notes)}</span>` : ''}
              ${w.assignment ? `<span style="color:var(--info);"><i class="fa-solid fa-file-pen"></i>${escapeHTML(w.assignment)}</span>` : ''}
              ${w.quiz ? `<span style="color:var(--pending);"><i class="fa-solid fa-bolt"></i>Quiz this week</span>` : ''}
              ${w.practice && w.practice.length ? `<span><i class="fa-solid fa-dumbbell text-faint"></i>${escapeHTML(w.practice.join(', '))}</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
})();
