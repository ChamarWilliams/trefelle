(function () {
  var STORAGE_KEY = 'trefelle_ai_setup';
  var stage = document.getElementById('stage');
  var backBtn = document.getElementById('backBtn');
  var answers = {};
  var history = [];

  // Fixed-position popovers (like the field-comparison hover tooltip) live
  // outside `stage`, so a step transition's stage.innerHTML reset never
  // reaches them -- every transition explicitly clears whatever's open.
  var activeTooltip = null;
  function hideActiveTooltip() {
    if (activeTooltip) { activeTooltip.remove(); activeTooltip = null; }
  }
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
    { id: 'backend', name: 'Backend / APIs', demand: 'Very high', entryPay: '$85k', tools: ['PostgreSQL', 'Docker', 'Node.js or Django'], blurb: 'You build the services, data models, and APIs that everything else depends on. Correctness and reliability matter more than pixels.' },
    { id: 'frontend', name: 'Frontend', demand: 'High', entryPay: '$75k', tools: ['React', 'TypeScript', 'Chrome DevTools'], blurb: 'You turn designs and data into interfaces people actually use — performance, accessibility, and state management are the daily craft.' },
    { id: 'fullstack', name: 'Full-stack', demand: 'Very high', entryPay: '$80k', tools: ['React', 'Node.js', 'PostgreSQL'], blurb: 'You move across the whole stack — comfortable enough in the backend and the UI to ship a feature end to end.' },
    { id: 'mobile', name: 'Mobile', demand: 'Moderate', entryPay: '$85k', tools: ['Swift / Xcode', 'Kotlin / Android Studio', 'React Native'], blurb: 'You build native or cross-platform apps, working closely with OS constraints, performance, and app-store realities.' },
    { id: 'data-eng', name: 'Data Engineering', demand: 'High', entryPay: '$90k', tools: ['Apache Airflow', 'SQL', 'Spark'], blurb: 'You build and maintain the pipelines that move and clean data at scale, so analysts and models have something reliable to work with.' },
    { id: 'data-science', name: 'Data Science / Analytics', demand: 'High', entryPay: '$85k', tools: ['Python (pandas)', 'Jupyter', 'SQL'], blurb: 'You dig through data to find patterns and answer business questions, using statistics as much as code.' },
    { id: 'ml', name: 'Machine Learning / AI Engineering', demand: 'High', entryPay: '$100k', tools: ['PyTorch or TensorFlow', 'Python', 'Jupyter'], blurb: 'You build and deploy models that learn from data — equal parts research, engineering, and experimentation.' },
    { id: 'infra', name: 'Cloud / DevOps', demand: 'High', entryPay: '$90k', tools: ['Docker', 'Kubernetes', 'Terraform'], blurb: 'You build the platform other engineers ship on top of — CI/CD, cloud infrastructure, observability, and uptime.' },
    { id: 'security', name: 'Security / Cybersecurity', demand: 'Very high', entryPay: '$90k', tools: ['Burp Suite', 'Wireshark', 'Metasploit'], blurb: 'You think like an attacker to defend systems — from code review to incident response.' },
    { id: 'qa', name: 'QA / Test Engineering', demand: 'Moderate', entryPay: '$70k', tools: ['Selenium or Playwright', 'Postman', 'Jira'], blurb: 'You make sure software actually works before it ships — writing automated tests and hunting for what breaks it.' },
    { id: 'it-sysadmin', name: 'IT / Systems Administration', demand: 'High', entryPay: '$55k', tools: ['Linux', 'Active Directory', 'PowerShell or Bash'], blurb: 'You keep an organization’s computers, networks, and accounts running — the first call when something’s broken.' },
    { id: 'game-dev', name: 'Game Development', demand: 'Moderate', entryPay: '$70k', tools: ['Unity or Unreal Engine', 'C# or C++', 'Git'], blurb: 'You build the interactive systems, physics, and logic that make a game actually playable.' },
    { id: 'product-ux', name: 'Product / UX design', demand: 'Moderate', entryPay: '$75k', tools: ['Figma', 'Miro', 'User research tools'], blurb: 'You shape how the product feels to use — research, flows, and the handoff between design and engineering.' },
    { id: 'sre', name: 'Site Reliability Engineering', demand: 'Very high', entryPay: '$95k', tools: ['Kubernetes', 'Prometheus', 'Terraform'], blurb: 'You keep production systems fast and available, treating operations as a software engineering problem — automation over manual fixes.' },
    { id: 'embedded', name: 'Embedded Systems / Firmware', demand: 'High', entryPay: '$80k', tools: ['C', 'RTOS', 'Oscilloscope / debugger'], blurb: 'You write the low-level software that runs directly on hardware — sensors, microcontrollers, and the devices around us.' },
    { id: 'dba', name: 'Database Administration', demand: 'Moderate', entryPay: '$70k', tools: ['PostgreSQL', 'MySQL', 'pgAdmin'], blurb: 'You keep an organization’s databases fast, backed up, and available — tuning queries and planning for scale.' },
    { id: 'network', name: 'Network Engineering', demand: 'High', entryPay: '$65k', tools: ['Cisco IOS', 'Wireshark', 'BGP / routing protocols'], blurb: 'You design and maintain the networks that connect everything — routers, firewalls, and the traffic between them.' },
    { id: 'cloud-architect', name: 'Cloud Architecture', demand: 'High', entryPay: '$110k', tools: ['AWS / Azure / GCP', 'Terraform', 'Well-Architected frameworks'], blurb: 'You design the overall cloud systems a company runs on — cost, security, and scalability decisions, not day-to-day ops.' },
    { id: 'computer-vision', name: 'Computer Vision Engineering', demand: 'High', entryPay: '$105k', tools: ['OpenCV', 'PyTorch', 'CUDA'], blurb: 'You build systems that interpret images and video — object detection, tracking, and visual understanding.' },
    { id: 'blockchain', name: 'Blockchain / Web3 Development', demand: 'Moderate', entryPay: '$90k', tools: ['Solidity', 'Hardhat / Foundry', 'Ethers.js'], blurb: 'You build decentralized applications and smart contracts — a young field with its own tooling and security concerns.' },
    { id: 'ar-vr', name: 'AR / VR Development', demand: 'Moderate', entryPay: '$80k', tools: ['Unity', 'Unreal Engine', 'ARKit / ARCore'], blurb: 'You build immersive experiences for headsets and mobile AR — spatial computing that’s still finding its footing.' },
    { id: 'robotics', name: 'Robotics Software Engineering', demand: 'Moderate', entryPay: '$85k', tools: ['ROS', 'C++', 'Python'], blurb: 'You write the software that senses, plans, and controls physical robots — equal parts software and real-world physics.' },
    { id: 'solutions-eng', name: 'Solutions Engineering', demand: 'High', entryPay: '$85k', tools: ['APIs / SDKs', 'Demo environments', 'CRM tools'], blurb: 'You’re the technical voice in the sales process — demoing, prototyping, and answering "can your product actually do X."' },
    { id: 'devrel', name: 'Developer Relations', demand: 'Moderate', entryPay: '$75k', tools: ['Documentation tools', 'Sample apps', 'Community platforms'], blurb: 'You help other developers succeed with a product — writing docs, building demos, speaking, and gathering feedback.' },
    { id: 'eng-management', name: 'Engineering Management', demand: 'High', entryPay: '$110k', tools: ['1:1s and planning tools', 'Code review', 'Roadmapping'], blurb: 'You lead a team of engineers — unblocking them, planning work, and staying technical enough to make good calls.' }
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
    'data-eng': [
      { title: 'Data Engineer', blurb: 'Build and maintain the pipelines that move and shape data reliably.' },
      { title: 'Analytics Engineer', blurb: 'Turn raw data into trustworthy, well-modeled datasets others can build on.' },
      { title: 'ETL Developer', blurb: 'Build the jobs that extract, clean, and load data between systems.' }
    ],
    'data-science': [
      { title: 'Data Scientist', blurb: 'Dig through data to find patterns and answer business questions.' },
      { title: 'Data Analyst', blurb: 'Turn data into reports and dashboards that drive real decisions.' },
      { title: 'Business Intelligence Analyst', blurb: 'Build the metrics and dashboards leadership actually watches.' }
    ],
    ml: [
      { title: 'Machine Learning Engineer', blurb: 'Take models from notebook to production, and keep them running well.' },
      { title: 'AI Engineer', blurb: 'Build applications and systems powered by machine learning models.' },
      { title: 'Research Engineer', blurb: 'Prototype and evaluate new modeling approaches before they ship.' }
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
    qa: [
      { title: 'QA Engineer', blurb: 'Write automated tests and hunt for what breaks before it ships.' },
      { title: 'Test Automation Engineer', blurb: 'Build the frameworks and pipelines that catch regressions automatically.' },
      { title: 'QA Analyst', blurb: 'Manually and systematically verify a product works as intended.' }
    ],
    'it-sysadmin': [
      { title: 'IT Support Specialist', blurb: 'The first call when someone’s computer, account, or network breaks.' },
      { title: 'Systems Administrator', blurb: 'Keep servers, networks, and accounts running and secure.' },
      { title: 'Help Desk Technician', blurb: 'Triage and resolve day-to-day technical issues across an organization.' }
    ],
    'game-dev': [
      { title: 'Gameplay Engineer', blurb: 'Build the interactive systems and logic that make a game playable.' },
      { title: 'Game Engine Programmer', blurb: 'Build and maintain the underlying engine tools and systems.' },
      { title: 'Technical Game Designer', blurb: 'Bridge design and code to prototype and tune how a game feels.' }
    ],
    sre: [
      { title: 'Site Reliability Engineer', blurb: 'Keep production systems up, fast, and observable, automating away repeat fixes.' },
      { title: 'Reliability Engineer', blurb: 'Build the monitoring and incident-response systems that catch problems early.' },
      { title: 'Infrastructure Engineer', blurb: 'Build and maintain the platform other engineers deploy on.' }
    ],
    embedded: [
      { title: 'Embedded Software Engineer', blurb: 'Write the firmware that runs directly on hardware.' },
      { title: 'Firmware Engineer', blurb: 'Build the low-level code that boots and controls a device.' },
      { title: 'IoT Engineer', blurb: 'Connect physical devices to the internet and to each other.' }
    ],
    dba: [
      { title: 'Database Administrator', blurb: 'Keep databases fast, backed up, and available.' },
      { title: 'Database Engineer', blurb: 'Design schemas and tune queries for systems at scale.' },
      { title: 'Data Reliability Engineer', blurb: 'Make sure the data pipeline itself never becomes the outage.' }
    ],
    network: [
      { title: 'Network Engineer', blurb: 'Design and maintain the networks that connect everything.' },
      { title: 'Network Administrator', blurb: 'Keep an organization’s network running day to day.' },
      { title: 'Network Security Engineer', blurb: 'Defend the network layer against intrusion and misuse.' }
    ],
    'cloud-architect': [
      { title: 'Cloud Architect', blurb: 'Design the overall cloud systems a company runs on.' },
      { title: 'Solutions Architect', blurb: 'Design technical systems that meet a specific business need.' },
      { title: 'Platform Architect', blurb: 'Design the shared platform other teams build their systems on.' }
    ],
    'computer-vision': [
      { title: 'Computer Vision Engineer', blurb: 'Build systems that interpret images and video.' },
      { title: 'Perception Engineer', blurb: 'Build the sensing systems that let machines understand their surroundings.' },
      { title: 'ML Engineer, Vision', blurb: 'Take vision models from research to a shipped product.' }
    ],
    blockchain: [
      { title: 'Blockchain Developer', blurb: 'Build decentralized applications and smart contracts.' },
      { title: 'Smart Contract Engineer', blurb: 'Write and audit the contracts that run on-chain.' },
      { title: 'Web3 Engineer', blurb: 'Build the frontend and infrastructure around decentralized apps.' }
    ],
    'ar-vr': [
      { title: 'AR/VR Engineer', blurb: 'Build immersive experiences for headsets and mobile AR.' },
      { title: 'Game Engine Programmer', blurb: 'Build and maintain the underlying engine tools and systems.' },
      { title: 'Spatial Computing Engineer', blurb: 'Build software that understands and reacts to physical space.' }
    ],
    robotics: [
      { title: 'Robotics Software Engineer', blurb: 'Write the software that senses, plans, and controls physical robots.' },
      { title: 'Controls Engineer', blurb: 'Design the systems that keep a robot’s movement stable and precise.' },
      { title: 'Autonomy Engineer', blurb: 'Build the decision-making systems behind self-directed robots or vehicles.' }
    ],
    'solutions-eng': [
      { title: 'Solutions Engineer', blurb: 'Be the technical voice in the sales process — demos, prototypes, answers.' },
      { title: 'Sales Engineer', blurb: 'Help prospective customers see exactly how a product solves their problem.' },
      { title: 'Implementation Engineer', blurb: 'Get a new customer’s setup actually working after the sale closes.' }
    ],
    devrel: [
      { title: 'Developer Advocate', blurb: 'Help other developers succeed with a product — docs, demos, talks.' },
      { title: 'Technical Writer', blurb: 'Write the documentation developers actually rely on.' },
      { title: 'Community Engineer', blurb: 'Build tools and content that support a developer community.' }
    ],
    'eng-management': [
      { title: 'Engineering Manager', blurb: 'Lead a team of engineers — unblocking them and planning the work.' },
      { title: 'Tech Lead', blurb: 'Set technical direction for a team while still writing code.' },
      { title: 'Director of Engineering', blurb: 'Set direction across multiple teams and their managers.' }
    ],
    custom: [
      { title: 'Explore this on your own', blurb: 'There’s no role ladder for a custom field yet — specify a role directly instead.' }
    ]
  };

  var LEVEL_PREFIX = { student: 'Junior ', early: 'Junior ', mid: '', senior: 'Senior ' };

  function computeRoleRecommendations(fieldId, ans) {
    var templates = ROLE_TEMPLATES[fieldId] || ROLE_TEMPLATES.fullstack;
    var prefix = LEVEL_PREFIX[ans.level] || '';
    return templates.map(function (t) { return { title: prefix + t.title, blurb: t.blurb }; });
  }

  // One-shot: the person fills in a short profile form once, this is sent as
  // a single message, and the model returns a JSON recommendation directly —
  // no back-and-forth conversation, so there's only ever one AI wait.
  var FIELDS_PROMPT_BASE = 'You are a career-fit assessor for Trefelle, a hands-on career-exploration platform for computer science, IT, and data-related fields. You are given one description of a person\'s background in a single message: their experience level, languages/tools used, past roles or internships, education, and anything they said interests them, plus optionally pasted resume/LinkedIn text. Based on this alone, recommend which specific field(s) genuinely fit them — you get exactly one read, so use everything given and make a real judgment rather than defaulting to the most generic-sounding option.\nThe scope is computer science, information technology, and data-related fields ONLY: backend/API development, frontend development, full-stack development, mobile development, data engineering, data science/analytics, machine learning/AI engineering, computer vision, cloud/DevOps engineering, site reliability engineering, cloud architecture, security/cybersecurity, network engineering, database administration, embedded systems/firmware, robotics software, blockchain/web3 development, AR/VR development, QA/test engineering, IT/systems administration, game development, product/UX design, solutions engineering, developer relations, and engineering management — plus closely related fields not listed here if they clearly fit better. Never recommend a field outside this scope (no mechanical, civil, electrical, aerospace, or other non-computing engineering disciplines), even if their background mentions one.\nAssume they may know little about a field\'s daily reality yet — judge fit from their stated experience, tools, and curiosity, not from whether they already use the field\'s insider vocabulary.\nRecommend as many fields as genuinely fit well — usually 2 to 4, never more than 6 — ranked best fit first. Do not pad the list with a poor fit just to reach a round number, and do not recommend only one unless everything else given is a clearly poor match.\nFor "level": "student" = no professional work in the field yet; "early" = professional role held, under ~2 years; "mid" = roughly 3-6 years of professional work; "senior" = 7+ years or demonstrated technical leadership. If their stated experience level already answers this, use it directly rather than re-deriving it.\nRespond with ONLY strict JSON, nothing else, no markdown fences, no prose outside the JSON, in exactly this shape: {"type":"done","level":"student|early|mid|senior","fields":[{"name":"Field name","why":"one sentence on why this fits them specifically, referencing something from their background","blurb":"one sentence describing what someone in this field actually does day to day","demand":"rough demand label","entryPay":"a single rough entry-level figure, e.g. \\"$75k\\"","tools":["2 to 3 real tools or technologies commonly used in this field"],"roles":[{"title":"role title","blurb":"one sentence"},{"title":"role title","blurb":"one sentence"},{"title":"role title","blurb":"one sentence"}]}]}';

  // For each field+role the person is comparing, generates a concrete skills
  // breakdown and role-bridging suggestions -- one shot, same shape for
  // every role so the cards line up regardless of how many fields they picked.
  var ROLE_DETAIL_PROMPT = 'You are given a JSON array of {"field":"...","role":"..."} pairs a person is considering, inside Trefelle, a career-exploration platform. For EACH pair, in the same order, provide a short, concrete skills breakdown: "skillsNeeded" (3-5 specific skills or tools someone needs to actually get hired into this exact role today), "skillsToLearn" (3-5 skills that would help them grow past entry-level in this specific role), "usefulSkills" (2-4 adjacent skills that aren\'t required but commonly help), and "futurePathways" (2-4 short, real role titles a person could realistically move into from here -- e.g. a backend engineer could bridge into platform engineering, engineering management, or security). Keep every item a short phrase, not a sentence. Never repeat the same item across the four lists for one role, and never repeat the role or field name itself as an item.\nRespond with ONLY strict JSON, nothing else, no markdown fences, in exactly this shape: {"type":"done","roles":[{"skillsNeeded":["...","..."],"skillsToLearn":["...","..."],"usefulSkills":["...","..."],"futurePathways":["...","..."]}]} with exactly one entry per input pair, in the same order.';

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

  function fileToText(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result || '')); };
      reader.onerror = function () { reject(new Error('Couldn’t read that file — try pasting the text instead.')); };
      reader.readAsText(file);
    });
  }

  function extractPdfText(file) {
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

  // No supported model is guaranteed to have vision anymore, so a resume
  // file is just read into plain text and dropped into the paste box —
  // simple, and the person can see/edit exactly what got captured.
  function readProfileFile(file) {
    var name = (file.name || '').toLowerCase();
    if (name.endsWith('.txt')) return fileToText(file);
    if (name.endsWith('.pdf')) return extractPdfText(file);
    if (name.endsWith('.docx')) {
      return loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js').then(function () {
        return file.arrayBuffer();
      }).then(function (buf) {
        return window.mammoth.extractRawText({ arrayBuffer: buf });
      }).then(function (result) { return result.value || ''; });
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

  // Trefelle runs entirely on keys you bring — any provider works (OpenAI,
  // Groq, OpenRouter, Anthropic, and most others), as long as the model
  // supports reasoning; vision isn't required. Keys can be stacked: when
  // one hits its rate limit mid-conversation, the same request is retried
  // against the next key automatically, carrying the conversation forward
  // since nothing is stored server-side per key — it's just resent.
  // The actual network/dispatch logic lives in ai-client.js (window.TrefelleAI)
  // so /practice can reuse the same connected keys from a separate page load.
  function aiAvailable(ans) { return window.TrefelleAI.aiAvailable(ans); }
  function callAI(messages, signal) { return window.TrefelleAI.callAI(answers.keyStack, messages, signal); }
  var WEBLLM_MODEL_ID = window.TrefelleAI.WEBLLM_MODEL_ID;

  function pushKeyEntry() {
    if (!answers.provider) return;
    // Anthropic always needs a key; an openai-compatible endpoint (including
    // a local server) usually doesn't, so only that one is required.
    if (answers.provider === 'anthropic' && !answers.apiKey) return;
    if (answers.provider === 'openai' && !answers.byokEndpoint) return;
    answers.keyStack = answers.keyStack || [];
    answers.keyStack.push({
      provider: answers.provider,
      byokEndpoint: answers.byokEndpoint || '',
      byokModel: answers.byokModel || '',
      apiKey: answers.apiKey || ''
    });
    saveAnswers();
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
      question: 'Connect an AI key.',
      body: 'Trefelle runs on a key you bring — any provider works (OpenAI, Groq, OpenRouter, Anthropic, and most others). No hosted mentor exists yet, so this is the only path in for now. The one requirement: your model needs to support reasoning (extended thinking / chain-of-thought). Vision is not required, so free reasoning-only models work fine.',
      render: function (el) {
        var actions = document.createElement('div');
        actions.className = 'setup-actions';
        actions.appendChild(button('Get started', 'setup-primary', function () { go('byok_provider'); }));
        el.appendChild(actions);
        var link = document.createElement('a');
        link.href = '/requirements';
        link.target = '_blank';
        link.rel = 'noopener';
        link.className = 'setup-note-link';
        link.textContent = 'Why an API key, and who this is for right now →';
        el.appendChild(link);
      }
    },
    byok_provider: {
      eyebrow: 'AI SETUP',
      question: 'Which provider are you using?',
      body: 'Pick the wire format your key speaks — most providers (OpenAI, Groq, OpenRouter, Together, and others) use the same OpenAI-compatible format; Anthropic has its own.',
      options: [
        { label: 'OpenAI-compatible', hint: 'OpenAI, Groq, OpenRouter, Together, and most others', value: 'openai', next: 'byok_endpoint' },
        { label: 'Run it locally', hint: 'Ollama, LM Studio, or any local server · free, no key needed', value: 'openai', action: function (done) { answers.apiKey = ''; done(); }, next: 'byok_local_endpoint' },
        { label: 'Anthropic', hint: 'Claude models', value: 'anthropic', next: 'byok_model' },
        { label: 'Run it in your browser', hint: 'WebLLM · free, needs a capable GPU', value: 'webllm', next: 'webllm_check' }
      ],
      onSelect: function (value) { answers.provider = value; },
      render: function (el) {
        var toggleWrap = document.createElement('div');
        toggleWrap.className = 'setup-options';
        toggleWrap.style.marginTop = '10px';
        var toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'setup-option';
        var toggleText = document.createElement('span');
        var toggleMain = document.createElement('span');
        toggleMain.textContent = 'Import saved keys';
        toggleText.appendChild(toggleMain);
        var toggleHint = document.createElement('small');
        toggleHint.textContent = 'Paste or upload a JSON file of keys you saved before';
        toggleText.appendChild(toggleHint);
        var toggleArrow = document.createElement('span');
        toggleArrow.className = 'arrow';
        toggleArrow.textContent = '→';
        toggle.appendChild(toggleText);
        toggle.appendChild(toggleArrow);
        toggleWrap.appendChild(toggle);
        el.appendChild(toggleWrap);

        var panel = document.createElement('div');
        panel.className = 'setup-field';
        panel.style.marginTop = '14px';
        panel.hidden = true;

        var textarea = document.createElement('textarea');
        textarea.rows = 6;
        textarea.spellcheck = false;
        textarea.placeholder = '[\n  { "provider": "openai", "byokEndpoint": "https://api.groq.com/openai/v1/chat/completions", "byokModel": "openai/gpt-oss-120b", "apiKey": "sk-..." },\n  { "provider": "anthropic", "byokModel": "claude-sonnet-5", "apiKey": "sk-ant-..." },\n  { "provider": "webllm" }\n]';
        panel.appendChild(textarea);

        var uploadLabel = document.createElement('label');
        uploadLabel.className = 'setup-upload-btn';
        uploadLabel.textContent = 'Or choose a .json file';
        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'application/json,.json';
        fileInput.addEventListener('change', function () {
          var file = fileInput.files && fileInput.files[0];
          if (!file) return;
          var reader = new FileReader();
          reader.onload = function () { textarea.value = String(reader.result || ''); };
          reader.readAsText(file);
        });
        uploadLabel.appendChild(fileInput);
        panel.appendChild(uploadLabel);

        var hint = document.createElement('p');
        hint.className = 'setup-hint';
        hint.textContent = 'A JSON array of key objects: provider ("openai", "anthropic", or "webllm"), byokModel, apiKey, and byokEndpoint (openai-compatible keys only — webllm needs none of those).';
        panel.appendChild(hint);

        var error = document.createElement('p');
        error.className = 'setup-note error';
        error.hidden = true;
        panel.appendChild(error);

        var panelActions = document.createElement('div');
        panelActions.className = 'setup-actions';
        panelActions.appendChild(button('Import keys', 'setup-primary', function () {
          var entries;
          try {
            entries = JSON.parse(textarea.value);
          } catch (e) {
            error.textContent = 'That isn’t valid JSON.';
            error.hidden = false;
            return;
          }
          if (!Array.isArray(entries) || !entries.length) {
            error.textContent = 'Expected a JSON array with at least one key.';
            error.hidden = false;
            return;
          }
          for (var i = 0; i < entries.length; i++) {
            var entry = entries[i] || {};
            if (entry.provider !== 'openai' && entry.provider !== 'anthropic' && entry.provider !== 'webllm') {
              error.textContent = 'Entry ' + (i + 1) + ': provider must be "openai", "anthropic", or "webllm".';
              error.hidden = false;
              return;
            }
            if (entry.provider !== 'webllm' && !entry.byokModel) {
              error.textContent = 'Entry ' + (i + 1) + ': needs a byokModel.';
              error.hidden = false;
              return;
            }
            if (entry.provider === 'anthropic' && !entry.apiKey) {
              error.textContent = 'Entry ' + (i + 1) + ': Anthropic keys need an apiKey.';
              error.hidden = false;
              return;
            }
            if (entry.provider === 'openai' && !entry.byokEndpoint) {
              error.textContent = 'Entry ' + (i + 1) + ': openai-compatible keys need a byokEndpoint (apiKey is optional for local servers).';
              error.hidden = false;
              return;
            }
          }
          error.hidden = true;
          answers.keyStack = answers.keyStack || [];
          entries.forEach(function (entry) {
            answers.keyStack.push(entry.provider === 'webllm'
              ? { provider: 'webllm', byokEndpoint: '', byokModel: WEBLLM_MODEL_ID, apiKey: '' }
              : {
                provider: entry.provider,
                byokEndpoint: entry.byokEndpoint || '',
                byokModel: entry.byokModel,
                apiKey: entry.apiKey || ''
              });
          });
          answers.provider = null;
          answers.byokEndpoint = '';
          answers.byokModel = '';
          answers.apiKey = '';
          saveAnswers();
          go('byok_add_another');
        }));
        panel.appendChild(panelActions);

        toggle.addEventListener('click', function () {
          panel.hidden = !panel.hidden;
          toggleMain.textContent = panel.hidden ? 'Import saved keys' : 'Hide import panel';
          toggleHint.textContent = panel.hidden ? 'Paste or upload a JSON file of keys you saved before' : 'Collapse this panel';
          toggleArrow.textContent = panel.hidden ? '→' : '×';
          if (!panel.hidden) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });

        el.appendChild(panel);
      }
    },
    byok_endpoint: {
      eyebrow: 'AI SETUP',
      question: 'What’s the API base URL?',
      field: { placeholder: 'https://api.groq.com/openai/v1/chat/completions', hint: 'The full chat-completions URL — check your provider’s docs for the exact address.', key: 'byokEndpoint', type: 'text' },
      next: 'byok_model'
    },
    byok_local_endpoint: {
      eyebrow: 'AI SETUP',
      question: 'Where’s it running?',
      body: 'Ollama’s default is http://localhost:11434/v1/chat/completions — LM Studio’s is usually http://localhost:1234/v1/chat/completions.',
      field: {
        placeholder: 'http://localhost:11434/v1/chat/completions', key: 'byokEndpoint', type: 'text',
        hint: 'Most local servers don’t need a key — you can skip that step next.',
        default: function () { return 'http://localhost:11434/v1/chat/completions'; }
      },
      next: 'byok_local_discover'
    },
    byok_local_discover: {
      hideHeader: true,
      render: function (el) {
        var eyebrow = document.createElement('p');
        eyebrow.className = 'step-eyebrow';
        eyebrow.textContent = 'AI SETUP';
        el.appendChild(eyebrow);
        var h1 = document.createElement('h1');
        h1.textContent = 'Looking for models on your local server…';
        el.appendChild(h1);
        var status = document.createElement('p');
        status.className = 'step-body';
        status.textContent = 'Checking ' + answers.byokEndpoint;
        el.appendChild(status);
        var body = document.createElement('div');
        el.appendChild(body);

        window.TrefelleAI.discoverLocalModels(answers.byokEndpoint).then(function (models) {
          status.remove();
          var note = document.createElement('p');
          note.className = 'setup-hint';
          note.textContent = 'Found ' + models.length + ' model' + (models.length === 1 ? '' : 's') + ' — pick one:';
          body.appendChild(note);
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
              answers.byokModel = name;
              go('byok_add_another');
            });
            list.appendChild(b);
          });
          body.appendChild(list);
          var manualLink = document.createElement('a');
          manualLink.href = '#';
          manualLink.className = 'setup-note-link';
          manualLink.textContent = 'Type a model name instead →';
          manualLink.addEventListener('click', function (e) { e.preventDefault(); go('byok_local_model'); });
          body.appendChild(manualLink);
        }).catch(function () {
          status.textContent = '';
          var note = document.createElement('p');
          note.className = 'setup-note error';
          note.textContent = 'Couldn’t reach a local server automatically — make sure it’s running, or enter the model name yourself.';
          body.appendChild(note);
          var actions = document.createElement('div');
          actions.className = 'setup-actions';
          actions.appendChild(button('Try again', 'setup-primary', function () { go('byok_local_discover', true); }));
          actions.appendChild(button('Type it manually', 'setup-secondary', function () { go('byok_local_model'); }));
          body.appendChild(actions);
        });
      }
    },
    byok_local_model: {
      eyebrow: 'AI SETUP',
      question: 'Which model are you using?',
      body: 'It needs to support reasoning (extended thinking / chain-of-thought) — vision is not required.',
      field: { placeholder: 'e.g. llama3.1:70b, mistral, qwen2.5-coder', hint: 'Type the exact model name/ID your local server expects.', key: 'byokModel', type: 'text' },
      next: 'byok_add_another'
    },
    byok_model: {
      eyebrow: 'AI SETUP',
      question: 'Which model are you using?',
      body: 'It needs to support reasoning (extended thinking / chain-of-thought) — vision is not required.',
      field: { placeholder: 'e.g. openai/gpt-oss-120b, claude-sonnet-5, gpt-4o', hint: 'Type the exact model name/ID your provider expects.', key: 'byokModel', type: 'text' },
      next: 'byok_key'
    },
    byok_key: {
      eyebrow: 'AI SETUP',
      question: 'Paste your API key.',
      field: { placeholder: 'sk-...', hint: 'Stored only in your browser. Never sent to Trefelle.', key: 'apiKey', type: 'password' },
      next: 'byok_add_another'
    },
    byok_add_another: {
      eyebrow: 'AI SETUP',
      question: 'Add a backup key?',
      body: 'When one key hits its rate limit mid-conversation, Trefelle automatically retries with the next key and keeps the same conversation going — handy if you’re stacking a few free-tier keys.',
      render: function (el) {
        var effectiveCount = (answers.keyStack ? answers.keyStack.length : 0) + (answers.provider && answers.apiKey ? 1 : 0);
        if (effectiveCount) {
          var summary = document.createElement('p');
          summary.className = 'setup-note';
          summary.textContent = effectiveCount + ' key' + (effectiveCount === 1 ? '' : 's') + ' connected so far.';
          el.appendChild(summary);
        }
        var actions = document.createElement('div');
        actions.className = 'setup-actions';
        actions.appendChild(button('Add another key', 'setup-secondary', function () {
          pushKeyEntry();
          answers.provider = null;
          answers.byokEndpoint = '';
          answers.byokModel = '';
          answers.apiKey = '';
          go('byok_provider');
        }));
        actions.appendChild(button('Continue', 'setup-primary', function () {
          pushKeyEntry();
          go('assess_intro');
        }));
        el.appendChild(actions);
      }
    },
    webllm_check: {
      eyebrow: 'AI SETUP',
      question: 'Checking your browser for WebGPU.',
      body: 'The only model that both reasons and fits a normal GPU is ' + WEBLLM_MODEL_ID + ' — about 5GB to download once, cached in your browser after that. You’ll want 6GB+ of VRAM.',
      render: function (el) {
        var supported = !!navigator.gpu;
        var note = document.createElement('p');
        note.className = supported ? 'setup-note' : 'setup-note error';
        note.textContent = supported
          ? 'WebGPU is available in this browser.'
          : 'This browser doesn’t support WebGPU — try a recent Chrome or Edge, or pick a different option.';
        el.appendChild(note);
        var actions = document.createElement('div');
        actions.className = 'setup-actions';
        if (supported) {
          actions.appendChild(button('Download and use this model', 'setup-primary', function () { go('webllm_download'); }));
        }
        actions.appendChild(button('Back', 'setup-secondary', function () { go('byok_provider'); }));
        el.appendChild(actions);
      }
    },
    webllm_download: {
      eyebrow: 'AI SETUP',
      question: 'Loading ' + WEBLLM_MODEL_ID + '.',
      render: function (el) {
        var status = document.createElement('p');
        status.className = 'step-body';
        status.textContent = 'Starting…';
        el.appendChild(status);
        var errorNote = document.createElement('p');
        errorNote.className = 'setup-note error';
        errorNote.hidden = true;
        el.appendChild(errorNote);
        var actions = document.createElement('div');
        actions.className = 'setup-actions';
        el.appendChild(actions);

        window.TrefelleAI.getWebLLMEngine(function (report) {
          status.textContent = report && report.text ? report.text : 'Loading…';
        }).then(function () {
          answers.keyStack = answers.keyStack || [];
          answers.keyStack.push({ provider: 'webllm', byokEndpoint: '', byokModel: WEBLLM_MODEL_ID, apiKey: '' });
          saveAnswers();
          go('byok_add_another');
        }).catch(function (err) {
          status.textContent = 'Couldn’t load the model.';
          errorNote.textContent = (err && err.message) || 'Something went wrong — try again.';
          errorNote.hidden = false;
          actions.appendChild(button('Try again', 'setup-primary', function () { go('webllm_download', true); }));
          actions.appendChild(button('Back', 'setup-secondary', function () { go('byok_provider'); }));
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
      body: 'Paste your resume text or LinkedIn URL, or upload a file and we\'ll drop its text in below for you to check. Totally optional.',
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
        form.appendChild(uploadRow);
        form.appendChild(uploadStatus);

        fileInput.addEventListener('change', function () {
          var file = fileInput.files && fileInput.files[0];
          fileInput.value = '';
          if (!file) return;
          uploadStatus.classList.remove('error');
          if (file.size > MAX_RESUME_BYTES) {
            uploadStatus.classList.add('error');
            uploadStatus.textContent = 'That file is over 5 MB — try a smaller file or paste the text instead.';
            return;
          }
          uploadStatus.textContent = 'Reading ' + file.name + '…';
          readProfileFile(file).then(function (text) {
            text = (text || '').trim();
            if (!text) {
              uploadStatus.classList.add('error');
              uploadStatus.textContent = 'Couldn’t find any text in that file — try pasting instead.';
              return;
            }
            textarea.value = text;
            uploadStatus.textContent = 'Loaded ' + file.name + '.';
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
          go('assess_profile_form');
        }));
        form.appendChild(actions);

        form.addEventListener('submit', function (e) {
          e.preventDefault();
          answers.profileImport = textarea.value.trim();
          go('assess_profile_form');
        });

        el.appendChild(form);
        setTimeout(function () { textarea.focus(); }, 260);
      }
    },
    assess_profile_form: {
      hideHeader: true,
      render: function (el) {
        var eyebrow = document.createElement('p');
        eyebrow.className = 'step-eyebrow';
        eyebrow.textContent = 'ABOUT YOU';
        el.appendChild(eyebrow);
        var h1 = document.createElement('h1');
        h1.textContent = 'Tell us a bit about your background.';
        el.appendChild(h1);
        var body = document.createElement('p');
        body.className = 'step-body';
        body.textContent = 'One AI read of this decides which fields and roles genuinely fit you — no back-and-forth. Everything here is optional except experience level.';
        el.appendChild(body);

        var form = document.createElement('form');
        form.className = 'setup-field';
        var p = answers.profile || {};

        function group(labelText, inputEl) {
          var wrap = document.createElement('div');
          wrap.className = 'setup-field-group';
          var label = document.createElement('label');
          label.textContent = labelText;
          wrap.appendChild(label);
          wrap.appendChild(inputEl);
          form.appendChild(wrap);
          return inputEl;
        }

        var levelSelect = document.createElement('select');
        [
          ['student', 'Student, bootcamp, or self-taught'],
          ['early', 'Early career (0–2 years)'],
          ['mid', 'Mid-level (3–6 years)'],
          ['senior', 'Senior+ (7+ years)']
        ].forEach(function (pair) {
          var opt = document.createElement('option');
          opt.value = pair[0];
          opt.textContent = pair[1];
          if (p.level === pair[0]) opt.selected = true;
          levelSelect.appendChild(opt);
        });
        group('Experience level', levelSelect);

        var languagesInput = document.createElement('input');
        languagesInput.type = 'text';
        languagesInput.placeholder = 'e.g. Python, JavaScript, SQL';
        languagesInput.value = p.languages || '';
        group('Languages / tools you’ve used', languagesInput);

        var rolesInput = document.createElement('input');
        rolesInput.type = 'text';
        rolesInput.placeholder = 'e.g. Summer internship doing QA, none yet';
        rolesInput.value = p.roles || '';
        group('Past roles or internships (optional)', rolesInput);

        var educationInput = document.createElement('input');
        educationInput.type = 'text';
        educationInput.placeholder = 'e.g. CS degree in progress, self-taught';
        educationInput.value = p.education || '';
        group('Education (optional)', educationInput);

        var interestInput = document.createElement('input');
        interestInput.type = 'text';
        interestInput.placeholder = 'e.g. Something data-related, not sure yet';
        interestInput.value = p.interest || '';
        group('Field or role you’re curious about (optional)', interestInput);

        var actions = document.createElement('div');
        actions.className = 'setup-actions';
        var submit = document.createElement('button');
        submit.type = 'submit';
        submit.className = 'setup-primary';
        submit.textContent = 'Find my fields';
        actions.appendChild(submit);
        form.appendChild(actions);

        form.addEventListener('submit', function (e) {
          e.preventDefault();
          answers.profile = {
            level: levelSelect.value,
            languages: languagesInput.value.trim(),
            roles: rolesInput.value.trim(),
            education: educationInput.value.trim(),
            interest: interestInput.value.trim()
          };
          go('assess_fields');
        });

        el.appendChild(form);
      }
    },
    assess_fields: {
      hideHeader: true,
      render: function (el) {
        if (!aiAvailable(answers)) {
          var note = document.createElement('p');
          note.className = 'setup-note';
          note.textContent = 'No connected AI model yet — pick a field directly instead.';
          el.appendChild(note);
          setTimeout(function () { go('field_results', true); }, 900);
          return;
        }

        var eyebrow = document.createElement('p');
        eyebrow.className = 'step-eyebrow';
        eyebrow.textContent = 'FINDING YOUR FIT';
        el.appendChild(eyebrow);
        var h1 = document.createElement('h1');
        h1.textContent = 'Reading your background…';
        el.appendChild(h1);
        var status = document.createElement('p');
        status.className = 'step-body';
        status.textContent = 'This takes a few seconds.';
        el.appendChild(status);
        var errorBox = document.createElement('div');
        errorBox.hidden = true;
        el.appendChild(errorBox);

        var p = answers.profile || {};
        var profileText = 'Experience level: ' + (p.level || 'not specified') + '\n' +
          'Languages/tools used: ' + (p.languages || 'none specified') + '\n' +
          'Past roles/internships: ' + (p.roles || 'none specified') + '\n' +
          'Education: ' + (p.education || 'not specified') + '\n' +
          'Field/role interest: ' + (p.interest || 'not specified');
        if (answers.profileImport) {
          profileText += '\nResume/LinkedIn text they pasted: ' + answers.profileImport;
        }
        var messages = [
          { role: 'system', content: FIELDS_PROMPT_BASE },
          { role: 'user', content: profileText }
        ];

        function attempt(retryNum) {
          callAI(messages, null).then(function (text) {
            var data = parseAIJson(text);
            if (!data || !data.fields || !data.fields.length) {
              throw new Error('Couldn’t read a usable recommendation from your AI model.');
            }
            if (data.level && LEVEL_PREFIX[data.level] !== undefined) answers.level = data.level;
            answers.aiFieldRecs = data.fields.slice(0, 6).map(function (f) {
              return {
                id: slugify(f.name), name: f.name, why: f.why || '', blurb: f.blurb || f.why || '',
                demand: f.demand || 'Not tracked', entryPay: f.entryPay || 'Varies',
                tools: (f.tools || []).slice(0, 3), roles: (f.roles || []).slice(0, 3)
              };
            });
            go('field_loading');
          }).catch(function (err) {
            if (retryNum < 1) { attempt(retryNum + 1); return; }
            status.textContent = '';
            errorBox.hidden = false;
            errorBox.innerHTML = '';
            var errP = document.createElement('p');
            errP.className = 'setup-note error';
            errP.textContent = (err && err.message) || 'Something went wrong reading your background.';
            errorBox.appendChild(errP);
            var actions = document.createElement('div');
            actions.className = 'setup-actions';
            actions.appendChild(button('Try again', 'setup-primary', function () { go('assess_fields', true); }));
            actions.appendChild(button('Pick a field directly instead', 'setup-secondary', function () { go('field_results'); }));
            errorBox.appendChild(actions);
          });
        }
        attempt(0);
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
      hideHeader: true,
      wide: true,
      render: function (el) {
        answers.comparingFields = answers.comparingFields || [];

        var eyebrow = document.createElement('p');
        eyebrow.className = 'step-eyebrow';
        eyebrow.textContent = 'YOUR FIELDS';
        el.appendChild(eyebrow);
        var h1 = document.createElement('h1');
        h1.textContent = 'Compare fields before you commit.';
        el.appendChild(h1);
        var bodyP = document.createElement('p');
        bodyP.className = 'step-body';
        bodyP.textContent = 'Drag or click any role into the box to compare it — hover a card for pay and demand.';
        el.appendChild(bodyP);

        var searchTerm = '';
        var searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'compare-search';
        searchInput.placeholder = 'Search fields…';
        // Lives outside the re-rendered container so typing never loses focus.
        searchInput.addEventListener('input', function () {
          searchTerm = searchInput.value.trim().toLowerCase();
          renderContent();
        });
        el.appendChild(searchInput);

        var container = document.createElement('div');
        el.appendChild(container);

        function wireTooltip(node, f) {
          node.addEventListener('mouseenter', function () {
            hideActiveTooltip();
            var tip = document.createElement('div');
            tip.className = 'compare-tooltip';
            var rows = [['Entry-level pay', f.entryPay || 'Varies'], ['Demand', f.demand || 'Not tracked']];
            if (f.tools && f.tools.length) rows.push(['Tools', f.tools.join(', ')]);
            rows.forEach(function (row) {
              var r = document.createElement('div');
              r.className = 'compare-tooltip-row';
              var label = document.createElement('b');
              label.textContent = row[0] + ': ';
              var val = document.createElement('span');
              val.textContent = row[1];
              r.appendChild(label);
              r.appendChild(val);
              tip.appendChild(r);
            });
            var rect = node.getBoundingClientRect();
            tip.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - 260)) + 'px';
            tip.style.top = (rect.bottom + 8) + 'px';
            document.body.appendChild(tip);
            activeTooltip = tip;
          });
          node.addEventListener('mouseleave', hideActiveTooltip);
        }

        function renderContent() {
          container.innerHTML = '';
          hideActiveTooltip();

          var layout = document.createElement('div');
          layout.className = 'compare-layout';

          var dropCol = document.createElement('div');
          dropCol.className = 'compare-drop-col';
          var dropZone = document.createElement('div');
          dropZone.className = 'compare-drop';
          if (!answers.comparingFields.length) {
            var placeholder = document.createElement('p');
            placeholder.className = 'compare-placeholder';
            placeholder.textContent = 'Drag roles here to compare them';
            dropZone.appendChild(placeholder);
          }
          answers.comparingFields.forEach(function (f) {
            var chip = document.createElement('div');
            chip.className = 'compare-chip';
            var span = document.createElement('span');
            span.textContent = f.name;
            var remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'compare-chip-remove';
            remove.textContent = '×';
            remove.addEventListener('click', function () {
              answers.comparingFields = answers.comparingFields.filter(function (x) { return x !== f; });
              renderContent();
            });
            chip.appendChild(span);
            chip.appendChild(remove);
            wireTooltip(chip, f);
            dropZone.appendChild(chip);
          });
          dropCol.appendChild(dropZone);

          var dropActions = document.createElement('div');
          dropActions.className = 'setup-actions';
          var continueBtn = button('Continue', 'setup-primary', function () {
            answers.selectedFields = answers.comparingFields.slice();
            go('role_results');
          });
          continueBtn.disabled = answers.comparingFields.length === 0;
          dropActions.appendChild(continueBtn);
          dropCol.appendChild(dropActions);

          var sourceCol = document.createElement('div');
          sourceCol.className = 'compare-source-col';

          function isComparing(f) { return answers.comparingFields.indexOf(f) > -1; }

          function addToComparing(f) {
            if (isComparing(f)) return;
            answers.comparingFields.push(f);
            renderContent();
          }

          function buildSourceCard(f) {
            var card = document.createElement('div');
            card.className = 'compare-card';
            var name = document.createElement('b');
            name.textContent = f.name;
            card.appendChild(name);
            if (f.why) {
              var why = document.createElement('span');
              why.className = 'compare-card-why';
              why.textContent = f.why;
              card.appendChild(why);
            }
            wireTooltip(card, f);

            // A card is both draggable and clickable: a short pointer path with
            // no real movement counts as "click to add"; past a small threshold
            // it becomes a drag, tracked with a floating clone of the card.
            var startX, startY, dragging = false, clone = null;
            function move(e) {
              var pt = e.touches ? e.touches[0] : e;
              if (!dragging && Math.hypot(pt.clientX - startX, pt.clientY - startY) > 6) {
                dragging = true;
                hideActiveTooltip();
                clone = card.cloneNode(true);
                clone.className = 'compare-card compare-card-drag-clone';
                document.body.appendChild(clone);
              }
              if (dragging && clone) {
                clone.style.left = pt.clientX + 'px';
                clone.style.top = pt.clientY + 'px';
                var r = dropZone.getBoundingClientRect();
                var over = pt.clientX >= r.left && pt.clientX <= r.right && pt.clientY >= r.top && pt.clientY <= r.bottom;
                dropZone.classList.toggle('drag-hover', over);
              }
            }
            function up(e) {
              document.removeEventListener('mousemove', move);
              document.removeEventListener('mouseup', up);
              document.removeEventListener('touchmove', move);
              document.removeEventListener('touchend', up);
              var pt = (e.changedTouches && e.changedTouches[0]) || e;
              var wasDragging = dragging;
              if (clone) clone.remove();
              dropZone.classList.remove('drag-hover');
              if (wasDragging) {
                var r = dropZone.getBoundingClientRect();
                var over = pt.clientX >= r.left && pt.clientX <= r.right && pt.clientY >= r.top && pt.clientY <= r.bottom;
                if (over) addToComparing(f);
              } else {
                addToComparing(f);
              }
              dragging = false; clone = null;
            }
            function down(e) {
              var pt = e.touches ? e.touches[0] : e;
              startX = pt.clientX; startY = pt.clientY; dragging = false;
              document.addEventListener('mousemove', move);
              document.addEventListener('mouseup', up);
              document.addEventListener('touchmove', move, { passive: true });
              document.addEventListener('touchend', up);
            }
            card.addEventListener('mousedown', down);
            card.addEventListener('touchstart', down, { passive: true });
            return card;
          }

          function renderGroup(title, fields, boxed) {
            var visible = fields.filter(function (f) { return !isComparing(f); });
            if (!visible.length) return;
            var wrap = document.createElement('div');
            wrap.className = 'compare-group' + (boxed ? ' boxed' : '');
            var label = document.createElement('p');
            label.className = 'field-group-label';
            label.textContent = title;
            wrap.appendChild(label);
            var listEl = document.createElement('div');
            listEl.className = 'compare-card-list';
            visible.forEach(function (f) { listEl.appendChild(buildSourceCard(f)); });
            wrap.appendChild(listEl);
            sourceCol.appendChild(wrap);
          }

          var recs = answers.aiFieldRecs || [];
          var recIds = {};
          recs.forEach(function (f) { recIds[f.id] = true; });
          var others = FIELD_CATALOG.filter(function (f) {
            if (recIds[f.id]) return false;
            return !searchTerm || f.name.toLowerCase().indexOf(searchTerm) > -1;
          });

          renderGroup('Recommended for you', recs, true);
          renderGroup('Other fields', others, false);
          if (searchTerm && !others.length) {
            var noMatch = document.createElement('p');
            noMatch.className = 'setup-hint';
            noMatch.textContent = 'No fields match "' + searchTerm + '".';
            sourceCol.appendChild(noMatch);
          }

          var customLink = document.createElement('a');
          customLink.href = '#';
          customLink.className = 'setup-note-link';
          customLink.textContent = '+ Type a field not listed';
          customLink.addEventListener('click', function (e) { e.preventDefault(); go('field_custom'); });
          sourceCol.appendChild(customLink);

          layout.appendChild(dropCol);
          layout.appendChild(sourceCol);
          container.appendChild(layout);
        }

        renderContent();
      }
    },
    field_custom: {
      eyebrow: 'YOUR FIELDS',
      question: 'What field are you thinking of?',
      field: {
        placeholder: 'e.g. Game development, Robotics, Embedded systems', key: 'customField', type: 'text',
        onSubmit: function (value) {
          answers.comparingFields = answers.comparingFields || [];
          answers.comparingFields.push({ id: 'custom', name: value || 'Your field', custom: true });
        }
      },
      next: 'field_results'
    },
    role_results: {
      hideHeader: true,
      wide: true,
      render: function (el) {
        var fields = answers.selectedFields && answers.selectedFields.length ? answers.selectedFields : [{ id: 'fullstack', name: 'Full-stack' }];
        var picks = fields.map(function (f) {
          var roles = (f.roles && f.roles.length) ? f.roles : computeRoleRecommendations(f.id || 'fullstack', answers);
          return { field: f, role: roles[0] };
        });
        answers.selectedRoles = picks.map(function (p) { return { field: p.field.name, role: p.role.title }; });
        answers.role = picks[0].role.title;
        answers.roleField = picks[0].field.name;

        var eyebrow = document.createElement('p');
        eyebrow.className = 'step-eyebrow';
        eyebrow.textContent = 'ROLE MATCH';
        el.appendChild(eyebrow);
        var h1 = document.createElement('h1');
        h1.textContent = 'One role per field, mapped out.';
        el.appendChild(h1);

        var cards = picks.map(function (p) {
          var card = document.createElement('div');
          card.className = 'role-card';
          var label = document.createElement('p');
          label.className = 'field-group-label';
          label.textContent = p.field.name;
          card.appendChild(label);
          var title = document.createElement('p');
          title.className = 'role-title';
          title.textContent = p.role.title;
          card.appendChild(title);
          var blurb = document.createElement('p');
          blurb.className = 'role-blurb';
          blurb.textContent = p.role.blurb;
          card.appendChild(blurb);
          var loading = document.createElement('p');
          loading.className = 'role-loading';
          loading.textContent = 'Loading skills and pathways…';
          card.appendChild(loading);
          el.appendChild(card);
          return { card: card, loading: loading };
        });

        var actions = document.createElement('div');
        actions.className = 'setup-actions';
        actions.appendChild(button('None of these — I’ll specify my own role', 'setup-secondary', function () { go('role_manual'); }));
        actions.appendChild(button('Continue', 'setup-primary', function () { go('voice_ask'); }));
        el.appendChild(actions);

        if (!aiAvailable(answers)) { cards.forEach(function (c) { c.loading.remove(); }); return; }

        var groups = [
          ['skillsNeeded', 'Skills needed now'],
          ['skillsToLearn', 'Skills to grow into'],
          ['usefulSkills', 'Useful adjacent skills'],
          ['futurePathways', 'Future pathways']
        ];
        var messages = [
          { role: 'system', content: ROLE_DETAIL_PROMPT },
          { role: 'user', content: JSON.stringify(picks.map(function (p) { return { field: p.field.name, role: p.role.title }; })) }
        ];
        callAI(messages, null).then(function (text) {
          var data = parseAIJson(text);
          if (!data || !data.roles || data.roles.length !== picks.length) throw new Error('No detail returned.');
          cards.forEach(function (c, i) {
            c.loading.remove();
            var detail = data.roles[i];
            groups.forEach(function (g) {
              var items = detail[g[0]];
              if (!items || !items.length) return;
              var group = document.createElement('div');
              group.className = 'role-detail-group';
              var label = document.createElement('p');
              label.className = 'role-detail-label';
              label.textContent = g[1];
              group.appendChild(label);
              var list = document.createElement('ul');
              list.className = 'role-detail-list';
              items.forEach(function (item) {
                var li = document.createElement('li');
                li.textContent = item;
                list.appendChild(li);
              });
              group.appendChild(list);
              c.card.appendChild(group);
            });
          });
        }).catch(function () {
          cards.forEach(function (c) { c.loading.remove(); });
        });
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

        var stack = answers.keyStack || [];
        if (stack.length) {
          var toggle = document.createElement('a');
          toggle.href = '#';
          toggle.className = 'setup-note-link';
          toggle.textContent = 'Show my keys as JSON (for backup / re-import) →';
          el.appendChild(toggle);

          var panel = document.createElement('div');
          panel.className = 'setup-field';
          panel.style.marginTop = '14px';
          panel.hidden = true;

          var note = document.createElement('p');
          note.className = 'setup-note error';
          note.textContent = 'This is rendered only in your browser — it’s never sent to Trefelle or anyone else. Only you can see it. Keep it private: anyone with these keys can spend your API credits.';
          panel.appendChild(note);

          var textarea = document.createElement('textarea');
          textarea.rows = Math.min(12, 3 + stack.length * 2);
          textarea.readOnly = true;
          textarea.spellcheck = false;
          textarea.value = JSON.stringify(stack, null, 2);
          panel.appendChild(textarea);

          var panelActions = document.createElement('div');
          panelActions.className = 'setup-actions';
          var copyBtn = button('Copy to clipboard', 'setup-secondary', function () {
            var done = function () {
              copyBtn.textContent = 'Copied';
              setTimeout(function () { copyBtn.textContent = 'Copy to clipboard'; }, 1800);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(textarea.value).then(done, function () {
                textarea.select();
                document.execCommand('copy');
                done();
              });
            } else {
              textarea.select();
              document.execCommand('copy');
              done();
            }
          });
          panelActions.appendChild(copyBtn);
          panelActions.appendChild(button('Download .json', 'setup-secondary', function () {
            var blob = new Blob([textarea.value], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'trefelle-keys.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }));
          panel.appendChild(panelActions);

          toggle.addEventListener('click', function (e) {
            e.preventDefault();
            panel.hidden = !panel.hidden;
            toggle.textContent = panel.hidden ? 'Show my keys as JSON (for backup / re-import) →' : 'Hide my keys';
          });

          el.appendChild(panel);
        }
      }
    }
  };

  function engineLabel() {
    var stack = answers.keyStack || [];
    if (!stack.length) return 'Not connected yet';
    if (stack.length === 1) return stack[0].byokModel || (stack[0].provider === 'anthropic' ? 'Anthropic' : 'OpenAI-compatible');
    return stack.length + ' keys connected';
  }

  function levelLabel(value) {
    var labels = { student: 'Student / self-taught', early: 'Early career', mid: 'Mid-level', senior: 'Senior+' };
    return labels[value] || value;
  }

  function summaryLine() {
    var rows = [
      ['AI engine', engineLabel()],
      ['Assessment', answers.aiFieldRecs ? 'AI-guided' : 'Not answered'],
      ['Background', answers.level ? levelLabel(answers.level) : 'Not answered']
    ];
    if (answers.selectedFields && answers.selectedFields.length) {
      rows.push(['Field', answers.selectedFields.map(function (f) { return f.name; }).join(', ')]);
    }
    if (answers.selectedRoles && answers.selectedRoles.length) {
      rows.push(['Target roles', answers.selectedRoles.map(function (r) { return r.role; }).join(', ')]);
    } else if (answers.role) {
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
    hideActiveTooltip();
    stage.innerHTML = '';
    var wrap = document.createElement('div');
    wrap.className = 'step' + (step.wide ? ' step-wide' : '');

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

      var customKey = step.multi.customKey || 'customInterest';
      if (step.multi.custom) {
        var customWrap = document.createElement('div');
        customWrap.className = 'setup-field';
        customInput = document.createElement('input');
        customInput.type = 'text';
        customInput.placeholder = step.multi.customPlaceholder || 'Or type one not listed (optional)';
        customInput.autocomplete = 'off';
        customInput.value = answers[customKey] || '';
        customInput.addEventListener('input', updateContinueState);
        customWrap.appendChild(customInput);
        wrap.appendChild(customWrap);
      }

      var multiActions = document.createElement('div');
      multiActions.className = 'setup-actions';
      continueBtn = button('Continue', 'setup-primary', function () {
        answers[step.multi.key] = Array.from(selected);
        if (step.multi.custom) answers[customKey] = customInput.value.trim();
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
