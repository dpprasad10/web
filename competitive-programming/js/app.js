/* ==========================================================================
   COMPETITIVE PROGRAMMING PORTAL — app.js
   Shared application logic: theme toggle, sidebar/nav, local-storage backed
   progress + bookmarks, global search, toasts, and small render helpers.
   Each page also has its own <page>.js for page-specific rendering, which
   calls into the helpers defined here (window.CPPortal).
   ========================================================================== */

(function () {
  'use strict';

  /* ----------------------------------------------------------------------
   * Constants
   * -------------------------------------------------------------------- */
  const STORAGE_KEYS = {
    theme: 'cpportal_theme',
    progress: 'cpportal_progress',       // { topicId: true }
    bookmarks: 'cpportal_bookmarks',     // { id: { type, title, url } }
    submissions: 'cpportal_submissions', // { assignmentId: status }
  };

  const NAV_ITEMS = [
    { href: '../index.html', label: 'Dashboard', icon: 'fa-house' },
    { href: 'index.html', label: 'Home', icon: 'fa-house' },
    { href: 'syllabus.html', label: 'Syllabus', icon: 'fa-list-check' },
    { href: 'materials.html', label: 'Course Materials', icon: 'fa-folder-open' },
    { href: 'lab.html', label: 'Programming Lab', icon: 'fa-flask' },
    { href: 'practice.html', label: 'Practice Problems', icon: 'fa-code' },
    { href: 'assignments.html', label: 'Assignments', icon: 'fa-file-pen' },
    { href: 'resources.html', label: 'Coding Resources', icon: 'fa-toolbox' },
    { href: 'papers.html', label: 'Previous Papers', icon: 'fa-file-lines' },
    { href: 'links.html', label: 'Important Links', icon: 'fa-link' },
    { href: 'planner.html', label: 'Weekly Schedule', icon: 'fa-calendar-days' },
    { href: 'faculty.html', label: 'About Faculty', icon: 'fa-chalkboard-user' },
  ];

  const CODING_QUOTES = [
    { text: 'Premature optimization is the root of all evil.', author: 'Donald Knuth' },
    { text: 'The best way to get a project done faster is to start sooner.', author: 'Jim Highsmith' },
    { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
    { text: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds' },
    { text: 'A problem well stated is a problem half solved.', author: 'Charles Kettering' },
    { text: 'Simplicity is prerequisite for reliability.', author: 'Edsger Dijkstra' },
    { text: 'Make it work, make it right, make it fast.', author: 'Kent Beck' },
    { text: 'Every great contest run starts with reading the constraints twice.', author: 'CP Wisdom' },
  ];

  /* ----------------------------------------------------------------------
   * Local storage helpers (safe get/set with JSON)
   * -------------------------------------------------------------------- */
  function lsGet(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function lsSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* storage unavailable — fail silently */ }
  }

  /* ----------------------------------------------------------------------
   * Theme (dark / light) — persisted to localStorage
   * -------------------------------------------------------------------- */
  function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEYS.theme) || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
  }
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEYS.theme, next);
    updateThemeIcon();
  }
  function updateThemeIcon() {
    const btn = document.getElementById('themeToggleBtn');
    if (!btn) return;
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    btn.innerHTML = current === 'dark'
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
  }

  /* ----------------------------------------------------------------------
   * Progress tracker (topics completed)
   * -------------------------------------------------------------------- */
  function getProgress() {
    return lsGet(STORAGE_KEYS.progress, {});
  }
  function setTopicComplete(topicId, complete) {
    const progress = getProgress();
    if (complete) progress[topicId] = true;
    else delete progress[topicId];
    lsSet(STORAGE_KEYS.progress, progress);
    document.dispatchEvent(new CustomEvent('progress:changed'));
  }
  function isTopicComplete(topicId) {
    return !!getProgress()[topicId];
  }
  function getProgressStats(allTopicIds) {
    const progress = getProgress();
    const completed = allTopicIds.filter((id) => progress[id]).length;
    const total = allTopicIds.length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { completed, total, pct };
  }

  /* ----------------------------------------------------------------------
   * Bookmarks (notes / videos / problems)
   * -------------------------------------------------------------------- */
  function getBookmarks() {
    return lsGet(STORAGE_KEYS.bookmarks, {});
  }
  function toggleBookmark(id, meta) {
    const bookmarks = getBookmarks();
    if (bookmarks[id]) {
      delete bookmarks[id];
    } else {
      bookmarks[id] = meta; // { type: 'note'|'video'|'problem', title, url }
    }
    lsSet(STORAGE_KEYS.bookmarks, bookmarks);
    document.dispatchEvent(new CustomEvent('bookmarks:changed'));
    return !!bookmarks[id];
  }
  function isBookmarked(id) {
    return !!getBookmarks()[id];
  }

  /* ----------------------------------------------------------------------
   * Assignment submission status
   * -------------------------------------------------------------------- */
  function getSubmissions() {
    return lsGet(STORAGE_KEYS.submissions, {});
  }
  function setSubmissionStatus(assignmentId, status) {
    const subs = getSubmissions();
    subs[assignmentId] = status;
    lsSet(STORAGE_KEYS.submissions, subs);
  }

  /* ----------------------------------------------------------------------
   * Toast notifications
   * -------------------------------------------------------------------- */
  function ensureToastContainer() {
    let el = document.querySelector('.toast-container');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast-container';
      document.body.appendChild(el);
    }
    return el;
  }
  function showToast(message, type) {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = 'toast' + (type === 'warn' ? ' toast-warn' : type === 'error' ? ' toast-error' : '');
    const icon = type === 'warn' ? 'fa-triangle-exclamation' : type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('leaving');
      setTimeout(() => toast.remove(), 240);
    }, 2800);
  }

  /* ----------------------------------------------------------------------
   * Layout injection: topbar + sidebar, built once per page
   * -------------------------------------------------------------------- */
  function buildTopbar(activePage) {
    const root = document.getElementById('topbarRoot');
    if (!root) return;
    root.innerHTML = `
      <div class="topbar-left">
        <button class="icon-btn hamburger" id="hamburgerBtn" aria-label="Open menu">
          <i class="fa-solid fa-bars"></i>
        </button>
        <a href="index.html" class="brand">
          <span class="prompt-symbol">&gt;_</span>
          <span>CP Portal</span>
          <span class="course-code">23CS4121</span>
        </a>
      </div>
      <div class="topbar-right">
        <div class="topbar-search" id="topbarSearchTrigger" role="button" tabindex="0" aria-label="Search">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="topbarSearchInput" placeholder="Search topics, problems, units..." autocomplete="off" />
          <span class="kbd-hint">/</span>
        </div>
        <button class="icon-btn" id="searchIconBtn" aria-label="Search" style="display:none;">
          <i class="fa-solid fa-magnifying-glass"></i>
        </button>
        <button class="icon-btn" id="themeToggleBtn" aria-label="Toggle theme">
          <i class="fa-solid fa-sun"></i>
        </button>
      </div>
    `;
    updateThemeIcon();
  }

  function buildSidebar(activePage) {
    const root = document.getElementById('sidebarRoot');
    if (!root) return;
    const links = NAV_ITEMS.map((item) => {
      const isActive = item.href === activePage;
      return `<a href="${item.href}" class="${isActive ? 'active' : ''}">
        <i class="fa-solid ${item.icon}"></i><span>${item.label}</span>
      </a>`;
    }).join('');

    root.innerHTML = `
      <div class="sidebar-section-label">Navigate</div>
      <nav>${links}</nav>
      <div class="sidebar-progress" id="sidebarProgressWidget">
        <div class="sidebar-progress-label">
          <span>Your Progress</span>
          <span id="sidebarProgressPct" class="mono">0%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" id="sidebarProgressFill" style="width:0%"></div>
        </div>
      </div>
    `;
  }

  function buildSidebarOverlay() {
    if (document.querySelector('.sidebar-overlay')) return;
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', closeMobileSidebar);
  }

  function openMobileSidebar() {
    document.getElementById('sidebarRoot').classList.add('show');
    document.querySelector('.sidebar-overlay').classList.add('show');
  }
  function closeMobileSidebar() {
    document.getElementById('sidebarRoot').classList.remove('show');
    document.querySelector('.sidebar-overlay').classList.remove('show');
  }

  function buildFooter() {
    const root = document.getElementById('footerRoot');
    if (!root) return;
    const year = new Date().getFullYear();
    root.innerHTML = `
      <span>23CS4121 · Competitive Programming · © ${year}</span>
      <div class="footer-links">
        <a href="faculty.html">About Faculty</a>
        <a href="links.html">Important Links</a>
        <a href="resources.html">Resources</a>
      </div>
    `;
  }

  /* Update the small progress widget that lives in the sidebar on every page */
  async function refreshSidebarProgressWidget() {
    const fillEl = document.getElementById('sidebarProgressFill');
    const pctEl = document.getElementById('sidebarProgressPct');
    if (!fillEl || !pctEl) return;
    try {
      const syllabus = await fetchJSON('data/syllabus.json');
      const allTopicIds = [];
      syllabus.units.forEach((u) => u.groups.forEach((g) => g.topics.forEach((t) => allTopicIds.push(t.id))));
      const stats = getProgressStats(allTopicIds);
      fillEl.style.width = stats.pct + '%';
      pctEl.textContent = stats.pct + '%';
    } catch (e) { /* syllabus not available on this page context */ }
  }

  /* ----------------------------------------------------------------------
   * Data fetching helper (works with file:// fallback messaging)
   * -------------------------------------------------------------------- */
  async function fetchJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error('Failed to load ' + path);
    return res.json();
  }

  /* ----------------------------------------------------------------------
   * Global search (across syllabus topics, practice problems, assignments)
   * -------------------------------------------------------------------- */
  let searchIndex = null;

  async function buildSearchIndex() {
    if (searchIndex) return searchIndex;
    const index = [];
    try {
      const syllabus = await fetchJSON('data/syllabus.json');
      syllabus.units.forEach((unit) => {
        unit.groups.forEach((group) => {
          group.topics.forEach((topic) => {
            index.push({
              title: topic.name,
              source: `Syllabus · Unit ${unit.number}`,
              url: `syllabus.html#${topic.id}`,
              icon: 'fa-list-check',
            });
          });
        });
      });
    } catch (e) {}
    try {
      const practice = await fetchJSON('data/practice.json');
      practice.forEach((p) => {
        index.push({ title: p.title, source: `Practice · ${p.difficulty}`, url: `practice.html#${p.id}`, icon: 'fa-code' });
      });
    } catch (e) {}
    try {
      const assignments = await fetchJSON('data/assignments.json');
      assignments.forEach((a) => {
        index.push({ title: a.title, source: `Assignment · Due ${a.dueDate}`, url: `assignments.html#${a.id}`, icon: 'fa-file-pen' });
      });
    } catch (e) {}
    try {
      const lab = await fetchJSON('data/lab.json');
      lab.forEach((l) => {
        index.push({ title: l.title, source: 'Programming Lab', url: `lab.html#${l.id}`, icon: 'fa-flask' });
      });
    } catch (e) {}
    try {
      const videos = await fetchJSON('data/videos.json');
      videos.forEach((v) => {
        index.push({ title: v.title, source: `Video · ${v.unit} · ${v.duration}`, url: `syllabus.html#${v.topicId}`, icon: 'fa-circle-play' });
      });
    } catch (e) {}
    searchIndex = index;
    return index;
  }

  function buildSearchOverlay() {
    if (document.querySelector('.search-overlay')) return;
    const overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.innerHTML = `
      <div class="search-modal">
        <div class="search-modal-input">
          <i class="fa-solid fa-magnifying-glass text-faint"></i>
          <input type="text" id="searchModalInput" placeholder="Search topics, problems, units, assignments..." autocomplete="off" />
        </div>
        <div id="searchResultsList"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeSearchOverlay();
    });
    document.getElementById('searchModalInput').addEventListener('input', handleSearchInput);
  }

  async function openSearchOverlay(prefill) {
    buildSearchOverlay();
    await buildSearchIndex();
    const overlay = document.querySelector('.search-overlay');
    overlay.classList.add('show');
    const input = document.getElementById('searchModalInput');
    input.value = prefill || '';
    input.focus();
    if (prefill) handleSearchInput({ target: input });
    else renderSearchResults(searchIndex.slice(0, 8));
  }
  function closeSearchOverlay() {
    const overlay = document.querySelector('.search-overlay');
    if (overlay) overlay.classList.remove('show');
  }
  function handleSearchInput(e) {
    const q = e.target.value.trim().toLowerCase();
    if (!q) { renderSearchResults(searchIndex.slice(0, 8)); return; }
    const results = searchIndex.filter((item) => item.title.toLowerCase().includes(q) || item.source.toLowerCase().includes(q));
    renderSearchResults(results.slice(0, 30));
  }
  function renderSearchResults(results) {
    const list = document.getElementById('searchResultsList');
    if (!list) return;
    if (results.length === 0) {
      list.innerHTML = `<div class="search-empty"><i class="fa-solid fa-magnifying-glass" style="display:block;margin-bottom:8px;font-size:1.4rem;"></i>No matches found. Try a different term.</div>`;
      return;
    }
    list.innerHTML = results.map((r) => `
      <a href="${r.url}" class="search-result-item">
        <i class="fa-solid ${r.icon} text-faint"></i>
        <div style="flex:1;min-width:0;">
          <div style="font-size:0.88rem;font-weight:500;">${escapeHTML(r.title)}</div>
          <div class="src">${escapeHTML(r.source)}</div>
        </div>
        <i class="fa-solid fa-arrow-right text-faint" style="font-size:0.7rem;"></i>
      </a>
    `).join('');
  }

  /* ----------------------------------------------------------------------
   * Scroll-reveal animation observer
   * -------------------------------------------------------------------- */
  function initScrollReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    items.forEach((item) => observer.observe(item));
  }

  /* ----------------------------------------------------------------------
   * Small utilities
   * -------------------------------------------------------------------- */
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }
  function formatDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function daysUntil(iso) {
    const target = new Date(iso + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((target - today) / 86400000);
  }
  function randomQuote() {
    return CODING_QUOTES[Math.floor(Math.random() * CODING_QUOTES.length)];
  }

  /* ----------------------------------------------------------------------
   * Layout bootstrap — call on every page
   * -------------------------------------------------------------------- */
  function initLayout(activePage) {
    initTheme();
    buildTopbar(activePage);
    buildSidebar(activePage);
    buildSidebarOverlay();
    buildFooter();
    refreshSidebarProgressWidget();

    document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);
    document.getElementById('hamburgerBtn').addEventListener('click', openMobileSidebar);

    const searchTrigger = document.getElementById('topbarSearchTrigger');
    searchTrigger.addEventListener('click', () => openSearchOverlay());
    searchTrigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') openSearchOverlay();
    });
    document.getElementById('topbarSearchInput').addEventListener('focus', (e) => {
      e.target.blur();
      openSearchOverlay();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        openSearchOverlay();
      }
      if (e.key === 'Escape') closeSearchOverlay();
    });

    document.addEventListener('progress:changed', refreshSidebarProgressWidget);

    initScrollReveal();
  }

  /* ----------------------------------------------------------------------
   * Expose shared API
   * -------------------------------------------------------------------- */
  window.CPPortal = {
    initLayout,
    fetchJSON,
    showToast,
    escapeHTML,
    formatDate,
    daysUntil,
    randomQuote,
    getProgress,
    setTopicComplete,
    isTopicComplete,
    getProgressStats,
    getBookmarks,
    toggleBookmark,
    isBookmarked,
    getSubmissions,
    setSubmissionStatus,
    initScrollReveal,
    closeMobileSidebar,
    NAV_ITEMS,
  };
})();
