/* Renders whichever page this is: the Readings tab (#groups) and a paper's notes page (#paper, papers/<slug>.html)
   from resources.js; the Research programs tab (#programs), a program's page (#program, program.html?p=<slug>) and a
   project's page (#project, project.html?p=<slug>), the Home tab (#home: experiments running or awaiting review) and an
   experiment's own page (#experiment, experiments/<slug>.html) and a project's detail page (#detail,
   detail.html?p=<project>&d=<detail>) from programs.js. Readings: grouped by section in order of first use, rows in file order. The tab has one
   control, a filter by reading status (#filter); no sorting or other controls. Every page also gets the footer. */
(function () {
  // the footer (rule 45): what this is, and where its source lives. A fork changes REPO to its own.
  var ABOUT = 'A workspace for reading and research on methods that put a model\u2019s internal features into words.';
  var ABOUT_MORE = 'It ships with the resources for the Looped Lens Challenge; fork it to manage your own projects.';
  var REPO = 'https://github.com/Dakingrai/internal-lens-lab';

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }

  // YYYY-MM-DD, YYYY-MM or YYYY -> "27 May 2025", "Oct 2026", "2026"
  function fmtDate(s) {
    var p = String(s || '').split('-');
    if (p.length === 3) return Number(p[2]) + ' ' + MONTHS[Number(p[1]) - 1] + ' ' + p[0];
    if (p.length === 2) return MONTHS[Number(p[1]) - 1] + ' ' + p[0];
    return p[0];
  }

  function capitalise(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

  // first author et al. beyond three; one to three in full
  function fmtAuthors(a) {
    if (!a || !a.length) return '';
    return a.length > 3 ? a[0] + ' et al.' : a.join(', ');
  }

  // where it is published: the venue when the data gives one, else "arXiv <id>" or the bare host
  function fmtSource(r) {
    if (r.venue) return r.venue;
    var m = /arxiv\.org\/(?:abs|pdf)\/([^?#]+?)(?:v\d+)?(?:\.pdf)?(?:[?#].*)?$/.exec(r.url);
    if (m) return 'arXiv ' + m[1];
    try { return new URL(r.url).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
  }

  function newTabLink(text, href) {
    var a = el('a', null, text);
    a.href = href;
    a.target = '_blank';   // leaves the app, so a new tab
    a.rel = 'noopener';
    return a;
  }

  // the metadata line: authors · affiliation · source · date · PDF. The source links to the landing page,
  // since the title links to the notes page.
  function fillMeta(m, r, base) {
    var bits = [];
    var lead = [fmtAuthors(r.authors), r.affiliation].filter(Boolean);
    if (lead.length) bits.push(document.createTextNode(lead.join(' · ')));
    var src = fmtSource(r);
    if (src) bits.push(newTabLink(src, r.url));
    var date = fmtDate(r.published);
    if (date) bits.push(document.createTextNode(date));
    if (r.pdf) bits.push(newTabLink('PDF', r.pdf));
    bits.forEach(function (b, i) {
      if (i) m.appendChild(document.createTextNode(' · '));
      m.appendChild(b);
    });
    if (r.authors && r.authors.length) m.title = r.authors.join(', ');
  }

  function resourceRow(r) {
    var li = el('li');
    var t = el('div', 'r-title');
    var a = el('a', null, r.title);
    a.href = r.slug ? 'papers/' + encodeURIComponent(r.slug) + '.html' : r.url;
    t.appendChild(a);
    li.appendChild(t);
    var m = el('div', 'meta');
    fillMeta(m, r);
    li.appendChild(m);
    if (r.summary) li.appendChild(el('div', 'summary', r.summary));
    return li;
  }

  var FILTERS = ['all', 'reading', 'completed', 'unread'];

  // anything missing or unknown counts as unread
  function readStatus(r) {
    return r.status === 'reading' || r.status === 'completed' ? r.status : 'unread';
  }

  function renderFilter(bar, root) {
    FILTERS.forEach(function (f) {
      var b = el('button', null, capitalise(f));
      b.type = 'button';
      b.setAttribute('aria-pressed', f === 'all' ? 'true' : 'false');
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(bar.children, function (x) {
          x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
        });
        renderResources(root, f);
      });
      bar.appendChild(b);
    });
  }

  function renderResources(root, filter) {
    var all = window.RESOURCES || [];
    var shown = !filter || filter === 'all' ? all : all.filter(function (r) { return readStatus(r) === filter; });
    var order = [], groups = {};
    shown.forEach(function (r) {
      if (!groups[r.section]) { groups[r.section] = []; order.push(r.section); }
      groups[r.section].push(r);
    });

    document.getElementById('count').textContent = shown.length === all.length
      ? plural(all.length, 'reading')
      : shown.length + ' of ' + plural(all.length, 'reading');

    root.textContent = '';
    order.forEach(function (name) {
      var items = groups[name];
      var sec = el('section', 'group');
      var h = el('h2', null, name);
      h.appendChild(el('span', 'n', String(items.length)));
      sec.appendChild(h);
      var ul = el('ul', 'resources');
      items.forEach(function (r) { ul.appendChild(resourceRow(r)); });
      sec.appendChild(ul);
      root.appendChild(sec);
    });
  }

  // papers/<slug>.html: title, metadata line and summary come from resources.js; the notes are written by hand
  // in the page's #notes, which reads "No notes yet." while empty.
  function renderPaper(root) {
    var slug = root.getAttribute('data-slug'), all = window.RESOURCES || [], r = null;
    for (var i = 0; i < all.length; i++) if (all[i].slug === slug) r = all[i];
    if (!r) { document.getElementById('title').textContent = 'No such paper.'; return; }
    document.title = r.title + ' — Internal lens lab';
    document.getElementById('title').textContent = r.title;
    fillMeta(document.getElementById('meta'), r);
    document.getElementById('summary').textContent = r.summary || '';
    var notes = document.getElementById('notes');
    if (notes && !notes.children.length && !notes.textContent.trim()) {
      notes.className = 'count';
      notes.textContent = 'No notes yet.';
    }
  }

  /* ---- Research programs: the list, a program's page, a project's page (design rules 32-44) ---- */

  function resourceByUrl(url) {
    var all = window.RESOURCES || [];
    for (var i = 0; i < all.length; i++) if (all[i].url === url) return all[i];
    return null;
  }

  // ?p=<slug> names the program or project a page is about
  function slugParam() {
    var m = /[?&]p=([^&#]+)/.exec(location.search);
    return m ? decodeURIComponent(m[1]) : '';
  }

  function programBySlug(slug) {
    var all = window.PROGRAMS || [];
    for (var i = 0; i < all.length; i++) if (all[i].slug === slug) return all[i];
    return null;
  }

  // project slugs are unique across programs; returns {program, project}
  function projectBySlug(slug) {
    var all = window.PROGRAMS || [];
    for (var i = 0; i < all.length; i++) {
      var ps = all[i].projects || [];
      for (var j = 0; j < ps.length; j++) if (ps[j].slug === slug) return { program: all[i], project: ps[j] };
    }
    return null;
  }

  // status as a plain word, then the start date at the data's precision
  function statusLine(x) {
    return [capitalise(x.status), x.started ? 'started ' + fmtDate(x.started) : ''].filter(Boolean).join(' · ');
  }

  // a program's own page outside the app (a challenge's site), as its bare host at the end of the line (rule 34)
  function appendProgramLink(m, pg) {
    if (!pg.url) return;
    var host;
    try { host = new URL(pg.url).hostname.replace(/^www\./, ''); } catch (e) { return; }
    m.appendChild(document.createTextNode(' · '));
    m.appendChild(newTabLink(host, pg.url));
  }

  // a row in the Readings row style: title (a link), metadata, summary
  function linkRow(title, href, meta, summary) {
    var li = el('li');
    var t = el('div', 'r-title');
    var a = el('a', null, title);
    a.href = href;
    t.appendChild(a);
    li.appendChild(t);
    li.appendChild(el('div', 'meta', meta));
    if (summary) li.appendChild(el('div', 'summary', summary));
    return li;
  }

  // a program's mark: its own illustration, shown whole (rule 42). Decorative beside the program's name in a
  // list, so empty alt there; described on the program's own page.
  function markImg(pg, alt) {
    var img = el('img');
    img.src = pg.image;
    img.alt = alt;
    return img;
  }

  // the Research programs tab lists programs only; projects appear on a program's page (rules 33-34)
  function renderPrograms(root) {
    var all = window.PROGRAMS || [];
    document.getElementById('count').textContent = plural(all.length, 'program');
    var ul = el('ul', 'resources');
    all.forEach(function (pg) {
      var href = 'program.html?p=' + encodeURIComponent(pg.slug);
      var row = linkRow(pg.name, href, statusLine(pg), pg.aim);
      appendProgramLink(row.querySelector('.meta'), pg);
      if (!pg.image) { ul.appendChild(row); return; }
      // mark in the left column, the row's title, metadata and aim in the right
      var li = el('li', 'with-mark');
      var fig = el('a', 'mark');
      fig.href = href;
      fig.tabIndex = -1;   // the title is the link a keyboard reaches; the mark repeats it for the mouse
      fig.appendChild(markImg(pg, ''));
      var text = el('div', 'with-mark-text');
      while (row.firstChild) text.appendChild(row.firstChild);
      li.appendChild(fig);
      li.appendChild(text);
      ul.appendChild(li);
    });
    root.appendChild(ul);
  }

  function setKicker(pg) {
    var k = document.getElementById('kicker');
    k.textContent = '';
    var back = el('a', null, 'Research programs');
    back.href = 'programs.html';
    k.appendChild(back);
    if (!pg) return;
    k.appendChild(document.createTextNode(' · '));
    var up = el('a', null, pg.name);
    up.href = 'program.html?p=' + encodeURIComponent(pg.slug);
    k.appendChild(up);
  }

  // a program's page: kicker, then its mark in the left column beside the name, status line and aim, then its
  // projects as rows (rule 35)
  function renderProgram(root) {
    var pg = programBySlug(slugParam());
    if (!pg) { document.getElementById('count').textContent = 'No such program.'; return; }
    document.title = pg.name + ' — Internal lens lab';
    document.getElementById('title').textContent = pg.name;
    var m = document.getElementById('meta');
    m.textContent = statusLine(pg);
    appendProgramLink(m, pg);
    document.getElementById('lede').textContent = pg.aim || '';
    if (pg.image) {
      var fig = document.getElementById('mark');
      fig.appendChild(markImg(pg, pg.imageAlt || ''));
      fig.hidden = false;
    } else {
      document.getElementById('head').classList.remove('with-mark');   // no mark: one column
    }
    var ps = pg.projects || [];
    document.getElementById('count').textContent = plural(ps.length, 'project');
    var ul = el('ul', 'resources');
    ps.forEach(function (p) {
      ul.appendChild(linkRow(p.title, 'project.html?p=' + encodeURIComponent(p.slug), statusLine(p), p.question));
    });
    root.appendChild(ul);
  }

  // a project's page: kicker, title, status line, the question, the summary as prose, then Reading
  // The tiles on a project's page: one per detail page, title and one sentence, the whole tile a link that opens
  // the page in a new tab (rules 55-56). No border, box or background.
  function detailTiles(p) {
    var ul = el('ul', 'detail-tiles');
    p.details.forEach(function (d) {
      var li = el('li', 'detail-tile');
      var a = el('a');
      a.href = 'detail.html?p=' + encodeURIComponent(p.slug) + '&d=' + encodeURIComponent(d.slug);
      a.target = '_blank';
      a.rel = 'noopener';
      var t = el('span', 't', d.title);
      t.appendChild(el('span', 'arrow', ' \u2197'));
      a.appendChild(t);
      if (d.blurb) a.appendChild(el('span', 'd', d.blurb));
      li.appendChild(a);
      ul.appendChild(li);
    });
    return ul;
  }

  // a paragraph whose text may hold links written [text](address): a page of this site opens in place, any other
  // address in a new tab (H12). Prose links are ink with a faint underline (rule 27).
  function withLinks(text) {
    var p = el('p'), re = /\[([^\]]+)\]\(([^)\s]+)\)/g, last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) p.appendChild(document.createTextNode(text.slice(last, m.index)));
      if (/^https?:/.test(m[2])) p.appendChild(newTabLink(m[1], m[2]));
      else { var a = el('a', null, m[1]); a.href = m[2]; p.appendChild(a); }
      last = re.lastIndex;
    }
    if (last < text.length) p.appendChild(document.createTextNode(text.slice(last)));
    return p;
  }

  // A detail page's dataset: prose on how the questions are built, a hairline table of the sets and the source,
  // then the practice viewer (practice.js), which loads the public questions live and counts them by kind (rules 57-62).
  function datasetContent(ds) {
    var frag = el('div', 'dataset');
    var prose = el('div', 'prose');
    (ds.about || []).forEach(function (t) { prose.appendChild(withLinks(t)); });
    if (ds.sets && ds.sets.length) {
      var tbl = el('table', 'tbl');
      var head = el('tr');
      ['Set', 'Questions', 'What it holds'].forEach(function (t, i) { head.appendChild(el('th', i === 1 ? 'num' : null, t)); });
      var thead = el('thead'); thead.appendChild(head); tbl.appendChild(thead);
      var tbody = el('tbody');
      ds.sets.forEach(function (st) {
        var tr = el('tr');
        tr.appendChild(el('td', null, st.name));
        tr.appendChild(el('td', 'num', String(st.count).replace(/\B(?=(\d{3})+(?!\d))/g, ',')));
        tr.appendChild(el('td', null, st.note));
        tbody.appendChild(tr);
      });
      tbl.appendChild(tbody);
      prose.appendChild(tbl);
    }
    if (ds.source) {
      var src = el('p', 'meta dataset-src', 'From the ');
      src.appendChild(newTabLink(ds.source.label, ds.source.url));
      src.appendChild(document.createTextNode('.'));
      prose.appendChild(src);
    }
    frag.appendChild(prose);
    // a question bank published elsewhere, a file at a time (bank.js, rule 72)
    if (ds.bank) {
      var bsec = el('section', 'group');
      bsec.id = 'questions';
      bsec.appendChild(el('h2', null, 'Questions'));
      var bbox = el('div', 'bank');
      bsec.appendChild(bbox);
      frag.appendChild(bsec);
      if (window.BankViewer) window.BankViewer.mount(bbox, ds.bank);
    }
    if (ds.practice) {
      var sec = el('section', 'group');
      sec.id = 'practice';
      sec.appendChild(el('h2', null, 'Practice questions'));
      var box = el('div', 'pv');
      box.setAttribute('data-file', ds.practice.file);
      box.setAttribute('data-page', ds.practice.page);
      box.setAttribute('data-label', ds.practice.label);
      sec.appendChild(box);
      frag.appendChild(sec);
      if (window.PracticeViewer) window.PracticeViewer.mount(box);
    }
    return frag;
  }

  // a project's detail page (detail.html?p=<project>&d=<detail>): kicker back to the project, the title, its
  // blurb as the lede, then its content, or "Not written yet." while it has none
  function renderDetail(root) {
    var m = /[?&]d=([^&#]+)/.exec(location.search), dslug = m ? decodeURIComponent(m[1]) : '';
    var hit = projectBySlug(slugParam());
    var d = hit && (hit.project.details || []).filter(function (x) { return x.slug === dslug; })[0];
    if (!d) { root.appendChild(el('p', 'count', 'No such page.')); return; }
    var pg = hit.program, p = hit.project;
    document.title = d.title + ' — Internal lens lab';
    setKicker(pg);
    var k = document.getElementById('kicker');
    k.appendChild(document.createTextNode(' \u00b7 '));
    var up = el('a', null, p.title);
    up.href = 'project.html?p=' + encodeURIComponent(p.slug);
    k.appendChild(up);
    document.getElementById('title').textContent = d.title;
    document.getElementById('lede').textContent = d.blurb || '';
    if (d.dataset) root.appendChild(datasetContent(d.dataset));
    else root.appendChild(el('p', 'count', 'Not written yet.'));
  }

  function renderProject(root) {
    var hit = projectBySlug(slugParam());
    if (!hit) { root.appendChild(el('p', 'count', 'No such project.')); return; }
    var pg = hit.program, p = hit.project;
    document.title = p.title + ' — Internal lens lab';
    setKicker(pg);
    document.getElementById('title').textContent = p.title;
    document.getElementById('meta').textContent = statusLine(p);
    if (p.question) root.appendChild(el('p', 'question-page', p.question));
    if (p.summary) {
      var d = el('div', 'prose');
      d.appendChild(el('p', null, p.summary));
      root.appendChild(d);
    }
    // its detail pages as borderless tiles, each opening in a new tab (rules 55-56)
    if (p.details && p.details.length) root.appendChild(detailTiles(p));
    // experiments: one row each, in the data's order, above the reading list (rule 48)
    var exps = p.experiments || [];
    if (exps.length) {
      var es = el('section', 'group');
      var eh = el('h2', null, 'Experiments');
      eh.appendChild(el('span', 'n', String(exps.length)));
      es.appendChild(eh);
      var el2 = el('ul', 'resources');
      exps.forEach(function (x) { el2.appendChild(experimentRow(x, false)); });
      es.appendChild(el2);
      root.appendChild(es);
    }
    var papers = (p.resources || []).map(resourceByUrl).filter(Boolean);
    if (papers.length) {
      var sec = el('section', 'group');
      var h = el('h2', null, 'Reading');
      h.appendChild(el('span', 'n', String(papers.length)));
      sec.appendChild(h);
      var ul = el('ul', 'resources');
      papers.forEach(function (r) { ul.appendChild(resourceRow(r)); });
      sec.appendChild(ul);
      root.appendChild(sec);
    }
    // useful links, last: rows like a reading, each leaving the site in a new tab (rule 63)
    var links = p.links || [];
    if (links.length) {
      var ls = el('section', 'group');
      ls.id = 'links';
      var lh = el('h2', null, 'Useful links');
      lh.appendChild(el('span', 'n', String(links.length)));
      ls.appendChild(lh);
      var lu = el('ul', 'resources');
      links.forEach(function (x) {
        var li = el('li');
        var t = el('div', 'r-title');
        var a = newTabLink(x.title, x.url);
        a.appendChild(el('span', 'out', ' \u2197'));
        t.appendChild(a);
        li.appendChild(t);
        var host = '';
        try { host = new URL(x.url).hostname.replace(/^www\./, ''); } catch (e) {}
        li.appendChild(el('div', 'meta', [x.by, host].filter(Boolean).join(' \u00b7 ')));
        if (x.note) li.appendChild(el('div', 'summary', x.note));
        lu.appendChild(li);
      });
      ls.appendChild(lu);
      root.appendChild(ls);
    }
  }

  /* ---- Experiments: rows on a project's page, the Home tab, and an experiment's own page (rules 47-54) ---- */

  // every experiment with its project and program, in the order of programs.js
  function allExperiments() {
    var out = [];
    (window.PROGRAMS || []).forEach(function (pg) {
      (pg.projects || []).forEach(function (p) {
        (p.experiments || []).forEach(function (x) { out.push({ program: pg, project: p, x: x }); });
      });
    });
    return out;
  }

  // status as a plain word, the date at the data's precision, then the tags as plain words (rule 47)
  function experimentMeta(m, x) {
    m.textContent = [capitalise(x.status), x.date ? fmtDate(x.date) : ''].concat(x.tags || []).filter(Boolean).join(' · ');
    if (x.code) {
      m.appendChild(document.createTextNode(' · '));
      m.appendChild(newTabLink('Code', x.code));
    }
  }

  // how far it has got: one meta line and one sentence, no bar (rule 50, house rule H3)
  function appendProgress(box, x) {
    var P = x.progress;
    if (P) {
      var pct = Math.max(0, Math.min(100, Math.round(P.percent || 0)));
      box.appendChild(el('p', 'meta prog-line', 'About ' + pct + '% done' + (P.updated ? ' · updated ' + fmtDate(P.updated) : '')));
      if (P.now) box.appendChild(el('p', 'prog-now', P.now));
    } else if (x.status === 'running') {
      box.appendChild(el('p', 'meta prog-line', 'No progress published yet.'));
    }
  }

  // an experiment row: title (a link once it has a page), metadata line, then its summary, or on Home its progress
  function experimentRow(x, onHome) {
    var li = el('li');
    var t = el('div', 'r-title');
    if (x.href) { var a = el('a', null, x.title); a.href = x.href; t.appendChild(a); } else t.textContent = x.title;
    li.appendChild(t);
    var m = el('div', 'meta');
    experimentMeta(m, x);
    li.appendChild(m);
    if (onHome) appendProgress(li, x);
    else if (x.summary) li.appendChild(el('div', 'summary', x.summary));
    return li;
  }

  function isWaiting(x) { return x.status === 'done' && (x.tags || []).indexOf('unreviewed') !== -1; }

  // Home: the experiments running now, then those done and not yet reviewed, grouped by project; projects with
  // something running first. A project's group shows its program's mark in a left column (rule 49).
  function renderHome(root) {
    var groups = [], byProject = {}, nRunning = 0, nWaiting = 0;
    allExperiments().forEach(function (e) {
      var run = e.x.status === 'running', wait = isWaiting(e.x);
      if (!run && !wait) return;
      if (run) nRunning++; else nWaiting++;
      var g = byProject[e.project.slug];
      if (!g) { g = byProject[e.project.slug] = { program: e.program, project: e.project, running: [], waiting: [] }; groups.push(g); }
      (run ? g.running : g.waiting).push(e.x);
    });
    groups = groups.filter(function (g) { return g.running.length; }).concat(groups.filter(function (g) { return !g.running.length; }));
    var count = plural(nRunning, 'experiment') + ' running';
    if (nWaiting) count += ' · ' + nWaiting + ' done and unreviewed';
    if (!nRunning && !nWaiting) count = 'No experiments running. Add one to a project in programs.js, with status running.';
    document.getElementById('count').textContent = count;
    groups.forEach(function (g) {
      var sec = el('section', 'home-group');
      var text = el('div', 'with-mark-text');
      var h = el('h2'), a = el('a', null, g.project.title);
      a.href = 'project.html?p=' + encodeURIComponent(g.project.slug);
      h.appendChild(a);
      text.appendChild(h);
      var m = el('div', 'meta'), up = el('a', null, g.program.name);
      up.href = 'program.html?p=' + encodeURIComponent(g.program.slug);
      m.appendChild(up);
      text.appendChild(m);
      var ul = el('ul', 'resources');
      g.running.concat(g.waiting).forEach(function (x) { ul.appendChild(experimentRow(x, true)); });
      text.appendChild(ul);
      if (g.program.image) {
        sec.classList.add('with-mark');
        var fig = el('a', 'mark');
        fig.href = a.href;
        fig.tabIndex = -1;
        fig.appendChild(markImg(g.program, ''));
        sec.appendChild(fig);
      }
      sec.appendChild(text);
      root.appendChild(sec);
    });
  }

  // an experiment's own page (experiments/<slug>.html): the kicker, title and metadata line come from programs.js,
  // matched by the page's data-href; the sections below are written by hand (rules 51-53)
  function renderExperiment(root) {
    var href = root.getAttribute('data-href'), hit = null;
    allExperiments().forEach(function (e) { if (e.x.href === href) hit = e; });
    if (!hit) return;   // not listed yet: the page keeps its hand-written title
    var k = document.getElementById('kicker');
    k.textContent = '';
    [['Research programs', '../programs.html'],
     [hit.program.name, '../program.html?p=' + encodeURIComponent(hit.program.slug)],
     [hit.project.title, '../project.html?p=' + encodeURIComponent(hit.project.slug)]].forEach(function (b, i) {
      if (i) k.appendChild(document.createTextNode(' · '));
      var a = el('a', null, b[0]); a.href = b[1]; k.appendChild(a);
    });
    document.title = hit.x.title + ' — Internal lens lab';
    document.getElementById('title').textContent = hit.x.title;
    experimentMeta(document.getElementById('meta'), hit.x);
    var box = document.getElementById('progress');
    if (box && (hit.x.progress || hit.x.status === 'running')) {
      appendProgress(box, hit.x);
      box.hidden = false;
    }
  }

  function renderFooter() {
    var wrap = document.querySelector('.wrap');
    if (!wrap) return;
    var home = document.querySelector('.site .name');
    var f = el('footer', 'foot');
    var inner = el('div', 'foot-in');
    var about = el('div', 'foot-about');
    var name = el('a', 'name', 'Internal lens lab');
    name.href = home ? home.getAttribute('href') : 'index.html';
    about.appendChild(name);
    about.appendChild(el('p', null, ABOUT + ' ' + ABOUT_MORE));
    inner.appendChild(about);
    // the link rows: the header's tabs, then the repository
    var nav = el('nav');
    nav.setAttribute('aria-label', 'Footer');
    var ul = el('ul', 'foot-links');
    function row(text, href, outside) {
      var li = el('li');
      var a = el('a', null, text);
      a.href = href;
      if (outside) { a.target = '_blank'; a.rel = 'noopener'; }
      var arrow = el('span', 'arrow', outside ? '\u2197' : '\u2192');
      arrow.setAttribute('aria-hidden', 'true');
      a.appendChild(arrow);
      li.appendChild(a);
      ul.appendChild(li);
    }
    Array.prototype.forEach.call(document.querySelectorAll('.site .tabs a'), function (t) {
      row(t.textContent, t.getAttribute('href'));
    });
    row('GitHub', REPO, true);
    nav.appendChild(ul);
    inner.appendChild(nav);
    f.appendChild(inner);
    wrap.parentNode.insertBefore(f, wrap.nextSibling);
  }

  var groups = document.getElementById('groups');
  var filter = document.getElementById('filter');
  if (groups && filter) renderFilter(filter, groups);
  if (groups) renderResources(groups);
  var paper = document.getElementById('paper');
  if (paper) renderPaper(paper);
  var programs = document.getElementById('programs');
  if (programs) renderPrograms(programs);
  var program = document.getElementById('program');
  if (program) renderProgram(program);
  var project = document.getElementById('project');
  if (project) renderProject(project);
  var home = document.getElementById('home');
  if (home) renderHome(home);
  var detail = document.getElementById('detail');
  if (detail) renderDetail(detail);
  var experiment = document.getElementById('experiment');
  if (experiment) renderExperiment(experiment);
  renderFooter();
})();
