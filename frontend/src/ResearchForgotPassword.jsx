import React, { useState } from 'react';
import './App.css';

function ResearchForgotPassword({ onGoBack, onSendSuccess }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send a reset link to the email
    if (email.trim() !== '') {
      onSendSuccess();
    }
  };

  return (
    <div className="platform-container">
      <div className="platform-header">
        <span>Fund management iPlatform</span>
        <button className="close-btn" onClick={onGoBack}>✕</button>
      </div>
      
      <div className="research-department-header">
        <span>Research and development department</span>
      </div>
      
      <div className="login-container">
        <div className="login-box">
          <h2>Forgot Password</h2>
          <p className="login-subtitle">Enter your email to receive a password reset link</p>
          
          <div className="login-form">
            <div className="form-group">
              <label htmlFor="email">EMAIL</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            
            <div className="login-buttons">
              <button className="login-btn" onClick={handleSubmit}>Send Reset Link</button>
              <button className="go-back-btn" onClick={onGoBack}>Go Back</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResearchForgotPassword; 