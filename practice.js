(function () {
  var STORAGE_KEY = 'trefelle_practice_code';
  var PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.js';
  var SQLJS_BASE = 'https://cdn.jsdelivr.net/npm/sql.js@1.14.2/dist/';

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
          ]
        }
      ]
    }
  ];

  function loadScriptOnce(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) { resolve(); return; }
      var s = document.createElement('script');
      s.src = src;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Couldn\u2019t load ' + src)); };
      document.head.appendChild(s);
    });
  }

  var pyodidePromise = null;
  function getPyodide() {
    if (pyodidePromise) return pyodidePromise;
    pyodidePromise = loadScriptOnce(PYODIDE_URL).then(function () { return window.loadPyodide(); });
    return pyodidePromise;
  }

  var sqlJsPromise = null;
  function getSqlJs() {
    if (sqlJsPromise) return sqlJsPromise;
    sqlJsPromise = loadScriptOnce(SQLJS_BASE + 'sql-wasm.js').then(function () {
      return window.initSqlJs({ locateFile: function (f) { return SQLJS_BASE + f; } });
    });
    return sqlJsPromise;
  }

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

  // ---- JavaScript: runs in a Worker so a bad loop can't freeze the page ----
  function runJSWorker(script, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var blob = new Blob([script], { type: 'application/javascript' });
      var url = URL.createObjectURL(blob);
      var worker = new Worker(url);
      var timer = setTimeout(function () {
        worker.terminate();
        reject(new Error('Timed out after ' + (timeoutMs / 1000) + 's \u2014 check for an infinite loop.'));
      }, timeoutMs);
      worker.onmessage = function (e) {
        clearTimeout(timer);
        worker.terminate();
        URL.revokeObjectURL(url);
        resolve(e.data);
      };
      worker.onerror = function (e) {
        clearTimeout(timer);
        worker.terminate();
        URL.revokeObjectURL(url);
        reject(new Error(e.message || 'Script error'));
      };
    });
  }

  function runJSRaw(code) {
    var script =
      'var __log = [];\n' +
      'console.log = function () { __log.push(Array.prototype.slice.call(arguments).map(String).join(" ")); };\n' +
      'try {\n' + code + '\n} catch (e) { __log.push("Error: " + e.message); }\n' +
      'postMessage(__log.join("\\n"));';
    return runJSWorker(script, 5000);
  }

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

  // ---- Python: runs in-browser via Pyodide, no server involved ----
  function runPythonRaw(code) {
    return getPyodide().then(function (pyodide) {
      var out = [];
      pyodide.setStdout({ batched: function (s) { out.push(s); } });
      pyodide.setStderr({ batched: function (s) { out.push(s); } });
      try {
        pyodide.runPython(code);
      } catch (e) {
        out.push(String(e));
      }
      return out.join('\n');
    });
  }

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

  // ---- SQL: runs against an in-memory SQLite database via sql.js ----
  function runSqlRaw(code, project) {
    return getSqlJs().then(function (SQL) {
      var db = new SQL.Database();
      db.run(project.schema);
      var out;
      try {
        var res = db.exec(code);
        out = res.length
          ? res[0].columns.join(' | ') + '\n' + res[0].values.map(function (r) { return r.join(' | '); }).join('\n')
          : '(no rows)';
      } catch (e) {
        out = 'Error: ' + e.message;
      }
      db.close();
      return out;
    });
  }

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

  var sideEl = document.getElementById('side');
  var mainEl = document.getElementById('main');
  var topTitle = document.getElementById('topTitle');
  var completed = {};
  try { completed = JSON.parse(localStorage.getItem('trefelle_practice_done') || '{}'); } catch (e) {}
  var activeId = null;

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

  function renderMain(project) {
    mainEl.innerHTML = '';

    var eyebrow = document.createElement('p');
    eyebrow.className = 'pr-eyebrow';
    eyebrow.textContent = project.skill;
    mainEl.appendChild(eyebrow);

    var h1 = document.createElement('h1');
    h1.className = 'pr-h1';
    h1.textContent = project.title;
    mainEl.appendChild(h1);

    var spec = document.createElement('div');
    spec.className = 'pr-spec';
    spec.innerHTML = project.spec;
    mainEl.appendChild(spec);

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

    var editor = document.createElement('textarea');
    editor.className = 'pr-editor';
    editor.spellcheck = false;
    editor.value = loadSavedCode(project.id, project.starter);
    editor.addEventListener('input', function () { saveCode(project.id, editor.value); });
    editor.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        var start = editor.selectionStart, end = editor.selectionEnd;
        editor.value = editor.value.slice(0, start) + '    ' + editor.value.slice(end);
        editor.selectionStart = editor.selectionEnd = start + 4;
      }
    });
    wrap.appendChild(editor);
    mainEl.appendChild(wrap);

    var status = document.createElement('p');
    status.className = 'pr-status';
    status.hidden = true;
    mainEl.appendChild(status);

    var results = document.createElement('div');
    results.className = 'pr-results';
    mainEl.appendChild(results);

    function setStatus(text, isError) {
      status.hidden = !text;
      status.textContent = text || '';
      status.className = 'pr-status' + (isError ? ' error' : '');
    }

    function runRaw() {
      if (project.language === 'javascript') return runJSRaw(editor.value);
      if (project.language === 'python') return runPythonRaw(editor.value);
      if (project.language === 'sql') return runSqlRaw(editor.value, project);
      return Promise.reject(new Error('Unsupported language: ' + project.language));
    }

    function runTests() {
      if (project.language === 'javascript') return runJSTests(editor.value, project);
      if (project.language === 'python') return runPythonTests(editor.value, project);
      if (project.language === 'sql') return runSqlTests(editor.value, project);
      return Promise.reject(new Error('Unsupported language: ' + project.language));
    }

    runBtn.addEventListener('click', function () {
      runBtn.disabled = true;
      submitBtn.disabled = true;
      setStatus(project.language === 'python' && !pyodidePromise ? 'Loading Python (first run only)\u2026' : 'Running\u2026');
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
      setStatus(project.language === 'python' && !pyodidePromise ? 'Loading Python (first run only)\u2026' : 'Running tests\u2026');
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
