import { FIELD_CATALOG } from '../lib/fields'
import { saveAnswers, clearAnswers } from '../lib/storage'

// Each step is pure data. `options`/`multi`/`field` are rendered generically
// by <StepRenderer>. A step with `component` instead hands off to a bespoke
// screen in components/screens for anything too custom to describe as data
// (live model detection, the AI conversation, drag-based field/role pickers).
//
// onSelect / onSubmit / action return a *patch* object that gets merged into
// wizard state — nothing here mutates anything directly, unlike the original
// vanilla version which closed over a shared `answers` object.

export const steps = {
  welcome_back: { component: 'WelcomeBack' },

  // Trefelle only supports two engines right now: BYOK Claude Sonnet, or a
  // local Qwen3-VL model via Ollama — chosen because both handle attached
  // resume files reliably and keep results comparable across people. There
  // is no WebGPU/WebLLM option: Qwen3-VL has no WebGPU-runnable build (no
  // WebLLM support — open, unresolved upstream request mlc-ai/web-llm#762 —
  // and the ONNX exports that exist target Python CPU/CUDA, not the
  // browser), so it can't be offered as a WebGPU choice.
  engine: {
    eyebrow: 'AI SETUP',
    question: 'How should your AI mentor run?',
    body: 'Trefelle only supports two models right now, on purpose — Claude Sonnet and a local Qwen3-VL, chosen because both handle attached resume files reliably and give comparable results. Wider model support is a later goal, not a current one.',
    options: [
      { label: 'Bring your own key', hint: 'Anthropic · Claude Sonnet · pay-per-use', value: 'byok', next: 'byok_key', onSelect: () => ({ engine: 'byok', provider: 'anthropic' }) },
      { label: 'Run it locally', hint: 'Free · Qwen3-VL via Ollama', value: 'local', next: 'local_address', onSelect: () => ({ engine: 'local', runtime: 'ollama' }) },
    ],
  },

  byok_key: {
    eyebrow: 'AI SETUP',
    question: 'Paste your Anthropic API key.',
    body: 'Trefelle only supports Claude Sonnet right now — use a key from an Anthropic account with API access.',
    field: { placeholder: 'sk-ant-...', hint: 'Stored only in your browser. Never sent to Trefelle.', key: 'apiKey', type: 'password' },
    next: 'assess_intro',
  },

  local_address: {
    eyebrow: 'AI SETUP',
    question: 'Confirm your Ollama server address.',
    body: 'Trefelle only supports Qwen3-VL locally right now, run through Ollama.',
    field: {
      placeholder: 'http://localhost:11434', hint: 'Your browser will need permission to reach this address.', key: 'serverAddress', type: 'text',
      default: () => 'http://localhost:11434',
    },
    next: 'local_model',
  },
  // LocalModel component checks /api/tags on the given server and requires a
  // model name matching /qwen3[-:]?vl/i — anything else shows the
  // `ollama pull qwen3-vl` instructions instead of letting setup continue.
  local_model: { component: 'LocalModel' },

  assess_intro: { component: 'AssessIntro' },
  assess_personality: { component: 'AssessPersonality', hideHeader: true },
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
      { label: 'Not sure yet / something else', hint: 'Tell us a bit more', value: 'other', next: 'assess_field_custom' },
    ],
    onSelect: (value) => (value === 'other' ? {} : { chosenField: value }),
  },
  assess_field_custom: {
    eyebrow: 'YOUR FIELD',
    question: 'What field are you curious about, or what would you add?',
    field: {
      placeholder: 'e.g. Robotics, Neuroscience, or "not sure yet — open to anything technical"', key: 'chosenFieldCustom', type: 'text',
      onSubmit: (value) => ({ chosenField: value || 'Not sure yet — open to anything technical' }),
    },
    next: 'assess_stage_choice',
  },
  assess_stage_choice: {
    eyebrow: 'YOUR STAGE',
    question: 'Which best describes where you are right now?',
    options: [
      { label: 'Haven’t started a degree yet', hint: 'High school, or still considering options', value: 'pre-undergrad', next: 'assess_fields', onSelect: () => ({ stage: 'pre-undergrad' }) },
      { label: 'Currently in an undergraduate program', value: 'undergrad', next: 'assess_fields', onSelect: () => ({ stage: 'undergrad' }) },
      { label: 'Graduated and/or working professionally', hint: 'In this field or an adjacent one', value: 'professional', next: 'assess_fields', onSelect: () => ({ stage: 'professional' }) },
    ],
  },
  assess_fields: { component: 'AssessFields', hideHeader: true },

  // Deterministic fallback chain — used when no AI model is connected, or the
  // AI conversation fails and the person opts out of retrying it.
  assess_bug: {
    eyebrow: 'HOW YOU WORK',
    question: 'A bug shows up that you don’t understand. First move?',
    options: [
      { label: 'Read the code line by line', value: 'read', next: 'assess_ambiguity', onSelect: () => ({ debugStyle: 'read' }) },
      { label: 'Search the error message', value: 'search', next: 'assess_ambiguity', onSelect: () => ({ debugStyle: 'search' }) },
      { label: 'Add print statements or logging', value: 'log', next: 'assess_ambiguity', onSelect: () => ({ debugStyle: 'log' }) },
      { label: 'Ask someone or your mentor', value: 'ask', next: 'assess_ambiguity', onSelect: () => ({ debugStyle: 'ask' }) },
    ],
  },
  assess_ambiguity: {
    eyebrow: 'HOW YOU WORK',
    question: 'A ticket is ambiguous. You’d rather:',
    options: [
      { label: 'Ask clarifying questions before starting', value: 'clarify', next: 'assess_learn', onSelect: () => ({ ambiguityStyle: 'clarify' }) },
      { label: 'Make reasonable assumptions and note them', value: 'assume', next: 'assess_learn', onSelect: () => ({ ambiguityStyle: 'assume' }) },
      { label: 'Build the simplest version and iterate', value: 'iterate', next: 'assess_learn', onSelect: () => ({ ambiguityStyle: 'iterate' }) },
    ],
  },
  assess_learn: {
    eyebrow: 'LEARNING STYLE',
    question: 'What helps you understand a new system fastest?',
    options: [
      { label: 'A diagram of how it fits together', value: 'visual', next: 'assess_level', onSelect: () => ({ learningStyle: 'visual' }) },
      { label: 'Reading the code itself', value: 'reading', next: 'assess_level', onSelect: () => ({ learningStyle: 'reading' }) },
      { label: 'Talking it through out loud', value: 'verbal', next: 'assess_level', onSelect: () => ({ learningStyle: 'verbal' }) },
      { label: 'Tracing an example step by step', value: 'example', next: 'assess_level', onSelect: () => ({ learningStyle: 'example' }) },
    ],
  },
  assess_level: {
    eyebrow: 'BACKGROUND',
    question: 'What best describes where you are right now?',
    options: [
      { label: 'Student, bootcamp, or self-taught', value: 'student', next: 'assess_experience', onSelect: () => ({ level: 'student' }) },
      { label: 'Early career', hint: '0–2 years', value: 'early', next: 'assess_experience', onSelect: () => ({ level: 'early' }) },
      { label: 'Mid-level', hint: '3–6 years', value: 'mid', next: 'assess_experience', onSelect: () => ({ level: 'mid' }) },
      { label: 'Senior+', hint: '7+ years', value: 'senior', next: 'assess_experience', onSelect: () => ({ level: 'senior' }) },
    ],
  },
  assess_experience: {
    eyebrow: 'BACKGROUND',
    question: 'Which areas do you have real hands-on experience with?',
    body: 'Pick as many as apply.',
    multi: { key: 'experience', next: 'assess_incidents', options: ['Backend / APIs', 'Frontend', 'Data / ML', 'Infra / DevOps', 'Security', 'Mobile', 'None yet'] },
  },
  assess_incidents: {
    eyebrow: 'BACKGROUND',
    question: 'How comfortable are you with production incidents?',
    options: [
      { label: 'Never touched one', value: 'none', next: 'assess_interests', onSelect: () => ({ incidentComfort: 'none' }) },
      { label: 'Watched but didn’t lead', value: 'observed', next: 'assess_interests', onSelect: () => ({ incidentComfort: 'observed' }) },
      { label: 'Handled a few', value: 'handled', next: 'assess_interests', onSelect: () => ({ incidentComfort: 'handled' }) },
      { label: 'Regularly on-call', value: 'oncall', next: 'assess_interests', onSelect: () => ({ incidentComfort: 'oncall' }) },
    ],
  },
  assess_interests: {
    eyebrow: 'INTERESTS',
    question: 'Which tech fields pull you in?',
    body: 'Pick any that interest you — we’ll use this to suggest fields next.',
    multi: { key: 'interests', next: 'field_loading', custom: true, options: FIELD_CATALOG.map((f) => f.name) },
  },

  field_loading: { component: 'FieldLoading' },
  field_results: { component: 'FieldResults' },
  field_manual: {
    eyebrow: 'YOUR FIELDS',
    question: 'Pick a field directly.',
    options: [
      ...FIELD_CATALOG.map((f) => ({
        label: f.name, hint: f.demand + ' demand · ' + f.pay, value: f.id, next: 'role_results',
        onSelect: () => ({ selectedFields: [f] }),
      })),
      { label: 'Type a field not listed', value: 'custom', next: 'field_custom' },
    ],
  },
  field_custom: {
    eyebrow: 'YOUR FIELDS',
    question: 'What field are you thinking of?',
    field: {
      placeholder: 'e.g. Game development, Robotics, Embedded systems', key: 'customField', type: 'text',
      onSubmit: (value) => ({ selectedFields: [{ id: 'custom', name: value || 'Your field', custom: true }] }),
    },
    next: 'role_results',
  },
  role_results: { component: 'RoleResults' },
  role_manual: {
    eyebrow: 'ROLE MATCH',
    question: 'What role are you aiming for?',
    field: { placeholder: 'e.g. Backend Engineer, QA Analyst', hint: 'Whatever you type is saved as your target role.', key: 'role', type: 'text' },
    next: 'voice_ask',
  },

  voice_ask: {
    eyebrow: 'VOICE',
    question: 'Want to talk with your mentor instead of typing?',
    options: [
      { label: 'Yes, enable microphone', value: 'yes', next: 'voice_permission', onSelect: () => ({ voice: 'yes' }) },
      { label: 'No, keep it text-only', value: 'no', next: 'save_ask', onSelect: () => ({ voice: 'no' }) },
    ],
  },
  voice_permission: { component: 'VoicePermission' },
  voice_mode: {
    eyebrow: 'VOICE',
    question: 'How should listening work?',
    options: [
      { label: 'Push to talk', hint: 'Hold a key while you speak', value: 'push', next: 'save_ask', onSelect: () => ({ listenMode: 'push' }) },
      { label: 'Always listening', hint: 'While the mentor panel is open', value: 'always', next: 'save_ask', onSelect: () => ({ listenMode: 'always' }) },
    ],
  },
  save_ask: {
    eyebrow: 'SAVE & FINISH',
    question: 'Save this setup on this device?',
    options: [
      {
        label: 'Yes, remember it', value: 'yes', next: 'done',
        onSelect: () => ({ remember: 'yes' }),
        sideEffect: (answers) => saveAnswers({ ...answers, remember: 'yes' }),
      },
      {
        label: 'No, ask me next time', value: 'no', next: 'done',
        onSelect: () => ({ remember: 'no' }),
        sideEffect: () => clearAnswers(),
      },
    ],
  },
  done: { component: 'Done' },
}
