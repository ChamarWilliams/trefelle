export const FIELD_CATALOG = [
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
  { id: 'biomedical', name: 'Biomedical Engineering', demand: 'Moderate', pay: '$70k – $125k+', blurb: 'You apply engineering to medicine — devices, diagnostics, and systems that directly affect patient care.' },
]

export const ROLE_TEMPLATES = {
  backend: [
    { title: 'Backend Engineer', blurb: 'Own services and APIs end to end — schema design, correctness, and performance under load.' },
    { title: 'Platform Engineer', blurb: 'Build the internal tools and services other backend teams depend on.' },
    { title: 'API Developer', blurb: 'Design and maintain the APIs that other systems integrate with.' },
  ],
  frontend: [
    { title: 'Frontend Engineer', blurb: 'Build and maintain the interfaces users interact with daily.' },
    { title: 'UI Engineer', blurb: 'Focus on component systems, performance, and pixel-accurate implementation.' },
    { title: 'Web Platform Engineer', blurb: 'Work on shared frontend infrastructure — build tooling, performance, accessibility.' },
  ],
  fullstack: [
    { title: 'Full-Stack Engineer', blurb: 'Ship features end to end, from the database to the UI.' },
    { title: 'Product Engineer', blurb: 'Work closely with product and design to build and iterate on user-facing features.' },
    { title: 'Startup Generalist Engineer', blurb: 'Wear many hats — whatever the product needs this week.' },
  ],
  data: [
    { title: 'Data Engineer', blurb: 'Build and maintain the pipelines that move and shape data reliably.' },
    { title: 'Machine Learning Engineer', blurb: 'Take models from notebook to production, and keep them running well.' },
    { title: 'Analytics Engineer', blurb: 'Turn raw data into trustworthy, well-modeled datasets others can build on.' },
  ],
  infra: [
    { title: 'DevOps Engineer', blurb: 'Build and maintain the CI/CD pipelines and infrastructure teams ship through.' },
    { title: 'Site Reliability Engineer', blurb: 'Keep production systems up, fast, and observable — and learn from what breaks.' },
    { title: 'Cloud Infrastructure Engineer', blurb: 'Design and manage the cloud infrastructure everything else runs on.' },
  ],
  security: [
    { title: 'Application Security Engineer', blurb: 'Find and fix vulnerabilities before they ship — code review, threat modeling, testing.' },
    { title: 'Security Engineer', blurb: 'Defend systems and respond when something goes wrong.' },
    { title: 'Security Analyst', blurb: 'Monitor, investigate, and triage security signals across the org.' },
  ],
  mobile: [
    { title: 'Mobile Engineer', blurb: 'Build and ship native or cross-platform mobile apps.' },
    { title: 'iOS Engineer', blurb: 'Focus on the Apple ecosystem — Swift, performance, App Store realities.' },
    { title: 'Android Engineer', blurb: 'Focus on the Android ecosystem — Kotlin, device fragmentation, performance.' },
  ],
  'product-ux': [
    { title: 'Product Designer', blurb: 'Shape flows, research, and the details of how the product feels to use.' },
    { title: 'UX Engineer', blurb: 'Sit between design and engineering — prototyping and polishing the handoff.' },
    { title: 'Product Manager', blurb: 'Decide what gets built and why, working closely with engineering and design.' },
  ],
  mechanical: [
    { title: 'Mechanical Design Engineer', blurb: 'Design and prototype mechanical components and systems using CAD and physical testing.' },
    { title: 'Manufacturing Engineer', blurb: 'Optimize how physical products are actually built, from process to tooling.' },
    { title: 'Product Development Engineer', blurb: 'Take a mechanical concept from sketch to a tested, manufacturable product.' },
  ],
  civil: [
    { title: 'Civil Engineer', blurb: 'Design and oversee infrastructure projects — from concept through construction.' },
    { title: 'Structural Engineer', blurb: 'Ensure buildings and structures can safely carry the loads they’re built for.' },
    { title: 'Transportation Engineer', blurb: 'Design roads, transit, and traffic systems that move people safely and efficiently.' },
  ],
  electrical: [
    { title: 'Electrical Engineer', blurb: 'Design and test circuits, power systems, and hardware.' },
    { title: 'Embedded Systems Engineer', blurb: 'Write the firmware that runs directly on hardware.' },
    { title: 'Hardware Engineer', blurb: 'Design the physical boards and components that power electronic products.' },
  ],
  aerospace: [
    { title: 'Aerospace Engineer', blurb: 'Design and analyze aircraft or spacecraft systems and structures.' },
    { title: 'Flight Test Engineer', blurb: 'Plan and run the tests that validate a vehicle actually flies as designed.' },
    { title: 'Propulsion Engineer', blurb: 'Design and test the systems that power flight.' },
  ],
  biomedical: [
    { title: 'Biomedical Engineer', blurb: 'Design medical devices and systems that directly affect patient outcomes.' },
    { title: 'Clinical Systems Engineer', blurb: 'Bridge engineering and healthcare delivery — deploying and maintaining medical technology.' },
    { title: 'R&D Engineer, Medical Devices', blurb: 'Research and prototype the next generation of medical devices.' },
  ],
  custom: [
    { title: 'Explore this on your own', blurb: 'There’s no role ladder for a custom field yet — specify a role directly instead.' },
  ],
}

export const LEVEL_PREFIX = { student: 'Junior ', early: 'Junior ', mid: '', senior: 'Senior ' }

export function slugify(s) {
  return (s || 'field').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'field'
}

function fieldWhy(id, ans) {
  const matched = (ans.interests || []).some((label) => {
    const f = FIELD_CATALOG.find((x) => x.name === label)
    return f && f.id === id
  })
  return matched ? 'You told us this is one of your interests.' : 'A close fit based on how you like to work.'
}

export function computeFieldRecommendations(ans) {
  const scores = {}
  FIELD_CATALOG.forEach((f) => { scores[f.id] = 0 })
  ;(ans.interests || []).forEach((label) => {
    const match = FIELD_CATALOG.find((f) => f.name === label)
    if (match) scores[match.id] += 3
  })
  const bump = (id, amt) => { if (scores[id] !== undefined) scores[id] += amt }
  if (ans.learningStyle === 'visual') { bump('frontend', 1); bump('product-ux', 1) }
  if (ans.learningStyle === 'reading') { bump('backend', 1); bump('security', 1) }
  if (ans.learningStyle === 'verbal') bump('product-ux', 0.5)
  if (ans.learningStyle === 'example') bump('data', 1)
  if (ans.debugStyle === 'search') bump('infra', 0.5)
  if (ans.debugStyle === 'read') { bump('backend', 0.5); bump('security', 0.5) }
  if (ans.ambiguityStyle === 'clarify') bump('product-ux', 0.5)
  if (ans.incidentComfort === 'oncall' || ans.incidentComfort === 'handled') { bump('infra', 1); bump('security', 0.5) }

  const ranked = FIELD_CATALOG.filter((f) => scores[f.id] > 0).sort((a, b) => scores[b.id] - scores[a.id])

  let results = ranked.slice(0, 3).map((f) => ({
    id: f.id, name: f.name, demand: f.demand, pay: f.pay, blurb: f.blurb, why: fieldWhy(f.id, ans),
  }))

  if (!results.length) {
    results = FIELD_CATALOG.slice(0, 3).map((f) => ({
      id: f.id, name: f.name, demand: f.demand, pay: f.pay, blurb: f.blurb, why: 'A broad starting point while you explore.',
    }))
  }

  if (ans.customInterest) {
    results.unshift({
      id: 'custom', name: ans.customInterest, demand: 'Not tracked', pay: 'Varies',
      blurb: 'A field you typed in yourself — we don’t have benchmark data for it yet, but it’s saved as an option.',
      why: 'You told us this is what you’re after.',
    })
  }
  return results.slice(0, 3)
}

export function computeRoleRecommendations(fieldId, ans) {
  const templates = ROLE_TEMPLATES[fieldId] || ROLE_TEMPLATES.fullstack
  const prefix = LEVEL_PREFIX[ans.level] || ''
  return templates.map((t) => ({ title: prefix + t.title, blurb: t.blurb }))
}
