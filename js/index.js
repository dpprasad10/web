/* ==========================================================================
   index.js — Homepage rendering: quote of the day, quick nav cards,
   announcements feed, and upcoming submissions widget.
   ========================================================================== */

(function () {
  'use strict';
  const { initLayout, fetchJSON, formatDate, daysUntil, randomQuote, escapeHTML } = window.CPPortal;

  document.addEventListener('DOMContentLoaded', async () => {
    initLayout('index.html');
    renderQuote();
    renderQuickNav();
    await Promise.all([renderAnnouncements(), renderUpcoming()]);
  });

  function renderQuote() {
    const q = randomQuote();
    const el = document.getElementById('quoteBlock');
    el.innerHTML = `
      <span class="quote-mark">&ldquo;</span>
      <div>
        <blockquote>${escapeHTML(q.text)}</blockquote>
        <cite>— ${escapeHTML(q.author)}</cite>
        <div class="text-faint mono" style="font-size:0.68rem;margin-top:10px;">CODING QUOTE OF THE DAY</div>
      </div>
    `;
  }

  const QUICK_NAV = [
    { href: 'syllabus.html', icon: 'fa-list-check', title: 'Syllabus', desc: '5 units, fully expandable with notes & complexity.' },
    { href: 'materials.html', icon: 'fa-folder-open', title: 'Course Materials', desc: 'PDFs, slide decks, and reference code.' },
    { href: 'lab.html', icon: 'fa-flask', title: 'Programming Lab', desc: '14 experiments with sample I/O.' },
    { href: 'practice.html', icon: 'fa-code', title: 'Practice Problems', desc: 'Easy, Medium, Hard — sorted by difficulty.' },
    { href: 'assignments.html', icon: 'fa-file-pen', title: 'Assignments', desc: 'Track due dates and submission status.' },
    { href: 'resources.html', icon: 'fa-toolbox', title: 'Coding Resources', desc: 'Language guides and judge platform links.' },
    { href: 'papers.html', icon: 'fa-file-lines', title: 'Previous Papers', desc: 'Mid, semester, and practice papers by year.' },
    { href: 'planner.html', icon: 'fa-calendar-days', title: 'Weekly Schedule', desc: 'Full 16-week semester planner.' },
  ];

  function renderQuickNav() {
    const grid = document.getElementById('quickNavGrid');
    grid.innerHTML = QUICK_NAV.map((item) => `
      <a href="${item.href}" class="card card-hover nav-card">
        <div class="icon-wrap"><i class="fa-solid ${item.icon}"></i></div>
        <h4>${item.title}</h4>
        <p>${item.desc}</p>
        <div class="arrow">Open <i class="fa-solid fa-arrow-right"></i></div>
      </a>
    `).join('');
  }

  async function renderAnnouncements() {
    const list = document.getElementById('announcementsList');
    try {
      const data = await fetchJSON('data/announcements.json');
      const sorted = [...data].sort((a, b) => (b.pinned - a.pinned) || (new Date(b.date) - new Date(a.date)));
      const top = sorted.slice(0, 4);
      const iconMap = { contest: ['fa-trophy', 'badge-pending'], assignment: ['fa-file-pen', 'badge-info'], exam: ['fa-graduation-cap', 'badge-wa'], quiz: ['fa-bolt', 'badge-pending'], general: ['fa-circle-info', 'badge-neutral'] };
      list.innerHTML = top.map((a) => {
        const [icon, badgeClass] = iconMap[a.type] || iconMap.general;
        return `
          <div class="announcement ${a.pinned ? 'pinned' : ''}">
            <div class="a-icon ${badgeClass}"><i class="fa-solid ${icon}"></i></div>
            <div class="a-body">
              <div class="a-title">${escapeHTML(a.title)}</div>
              <div class="a-msg">${escapeHTML(a.message)}</div>
            </div>
            <div class="a-date">${formatDate(a.date)}</div>
          </div>
        `;
      }).join('');
    } catch (e) {
      list.innerHTML = `<div class="empty-state"><i class="fa-solid fa-bullhorn"></i>Announcements could not be loaded.</div>`;
    }
  }

  async function renderUpcoming() {
    const list = document.getElementById('upcomingList');
    try {
      const data = await fetchJSON('data/assignments.json');
      const upcoming = data
        .map((a) => ({ ...a, days: daysUntil(a.dueDate) }))
        .filter((a) => a.days >= -2)
        .sort((a, b) => a.days - b.days)
        .slice(0, 4);
      if (!upcoming.length) {
        list.innerHTML = `<div class="empty-state"><i class="fa-solid fa-circle-check"></i>No upcoming submissions. You're all caught up.</div>`;
        return;
      }
      list.innerHTML = upcoming.map((a) => {
        const urgent = a.days <= 3;
        return `
          <div class="announcement">
            <div class="a-icon ${urgent ? 'badge-wa' : 'badge-info'}"><i class="fa-solid fa-file-pen"></i></div>
            <div class="a-body">
              <div class="a-title">${escapeHTML(a.title)}</div>
              <div class="a-msg">${a.unit} · Due ${formatDate(a.dueDate)}</div>
            </div>
            <div class="a-date ${urgent ? 'diff-hard' : ''}">${a.days < 0 ? 'Past due' : a.days + 'd left'}</div>
          </div>
        `;
      }).join('');
    } catch (e) {
      list.innerHTML = `<div class="empty-state"><i class="fa-solid fa-file-pen"></i>Assignments could not be loaded.</div>`;
    }
  }
})();
