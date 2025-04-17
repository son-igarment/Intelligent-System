import React from 'react';
import './App.css';

function TrainingModel() {
  // Training model metrics data
  const modelMetrics = [
    { class: "0", precision: "1.00", recall: "1.00", f1Score: "1.00", support: 19 },
    { class: "1", precision: "0.92", recall: "0.85", f1Score: "0.89", support: 13 },
    { class: "2", precision: "0.86", recall: "0.92", f1Score: "0.89", support: 13 },
    { class: "accuracy", precision: "", recall: "", f1Score: "0.93", support: 45 },
    { class: "macro avg", precision: "0.92", recall: "0.92", f1Score: "0.92", support: 45 },
    { class: "weighted avg", precision: "0.93", recall: "0.93", f1Score: "0.93", support: 45 }
  ];

  // Notification data
  const notification = {
    timestamp: "2024-03-28 17:00:05",
    message: "Database and training model has been updated. The accuracy is 0.9333. To see the visualization.",
    link: "Click here."
  };

  return (
    <div className="training-model-container">
      <div className="back-button-container">
        <button className="back-to-dashboard-btn" onClick={() => window.history.back()}>← Back to Dashboard</button>
      </div>
      
      <div className="report-header">
        <h2 className="report-title">TRAINING MODEL REPORT</h2>
        <div className="report-dates">
          <div>Report date: 2025-03-28.</div>
          <div>Lastest update date: 2025-03-28.</div>
        </div>
      </div>
      
      <div className="model-report-container">
        <div className="model-report-left">
          <table className="stock-table model-metrics-table">
            <thead>
              <tr>
                <th>Class</th>
                <th style={{color: '#00FF00'}}>Precision</th>
                <th style={{color: '#FFA500'}}>Recall</th>
                <th style={{color: '#FF0000'}}>f1-score</th>
                <th>Support</th>
              </tr>
            </thead>
            <tbody>
              {modelMetrics.map((metric, index) => (
                <tr key={index}>
                  <td>{metric.class}</td>
                  <td style={{color: metric.precision ? '#00FF00' : ''}}>{metric.precision}</td>
                  <td style={{color: metric.recall ? '#FFA500' : ''}}>{metric.recall}</td>
                  <td style={{color: '#FF0000'}}>{metric.f1Score}</td>
                  <td>{metric.support}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="model-report-right">
          <div className="model-visualization">
            <svg width="300" height="230" viewBox="0 0 300 230">
              {/* Visualization background */}
              <rect x="0" y="0" width="300" height="230" fill="#121212" />
              
              {/* Blue region */}
              <path d="M0,0 L100,0 L100,230 L0,230 Z" fill="#4169E1" opacity="0.5" />
              
              {/* White/gray region */}
              <path d="M100,0 L200,0 L200,230 L100,230 Z" fill="#CCCCCC" opacity="0.2" />
              
              {/* Red region */}
              <path d="M200,0 L300,0 L300,230 L200,230 Z" fill="#FF0000" opacity="0.5" />
              
              {/* Scatter plot points - Blue region */}
              <circle cx="25" cy="100" r="4" fill="#000" />
              <circle cx="40" cy="80" r="4" fill="#000" />
              <circle cx="50" cy="120" r="4" fill="#000" />
              <circle cx="35" cy="140" r="4" fill="#000" />
              <circle cx="60" cy="110" r="4" fill="#000" />
              <circle cx="70" cy="90" r="4" fill="#000" />
              <circle cx="30" cy="170" r="4" fill="#000" />
              <circle cx="45" cy="150" r="4" fill="#000" />
              <circle cx="55" cy="130" r="4" fill="#000" />
              
              {/* Scatter plot points - Middle region */}
              <circle cx="120" cy="130" r="4" fill="#FFF" />
              <circle cx="150" cy="110" r="4" fill="#FFF" />
              <circle cx="130" cy="140" r="4" fill="#FFF" />
              <circle cx="140" cy="120" r="4" fill="#FFF" />
              <circle cx="160" cy="100" r="4" fill="#FFF" />
              <circle cx="170" cy="130" r="4" fill="#FFF" />
              <circle cx="180" cy="150" r="4" fill="#FFF" />
              
              {/* Scatter plot points - Red region */}
              <circle cx="230" cy="90" r="4" fill="#000" />
              <circle cx="250" cy="110" r="4" fill="#000" />
              <circle cx="260" cy="70" r="4" fill="#000" />
              <circle cx="240" cy="120" r="4" fill="#000" />
              <circle cx="270" cy="100" r="4" fill="#000" />
              <circle cx="260" cy="130" r="4" fill="#000" />
              <circle cx="230" cy="150" r="4" fill="#000" />
              
              {/* X-axis */}
              <line x1="0" y1="200" x2="300" y2="200" stroke="#666" strokeWidth="1" />
              <text x="10" y="220" fill="#999" fontSize="12">-3</text>
              <text x="50" y="220" fill="#999" fontSize="12">-2</text>
              <text x="100" y="220" fill="#999" fontSize="12">-1</text>
              <text x="150" y="220" fill="#999" fontSize="12">0</text>
              <text x="200" y="220" fill="#999" fontSize="12">1</text>
              <text x="250" y="220" fill="#999" fontSize="12">2</text>
              <text x="290" y="220" fill="#999" fontSize="12">3</text>
              
              {/* Y-axis */}
              <line x1="150" y1="0" x2="150" y2="200" stroke="#666" strokeWidth="1" />
              <text x="135" y="15" fill="#999" fontSize="12">3</text>
              <text x="135" y="55" fill="#999" fontSize="12">2</text>
              <text x="135" y="95" fill="#999" fontSize="12">1</text>
              <text x="135" y="135" fill="#999" fontSize="12">0</text>
              <text x="135" y="175" fill="#999" fontSize="12">-1</text>
            </svg>
          </div>
          
          <button className="retrain-btn">RETRAIN</button>
        </div>
      </div>
      
      {/* Notification Section */}
      <div className="notification-container">
        <div className="notification-section">
          <h3 className="notification-section-title">Notification</h3>
          <div className="notification-message">
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
        </div>
      </div>
    </div>
  );
}

export default TrainingModel; 