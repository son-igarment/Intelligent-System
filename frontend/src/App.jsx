import { useState } from 'react'
import FundManagement from './FundManagement'
import './App.css'

function App() {
  const [currentScreen, setCurrentScreen] = useState('main');

  const handleExit = () => {
    window.close();
  };

  const handleStart = () => {
    setCurrentScreen('platform');
  };

  const handleClose = () => {
    setCurrentScreen('main');
  };

  return (
    <div className="container">
      {currentScreen === 'main' && (
        // Main screen with authors and buttons
        <>
          <h1 className="title">AUTHOR AND OWNER</h1>
          
          <div className="profiles">
            <div className="profile">
              <div className="avatar-container">
                <img src="/Nguyen-Kim-Viet.jpg" alt="Nguyễn Kim Việt" className="avatar" />
              </div>
              <h3>Nguyễn Kim Việt</h3>
              <p>Researcher</p>
            </div>

            <div className="profile">
              <div className="avatar-container">
                <img src="/Pham-Le-Ngoc-Son.jpg" alt="Phạm Lê Ngọc Sơn" className="avatar" />
              </div>
              <h3>Phạm Lê Ngọc Sơn</h3>
              <p>Researcher</p>
            </div>
          </div>

          <div className="buttons">
            <button className="start-btn" onClick={handleStart}>START</button>
            <button className="exit-btn" onClick={handleExit}>EXIT</button>
          </div>
        </>
      )}

      {currentScreen === 'platform' && <FundManagement onClose={handleClose} />}
    </div>
  )
}

export default App
