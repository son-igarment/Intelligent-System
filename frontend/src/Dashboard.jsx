import React, { useState } from 'react';
import AssetReport from './AssetReport';
import AnalystTool from './AnalystTool';
import DataImport from './DataImport';
import BetaCalculation from './BetaCalculation';
import SVMAnalysis from './SVMAnalysis';
import MarketIndexView from './MarketIndexView';
import './App.css';

function Dashboard({ onClose }) {
  const currentDate = "2025-03-28";
  
  const stockData = [
    { id: 1, name: "ABC", industry: "Banking", cost: 19.500, price: 20.000, profit: "+2.56%", beta: "+1.0181", risk: "Medium" },
    { id: 2, name: "BCD", industry: "Real Estate", cost: 36.000, price: 33.000, profit: "-8.33%", beta: "-2.077", risk: "High" },
    { id: 3, name: "EFG", industry: "Technology", cost: 56.000, price: 50.000, profit: "-8.33%", beta: "-2.6689", risk: "High" },
    { id: 4, name: "NAV", industry: "Net Asset Value", cost: 11.000, price: 12.000, profit: "+9.09%", beta: "-0.9221", risk: "High" },
    { id: 5, name: "VN-Index", industry: "Indice", cost: 1100.00, price: 1300.00, profit: "+18.18%", beta: "1.0000", risk: "High" }
  ];

  const [activeMenu, setActiveMenu] = useState('dashboard');

  const handleMenuChange = (menuItem) => {
    setActiveMenu(menuItem);
  };

  if (activeMenu === 'assets') {
    return <AssetReport onClose={onClose} onMenuChange={handleMenuChange} />;
  }
  
  if (activeMenu === 'tool') {
    return <AnalystTool onClose={onClose} onMenuChange={handleMenuChange} />;
  }
  
  if (activeMenu === 'import') {
    return <DataImport onClose={onClose} onMenuChange={handleMenuChange} />;
  }
  
  if (activeMenu === 'beta') {
    return <BetaCalculation onClose={onClose} onMenuChange={handleMenuChange} />;
  }
  
  if (activeMenu === 'svm') {
    return <SVMAnalysis onClose={onClose} onMenuChange={handleMenuChange} />;
  }
  
  if (activeMenu === 'market-index') {
    return <MarketIndexView onClose={onClose} onMenuChange={handleMenuChange} />;
  }

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
          
          <div className={`sidebar-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
               onClick={() => handleMenuChange('dashboard')}>
            Dashboard
          </div>
          
          <div className={`sidebar-item ${activeMenu === 'assets' ? 'active' : ''}`}
               onClick={() => handleMenuChange('assets')}>
            Assets report
          </div>
          
          <div className={`sidebar-item ${activeMenu === 'tool' ? 'active' : ''}`}
               onClick={() => handleMenuChange('tool')}>
            Analyst tool
          </div>
          
          <div className={`sidebar-item ${activeMenu === 'beta' ? 'active' : ''}`}
               onClick={() => handleMenuChange('beta')}>
            Beta Calculation
          </div>
          
          <div className={`sidebar-item ${activeMenu === 'svm' ? 'active' : ''}`}
               onClick={() => handleMenuChange('svm')}>
            SVM Analysis
          </div>
          
          <div className={`sidebar-item ${activeMenu === 'import' ? 'active' : ''}`}
               onClick={() => handleMenuChange('import')}>
            Data Import
          </div>
          
          <div className={`sidebar-item ${activeMenu === 'market-index' ? 'active' : ''}`}
               onClick={() => handleMenuChange('market-index')}>
            Market Index
          </div>
        </div>
        
        {/* Main Content */}
        <div className="dashboard-main">
          <div className="report-container">
            <div className="report-header">
              <h2 className="report-title">Daily Investment Report</h2>
              
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
                    <th>Industry</th>
                    <th>Cost</th>
                    <th>Cur.Price</th>
                    <th>Profit / Loss (%)</th>
                    <th>Beta</th>
                    <th>Risk level</th>
                  </tr>
                </thead>
                <tbody>
                  {stockData.map(stock => (
                    <tr key={stock.id}>
                      <td className={stock.name === "NAV" ? "highlight" : stock.name === "VN-Index" ? "yellow-highlight" : ""}>
                        {stock.name}
                      </td>
                      <td>{stock.industry}</td>
                      <td>{stock.cost.toFixed(3)}</td>
                      <td>{stock.price.toFixed(3)}</td>
                      <td className={stock.profit.startsWith('+') ? 'profit' : 'loss'}>
                        {stock.profit}
                      </td>
                      <td>{stock.beta}</td>
                      <td className={`risk-level ${stock.risk.toLowerCase()}`}>{stock.risk}</td>
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

export default Dashboard; 