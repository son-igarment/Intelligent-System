import React, { useState, useEffect } from 'react';
import './App.css';

function AssetReport({ onClose, onMenuChange }) {
  const currentDate = "2025-03-28";
  
  const [assetData, setAssetData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssetData();
  }, []);

  const fetchAssetData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('http://localhost:5000/api/stock-data-with-beta');
      const data = await response.json();
      
      if (response.ok) {
        setAssetData(data);
      } else {
        setError('Failed to fetch asset data: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
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
              <h2 className="report-title">Daily Net Value Asset Report</h2>
              
              <div className="report-dates">
                <div>Report date: <strong>{currentDate}</strong>.</div>
                <div>Lastest update date: <strong>{currentDate}</strong>.</div>
              </div>
            </div>
            
            {loading && <div className="loading-indicator">Loading asset data...</div>}
            {error && <div className="error-message">{error}</div>}
            
            <div className="stock-table-container">
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