import React, { useState } from 'react';
import Login from './Login';
import Research from './Research';
import './App.css';

function FundManagement({ onClose }) {
  const [showLogin, setShowLogin] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  
  const handleFundManagement = () => {
    setShowLogin(true);
  };
  
  const handleResearch = () => {
    setShowResearch(true);
  };
  
  const handleGoBack = () => {
    setShowLogin(false);
  };

  const handleCloseResearch = () => {
    setShowResearch(false);
  };

  if (showResearch) {
    return <Research onClose={handleCloseResearch} />;
  }

  if (showLogin) {
    return <Login onGoBack={handleGoBack} />;
  }

  return (
    <div className="platform-container">
      <div className="platform-header">
        <span>Fund management iPlatform</span>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      
      <div className="platform-content">
        <div className="platform-left">
          <div className="platform-info">
            <h2>FUND MANAGER iPLATFORM</h2>
            <p>Version 25.03.001</p>
            <p>License to: Saigon Love Fund</p>
            <p>Copyright (C) 2025 Ingreetech LLC. All rights reserved</p>
          </div>
        </div>
        
        <div className="platform-right">
          <h2>Choose your department</h2>
          <div className="department-buttons">
            <button className="fund-management-btn" onClick={handleFundManagement}>FUND MANAGEMENT</button>
            <button className="research-btn" onClick={handleResearch}>RESEARCH AND DEVELOPMENT</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FundManagement; 