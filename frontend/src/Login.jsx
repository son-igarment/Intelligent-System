import React, { useState } from 'react';
import ForgotPassword from './ForgotPassword';
import Dashboard from './Dashboard';
import './App.css';

function Login({ onGoBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetNotification, setResetNotification] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);

  const handleLogin = () => {
    // In a real app, this would validate the credentials
    if (username.trim() !== '' && password.trim() !== '') {
      setShowDashboard(true);
    }
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
    }, 1000);
  };

  const handleCloseDashboard = () => {
    setShowDashboard(false);
  };

  if (showDashboard) {
    return <Dashboard onClose={handleCloseDashboard} />;
  }

  if (showForgotPassword) {
    return <ForgotPassword onGoBack={handleBackFromForgot} onSendSuccess={handleResetSuccess} />;
  }

  return (
    <div className="platform-container">
      <div className="platform-header">
        <span>Fund management iPlatform</span>
        <button className="close-btn" onClick={onGoBack}>✕</button>
      </div>
      
      <div className="fund-department-header">
        <span>Fund management department</span>
      </div>
      
      <div className="login-container">
        <div className="login-box">
          <h2>Login</h2>
          <p className="login-subtitle">Sign in to continue</p>
          
          {resetNotification && (
            <div className="notification">
              {resetNotification}
            </div>
          )}
          
          <div className="login-form">
            <div className="form-group">
              <label htmlFor="username">USERNAME</label>
              <input 
                type="text" 
                id="username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">PASSWORD</label>
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="forgot-password">
              <span>Forgot password? </span>
              <a href="#" className="forgot-link" onClick={handleForgotPasswordClick}>Click here</a>
            </div>
            
            <div className="login-buttons">
              <button className="login-btn" onClick={handleLogin}>Login</button>
              <button className="go-back-btn" onClick={onGoBack}>Exit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login; 