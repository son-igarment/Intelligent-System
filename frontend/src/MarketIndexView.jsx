import React, { useState, useEffect } from 'react';
import './App.css';

function MarketIndexView({ onClose, onMenuChange }) {
  const currentDate = "2025-03-28";
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Tải dữ liệu chỉ số thị trường khi component được tạo
  useEffect(() => {
    fetchMarketIndexData();
  }, []);
  
  // Lấy dữ liệu chỉ số thị trường từ backend
  const fetchMarketIndexData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch('http://localhost:5000/api/market-index-data');
      const data = await response.json();
      
      if (response.ok && data.length > 0) {
        setMarketData(data);
        setDataLoaded(true);
      } else if (response.ok && data.length === 0) {
        setError("Chưa có dữ liệu chỉ số thị trường. Vui lòng import dữ liệu trước.");
      } else {
        setError("Lỗi khi lấy dữ liệu chỉ số thị trường");
      }
    } catch (err) {
      setError(`Lỗi khi tải dữ liệu: ${err.message}`);
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
          
          <div className="sidebar-item" onClick={() => onMenuChange('assets')}>
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
          
          <div className="sidebar-item active">
            Market Index Data
          </div>
        </div>
        
        {/* Main Content */}
        <div className="dashboard-main">
          <div className="report-container">
            <div className="report-header">
              <h2 className="report-title">Market Index Data</h2>
              
              <div className="report-dates">
                <div>Report date: <strong>{currentDate}</strong></div>
                <button onClick={fetchMarketIndexData} className="refresh-btn">
                  Refresh Data
                </button>
              </div>
            </div>
            
            {/* Market Data Display */}
            <div className="market-data-container">
              {loading ? (
                <div className="loading-indicator">Đang tải dữ liệu...</div>
              ) : error ? (
                <div className="error-message">
                  <p>{error}</p>
                  <button onClick={() => onMenuChange('import')} className="action-btn">
                    Chuyển đến Import Data
                  </button>
                </div>
              ) : !dataLoaded ? (
                <div className="no-data-message">
                  <p>Chưa có dữ liệu chỉ số thị trường. Vui lòng import dữ liệu.</p>
                  <button onClick={() => onMenuChange('import')} className="action-btn">
                    Chuyển đến Import Data
                  </button>
                </div>
              ) : (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Ngày</th>
                        <th>Mã Index</th>
                        <th>Giá mở cửa</th>
                        <th>Giá cao nhất</th>
                        <th>Giá thấp nhất</th>
                        <th>Giá đóng cửa</th>
                        <th>Khối lượng</th>
                        <th>Giá trị</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketData.map((item, index) => (
                        <tr key={index}>
                          <td>{item.TradeDate || '-'}</td>
                          <td>{item.IndexCode || '-'}</td>
                          <td>{typeof item.OpenIndex === 'number' ? item.OpenIndex.toFixed(2) : '-'}</td>
                          <td>{typeof item.HighestIndex === 'number' ? item.HighestIndex.toFixed(2) : '-'}</td>
                          <td>{typeof item.LowestIndex === 'number' ? item.LowestIndex.toFixed(2) : '-'}</td>
                          <td>{typeof item.CloseIndex === 'number' ? item.CloseIndex.toFixed(2) : '-'}</td>
                          <td>{typeof item.TotalVolume === 'number' ? item.TotalVolume.toLocaleString() : '-'}</td>
                          <td>{typeof item.TotalValue === 'number' ? item.TotalValue.toLocaleString() : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarketIndexView; 