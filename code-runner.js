(function () {
  var PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.js';
  var SQLJS_BASE = 'https://cdn.jsdelivr.net/npm/sql.js@1.14.2/dist/';

  function loadScriptOnce(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) { resolve(); return; }
      var s = document.createElement('script');
      s.src = src;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Couldn’t load ' + src)); };
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

  // ---- JavaScript: runs in a Worker so a bad loop can't freeze the page ----
  function runJSWorker(script, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var blob = new Blob([script], { type: 'application/javascript' });
      var url = URL.createObjectURL(blob);
      var worker = new Worker(url);
      var timer = setTimeout(function () {
        worker.terminate();
        reject(new Error('Timed out after ' + (timeoutMs / 1000) + 's — check for an infinite loop.'));
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

  // ---- SQL: runs against an in-memory SQLite database via sql.js. `schema`
  // is optional -- pass it to seed tables first, or omit it to run `code`
  // as one self-contained script (CREATE/INSERT/SELECT all together).
  function runSqlRaw(code, schema) {
    return getSqlJs().then(function (SQL) {
      var db = new SQL.Database();
      if (schema) db.run(schema);
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

  window.TrefelleRunner = {
    getPyodide: getPyodide,
    getSqlJs: getSqlJs,
    runJSWorker: runJSWorker,
    runJSRaw: runJSRaw,
    runPythonRaw: runPythonRaw,
    runSqlRaw: runSqlRaw,
    hasStartedPyodide: function () { return !!pyodidePromise; }
  };
})();
