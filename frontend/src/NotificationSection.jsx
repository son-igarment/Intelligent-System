import React from 'react';
import './App.css';

function NotificationSection() {
  return (
    <div className="notification-section">
      <div className="notification-section-title">
        Notification
      </div>
      
      {/* First notification */}
      <div className="notification-message">
        <div className="notification-row">
          <span className="notification-timestamp">
            2024-03-28 17:00:05
          </span>
          
          <div className="notification-content">
            <span className="notification-source">AI agent:</span> The <span className="highlight-warning">systematic risk</span> of market can be occurred with <span className="highlight-danger">90%</span> probability soon. Your net asset value is going down. Need action as soon as possible. Please see my analyst report, <span className="highlight-primary">my boss</span>.
          </div>
        </div>
      </div>
      
      {/* Second notification */}
      <div className="notification-message">
        <div className="notification-row">
          <span className="notification-timestamp">
            2024-03-28 17:00:01
          </span>
          
          <div className="notification-content">
            <span className="notification-source">AI agent:</span> The net asset value report is available now. Take a look, <span className="highlight-primary">my boss</span>. <span className="highlight-success">Click here</span>.
          </div>
        </div>
      </div>
      
      {/* Third notification */}
      <div className="notification-message">
        <div className="notification-row">
          <span className="notification-timestamp">
            2024-03-28 17:00:00
          </span>
          
          <div className="notification-content">
            <span className="notification-source">AI agent:</span> The database of market has just updated. It is available to use now, <span className="highlight-primary">my boss</span>. <span className="highlight-success">Click here</span>.
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationSection; 