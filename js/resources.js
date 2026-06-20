/* ==========================================================================
   resources.js — Renders judge-platform cards (LeetCode, Codeforces, etc.)
   Shared PLATFORMS list also used by links.js for Important Links page.
   ========================================================================== */

window.CP_PLATFORMS = [
  { name: 'LeetCode', icon: 'fa-code', url: 'https://leetcode.com', desc: 'Interview-style problems with a vast discussion community.' },
  { name: 'HackerRank', icon: 'fa-h', url: 'https://www.hackerrank.com', desc: 'Structured tracks across algorithms, data structures, and languages.' },
  { name: 'CodeChef', icon: 'fa-utensils', url: 'https://www.codechef.com', desc: 'Long, short, and starter contests with strong beginner ramp.' },
  { name: 'Codeforces', icon: 'fa-c', url: 'https://codeforces.com', desc: 'The standard for rated competitive programming contests.' },
  { name: 'AtCoder', icon: 'fa-torii-gate', url: 'https://atcoder.jp', desc: 'Clean problem statements and excellent editorial quality.' },
  { name: 'GeeksforGeeks', icon: 'fa-graduation-cap', url: 'https://www.geeksforgeeks.org', desc: 'Deep-dive articles paired with practice problems per topic.' },
  { name: 'CSES Problem Set', icon: 'fa-list-ol', url: 'https://cses.fi/problemset/', desc: 'A focused, curriculum-aligned problem set — start here.' },
  { name: 'Visualgo', icon: 'fa-eye', url: 'https://visualgo.net', desc: 'Visual, step-through animations of core algorithms.' },
];

(function () {
  'use strict';
  const { initLayout, escapeHTML } = window.CPPortal;

  // Only run on resources.html — links.html includes this file for
  // CP_PLATFORMS data but drives its own layout/render via links.js.
  if (!document.getElementById('platformGrid')) return;

  document.addEventListener('DOMContentLoaded', () => {
    initLayout('resources.html');
    const grid = document.getElementById('platformGrid');
    grid.innerHTML = window.CP_PLATFORMS.map((p) => `
      <a href="${p.url}" target="_blank" rel="noopener" class="card card-hover resource-card">
        <div class="platform-icon"><i class="fa-solid ${p.icon}"></i></div>
        <h4>${escapeHTML(p.name)}</h4>
        <p style="font-size:0.82rem;">${escapeHTML(p.desc)}</p>
      </a>
    `).join('');
  });
})();
