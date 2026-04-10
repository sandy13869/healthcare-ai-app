import { Link } from 'react-router-dom'

const stats = [
  { label: 'Heart Rate', value: '72 bpm', icon: '❤️', color: 'bg-red-50 border-red-200' },
  { label: 'Blood Pressure', value: '120/80', icon: '🩺', color: 'bg-blue-50 border-blue-200' },
  { label: 'Sleep Hours', value: '7.5 hrs', icon: '😴', color: 'bg-purple-50 border-purple-200' },
  { label: 'Steps Today', value: '8,432', icon: '🚶', color: 'bg-green-50 border-green-200' },
]

const quickActions = [
  { to: '/symptoms', label: 'Check Symptoms', icon: '🔍', desc: 'Analyze your symptoms and get an AI assessment', color: 'bg-orange-500 hover:bg-orange-600' },
  { to: '/chat', label: 'Health Chatbot', icon: '💬', desc: 'Ask health questions and get instant guidance', color: 'bg-blue-500 hover:bg-blue-600' },
  { to: '/info', label: 'Medical Info', icon: '📚', desc: 'Browse information about common conditions', color: 'bg-green-500 hover:bg-green-600' },
]

export default function Dashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to HealthAI</h1>
        <p className="text-gray-600 mt-2">Your personal healthcare assistant. Always here to help you stay informed about your health.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className={`border rounded-xl p-5 ${stat.color}`}>
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
            <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map(action => (
          <Link
            key={action.to}
            to={action.to}
            className={`${action.color} text-white rounded-xl p-6 block transition-colors`}
          >
            <div className="text-4xl mb-3">{action.icon}</div>
            <h3 className="text-lg font-semibold mb-1">{action.label}</h3>
            <p className="text-sm opacity-90">{action.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="font-semibold text-blue-800 mb-2">⚠️ Medical Disclaimer</h3>
        <p className="text-sm text-blue-700">
          HealthAI provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
        </p>
      </div>
    </div>
  )
}
