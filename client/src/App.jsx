import { BrowserRouter as Router } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import Navbar from './components/Navbar'
import AIAssistant from './components/AIAssistant'

function App() {
  return (
    <Router>
      <Navbar />
      <div className="app-container" style={{ padding: '2rem' }}>
        <AppRoutes />
      </div>
      <AIAssistant />
    </Router>
  )
}

export default App
