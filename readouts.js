/* The readout grid on a project's detail page (design rules 64-68). app.js makes a
   <div class="rg" data-file data-questions data-page data-label> and calls ReadoutGrid.mount on it. data-file is a
   JSON file in data/ that the project's own code exported: for each question id, what one lens read at every layer
   visit (its top tokens, best first, and the rank of the intermediate). It holds no question text; the questions,
   options and intermediates are loaded live from data-questions, the public JSONL (never a copy in the repo), and
   joined on the id. One question at a time, as the practice viewer: a filter by kind, the prompt, the options with
   the intermediate marked, one sentence saying where the lens finds it, then one row per layer visit.
   Load it before app.js. */
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

  function mount(box) {
    var file = box.getAttribute('data-file'), qfile = box.getAttribute('data-questions');
    var page = box.getAttribute('data-page'), label = box.getAttribute('data-label');
    box.appendChild(el('p', 'count', 'Loading the readouts…'));
    Promise.all([
      // a host that answers a missing file with its home page gives text that is not JSON: that too is "not published"
      fetch(file).then(function (r) { if (!r.ok) throw new Error('readouts'); return r.text(); }).then(function (t) { try { return JSON.parse(t); } catch (e) { throw new Error('readouts'); } }),
      fetch(qfile).then(function (r) { if (!r.ok) throw new Error('questions'); return r.text(); })
    ]).then(function (got) {
      var byId = {};
      got[1].split('\n').forEach(function (l) { if (l.trim()) { var q = JSON.parse(l); byId[q.id] = q; } });
      var rows = got[0].questions.filter(function (r) { return byId[r.id]; }).map(function (r) { return { q: byId[r.id], readouts: r.readouts }; });
      if (!rows.length) throw new Error('questions');
      render(box, got[0], rows, page, label);
    }).catch(function (e) {
      box.textContent = '';
      if (e && e.message === 'readouts') { box.appendChild(el('p', 'count', 'The readouts are not published yet.')); return; }
      var p = el('p', 'count', 'The practice questions could not be loaded from Hugging Face. ');
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

  function render(box, data, all, page, label) {
    box.textContent = '';
    var kinds = [];
    all.forEach(function (r) { if (kinds.indexOf(kindOf(r.q)) === -1) kinds.push(kindOf(r.q)); });
    var top = data.top || 10;

    box.appendChild(el('p', 'meta rg-comp', 'The ' + data.lens + ' on ' + data.model.split('/').pop().replace(/-/g, ' ') +
      ', read at the last token of ' + all.length + ' practice questions, at each of ' + data.visits.length +
      ' layer visits. Run ' + day(data.generated) + '.'));

    var line = el('div', 'countline pv-line');
    var bar = el('div', 'filter');
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Filter practice questions by kind');
    var count = el('p', 'count');
    line.appendChild(bar); line.appendChild(count);
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
    src.appendChild(document.createTextNode(' on Hugging Face. A token counts as the intermediate when it is that word exactly, in any case; ' +
      'the leaderboard’s judge also accepts inflections and translations. ␣ is a space and ↵ a line break. The arrow keys move between questions.'));
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
      count.textContent = (state.i + 1) + ' of ' + rs.length + (rs.length !== all.length ? ' · ' + all.length + ' in all' : '');
      prev.disabled = state.i === 0;
      next.disabled = state.i === rs.length - 1;
      item.textContent = '';
      item.appendChild(el('p', 'meta', kindName(kindOf(q)) + ' · ' + q.id));
      item.appendChild(el('p', 'pv-prompt', q.prompt));

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
        if (s) {
          var sr = el('tr', 'rg-stretch'), th = el('th', null, s);
          th.colSpan = 4; th.scope = 'colgroup';
          sr.appendChild(th); tbody.appendChild(sr);
        }
        var tr = el('tr');
        tr.appendChild(el('td', 'num', String(x.visit)));
        tr.appendChild(el('td', 'num', String(data.visits[i].layer)));
        tr.appendChild(el('td', 'num' + (x.rank <= top ? ' rg-in' : ''), num(x.rank)));
        var td = el('td', 'rg-toks');
        x.tokens.forEach(function (t) {
          var hit = names(t, q.intermediate);
          var sp = el(hit ? 'mark' : 'span', hit ? 'pv-read' : null, shown(t));
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

    prev.addEventListener('click', function () { if (state.i > 0) { state.i--; draw(); } });
    next.addEventListener('click', function () { if (state.i < list().length - 1) { state.i++; draw(); } });
    document.addEventListener('keydown', function (e) {
      if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
      if (e.key === 'ArrowLeft') prev.click();
      else if (e.key === 'ArrowRight') next.click();
    });
    draw();
  }

  window.ReadoutGrid = { mount: mount };
})();
