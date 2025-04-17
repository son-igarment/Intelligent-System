import React from 'react';
import NotificationSection from './NotificationSection';
import './App.css';

function AssetReport({ onClose, onMenuChange }) {
  const currentDate = "2025-03-28";
  
  const assetData = [
    { id: 1, name: "ABC", volume: "10,000,000", curPrice: "20.000", cost: "195,000,000,000", totalValue: "200,000,000,000", profit: "+5,000,000,000", profitPercent: "+2.56%", weight: "66.67%" },
    { id: 2, name: "BCD", volume: "100,000", curPrice: "33.000", cost: "3,600,000,000", totalValue: "3,300,000,000", profit: "-300,000,000", profitPercent: "-8.33%", weight: "1.10%" },
    { id: 3, name: "EFG", volume: "100,000", curPrice: "50.000", cost: "5,600,000,000", totalValue: "5,000,000,000", profit: "-600,000,000", profitPercent: "-8.33%", weight: "1.67%" },
    { id: 4, name: "Cash", volume: "-", curPrice: "", cost: "70,800,000,000", totalValue: "91,700,000,000", profit: "+20,900,000,000", profitPercent: "+29.52%", weight: "30.56%" },
    { id: 5, name: "NAV", volume: "25,000,000", curPrice: "12.000", cost: "275,000,000,000", totalValue: "300,000,000,000", profit: "+25,000,000,000", profitPercent: "+9.09%", weight: "100.00%" }
  ];

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
          
          <div className="sidebar-item active">
            Assets report
          </div>
          
          <div className="sidebar-item" onClick={() => onMenuChange('analyst')}>
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
              <h2 className="report-title">Daily Net Value Asset Report</h2>
              
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
                    <th>Volume</th>
                    <th>Cur.Price</th>
                    <th>Cost</th>
                    <th>Cur.Price</th>
                    <th>Profit / Loss</th>
                    <th>Profit / Loss (%)</th>
                    <th>Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {assetData.map(asset => (
                    <tr key={asset.id}>
                      <td className={asset.name === "NAV" ? "highlight" : asset.name === "Cash" ? "yellow-highlight" : ""}>
                        {asset.name}
                      </td>
                      <td>{asset.volume}</td>
                      <td>{asset.curPrice}</td>
                      <td>{asset.cost}</td>
                      <td>{asset.totalValue}</td>
                      <td className={asset.profit.startsWith('+') ? 'profit' : 'loss'}>
                        {asset.profit}
                      </td>
                      <td className={asset.profitPercent.startsWith('+') ? 'profit' : 'loss'}>
                        {asset.profitPercent}
                      </td>
                      <td>{asset.weight}</td>
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

export default AssetReport; 