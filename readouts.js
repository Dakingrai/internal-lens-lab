/* The readout grid in an experiment's Results (design rules 64-71, 73). The page holds
   <div class="rg" data-file data-questions data-page data-label>, which this mounts on load. With data-shape the
   questions are a file of a question bank (bank.js puts them into shape; load it first) and data-host names where
   it is published. A <div class="rg-sets" data-sets='[{name, file, questions, shape}]'> with the same other
   attributes shows several result files in one grid, a line of text buttons choosing between them. data-file is a
   JSON file in data/ that the project's own code exported: for each question id, what one lens read at every layer
   visit (its top tokens, best first, and the rank of the intermediate). It holds no question text; the questions,
   options and intermediates are loaded live from data-questions, the public JSONL (never a copy in the repo), and
   joined on the id. One question at a time, as the practice viewer: a filter by kind, the prompt, the options with
   the intermediate marked, one sentence saying where the lens finds it, then one row per layer visit.
   Load it at the end of the page, after the grid's element. */
(function () {
  var KIND_NAMES = { arith: 'Arithmetic', dayafter: 'Day after', daybefore: 'Day before', monthafter: 'Month after' };
  var RUN_NAMES = ['first', 'second', 'third', 'fourth', 'fifth'];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function link(text, href) {
    var a = el('a', null, text);
    a.href = href; a.target = '_blank'; a.rel = 'noopener';
    return a;
  }
  function kindOf(q) { return (q.groups && q.groups.kind) || q.family || 'other'; }
  function kindName(k) { return KIND_NAMES[k] || (k.charAt(0).toUpperCase() + k.slice(1)); }
  function day(d) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || ''); return m ? (+m[3]) + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m[2] - 1] + ' ' + m[1] : (d || ''); }
  function num(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  // a token as text a reader can see: a leading space and a line break are drawn, not left blank
  function shown(tok) { return tok.replace(/ /g, '␣').replace(/\n/g, '↵').replace(/\t/g, '⇥'); }
  // exact matching, as a local run scores: the token is the word itself, in any case
  function names(tok, word) { return tok.trim().toLowerCase() === String(word).trim().toLowerCase(); }
  // the intermediate, or one of the other forms of it a question lists
  function namesAny(tok, q) { return (q.forms || [q.intermediate]).some(function (w) { return names(tok, w); }); }
  // the grid the arrow keys move: the last one the reader pointed at or pressed in (the first on the page until then)
  var active = null;

  function mount(box) {
    var file = box.getAttribute('data-file'), qfile = box.getAttribute('data-questions');
    var page = box.getAttribute('data-page'), label = box.getAttribute('data-label');
    var gfile = box.getAttribute('data-glosses');
    var shape = box.getAttribute('data-shape'), host = box.getAttribute('data-host') || 'Hugging Face';
    box.textContent = '';
    box.appendChild(el('p', 'count', 'Loading the readouts…'));
    Promise.all([
      // a host that answers a missing file with its home page gives text that is not JSON: that too is "not published"
      fetch(file).then(function (r) { if (!r.ok) throw new Error('readouts'); return r.text(); }).then(function (t) { try { return JSON.parse(t); } catch (e) { throw new Error('readouts'); } }),
      fetch(qfile).then(function (r) { if (!r.ok) throw new Error('questions'); return r.text(); }),
      // English glosses for the non-English tokens: optional, and the grid is whole without them
      gfile ? fetch(gfile).then(function (r) { return r.json(); }).then(function (g) { return g.glosses || {}; }).catch(function () { return {}; }) : {}
    ]).then(function (got) {
      var byId = {};
      if (shape) window.BankViewer.normalise(JSON.parse(got[1]).items, shape).forEach(function (q) { byId[q.id] = q; });
      else got[1].split('\n').forEach(function (l) { if (l.trim()) { var q = JSON.parse(l); byId[q.id] = q; } });
      var rows = got[0].questions.filter(function (r) { return byId[r.id]; }).map(function (r) { return { q: byId[r.id], readouts: r.readouts, readToken: r.read_token }; });
      if (!rows.length) throw new Error('questions');
      render(box, got[0], rows, page, label, got[2], host);
    }).catch(function (e) {
      box.textContent = '';
      if (e && e.message === 'readouts') { box.appendChild(el('p', 'count', 'The readouts are not published yet.')); return; }
      var p = el('p', 'count', 'The questions could not be loaded from ' + host + '. ');
      p.appendChild(link('Open the dataset', page));
      box.appendChild(p);
    });
  }

  // "layers 6 to 17, second run": the label of the stretch of visits a visit opens, or null inside a stretch
  function stretch(data, i) {
    var lp = data.loop;
    function key(v) { return v.layer < lp.start ? 'before' : v.layer < lp.end ? 'run' + v.run : 'after'; }
    var v = data.visits[i], k = key(v);
    if (i > 0 && key(data.visits[i - 1]) === k) return null;
    if (k === 'before') return 'Layers 0 to ' + (lp.start - 1) + ', run once';
    if (k === 'after') return 'Layers ' + lp.end + ' to ' + data.visits[data.visits.length - 1].layer + ', run once';
    return 'Layers ' + lp.start + ' to ' + (lp.end - 1) + ', ' + (RUN_NAMES[v.run] || ('run ' + (v.run + 1))) + ' run';
  }

  function render(box, data, all, page, label, glosses, host) {
    var hasGloss = Object.keys(glosses).length > 0;
    box.textContent = '';
    var kinds = [];
    all.forEach(function (r) { if (kinds.indexOf(kindOf(r.q)) === -1) kinds.push(kindOf(r.q)); });
    var top = data.top || 10;

    box.appendChild(el('p', 'meta rg-comp', 'The ' + data.lens + ' on ' + data.model.split('/').pop().replace(/-/g, ' ') +
      (data.read ? ', on ' + all.length + ' questions put to the model ' + data.read : ', read at the last token of ' + all.length + ' practice questions') +
      ', at each of ' + data.visits.length + ' layer visits. Run ' + day(data.generated) + '.'));

    var line = el('div', 'countline pv-line rg-top');
    var bar = el('div', 'filter');
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Filter the questions by kind');
    var count = el('p', 'count');
    // Previous and Next sit beside the count, and the line stays at the top of the window while the table scrolls,
    // so the next question is always in reach and opens at the same rows
    var step = el('div', 'rg-step');
    var prevT = el('button', null, '← Previous'), nextT = el('button', null, 'Next →');
    prevT.type = nextT.type = 'button';
    step.appendChild(prevT); step.appendChild(count); step.appendChild(nextT);
    line.appendChild(bar); line.appendChild(step);
    box.appendChild(line);

    var item = el('div', 'pv-item rg-item');
    box.appendChild(item);

    var nav = el('div', 'pv-nav');
    var prev = el('button', null, '← Previous'), next = el('button', null, 'Next →');
    prev.type = next.type = 'button';
    nav.appendChild(prev); nav.appendChild(next);
    box.appendChild(nav);

    var src = el('p', 'meta pv-src', 'Questions loaded live from ');
    src.appendChild(link(label, page));
    var listed = all.some(function (r) { return r.q.forms && r.q.forms.length > 1; });
    src.appendChild(document.createTextNode(' on ' + host + '. A token counts as the intermediate when it is that word' +
      (listed ? ', or another form of it the bank lists,' : '') + ' exactly, in any case; ' +
      'the leaderboard’s judge also accepts inflections and translations. ␣ is a space and ↵ a line break. ' +
      'The bar at the left marks the looped layers, ' + data.loop.start + ' to ' + (data.loop.end - 1) + ', one stretch for each run of the loop. ' +
      (hasGloss ? 'A token with a dotted underline is not English: hover over it for a gloss, written by an AI model and not checked by a speaker. ' : '') +
      'The arrow keys move between questions.'));
    box.appendChild(src);

    var state = { kind: 'all', i: 0 };
    function list() { return state.kind === 'all' ? all : all.filter(function (r) { return kindOf(r.q) === state.kind; }); }

    ['all'].concat(kinds).forEach(function (k) {
      var b = el('button', null, k === 'all' ? 'All' : kindName(k));
      b.type = 'button';
      b.setAttribute('aria-pressed', k === 'all' ? 'true' : 'false');
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(bar.children, function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        state.kind = k; state.i = 0;
        draw();
      });
      bar.appendChild(b);
    });

    // one sentence on where this lens finds the intermediate, counted from the rows below
    function verdict(r) {
      if (r.readouts[0].rank == null) return 'No single token of the model writes “' + r.q.intermediate + '”' +
        ((r.q.forms || []).length > 1 ? ' or a listed form of it' : '') + ', so it has no rank and nothing below is marked.';
      var inTop = r.readouts.filter(function (x) { return x.rank <= top; });
      var first = r.readouts.filter(function (x) { return x.rank === 1; });
      var word = '“' + r.q.intermediate + '”';
      if (!inTop.length) {
        var best = r.readouts.reduce(function (a, b) { return b.rank < a.rank ? b : a; });
        return word + ' is in the top ' + top + ' at none of the ' + r.readouts.length + ' visits. Its best rank is ' + num(best.rank) + ', at visit ' + best.visit + '.';
      }
      return word + ' is in the top ' + top + ' at ' + inTop.length + ' of the ' + r.readouts.length + ' visits, first at visit ' + inTop[0].visit +
        (first.length ? ', and is the top token at ' + first.length + '.' : ', and is never the top token.');
    }

    function draw() {
      var rs = list(), r = rs[state.i], q = r.q;
      count.textContent = q.id + ' · ' + (state.i + 1) + ' of ' + rs.length + (rs.length !== all.length ? ' · ' + all.length + ' in all' : '');
      prev.disabled = prevT.disabled = state.i === 0;
      next.disabled = nextT.disabled = state.i === rs.length - 1;
      item.textContent = '';
      item.appendChild(el('p', 'meta', kindName(kindOf(q)) + ' · ' + q.id));
      item.appendChild(el('p', 'pv-prompt', q.prompt));
      if (r.readToken) {
        var rt = el('p', 'pv-k', 'Read at the token ');
        rt.appendChild(el('span', 'rg-readtok', shown(r.readToken)));
        item.appendChild(rt);
      }

      item.appendChild(el('p', 'pv-k', 'The options the judge is shown, the intermediate marked'));
      var opts = el('ul', 'pv-options shown');
      (q.options || []).forEach(function (o) {
        var li = el('li', o === q.intermediate ? 'is-answer' : null, o);
        if (o === q.intermediate) li.setAttribute('aria-label', o + ', the intermediate');
        opts.appendChild(li);
      });
      item.appendChild(opts);
      item.appendChild(el('p', 'rg-verdict', verdict(r)));

      var tbl = el('table', 'tbl rg-tbl');
      var head = el('tr');
      [['Visit', 'num'], ['Layer', 'num'], ['Rank of the intermediate', 'num'], ['Top ' + top + ' tokens, best first', null]].forEach(function (h) {
        var th = el('th', h[1], h[0]); th.scope = 'col'; head.appendChild(th);
      });
      var thead = el('thead'); thead.appendChild(head); tbl.appendChild(thead);
      var tbody = el('tbody');
      r.readouts.forEach(function (x, i) {
        var s = stretch(data, i);
        var looped = data.visits[i].layer >= data.loop.start && data.visits[i].layer < data.loop.end;
        if (s) {
          var sr = el('tr', 'rg-stretch' + (looped ? ' rg-run' : '')), th = el('th', null, s);
          th.colSpan = 4; th.scope = 'colgroup';
          sr.appendChild(th); tbody.appendChild(sr);
        }
        var tr = el('tr', looped ? 'rg-loop' : null);
        tr.appendChild(el('td', 'num', String(x.visit)));
        tr.appendChild(el('td', 'num', String(data.visits[i].layer)));
        tr.appendChild(el('td', 'num' + (x.rank != null && x.rank <= top ? ' rg-in' : ''), x.rank == null ? '–' : num(x.rank)));
        var td = el('td', 'rg-toks');
        x.tokens.forEach(function (t) {
          var hit = namesAny(t, q);
          var sp = el(hit ? 'mark' : 'span', hit ? 'pv-read' : null, shown(t));
          var gloss = glosses[t.trim()];
          if (gloss) { sp.title = gloss; sp.classList.add('rg-gloss'); }
          td.appendChild(sp);
          td.appendChild(document.createTextNode(' '));
        });
        tr.appendChild(td);
        tbody.appendChild(tr);
      });
      tbl.appendChild(tbody);
      var scroll = el('div', 'rg-scroll');
      scroll.appendChild(tbl);
      item.appendChild(scroll);
    }

    function go(by) { var i = state.i + by; if (i >= 0 && i < list().length) { state.i = i; draw(); } }
    [prev, prevT].forEach(function (b) { b.addEventListener('click', function () { go(-1); }); });
    [next, nextT].forEach(function (b) { b.addEventListener('click', function () { go(1); }); });
    // one grid answers the arrow keys at a time, and a grid drawn again (another file) replaces its own listener
    if (box._rgKeys) document.removeEventListener('keydown', box._rgKeys);
    box._rgKeys = function (e) {
      if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
      if ((active || document.querySelector('.rg')) !== box) return;
      if (e.key === 'ArrowLeft') prev.click();
      else if (e.key === 'ArrowRight') next.click();
    };
    document.addEventListener('keydown', box._rgKeys);
    if (!box._rgPoint) {
      box._rgPoint = true;
      ['pointerenter', 'pointerdown', 'focusin'].forEach(function (ev) { box.addEventListener(ev, function () { active = box; }); });
    }
    draw();
  }

  // several result files in one grid: a line of text buttons picks the file, and the grid below is drawn again
  function mountSets(wrap) {
    var sets = JSON.parse(wrap.getAttribute('data-sets'));
    var bar = el('div', 'filter bank-files');
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Choose a set of questions');
    var box = el('div', 'rg');
    ['data-glosses', 'data-page', 'data-label', 'data-host'].forEach(function (a) { if (wrap.hasAttribute(a)) box.setAttribute(a, wrap.getAttribute(a)); });
    wrap.appendChild(bar); wrap.appendChild(box);
    sets.forEach(function (st, i) {
      var b = el('button', null, st.name);
      b.type = 'button';
      b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(bar.children, function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        show(st);
      });
      bar.appendChild(b);
    });
    function show(st) {
      box.setAttribute('data-file', st.file);
      box.setAttribute('data-questions', st.questions);
      if (st.shape) box.setAttribute('data-shape', st.shape); else box.removeAttribute('data-shape');
      mount(box);
    }
    show(sets[0]);
  }

  window.ReadoutGrid = { mount: mount };
  // a grid written into a page by hand (an experiment's Results) mounts itself; one made by a script is mounted by it
  Array.prototype.forEach.call(document.querySelectorAll('.rg[data-file]'), mount);
  Array.prototype.forEach.call(document.querySelectorAll('.rg-sets[data-sets]'), mountSets);
})();
