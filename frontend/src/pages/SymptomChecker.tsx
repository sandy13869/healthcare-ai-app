import { useState } from 'react'

interface SymptomResult {
  severity: 'mild' | 'moderate' | 'severe'
  assessment: string
  recommendations: string[]
  disclaimer: string
}

const severityConfig = {
  mild: { label: 'Mild', color: 'bg-green-100 text-green-800 border-green-300', dot: 'bg-green-500' },
  moderate: { label: 'Moderate', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', dot: 'bg-yellow-500' },
  severe: { label: 'Severe', color: 'bg-red-100 text-red-800 border-red-300', dot: 'bg-red-500' },
}

export default function SymptomChecker() {
  const [input, setInput] = useState('')
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [result, setResult] = useState<SymptomResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addSymptom = () => {
    const trimmed = input.trim()
    if (trimmed && !symptoms.includes(trimmed)) {
      setSymptoms(prev => [...prev, trimmed])
      setInput('')
    }
  }

  const removeSymptom = (sym: string) => {
    setSymptoms(prev => prev.filter(s => s !== sym))
    setResult(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addSymptom()
  }

  const checkSymptoms = async () => {
    if (symptoms.length === 0) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:3001/api/symptom-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms }),
      })
      const data = await res.json() as SymptomResult
      setResult(data)
    } catch {
      setError('Unable to connect to server. Please ensure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Symptom Checker</h1>
      <p className="text-gray-600 mb-6">Enter your symptoms to get an AI-powered health assessment.</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Add a Symptom</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. headache, fever, cough..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addSymptom}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Add
          </button>
        </div>

        {symptoms.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Your symptoms:</p>
            <div className="flex flex-wrap gap-2">
              {symptoms.map(sym => (
                <span key={sym} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  {sym}
                  <button onClick={() => removeSymptom(sym)} className="hover:text-blue-600 font-bold ml-1">×</button>
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={checkSymptoms}
          disabled={symptoms.length === 0 || loading}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2.5 rounded-lg font-medium transition-colors"
        >
          {loading ? 'Analyzing...' : 'Check Symptoms'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{error}</div>
      )}

      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Assessment Results</h2>

          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium mb-4 ${severityConfig[result.severity].color}`}>
            <span className={`w-2 h-2 rounded-full ${severityConfig[result.severity].dot}`}></span>
            {severityConfig[result.severity].label} Severity
          </div>

          <p className="text-gray-700 mb-4">{result.assessment}</p>

          <h3 className="font-medium text-gray-800 mb-2">Recommendations:</h3>
          <ul className="space-y-1 mb-4">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-blue-500 mt-0.5">•</span>
                {rec}
              </li>
            ))}
          </ul>

          <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">{result.disclaimer}</p>
        </div>
      )}
    </div>
  )
}
