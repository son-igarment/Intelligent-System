import React from 'react';
import NotificationSection from './NotificationSection';
import './App.css';

function NotificationCenter({ onClose, onMenuChange }) {
  const currentDate = "2025-03-28";

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <span>Fund management iPlatform</span>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      
      <div className="dashboard-content">
        {/* Sidebar Menu */}
        <div className="dashboard-sidebar">
          <div className="sidebar-header">
            <div>Fund management department</div>
            <div className="date-info">Current date: {currentDate}</div>
          </div>
          
          <div className="sidebar-item" onClick={() => onMenuChange('dashboard')}>
            Dashboard
          </div>
          
          <div className="sidebar-item" onClick={() => onMenuChange('assets')}>
            Assets report
          </div>
          
          <div className="sidebar-item" onClick={() => onMenuChange('analyst')}>
            Analyst report
          </div>
          
          <div className="sidebar-item" onClick={() => onMenuChange('tool')}>
            Analyst tool
          </div>
          
          <div className="sidebar-item active">
            Notification center
          </div>
          
          <div className="sidebar-item" onClick={() => onMenuChange('settings')}>
            Settings
          </div>
        </div>
        
        {/* Main Content */}
        <div className="dashboard-main">
          <div className="report-container">
            <h2 className="report-title">Notification Center</h2>
            
            <div className="report-date-info">
              Report date: <strong>{currentDate}</strong>. Lastest update date: <strong>{currentDate}</strong>.
            </div>
            
            {/* Expanded Notification Section */}
            <div className="notification-center-content">
              <div className="notification-filter">
                <button className="notification-filter-btn active">All</button>
                <button className="notification-filter-btn">Today</button>
                <button className="notification-filter-btn">This week</button>
                <button className="notification-filter-btn">This month</button>
              </div>
              
              {/* Regular Notification Section */}
              <NotificationSection />
              
              {/* Additional notifications for the full center */}
              <div className="notification-section">
                <div className="notification-message">
                  <div className="notification-row">
                    <span className="notification-timestamp">
                      2024-03-27 09:31:15
                    </span>
                    
                    <div className="notification-content">
                      <span className="notification-source">AI agent:</span> The market is open now with <span className="highlight-success">positive</span> trend. Do you want to see my analysis?
                    </div>
                  </div>
                </div>
                
                <div className="notification-message">
                  <div className="notification-row">
                    <span className="notification-timestamp">
                      2024-03-26 16:42:00
                    </span>
                    
                    <div className="notification-content">
                      <span className="notification-source">System:</span> Daily report has been generated and saved.
                    </div>
                  </div>
                </div>
                
                <div className="notification-message">
                  <div className="notification-row">
                    <span className="notification-timestamp">
                      2024-03-25 11:20:35
                    </span>
                    
                    <div className="notification-content">
                      <span className="notification-source">AI agent:</span> Stock <span className="highlight-warning">ABC</span> has reached your target price. Consider taking profit.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationCenter; 