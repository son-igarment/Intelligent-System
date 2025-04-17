import React, { useState } from 'react';
import Login from './ResearchLogin';
import TrainingModel from './TrainingModel';
import './App.css';

function Research({ onClose }) {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(true);
  
  const handleMenuChange = (menuItem) => {
    setActiveMenu(menuItem);
  };
  
  const handleLoginSuccess = () => {
    setShowLogin(false);
  };
  
  const handleGoBack = () => {
    onClose();
  };
  
  if (showLogin) {
    return <Login onGoBack={handleGoBack} onLoginSuccess={handleLoginSuccess} department="research" />;
  }

  // Sample security classification data
  const securityClassData = [
    { date: "2025-03-28", acClass0: 51, acClass1: 133, acClass2: 305, acRisk: "Very High", prClass0: 50, prClass1: 128, prClass2: 314, prRisk: "Very High", acc: 0.9594 },
    { date: "2025-03-27", acClass0: 52, acClass1: 146, acClass2: 254, acRisk: "Very High", prClass0: 51, prClass1: 145, prClass2: 285, prRisk: "Very High", acc: 0.9190 },
    { date: "2025-03-26", acClass0: 54, acClass1: 154, acClass2: 274, acRisk: "Very High", prClass0: 56, prClass1: 155, prClass2: 271, prRisk: "Very High", acc: 0.9892 },
    { date: "2025-03-25", acClass0: 55, acClass1: 155, acClass2: 272, acRisk: "Very High", prClass0: 57, prClass1: 156, prClass2: 269, prRisk: "Very High", acc: 0.9697 },
    { date: "2025-03-24", acClass0: 58, acClass1: 152, acClass2: 262, acRisk: "Very High", prClass0: 59, prClass1: 168, prClass2: 255, prRisk: "Very High", acc: 0.9492 }
  ];

  // Sample notification data
  const notifications = [
    { id: 1, timestamp: "2024-03-28 17:00:05", message: "Database and training model has been updated. The accuracy is 0.9333. To see the visualization.", link: "Click here." },
    { id: 2, timestamp: "2024-03-27 17:00:04", message: "Database and training model has been updated. The accuracy is 0.9190. To see the visualization.", link: null },
    { id: 3, timestamp: "2024-03-26 17:00:02", message: "Database and training model has been updated. The accuracy is 0.9892. To see the visualization.", link: null }
  ];

  return (
    <div className="dashboard-container">
      <div className="main-header">
        <span>Fund management iPlatform</span>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      
      <div className="dashboard-content">
        {/* Sidebar Menu */}
        <div className="dashboard-sidebar research-sidebar">
          <div className="research-department-header">
            <div>Research and development department</div>
            <div className="date-info">Current date: 2025-03-28</div>
          </div>
          
          <div className={`sidebar-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
               onClick={() => handleMenuChange('dashboard')}>
            Dashboard
          </div>
          
          <div className={`sidebar-item ${activeMenu === 'training' ? 'active' : ''}`}
               onClick={() => handleMenuChange('training')}>
            Training model
          </div>
          
          <div className={`sidebar-item ${activeMenu === 'notification' ? 'active' : ''}`}
               onClick={() => handleMenuChange('notification')}>
            Notification center
          </div>
          
          <div className={`sidebar-item ${activeMenu === 'settings' ? 'active' : ''}`}
               onClick={() => handleMenuChange('settings')}>
            Settings
          </div>
        </div>
        
        {/* Main Content */}
        <div className="dashboard-main research-main">
          {activeMenu === 'dashboard' && (
            <div className="research-dashboard">
              <div className="report-header">
                <h2 className="report-title">SECURITY CLASSIFICATION</h2>
                <div className="report-dates">
                  <div>Report date: 2025-03-28.</div>
                  <div>Lastest update date: 2025-03-28.</div>
                </div>
              </div>
              
              {/* Security Classification Table */}
              <div className="stock-table-container">
                <table className="stock-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th style={{color: '#00FF00'}}>Ac.Class 0</th>
                      <th style={{color: '#FFA500'}}>Ac.Class 1</th>
                      <th style={{color: '#FF0000'}}>Ac.Class 2</th>
                      <th>Ac.Risk</th>
                      <th style={{color: '#00FF00'}}>Pr.Class 0</th>
                      <th style={{color: '#FFA500'}}>Pr.Class 1</th>
                      <th style={{color: '#FF0000'}}>Pr.Class 2</th>
                      <th>Pr.Risk</th>
                      <th>Acc</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityClassData.map((row, index) => (
                      <tr key={index}>
                        <td>{row.date}</td>
                        <td style={{color: '#00FF00'}}>{row.acClass0}</td>
                        <td style={{color: '#FFA500'}}>{row.acClass1}</td>
                        <td style={{color: '#FF0000'}}>{row.acClass2}</td>
                        <td className="risk-level very-high">{row.acRisk}</td>
                        <td style={{color: '#00FF00'}}>{row.prClass0}</td>
                        <td style={{color: '#FFA500'}}>{row.prClass1}</td>
                        <td style={{color: '#FF0000'}}>{row.prClass2}</td>
                        <td className="risk-level very-high">{row.prRisk}</td>
                        <td>{row.acc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Notification Section */}
              <div className="notification-section">
                <h3 className="notification-section-title">Notification</h3>
                {notifications.map((notification) => (
                  <div key={notification.id} className="notification-message">
                    <div className="notification-row">
                      <div className="notification-timestamp">{notification.timestamp}</div>
                      <div className="notification-content">
                        <span className="notification-source">AI agent:</span>
                        {notification.message}
                        {notification.link && (
                          <span className="highlight-success"> {notification.link}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeMenu === 'training' && (
            <div className="research-data">
              <TrainingModel />
            </div>
          )}
          
          {activeMenu === 'notification' && (
            <div className="research-assessment">
              <h2 className="report-title">Notification Center</h2>
              <div className="empty-content">
                <p>Notification center will be displayed here</p>
              </div>
            </div>
          )}
          
          {activeMenu === 'settings' && (
            <div className="research-settings">
              <h2 className="report-title">Settings</h2>
              <div className="empty-content">
                <p>Settings options will be displayed here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Research; 