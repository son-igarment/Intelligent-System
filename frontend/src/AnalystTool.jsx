import React, { useState } from 'react';
import NotificationSection from './NotificationSection';
import './App.css';

function AnalystTool({ onClose, onMenuChange }) {
  const currentDate = "2025-03-28";
  const [selectedStock, setSelectedStock] = useState("XYZ - Công ty Cổ phần Tập đoàn XYZ");
  const [selectedPeriod, setSelectedPeriod] = useState("Year On Year");
  
  // Chart data points for demonstration
  const monthLabels = ["202403", "202404", "202405", "202406", "202407", "202408", "202409", "202410", "202411", "202412", "202501", "202502", "202503", "Predicted"];
  
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
          
          <div className="sidebar-item active">
            Analyst tool
          </div>
          
          <div className="sidebar-item" onClick={() => onMenuChange('notification')}>
            Notification center
          </div>
          
          <div className="sidebar-item" onClick={() => onMenuChange('settings')}>
            Settings
          </div>
        </div>
        
        {/* Main Content */}
        <div className="dashboard-main">
          <div className="report-container">
            <div className="analyst-tool-header">
              <h2 className="report-title">SECURITY ANALYST TOOL</h2>
              
              <div className="report-dates">
                <div>Report date: <strong>{currentDate}</strong>.</div>
                <div>Lastest update date: <strong>{currentDate}</strong>.</div>
              </div>
            </div>
            
            {/* Stock Input */}
            <div className="stock-row">
              <div className="control-label">STOCK</div>
              <input 
                type="text" 
                className="control-input" 
                value={selectedStock}
                readOnly
              />
            </div>
            
            {/* Period Style and START button in one row */}
            <div className="period-row">
              <div className="period-group">
                <div className="control-label">PERIOD STYLE</div>
                <input 
                  type="text" 
                  className="control-input" 
                  value={selectedPeriod}
                  readOnly
                />
              </div>
              
              <button className="start-analysis-btn">START</button>
            </div>
            
            {/* AI Agent Recommendations */}
            <div className="ai-recommendations">
              <div className="ai-recommendation-item">
                <span className="ai-agent">AI agent:</span> As prediction, the <span className="purple-text">XYZ</span> stock is not affected to market with <span className="red-text">90%</span> probability any longer. You can take profit or change to the new portfolio if possible, <span className="purple-text">my boss</span>.
              </div>
              <div className="ai-recommendation-item">
                <span className="ai-agent">AI agent:</span> After closing market on 2025-03-28, the systematic risk of market can be occurred with <span className="red-text">90%</span> probability soon, <span className="purple-text">my boss</span>.
              </div>
            </div>
            
            {/* Chart Visualization */}
            <div className="chart-container">
              <div className="chart-y-axis">
                <div className="y-label">2.5</div>
                <div className="y-label">2.0</div>
                <div className="y-label">1.5</div>
                <div className="y-label">1.0</div>
                <div className="y-label">0.5</div>
                <div className="y-label">0.0</div>
              </div>
              
              <div className="chart-plot">
                {/* SVG Chart */}
                <svg width="100%" height="300" viewBox="0 0 1000 300" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="30" y1="40" x2="980" y2="40" className="chart-grid-line" />
                  <line x1="30" y1="100" x2="980" y2="100" className="chart-grid-line" />
                  <line x1="30" y1="160" x2="980" y2="160" className="chart-grid-line" />
                  <line x1="30" y1="220" x2="980" y2="220" className="chart-grid-line" />
                  <line x1="30" y1="280" x2="980" y2="280" className="chart-grid-line" />
                  
                  {/* XYZ Line (white) */}
                  <path d="M50,120 L100,65 L150,225 L200,190 L250,170 L300,175 L350,160 L400,140 L450,120 L500,95 L550,110 L600,75 L650,95 L700,110 L750,95 L800,120" 
                        fill="none" stroke="white" strokeWidth="2" />
                        
                  {/* Dots on XYZ line */}
                  <circle cx="50" cy="120" r="5" fill="white" />
                  <circle cx="100" cy="65" r="5" fill="white" />
                  <circle cx="150" cy="225" r="5" fill="white" />
                  <circle cx="200" cy="190" r="5" fill="white" />
                  <circle cx="250" cy="170" r="5" fill="white" />
                  <circle cx="300" cy="175" r="5" fill="white" />
                  <circle cx="350" cy="160" r="5" fill="white" />
                  <circle cx="400" cy="140" r="5" fill="white" />
                  <circle cx="450" cy="120" r="5" fill="white" />
                  <circle cx="500" cy="95" r="5" fill="white" />
                  <circle cx="550" cy="110" r="5" fill="white" />
                  <circle cx="600" cy="75" r="5" fill="white" />
                  <circle cx="650" cy="95" r="5" fill="white" />
                  <circle cx="700" cy="110" r="5" fill="white" />
                  <circle cx="750" cy="95" r="5" fill="white" />
                  <circle cx="800" cy="120" r="5" fill="white" />
                  
                  {/* VN-Index Line (gold) */}
                  <path d="M50,200 L100,200 L150,200 L200,200 L250,200 L300,200 L350,200 L400,200 L450,200 L500,200 L550,200 L600,200 L650,200 L700,200 L750,200 L800,200" 
                        fill="none" stroke="#FFD700" strokeWidth="2" />
                        
                  {/* Dots on VN-Index line */}
                  <circle cx="50" cy="200" r="5" fill="#FFD700" />
                  <circle cx="100" cy="200" r="5" fill="#FFD700" />
                  <circle cx="150" cy="200" r="5" fill="#FFD700" />
                  <circle cx="200" cy="200" r="5" fill="#FFD700" />
                  <circle cx="250" cy="200" r="5" fill="#FFD700" />
                  <circle cx="300" cy="200" r="5" fill="#FFD700" />
                  <circle cx="350" cy="200" r="5" fill="#FFD700" />
                  <circle cx="400" cy="200" r="5" fill="#FFD700" />
                  <circle cx="450" cy="200" r="5" fill="#FFD700" />
                  <circle cx="500" cy="200" r="5" fill="#FFD700" />
                  <circle cx="550" cy="200" r="5" fill="#FFD700" />
                  <circle cx="600" cy="200" r="5" fill="#FFD700" />
                  <circle cx="650" cy="200" r="5" fill="#FFD700" />
                  <circle cx="700" cy="200" r="5" fill="#FFD700" />
                  <circle cx="750" cy="200" r="5" fill="#FFD700" />
                  <circle cx="800" cy="200" r="5" fill="#FFD700" />
                  
                  {/* X-axis labels */}
                  {monthLabels.map((label, index) => (
                    <text 
                      key={index} 
                      x={50 + index * 50} 
                      y="295" 
                      className="chart-x-label"
                      textAnchor="middle"
                    >
                      {label}
                    </text>
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalystTool; 