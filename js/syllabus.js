/* ==========================================================================
   syllabus.js — Renders the 5-unit accordion from syllabus.json.
   Handles: expand/collapse, topic completion checkboxes (progress tracker),
   bookmarking individual topics, and overall progress circle.
   ========================================================================== */

(function () {
  'use strict';
  const { initLayout, fetchJSON, isTopicComplete, setTopicComplete, isBookmarked, toggleBookmark, showToast, escapeHTML } = window.CPPortal;

  let allTopicIds = [];
  let videosByTopic = {};
  const CIRCUMFERENCE = 2 * Math.PI * 34; // r=34

  document.addEventListener('DOMContentLoaded', async () => {
    initLayout('syllabus.html');
    try {
      const [syllabus, videos] = await Promise.all([
        fetchJSON('data/syllabus.json'),
        fetchJSON('data/videos.json').catch(() => []),
      ]);
      videos.forEach((v) => { videosByTopic[v.topicId] = v; });
      renderAccordion(syllabus);
      collectTopicIds(syllabus);
      refreshOverallProgress();
      openUnitFromHash();
    } catch (e) {
      document.getElementById('syllabusAccordion').innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i>Could not load syllabus data.</div>`;
    }
  });

  function collectTopicIds(syllabus) {
    allTopicIds = [];
    syllabus.units.forEach((u) => u.groups.forEach((g) => g.topics.forEach((t) => allTopicIds.push(t.id))));
  }

  function renderAccordion(syllabus) {
    const root = document.getElementById('syllabusAccordion');
    root.innerHTML = syllabus.units.map((unit) => `
      <div class="accordion-item" id="${unit.id}" data-unit-id="${unit.id}">
        <div class="accordion-header" data-toggle="${unit.id}">
          <div class="accordion-header-left">
            <div class="unit-badge">${String(unit.number).padStart(2, '0')}</div>
            <div>
              <h3>${escapeHTML(unit.title)}</h3>
              <div class="unit-summary">${escapeHTML(unit.summary)}</div>
            </div>
          </div>
          <i class="fa-solid fa-chevron-down accordion-chevron"></i>
        </div>
        <div class="accordion-body">
          <div class="accordion-body-inner">
            ${unit.groups.map((group) => `
              <div class="topic-group">
                <div class="topic-group-heading">${escapeHTML(group.heading)}</div>
                ${group.topics.map((topic) => renderTopicRow(topic)).join('')}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `).join('');

    root.querySelectorAll('.accordion-header').forEach((header) => {
      header.addEventListener('click', () => {
        header.closest('.accordion-item').classList.toggle('open');
      });
    });

    root.querySelectorAll('.topic-check').forEach((box) => {
      box.addEventListener('click', (e) => {
        e.stopPropagation();
        const topicId = box.dataset.topicId;
        const nowComplete = !box.classList.contains('checked');
        setTopicComplete(topicId, nowComplete);
        box.classList.toggle('checked', nowComplete);
        box.innerHTML = nowComplete ? '<i class="fa-solid fa-check" style="font-size:0.6rem;"></i>' : '';
        refreshOverallProgress();
        if (nowComplete) showToast('Marked as completed');
      });
    });

    root.querySelectorAll('[data-bookmark-id]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.bookmarkId;
        const title = btn.dataset.bookmarkTitle;
        const nowActive = toggleBookmark(id, { type: 'topic', title, url: `syllabus.html#${id}` });
        btn.classList.toggle('bookmark-active', nowActive);
        showToast(nowActive ? 'Bookmarked' : 'Bookmark removed');
      });
    });

    root.querySelectorAll('[data-video-id]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showToast(`Playing "${btn.dataset.videoTitle}" — connect this to your hosted video URL.`, 'warn');
      });
    });

    // Stop clicks on resource icons (notes/video/etc.) from toggling accordion
    root.querySelectorAll('.topic-resources button').forEach((btn) => {
      if (!btn.dataset.bookmarkId && !btn.dataset.videoId) {
        btn.addEventListener('click', (e) => e.stopPropagation());
      }
    });
  }

  function renderTopicRow(topic) {
    const complete = isTopicComplete(topic.id);
    const bookmarked = isBookmarked(topic.id);
    const video = videosByTopic[topic.id];
    return `
      <div class="topic-row" id="${topic.id}">
        <button class="topic-check ${complete ? 'checked' : ''}" data-topic-id="${topic.id}" aria-label="Mark ${escapeHTML(topic.name)} complete">
          ${complete ? '<i class="fa-solid fa-check" style="font-size:0.6rem;"></i>' : ''}
        </button>
        <span class="topic-name">${escapeHTML(topic.name)}</span>
        <span class="topic-complexity mono">${escapeHTML(topic.complexity)}</span>
        <div class="topic-resources">
          ${topic.hasNotes ? '<button title="Notes"><i class="fa-solid fa-file-lines"></i></button>' : ''}
          ${topic.hasPPT ? '<button title="Slides"><i class="fa-solid fa-display"></i></button>' : ''}
          ${topic.hasVideo && video ? `<button title="Video: ${escapeHTML(video.title)} (${video.duration})" data-video-id="${video.id}" data-video-title="${escapeHTML(video.title)}"><i class="fa-solid fa-circle-play"></i></button>` : ''}
          ${topic.hasCode ? '<button title="Code examples"><i class="fa-solid fa-code"></i></button>' : ''}
          ${topic.hasPractice ? '<button title="Practice problems"><i class="fa-solid fa-dumbbell"></i></button>' : ''}
          <button title="Bookmark" class="${bookmarked ? 'bookmark-active' : ''}" data-bookmark-id="${topic.id}" data-bookmark-title="${escapeHTML(topic.name)}"><i class="fa-${bookmarked ? 'solid' : 'regular'} fa-bookmark"></i></button>
        </div>
      </div>
    `;
  }

  function refreshOverallProgress() {
    const stats = window.CPPortal.getProgressStats(allTopicIds);
    const circle = document.getElementById('overallCircle');
    const pctLabel = document.getElementById('overallPct');
    const text = document.getElementById('overallProgressText');
    const offset = CIRCUMFERENCE - (stats.pct / 100) * CIRCUMFERENCE;
    circle.style.strokeDashoffset = offset;
    pctLabel.textContent = stats.pct + '%';
    text.textContent = `${stats.completed} of ${stats.total} topics completed`;
  }

  function openUnitFromHash() {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const topicEl = document.getElementById(hash);
    if (!topicEl) return;
    const unitEl = topicEl.closest('.accordion-item');
    if (unitEl) {
      unitEl.classList.add('open');
      setTimeout(() => topicEl.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  }
})();
