export default function ChoiceFormat({ q, onAnswer }) {
  return (
    <div className="setup-options">
      {(q.options || []).map((opt) => (
        <button key={opt} type="button" className="setup-option" onClick={() => onAnswer(opt)}>
          <span>{opt}</span>
          <span className="arrow">→</span>
        </button>
      ))}
    </div>
  )
}
