/* The practice-question viewer on a project's detail page (design rules 58-62). app.js makes a
   <div class="pv" data-file data-page data-label> and calls PracticeViewer.mount on it; this loads the public JSONL
   live from data-file (never a copy in the repo) and shows one question at a time: a filter by kind with its count,
   the prompt, the exact model input with the token the lens reads at marked, the five options the judge is shown,
   and a control that reveals the intermediate. Previous and Next, or the arrow keys, move between questions.
   Load it before app.js. */
(function () {
  var KIND_NAMES = { arith: 'Arithmetic', dayafter: 'Day after', daybefore: 'Day before', monthafter: 'Month after' };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function kindOf(q) { return (q.groups && q.groups.kind) || q.family || 'other'; }
  function kindName(k) { return KIND_NAMES[k] || (k.charAt(0).toUpperCase() + k.slice(1)); }

  function link(text, href) {
    var a = el('a', null, text);
    a.href = href; a.target = '_blank'; a.rel = 'noopener';
    return a;
  }

  // the model input, with its chat-format tokens set apart and the token the lens reads at marked (look here)
  function modelInput(q) {
    var pre = el('pre', 'pv-input');
    var parts = String(q.model_input || '').split(/(<\|[a-z_]+\|>)/);
    var last = -1;
    parts.forEach(function (p, i) { if (p === q.read_token) last = i; });
    parts.forEach(function (p, i) {
      if (!p) return;
      if (i === last) { pre.appendChild(el('mark', 'pv-read', p)); return; }
      pre.appendChild(/^<\|[a-z_]+\|>$/.test(p) ? el('span', 'pv-special', p) : document.createTextNode(p));
    });
    return pre;
  }

  function mount(box) {
    var file = box.getAttribute('data-file'), page = box.getAttribute('data-page'), label = box.getAttribute('data-label');
    box.appendChild(el('p', 'count', 'Loading the practice questions…'));
    fetch(file).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.text();
    }).then(function (text) {
      var qs = text.split('\n').filter(function (l) { return l.trim(); }).map(function (l) { return JSON.parse(l); });
      render(box, qs, page, label);
    }).catch(function () {
      box.textContent = '';
      var p = el('p', 'count', 'The practice questions could not be loaded from Hugging Face. ');
      p.appendChild(link('Open the dataset', page));
      box.appendChild(p);
    });
  }

  function render(box, all, page, label) {
    box.textContent = '';
    var kinds = [];
    all.forEach(function (q) { if (kinds.indexOf(kindOf(q)) === -1) kinds.push(kindOf(q)); });

    // the composition of the practice set, counted from the file itself
    var comp = el('p', 'meta pv-comp', all.length + ' questions of ' + kinds.length + ' kinds: ' + kinds.map(function (k) {
      return kindName(k) + ' ' + all.filter(function (q) { return kindOf(q) === k; }).length;
    }).join(', ') + '.');
    box.appendChild(comp);

    var line = el('div', 'countline pv-line');
    var bar = el('div', 'filter');
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Filter practice questions by kind');
    var count = el('p', 'count');
    line.appendChild(bar);
    line.appendChild(count);
    box.appendChild(line);

    var item = el('div', 'pv-item');
    item.setAttribute('aria-live', 'polite');
    box.appendChild(item);

    var nav = el('div', 'pv-nav');
    var prev = el('button', null, '← Previous'), next = el('button', null, 'Next →');
    prev.type = next.type = 'button';
    nav.appendChild(prev); nav.appendChild(next);
    box.appendChild(nav);

    var src = el('p', 'meta pv-src', 'Loaded live from ');
    src.appendChild(link(label, page));
    src.appendChild(document.createTextNode(' on Hugging Face. The arrow keys move between questions.'));
    box.appendChild(src);

    var state = { kind: 'all', i: 0, shown: false };
    function list() { return state.kind === 'all' ? all : all.filter(function (q) { return kindOf(q) === state.kind; }); }

    ['all'].concat(kinds).forEach(function (k) {
      var b = el('button', null, k === 'all' ? 'All' : kindName(k));
      b.type = 'button';
      b.setAttribute('aria-pressed', k === 'all' ? 'true' : 'false');
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(bar.children, function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        state.kind = k; state.i = 0; state.shown = false;
        draw();
      });
      bar.appendChild(b);
    });

    function draw() {
      var qs = list(), q = qs[state.i];
      count.textContent = (state.i + 1) + ' of ' + qs.length + (qs.length !== all.length ? ' · ' + all.length + ' in all' : '');
      prev.disabled = state.i === 0;
      next.disabled = state.i === qs.length - 1;
      item.textContent = '';
      item.appendChild(el('p', 'meta', kindName(kindOf(q)) + ' · ' + q.id));
      item.appendChild(el('p', 'pv-prompt', q.prompt));

      item.appendChild(el('p', 'pv-k', 'Model input, read at token ' + q.read_position + ', the last'));
      item.appendChild(modelInput(q));

      item.appendChild(el('p', 'pv-k', 'The options the judge is shown'));
      var opts = el('ul', 'pv-options' + (state.shown ? ' shown' : ''));
      (q.options || []).forEach(function (o) {
        var li = el('li', o === q.intermediate && state.shown ? 'is-answer' : null, o);
        if (o === q.intermediate && state.shown) li.setAttribute('aria-label', o + ', the intermediate');
        opts.appendChild(li);
      });
      item.appendChild(opts);

      var ctl = el('div', 'pv-ctl');
      var reveal = el('button', null, state.shown ? 'Hide the intermediate' : 'Show the intermediate');
      reveal.type = 'button';
      reveal.setAttribute('aria-pressed', state.shown ? 'true' : 'false');
      reveal.addEventListener('click', function () { state.shown = !state.shown; draw(); });
      ctl.appendChild(reveal);
      if (state.shown) {
        var why = q.answer === q.intermediate ? 'It is also the answer: the lens has to find it before the model writes it.' : 'The answer is ' + q.answer + '.';
        ctl.appendChild(el('span', 'pv-why', why));
      }
      item.appendChild(ctl);

      if (q.task_type) item.appendChild(el('p', 'meta pv-task', 'The judge is told: ' + q.task_type + '.'));
    }

    prev.addEventListener('click', function () { if (state.i > 0) { state.i--; state.shown = false; draw(); } });
    next.addEventListener('click', function () { if (state.i < list().length - 1) { state.i++; state.shown = false; draw(); } });
    document.addEventListener('keydown', function (e) {
      if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
      if (e.key === 'ArrowLeft') prev.click();
      else if (e.key === 'ArrowRight') next.click();
    });
    draw();
  }

  window.PracticeViewer = { mount: mount };
})();
