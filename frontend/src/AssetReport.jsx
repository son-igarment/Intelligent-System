import React from 'react';
import './App.css';

function AssetReport({ onClose, onMenuChange }) {
  const currentDate = "2025-03-28";
  
  const assetData = [
    { id: 1, name: "ABC", volume: 1000, curPrice: 20.000, cost: 19500.00, totalValue: 20000.00, profit: "+500.00", profitPercent: "+2.56%", weight: "10.00%" },
    { id: 2, name: "BCD", volume: 2000, curPrice: 33.000, cost: 72000.00, totalValue: 66000.00, profit: "-6000.00", profitPercent: "-8.33%", weight: "33.00%" },
    { id: 3, name: "EFG", volume: 1500, curPrice: 50.000, cost: 84000.00, totalValue: 75000.00, profit: "-9000.00", profitPercent: "-10.71%", weight: "37.50%" },
    { id: 4, name: "Cash", volume: 1, curPrice: 39000.00, cost: 39000.00, totalValue: 39000.00, profit: "+0.00", profitPercent: "+0.00%", weight: "19.50%" },
    { id: 5, name: "NAV", volume: 1, curPrice: 200000.00, cost: 214500.00, totalValue: 200000.00, profit: "-14500.00", profitPercent: "-6.76%", weight: "100.00%" }
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
          
          <div className="sidebar-item" onClick={() => onMenuChange('tool')}>
            Analyst tool
          </div>
          
          <div className="sidebar-item" onClick={() => onMenuChange('beta')}>
            Beta Calculation
          </div>

          <div className="sidebar-item" onClick={() => onMenuChange('svm')}>
            SVM Analysis
          </div>

          <div className="sidebar-item" onClick={() => onMenuChange('import')}>
            Data Import
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssetReport; 