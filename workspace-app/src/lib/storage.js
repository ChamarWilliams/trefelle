const STORAGE_KEY = 'trefelle_ai_setup'

export function saveAnswers(answers) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(answers)) } catch (e) { /* private-mode / disabled storage */ }
}

export function loadAnswers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export function clearAnswers() {
  try { localStorage.removeItem(STORAGE_KEY) } catch (e) { /* private-mode / disabled storage */ }
}
