import React, { useState, useEffect } from 'react';
import AssetReport from './AssetReport';
import AnalystTool from './AnalystTool';
import DataImport from './DataImport';
import BetaCalculation from './BetaCalculation';
import SVMAnalysis from './SVMAnalysis';
import MarketIndexView from './MarketIndexView';
import ResearchLogin from './ResearchLogin';
import './App.css';

function Dashboard({ onClose }) {
  const currentDate = "2025-04-29";
  
  const [stockData, setStockData] = useState([]);
  const [marketCodes, setMarketCodes] = useState([]);
  const [selectedMarketCode, setSelectedMarketCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResearchLogin, setShowResearchLogin] = useState(false);

  const [activeMenu, setActiveMenu] = useState('dashboard');

  useEffect(() => {
    fetchMarketCodes();
  }, []);

  const fetchMarketCodes = async () => {
    setError('');
    fetch('http://localhost:5001/api/market-code')
        .then(response => response.json())
        .then(data => {
          if (data) {
            setMarketCodes(data);
          }
        })
        .catch(err => {
          setError('Error filtering data: ' + err.message);
        });
  };

  const filterByMarketCode = () => {
    setError('');
    if (!selectedMarketCode) {
      // If no market code is selected, clear data
      setStockData([]);
      return;
    }
    
    // Filter the data by selected market code
    fetch('http://localhost:5001/api/stock-data-with-beta?market_code=' + selectedMarketCode)
      .then(response => response.json())
      .then(data => {
        if (data) {
          setStockData(data);
        }
      })
      .catch(err => {
        setError('Error filtering data: ' + err.message);
      });
  };

  const handleMenuChange = (menuItem) => {
    setActiveMenu(menuItem);
  };

  const handleUserIconClick = () => {
    setShowResearchLogin(true);
  };

  if (showResearchLogin) {
    return <ResearchLogin onGoBack={() => setShowResearchLogin(false)} />;
  }

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
        <div className="header-controls">
          <button className="user-icon-btn" onClick={handleUserIconClick}>
            <i className="fas fa-user">👤</i>
          </button>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
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
          
          <div className={`sidebar-item ${activeMenu === 'beta' ? 'active' : ''}`}
               onClick={() => handleMenuChange('beta')}>
            Beta Calculation
          </div>
          
          <div className={`sidebar-item ${activeMenu === 'svm' ? 'active' : ''}`}
               onClick={() => handleMenuChange('svm')}>
            SVM Analysis
          </div>
          
          

        </div>
        
        {/* Main Content */}
        <div className="dashboard-main">
          <div className="report-container">
            <div className="report-header">
              <h2 className="report-title">DAILY INVESTMENT REPORT</h2>
              
              <div className="report-dates">
                <div>Report date: <strong>{currentDate}</strong></div>
                <div>Lastest update date: <strong>{currentDate}</strong></div>
              </div>
              
              {/* Filter Controls */}
              <div className="filter-controls">
                <select 
                  value={selectedMarketCode}
                  onChange={(e) => setSelectedMarketCode(e.target.value)}
                  className="market-code-select"
                >
                  <option value="">-- Select Market Code --</option>
                  {marketCodes.map((code, index) => (
                    <option key={index} value={code}>{code}</option>
                  ))}
                </select>
                <button 
                  onClick={filterByMarketCode}
                  className="filter-btn"
                  disabled={!selectedMarketCode}
                >
                  Load Data
                </button>
              </div>
            </div>
            
            {loading && <div className="loading-indicator">Loading data...</div>}
            {error && <div className="error-message">{error}</div>}
            
            <div className="stock-table-container">
              {stockData.length > 0 ? (
                <table className="stock-table">
                  <thead>
                    <tr>
                      <th>Market Code</th>
                      <th>Ticker</th>
                      <th>Open Price</th>
                      <th>Current Price</th>
                      <th>Profit / Loss (%)</th>
                      <th>Beta</th>
                      <th>Risk level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockData.map((stock, index) => (
                      <tr key={index}>
                        <td>{stock.MarketCode}</td>
                        <td>{stock.Ticker}</td>
                        <td>{stock.OpenPrice.toFixed(2)}</td>
                        <td>{stock.CurrentPrice.toFixed(2)}</td>
                        <td className={stock.ProfitLossPercent >= 0 ? 'profit' : 'loss'}>
                          {stock.ProfitLossPercent.toFixed(2)}%
                        </td>
                        <td>{stock.beta !== null ? stock.beta.toFixed(4) : 'N/A'}</td>
                        <td className={`risk-level ${stock.risk.toLowerCase()}`}>{stock.risk}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-data-message">
                  {!selectedMarketCode ? "Please select a market code to load data" : "No data available for the selected market code"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 