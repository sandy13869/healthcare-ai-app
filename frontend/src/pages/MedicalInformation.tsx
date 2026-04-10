import { useState, useEffect } from 'react'

interface HealthCondition {
  id: number
  title: string
  description: string
  symptoms: string[]
  treatments: string[]
  prevention: string[]
}

export default function MedicalInformation() {
  const [conditions, setConditions] = useState<HealthCondition[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  useEffect(() => {
    fetch('http://localhost:3001/api/health-info')
      .then(res => res.json())
      .then((data: HealthCondition[]) => {
        setConditions(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Unable to load health information. Please ensure the backend is running.')
        setLoading(false)
      })
  }, [])

  const filtered = conditions.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (id: number) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Information</h1>
      <p className="text-gray-600 mb-6">Browse information about common health conditions.</p>

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search conditions..."
          className="w-full max-w-md border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">⏳</div>
          <p className="text-gray-500">Loading health information...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(condition => (
            <div key={condition.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{condition.title}</h2>
              <p className="text-sm text-gray-600 mb-4">{condition.description}</p>

              <button
                onClick={() => toggle(condition.id)}
                className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors"
              >
                {expanded[condition.id] ? '▲ Hide details' : '▼ Show details'}
              </button>

              {expanded[condition.id] && (
                <div className="mt-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Symptoms</h3>
                    <ul className="space-y-0.5">
                      {condition.symptoms.map((s, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Treatments</h3>
                    <ul className="space-y-0.5">
                      {condition.treatments.map((t, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></span>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Prevention</h3>
                    <ul className="space-y-0.5">
                      {condition.prevention.map((p, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500">No conditions found matching "{search}"</p>
        </div>
      )}
    </div>
  )
}
