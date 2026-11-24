/* The question-bank viewer on a project's detail page (design rule 72). app.js makes a <div class="bank"> and calls
   BankViewer.mount(box, bank), where bank is the detail's dataset.bank from programs.js: {label, page, files}. Each
   file is {name, file, shape}: a public JSON file of a question bank, loaded live from where it is published (never
   a copy in the repo). A line of text buttons picks the file; its questions are then put into the practice
   viewer's shape and shown by it (practice.js), one at a time, with the same filter by kind and the same reveal.
   Shapes are WorkspaceBench's: "basic" and "multihop" keep the intermediate and its distractors in mc; "multilingual"
   keeps them in mc.concept_native and names the passage's language.
   Load it after practice.js and before app.js. */
(function () {
  var KINDS = { ath: 'Athlete', lmk: 'Landmark', mus: 'Musician', arith: 'Arithmetic', dayafter: 'Day after',
    daybefore: 'Day before', monthafter: 'Month after', implicit: 'Implicit' };
  var LANGS = { de: 'German', es: 'Spanish', fr: 'French', pt: 'Portuguese', it: 'Italian', nl: 'Dutch', ar: 'Arabic',
    cs: 'Czech', fa: 'Persian', pl: 'Polish', sr: 'Serbian', tr: 'Turkish', uk: 'Ukrainian', da: 'Danish',
    id: 'Indonesian', ga: 'Irish', ja: 'Japanese', sk: 'Slovak' };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // the options in a fixed order that does not give the intermediate away: by a hash of the question's id
  function options(id, gold, distractors) {
    var all = [gold].concat(distractors || []), h = 0;
    for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    var at = h % all.length;
    all.splice(0, 1);
    all.splice(at, 0, gold);
    return all;
  }

  // one bank item as the practice viewer reads a question; kinds with fewer than three questions are shown as Other
  function normalise(items, shape) {
    var qs = items.map(function (it) {
      var mc = it.mc || {}, id = it.id || it.name, q = { id: id, prompt: it.prompt, answer: it.target };
      if (shape === 'multilingual') {
        var c = mc.concept_native || {};
        q.intermediate = c.gold;
        q.options = options(id, c.gold, c.distractors);
        q.kind = LANGS[it.lang] || it.lang || 'other';
        q.note = 'The passage is in ' + ((mc.language || {}).gold || q.kind) + '; the intermediate is its answer\u2019s concept, in English.';
      } else {
        q.intermediate = mc.gold;
        q.options = options(id, mc.gold, mc.distractors);
        q.kind = shape === 'multihop' ? (mc.bridge_type || 'other') : (KINDS[it.slice] || it.slice || 'other');
        if (it.task_context) q.task_type = it.task_context;
      }
      return q;
    });
    var n = {};
    qs.forEach(function (q) { n[q.kind] = (n[q.kind] || 0) + 1; });
    qs.forEach(function (q) { q.groups = { kind: n[q.kind] < 3 ? 'other' : q.kind }; });
    return qs;
  }

  function mount(box, bank) {
    var bar = el('div', 'filter bank-files');
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Choose a file of the question bank');
    var view = el('div', 'pv');
    box.appendChild(bar);
    box.appendChild(view);
    var cache = {}, shown = null;

    function show(f) {
      shown = f;
      Array.prototype.forEach.call(bar.children, function (b, i) { b.setAttribute('aria-pressed', bank.files[i] === f ? 'true' : 'false'); });
      if (cache[f.file]) { draw(f); return; }
      view.textContent = '';
      view.appendChild(el('p', 'count', 'Loading the questions…'));
      fetch(f.file).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      }).then(function (data) {
        cache[f.file] = normalise(data.items || data, f.shape);
        if (shown === f) draw(f);
      }).catch(function () {
        if (shown !== f) return;
        view.textContent = '';
        var p = el('p', 'count', 'The questions could not be loaded from ' + bank.host + '. ');
        var a = el('a', null, 'Open the dataset');
        a.href = bank.page; a.target = '_blank'; a.rel = 'noopener';
        p.appendChild(a);
        view.appendChild(p);
      });
    }
    function draw(f) { window.PracticeViewer.render(view, cache[f.file], bank.page, bank.label, { host: bank.host }); }

    bank.files.forEach(function (f) {
      var b = el('button', null, f.name);
      b.type = 'button';
      b.addEventListener('click', function () { show(f); });
      bar.appendChild(b);
    });
    show(bank.files[0]);
  }

  window.BankViewer = { mount: mount };
})();
