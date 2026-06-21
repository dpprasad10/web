/* ==========================================================================
   landing.js — Theme toggle (shares the same localStorage key as the
   Competitive Programming portal, so the preference carries across both),
   scroll-reveal animation, and small interactions for locked/add tiles.
   ========================================================================== */

(function () {
  'use strict';

  const THEME_KEY = 'cpportal_theme'; // same key used by the CP portal's app.js

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon();
  }
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
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

  function initLockedTiles() {
    document.querySelectorAll('.course-tile.upcoming').forEach((tile) => {
      tile.addEventListener('click', () => {
        tile.style.transform = 'translateX(-3px)';
        setTimeout(() => { tile.style.transform = ''; }, 150);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initScrollReveal();
    initLockedTiles();
    document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);
    const yearStamp = document.getElementById('yearStamp');
    if (yearStamp) yearStamp.textContent = new Date().getFullYear();
  });
})();
