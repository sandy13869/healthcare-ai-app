import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import SymptomChecker from './pages/SymptomChecker'
import HealthChatbot from './pages/HealthChatbot'
import MedicalInformation from './pages/MedicalInformation'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/symptoms" element={<SymptomChecker />} />
          <Route path="/chat" element={<HealthChatbot />} />
          <Route path="/info" element={<MedicalInformation />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
