import React, { useState, useEffect } from 'react';
import AssetReport from './AssetReport';
import AnalystTool from './AnalystTool';
import DataImport from './DataImport';
import BetaCalculation from './BetaCalculation';
import SVMAnalysis from './SVMAnalysis';
import MarketIndexView from './MarketIndexView';
import './App.css';

function Dashboard({ onClose }) {
  const currentDate = "2025-03-28";
  
  const [stockData, setStockData] = useState([]);
  const [marketCodes, setMarketCodes] = useState([]);
  const [selectedMarketCode, setSelectedMarketCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [activeMenu, setActiveMenu] = useState('dashboard');

  useEffect(() => {
    fetchMarketCodes();
  }, []);

  const fetchMarketCodes = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('http://localhost:5001/api/stock-data-with-beta');
      const data = await response.json();
      
      if (response.ok) {
        // Extract unique market codes
        const uniqueMarketCodes = [...new Set(data.map(item => item.MarketCode))];
        setMarketCodes(uniqueMarketCodes);
      } else {
        setError('Failed to fetch market codes: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterByMarketCode = () => {
    if (!selectedMarketCode) {
      // If no market code is selected, clear data
      setStockData([]);
      return;
    }
    
    // Filter the data by selected market code
    fetch('http://localhost:5001/api/stock-data-with-beta')
      .then(response => response.json())
      .then(data => {
        if (data) {
          const filteredData = data.filter(item => 
            item.MarketCode === selectedMarketCode
          );
          setStockData(filteredData);
        }
      })
      .catch(err => {
        setError('Error filtering data: ' + err.message);
      });
  };

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