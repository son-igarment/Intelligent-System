import { useState } from 'react'
import FundManagement from './FundManagement'
import Login from './Login'
import ResearchLogin from './ResearchLogin'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('login');

  const handleGoBack = () => {
    setCurrentView('login');
  };

  const handleShowResearchLogin = () => {
    setCurrentView('researchLogin');
  };

  return (
    <div className="container">
      {currentView === 'login' && <Login onGoBack={handleGoBack} onShowResearchLogin={handleShowResearchLogin} />}
      {currentView === 'researchLogin' && <ResearchLogin onGoBack={handleGoBack} />}
    </div>
  )
}

export default App
