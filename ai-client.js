(function () {
  var STORAGE_KEY = 'trefelle_ai_setup';

  function loadKeyStack() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var ans = raw ? JSON.parse(raw) : null;
      return (ans && ans.keyStack) || [];
    } catch (e) { return []; }
  }

  function aiAvailable(ans) {
    return !!(ans && ans.keyStack && ans.keyStack.length);
  }

  // Same fixed temperature on every provider, so models don't quietly disagree on it.
  var CALL_TEMPERATURE = 0.4;

  function checkResponse(res) {
    if (!res.ok) throw new Error('http ' + res.status);
    return res;
  }

  function callAnthropic(entry, messages, signal) {
    var system = messages.filter(function (m) { return m.role === 'system'; }).map(function (m) { return m.content; }).join('\n');
    var rest = messages.filter(function (m) { return m.role !== 'system'; });
    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', signal: signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': entry.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({ model: entry.byokModel, max_tokens: 700, temperature: CALL_TEMPERATURE, system: system, messages: rest })
    }).then(checkResponse).then(function (res) { return res.json(); }).then(function (data) {
      var text = data.content && data.content[0] && data.content[0].text;
      if (!text) throw new Error('empty response');
      return text;
    });
  }

  function callOpenAICompatible(entry, messages, signal) {
    var headers = { 'Content-Type': 'application/json' };
    if (entry.apiKey) headers.Authorization = 'Bearer ' + entry.apiKey;
    return fetch(entry.byokEndpoint, {
      method: 'POST', signal: signal, headers: headers,
      body: JSON.stringify({ model: entry.byokModel, messages: messages, temperature: CALL_TEMPERATURE })
    }).then(checkResponse).then(function (res) { return res.json(); }).then(function (data) {
      var text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (!text) throw new Error('empty response');
      return text;
    });
  }

  // The only WebLLM-prebuilt model that both reasons and fits a consumer
  // GPU -- 1.5B distills were dropped upstream for correctness issues, and
  // nothing else in the prebuilt list reasons at all (mlc-ai/web-llm#762).
  var WEBLLM_MODEL_ID = 'DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC';
  var webllmEnginePromise = null;

  function getWebLLMEngine(onProgress) {
    if (webllmEnginePromise) return webllmEnginePromise;
    webllmEnginePromise = import('https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm/+esm').then(function (mod) {
      return mod.CreateMLCEngine(WEBLLM_MODEL_ID, {
        initProgressCallback: onProgress || function () {}
      });
    }).catch(function (err) {
      webllmEnginePromise = null;
      throw err;
    });
    return webllmEnginePromise;
  }

  function callWebLLM(entry, messages, signal) {
    return getWebLLMEngine().then(function (engine) {
      if (signal && signal.aborted) throw new DOMException('Aborted', 'AbortError');
      return engine.chat.completions.create({ messages: messages, temperature: CALL_TEMPERATURE });
    }).then(function (data) {
      var text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (!text) throw new Error('empty response');
      return text;
    });
  }

  // A request to a private address can hang instead of failing fast (a proxy
  // or firewall silently dropping it rather than refusing the connection),
  // so each attempt is capped with its own timeout.
  function fetchWithTimeout(url, ms) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, ms);
    return fetch(url, { signal: controller.signal }).then(function (res) {
      clearTimeout(timer);
      return res;
    }, function (err) {
      clearTimeout(timer);
      throw err;
    });
  }

  // Tries the OpenAI-style /v1/models list first, then Ollama's native
  // /api/tags -- covers the two most common local-server shapes without
  // needing the person to say which one they're running.
  function discoverLocalModels(endpoint) {
    var modelsUrl = endpoint.replace(/\/?chat\/completions\/?$/, '/models');
    var tagsUrl = null;
    try { tagsUrl = new URL(endpoint).origin + '/api/tags'; } catch (e) {}

    function tryOpenAIStyle() {
      return fetchWithTimeout(modelsUrl, 4000).then(checkResponse).then(function (res) { return res.json(); }).then(function (data) {
        var list = (data.data || []).map(function (m) { return m.id; }).filter(Boolean);
        if (!list.length) throw new Error('no models');
        return list;
      });
    }
    function tryOllamaStyle() {
      if (!tagsUrl) return Promise.reject(new Error('no local origin'));
      return fetchWithTimeout(tagsUrl, 4000).then(checkResponse).then(function (res) { return res.json(); }).then(function (data) {
        var list = (data.models || []).map(function (m) { return m.name; }).filter(Boolean);
        if (!list.length) throw new Error('no models');
        return list;
      });
    }
    return tryOpenAIStyle().catch(tryOllamaStyle);
  }

  function callWithEntry(entry, messages, signal) {
    if (entry.provider === 'webllm') return callWebLLM(entry, messages, signal);
    return entry.provider === 'anthropic' ? callAnthropic(entry, messages, signal) : callOpenAICompatible(entry, messages, signal);
  }

  function callAI(stack, messages, signal) {
    stack = stack || [];
    if (!stack.length) return Promise.reject(new Error('No AI model connected'));
    function tryIndex(i, lastErr) {
      if (i >= stack.length) return Promise.reject(lastErr || new Error('every connected key failed'));
      return callWithEntry(stack[i], messages, signal).catch(function (err) {
        if (err && err.name === 'AbortError') throw err;
        return tryIndex(i + 1, err);
      });
    }
    return tryIndex(0);
  }

  window.TrefelleAI = {
    loadKeyStack: loadKeyStack,
    aiAvailable: aiAvailable,
    callAI: callAI,
    callWithEntry: callWithEntry,
    getWebLLMEngine: getWebLLMEngine,
    discoverLocalModels: discoverLocalModels,
    CALL_TEMPERATURE: CALL_TEMPERATURE,
    WEBLLM_MODEL_ID: WEBLLM_MODEL_ID
  };
})();
