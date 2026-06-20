/* ==========================================================================
   lab.js — Renders the 14 programming lab experiments as expandable cards
   with problem statement, sample input/output, constraints, and action
   buttons (Solution, Code, Video, Practice link).
   ========================================================================== */

(function () {
  'use strict';
  const { initLayout, fetchJSON, escapeHTML, showToast } = window.CPPortal;

  document.addEventListener('DOMContentLoaded', async () => {
    initLayout('lab.html');
    try {
      const labs = await fetchJSON('data/lab.json');
      renderLabs(labs);
      openLabFromHash();
    } catch (e) {
      document.getElementById('labList').innerHTML = `<div class="empty-state"><i class="fa-solid fa-flask"></i>Lab experiments could not be loaded.</div>`;
    }
  });

  function renderLabs(labs) {
    const root = document.getElementById('labList');
    root.innerHTML = labs.map((lab, i) => `
      <div class="card lab-card" id="${lab.id}" data-lab-id="${lab.id}">
        <div class="lab-card-header" data-toggle>
          <h4><span class="lab-no mono">EXP ${String(i + 1).padStart(2, '0')}</span> ${escapeHTML(lab.title)}</h4>
          <i class="fa-solid fa-chevron-down accordion-chevron"></i>
        </div>
        <div class="lab-detail">
          <p style="margin-bottom:14px;">${escapeHTML(lab.problem)}</p>
          <div class="constraints"><i class="fa-solid fa-ruler" style="margin-right:6px;"></i>${escapeHTML(lab.constraints)}</div>
          <div class="io-grid">
            <div class="io-block"><div class="io-label">Sample Input</div><pre>${escapeHTML(lab.input)}</pre></div>
            <div class="io-block"><div class="io-label">Sample Output</div><pre>${escapeHTML(lab.output)}</pre></div>
          </div>
          <div class="material-actions">
            <button class="btn btn-secondary btn-sm" data-action="solution"><i class="fa-solid fa-lightbulb"></i> Solution</button>
            <button class="btn btn-secondary btn-sm" data-action="code"><i class="fa-solid fa-code"></i> Code</button>
            <button class="btn btn-secondary btn-sm" data-action="video"><i class="fa-solid fa-circle-play"></i> Video</button>
            <a href="${lab.practiceUrl}" target="_blank" rel="noopener" class="btn btn-primary btn-sm"><i class="fa-solid fa-arrow-up-right-from-square"></i> Practice Link</a>
          </div>
        </div>
      </div>
    `).join('');

    root.querySelectorAll('[data-toggle]').forEach((header) => {
      header.addEventListener('click', () => header.closest('.lab-card').classList.toggle('open'));
    });
    root.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showToast('This would open the ' + btn.dataset.action + ' for this experiment.', 'warn');
      });
    });
  }

  function openLabFromHash() {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) {
      el.classList.add('open');
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  }
})();
