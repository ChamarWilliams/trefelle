import { useCallback, useEffect, useRef, useState } from 'react'
import { aiAvailable, callAI, normalizeAIResponse, parseAIJson } from '../lib/ai'

/**
 * Drives one phase of the adaptive AI conversation (personality, then
 * fields). Mirrors the vanilla renderAIFlow() state machine, but as a hook:
 * conversation history and retry state live in refs (they don't need to
 * trigger renders themselves), while `phase`/`question`/`error` are state
 * that the UI actually reacts to.
 */
export function useAIFlow({ eyebrow, systemPrompt, softTarget, hardCap, fallbackStepId, onDone, answers, go }) {
  const [phase, setPhase] = useState('loading') // 'loading' | 'question' | 'error' | 'unavailable'
  const [isFirst, setIsFirst] = useState(true)
  const [question, setQuestion] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [rawText, setRawText] = useState('')

  const conversationRef = useRef([{ role: 'system', content: systemPrompt }])
  const countRef = useRef(0)
  const controllerRef = useRef(null)
  const answersRef = useRef(answers)
  answersRef.current = answers

  const attempt = useCallback((msgs, atHard, retryNum) => {
    controllerRef.current = typeof AbortController !== 'undefined' ? new AbortController() : null
    callAI(answersRef.current, msgs, controllerRef.current?.signal)
      .then((text) => {
        const data = normalizeAIResponse(parseAIJson(text))
        const valid = !!data
        if (!valid && retryNum < 2) {
          attempt(msgs.concat([
            { role: 'assistant', content: String(text || '').slice(0, 400) },
            { role: 'user', content: 'That was not valid — respond again with ONLY a single JSON object matching one of the required shapes, nothing else, no markdown, no explanation.' },
          ]), atHard, retryNum + 1)
          return
        }
        if (!valid) {
          setRawText(text)
          setErrorMsg('Your AI model didn’t respond in the expected format.')
          setPhase('error')
          return
        }
        if (data.type === 'done') {
          onDone(data)
          return
        }
        if (atHard) {
          setErrorMsg('Your AI model kept asking questions past the limit.')
          setPhase('error')
          return
        }
        setQuestion(data)
        setPhase('question')
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        setErrorMsg('Couldn’t reach your AI model (' + (err?.message || 'unknown error') + ').')
        setPhase('error')
      })
  }, [onDone])

  const step = useCallback(() => {
    const count = countRef.current
    setIsFirst(count === 0)
    setPhase('loading')
    const atSoft = count >= softTarget
    const atHard = count >= hardCap
    const msgs = conversationRef.current.slice()
    if (atHard) msgs.push({ role: 'user', content: 'You are well past the target question count — you must conclude now with your final "done" response.' })
    else if (atSoft) msgs.push({ role: 'user', content: 'You have reached the target question count. If you are reasonably confident, conclude now with "done". Otherwise ask at most a few more.' })
    else if (count === 0) msgs.push({ role: 'user', content: 'Begin.' })
    attempt(msgs, atHard, 0)
  }, [softTarget, hardCap, attempt])

  useEffect(() => {
    if (!aiAvailable(answers)) {
      setPhase('unavailable')
      const t = setTimeout(() => go(fallbackStepId, true), 900)
      return () => clearTimeout(t)
    }
    step()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const recordAnswer = useCallback((q, answerText) => {
    conversationRef.current = conversationRef.current.concat([
      { role: 'assistant', content: JSON.stringify(q) },
      { role: 'user', content: answerText },
    ])
    countRef.current += 1
    step()
  }, [step])

  const giveUp = useCallback(() => {
    controllerRef.current?.abort()
    go(fallbackStepId, true)
  }, [go, fallbackStepId])

  const retry = useCallback(() => step(), [step])

  return { eyebrow, phase, isFirst, question, errorMsg, rawText, recordAnswer, giveUp, retry }
}
