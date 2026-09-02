export function parseAIJson(text) {
  let cleaned = String(text || '').trim().replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start > -1 && end > start) cleaned = cleaned.slice(start, end + 1)
  try { return JSON.parse(cleaned) } catch (e) { /* fall through to repair pass */ }
  const repaired = cleaned
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/,\s*([}\]])/g, '$1')
    .replace(/'([a-zA-Z0-9_]+)'\s*:/g, '"$1":')
    .replace(/:\s*'([^']*)'/g, ':"$1"')
  try { return JSON.parse(repaired) } catch (e) { return null }
}

export function normalizeAIResponse(data) {
  if (!data || typeof data !== 'object') return null
  if (data.type === 'question' || data.type === 'done') return data
  if (data.fields || data.level || (data.summary && (data.learningStyle || data.workStyle))) {
    data.type = 'done'
    return data
  }
  const q = data.question || data.text || data.prompt
  if (q) {
    data.type = 'question'
    data.question = q
    if (!data.format) {
      if (data.options || data.choices) { data.format = 'choice'; data.options = data.options || data.choices }
      else if (data.boxA || data.boxB) data.format = 'sort'
      else if (data.buckets || data.points) data.format = 'allocate'
      else if (data.minLabel || data.maxLabel) data.format = 'slider'
      else if (data.items) data.format = 'rank'
      else data.format = 'text'
    }
    return data
  }
  return null
}

export function aiAvailable(ans) {
  if (ans.engine === 'local') return !!ans.serverAddress && !!ans.localModel
  if (ans.engine === 'byok') {
    if (!ans.apiKey) return false
    return ans.provider === 'openai' || ans.provider === 'anthropic' || (ans.provider === 'other' && !!ans.byokEndpoint)
  }
  return false
}

function callOpenAICompatible(url, apiKey, messages, signal, model) {
  const headers = { 'Content-Type': 'application/json' }
  if (apiKey) headers.Authorization = 'Bearer ' + apiKey
  return fetch(url, {
    method: 'POST', headers, signal,
    body: JSON.stringify({ model: model || 'gpt-4o-mini', messages, temperature: 0.4 }),
  }).then((res) => {
    if (!res.ok) throw new Error('http ' + res.status)
    return res.json()
  }).then((data) => {
    const text = data.choices?.[0]?.message?.content
    if (!text) throw new Error('empty response')
    return text
  })
}

function callAnthropic(messages, signal, apiKey) {
  const system = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n')
  const rest = messages.filter((m) => m.role !== 'system').map((m) => ({ role: m.role, content: m.content }))
  return fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', signal,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: 'claude-3-5-haiku-latest', max_tokens: 700, system, messages: rest }),
  }).then((res) => {
    if (!res.ok) throw new Error('http ' + res.status)
    return res.json()
  }).then((data) => {
    const text = data.content?.[0]?.text
    if (!text) throw new Error('empty response')
    return text
  })
}

function callLocal(messages, signal, ans) {
  const base = (ans.serverAddress || '').replace(/\/+$/, '')
  if (ans.runtime === 'ollama') {
    return fetch(base + '/api/chat', {
      method: 'POST', signal, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: ans.localModel, messages, stream: false, format: 'json' }),
    }).then((res) => {
      if (!res.ok) throw new Error('http ' + res.status)
      return res.json()
    }).then((data) => {
      const text = data.message?.content
      if (!text) throw new Error('empty response')
      return text
    })
  }
  return callOpenAICompatible(base + '/v1/chat/completions', null, messages, signal, ans.localModel)
}

/** Dispatches to whichever provider `answers` describes. `answers` is the full wizard state. */
export function callAI(answers, messages, signal) {
  if (answers.engine === 'local' && answers.serverAddress && answers.localModel) return callLocal(messages, signal, answers)
  if (answers.engine === 'byok' && answers.apiKey) {
    if (answers.provider === 'anthropic') return callAnthropic(messages, signal, answers.apiKey)
    if (answers.provider === 'other' && answers.byokEndpoint) return callOpenAICompatible(answers.byokEndpoint, answers.apiKey, messages, signal)
    return callOpenAICompatible('https://api.openai.com/v1/chat/completions', answers.apiKey, messages, signal)
  }
  return Promise.reject(new Error('No AI model connected'))
}
