(function () {
  var STORAGE_KEY = 'trefelle_practice_code';

  // hardcoded to prove the pipeline; AI-generated per-field projects come next
  var PATHWAYS = [
    {
      name: 'Backend Fundamentals',
      projects: [
        {
          id: 'clean-emails',
          title: 'Clean a list of emails',
          skill: 'String validation',
          language: 'python',
          spec:
            '<p>You\u2019re importing a CSV of signups and the email column is a mess \u2014 mixed case, ' +
            'stray whitespace, obvious typos, and duplicates once you normalize casing.</p>' +
            '<p>Write <code>clean_emails(emails)</code> that takes a list of raw strings and returns a ' +
            'sorted list of the <b>valid</b> ones, lowercased and deduplicated. A valid email has exactly ' +
            'one <code>@</code>, at least one <code>.</code> after it, and no whitespace.</p>',
          starter:
            'def clean_emails(emails):\n' +
            '    # return a sorted list of valid, lowercased, de-duplicated emails\n' +
            '    pass\n',
          entryFunction: 'clean_emails',
          tests: [
            { name: 'mixed case + duplicate', args: [['Jo@Example.com', ' jo@example.com', 'jo@example.com']], expected: ['jo@example.com'] },
            { name: 'drops invalid', args: [['no-at-sign.com', 'two@@at.com', 'no.dot@com', 'ok@site.com']], expected: ['ok@site.com'] },
            { name: 'drops whitespace-containing', args: [['bad email@site.com', 'good@site.com']], expected: ['good@site.com'] },
            { name: 'sorts result', args: [['zed@site.com', 'amy@site.com']], expected: ['amy@site.com', 'zed@site.com'] }
          ],
          reference: [
            { term: 'strip', usage: 'str.strip()', explain: 'Returns a copy of the string with leading and trailing whitespace removed.' },
            { term: 'lower', usage: 'str.lower()', explain: 'Returns a lowercased copy of the string.' },
            { term: 'count', usage: 'str.count(sub)', explain: 'Counts how many times a substring appears in the string.' },
            { term: 'partition', usage: 'str.partition(sep)', explain: 'Splits the string at the first sep, returning a 3-item tuple (before, sep, after).' },
            { term: 'set', usage: 'set()', explain: 'A collection of unique, unordered values \u2014 adding a duplicate has no effect.' },
            { term: 'sorted', usage: 'sorted(iterable)', explain: 'Returns a new, sorted list built from any iterable (a list, a set, etc).' }
          ]
        },
        {
          id: 'rate-limiter',
          title: 'Sliding-window rate limiter',
          skill: 'State & time windows',
          language: 'python',
          spec:
            '<p>An API needs to cap how many requests one client can make in a rolling time window \u2014 ' +
            'the same logic behind things like <code>429 Too Many Requests</code> responses.</p>' +
            '<p>Write <code>allow_request(prior_timestamps, now, max_requests, window_seconds)</code>. ' +
            '<code>prior_timestamps</code> is a list of the client\u2019s past accepted request times ' +
            '(numbers, seconds). Return <code>True</code> if a new request at <code>now</code> should be ' +
            'allowed \u2014 i.e. fewer than <code>max_requests</code> of the prior timestamps fall within ' +
            '<code>[now - window_seconds, now]</code> \u2014 else <code>False</code>.</p>',
          starter:
            'def allow_request(prior_timestamps, now, max_requests, window_seconds):\n' +
            '    # True if fewer than max_requests prior timestamps fall in the current window\n' +
            '    pass\n',
          entryFunction: 'allow_request',
          tests: [
            { name: 'under limit', args: [[10, 12], 15, 3, 10], expected: true },
            { name: 'at limit', args: [[10, 12, 14], 15, 3, 10], expected: false },
            { name: 'old requests age out', args: [[1, 2, 3], 15, 3, 10], expected: true },
            { name: 'exact window edge included', args: [[5], 15, 1, 10], expected: false }
          ],
          reference: [
            { term: 'for', usage: 'for x in items:', explain: 'Runs the loop body once per item in a list, binding x to each item in turn.' },
            { term: 'len', usage: 'len(items)', explain: 'Returns how many items are in a list, string, or other sequence.' }
          ]
        },
        {
          id: 'merge-meetings',
          title: 'Merge overlapping meeting times',
          skill: 'Interval logic',
          language: 'javascript',
          spec:
            '<p>A calendar app pulls a person\u2019s booked slots from several sources, so the same block of ' +
            'time can show up more than once, or two bookings can partially overlap. Before rendering the ' +
            'day view, overlapping or touching slots need to collapse into one.</p>' +
            '<p>Write <code>mergeMeetings(slots)</code>. <code>slots</code> is an array of <code>[start, end]</code> ' +
            'pairs (minutes since midnight), not necessarily sorted. Return a new array of merged ' +
            '<code>[start, end]</code> pairs, sorted by start time \u2014 two slots merge if one starts at or ' +
            'before the other one ends.</p>',
          starter:
            'function mergeMeetings(slots) {\n' +
            '  // return merged, sorted [start, end] pairs\n' +
            '}\n',
          entryFunction: 'mergeMeetings',
          tests: [
            { name: 'overlapping pair', args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
            { name: 'touching counts as overlap', args: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
            { name: 'single slot', args: [[[5, 10]]], expected: [[5, 10]] },
            { name: 'fully contained', args: [[[1, 10], [2, 3]]], expected: [[1, 10]] }
          ],
          reference: [
            { term: 'sort', usage: 'arr.sort((a, b) => a - b)', explain: 'The comparator returns negative to put a before b, positive for b before a.' },
            { term: 'push', usage: 'arr.push(item)', explain: 'Adds an item to the end of an array, mutating it in place.' },
            { term: 'max', usage: 'Math.max(a, b)', explain: 'Returns the largest of the given numbers.' },
            { term: 'length', usage: 'arr.length', explain: 'How many items are in the array.' }
          ]
        },
        {
          id: 'inactive-customers',
          title: 'Find customers with no orders',
          skill: 'Joins & filtering',
          language: 'sql',
          spec:
            '<p>Marketing wants a re-engagement list \u2014 every customer who signed up but has never actually ' +
            'placed an order.</p>' +
            '<p>Write a <code>SELECT</code> query against the <code>customers</code> and <code>orders</code> ' +
            'tables below returning the <code>id</code> and <code>name</code> of every customer with zero rows ' +
            'in <code>orders</code>, ordered by <code>id</code>.</p>' +
            '<pre class="pr-run-out" style="color:#3a4038;background:#f6f4ef;border:1px solid var(--line)">' +
            'customers(id, name)\norders(id, customer_id, order_date)</pre>',
          starter: '-- customers with zero matching rows in orders, ordered by id\nSELECT\n',
          schema:
            'CREATE TABLE customers (id INTEGER, name TEXT);\n' +
            'CREATE TABLE orders (id INTEGER, customer_id INTEGER, order_date TEXT);\n' +
            "INSERT INTO customers VALUES (1,'Ava Chen'),(2,'Marcus Lee'),(3,'Priya Singh'),(4,'Devon Brooks'),(5,'Jordan Kim');\n" +
            "INSERT INTO orders VALUES (1,1,'2026-09-10'),(2,1,'2026-02-15'),(3,2,'2026-03-01'),(4,3,'2026-08-20');",
          tests: [
            { name: 'customers with no orders', expected: [[4, 'Devon Brooks'], [5, 'Jordan Kim']] }
          ],
          reference: [
            { term: 'JOIN', usage: 'FROM a LEFT JOIN b ON ...', explain: 'Keeps every row from the left table, filling NULLs where the right table has no match.' },
            { term: 'NULL', usage: 'col IS NULL', explain: 'True when a column has no value \u2014 use this instead of = NULL, which never matches.' },
            { term: 'ORDER', usage: 'ORDER BY col', explain: 'Sorts the result rows by the given column(s), ascending by default.' }
          ]
        }
      ]
    }
  ];

  // The actual engines (Pyodide/sql.js/JS Worker) live in code-runner.js
  // (window.TrefelleRunner) so the workspace assessment's qualifications
  // sampler can run real code too, instead of duplicating this.
  var getPyodide = window.TrefelleRunner.getPyodide;
  var getSqlJs = window.TrefelleRunner.getSqlJs;
  var runJSWorker = window.TrefelleRunner.runJSWorker;

  function loadSavedCode(projectId, fallback) {
    try {
      var all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return all[projectId] || fallback;
    } catch (e) { return fallback; }
  }
  function saveCode(projectId, code) {
    try {
      var all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      all[projectId] = code;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (e) {}
  }

  function deepEqual(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

  function runJSRaw(code) { return window.TrefelleRunner.runJSRaw(code); }

  function runJSTests(code, project) {
    var script =
      code + '\n' +
      'var __tests = ' + JSON.stringify(project.tests) + ';\n' +
      'var __results = __tests.map(function (t) {\n' +
      '  try {\n' +
      '    var got = ' + project.entryFunction + '.apply(null, t.args);\n' +
      '    return { name: t.name, pass: JSON.stringify(got) === JSON.stringify(t.expected), got: got };\n' +
      '  } catch (e) {\n' +
      '    return { name: t.name, pass: false, error: e.message };\n' +
      '  }\n' +
      '});\n' +
      'postMessage(__results);';
    return runJSWorker(script, 5000);
  }

  function runPythonRaw(code) { return window.TrefelleRunner.runPythonRaw(code); }

  function runPythonTests(code, project) {
    return getPyodide().then(function (pyodide) {
      var out = [];
      pyodide.setStdout({ batched: function (s) { out.push(s); } });
      pyodide.setStderr({ batched: function (s) { out.push(s); } });
      var testsJson = JSON.stringify(project.tests.map(function (t) {
        return { name: t.name, args: t.args, expected: t.expected };
      }));
      var harness =
        code + '\n\n' +
        'import json as __json\n' +
        '__tests = __json.loads(\'\'\'' + testsJson.replace(/\\/g, '\\\\').replace(/'''/g, "' ' '") + '\'\'\')\n' +
        '__results = []\n' +
        'for __t in __tests:\n' +
        '    try:\n' +
        '        __got = ' + project.entryFunction + '(*__t["args"])\n' +
        '        __results.append({"name": __t["name"], "pass": __got == __t["expected"], "got": __got})\n' +
        '    except Exception as __e:\n' +
        '        __results.append({"name": __t["name"], "pass": False, "error": str(__e)})\n' +
        'print("__TREFELLE_RESULTS__" + __json.dumps(__results))\n';
      try {
        pyodide.runPython(harness);
      } catch (e) {
        return { error: String(e), raw: out.join('\n') };
      }
      var lines = out.join('\n').split('\n');
      for (var i = lines.length - 1; i >= 0; i--) {
        if (lines[i].indexOf('__TREFELLE_RESULTS__') === 0) {
          try { return { results: JSON.parse(lines[i].slice('__TREFELLE_RESULTS__'.length)) }; } catch (e) {}
        }
      }
      return { error: 'no results marker found', raw: out.join('\n') };
    });
  }

  function runSqlRaw(code, project) { return window.TrefelleRunner.runSqlRaw(code, project.schema); }

  function runSqlTests(code, project) {
    return getSqlJs().then(function (SQL) {
      var db = new SQL.Database();
      db.run(project.schema);
      var name = project.tests[0].name;
      try {
        var res = db.exec(code);
        var got = res.length ? res[0].values : [];
        var pass = deepEqual(got, project.tests[0].expected);
        db.close();
        return { results: [{ name: name, pass: pass, got: got }] };
      } catch (e) {
        db.close();
        return { error: e.message };
      }
    });
  }

  // ---- Tutor: explains concepts via whatever AI is connected, never solves the problem ----
  function stripHtml(html) {
    return String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function tutorSystemPrompt(project) {
    return 'You are a patient, encouraging programming tutor inside Trefelle, a coding practice ' +
      'platform. The student is working on this ' + project.language + ' problem, titled "' +
      project.title + '": ' + stripHtml(project.spec) + '\n\n' +
      'Rules:\n' +
      '- Never write, complete, or output code that solves this problem, in whole or in part, ' +
      'even if asked directly or indirectly.\n' +
      '- If asked to solve it, explain the relevant concept, built-in method, or pattern instead, ' +
      'and encourage the student to write the code themselves.\n' +
      '- You may freely explain general language features, syntax, built-in functions/methods, ' +
      'and debugging strategies, using short examples unrelated to this specific problem.\n' +
      '- Keep answers short and concrete.';
  }

  function cmModeFor(language) {
    if (language === 'python') return 'python';
    if (language === 'javascript') return 'javascript';
    if (language === 'sql') return 'text/x-sql';
    return null;
  }

  function findReference(project, term) {
    if (!project.reference || !term) return null;
    var t = term.toLowerCase();
    for (var i = 0; i < project.reference.length; i++) {
      if (project.reference[i].term.toLowerCase() === t) return project.reference[i];
    }
    return null;
  }

  var sideEl = document.getElementById('side');
  var mainEl = document.getElementById('main');
  var topTitle = document.getElementById('topTitle');
  var completed = {};
  try { completed = JSON.parse(localStorage.getItem('trefelle_practice_done') || '{}'); } catch (e) {}
  var activeId = null;

  // ---- module-level UI state: one project is ever open at a time ----
  var tabButtons = [];
  var tabPanels = [];
  var tutorSend = null;
  var popoverEl = null;

  function switchTab(name) {
    tabButtons.forEach(function (btn) { btn.classList.toggle('active', btn.dataset.tab === name); });
    tabPanels.forEach(function (panel) { panel.hidden = panel.dataset.panel !== name; });
  }

  function hidePopover() {
    if (popoverEl) { popoverEl.remove(); popoverEl = null; }
  }

  function showPopover(x, y, project, term) {
    hidePopover();
    var entry = findReference(project, term);
    var pop = document.createElement('div');
    pop.className = 'pr-token-popover';
    if (entry) {
      var usage = document.createElement('div');
      usage.className = 'pr-token-usage';
      usage.textContent = entry.usage;
      var explain = document.createElement('div');
      explain.className = 'pr-token-explain';
      explain.textContent = entry.explain;
      pop.appendChild(usage);
      pop.appendChild(explain);
    } else {
      var note = document.createElement('div');
      note.className = 'pr-token-explain';
      note.textContent = 'No reference entry for \u201c' + term + '\u201d yet.';
      pop.appendChild(note);
      var askBtn = document.createElement('button');
      askBtn.type = 'button';
      askBtn.className = 'pr-token-ask';
      askBtn.textContent = 'Ask AI to explain';
      askBtn.addEventListener('click', function () {
        hidePopover();
        askTutor('Explain "' + term + '" in ' + project.language + '. Just explain this one thing \u2014 don\u2019t solve my assignment.');
      });
      pop.appendChild(askBtn);
    }
    var vw = window.innerWidth, vh = window.innerHeight;
    pop.style.left = Math.min(x, vw - 280) + 'px';
    pop.style.top = Math.min(y + 12, vh - 140) + 'px';
    document.body.appendChild(pop);
    popoverEl = pop;
  }

  function askTutor(text) {
    switchTab('tutor');
    if (tutorSend) tutorSend(text);
  }

  document.addEventListener('mousedown', function (e) {
    if (popoverEl && !popoverEl.contains(e.target) && !(e.target.closest && e.target.closest('.CodeMirror'))) hidePopover();
  }, true);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') hidePopover();
  });

  function markDone(id) {
    completed[id] = true;
    try { localStorage.setItem('trefelle_practice_done', JSON.stringify(completed)); } catch (e) {}
  }

  function renderSide() {
    sideEl.innerHTML = '';
    PATHWAYS.forEach(function (path) {
      var section = document.createElement('div');
      section.className = 'pr-path';
      var name = document.createElement('p');
      name.className = 'pr-path-name';
      name.textContent = path.name;
      section.appendChild(name);
      path.projects.forEach(function (project, idx) {
        var btn = document.createElement('button');
        btn.className = 'pr-proj' + (project.id === activeId ? ' active' : '') + (completed[project.id] ? ' done' : '');
        var badge = document.createElement('span');
        badge.className = 'pr-proj-badge';
        badge.textContent = completed[project.id] ? '\u2713' : String(idx + 1);
        var label = document.createElement('span');
        label.className = 'pr-proj-label';
        label.innerHTML = project.title + '<span class="pr-proj-skill">' + project.skill + '</span>';
        btn.appendChild(badge);
        btn.appendChild(label);
        btn.addEventListener('click', function () { selectProject(project); });
        section.appendChild(btn);
      });
      sideEl.appendChild(section);
    });
  }

  function selectProject(project) {
    activeId = project.id;
    topTitle.textContent = project.title;
    renderSide();
    renderMain(project);
  }

  function renderTutorPanel(container, project) {
    container.innerHTML = '';
    tutorSend = null;
    var stack = window.TrefelleAI.loadKeyStack();
    if (!stack.length) {
      var locked = document.createElement('div');
      locked.className = 'pr-tutor-locked';
      var p = document.createElement('p');
      p.textContent = 'Connect an AI key, WebLLM, or local model to use the tutor.';
      var a = document.createElement('a');
      a.href = '/workspace';
      a.className = 'pr-tutor-locked-link';
      a.textContent = 'Connect one \u2192';
      locked.appendChild(p);
      locked.appendChild(a);
      container.appendChild(locked);
      return;
    }

    var conversation = [];
    var msgs = document.createElement('div');
    msgs.className = 'pr-tutor-msgs';
    var intro = document.createElement('div');
    intro.className = 'pr-tutor-msg assistant';
    intro.textContent = 'Ask me about syntax, built-ins, or concepts \u2014 I\u2019ll help you understand, but I won\u2019t solve this problem for you.';
    msgs.appendChild(intro);
    container.appendChild(msgs);

    var status = document.createElement('p');
    status.className = 'pr-status';
    status.hidden = true;
    container.appendChild(status);

    var row = document.createElement('div');
    row.className = 'pr-tutor-input-row';
    var input = document.createElement('textarea');
    input.className = 'pr-tutor-input';
    input.placeholder = 'Ask a question\u2026';
    var sendBtn = document.createElement('button');
    sendBtn.type = 'button';
    sendBtn.className = 'pr-run-btn';
    sendBtn.textContent = 'Send';
    row.appendChild(input);
    row.appendChild(sendBtn);
    container.appendChild(row);

    function setStatus(text, isError) {
      status.hidden = !text;
      status.textContent = text || '';
      status.className = 'pr-status' + (isError ? ' error' : '');
    }

    function appendMsg(role, text) {
      var m = document.createElement('div');
      m.className = 'pr-tutor-msg ' + role;
      m.textContent = text;
      msgs.appendChild(m);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function send(preset) {
      var text = (preset || input.value).trim();
      if (!text) return;
      input.value = '';
      sendBtn.disabled = true;
      appendMsg('user', text);
      conversation.push({ role: 'user', content: text });
      setStatus('Thinking\u2026');
      window.TrefelleAI.callAI(window.TrefelleAI.loadKeyStack(), [{ role: 'system', content: tutorSystemPrompt(project) }].concat(conversation))
        .then(function (reply) {
          setStatus('');
          appendMsg('assistant', reply);
          conversation.push({ role: 'assistant', content: reply });
        })
        .catch(function (err) {
          setStatus((err && err.message) || 'Something went wrong asking the tutor.', true);
        })
        .then(function () { sendBtn.disabled = false; });
    }

    sendBtn.addEventListener('click', function () { send(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });

    tutorSend = send;
  }

  function renderMain(project) {
    mainEl.innerHTML = '';
    hidePopover();

    var split = document.createElement('div');
    split.className = 'pr-split';

    // ---- left: Description / Reference / Tutor tabs ----
    var info = document.createElement('div');
    info.className = 'pr-info';

    var tabs = document.createElement('div');
    tabs.className = 'pr-tabs';
    var tabDefs = [
      { id: 'description', label: 'Description' },
      { id: 'reference', label: 'Reference' },
      { id: 'tutor', label: 'Tutor' }
    ];
    tabButtons = [];
    tabDefs.forEach(function (t) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pr-tab' + (t.id === 'description' ? ' active' : '');
      btn.dataset.tab = t.id;
      btn.textContent = t.label;
      btn.addEventListener('click', function () { switchTab(t.id); });
      tabs.appendChild(btn);
      tabButtons.push(btn);
    });
    info.appendChild(tabs);

    var descPanel = document.createElement('div');
    descPanel.className = 'pr-panel';
    descPanel.dataset.panel = 'description';

    var eyebrow = document.createElement('p');
    eyebrow.className = 'pr-eyebrow';
    eyebrow.textContent = project.skill;
    descPanel.appendChild(eyebrow);

    var h1 = document.createElement('h1');
    h1.className = 'pr-h1';
    h1.textContent = project.title;
    descPanel.appendChild(h1);

    var spec = document.createElement('div');
    spec.className = 'pr-spec';
    spec.innerHTML = project.spec;
    descPanel.appendChild(spec);

    var refPanel = document.createElement('div');
    refPanel.className = 'pr-panel';
    refPanel.dataset.panel = 'reference';
    refPanel.hidden = true;
    var refList = document.createElement('div');
    refList.className = 'pr-ref-list';
    (project.reference || []).forEach(function (entry) {
      var item = document.createElement('div');
      item.className = 'pr-ref-item';
      var usage = document.createElement('div');
      usage.className = 'pr-ref-usage';
      usage.textContent = entry.usage;
      var explain = document.createElement('div');
      explain.className = 'pr-ref-explain';
      explain.textContent = entry.explain;
      item.appendChild(usage);
      item.appendChild(explain);
      refList.appendChild(item);
    });
    refPanel.appendChild(refList);

    var tutorPanel = document.createElement('div');
    tutorPanel.className = 'pr-panel';
    tutorPanel.dataset.panel = 'tutor';
    tutorPanel.hidden = true;
    renderTutorPanel(tutorPanel, project);

    tabPanels = [descPanel, refPanel, tutorPanel];
    info.appendChild(descPanel);
    info.appendChild(refPanel);
    info.appendChild(tutorPanel);
    split.appendChild(info);

    // ---- right: editor + run/submit + results ----
    var workbench = document.createElement('div');
    workbench.className = 'pr-workbench';

    var wrap = document.createElement('div');
    wrap.className = 'pr-editor-wrap';
    var bar = document.createElement('div');
    bar.className = 'pr-editor-bar';
    var lang = document.createElement('span');
    lang.className = 'pr-lang';
    lang.textContent = project.language;
    var actions = document.createElement('div');
    actions.className = 'pr-editor-actions';
    var runBtn = document.createElement('button');
    runBtn.type = 'button';
    runBtn.className = 'pr-run-btn';
    runBtn.textContent = 'Run';
    var submitBtn = document.createElement('button');
    submitBtn.type = 'button';
    submitBtn.className = 'pr-submit-btn';
    submitBtn.textContent = 'Submit';
    actions.appendChild(runBtn);
    actions.appendChild(submitBtn);
    bar.appendChild(lang);
    bar.appendChild(actions);
    wrap.appendChild(bar);

    var editorHost = document.createElement('div');
    editorHost.className = 'pr-editor-host';
    wrap.appendChild(editorHost);
    workbench.appendChild(wrap);

    var cm = CodeMirror(editorHost, {
      value: loadSavedCode(project.id, project.starter),
      mode: cmModeFor(project.language),
      lineNumbers: true,
      indentUnit: 4,
      tabSize: 4,
      viewportMargin: Infinity,
      // Enter inserts a plain newline -- CodeMirror's mode-aware auto-indent
      // stacks with a student's own leading spaces and breaks Python indentation.
      extraKeys: {
        Tab: function (inst) { inst.replaceSelection('    '); },
        Enter: function (inst) { inst.replaceSelection('\n'); }
      }
    });
    cm.on('change', function () { saveCode(project.id, cm.getValue()); });
    editorHost.addEventListener('mousedown', function (e) {
      setTimeout(function () {
        var pos = cm.coordsChar({ left: e.clientX, top: e.clientY }, 'window');
        var token = cm.getTokenAt(pos);
        var term = token && token.string ? token.string.replace(/[^\w]/g, '') : '';
        if (!term) { hidePopover(); return; }
        showPopover(e.clientX, e.clientY, project, term);
      }, 0);
    });

    var status = document.createElement('p');
    status.className = 'pr-status';
    status.hidden = true;
    workbench.appendChild(status);

    var results = document.createElement('div');
    results.className = 'pr-results';
    workbench.appendChild(results);

    split.appendChild(workbench);
    mainEl.appendChild(split);
    // CodeMirror measures its container on construction; it was off-DOM until
    // the line above, so it needs one refresh now that it has real layout.
    cm.refresh();

    function setStatus(text, isError) {
      status.hidden = !text;
      status.textContent = text || '';
      status.className = 'pr-status' + (isError ? ' error' : '');
    }

    function runRaw() {
      var code = cm.getValue();
      if (project.language === 'javascript') return runJSRaw(code);
      if (project.language === 'python') return runPythonRaw(code);
      if (project.language === 'sql') return runSqlRaw(code, project);
      return Promise.reject(new Error('Unsupported language: ' + project.language));
    }

    function runTests() {
      var code = cm.getValue();
      if (project.language === 'javascript') return runJSTests(code, project);
      if (project.language === 'python') return runPythonTests(code, project);
      if (project.language === 'sql') return runSqlTests(code, project);
      return Promise.reject(new Error('Unsupported language: ' + project.language));
    }

    runBtn.addEventListener('click', function () {
      runBtn.disabled = true;
      submitBtn.disabled = true;
      setStatus(project.language === 'python' && !window.TrefelleRunner.hasStartedPyodide() ? 'Loading Python (first run only)\u2026' : 'Running\u2026');
      results.innerHTML = '';
      runRaw().then(function (text) {
        setStatus('');
        var out = document.createElement('pre');
        out.className = 'pr-run-out';
        out.textContent = text || '(no output)';
        results.appendChild(out);
      }).catch(function (err) {
        setStatus(err.message || 'Something went wrong running your code.', true);
      }).then(function () {
        runBtn.disabled = false;
        submitBtn.disabled = false;
      });
    });

    submitBtn.addEventListener('click', function () {
      runBtn.disabled = true;
      submitBtn.disabled = true;
      setStatus(project.language === 'python' && !window.TrefelleRunner.hasStartedPyodide() ? 'Loading Python (first run only)\u2026' : 'Running tests\u2026');
      results.innerHTML = '';
      runTests().then(function (outcome) {
        if (!outcome || !outcome.results) {
          if (Array.isArray(outcome)) outcome = { results: outcome };
        }
        if (!outcome || !outcome.results) {
          setStatus(outcome && outcome.error ? outcome.error : 'Your code errored before finishing.', true);
          if (outcome && outcome.raw) {
            var out = document.createElement('pre');
            out.className = 'pr-run-out';
            out.textContent = outcome.raw;
            results.appendChild(out);
          }
          return;
        }
        setStatus('');
        var list = document.createElement('div');
        list.className = 'pr-tests';
        var allPass = true;
        outcome.results.forEach(function (t) {
          if (!t.pass) allPass = false;
          var row = document.createElement('div');
          row.className = 'pr-test ' + (t.pass ? 'pass' : 'fail');
          var icon = document.createElement('span');
          icon.className = 'pr-test-icon';
          icon.textContent = t.pass ? '\u2713' : '\u2717';
          var body = document.createElement('div');
          body.className = 'pr-test-body';
          var name = document.createElement('div');
          name.className = 'pr-test-name';
          name.textContent = t.name;
          body.appendChild(name);
          if (!t.pass) {
            var detail = document.createElement('div');
            detail.className = 'pr-test-detail';
            detail.textContent = t.error ? ('Error: ' + t.error) : ('Got: ' + JSON.stringify(t.got));
            body.appendChild(detail);
          }
          row.appendChild(icon);
          row.appendChild(body);
          list.appendChild(row);
        });
        results.appendChild(list);
        if (allPass) {
          markDone(project.id);
          renderSide();
        }
      }).catch(function (err) {
        setStatus(err.message || 'Something went wrong running your tests.', true);
      }).then(function () {
        runBtn.disabled = false;
        submitBtn.disabled = false;
      });
    });
  }

  function renderEmpty() {
    mainEl.innerHTML = '';
    hidePopover();
    var wrap = document.createElement('div');
    wrap.className = 'pr-empty';
    var h1 = document.createElement('h1');
    h1.textContent = 'Pick a project to start.';
    var p = document.createElement('p');
    p.textContent = 'Each pathway is an ordered set of real, project-shaped tasks \u2014 pick one from the sidebar.';
    wrap.appendChild(h1);
    wrap.appendChild(p);
    mainEl.appendChild(wrap);
  }

  renderSide();
  renderEmpty();
})();
