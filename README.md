# Competitive Programming Learning Portal — 23CS4121

A static, JSON-driven course portal. No backend, no build step — open
`index.html` in a browser or host the folder as-is on GitHub Pages.

## For faculty: updating content

Everything content-related lives in `/data/*.json`. Edit these files in any
text editor and refresh the page — no HTML or JavaScript changes needed.

| File                     | Powers                                              |
|---------------------------|------------------------------------------------------|
| `data/syllabus.json`      | The 5-unit accordion on `syllabus.html`              |
| `data/notes.json`         | Course material cards on `materials.html`            |
| `data/videos.json`        | Video links attached to syllabus topics               |
| `data/assignments.json`   | Assignment cards + homepage "Upcoming Submissions"    |
| `data/announcements.json` | Homepage announcements feed                           |
| `data/practice.json`      | Practice problems, organized by difficulty            |
| `data/lab.json`           | The 14 programming lab experiments                    |
| `data/planner.json`       | The 16-week timeline on `planner.html`                |
| `data/papers.json`        | Previous question papers, grouped by year             |

### Adding a file to download
1. Drop the file into the matching `/assets/` subfolder (`pdfs`, `ppt`, `code`).
2. Reference its path in the relevant JSON entry's `"file"` field.
3. Wire the download button's `data-download` target to that real URL if you
   want actual file downloads (currently buttons show a placeholder toast —
   see "Connecting real files" below).

### Connecting real files
Material/assignment/paper download buttons currently show a toast notification
instead of triggering a real download, since no files are bundled in this
deliverable. To make them functional: open `js/materials.js`, `js/papers.js`,
or `js/assignments.js` and replace the `showToast(...)` call in each
`data-download` click handler with `window.open(fileUrl, '_blank')` (or set
the button as an `<a href="...">`), pointing at the uploaded file's real path.

## Features implemented
- Dark/light theme, persisted via `localStorage`
- Per-topic progress tracking with an overall progress ring (`localStorage`)
- Bookmarking for syllabus topics and practice problems (`localStorage`)
- Assignment submission-status tracker (`localStorage`)
- Global search (`/` key or the search bar) across syllabus, practice,
  lab, and video content
- Fully responsive: sidebar collapses to a hamburger menu under 860px

## Local development
Because the site fetches JSON via `fetch()`, open it through a local server
rather than `file://` (browsers block `fetch` on `file://` in most cases):

```bash
cd CompetitiveProgrammingPortal
python3 -m http.server 8000
# visit http://localhost:8000
```

## Deploying to GitHub Pages
1. Push this folder's contents to a repository.
2. In repo settings → Pages, set the source to the branch root.
3. Done — no build step required.
