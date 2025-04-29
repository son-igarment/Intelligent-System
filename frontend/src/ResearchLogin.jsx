import React, { useState, useEffect } from 'react';
import ForgotPassword from './ForgotPassword';
import DataImport from './DataImport';
import './App.css';

function ResearchLogin({ onGoBack }) {
  const [username, setUsername] = useState('vietnk');
  const [password, setPassword] = useState('123456');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetNotification, setResetNotification] = useState('');
  const [showDataImport, setShowDataImport] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [animateLogin, setAnimateLogin] = useState(false);

  useEffect(() => {
    // Animate login box on mount
    setTimeout(() => {
      setAnimateLogin(true);
    }, 100);
  }, []);

  const handleLogin = () => {
    if (username.trim() === '' || password.trim() === '') {
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      setShowDataImport(true);
    }, 800);
  };

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    setShowForgotPassword(true);
  };

  const handleBackFromForgot = () => {
    setShowForgotPassword(false);
  };

  const handleResetSuccess = () => {
    setShowForgotPassword(false);
    setResetNotification('Password reset link has been sent to your email.');
    
    // Clear notification after 5 seconds
    setTimeout(() => {
      setResetNotification('');
    }, 3000);
  };

  const handleCloseDataImport = () => {
    setShowDataImport(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  if (showDataImport) {
    return <DataImport onClose={handleCloseDataImport} />;
  }

  if (showForgotPassword) {
    return <ForgotPassword onGoBack={handleBackFromForgot} onSendSuccess={handleResetSuccess} />;
  }

  return (
    <div className="platform-container">
      <div className="platform-header">
        <span>
          <i className="fas fa-chart-line" style={{ marginRight: '10px' }}></i>
          Data Analysis iPlatform
        </span>
        <div className="header-controls">
          <button className="close-btn" onClick={onGoBack}>✕</button>
        </div>
      </div>
      
      <div className="fund-department-header">
        <span>
          <i className="fas fa-university" style={{ marginRight: '10px' }}></i>
          Data Analysis department
        </span>
      </div>
      
      <div className="login-container">
        <div className={`login-box ${animateLogin ? 'login-box-animate' : ''}`}>
          
          <h2>Data Analysis Login</h2>
          <p className="login-subtitle">Sign in to continue to Research Platform</p>
          
          {resetNotification && (
            <div className="notification notification-success">
              <i className="fas fa-check-circle"></i> {resetNotification}
            </div>
          )}
          
          <div className="login-form">
            <div className="form-group">
              <label htmlFor="username">
                <i className="fas fa-user"></i> USERNAME
              </label>
              <div className="input-with-icon">
                <input 
                  type="text" 
                  id="username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter research username"
                  autoComplete="username"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-key"></i> PASSWORD
              </label>
              <div className="input-with-icon">
                <input 
                  type="password" 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter research password"
                  autoComplete="current-password"
                />
              </div>
            </div>
            
            <div className="forgot-password">
              <span>Forgot password? </span>
              <a href="#" className="forgot-link" onClick={handleForgotPasswordClick}>Click here</a>
            </div>
            
            <div className="login-buttons">
              <button 
                className={`login-btn ${isLoading ? 'loading' : ''}`} 
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span><i className="fas fa-spinner fa-spin"></i> Logging in...</span>
                ) : (
                  <span><i className="fas fa-sign-in-alt"></i> Login</span>
                )}
              </button>
              
              <button className="go-back-btn" onClick={onGoBack}>
                <i className="fas fa-times"></i> Exit
              </button>
            </div>
          </div>
          
          <div className="login-footer">
            <p>© {new Date().getFullYear()} Data Analysis iPlatform</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResearchLogin; 