# internal-lens-lab

A workspace for research programs and projects on methods that inspect and verbalize the information encoded in a model's internal features (logit and tuned lenses, Patchscopes, the Jacobian lens, self-interpretation). It ships with the resources for the Looped Lens Challenge, and participants fork it to manage their own projects. Plain HTML, CSS and vanilla JS; no build step, no server-side code; all content lives in two hand-edited data files. Two tabs: Resources (papers) and Research programs (each program with its projects under it). Add only features the person you are working with asks for.

## Design

Before adding or changing anything visual, read `docs/design-rules.md` and follow it. Use the variables in `tokens.css`, never raw hex or px. In short: one column; rows separated by hairlines, never cards; headings never bold; links in ink, never blue; statuses as plain words, never coloured pills; one photograph on Resources and at most one illustration per program, with nothing over them. Anything the rules do not cover (experiments, submissions, figures in notes) should reuse those patterns rather than add new chrome.

## Layout

- `index.html` — the Resources tab.
- `papers/<slug>.html` — a paper's reading notes, one per paper, opened from its title. Title, metadata and summary come from `resources.js` by `data-slug`; notes are written by hand inside `#notes` (`<p>`, `<h3>`, `<ul>`), which reads "No notes yet." while empty.
- `programs.html` — the Research programs tab; `program.html?p=<slug>` — one program and its projects; `project.html?p=<slug>` — one project: question, summary, and the papers it reads as Resources rows under "Reading".
- `resources.js` — the papers. One object per paper; edit by hand.
- `programs.js` — the programs, each holding its projects; edit by hand.
- `app.js` — renders every page from `resources.js` and `programs.js`.
- `app.css` — page styles, tokens only. `tokens.css` — colours, type and spacing, light and dark.
- `theme.js` — the Light/Dark switch in the header; `toc.js` — contents list on long notes pages; `cite.js` — links "Surname et al." to that paper's notes page.
- `images/` — the Resources masthead photograph and each program's illustration.
- `docs/design-rules.md` — the design rules.

Run locally: `python3 -m http.server 8770` (or the `internal-lens-lab` entry in `.claude/launch.json`).

## Adding a paper

Add an object to `window.RESOURCES` in `resources.js`, in its section, newest first: `title`, `slug` (short, unique; names the notes page), `url` (landing page), `pdf` (or `null`), `authors` (full list), `affiliation` (first author's, or `null`), `published` (`YYYY-MM-DD`, `YYYY-MM` or `YYYY`), `venue` (or `null` to show `arXiv <id>` or the host), `section`, `status` (`unread`, `reading` or `completed`; new papers start `unread`), `summary` (one to three sentences in your own words; never the abstract). Then copy any `papers/<slug>.html` to the new slug, set its `data-slug`, and empty its `#notes`. Take title, authors and date from the arXiv abstract page or the post itself, and the affiliation from the PDF's first page.

## Adding a program or project

Add an object to `window.PROGRAMS` in `programs.js` (`name`, `slug`, optional `url` for the program's own site, `started`, `status` of active | paused | done, `aim`, optional `image` and `imageAlt` for the program's own illustration in `images/`, `projects`), or a project to a program's `projects` (`title`, `slug` unique across all programs, `started`, `status` of idea | planning | active | writing | done, `question`, `summary`, `resources` as urls matching entries in `resources.js`). Write the aim, question and summary in the words of the person whose project it is.
