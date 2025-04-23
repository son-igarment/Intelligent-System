import React, { useState, useEffect } from 'react';
import './App.css';

function SVMAnalysis({ onClose, onMenuChange }) {
  const currentDate = "2025-03-28";
  const [stocks, setStocks] = useState([]);
  const [tickers, setTickers] = useState([]);
  const [filteredTickers, setFilteredTickers] = useState([]);
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [daysToPrediction, setDaysToPrediction] = useState(5);
  const [useBeta, setUseBeta] = useState(true);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [selectedStock, setSelectedStock] = useState('');
  const [selectedTicker, setSelectedTicker] = useState('');

  // Fetch stocks and tickers on component load
  useEffect(() => {
    fetchStocksAndTickers();
    fetchLatestAnalysis();
  }, []);

  // Update filtered tickers when MarketCode changes
  useEffect(() => {
    if (selectedStock) {
      const filtered = allData
        .filter(item => item.MarketCode === selectedStock)
        .map(item => item.Ticker);
      setFilteredTickers([...new Set(filtered)]);
      setSelectedTicker(''); // Reset ticker selection when MarketCode changes
    } else {
      // If no MarketCode selected, show all tickers
      setFilteredTickers(tickers);
    }
  }, [selectedStock, allData, tickers]);

  // Fetch available stocks and tickers
  const fetchStocksAndTickers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('http://localhost:5000/api/stock-data');
      const data = await response.json();
      
      if (response.ok) {
        // Store all data for filtering
        setAllData(data);
        
        // Extract unique market codes (HNX, HOSE, etc.)
        const uniqueMarketCodes = [...new Set(data.map(item => item.MarketCode))];
        setStocks(uniqueMarketCodes);
        
        // Extract unique ticker symbols (VLA, MCF, BXH, etc.)
        const uniqueTickers = [...new Set(data.map(item => item.Ticker))];
        setTickers(uniqueTickers);
        setFilteredTickers(uniqueTickers); // Initialize filtered tickers with all tickers
      } else {
        setError('Không thể lấy dữ liệu cổ phiếu');
      }
    } catch (err) {
      setError(`Lỗi khi tải dữ liệu: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch latest SVM analysis
  const fetchLatestAnalysis = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:5000/api/latest-svm-analysis');
      
      if (response.ok) {
        const data = await response.json();
        setLatestAnalysis(data);
      } else {
        // If no analysis exists, don't show an error
        if (response.status !== 404) {
          const errorData = await response.json();
          setError(errorData.error || 'Không thể lấy dữ liệu phân tích SVM');
        }
      }
    } catch (err) {
      setError(`Lỗi khi tải dữ liệu: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Perform SVM analysis
  const runSVMAnalysis = async () => {
    try {
      setLoading(true);
      setError('');
      
      const requestBody = {
        days_to_predict: parseInt(daysToPrediction),
        use_beta: useBeta
      };
      
      // Add market_code and ticker to the request if selected
      if (selectedStock) {
        requestBody.market_code = selectedStock;
      }
      
      if (selectedTicker) {
        requestBody.ticker = selectedTicker;
      }
      
      const response = await fetch('http://localhost:5000/api/svm-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAnalysisResults(data);
        setLatestAnalysis({
          date: new Date().toLocaleString(),
          days_to_predict: parseInt(daysToPrediction),
          accuracy: data.model_metrics.accuracy,
          predictions: data.predictions,
          use_beta: useBeta
        });
        alert(`Phân tích SVM hoàn tất với độ chính xác ${(data.model_metrics.accuracy * 100).toFixed(2)}%`);
      } else {
        setError(data.error || 'Lỗi khi thực hiện phân tích SVM');
      }
    } catch (err) {
      setError(`Lỗi khi thực hiện phân tích: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Get style for prediction
  const getPredictionStyle = (signal) => {
    if (signal === 'strong_buy') {
      return { color: '#00C853', fontWeight: 'bold' };
    } else if (signal === 'strong_sell') {
      return { color: '#FF3D00', fontWeight: 'bold' };
    } else {
      return { color: '#FFC107' };
    }
  };

  // Get background color for confidence
  const getConfidenceBackground = (confidence) => {
    if (!confidence) return '#444';
    if (confidence >= 0.8) return '#388E3C';
    if (confidence >= 0.6) return '#689F38';
    if (confidence >= 0.4) return '#FFA000';
    return '#F57C00';
  };

  // Format confidence as percentage
  const formatConfidence = (confidence) => {
    if (!confidence) return 'N/A';
    return `${(confidence * 100).toFixed(1)}%`;
  };

  // Get beta color based on value
  const getBetaColor = (beta) => {
    if (beta === null || beta === undefined) return 'gray';
    if (beta < 0) return 'purple';
    if (beta < 0.5) return 'blue';
    if (beta < 1) return 'green';
    if (beta === 1) return 'white';
    if (beta < 1.5) return 'orange';
    if (beta < 2) return 'orangered';
    return 'red';
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
          
          <div className="sidebar-item active">
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
              <h2 className="report-title">SVM Analysis</h2>
              
              <div className="report-dates">
                <div>Analysis date: <strong>{latestAnalysis ? latestAnalysis.date : currentDate}</strong></div>
              </div>
            </div>
            
            {/* Analysis Controls */}
            <div className="beta-calculation-container">
              <div className="calculation-section">
                <h3 className="section-title">Phân tích dự đoán với SVM</h3>
                
                <div className="calculation-options">
                  <div className="option-group">
                    <select 
                      value={selectedStock} 
                      onChange={(e) => setSelectedStock(e.target.value)}
                      className="stock-select"
                    >
                      <option value="">-- Chọn market code --</option>
                      {stocks.map(stock => (
                        <option key={stock} value={stock}>{stock}</option>
                      ))}
                    </select>
                    
                    <select 
                      value={selectedTicker} 
                      onChange={(e) => setSelectedTicker(e.target.value)}
                      className="ticker-select"
                    >
                      <option value="">-- Chọn ticker --</option>
                      {filteredTickers.map(ticker => (
                        <option key={ticker} value={ticker}>{ticker}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="option-group">
                    <label>Số ngày dự báo:</label>
                    <select 
                      value={daysToPrediction} 
                      onChange={(e) => setDaysToPrediction(e.target.value)}
                      className="stock-select"
                    >
                      <option value="1">1 ngày</option>
                      <option value="3">3 ngày</option>
                      <option value="5">5 ngày</option>
                      <option value="7">7 ngày</option>
                      <option value="10">10 ngày</option>
                      <option value="30">30 ngày</option>
                    </select>
                  </div>
                  
                  <div className="option-group">
                    <label>Sử dụng hệ số Beta:</label>
                    <div className="toggle-container">
                      <input 
                        type="checkbox" 
                        id="useBeta" 
                        checked={useBeta} 
                        onChange={() => setUseBeta(!useBeta)}
                        className="toggle-input"
                      />
                      <label htmlFor="useBeta" className="toggle-label"></label>
                    </div>
                  </div>
                  
                  <button 
                    className="calculate-btn" 
                    onClick={runSVMAnalysis}
                    disabled={loading}
                  >
                    {loading ? 'Đang phân tích...' : 'Bắt đầu phân tích'}
                  </button>
                </div>
                
                {error && (
                  <div className="error-message">
                    <p>{error}</p>
                  </div>
                )}
                
                {loading && (
                  <div className="loading-indicator">
                    <p>Đang thực hiện phân tích SVM...</p>
                  </div>
                )}
                
                {/* Analysis Results */}
                {latestAnalysis && latestAnalysis.predictions && (
                  <div className="results-section">
                    <div className="results-summary">
                      <div className="result-card">
                        <h4>Độ chính xác</h4>
                        <div className="result-value">{(latestAnalysis.accuracy * 100).toFixed(2)}%</div>
                      </div>
                      
                      <div className="result-card">
                        <h4>Dự báo</h4>
                        <div className="result-value">{latestAnalysis.days_to_predict} ngày</div>
                      </div>
                      
                      <div className="result-card">
                        <h4>Cổ phiếu phân tích</h4>
                        <div className="result-value">{latestAnalysis.predictions.length}</div>
                      </div>
                      
                      <div className="result-card">
                        <h4>Sử dụng Beta</h4>
                        <div className="result-value">{latestAnalysis.use_beta ? "Có" : "Không"}</div>
                      </div>
                    </div>
                    
                    <h4 className="results-title">Dự đoán xu hướng giá {latestAnalysis.days_to_predict} ngày tới</h4>
                    
                    <div className="beta-results-table">
                      <table className="beta-table">
                        <thead>
                          <tr>
                            <th>Mã CK</th>
                            <th>Xu hướng</th>
                            <th>Đề xuất</th>
                            <th>Độ tin cậy</th>
                            <th>Hệ số Beta</th>
                            <th>Đánh giá Beta</th>
                          </tr>
                        </thead>
                        <tbody>
                          {latestAnalysis.predictions.map((prediction, index) => (
                            <tr key={index}>
                              <td>{prediction.stock_code}</td>
                              <td style={getPredictionStyle(prediction.signal)}>
                                {prediction.prediction_label}
                              </td>
                              <td>
                                <div className="recommendation-badge" style={getPredictionStyle(prediction.signal)}>
                                  {prediction.signal === 'strong_buy' ? 'MUA' : 
                                   prediction.signal === 'strong_sell' ? 'BÁN' : 'THEO DÕI'}
                                </div>
                              </td>
                              <td>
                                <div className="confidence-bar-container">
                                  <div 
                                    className="confidence-bar" 
                                    style={{ 
                                      width: `${prediction.confidence ? prediction.confidence * 100 : 0}%`,
                                      backgroundColor: getConfidenceBackground(prediction.confidence)
                                    }}
                                  ></div>
                                  <span className="confidence-value">{formatConfidence(prediction.confidence)}</span>
                                </div>
                              </td>
                              <td style={{ color: getBetaColor(prediction.beta) }}>
                                {prediction.beta ? prediction.beta.toFixed(4) : 'N/A'}
                              </td>
                              <td>{prediction.beta_interpretation || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="model-info-section">
                      <h4>Mô hình SVM</h4>
                      <p>Support Vector Machine (SVM) là thuật toán học máy phân loại mạnh mẽ, được sử dụng ở đây để dự đoán biến động giá cổ phiếu dựa trên các chỉ báo kỹ thuật, đặc điểm lịch sử giá và hệ số Beta.</p>
                      
                      <div className="model-features">
                        <h5>Các chỉ báo được sử dụng:</h5>
                        <ul>
                          <li>Giá hiện tại (Current Price)</li>
                          <li>Chỉ số sức mạnh tương đối (RSI)</li>
                          <li>Chỉ báo MACD (Moving Average Convergence Divergence)</li>
                          <li>Dải Bollinger (Bollinger Bands)</li>
                          <li>Khối lượng cân bằng (On-Balance Volume)</li>
                          <li>Biến động trung bình thực (ATR)</li>
                          <li>Hệ số Beta (sử dụng để đánh giá rủi ro hệ thống)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {(!latestAnalysis || !latestAnalysis.predictions) && !loading && !error && (
                  <div className="no-analysis">
                    <p>Chưa có dữ liệu phân tích. Hãy chạy phân tích SVM để bắt đầu.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SVMAnalysis;