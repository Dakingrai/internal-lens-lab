# Design rules

Read this before adding or changing anything visual in this app, whether you are a person or a coding agent. Values come from `tokens.css`; use the variables, never raw hex or px. The look follows a few principles: one quiet column of serif titles and sans metadata; rows, not cards; colour only where it means something; states as plain words; one photograph on Readings and at most one illustration per program. Keeping to these rules keeps every fork recognisably the same tool.

## The page

1. White page (`--bg`), one column (`--col-main`), text flush left. No sidebars, cards, shadows or boxes, and no filled surface but the footer band (rule 45); the one exception is a long page's contents list (rule 29). Separate things with space or `--hairline`, never a border box.
2. The interface is `--sans`: nav, labels, metadata, summaries, counts. A resource's title, the page title, section headings and the site name in the header are `--serif`. Code is `--mono`.
3. Page heading `--fs-title` serif weight 400; section heading `--fs-h2` serif weight 400. Never bold a heading.
4. Header: the wordmark on the left, which is the glyph (rule 46) then the site name in `--serif` `--fs-h2` weight 400 `--ink`, tabs on the right, the Light/Dark switch (`theme.js`) a `--fs-meta` `--ink-2` text button at the right of the first line. Tabs are `--fs-body` `--ink-2`; the active tab is `--ink` with a 2px `--ink` underline. The tabs are Home, Readings and Research programs, in that order. No colour, pill or background on tabs.
5. One hairline under the header and one on the footer's top edge (rule 45); otherwise only the hairlines between rows.
6. Order of a tab: header, page title, lede, masthead if the tab has one, content.

## Photographs

7. At most one photograph per tab, its masthead, between the lede and the content, full column width. Readings uses `--masthead-resources-ratio` up to `--masthead-resources-max-h`; any later tab uses `--masthead-ratio` between `--masthead-min-h` and `--masthead-max-h`. `object-fit: cover`.
8. No text, caption, credit, border, shadow or overlay. Corner radius `--radius`. Alt text is one plain sentence.
9. Dark mode applies `filter: var(--photo-dim)` and nothing else.
10. Nothing in or around the masthead animates.
11. Readings uses `images/masthead-resources-{880,1760}.jpg` (the classroom), with `srcset` and `sizes` matching `--col-main`. A new tab may get its own photograph, following rules 7–10. Research programs has none; a program's own illustration is its mark (rule 42).
12. Photographs appear only as mastheads.

## The list of readings

13. Above the list, one line: the reading-status filter at the left, the count at the right in `--fs-meta` `--ink-3`, "N readings", or "N of M readings" while a filter is chosen.
14. Grouped by `section`, in order of first use in `resources.js`; rows keep the file's order (newest first within a section). No sorting, search or pagination.
15. A section heading is `--fs-h2` serif `--ink` with its count in `--sans` `--fs-meta` `--ink-3`; `--s-7` above, `--s-3` below.
16. One resource is one row: title line, metadata line, summary. Rows separated by `--hairline`, `--s-4` padding above and below.
17. Title `--serif` `--fs-item` `--ink`, linking to `papers/<slug>.html`; no underline at rest, 1px `--rule` underline on hover. Nothing else on the title line.
18. Metadata line `--sans` `--fs-meta` `--ink-2`, ` · ` separated: authors (one to three in full, else first author "et al.", full list as the line's `title`), affiliation if any, where it is published (`venue`, else `arXiv <id>`, else the bare host), date at the data's precision (`8 Nov 2023`, `Oct 2026`, `2026`), then `PDF` when the data has one.
19. The source and `PDF` link to `url` and `pdf` in a new tab, `--ink-2` with a 1px `--rule` underline, `--ink` on hover. Never an icon or blue.
20. Summary `--sans` `--fs-body` `--ink-2`, in full, `--s-2` above; our own words, one to three sentences, never the abstract.
21. Nothing in a row is coloured. `--interact` means *you can touch this*, `--highlight` *look here*; neither is used on this tab. `--cat-*` and `--seq-*` are for marks in figures only.

## The reading-status filter

22. A `role="group"` labelled "Filter by reading status": All, Reading, Completed, Unread as text buttons, `--sans` `--fs-meta`, `--s-4` apart. Unchosen `--ink-2`, `--ink` on hover; chosen `--ink` weight 500 with `aria-pressed="true"`. No underline, border, background, pill or colour.
23. While a filter other than All is chosen, empty sections are hidden and the count reads "N of M readings". Nothing animates.
24. A paper's status appears nowhere on its row; the filter is where it lives.

## A paper's notes page

25. `papers/<slug>.html`: header with Readings active, kicker `Readings` (a link, `--fs-meta`), the title as `h1`, the metadata line (rule 18), then the sections "AI-generated summary" and "Notes" as `h2`. Title, metadata and summary come from `resources.js`.
26. Notes are prose in `--col-text`, `--serif` `--fs-prose` / `--lh-prose`; subheadings `h3` at `--fs-item` weight 400. Empty notes read "No notes yet." in `--fs-meta` `--ink-3`.
27. Links in prose are `--ink` with a 1px `--rule` underline, `--ink` underline on hover.
28. "Surname et al." in a notes page links to that paper's notes page by `cite.js`, `a.cite`, the colour of the text around it.
29. A notes page with four or more heading entries gets a contents list from `toc.js`: in the left margin at 1280px and wider, under the title below that; the section being read is `--ink` weight 500. List pages have none.

## The Research programs tab

32. The tab is three pages, plus each experiment's page (rule 51): `programs.html` lists the programs, `program.html?p=<slug>` is one program with its projects, `project.html?p=<slug>` is one project. All three keep the header with Research programs the active tab.
33. `programs.html`: header, page title, lede, one count line in `--fs-meta` `--ink-3` reading `N programs`, then one row per program in the order of `programs.js`. Programs only: projects appear only on their program's page. No sections.
34. A program row is a Readings row (rules 16–21): title links to its program page; metadata line reads status as a plain word ` · started <date>`, then the host of `url` (for example `ndif.us`) as a new-tab link styled as rule 19 when the program has one; summary is the aim. A program with a mark shows it in a left column, `--mark-size-row` wide (`--mark-size-sm` below 600px), `--s-5` from the text (`--s-4` on a phone), top-aligned; the mark links to the program page but is skipped by the keyboard and has empty alt, since the title says the same.
35. `program.html`: kicker, then the program's mark in a left column, `--mark-size` wide (`--mark-size-page-sm` below 600px), `--s-6` from the text (`--s-4` on a phone), top-aligned, beside the program's name as the page title, one metadata line (status ` · ` started ` · ` host link) and the aim as the lede (`--fs-lede` `--ink-2`); then one count line `N projects` and one row per project in the data's order, full width. Without a mark the title block is one column.
36. A project row: title links to its project page; metadata line status ` · ` started; summary is the research question.
37. `project.html`: kicker, title, one metadata line (status ` · ` started), the question block, the summary as prose, then the Reading section.
38. The kicker is `--sans` `--fs-meta` `--ink-3`, `--s-2` above the title. On a program page it is `Research programs`; on a project page `Research programs · <program name>`, both links in `--ink-2` with a 1px `--rule` underline, `--ink` on hover.
39. The question block (`.question-page`) is the question in `--serif` `--fs-h2` weight 400 `--ink`, a 2px `--rule` line on its left, `--s-4` left padding. No background, box, colour or label.
40. The summary is prose in `--col-text`, `--serif` `--fs-prose` / `--lh-prose` `--ink`.
41. The Reading section opens with `Reading` (`--fs-h2` serif) and its count, then the project's papers as full Readings rows in the data's order. Omitted when the project lists none.
42. A program may have one mark: its own illustration (`image` and `imageAlt` in `programs.js`, a file in `images/`, SVG where there is one). It appears in the left column of its row on `programs.html` and of its page's title block (rules 34–35), square, shown whole and never cropped. No caption, credit, border, shadow, radius, filter or overlay, and it does not animate. A program without one shows nothing there. Project pages carry no image.
43. Status is always a plain word, never a coloured tag, badge or icon. Nothing on these pages is coloured.
44. Nothing else on a program or project page (notes, submissions, deadlines) apart from experiments (rules 47–54) detail tiles (rules 55–56) and useful links (rule 63) unless it is needed; anything new should follow the patterns above (rows, plain-word states, ink links).

## The glyph

46. The site has one glyph, `favicon.svg`: an open loop that comes back to a point. It is the browser-tab icon on every page and sits before the site name in the header at `--glyph-size`, in `--highlight`. This is the one place a colour appears outside figures; nothing else in the header, rows or footer is coloured. The file itself carries the light value of `--highlight` as a hex, since a favicon cannot read tokens. It also opens the footer's wordmark (rule 45). It never animates and is not used anywhere else.

## The footer

45. Every page ends with one footer, drawn by `app.js`: a band across the whole window in `--surface-sunk` with a `--hairline` on its top edge, sitting at the bottom of the window on a short page. Its content keeps to the page column, in two parts. At the left, the wordmark (rule 4) linking to Home, and under it one or two sentences in `--sans` `--fs-body` `--ink-2`, no wider than `--foot-about-max`, saying what the tool is. At the right, `--foot-links-w` wide, one row per link separated by `--hairline`: the header's tabs, then `GitHub`, each in `--ink` with an arrow at the right in `--ink-3` (`→` inside the app, `↗` for the repository, which opens in a new tab); the arrow turns `--ink` on hover. On a phone the rows go under the description at full width. This band is the one filled surface on a page. No icon beyond the glyph, no copyright line, no further links. A fork points the link at its own repository.

## Home and experiments

47. An experiment belongs to a project (`experiments` in `programs.js`). Its metadata line is `--sans` `--fs-meta` `--ink-2`: status as a plain word (Planned, Running, Done, Abandoned) ` · ` date at the data's precision ` · ` its tags as plain words (one each of stage, who ran it, checking), then `Code` as a new-tab link styled as rule 19 when it has one. Never a pill, badge, icon or colour.
48. On a project's page, `Experiments` (`--fs-h2` serif, with its count) comes after the summary and before Reading, one row per experiment in the data's order: title (a link to its page once it has `href`, plain text before), the metadata line, then its summary. Omitted when the project has none.
49. `home.html` is the first tab, Home, and the site name in the header links to it. Order: page title, lede, one count line in `--fs-meta` `--ink-3` (`N experiments running · M done and unreviewed`, or a plain sentence saying none are running), then one group per project that has an experiment running, or done and still tagged `unreviewed`; projects with something running first, then the data's order. A group is the project's title (`--fs-h2` serif, a link to its page), a metadata line with its program as a link, then its experiments as rows. When the program has a mark, it sits in a left column beside the whole group, `--mark-size-home` (`--mark-size-home-sm` below 600px), as rule 34's row mark.
50. On Home an experiment's row shows, in its summary's place, how far it has got: `About N% done · updated <date>` in the metadata style, then the `now` sentence in `--fs-body` `--ink`. A running experiment with no progress reads "No progress published yet." No progress bar, meter or colour (house rule H3).
51. An experiment's own page, `experiments/<slug>.html`, is copied from `experiments/template.html`: kicker `Research programs · <program> · <project>` (three links, rule 38's style), the title, the metadata line, then, when it has progress, the progress block (rule 50's line and sentence between two `--hairline`s, `--col-text` wide), then the contents list (rule 29), then the hand-written sections.
52. Its sections, as `h2`, in order: In short; What we do; Competing explanations; What we expect; What would make us distrust a result; Results. Prose as rule 26. They are written before the experiment runs, and predictions are not edited once results exist.
53. An experiment leaves Home when its checking tag becomes `reviewed`, or when it is planned or abandoned. Only the person who owns the project changes a tag to `reviewed`.
54. Nothing else on Home (summaries of projects, art, totals, charts) unless it is asked for.

## A project's detail pages

55. A project with `details` in `programs.js` shows them on its page as borderless tiles, after the summary and before Experiments and Reading, `--s-6` above: two across, one on a phone, `--s-5` / `--s-6` apart. A tile is its title in `--serif` `--fs-h2` weight 400 followed by ` ↗` in `--ink-3`, then its blurb in `--sans` `--fs-body` `--ink-2`; the whole tile is one link, with the title's 1px `--rule` underline on hover. No border, box, background, image or colour.
56. A tile opens its page in a new tab, at the author's request (a departure from house rule H12, which keeps the app's own pages in the same tab); the ↗ says so. The page is `detail.html?p=<project>&d=<detail>`: header with Research programs active, kicker `Research programs · <program> · <project>` (rule 38), the title as `h1`, the blurb as the lede, then its content, or "Not written yet." in `--fs-meta` `--ink-3` while it has none.
57. A detail with a `dataset` shows how its questions are built as prose (rule 40), the sets as one hairline table (Set, Questions, What it holds; counts right-aligned in tabular figures) and one `--fs-meta` sans line naming the source as a new-tab link; then a `Practice questions` section (`--fs-h2` serif) holding the viewer.
58. The viewer loads the public question file live from `practice.file` and never keeps a copy in the repository; if it cannot, it says so in one `--fs-meta` `--ink-3` line with a link to `practice.page`. It opens with one metadata line counting the questions by kind, computed from the file.
59. Below that, on one line as rule 13: a filter by kind at the left (All, then each kind in the file's order, as rule 22) and `N of M` at the right (`N of M · T in all` while a kind is chosen).
60. One question at a time: a metadata line (kind · id), the prompt in `--serif` `--fs-prose`, then the model input in `--mono` `--fs-code` behind a 2px `--rule` line, its chat-format tokens in `--ink-3`. The token the lens reads at is the one thing marked: `--highlight-wash` behind it, `--highlight-ink` text, a 2px `--highlight` underline (look here).
61. The options the judge is shown follow as plain words in `--ink-2`, one line, `--s-5` apart. "Show the intermediate" is a bordered button in `--interact` (`--interact-wash` behind it when pressed). Revealed, the intermediate is `--ink` weight 500 with a leading ✓ and the other options turn `--ink-3`; one sentence beside the button says whether it is also the answer. The judge's task line follows in the metadata style. Moving to another question hides the intermediate again.
62. Previous and Next are text buttons between two `--hairline`s, styled as kicker links (rule 38), `--ink-3` and not underlined when there is nowhere to go; the left and right arrow keys do the same. A last metadata line names the source with a link. No progress bar, score, timer or colour beyond rules 60 and 61.

63. A project's `links` are listed last on its page, after Reading, under `Useful links` (`--fs-h2` serif, with its count). Each is a Readings row (rules 16–21): the title is a link that opens in a new tab (H12) and ends with ` ↗` in `--ink-3` `--fs-meta` sans; the metadata line is who made it ` · ` the bare host; the summary is one sentence on what it is and why it helps. Only things outside the site, never papers (those go in Readings).

64. An experiment whose result is what a lens read on the practice questions shows it in its Results as a readout grid (proposed): prose first, saying what the run found and that it is unreviewed while it is, then `<div class="rg">` written into the page, which `readouts.js` fills. The experiment is listed under Experiments like any other (rule 48); a readout is never a detail tile.
65. The grid's readouts are a JSON file in `data/` that the project's own code exported; it holds question ids, tokens and ranks, never question text. The questions, options and intermediates load live from `questions.file` as in rule 58 and are joined on the id. If the readouts are missing it reads "The readouts are not published yet."; the repository ignores `data/`, so a result file is added on purpose once its run is reviewed
66. It keeps the practice viewer's frame: one metadata line naming the lens, the model, the number of questions and visits and the date of the run; the filter by kind and `N of M` (rule 59); one question at a time with its metadata line and prompt (rule 60); Previous, Next and the arrow keys (rule 62). The options follow as in rule 61 with the intermediate already marked, since the page is about where it is found; then one sentence in `--fs-body` `--ink` counting the visits at which it is in the top tokens.
67. Below that, one hairline table with a row per layer visit: Visit, Layer, Rank of the intermediate (right-aligned, tabular figures; `--ink` weight 500 when it is within the tokens shown, else `--ink-2`), and the top tokens best first in `--mono` `--fs-code`, a space drawn as `␣` and a line break as `↵`. A row in `--ink-2` with no rule of its own opens each stretch of visits (the layers before the loop, each run of the loop, the layers after).
68. A token that is the intermediate is marked as the read token is in rule 60 (look here). No heat map, shading by rank, colour for wrong options, or chart; a second lens gets its own detail until a comparison is asked for.
69. The grid's first line (the filter, then Previous, the question's id and `N of M`, Next) stays at the top of the window while the table scrolls, on `--bg`, so the next question is in reach from any row and opens at the same rows. The Previous and Next at the foot stay as in rule 62.
70. The looped layers are the one coloured thing in the table besides rule 68's mark: a 3px bar in `--cat-3` down the left of every row of a run of the loop, and a small `--cat-3` square before each run's heading, which is `--ink` weight 500. The colour means "a run of the loop" and nothing else; the layers before and after the loop have no bar. Asked for by the author on 24 Nov 2026.
71. A token that is not English may carry an English gloss, from the grid's `data-glosses` file: a dotted `--ink-3` underline, and the gloss as the token's `title` on hover ("Language: meaning"). Glosses are written by an AI model and the foot line says so; a token with no clear meaning gets none.
72. A detail's `dataset` may hold a `bank`: a question bank published elsewhere, shown under `Questions` (`--fs-h2` serif). One line of text buttons (rule 22's style) picks a file of the bank; below it the practice viewer (rules 59-62) shows that file's questions, drawn by `bank.js`, which loads each file live from where it is published and never keeps a copy. A question with no model input shows none; the foot line names the host and the date the files are pinned to. A kind with fewer than three questions is counted under Other. What the page proposes is said in its prose and marked "Proposed" in the table's notes, never with a tag or colour.

## Motion and focus

30. Motion is `--dur` with `--ease`. Nothing animates on load.
31. Focus rings are `--interact-wash` at 3px with a 1px `--interact` edge, never removed.

## Before you ship a change

- [ ] No raw colour or size values; every one is a token.
- [ ] No feature was added that the page does not need.
- [ ] Reads correctly at 375px and in dark mode, with no sideways scroll.
- [ ] At most one image on a page (the Readings masthead, or a program's mark in its row or beside its title), with alt text, nothing over it.
- [ ] The count equals the objects in `resources.js`; section counts add up to it.
- [ ] Every paper has a `papers/<slug>.html`.
- [ ] On Research programs, the count equals the programs in `programs.js`, the list shows no projects, and each program page's count equals its projects.
- [ ] A project's Reading rows are the same rows the Readings tab shows; every url in `resources` matches an entry in `resources.js`.
- [ ] Tabs: active tab underlined in ink, not coloured. Headings not bold.
- [ ] Home lists exactly the experiments that are running, or done and tagged unreviewed; its count line matches; no progress bar anywhere.
- [ ] Every experiment with an `href` has its page, and the page's `data-href` matches.
- [ ] Every detail tile opens its page in a new tab, and every detail page has a kicker back to its project. A practice viewer loads its questions live, filters by kind, reveals and hides the intermediate, and moves with the buttons and the arrow keys; the questions are not copied into the repository.
- [ ] A readout grid sits in an experiment's Results; its file in `data/` holds no question text; only the intermediate is marked.
