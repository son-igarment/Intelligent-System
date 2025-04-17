import React, { useState } from 'react';
import './App.css';

function ForgotPassword({ onGoBack, onSendSuccess }) {
  const [email, setEmail] = useState('');

  const handleSend = () => {
    // Here you would typically make an API call to request password reset
    // For now, we'll just simulate success and go back
    onSendSuccess();
  };

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
        <div className="forgot-password-box">
          <h2>Forgot Password</h2>
          <p className="forgot-subtitle">Reset password will be sent to registered email.</p>
          
          <div className="forgot-form">
            <div className="form-group">
              <label htmlFor="email">EMAIL</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="forgot-buttons">
              <button className="send-btn" onClick={handleSend}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword; 