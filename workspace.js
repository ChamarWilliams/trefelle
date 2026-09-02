(function () {
  var STORAGE_KEY = 'trefelle_ai_setup';
  var stage = document.getElementById('stage');
  var backBtn = document.getElementById('backBtn');
  var answers = {};
  var history = [];
  var currentId = null;

  function saveAnswers() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(answers)); } catch (e) {}
  }
  function loadAnswers() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function clearAnswers() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  var FIELD_CATALOG = [
    { id: 'backend', name: 'Backend / APIs', demand: 'Very high', pay: '$85k – $170k+', blurb: 'You build the services, data models, and APIs that everything else depends on. Correctness and reliability matter more than pixels.' },
    { id: 'frontend', name: 'Frontend', demand: 'High', pay: '$75k – $155k+', blurb: 'You turn designs and data into interfaces people actually use — performance, accessibility, and state management are the daily craft.' },
    { id: 'fullstack', name: 'Full-stack', demand: 'Very high', pay: '$80k – $165k+', blurb: 'You move across the whole stack — comfortable enough in the backend and the UI to ship a feature end to end.' },
    { id: 'data', name: 'Data / ML', demand: 'High', pay: '$95k – $190k+', blurb: 'You work with pipelines, models, and the messy data behind them — equal parts engineering and statistics.' },
    { id: 'infra', name: 'Infra / DevOps', demand: 'High', pay: '$95k – $175k+', blurb: 'You build the platform other engineers ship on top of — CI/CD, cloud infrastructure, observability, and uptime.' },
    { id: 'security', name: 'Security', demand: 'Very high', pay: '$100k – $185k+', blurb: 'You think like an attacker to defend systems — from code review to incident response.' },
    { id: 'mobile', name: 'Mobile', demand: 'Moderate', pay: '$85k – $165k+', blurb: 'You build native or cross-platform apps, working closely with OS constraints, performance, and app-store realities.' },
    { id: 'product-ux', name: 'Product / UX design', demand: 'Moderate', pay: '$75k – $150k+', blurb: 'You shape how the product feels to use — research, flows, and the handoff between design and engineering.' },
    { id: 'mechanical', name: 'Mechanical Engineering', demand: 'High', pay: '$70k – $130k+', blurb: 'You design, analyze, and test physical systems and machines — from prototypes to production, using physics as much as code.' },
    { id: 'civil', name: 'Civil Engineering', demand: 'Moderate', pay: '$65k – $120k+', blurb: 'You design and oversee infrastructure — buildings, roads, bridges, water systems — balancing safety, cost, and regulation.' },
    { id: 'electrical', name: 'Electrical Engineering', demand: 'High', pay: '$75k – $140k+', blurb: 'You design circuits, power systems, and embedded hardware — the physical layer everything else runs on top of.' },
    { id: 'aerospace', name: 'Aerospace Engineering', demand: 'Moderate', pay: '$80k – $145k+', blurb: 'You design and test aircraft, spacecraft, and the systems that keep them flying safely.' },
    { id: 'biomedical', name: 'Biomedical Engineering', demand: 'Moderate', pay: '$70k – $125k+', blurb: 'You apply engineering to medicine — devices, diagnostics, and systems that directly affect patient care.' }
  ];

  var ROLE_TEMPLATES = {
    backend: [
      { title: 'Backend Engineer', blurb: 'Own services and APIs end to end — schema design, correctness, and performance under load.' },
      { title: 'Platform Engineer', blurb: 'Build the internal tools and services other backend teams depend on.' },
      { title: 'API Developer', blurb: 'Design and maintain the APIs that other systems integrate with.' }
    ],
    frontend: [
      { title: 'Frontend Engineer', blurb: 'Build and maintain the interfaces users interact with daily.' },
      { title: 'UI Engineer', blurb: 'Focus on component systems, performance, and pixel-accurate implementation.' },
      { title: 'Web Platform Engineer', blurb: 'Work on shared frontend infrastructure — build tooling, performance, accessibility.' }
    ],
    fullstack: [
      { title: 'Full-Stack Engineer', blurb: 'Ship features end to end, from the database to the UI.' },
      { title: 'Product Engineer', blurb: 'Work closely with product and design to build and iterate on user-facing features.' },
      { title: 'Startup Generalist Engineer', blurb: 'Wear many hats — whatever the product needs this week.' }
    ],
    data: [
      { title: 'Data Engineer', blurb: 'Build and maintain the pipelines that move and shape data reliably.' },
      { title: 'Machine Learning Engineer', blurb: 'Take models from notebook to production, and keep them running well.' },
      { title: 'Analytics Engineer', blurb: 'Turn raw data into trustworthy, well-modeled datasets others can build on.' }
    ],
    infra: [
      { title: 'DevOps Engineer', blurb: 'Build and maintain the CI/CD pipelines and infrastructure teams ship through.' },
      { title: 'Site Reliability Engineer', blurb: 'Keep production systems up, fast, and observable — and learn from what breaks.' },
      { title: 'Cloud Infrastructure Engineer', blurb: 'Design and manage the cloud infrastructure everything else runs on.' }
    ],
    security: [
      { title: 'Application Security Engineer', blurb: 'Find and fix vulnerabilities before they ship — code review, threat modeling, testing.' },
      { title: 'Security Engineer', blurb: 'Defend systems and respond when something goes wrong.' },
      { title: 'Security Analyst', blurb: 'Monitor, investigate, and triage security signals across the org.' }
    ],
    mobile: [
      { title: 'Mobile Engineer', blurb: 'Build and ship native or cross-platform mobile apps.' },
      { title: 'iOS Engineer', blurb: 'Focus on the Apple ecosystem — Swift, performance, App Store realities.' },
      { title: 'Android Engineer', blurb: 'Focus on the Android ecosystem — Kotlin, device fragmentation, performance.' }
    ],
    'product-ux': [
      { title: 'Product Designer', blurb: 'Shape flows, research, and the details of how the product feels to use.' },
      { title: 'UX Engineer', blurb: 'Sit between design and engineering — prototyping and polishing the handoff.' },
      { title: 'Product Manager', blurb: 'Decide what gets built and why, working closely with engineering and design.' }
    ],
    mechanical: [
      { title: 'Mechanical Design Engineer', blurb: 'Design and prototype mechanical components and systems using CAD and physical testing.' },
      { title: 'Manufacturing Engineer', blurb: 'Optimize how physical products are actually built, from process to tooling.' },
      { title: 'Product Development Engineer', blurb: 'Take a mechanical concept from sketch to a tested, manufacturable product.' }
    ],
    civil: [
      { title: 'Civil Engineer', blurb: 'Design and oversee infrastructure projects — from concept through construction.' },
      { title: 'Structural Engineer', blurb: 'Ensure buildings and structures can safely carry the loads they’re built for.' },
      { title: 'Transportation Engineer', blurb: 'Design roads, transit, and traffic systems that move people safely and efficiently.' }
    ],
    electrical: [
      { title: 'Electrical Engineer', blurb: 'Design and test circuits, power systems, and hardware.' },
      { title: 'Embedded Systems Engineer', blurb: 'Write the firmware that runs directly on hardware.' },
      { title: 'Hardware Engineer', blurb: 'Design the physical boards and components that power electronic products.' }
    ],
    aerospace: [
      { title: 'Aerospace Engineer', blurb: 'Design and analyze aircraft or spacecraft systems and structures.' },
      { title: 'Flight Test Engineer', blurb: 'Plan and run the tests that validate a vehicle actually flies as designed.' },
      { title: 'Propulsion Engineer', blurb: 'Design and test the systems that power flight.' }
    ],
    biomedical: [
      { title: 'Biomedical Engineer', blurb: 'Design medical devices and systems that directly affect patient outcomes.' },
      { title: 'Clinical Systems Engineer', blurb: 'Bridge engineering and healthcare delivery — deploying and maintaining medical technology.' },
      { title: 'R&D Engineer, Medical Devices', blurb: 'Research and prototype the next generation of medical devices.' }
    ],
    custom: [
      { title: 'Explore this on your own', blurb: 'There’s no role ladder for a custom field yet — specify a role directly instead.' }
    ]
  };

  var LEVEL_PREFIX = { student: 'Junior ', early: 'Junior ', mid: '', senior: 'Senior ' };

  function fieldWhy(id, ans) {
    var matched = (ans.interests || []).some(function (label) {
      var f = FIELD_CATALOG.filter(function (x) { return x.name === label; })[0];
      return f && f.id === id;
    });
    return matched ? 'You told us this is one of your interests.' : 'A close fit based on how you like to work.';
  }

  function computeFieldRecommendations(ans) {
    var scores = {};
    FIELD_CATALOG.forEach(function (f) { scores[f.id] = 0; });
    (ans.interests || []).forEach(function (label) {
      var match = FIELD_CATALOG.filter(function (f) { return f.name === label; })[0];
      if (match) scores[match.id] += 3;
    });
    function bump(id, amt) { if (scores[id] !== undefined) scores[id] += amt; }
    if (ans.learningStyle === 'visual') { bump('frontend', 1); bump('product-ux', 1); }
    if (ans.learningStyle === 'reading') { bump('backend', 1); bump('security', 1); }
    if (ans.learningStyle === 'verbal') { bump('product-ux', 0.5); }
    if (ans.learningStyle === 'example') { bump('data', 1); }
    if (ans.debugStyle === 'search') { bump('infra', 0.5); }
    if (ans.debugStyle === 'read') { bump('backend', 0.5); bump('security', 0.5); }
    if (ans.ambiguityStyle === 'clarify') { bump('product-ux', 0.5); }
    if (ans.incidentComfort === 'oncall' || ans.incidentComfort === 'handled') { bump('infra', 1); bump('security', 0.5); }

    var ranked = FIELD_CATALOG.filter(function (f) { return scores[f.id] > 0; })
      .sort(function (a, b) { return scores[b.id] - scores[a.id]; });

    var results = ranked.slice(0, 3).map(function (f) {
      return { id: f.id, name: f.name, demand: f.demand, pay: f.pay, blurb: f.blurb, why: fieldWhy(f.id, ans) };
    });

    if (!results.length) {
      results = FIELD_CATALOG.slice(0, 3).map(function (f) {
        return { id: f.id, name: f.name, demand: f.demand, pay: f.pay, blurb: f.blurb, why: 'A broad starting point while you explore.' };
      });
    }

    if (ans.customInterest) {
      results.unshift({ id: 'custom', name: ans.customInterest, demand: 'Not tracked', pay: 'Varies', blurb: 'A field you typed in yourself — we don’t have benchmark data for it yet, but it’s saved as an option.', why: 'You told us this is what you’re after.' });
    }
    return results.slice(0, 3);
  }

  function computeRoleRecommendations(fieldId, ans) {
    var templates = ROLE_TEMPLATES[fieldId] || ROLE_TEMPLATES.fullstack;
    var prefix = LEVEL_PREFIX[ans.level] || '';
    return templates.map(function (t) { return { title: prefix + t.title, blurb: t.blurb }; });
  }

  var QUESTION_FORMATS = 'Respond with ONLY strict JSON, nothing else, no markdown fences, no prose outside the JSON.\nPrefer small interactive exercises over asking directly whenever one would fit — a self-reported answer to "are you organized?" is easy to answer aspirationally; watching someone rank, stack, sort, tap, or allocate under a lightly-framed prompt reveals it more honestly, because they are not consciously aware of exactly what the exercise is measuring. Reach for "stack", "sort", "tiles", "allocate", or "quickpick" first; use "choice" only when you genuinely need to compare a few named options head-on, and "text" or "slider" when only their own words or a spectrum position would reveal something else. Do not lean on "choice" as the default. You can also use a second exercise to quietly cross-check an earlier answer that felt uncertain or too clean.\nPrefer closed hypotheticals over questions about their actual real life. Do not ask "what are your top tasks today" or anything else that requires them to expose real personal or work details — most people are more comfortable, and more honest, answering "imagine X situation, what would you do" than being asked to describe their own life. Build a specific fictional-but-plausible scenario ("you\'ve just joined a team and inherit a system with no documentation," "a client calls saying the product broke right before a demo") and ask what they\'d do inside it. EVERY question needs its own new scenario — never reuse the same premise you just used for the previous question, even in a different format. If you already asked about "joining a team and inheriting an undocumented system" once, that premise is now spent — the next question needs a genuinely different situation, not the same one wrapped in a different exercise type. Repeating a premise teaches you nothing new and wastes a question. The items inside any exercise must be concrete and specific to that invented scenario — never generic productivity-app filler like "reply to email," "grocery shopping," "dinner with friends," or a bland real-life to-do list. Either build on something they already said in this conversation, or invent something specific to real technical/engineering work (a specific kind of bug, a specific kind of decision, a specific trade-off) inside a hypothetical scenario — something that could only belong in an assessment for their field, not a life-admin app, and never a direct ask about their actual day.\nStack — a vertical list they physically drag to reorder, top to bottom; this is the premium version of ranking and should be your default choice for any ranking exercise: {"type":"question","format":"stack","eyebrow":"SHORT LABEL","question":"...","instruction":"a short framing like \'Drag to put these in the order you\'d actually reach for them\'","items":["item 1","item 2","item 3","item 4","item 5"]}\nRank — a lighter-weight tap-in-order version of the same idea, for when a full drag-to-reorder stack would be overkill: {"type":"question","format":"rank","eyebrow":"SHORT LABEL","question":"...","instruction":"...","items":["item 1","item 2","item 3","item 4"]}\nSort — they drag items into one of two boxes; which box, and the order they sort in, is the signal: {"type":"question","format":"sort","eyebrow":"SHORT LABEL","question":"...","boxA":"label for box A","boxB":"label for box B","items":["item 1","item 2","item 3","item 4","item 5"]}\nTiles — they tap as many or as few as resonate, no forced order or count; good for gauging what genuinely pulls them without asking outright: {"type":"question","format":"tiles","eyebrow":"SHORT LABEL","question":"...","instruction":"optional short framing","items":["item 1","item 2","item 3","item 4","item 5","item 6"]}\nAllocate — they distribute a fixed pool of points across a few buckets, revealing relative priority instead of a single pick: {"type":"question","format":"allocate","eyebrow":"SHORT LABEL","question":"...","points":10,"buckets":["bucket 1","bucket 2","bucket 3","bucket 4"]}\nQuickpick — looks like an ordinary multiple-choice question, but reaction time is measured invisibly; use it when hesitation itself (gut instinct vs deliberation) is the interesting signal — never tell the user timing is involved: {"type":"question","format":"quickpick","eyebrow":"SHORT LABEL","question":"...","options":["...","...","...","..."]}\nMultiple choice, only when comparing a few genuinely distinct named approaches: {"type":"question","format":"choice","eyebrow":"SHORT LABEL","question":"...","options":["...","...","...","..."]}\nOpen-ended, only when their own words would reveal something no list or exercise could: {"type":"question","format":"text","eyebrow":"SHORT LABEL","question":"...","placeholder":"short example of the kind of answer you want"}\nSlider, for a spectrum between two opposing traits: {"type":"question","format":"slider","eyebrow":"SHORT LABEL","question":"...","minLabel":"left end of the spectrum","maxLabel":"right end of the spectrum"}\nIf someone gives a vague or uncertain answer, don’t just move on — dig deeper on the same topic, ideally with a different exercise than before, rather than repeating the same format.\nEvery ranking, sorting, or dragging exercise has a "none of these apply to me" escape hatch — expect people to use it when your items assumed something untrue about their life (a job they don\'t have, tasks they don\'t do). If that happens, do not repeat a similar exercise with similarly guessed items — switch to something more open-ended ("text") or more clearly scoped to what you actually know about them, and treat the mismatch itself as a signal you guessed wrong about their situation.';

  var PERSONALITY_PROMPT = 'You are an intake assessor for Trefelle, a hands-on career-exploration platform. Right now your ONLY goal is to understand how this specific person thinks, solves problems, handles ambiguity, and learns best — their personality and learning style. You must INFER all of this — never ask about it directly. Never ask "how do you prefer to learn?", "are you a visual learner?", "what is your learning style?", or any variant — that is a meta-question about the thing you are trying to measure, and self-report on it is nearly worthless. Instead, put them inside a concrete, specific, slightly odd little HYPOTHETICAL scenario or exercise and watch what they actually do — order, timing, which box something lands in, what they reach for first — then draw the conclusion yourself afterward; they should never be able to guess what trait a given exercise is measuring. Prefer a closed hypothetical ("imagine X happens, what would you do") over any question that asks about their actual real life or day — people answer more honestly, and feel more comfortable, responding inside a fictional scenario than being asked to expose real personal details. Avoid generic template exercises ("sort these by energy," "rank your tasks for today") — invent a specific fictional-but-plausible situation vivid enough that it could only have come from this conversation, ideally building on something they already said. This is NOT about picking a technical field yet, and it is not a fixed script — invent whatever exercise, in whatever order, actually gets you there fastest for THIS person. Aim for around 10 questions total, but if you are still genuinely unsure after 10, keep going — accuracy matters more than speed. Stop as soon as you have a confident, specific picture.\n' + QUESTION_FORMATS + '\nWhen confident, respond with exactly: {"type":"done","summary":"2-3 sentence summary of how they think, solve problems, and learn — written as your own inference, not as if they told you","learningStyle":"short label","workStyle":"short label"}';

  var FIELDS_PROMPT_BASE = 'Your goal now is to determine which specific field(s) and roles genuinely fit this person. The scope is EVERY STEM and technical discipline, not a short list — software, data science, mechanical, electrical, civil, aerospace, biomedical, chemical, industrial, materials science, environmental engineering, robotics, nuclear, marine/ocean engineering, mining, geology and earth science, agriculture and agtech, energy systems, physics, mathematics and statistics, actuarial work, network and telecom engineering, pharma and biotech, manufacturing, and anything else STEM or technical — including ones not listed here. Never default to software unless it genuinely fits best.\nField and career stage are FACTS, not personality traits — you have already been told which broad field they\'re interested in and their career stage below; these were asked directly before you started, so never ask about either again. Use them as the fixed setting for every hypothetical you build from here on — a hypothetical for an undergrad mechanical engineering student should look nothing like one for a working professional in biomedical devices, and a scenario that assumes the wrong field wastes the question entirely.\nIf their stage is "graduated and/or working professionally," dig further with direct factual questions (job title, how many years, do they hold a degree or certifications and in what) before you rely on any exercise result to justify "mid" or "senior" — a job title and years of real experience is what earns "mid" or "senior", credentials and confidence alone are not enough. If their stage is "haven\'t started a degree yet" or "undergrad," the level is "student" or "early" respectively unless they describe real professional work on top of that — do not round up.\nWithin the given field and stage, keep narrowing toward a specific sub-field and concrete role (e.g. not just "mechanical," but which corner: thermal systems, robotics, manufacturing, automotive, aerospace structures) and keep verifying claims with small exercises scoped to that exact field and stage — never reuse a scenario you already asked about, even for a different exercise type, and never repeat the same item twice within one exercise\'s list.\nAim for around 15 to 20 questions total, but if you are still genuinely unsure after that, keep going — accuracy matters more than speed. Stop as soon as you are confident.\n' + QUESTION_FORMATS + '\nWhen confident, respond with exactly: {"type":"done","level":"student|early|mid|senior","fields":[{"name":"Field name","why":"one sentence on why this fits them","blurb":"one sentence describing the field","demand":"rough demand label","pay":"rough pay range","roles":[{"title":"role title","blurb":"one sentence"},{"title":"role title","blurb":"one sentence"},{"title":"role title","blurb":"one sentence"}]}]} with up to 3 fields ranked best fit first.';

  var MAX_RESUME_BYTES = 5 * 1024 * 1024;

  function loadScriptOnce(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) { resolve(); return; }
      var s = document.createElement('script');
      s.src = src;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Couldn’t load a required library — check your connection and try again.')); };
      document.head.appendChild(s);
    });
  }

  function extractResumeText(file) {
    var name = (file.name || '').toLowerCase();
    if (name.endsWith('.txt')) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function () { resolve(String(reader.result || '')); };
        reader.onerror = function () { reject(new Error('Couldn’t read that file — try pasting the text instead.')); };
        reader.readAsText(file);
      });
    }
    if (name.endsWith('.pdf')) {
      return loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js').then(function () {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        return file.arrayBuffer();
      }).then(function (buf) {
        return window.pdfjsLib.getDocument({ data: buf }).promise;
      }).then(function (pdf) {
        var pageNums = [];
        for (var i = 1; i <= pdf.numPages; i++) pageNums.push(i);
        return pageNums.reduce(function (chain, pageNum) {
          return chain.then(function (acc) {
            return pdf.getPage(pageNum).then(function (page) { return page.getTextContent(); }).then(function (content) {
              acc.push(content.items.map(function (it) { return it.str; }).join(' '));
              return acc;
            });
          });
        }, Promise.resolve([])).then(function (pages) { return pages.join('\n'); });
      });
    }
    if (name.endsWith('.docx')) {
      return loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js').then(function () {
        return file.arrayBuffer();
      }).then(function (buf) {
        return window.mammoth.extractRawText({ arrayBuffer: buf });
      }).then(function (result) {
        return result.value || '';
      });
    }
    if (name.endsWith('.doc')) {
      return Promise.reject(new Error('.doc files aren’t supported — save as .docx or .pdf, or paste the text instead.'));
    }
    return Promise.reject(new Error('Unsupported file type — use .pdf, .docx, or .txt, or paste the text instead.'));
  }

  function slugify(s) {
    return (s || 'field').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'field';
  }

  function parseAIJson(text) {
    var cleaned = String(text || '').trim().replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    var start = cleaned.indexOf('{');
    var end = cleaned.lastIndexOf('}');
    if (start > -1 && end > start) cleaned = cleaned.slice(start, end + 1);
    try { return JSON.parse(cleaned); } catch (e) {}
    var repaired = cleaned
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/'([a-zA-Z0-9_]+)'\s*:/g, '"$1":')
      .replace(/:\s*'([^']*)'/g, ':"$1"');
    try { return JSON.parse(repaired); } catch (e) { return null; }
  }

  function normalizeAIResponse(data) {
    if (!data || typeof data !== 'object') return null;
    if (data.type === 'question' || data.type === 'done') return data;
    if (data.fields || data.level || (data.summary && (data.learningStyle || data.workStyle))) {
      data.type = 'done';
      return data;
    }
    var q = data.question || data.text || data.prompt;
    if (q) {
      data.type = 'question';
      data.question = q;
      if (!data.format) {
        if (data.options || data.choices) { data.format = 'choice'; data.options = data.options || data.choices; }
        else if (data.boxA || data.boxB) { data.format = 'sort'; }
        else if (data.buckets || data.points) { data.format = 'allocate'; }
        else if (data.minLabel || data.maxLabel) { data.format = 'slider'; }
        else if (data.items) { data.format = 'rank'; }
        else { data.format = 'text'; }
      }
      return data;
    }
    return null;
  }

  function aiAvailable(ans) {
    if (ans.engine === 'local') return !!ans.serverAddress && !!ans.localModel;
    if (ans.engine === 'byok') {
      if (!ans.apiKey) return false;
      return ans.provider === 'openai' || ans.provider === 'anthropic' || (ans.provider === 'other' && !!ans.byokEndpoint);
    }
    return false;
  }

  function callOpenAICompatible(url, apiKey, messages, signal) {
    var headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers.Authorization = 'Bearer ' + apiKey;
    return fetch(url, {
      method: 'POST', headers: headers, signal: signal,
      body: JSON.stringify({ model: answers.localModel || 'gpt-4o-mini', messages: messages, temperature: 0.4 })
    }).then(function (res) {
      if (!res.ok) throw new Error('http ' + res.status);
      return res.json();
    }).then(function (data) {
      var text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (!text) throw new Error('empty response');
      return text;
    });
  }

  function callAnthropic(messages, signal) {
    var system = messages.filter(function (m) { return m.role === 'system'; }).map(function (m) { return m.content; }).join('\n');
    var rest = messages.filter(function (m) { return m.role !== 'system'; }).map(function (m) { return { role: m.role, content: m.content }; });
    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', signal: signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': answers.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({ model: 'claude-3-5-haiku-latest', max_tokens: 700, system: system, messages: rest })
    }).then(function (res) {
      if (!res.ok) throw new Error('http ' + res.status);
      return res.json();
    }).then(function (data) {
      var text = data.content && data.content[0] && data.content[0].text;
      if (!text) throw new Error('empty response');
      return text;
    });
  }

  function callLocal(messages, signal) {
    var base = (answers.serverAddress || '').replace(/\/+$/, '');
    if (answers.runtime === 'ollama') {
      return fetch(base + '/api/chat', {
        method: 'POST', signal: signal, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: answers.localModel, messages: messages, stream: false, format: 'json' })
      }).then(function (res) {
        if (!res.ok) throw new Error('http ' + res.status);
        return res.json();
      }).then(function (data) {
        var text = data.message && data.message.content;
        if (!text) throw new Error('empty response');
        return text;
      });
    }
    return callOpenAICompatible(base + '/v1/chat/completions', null, messages, signal);
  }

  function callAI(messages, signal) {
    if (answers.engine === 'local' && answers.serverAddress && answers.localModel) return callLocal(messages, signal);
    if (answers.engine === 'byok' && answers.apiKey) {
      if (answers.provider === 'anthropic') return callAnthropic(messages, signal);
      if (answers.provider === 'other' && answers.byokEndpoint) return callOpenAICompatible(answers.byokEndpoint, answers.apiKey, messages, signal);
      return callOpenAICompatible('https://api.openai.com/v1/chat/completions', answers.apiKey, messages, signal);
    }
    return Promise.reject(new Error('No AI model connected'));
  }

  function renderAIFlow(el, cfg) {
    if (!aiAvailable(answers)) {
      var note = document.createElement('p');
      note.className = 'setup-note';
      note.textContent = 'No connected AI model yet — using the standard question set instead.';
      el.appendChild(note);
      setTimeout(function () { go(cfg.fallbackStepId, true); }, 900);
      return;
    }

    var body = document.createElement('div');
    el.appendChild(body);
    var conversation = [{ role: 'system', content: cfg.systemPrompt }];
    var count = 0;
    var controller = null;
    var slowTimer = null;
    var cycleTimer = null;
    var FIRST_MESSAGES = ['Reading your answers…', 'Getting to know you…', 'Warming up your model…'];
    var NEXT_MESSAGES = ['Thinking of a good question…', 'Weighing what you just said…', 'Still thinking…', 'Almost there…'];

    function clearSlowTimer() { if (slowTimer) { clearTimeout(slowTimer); slowTimer = null; } }
    function clearCycleTimer() { if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; } }

    function renderLoading(isFirst) {
      body.innerHTML = '';
      var eyebrow = document.createElement('p');
      eyebrow.className = 'step-eyebrow';
      eyebrow.textContent = cfg.eyebrow;
      body.appendChild(eyebrow);
      var wrap = document.createElement('div');
      wrap.className = 'ai-loading';
      var dots = document.createElement('span');
      dots.className = 'ai-dots';
      dots.appendChild(document.createElement('span'));
      dots.appendChild(document.createElement('span'));
      dots.appendChild(document.createElement('span'));
      var text = document.createElement('span');
      var pool = isFirst ? FIRST_MESSAGES : NEXT_MESSAGES;
      var i = 0;
      text.textContent = pool[0];
      wrap.appendChild(dots);
      wrap.appendChild(text);
      body.appendChild(wrap);

      clearCycleTimer();
      cycleTimer = setInterval(function () {
        i = (i + 1) % pool.length;
        text.textContent = pool[i];
      }, 3200);

      var actions = document.createElement('div');
      actions.className = 'setup-actions setup-actions-hidden';
      actions.style.display = 'none';
      body.appendChild(actions);
      clearSlowTimer();
      slowTimer = setTimeout(function () { actions.style.display = 'flex'; }, 12000);
      actions.appendChild(button('Taking too long — use standard questions', 'setup-secondary', function () {
        clearSlowTimer();
        clearCycleTimer();
        if (controller) controller.abort();
        go(cfg.fallbackStepId, true);
      }));
    }

    function renderError(msg, rawText) {
      clearSlowTimer();
      clearCycleTimer();
      body.innerHTML = '';
      var p = document.createElement('p');
      p.className = 'setup-note error';
      p.textContent = msg;
      body.appendChild(p);
      if (rawText) {
        var pre = document.createElement('pre');
        pre.className = 'ai-raw';
        pre.textContent = String(rawText).slice(0, 600);
        body.appendChild(pre);
      }
      var actions = document.createElement('div');
      actions.className = 'setup-actions';
      actions.appendChild(button('Try again', 'setup-primary', function () { step(); }));
      actions.appendChild(button('Use standard questions instead', 'setup-secondary', function () { go(cfg.fallbackStepId, true); }));
      body.appendChild(actions);
    }

    function recordAnswer(q, answerText) {
      conversation.push({ role: 'assistant', content: JSON.stringify(q) });
      conversation.push({ role: 'user', content: answerText });
      count++;
      step();
    }

    function renderQuestion(q) {
      clearSlowTimer();
      clearCycleTimer();
      body.innerHTML = '';
      var eyebrow = document.createElement('p');
      eyebrow.className = 'step-eyebrow';
      eyebrow.textContent = q.eyebrow || cfg.eyebrow;
      body.appendChild(eyebrow);
      var h1 = document.createElement('h1');
      h1.textContent = q.question;
      body.appendChild(h1);

      var format = q.format || 'choice';

      if (format === 'text') {
        var form = document.createElement('form');
        form.className = 'setup-field';
        var textarea = document.createElement('textarea');
        textarea.placeholder = q.placeholder || 'Type your answer…';
        form.appendChild(textarea);
        var tActions = document.createElement('div');
        tActions.className = 'setup-actions';
        var submit = document.createElement('button');
        submit.type = 'submit';
        submit.className = 'setup-primary';
        submit.textContent = 'Continue';
        tActions.appendChild(submit);
        form.appendChild(tActions);
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          recordAnswer(q, textarea.value.trim() || '(skipped)');
        });
        body.appendChild(form);
        setTimeout(function () { textarea.focus(); }, 200);
      } else if (format === 'slider') {
        var sWrap = document.createElement('div');
        sWrap.className = 'setup-slider';
        var valueDisplay = document.createElement('div');
        valueDisplay.className = 'slider-value';
        valueDisplay.textContent = '50';
        var range = document.createElement('input');
        range.type = 'range';
        range.min = '0';
        range.max = '100';
        range.value = '50';
        range.addEventListener('input', function () { valueDisplay.textContent = range.value; });
        var labels = document.createElement('div');
        labels.className = 'slider-labels';
        var lo = document.createElement('span');
        lo.textContent = q.minLabel || '0';
        var hi = document.createElement('span');
        hi.textContent = q.maxLabel || '100';
        labels.appendChild(lo);
        labels.appendChild(hi);
        sWrap.appendChild(valueDisplay);
        sWrap.appendChild(range);
        sWrap.appendChild(labels);
        body.appendChild(sWrap);
        var sActions = document.createElement('div');
        sActions.className = 'setup-actions';
        sActions.appendChild(button('Continue', 'setup-primary', function () {
          recordAnswer(q, range.value + '/100, where 0 is "' + (q.minLabel || '0') + '" and 100 is "' + (q.maxLabel || '100') + '"');
        }));
        body.appendChild(sActions);
      } else if (format === 'stack') {
        var stackHint = document.createElement('p');
        stackHint.className = 'setup-hint';
        stackHint.textContent = q.instruction || 'Drag to reorder — top is first.';
        body.appendChild(stackHint);

        var stackOrder = (q.items || []).slice();
        var stackList = document.createElement('div');
        stackList.className = 'stack-list';
        var rowMap = {};

        function buildRow(stackItem) {
          var row = document.createElement('div');
          row.className = 'stack-item';
          var badge = document.createElement('span');
          badge.className = 'stack-badge';
          var label = document.createElement('span');
          label.className = 'stack-label';
          label.textContent = stackItem;
          var handle = document.createElement('span');
          handle.className = 'stack-handle';
          handle.textContent = '⠿';
          row.appendChild(badge);
          row.appendChild(label);
          row.appendChild(handle);

          function place(clientY, offsetY) {
            row.style.top = (clientY - offsetY) + 'px';
            var kids = Array.prototype.slice.call(stackList.children);
            var newIdx = kids.length;
            for (var i = 0; i < kids.length; i++) {
              var r = kids[i].getBoundingClientRect();
              if (clientY < r.top + r.height / 2) { newIdx = i; break; }
            }
            var rest = stackOrder.filter(function (x) { return x !== stackItem; });
            rest.splice(newIdx, 0, stackItem);
            stackOrder = rest;
            renderStack(stackItem);
          }
          function beginDrag(clientY) {
            var rect = row.getBoundingClientRect();
            var offsetY = clientY - rect.top;
            row.classList.add('dragging');
            row.style.position = 'fixed';
            row.style.left = rect.left + 'px';
            row.style.top = rect.top + 'px';
            row.style.width = rect.width + 'px';
            document.body.appendChild(row);
            renderStack(stackItem);
            return offsetY;
          }
          function endDrag() {
            row.classList.remove('dragging');
            row.style.position = '';
            row.style.left = '';
            row.style.top = '';
            row.style.width = '';
            renderStack(null);
          }

          row.addEventListener('pointerdown', function (e) {
            if (e.pointerType === 'touch') return;
            e.preventDefault();
            var offsetY = beginDrag(e.clientY);
            var onMove = function (ev) { place(ev.clientY, offsetY); };
            var onUp = function (ev) {
              place(ev.clientY, offsetY);
              endDrag();
              document.removeEventListener('pointermove', onMove);
              document.removeEventListener('pointerup', onUp);
            };
            document.addEventListener('pointermove', onMove);
            document.addEventListener('pointerup', onUp);
          });
          row.addEventListener('touchstart', function (e) {
            var t = e.touches[0];
            var offsetY = beginDrag(t.clientY);
            var onMove = function (ev) { var tt = ev.touches[0]; place(tt.clientY, offsetY); ev.preventDefault(); };
            var onEnd = function (ev) {
              var tt = ev.changedTouches[0];
              place(tt.clientY, offsetY);
              endDrag();
              document.removeEventListener('touchmove', onMove);
              document.removeEventListener('touchend', onEnd);
            };
            document.addEventListener('touchmove', onMove, { passive: false });
            document.addEventListener('touchend', onEnd);
          }, { passive: true });

          return row;
        }

        function renderStack(draggingItem) {
          stackList.innerHTML = '';
          stackOrder.forEach(function (stackItem, idx) {
            if (stackItem === draggingItem) return;
            var row = rowMap[stackItem] || (rowMap[stackItem] = buildRow(stackItem));
            row.querySelector('.stack-badge').textContent = idx + 1;
            stackList.appendChild(row);
          });
        }
        renderStack(null);

        body.appendChild(stackList);
        var stackActions = document.createElement('div');
        stackActions.className = 'setup-actions';
        stackActions.appendChild(button('Continue', 'setup-primary', function () {
          recordAnswer(q, 'Dragged into this order, top to bottom: ' + stackOrder.join(' → '));
        }));
        stackActions.appendChild(button('None of these apply to me', 'setup-secondary', function () {
          recordAnswer(q, 'None of these applied to their actual situation — the exercise didn\'t fit.');
        }));
        body.appendChild(stackActions);
      } else if (format === 'rank') {
        var hint = document.createElement('p');
        hint.className = 'setup-hint';
        hint.textContent = q.instruction || 'Tap each one, in the order that feels right — first instinct first.';
        body.appendChild(hint);

        var rankGrid = document.createElement('div');
        rankGrid.className = 'rank-grid';
        var order = [];
        var tiles = [];
        (q.items || []).forEach(function (item) {
          var tile = document.createElement('button');
          tile.type = 'button';
          tile.className = 'rank-tile';
          var badge = document.createElement('span');
          badge.className = 'rank-badge';
          var label = document.createElement('span');
          label.className = 'rank-label';
          label.textContent = item;
          tile.appendChild(badge);
          tile.appendChild(label);
          tile.addEventListener('click', function () {
            if (tile.classList.contains('picked')) return;
            order.push(item);
            tile.classList.add('picked');
            badge.textContent = order.length;
            if (order.length === tiles.length) {
              setTimeout(function () {
                recordAnswer(q, 'Ranked in this order (first = strongest instinct): ' + order.join(' → '));
              }, 380);
            }
          });
          tiles.push(tile);
          rankGrid.appendChild(tile);
        });
        body.appendChild(rankGrid);
        var rankActions = document.createElement('div');
        rankActions.className = 'setup-actions';
        rankActions.appendChild(button('None of these apply to me', 'setup-secondary', function () {
          recordAnswer(q, 'None of these applied to their actual situation — the exercise didn\'t fit.');
        }));
        body.appendChild(rankActions);
      } else if (format === 'sort') {
        var tray = document.createElement('div');
        tray.className = 'sort-tray';
        var boxes = document.createElement('div');
        boxes.className = 'sort-boxes';
        var boxA = document.createElement('div');
        boxA.className = 'sort-box';
        var boxATitle = document.createElement('p');
        boxATitle.className = 'sort-box-title';
        boxATitle.textContent = q.boxA || 'Yes';
        boxA.appendChild(boxATitle);
        var boxB = document.createElement('div');
        boxB.className = 'sort-box';
        var boxBTitle = document.createElement('p');
        boxBTitle.className = 'sort-box-title';
        boxBTitle.textContent = q.boxB || 'No';
        boxB.appendChild(boxBTitle);
        boxes.appendChild(boxA);
        boxes.appendChild(boxB);

        var moveOrder = [];
        var placement = {};
        var total = (q.items || []).length;
        var sActions2 = document.createElement('div');
        sActions2.className = 'setup-actions';
        var doneBtn = button('Continue', 'setup-primary', function () {
          var listA = (q.items || []).filter(function (it) { return placement[it] === 'A'; });
          var listB = (q.items || []).filter(function (it) { return placement[it] === 'B'; });
          var summary = (q.boxA || 'Yes') + ': ' + (listA.join(', ') || '(none)') + '. ' +
            (q.boxB || 'No') + ': ' + (listB.join(', ') || '(none)') + '.' +
            (moveOrder.length ? ' Sorted in this order: ' + moveOrder.join(' → ') + '.' : '');
          recordAnswer(q, summary);
        });
        doneBtn.disabled = true;
        sActions2.appendChild(doneBtn);
        sActions2.appendChild(button('None of these apply to me', 'setup-secondary', function () {
          recordAnswer(q, 'None of these applied to their actual situation — the exercise didn\'t fit.');
        }));

        function placeChip(chip, item, zone) {
          if (!placement[item]) moveOrder.push(item);
          placement[item] = zone;
          chip.classList.remove('drag-a', 'drag-b');
          chip.classList.add(zone === 'A' ? 'drag-a' : 'drag-b');
          (zone === 'A' ? boxA : boxB).appendChild(chip);
          doneBtn.disabled = Object.keys(placement).length < total;
        }

        (q.items || []).forEach(function (item) {
          var chip = document.createElement('div');
          chip.className = 'sort-chip';
          chip.textContent = item;
          chip.tabIndex = 0;

          function dragStart(clientX, clientY, pointerId, isTouch) {
            var startRect = chip.getBoundingClientRect();
            var offsetX = clientX - startRect.left;
            var offsetY = clientY - startRect.top;
            chip.classList.add('dragging');
            chip.style.position = 'fixed';
            chip.style.width = startRect.width + 'px';
            chip.style.left = startRect.left + 'px';
            chip.style.top = startRect.top + 'px';
            chip.style.zIndex = '50';
            document.body.appendChild(chip);

            function move(x, y) {
              chip.style.left = (x - offsetX) + 'px';
              chip.style.top = (y - offsetY) + 'px';
              var overA = isOver(boxA, x, y);
              var overB = isOver(boxB, x, y);
              boxA.classList.toggle('drop-hover', overA);
              boxB.classList.toggle('drop-hover', overB);
            }
            function isOver(box, x, y) {
              var r = box.getBoundingClientRect();
              return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
            }
            function end(x, y) {
              chip.classList.remove('dragging');
              chip.style.position = '';
              chip.style.width = '';
              chip.style.left = '';
              chip.style.top = '';
              chip.style.zIndex = '';
              boxA.classList.remove('drop-hover');
              boxB.classList.remove('drop-hover');
              if (isOver(boxA, x, y)) placeChip(chip, item, 'A');
              else if (isOver(boxB, x, y)) placeChip(chip, item, 'B');
              else tray.appendChild(chip);
            }

            if (isTouch) {
              var onTouchMove = function (e) { var t = e.touches[0]; move(t.clientX, t.clientY); e.preventDefault(); };
              var onTouchEnd = function (e) {
                var t = e.changedTouches[0];
                end(t.clientX, t.clientY);
                document.removeEventListener('touchmove', onTouchMove);
                document.removeEventListener('touchend', onTouchEnd);
              };
              document.addEventListener('touchmove', onTouchMove, { passive: false });
              document.addEventListener('touchend', onTouchEnd);
            } else {
              var onMove = function (e) { move(e.clientX, e.clientY); };
              var onUp = function (e) {
                end(e.clientX, e.clientY);
                document.removeEventListener('pointermove', onMove);
                document.removeEventListener('pointerup', onUp);
              };
              document.addEventListener('pointermove', onMove);
              document.addEventListener('pointerup', onUp);
            }
          }

          chip.addEventListener('pointerdown', function (e) {
            if (e.pointerType === 'touch') return;
            e.preventDefault();
            dragStart(e.clientX, e.clientY, e.pointerId, false);
          });
          chip.addEventListener('touchstart', function (e) {
            var t = e.touches[0];
            dragStart(t.clientX, t.clientY, null, true);
          }, { passive: true });

          tray.appendChild(chip);
        });

        body.appendChild(tray);
        body.appendChild(boxes);
        body.appendChild(sActions2);
      } else if (format === 'quickpick') {
        var qpStart = Date.now();
        var qpList = document.createElement('div');
        qpList.className = 'setup-options';
        (q.options || []).forEach(function (opt) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'setup-option';
          var span = document.createElement('span');
          span.textContent = opt;
          var arrow = document.createElement('span');
          arrow.className = 'arrow';
          arrow.textContent = '→';
          b.appendChild(span);
          b.appendChild(arrow);
          b.addEventListener('click', function () {
            var seconds = ((Date.now() - qpStart) / 1000).toFixed(1);
            recordAnswer(q, 'Picked "' + opt + '" after ' + seconds + 's of thinking');
          });
          qpList.appendChild(b);
        });
        body.appendChild(qpList);
      } else if (format === 'tiles') {
        var tHint = document.createElement('p');
        tHint.className = 'setup-hint';
        tHint.textContent = q.instruction || 'Tap whichever ones resonate — as many or as few as you like.';
        body.appendChild(tHint);
        var tGrid = document.createElement('div');
        tGrid.className = 'rank-grid';
        var tOrder = [];
        var tContinue = button('Continue', 'setup-primary', function () {
          recordAnswer(q, tOrder.length ? ('Picked, in this order: ' + tOrder.join(' → ')) : 'Picked none of these.');
        });
        (q.items || []).forEach(function (item) {
          var tile = document.createElement('button');
          tile.type = 'button';
          tile.className = 'rank-tile tile-toggle';
          var label = document.createElement('span');
          label.className = 'rank-label';
          label.textContent = item;
          tile.appendChild(label);
          tile.addEventListener('click', function () {
            var idx = tOrder.indexOf(item);
            if (idx > -1) { tOrder.splice(idx, 1); tile.classList.remove('picked'); }
            else { tOrder.push(item); tile.classList.add('picked'); }
          });
          tGrid.appendChild(tile);
        });
        body.appendChild(tGrid);
        var tActions = document.createElement('div');
        tActions.className = 'setup-actions';
        tActions.appendChild(tContinue);
        body.appendChild(tActions);
      } else if (format === 'allocate') {
        var totalPoints = q.points || 10;
        var buckets = q.buckets || [];
        var values = buckets.map(function () { return 0; });
        var remainingEl = document.createElement('p');
        remainingEl.className = 'setup-hint';
        var aContinue = button('Continue', 'setup-primary', function () {
          var summary = buckets.map(function (b, i) { return b + ' = ' + values[i]; }).join(', ');
          recordAnswer(q, 'Distributed ' + totalPoints + ' points across: ' + summary);
        });
        function updateRemaining() {
          var used = values.reduce(function (a, b) { return a + b; }, 0);
          remainingEl.textContent = (totalPoints - used) + ' of ' + totalPoints + ' points left to place';
          aContinue.disabled = used !== totalPoints;
        }
        var aGrid = document.createElement('div');
        aGrid.className = 'allocate-grid';
        buckets.forEach(function (bLabel, i) {
          var row = document.createElement('div');
          row.className = 'allocate-row';
          var label = document.createElement('span');
          label.className = 'allocate-label';
          label.textContent = bLabel;
          var val = document.createElement('span');
          val.className = 'allocate-value';
          val.textContent = '0';
          var minus = button('–', 'allocate-btn', function () {
            if (values[i] > 0) { values[i]--; val.textContent = values[i]; updateRemaining(); }
          });
          var plus = button('+', 'allocate-btn', function () {
            var used = values.reduce(function (a, c) { return a + c; }, 0);
            if (used < totalPoints) { values[i]++; val.textContent = values[i]; updateRemaining(); }
          });
          row.appendChild(label);
          row.appendChild(minus);
          row.appendChild(val);
          row.appendChild(plus);
          aGrid.appendChild(row);
        });
        var aActions = document.createElement('div');
        aActions.className = 'setup-actions';
        aActions.appendChild(aContinue);
        body.appendChild(remainingEl);
        body.appendChild(aGrid);
        body.appendChild(aActions);
        updateRemaining();
      } else {
        var list = document.createElement('div');
        list.className = 'setup-options';
        (q.options || []).forEach(function (opt) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'setup-option';
          var span = document.createElement('span');
          span.textContent = opt;
          var arrow = document.createElement('span');
          arrow.className = 'arrow';
          arrow.textContent = '→';
          b.appendChild(span);
          b.appendChild(arrow);
          b.addEventListener('click', function () { recordAnswer(q, opt); });
          list.appendChild(b);
        });
        body.appendChild(list);
      }
    }

    function finish(doneObj) {
      clearSlowTimer();
      clearCycleTimer();
      cfg.onDone(doneObj);
    }

    function step() {
      renderLoading(count === 0);
      var atSoft = count >= cfg.softTarget;
      var atHard = count >= cfg.hardCap;
      var msgs = conversation.slice();
      if (atHard) msgs.push({ role: 'user', content: 'You are well past the target question count — you must conclude now with your final "done" response.' });
      else if (atSoft) msgs.push({ role: 'user', content: 'You have reached the target question count. If you are reasonably confident, conclude now with "done". Otherwise ask at most a few more.' });
      else if (count === 0) msgs.push({ role: 'user', content: 'Begin.' });
      attempt(msgs, atHard, 0);
    }

    function attempt(msgs, atHard, retryNum) {
      controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
      callAI(msgs, controller ? controller.signal : undefined).then(function (text) {
        var data = normalizeAIResponse(parseAIJson(text));
        var valid = !!data;
        if (!valid && retryNum < 2) {
          attempt(msgs.concat([
            { role: 'assistant', content: String(text || '').slice(0, 400) },
            { role: 'user', content: 'That was not valid — respond again with ONLY a single JSON object matching one of the required shapes, nothing else, no markdown, no explanation.' }
          ]), atHard, retryNum + 1);
          return;
        }
        clearSlowTimer();
        if (!valid) { renderError('Your AI model didn’t respond in the expected format.', text); return; }
        if (data.type === 'done') { finish(data); return; }
        if (atHard) { renderError('Your AI model kept asking questions past the limit.'); return; }
        renderQuestion(data);
      }).catch(function (err) {
        if (err && err.name === 'AbortError') return;
        clearSlowTimer();
        renderError('Couldn’t reach your AI model (' + (err && err.message ? err.message : 'unknown error') + ').');
      });
    }

    step();
  }

  var steps = {
    welcome_back: {
      eyebrow: 'WELCOME BACK',
      question: 'Continue with your saved setup?',
      body: function () {
        return summaryLine();
      },
      render: function (el) {
        var actions = document.createElement('div');
        actions.className = 'setup-actions';
        actions.appendChild(button('Continue', 'setup-primary', function () {
          history = [];
          go('done', true);
        }));
        actions.appendChild(button('Start over', 'setup-secondary', function () {
          answers = {};
          clearAnswers();
          history = [];
          go('engine', true);
        }));
        el.appendChild(actions);
      }
    },
    engine: {
      eyebrow: 'AI SETUP',
      question: 'How should your AI mentor run?',
      options: [
        { label: 'Bring my own API key', hint: 'Best answer quality · pay-per-use', value: 'byok', next: 'byok_provider' },
        { label: 'Run a small model in my browser', hint: 'WebLLM · free, needs WebGPU', value: 'webllm', next: 'webllm_size' },
        { label: 'Connect to a local model I already run', hint: 'Ollama or LM Studio', value: 'local', next: 'local_runtime' },
        { label: 'I’m not sure yet', hint: 'See a side-by-side comparison', value: 'unsure', next: 'unsure_info' }
      ],
      onSelect: function (value) { answers.engine = value; }
    },
    unsure_info: {
      eyebrow: 'AI SETUP',
      question: 'No rush — you can decide anytime.',
      body: 'Each option trades off cost, quality, and setup effort differently. The full comparison is one click away, or keep going and change this later.',
      render: function (el) {
        var actions = document.createElement('div');
        actions.className = 'setup-actions';
        var link = document.createElement('a');
        link.href = '/requirements';
        link.className = 'setup-primary';
        link.textContent = 'See the options';
        actions.appendChild(link);
        actions.appendChild(button('Continue setup', 'setup-secondary', function () { go('assess_intro'); }));
        el.appendChild(actions);
      }
    },
    byok_provider: {
      eyebrow: 'AI SETUP',
      question: 'Which provider are you using?',
      options: [
        { label: 'OpenAI', value: 'openai', next: 'byok_key' },
        { label: 'Anthropic', value: 'anthropic', next: 'byok_key' },
        { label: 'Something else', hint: 'Custom-compatible endpoint', value: 'other', next: 'byok_endpoint' }
      ],
      onSelect: function (value) { answers.provider = value; }
    },
    byok_endpoint: {
      eyebrow: 'AI SETUP',
      question: 'What’s the API base URL?',
      field: { placeholder: 'https://api.example.com/v1/chat/completions', hint: 'Must be an OpenAI-compatible chat completions endpoint.', key: 'byokEndpoint', type: 'text' },
      next: 'byok_key'
    },
    byok_key: {
      eyebrow: 'AI SETUP',
      question: 'Paste your API key.',
      field: { placeholder: 'sk-...', hint: 'Stored only in your browser. Never sent to Trefelle.', key: 'apiKey', type: 'password' },
      next: 'assess_intro'
    },
    webllm_size: {
      eyebrow: 'AI SETUP',
      question: 'Which model size fits your device?',
      options: [
        { label: 'Small', hint: 'Fastest · about 1GB download', value: 'small', next: 'webllm_check' },
        { label: 'Balanced', hint: 'Recommended · about 2GB download', value: 'balanced', next: 'webllm_check' },
        { label: 'Larger', hint: 'Best quality · about 4GB, needs a strong GPU', value: 'large', next: 'webllm_check' }
      ],
      onSelect: function (value) { answers.modelSize = value; }
    },
    webllm_check: {
      eyebrow: 'AI SETUP',
      question: 'Check this browser for WebGPU support?',
      options: [
        { label: 'Check now', value: 'check', next: 'assess_intro', action: function (done) {
            var supported = !!(navigator.gpu);
            answers.webgpu = supported ? 'supported' : 'unsupported';
            done();
          } },
        { label: 'Skip for now', value: 'skip', next: 'assess_intro' }
      ]
    },
    local_runtime: {
      eyebrow: 'AI SETUP',
      question: 'Which local runtime are you using?',
      options: [
        { label: 'Ollama', hint: 'localhost:11434', value: 'ollama', next: 'local_address' },
        { label: 'LM Studio', hint: 'localhost:1234', value: 'lmstudio', next: 'local_address' },
        { label: 'Something else', value: 'custom', next: 'local_address' }
      ],
      onSelect: function (value) { answers.runtime = value; }
    },
    local_address: {
      eyebrow: 'AI SETUP',
      question: 'Confirm the server address.',
      field: { placeholder: 'http://localhost:11434', hint: 'Your browser will need permission to reach this address.', key: 'serverAddress', type: 'text',
        default: function () {
          if (answers.runtime === 'ollama') return 'http://localhost:11434';
          if (answers.runtime === 'lmstudio') return 'http://localhost:1234';
          return '';
        } },
      next: 'local_model'
    },
    local_model: {
      eyebrow: 'AI SETUP',
      question: 'Which model have you pulled?',
      render: function (el) {
        var status = document.createElement('p');
        status.className = 'step-body';
        status.textContent = 'Checking ' + (answers.serverAddress || 'your server') + ' for available models…';
        el.appendChild(status);

        function showManualField() {
          status.textContent = 'Couldn’t auto-detect models — type the name instead.';
          var form = document.createElement('form');
          form.className = 'setup-field';
          var input = document.createElement('input');
          input.type = 'text';
          input.placeholder = 'e.g. llama3, qwen2.5, mistral';
          input.autocomplete = 'off';
          input.value = answers.localModel || '';
          form.appendChild(input);
          var actions = document.createElement('div');
          actions.className = 'setup-actions';
          var submit = document.createElement('button');
          submit.type = 'submit';
          submit.className = 'setup-primary';
          submit.textContent = 'Continue';
          actions.appendChild(submit);
          form.appendChild(actions);
          form.addEventListener('submit', function (e) {
            e.preventDefault();
            answers.localModel = input.value.trim();
            go('assess_intro');
          });
          el.appendChild(form);
          setTimeout(function () { input.focus(); }, 100);
        }

        var base = (answers.serverAddress || '').replace(/\/+$/, '');
        if (!base) { showManualField(); return; }

        fetch(base + '/api/tags').then(function (res) {
          if (!res.ok) throw new Error('bad response');
          return res.json();
        }).then(function (data) {
          var models = (data.models || []).map(function (m) { return m.name || m.model; }).filter(Boolean);
          if (!models.length) throw new Error('no models');
          status.textContent = 'Found on ' + base + ':';
          var list = document.createElement('div');
          list.className = 'setup-options';
          models.forEach(function (name) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'setup-option';
            var span = document.createElement('span');
            span.textContent = name;
            var arrow = document.createElement('span');
            arrow.className = 'arrow';
            arrow.textContent = '→';
            b.appendChild(span);
            b.appendChild(arrow);
            b.addEventListener('click', function () {
              answers.localModel = name;
              go('assess_intro');
            });
            list.appendChild(b);
          });
          el.appendChild(list);
        }).catch(function () {
          showManualField();
        });
      }
    },
    assess_intro: {
      eyebrow: 'GETTING TO KNOW YOU',
      question: 'A few quick questions to calibrate your scenarios.',
      body: 'Nothing here is graded — it just helps Trefelle pick problems that fit your level and how you like to work. Takes under a minute.',
      render: function (el) {
        var actions = document.createElement('div');
        actions.className = 'setup-actions';
        actions.appendChild(button('Start', 'setup-primary', function () { go('assess_profile_import'); }));
        actions.appendChild(button('Skip for now', 'setup-secondary', function () { go('voice_ask'); }));
        el.appendChild(actions);
      }
    },
    assess_profile_import: {
      eyebrow: 'SPEED THINGS UP',
      question: 'Have a resume or LinkedIn on hand?',
      body: 'Paste your resume text, your LinkedIn URL, or upload a resume file. We\'ll use it to skip questions the answer already covers — totally optional.',
      render: function (el) {
        var form = document.createElement('form');
        form.className = 'setup-field';

        var textarea = document.createElement('textarea');
        textarea.placeholder = 'Paste resume text, a LinkedIn URL, or your About/Experience section…';
        textarea.value = answers.profileImport || '';
        form.appendChild(textarea);

        var uploadRow = document.createElement('div');
        uploadRow.className = 'setup-upload';
        var uploadLabel = document.createElement('label');
        uploadLabel.className = 'setup-upload-btn';
        uploadLabel.textContent = 'Or upload a file (.pdf, .docx, .txt)';
        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf,.doc,.docx,.txt';
        uploadLabel.appendChild(fileInput);
        uploadRow.appendChild(uploadLabel);
        var uploadStatus = document.createElement('p');
        uploadStatus.className = 'setup-note';
        uploadStatus.textContent = 'Max 5 MB.';
        uploadRow.appendChild(uploadStatus);
        form.appendChild(uploadRow);

        fileInput.addEventListener('change', function () {
          var file = fileInput.files && fileInput.files[0];
          if (!file) return;
          uploadStatus.classList.remove('error');
          if (file.size > MAX_RESUME_BYTES) {
            uploadStatus.classList.add('error');
            uploadStatus.textContent = 'That file is over 5 MB — try a smaller file or paste the text instead.';
            return;
          }
          uploadStatus.textContent = 'Reading ' + file.name + '…';
          extractResumeText(file).then(function (text) {
            text = (text || '').trim();
            if (!text) {
              uploadStatus.classList.add('error');
              uploadStatus.textContent = 'Couldn’t find any text in that file — try pasting instead.';
              return;
            }
            textarea.value = text;
            uploadStatus.textContent = 'Loaded ' + file.name + ' (' + Math.round(file.size / 1024) + ' KB).';
          }, function (err) {
            uploadStatus.classList.add('error');
            uploadStatus.textContent = (err && err.message) || 'Couldn’t read that file — try pasting instead.';
          });
        });

        var actions = document.createElement('div');
        actions.className = 'setup-actions';
        var submit = document.createElement('button');
        submit.type = 'submit';
        submit.className = 'setup-primary';
        submit.textContent = 'Continue';
        actions.appendChild(submit);
        actions.appendChild(button('Skip', 'setup-secondary', function () {
          answers.profileImport = '';
          go('assess_personality');
        }));
        form.appendChild(actions);

        form.addEventListener('submit', function (e) {
          e.preventDefault();
          answers.profileImport = textarea.value.trim();
          go('assess_personality');
        });

        el.appendChild(form);
        setTimeout(function () { textarea.focus(); }, 260);
      }
    },
    assess_personality: {
      hideHeader: true,
      render: function (el) {
        var profileContext = answers.profileImport
          ? ('The person pasted this resume/LinkedIn content before you started — use it for background color if relevant, but it says nothing reliable about how they think or learn, so still infer personality and learning style entirely through your own exercises: "' + answers.profileImport + '" ')
          : '';
        renderAIFlow(el, {
          eyebrow: 'GETTING TO KNOW YOU',
          systemPrompt: profileContext + PERSONALITY_PROMPT,
          softTarget: 10,
          hardCap: 16,
          fallbackStepId: 'assess_bug',
          onDone: function (doneObj) {
            answers.personalitySummary = doneObj.summary || '';
            answers.learningStyleLabel = doneObj.learningStyle || '';
            answers.workStyleLabel = doneObj.workStyle || '';
            go('assess_field_choice');
          }
        });
      }
    },
    assess_field_choice: {
      eyebrow: 'YOUR FIELD',
      question: 'Which broad field pulls you in most right now?',
      options: [
        { label: 'Software & Computer Science', value: 'Software & Computer Science', next: 'assess_stage_choice' },
        { label: 'Data Science, AI & ML', value: 'Data Science, AI & ML', next: 'assess_stage_choice' },
        { label: 'Mechanical Engineering', value: 'Mechanical Engineering', next: 'assess_stage_choice' },
        { label: 'Electrical / Computer Engineering', value: 'Electrical / Computer Engineering', next: 'assess_stage_choice' },
        { label: 'Civil / Structural Engineering', value: 'Civil / Structural Engineering', next: 'assess_stage_choice' },
        { label: 'Aerospace Engineering', value: 'Aerospace Engineering', next: 'assess_stage_choice' },
        { label: 'Biomedical / Health Tech', value: 'Biomedical / Health Tech', next: 'assess_stage_choice' },
        { label: 'Chemical / Materials / Process', value: 'Chemical / Materials / Process', next: 'assess_stage_choice' },
        { label: 'Industrial / Manufacturing / Robotics', value: 'Industrial / Manufacturing / Robotics', next: 'assess_stage_choice' },
        { label: 'Environmental / Energy / Earth Science', value: 'Environmental / Energy / Earth Science', next: 'assess_stage_choice' },
        { label: 'Math, Physics, or Actuarial / Quant', value: 'Math, Physics, or Actuarial / Quant', next: 'assess_stage_choice' },
        { label: 'Not sure yet / something else', hint: 'Tell us a bit more', value: 'other', next: 'assess_field_custom' }
      ],
      onSelect: function (value) { if (value !== 'other') answers.chosenField = value; }
    },
    assess_field_custom: {
      eyebrow: 'YOUR FIELD',
      question: 'What field are you curious about, or what would you add?',
      field: {
        placeholder: 'e.g. Robotics, Neuroscience, or "not sure yet — open to anything technical"', key: 'chosenFieldCustom', type: 'text',
        onSubmit: function (value) { answers.chosenField = value || 'Not sure yet — open to anything technical'; }
      },
      next: 'assess_stage_choice'
    },
    assess_stage_choice: {
      eyebrow: 'YOUR STAGE',
      question: 'Which best describes where you are right now?',
      options: [
        { label: 'Haven’t started a degree yet', hint: 'High school, or still considering options', value: 'pre-undergrad', next: 'assess_fields' },
        { label: 'Currently in an undergraduate program', value: 'undergrad', next: 'assess_fields' },
        { label: 'Graduated and/or working professionally', hint: 'In this field or an adjacent one', value: 'professional', next: 'assess_fields' }
      ],
      onSelect: function (value) { answers.stage = value; }
    },
    assess_fields: {
      hideHeader: true,
      render: function (el) {
        var stageLabels = { 'pre-undergrad': 'Hasn’t started a degree yet', undergrad: 'Currently in an undergraduate program', professional: 'Graduated and/or working professionally' };
        var context = answers.personalitySummary
          ? ('Here is what you already learned about how this person thinks and learns: "' + answers.personalitySummary + '" Use it — do not re-ask about personality or learning style. ')
          : '';
        context += 'Their stated field of interest is "' + (answers.chosenField || 'not yet known') + '" and their career stage is "' + (stageLabels[answers.stage] || answers.stage || 'not yet known') + '". These were already asked directly — never ask about either again. ';
        if (answers.profileImport) {
          context += 'They also pasted this resume/LinkedIn content before you started: "' + answers.profileImport + '" Use it to skip questions it already answers plainly (e.g. don\'t ask what their current job title is if it says so) and to target your verification exercises at the specific skills, tools, and claims it makes — but treat every claim in it as something to verify with a real exercise, not something to take at face value, exactly as you would a spoken claim. A resume never earns "mid" or "senior" by itself. ';
        }
        renderAIFlow(el, {
          eyebrow: 'FINDING YOUR FIT',
          systemPrompt: context + FIELDS_PROMPT_BASE,
          softTarget: 17,
          hardCap: 26,
          fallbackStepId: 'assess_level',
          onDone: function (doneObj) {
            if (doneObj.level && LEVEL_PREFIX[doneObj.level] !== undefined) answers.level = doneObj.level;
            answers.aiFieldRecs = (doneObj.fields || []).slice(0, 3).map(function (f) {
              return {
                id: slugify(f.name), name: f.name, why: f.why || '', blurb: f.blurb || f.why || '',
                demand: f.demand || 'Not tracked', pay: f.pay || 'Varies', roles: (f.roles || []).slice(0, 3)
              };
            });
            go('field_loading');
          }
        });
      }
    },
    assess_bug: {
      eyebrow: 'HOW YOU WORK',
      question: 'A bug shows up that you don’t understand. First move?',
      options: [
        { label: 'Read the code line by line', value: 'read', next: 'assess_ambiguity' },
        { label: 'Search the error message', value: 'search', next: 'assess_ambiguity' },
        { label: 'Add print statements or logging', value: 'log', next: 'assess_ambiguity' },
        { label: 'Ask someone or your mentor', value: 'ask', next: 'assess_ambiguity' }
      ],
      onSelect: function (value) { answers.debugStyle = value; }
    },
    assess_ambiguity: {
      eyebrow: 'HOW YOU WORK',
      question: 'A ticket is ambiguous. You’d rather:',
      options: [
        { label: 'Ask clarifying questions before starting', value: 'clarify', next: 'assess_learn' },
        { label: 'Make reasonable assumptions and note them', value: 'assume', next: 'assess_learn' },
        { label: 'Build the simplest version and iterate', value: 'iterate', next: 'assess_learn' }
      ],
      onSelect: function (value) { answers.ambiguityStyle = value; }
    },
    assess_learn: {
      eyebrow: 'LEARNING STYLE',
      question: 'What helps you understand a new system fastest?',
      options: [
        { label: 'A diagram of how it fits together', value: 'visual', next: 'assess_level' },
        { label: 'Reading the code itself', value: 'reading', next: 'assess_level' },
        { label: 'Talking it through out loud', value: 'verbal', next: 'assess_level' },
        { label: 'Tracing an example step by step', value: 'example', next: 'assess_level' }
      ],
      onSelect: function (value) { answers.learningStyle = value; }
    },
    assess_level: {
      eyebrow: 'BACKGROUND',
      question: 'What best describes where you are right now?',
      options: [
        { label: 'Student, bootcamp, or self-taught', value: 'student', next: 'assess_experience' },
        { label: 'Early career', hint: '0–2 years', value: 'early', next: 'assess_experience' },
        { label: 'Mid-level', hint: '3–6 years', value: 'mid', next: 'assess_experience' },
        { label: 'Senior+', hint: '7+ years', value: 'senior', next: 'assess_experience' }
      ],
      onSelect: function (value) { answers.level = value; }
    },
    assess_experience: {
      eyebrow: 'BACKGROUND',
      question: 'Which areas do you have real hands-on experience with?',
      body: 'Pick as many as apply.',
      multi: { key: 'experience', next: 'assess_incidents', options: ['Backend / APIs', 'Frontend', 'Data / ML', 'Infra / DevOps', 'Security', 'Mobile', 'None yet'] }
    },
    assess_incidents: {
      eyebrow: 'BACKGROUND',
      question: 'How comfortable are you with production incidents?',
      options: [
        { label: 'Never touched one', value: 'none', next: 'assess_interests' },
        { label: 'Watched but didn’t lead', value: 'observed', next: 'assess_interests' },
        { label: 'Handled a few', value: 'handled', next: 'assess_interests' },
        { label: 'Regularly on-call', value: 'oncall', next: 'assess_interests' }
      ],
      onSelect: function (value) { answers.incidentComfort = value; }
    },
    assess_interests: {
      eyebrow: 'INTERESTS',
      question: 'Which tech fields pull you in?',
      body: 'Pick any that interest you — we’ll use this to suggest fields next.',
      multi: {
        key: 'interests',
        next: 'field_loading',
        custom: true,
        options: FIELD_CATALOG.map(function (f) { return f.name; })
      }
    },
    field_loading: {
      eyebrow: 'MATCHING',
      question: 'Finding your fields…',
      body: 'Weighing your interests against how you like to work.',
      render: function () {
        setTimeout(function () { go('field_results', true); }, 850);
      }
    },
    field_results: {
      eyebrow: 'YOUR FIELDS',
      question: 'Based on your answers, these fit.',
      render: function (el) {
        var recs = (answers.aiFieldRecs && answers.aiFieldRecs.length) ? answers.aiFieldRecs : computeFieldRecommendations(answers);
        var selected = [];
        var continueBtn;
        var list = document.createElement('div');
        list.className = 'field-list';

        recs.forEach(function (f) {
          var card = document.createElement('div');
          card.className = 'field-card';

          var head = document.createElement('div');
          head.className = 'field-head';

          var sel = document.createElement('span');
          sel.className = 'field-select';

          var textWrap = document.createElement('div');
          textWrap.className = 'field-head-text';
          var name = document.createElement('b');
          name.textContent = f.name;
          var why = document.createElement('span');
          why.textContent = f.why;
          textWrap.appendChild(name);
          textWrap.appendChild(why);

          var chevron = document.createElement('span');
          chevron.className = 'field-chevron';
          chevron.textContent = '⌄';

          head.appendChild(sel);
          head.appendChild(textWrap);
          head.appendChild(chevron);

          var details = document.createElement('div');
          details.className = 'field-details';
          var inner = document.createElement('div');
          inner.className = 'field-details-inner';
          var stats = document.createElement('div');
          stats.className = 'field-stats';

          function statBlock(label, value) {
            var d = document.createElement('div');
            var s = document.createElement('span');
            s.textContent = label;
            var v = document.createElement('b');
            v.textContent = value;
            d.appendChild(s);
            d.appendChild(v);
            return d;
          }
          stats.appendChild(statBlock('DEMAND', f.demand));
          stats.appendChild(statBlock('TYPICAL PAY', f.pay));
          var desc = document.createElement('p');
          desc.textContent = f.blurb;
          inner.appendChild(stats);
          inner.appendChild(desc);
          details.appendChild(inner);

          card.appendChild(head);
          card.appendChild(details);

          sel.addEventListener('click', function (e) {
            e.stopPropagation();
            var idx = selected.indexOf(f);
            if (idx > -1) {
              selected.splice(idx, 1);
              card.classList.remove('selected');
            } else {
              if (selected.length >= 2) return;
              selected.push(f);
              card.classList.add('selected');
            }
            continueBtn.disabled = selected.length === 0;
          });
          textWrap.addEventListener('click', function () { card.classList.toggle('open'); });
          chevron.addEventListener('click', function () { card.classList.toggle('open'); });

          list.appendChild(card);
        });
        el.appendChild(list);

        var note = document.createElement('p');
        note.className = 'setup-hint';
        note.textContent = 'Pick 1–2 fields. Pay and demand are rough, US-market ballparks — they vary by location and company.';
        el.appendChild(note);

        var actions = document.createElement('div');
        actions.className = 'setup-actions';
        continueBtn = button('Continue', 'setup-primary', function () {
          answers.selectedFields = selected.slice();
          go('role_results');
        });
        continueBtn.disabled = true;
        actions.appendChild(continueBtn);
        actions.appendChild(button('None of these — choose my own field', 'setup-secondary', function () { go('field_manual'); }));
        el.appendChild(actions);
      }
    },
    field_manual: {
      eyebrow: 'YOUR FIELDS',
      question: 'Pick a field directly.',
      options: FIELD_CATALOG.map(function (f) {
        return { label: f.name, hint: f.demand + ' demand · ' + f.pay, value: f.id, next: 'role_results' };
      }).concat([{ label: 'Type a field not listed', value: 'custom', next: 'field_custom' }]),
      onSelect: function (value) {
        if (value === 'custom') return;
        var match = FIELD_CATALOG.filter(function (f) { return f.id === value; })[0];
        answers.selectedFields = match ? [match] : [];
      }
    },
    field_custom: {
      eyebrow: 'YOUR FIELDS',
      question: 'What field are you thinking of?',
      field: {
        placeholder: 'e.g. Game development, Robotics, Embedded systems', key: 'customField', type: 'text',
        onSubmit: function (value) { answers.selectedFields = [{ id: 'custom', name: value || 'Your field', custom: true }]; }
      },
      next: 'role_results'
    },
    role_results: {
      eyebrow: 'ROLE MATCH',
      question: 'A few roles that fit your level.',
      render: function (el) {
        var fields = answers.selectedFields && answers.selectedFields.length ? answers.selectedFields : [{ id: 'fullstack', name: 'Full-stack' }];
        fields.forEach(function (f) {
          var label = document.createElement('p');
          label.className = 'field-group-label';
          label.textContent = f.name;
          el.appendChild(label);

          var list = document.createElement('div');
          list.className = 'setup-options';
          var roles = (f.roles && f.roles.length) ? f.roles : computeRoleRecommendations(f.id || 'fullstack', answers);
          roles.forEach(function (role) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'setup-option';
            var textWrap = document.createElement('span');
            var main = document.createElement('span');
            main.textContent = role.title;
            textWrap.appendChild(main);
            var hint = document.createElement('small');
            hint.textContent = role.blurb;
            textWrap.appendChild(hint);
            var arrow = document.createElement('span');
            arrow.className = 'arrow';
            arrow.textContent = '→';
            b.appendChild(textWrap);
            b.appendChild(arrow);
            b.addEventListener('click', function () {
              answers.role = role.title;
              answers.roleField = f.name;
              go('voice_ask');
            });
            list.appendChild(b);
          });
          el.appendChild(list);
        });

        var actions = document.createElement('div');
        actions.className = 'setup-actions';
        actions.appendChild(button('None of these — I’ll specify my own role', 'setup-secondary', function () { go('role_manual'); }));
        el.appendChild(actions);
      }
    },
    role_manual: {
      eyebrow: 'ROLE MATCH',
      question: 'What role are you aiming for?',
      field: { placeholder: 'e.g. Backend Engineer, QA Analyst', hint: 'Whatever you type is saved as your target role.', key: 'role', type: 'text' },
      next: 'voice_ask'
    },
    voice_ask: {
      eyebrow: 'VOICE',
      question: 'Want to talk with your mentor instead of typing?',
      options: [
        { label: 'Yes, enable microphone', value: 'yes', next: 'voice_permission' },
        { label: 'No, keep it text-only', value: 'no', next: 'save_ask' }
      ],
      onSelect: function (value) { answers.voice = value; }
    },
    voice_permission: {
      eyebrow: 'VOICE',
      question: 'Allow microphone access.',
      render: function (el) {
        var note = document.createElement('p');
        note.className = 'setup-note';
        note.textContent = 'Trefelle only listens while you’re actively talking to your mentor.';
        el.appendChild(note);
        var actions = document.createElement('div');
        actions.className = 'setup-actions';
        var allowBtn = button('Allow microphone', 'setup-primary', function () {
          allowBtn.disabled = true;
          allowBtn.textContent = 'Requesting…';
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            answers.microphone = 'unsupported';
            note.textContent = 'This browser can’t request microphone access.';
            note.classList.add('error');
            setTimeout(function () { go('save_ask'); }, 700);
            return;
          }
          navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
            stream.getTracks().forEach(function (t) { t.stop(); });
            answers.microphone = 'granted';
            go('voice_mode');
          }).catch(function () {
            answers.microphone = 'denied';
            note.textContent = 'Microphone access was denied. You can enable it later in your browser settings.';
            note.classList.add('error');
            allowBtn.disabled = false;
            allowBtn.textContent = 'Allow microphone';
          });
        });
        actions.appendChild(allowBtn);
        actions.appendChild(button('Not now', 'setup-secondary', function () {
          answers.microphone = 'skipped';
          go('save_ask');
        }));
        el.appendChild(actions);
      }
    },
    voice_mode: {
      eyebrow: 'VOICE',
      question: 'How should listening work?',
      options: [
        { label: 'Push to talk', hint: 'Hold a key while you speak', value: 'push', next: 'save_ask' },
        { label: 'Always listening', hint: 'While the mentor panel is open', value: 'always', next: 'save_ask' }
      ],
      onSelect: function (value) { answers.listenMode = value; }
    },
    save_ask: {
      eyebrow: 'SAVE & FINISH',
      question: 'Save this setup on this device?',
      options: [
        { label: 'Yes, remember it', value: 'yes', next: 'done' },
        { label: 'No, ask me next time', value: 'no', next: 'done' }
      ],
      onSelect: function (value) {
        answers.remember = value;
        if (value === 'yes') { saveAnswers(); } else { clearAnswers(); }
      }
    },
    done: {
      eyebrow: 'ALL SET',
      question: 'Your mentor is ready.',
      body: function () { return summaryLine(); },
      render: function (el) {
        var actions = document.createElement('div');
        actions.className = 'setup-actions';
        actions.appendChild(button('Edit setup', 'setup-secondary', function () { go('engine'); }));
        var back = document.createElement('a');
        back.href = '/';
        back.className = 'setup-primary';
        back.textContent = 'Back to Trefelle';
        actions.appendChild(back);
        el.appendChild(actions);
      }
    }
  };

  function engineLabel() {
    if (answers.engine === 'byok') return 'Bring your own key' + (answers.provider ? ' · ' + answers.provider : '');
    if (answers.engine === 'webllm') return 'WebLLM in-browser' + (answers.modelSize ? ' · ' + answers.modelSize : '');
    if (answers.engine === 'local') return 'Local model' + (answers.runtime ? ' · ' + answers.runtime : '');
    return 'Not chosen yet';
  }

  function levelLabel(value) {
    var labels = { student: 'Student / self-taught', early: 'Early career', mid: 'Mid-level', senior: 'Senior+' };
    return labels[value] || value;
  }

  function summaryLine() {
    var rows = [
      ['AI engine', engineLabel()],
      ['Assessment', answers.aiFieldRecs ? 'AI-guided' : (answers.level ? 'Standard questions' : 'Not answered')],
      ['Background', answers.level ? levelLabel(answers.level) : 'Not answered']
    ];
    if (answers.selectedFields && answers.selectedFields.length) {
      rows.push(['Field', answers.selectedFields.map(function (f) { return f.name; }).join(', ')]);
    }
    if (answers.role) {
      rows.push(['Target role', answers.role]);
    }
    rows.push(['Voice', answers.voice === 'yes' ? (answers.microphone === 'granted' ? 'Enabled' : 'Requested, not granted') : 'Text-only']);
    rows.push(['Remember setup', answers.remember === 'yes' ? 'Yes' : 'No']);
    var wrap = document.createElement('div');
    wrap.className = 'summary-list';
    rows.forEach(function (row) {
      var line = document.createElement('div');
      var a = document.createElement('span'); a.textContent = row[0];
      var b = document.createElement('span'); b.textContent = row[1];
      line.appendChild(a); line.appendChild(b);
      wrap.appendChild(line);
    });
    return wrap;
  }

  function button(label, className, onClick) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = className;
    b.textContent = label;
    b.addEventListener('click', onClick);
    return b;
  }

  function renderStep(id) {
    var step = steps[id];
    stage.innerHTML = '';
    var wrap = document.createElement('div');
    wrap.className = 'step';

    if (!step.hideHeader) {
      var eyebrow = document.createElement('p');
      eyebrow.className = 'step-eyebrow';
      eyebrow.textContent = step.eyebrow;
      wrap.appendChild(eyebrow);

      var h1 = document.createElement('h1');
      h1.textContent = step.question;
      wrap.appendChild(h1);
    }

    var body = typeof step.body === 'function' ? step.body() : step.body;
    if (body) {
      if (body instanceof Node) {
        wrap.appendChild(body);
      } else {
        var p = document.createElement('p');
        p.className = 'step-body';
        p.textContent = body;
        wrap.appendChild(p);
      }
    }

    if (step.options) {
      var list = document.createElement('div');
      list.className = 'setup-options';
      step.options.forEach(function (opt) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'setup-option';
        var textWrap = document.createElement('span');
        var main = document.createElement('span');
        main.textContent = opt.label;
        textWrap.appendChild(main);
        if (opt.hint) {
          var hint = document.createElement('small');
          hint.textContent = opt.hint;
          textWrap.appendChild(hint);
        }
        var arrow = document.createElement('span');
        arrow.className = 'arrow';
        arrow.textContent = '→';
        b.appendChild(textWrap);
        b.appendChild(arrow);
        b.addEventListener('click', function () {
          if (step.onSelect) step.onSelect(opt.value);
          if (opt.action) {
            b.disabled = true;
            opt.action(function () { go(opt.next); });
          } else {
            go(opt.next);
          }
        });
        list.appendChild(b);
      });
      wrap.appendChild(list);
    }

    if (step.multi) {
      var selected = new Set(answers[step.multi.key] || []);
      var multiList = document.createElement('div');
      multiList.className = 'setup-options';
      var continueBtn;
      var customInput;
      var updateContinueState = function () {
        var hasCustom = step.multi.custom && customInput && customInput.value.trim().length > 0;
        continueBtn.disabled = selected.size === 0 && !hasCustom;
      };
      step.multi.options.forEach(function (label) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'setup-option' + (selected.has(label) ? ' selected' : '');
        var span = document.createElement('span');
        span.textContent = label;
        var check = document.createElement('span');
        check.className = 'arrow';
        check.textContent = selected.has(label) ? '✓' : '';
        b.appendChild(span);
        b.appendChild(check);
        b.addEventListener('click', function () {
          if (selected.has(label)) { selected.delete(label); } else { selected.add(label); }
          b.classList.toggle('selected');
          check.textContent = selected.has(label) ? '✓' : '';
          updateContinueState();
        });
        multiList.appendChild(b);
      });
      wrap.appendChild(multiList);

      if (step.multi.custom) {
        var customWrap = document.createElement('div');
        customWrap.className = 'setup-field';
        customInput = document.createElement('input');
        customInput.type = 'text';
        customInput.placeholder = 'Or type a field not listed (optional)';
        customInput.autocomplete = 'off';
        customInput.value = answers.customInterest || '';
        customInput.addEventListener('input', updateContinueState);
        customWrap.appendChild(customInput);
        wrap.appendChild(customWrap);
      }

      var multiActions = document.createElement('div');
      multiActions.className = 'setup-actions';
      continueBtn = button('Continue', 'setup-primary', function () {
        answers[step.multi.key] = Array.from(selected);
        if (step.multi.custom) answers.customInterest = customInput.value.trim();
        go(step.multi.next);
      });
      multiActions.appendChild(continueBtn);
      wrap.appendChild(multiActions);
      updateContinueState();
    }

    if (step.field) {
      var form = document.createElement('form');
      form.className = 'setup-field';
      var isTextarea = step.field.type === 'textarea';
      var input = document.createElement(isTextarea ? 'textarea' : 'input');
      if (!isTextarea) input.type = step.field.type === 'password' ? 'password' : 'text';
      input.placeholder = step.field.placeholder || '';
      input.autocomplete = 'off';
      input.spellcheck = false;
      var existing = answers[step.field.key];
      if (existing) {
        input.value = existing;
      } else if (step.field.default) {
        input.value = step.field.default();
      }
      form.appendChild(input);
      if (step.field.hint) {
        var hint = document.createElement('p');
        hint.className = 'setup-hint';
        hint.textContent = step.field.hint;
        form.appendChild(hint);
      }
      var actions = document.createElement('div');
      actions.className = 'setup-actions';
      var submit = document.createElement('button');
      submit.type = 'submit';
      submit.className = 'setup-primary';
      submit.textContent = 'Continue';
      actions.appendChild(submit);
      actions.appendChild(button('Skip', 'setup-secondary', function (e) {
        answers[step.field.key] = '';
        go(step.next);
      }));
      form.appendChild(actions);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var value = input.value.trim();
        answers[step.field.key] = value;
        if (step.field.onSubmit) step.field.onSubmit(value);
        go(step.next);
      });
      wrap.appendChild(form);
      setTimeout(function () { input.focus(); }, 260);
    }

    if (step.render) step.render(wrap);

    stage.appendChild(wrap);
    backBtn.hidden = history.length === 0;
    requestAnimationFrame(function () {
      wrap.classList.remove('entering');
    });
  }

  function go(id, replace) {
    if (!id || !steps[id]) return;
    var current = stage.querySelector('.step');
    if (current) {
      current.classList.add('leaving');
      setTimeout(function () {
        if (!replace) history.push(currentId);
        currentId = id;
        renderStep(id);
        var next = stage.querySelector('.step');
        next.classList.add('entering');
        void next.offsetWidth;
        requestAnimationFrame(function () { next.classList.remove('entering'); });
      }, 220);
    } else {
      if (!replace) history.push(currentId);
      currentId = id;
      renderStep(id);
    }
  }

  function back() {
    if (!history.length) return;
    var prev = history.pop();
    var current = stage.querySelector('.step');
    if (current) {
      current.classList.add('leaving');
      setTimeout(function () {
        currentId = prev;
        renderStep(prev);
      }, 220);
    }
  }

  backBtn.addEventListener('click', back);

  var saved = loadAnswers();
  if (saved && saved.engine) {
    answers = saved;
    currentId = 'welcome_back';
    renderStep('welcome_back');
  } else {
    currentId = 'engine';
    renderStep('engine');
  }
})();
