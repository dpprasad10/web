/* ==========================================================================
   links.js — Renders the Important Links grid using the shared
   CP_PLATFORMS list (defined in resources.js) plus the CP handbook card.
   ========================================================================== */

(function () {
  'use strict';
  const { initLayout, escapeHTML, showToast } = window.CPPortal;

  document.addEventListener('DOMContentLoaded', () => {
    initLayout('links.html');
    const grid = document.getElementById('linksGrid');
    grid.innerHTML = window.CP_PLATFORMS.map((p) => `
      <a href="${p.url}" target="_blank" rel="noopener" class="card card-hover resource-card">
        <div class="platform-icon"><i class="fa-solid ${p.icon}"></i></div>
        <h4>${escapeHTML(p.name)}</h4>
        <p style="font-size:0.82rem;">${escapeHTML(p.desc)}</p>
      </a>
    `).join('');

    document.getElementById('handbookDownload').addEventListener('click', () => {
      showToast('Downloading CP Handbook PDF');
    });
  });
})();
