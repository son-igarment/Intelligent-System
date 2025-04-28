import React, { useState, useEffect } from 'react';
import './App.css';

function AssetReport({ onClose, onMenuChange }) {
  const currentDate = "2025-03-28";
  
  const [assetData, setAssetData] = useState([]);
  const [marketCodes, setMarketCodes] = useState([]);
  const [selectedMarketCode, setSelectedMarketCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMarketCodes();
  }, []);

  const fetchMarketCodes = async () => {
    setLoading(true);
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
          setLoading(false);
        });
  };

  const filterByMarketCode = () => {
    setError('');
    setLoading(true);
    if (!selectedMarketCode) {
      // If no market code is selected, clear data
      setAssetData([]);
      setLoading(false);
      return;
    }
    
    // Filter the data by selected market code
    fetch('http://localhost:5001/api/stock-data-asset?market_code=' + selectedMarketCode)
      .then(response => response.json())
      .then(data => {
        if (data) {
          setAssetData(data);
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Error filtering data: ' + err.message);
        setLoading(false);
      });
  };

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
              <h2 className="report-title">DAILY NET VALUE ASSET</h2>
              
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
              {assetData.length > 0 ? (
                <table className="stock-table">
                  <thead>
                    <tr>
                      <th>Market Code</th>
                      <th>Ticker</th>
                      <th>Close Price</th>
                      <th>Total Volume</th>
                      <th>Open Price</th>
                      <th>Current Price</th>
                      <th>Profit / Loss</th>
                      <th>Profit / Loss (%)</th>
                      <th>Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetData.map((asset, index) => (
                      <tr key={index}>
                        <td>{asset.MarketCode}</td>
                        <td>{asset.Ticker}</td>
                        <td>{asset.ClosePrice.toFixed(2)}</td>
                        <td>{asset.TotalVolume.toFixed(0)}</td>
                        <td>{asset.OpenPrice.toFixed(2)}</td>
                        <td>{asset.CurrentPrice.toFixed(2)}</td>
                        <td className={asset.ProfitLoss >= 0 ? 'profit' : 'loss'}>
                          {asset.ProfitLoss.toFixed(2)}
                        </td>
                        <td className={asset.ProfitLossPercent >= 0 ? 'profit' : 'loss'}>
                          {asset.ProfitLossPercent.toFixed(2)}%
                        </td>
                        <td>{asset.Weight !== "" ? asset.Weight.toFixed(2) + "%" : 'N/A'}</td>
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

export default AssetReport; 