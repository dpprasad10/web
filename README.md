# Course Portal Hub

A tile-based landing page for browsing multiple course portals. Static,
no backend, no build step — host the folder as-is on GitHub Pages.

## Structure

```
PortalRoot/
│── index.html                  ← Landing page (course tiles)
│── css/landing.css
│── js/landing.js
│
└── competitive-programming/    ← Full Competitive Programming (23CS4121) portal
    │── index.html              ← Opened when Tile 1 is clicked
    │── syllabus.html, materials.html, lab.html, ...
    │── css/, js/, data/, assets/
    └── README.md                ← Original portal-specific docs
```

## How it works

- `index.html` (root) shows a grid of course tiles.
- **Tile 1 — Competitive Programming** is live and links to
  `competitive-programming/index.html`, which is the complete portal built
  previously (syllabus, materials, lab, practice, assignments, etc.) —
  unchanged, just relocated into its own subfolder.
- The remaining tiles are placeholders marked **Coming Soon** — they're
  styled but not clickable, ready for you to wire up the same way once
  those course portals exist.

## Adding a new course tile

1. Build the new course's portal as its own self-contained folder (same
   pattern as `competitive-programming/` — relative paths only, own
   `css/`, `js/`, `data/` subfolders).
2. Drop that folder into `PortalRoot/` alongside `competitive-programming/`.
3. In the root `index.html`, copy one of the placeholder tile blocks inside
   `#tilesGrid`, change the class from `course-tile upcoming` to
   `course-tile live`, turn the `<div>` into an `<a href="your-folder/index.html">`,
   and update the icon, title, course code, and description.

## Theme persistence

Both the landing page and the Competitive Programming portal read/write the
same `localStorage` key (`cpportal_theme`), so switching dark/light mode on
one carries over to the other.

## Local development

```bash
cd PortalRoot
python3 -m http.server 8000
# visit http://localhost:8000
```

## Deploying to GitHub Pages

1. Push the entire `PortalRoot/` contents (including the
   `competitive-programming/` subfolder) to your repository root.
2. In repo settings → Pages, set the source to the branch root.
3. The landing page becomes your repo's homepage; Tile 1 routes into
   `/competitive-programming/` automatically.
