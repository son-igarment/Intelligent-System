import React from 'react';
import NotificationSection from './NotificationSection';
import './App.css';

function AnalystReport({ onClose, onMenuChange }) {
  const currentDate = "2025-03-28";
  
  const analystData = [
    { id: 1, name: "ABC", cost: 19.500, costBeta: "+2.0192", curPrice: 20.000, curBeta: "+1.0181", diffValue: "-1.0011", riskLevel: "Medium", predBeta: "+0.9203", diffPredict: "-1.0989", riskFuture: "High" },
    { id: 2, name: "BCD", cost: 36.000, costBeta: "+1.9203", curPrice: 33.000, curBeta: "-2.0776", diffValue: "-3.9979", riskLevel: "High", predBeta: "-2.3668", diffPredict: "-4.2871", riskFuture: "Very High" },
    { id: 3, name: "EFG", cost: 56.000, costBeta: "+1.8202", curPrice: 50.000, curBeta: "-2.0689", diffValue: "-2.0689", riskLevel: "High", predBeta: "-2.3689", diffPredict: "-4.1891", riskFuture: "Very High" },
    { id: 4, name: "NAV", cost: 11.000, costBeta: "+2.0004", curPrice: 12.000, curBeta: "-0.9221", diffValue: "-2.9225", riskLevel: "High", predBeta: "-1.0192", diffPredict: "-3.0196", riskFuture: "Very High" },
    { id: 5, name: "VN-Index", cost: 1100.00, costBeta: "1.0000", curPrice: 1300.00, curBeta: "1.0000", diffValue: "1.0000", riskLevel: "High", predBeta: "1.0000", diffPredict: "", riskFuture: "Very High" }
  ];

  return (
    <div className="dashboard-container">
      <div className="main-header">
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
          
          <div className="sidebar-item active">
            Analyst report
          </div>
          
          <div className="sidebar-item" onClick={() => onMenuChange('tool')}>
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
            <div className="report-header">
              <h2 className="report-title">Daily Analyst Report</h2>
              
              <div className="report-dates">
                <div>Report date: <strong>{currentDate}</strong>.</div>
                <div>Lastest update date: <strong>{currentDate}</strong>.</div>
              </div>
            </div>
            
            <div className="stock-table-container">
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>Stock Name</th>
                    <th>Cost</th>
                    <th>Cost.Beta</th>
                    <th>Cur.Price</th>
                    <th>Cur.Beta</th>
                    <th>Diff +/-</th>
                    <th>Risk level</th>
                    <th>Pred.Beta</th>
                    <th>Diff +/-</th>
                    <th>Risk level</th>
                  </tr>
                </thead>
                <tbody>
                  {analystData.map(stock => (
                    <tr key={stock.id}>
                      <td className={stock.name === "NAV" ? "highlight" : stock.name === "VN-Index" ? "yellow-highlight" : ""}>
                        {stock.name}
                      </td>
                      <td>{typeof stock.cost === 'number' ? stock.cost.toFixed(3) : stock.cost}</td>
                      <td className={stock.costBeta.startsWith('+') ? 'profit' : stock.costBeta.startsWith('-') ? 'loss' : ''}>
                        {stock.costBeta}
                      </td>
                      <td>{typeof stock.curPrice === 'number' ? stock.curPrice.toFixed(3) : stock.curPrice}</td>
                      <td className={stock.curBeta.startsWith('+') ? 'profit' : stock.curBeta.startsWith('-') ? 'loss' : ''}>
                        {stock.curBeta}
                      </td>
                      <td className={stock.diffValue.startsWith('+') ? 'profit' : stock.diffValue.startsWith('-') ? 'loss' : ''}>
                        {stock.diffValue}
                      </td>
                      <td className={`risk-level ${stock.riskLevel.toLowerCase().replace(' ', '-')}`}>
                        {stock.riskLevel}
                      </td>
                      <td className={stock.predBeta.startsWith('+') ? 'profit' : stock.predBeta.startsWith('-') ? 'loss' : ''}>
                        {stock.predBeta}
                      </td>
                      <td className={stock.diffPredict.startsWith('+') ? 'profit' : stock.diffPredict.startsWith('-') ? 'loss' : ''}>
                        {stock.diffPredict}
                      </td>
                      <td className={`risk-level ${stock.riskFuture.toLowerCase().replace(' ', '-')}`}>
                        {stock.riskFuture}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Notification Section */}
            <NotificationSection />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalystReport; 