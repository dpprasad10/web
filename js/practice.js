/* ==========================================================================
   practice.js — Renders practice problems grouped/filtered by difficulty,
   with bookmarking and Solve/Editorial/Video/Discussion actions.
   ========================================================================== */

(function () {
  'use strict';
  const { initLayout, fetchJSON, escapeHTML, isBookmarked, toggleBookmark, showToast } = window.CPPortal;

  let allProblems = [];
  let activeDiff = 'all';

  const DIFF_CLASS = { Easy: 'diff-easy', Medium: 'diff-medium', Hard: 'diff-hard' };
  const DIFF_BADGE = { Easy: 'badge-ac', Medium: 'badge-pending', Hard: 'badge-wa' };

  document.addEventListener('DOMContentLoaded', async () => {
    initLayout('practice.html');
    try {
      allProblems = await fetchJSON('data/practice.json');
      updateCounts();
      renderGrid();
      openFromHash();
    } catch (e) {
      document.getElementById('practiceGrid').innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><i class="fa-solid fa-code"></i>Practice problems could not be loaded.</div>`;
    }

    document.querySelectorAll('#difficultyTabs .tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#difficultyTabs .tab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeDiff = btn.dataset.diff;
        renderGrid();
      });
    });
  });

  function updateCounts() {
    document.getElementById('countAll').textContent = `(${allProblems.length})`;
    document.getElementById('countEasy').textContent = `(${allProblems.filter((p) => p.difficulty === 'Easy').length})`;
    document.getElementById('countMedium').textContent = `(${allProblems.filter((p) => p.difficulty === 'Medium').length})`;
    document.getElementById('countHard').textContent = `(${allProblems.filter((p) => p.difficulty === 'Hard').length})`;
  }

  function renderGrid() {
    const grid = document.getElementById('practiceGrid');
    const filtered = activeDiff === 'all' ? allProblems : allProblems.filter((p) => p.difficulty === activeDiff);
    if (!filtered.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><i class="fa-solid fa-code"></i>No problems in this category.</div>`;
      return;
    }
    grid.innerHTML = filtered.map((p) => {
      const bookmarked = isBookmarked(p.id);
      return `
      <div class="card card-hover problem-card" id="${p.id}">
        <div class="problem-card-top">
          <h4>${escapeHTML(p.title)}</h4>
          <button class="icon-btn ${bookmarked ? 'bookmark-active' : ''}" data-bookmark-id="${p.id}" data-bookmark-title="${escapeHTML(p.title)}" style="flex-shrink:0;width:30px;height:30px;">
            <i class="fa-${bookmarked ? 'solid' : 'regular'} fa-bookmark"></i>
          </button>
        </div>
        <span class="badge ${DIFF_BADGE[p.difficulty]}">${p.difficulty}</span>
        <div class="problem-meta-row">
          <span><i class="fa-solid fa-tag"></i>${escapeHTML(p.topic)}</span>
          <span><i class="fa-regular fa-clock"></i>${escapeHTML(p.estTime)}</span>
          <span><i class="fa-solid fa-server"></i>${escapeHTML(p.platform)}</span>
        </div>
        <div class="problem-actions">
          <a href="${p.solveUrl}" target="_blank" rel="noopener" class="btn btn-primary btn-sm"><i class="fa-solid fa-play"></i> Solve</a>
          <button class="btn btn-secondary btn-sm" data-info="Editorial"><i class="fa-solid fa-book-open"></i> Editorial</button>
          <button class="btn btn-secondary btn-sm" data-info="Video"><i class="fa-solid fa-circle-play"></i> Video</button>
          <button class="btn btn-secondary btn-sm" data-info="Discussion"><i class="fa-solid fa-comments"></i> Discussion</button>
        </div>
      </div>
    `;
    }).join('');

    grid.querySelectorAll('[data-bookmark-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.bookmarkId;
        const title = btn.dataset.bookmarkTitle;
        const nowActive = toggleBookmark(id, { type: 'problem', title, url: `practice.html#${id}` });
        btn.classList.toggle('bookmark-active', nowActive);
        btn.querySelector('i').className = `fa-${nowActive ? 'solid' : 'regular'} fa-bookmark`;
        showToast(nowActive ? 'Bookmarked' : 'Bookmark removed');
      });
    });
    grid.querySelectorAll('[data-info]').forEach((btn) => {
      btn.addEventListener('click', () => showToast(`Opening ${btn.dataset.info.toLowerCase()} — connect this to your hosted content.`, 'warn'));
    });
  }

  function openFromHash() {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }
})();
