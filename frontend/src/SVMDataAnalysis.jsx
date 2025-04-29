import React, { useState, useEffect } from 'react';
import './App.css';

function SVMDataAnalysis({ onClose, onMenuChange }) {
  const currentDate = "2025-04-29";
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

  function setSelectStock(value) {
    setSelectedStock(value)
    try {
      setLoading(true);
      setError('');
      // Use new API endpoint with data-analysis prefix
      fetch('http://localhost:5001/api/data-analysis/ticker?market_code=' + value)
          .then(response => response.json())
          .then(data => {
            if (data) {
              setTickers(data);
              setFilteredTickers(data);
            }
          })
          .catch(err => {
            setError('Error filtering data: ' + err.message);
          });

      setSelectedTicker(''); // Reset ticker selection when MarketCode changes
    } catch (err) {
      setError(`Lỗi khi tải dữ liệu: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Fetch available stocks and tickers - Updated with new API endpoint
  const fetchStocksAndTickers = async () => {
    try {
      setLoading(true);
      setError('');
      fetch('http://localhost:5001/api/data-analysis/market-code')
          .then(response => response.json())
          .then(data => {
            if (data) {
              setStocks(data);
            }
          })
          .catch(err => {
            setError('Error filtering data: ' + err.message);
          });
    } catch (err) {
      setError(`Lỗi khi tải dữ liệu: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch latest SVM analysis - Updated with new API endpoint
  const fetchLatestAnalysis = async () => {
    try {
      setLoading(true);
      
      // Build query parameters for market_code and ticker if selected
      let queryParams = new URLSearchParams();
      if (selectedStock) {
        queryParams.append('market_code', selectedStock);
      }
      if (selectedTicker) {
        queryParams.append('ticker', selectedTicker);
      }
      
      // Updated API endpoint
      const url = queryParams.toString() 
        ? `http://localhost:5001/api/data-analysis/latest-svm-analysis?${queryParams.toString()}`
        : 'http://localhost:5001/api/data-analysis/latest-svm-analysis';
      
      const response = await fetch(url);
      
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

  // Perform SVM analysis - Updated with new API endpoint
  const runSVMAnalysis = async () => {
    if (!selectedStock || !selectedTicker) {
      setError('Vui lòng chọn cả Market Code và Ticker để thực hiện phân tích');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const requestBody = {
        days_to_predict: parseInt(daysToPrediction),
        use_beta: useBeta,
        market_code: selectedStock,
        ticker: selectedTicker
      };
      
      // Updated API endpoint
      const response = await fetch('http://localhost:5001/api/data-analysis/svm-analysis', {
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
          use_beta: useBeta,
          market_code: selectedStock,
          ticker: selectedTicker
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

  // Helper functions remain the same
  const getPredictionStyle = (signal) => {
    if (signal === 'strong_buy') {
      return { color: '#00C853', fontWeight: 'bold' };
    } else if (signal === 'strong_sell') {
      return { color: '#FF3D00', fontWeight: 'bold' };
    } else {
      return { color: '#FFC107' };
    }
  };

  const getConfidenceBackground = (confidence) => {
    if (!confidence) return '#444';
    if (confidence >= 0.8) return '#388E3C';
    if (confidence >= 0.6) return '#689F38';
    if (confidence >= 0.4) return '#FFA000';
    return '#F57C00';
  };

  const formatConfidence = (confidence) => {
    if (!confidence) return 'N/A';
    return `${(confidence * 100).toFixed(1)}%`;
  };

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

  // Fetch latest analysis when stock or ticker changes
  useEffect(() => {
    if (selectedStock || selectedTicker) {
      fetchLatestAnalysis();
    }
  }, [selectedStock, selectedTicker]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <span>Research iPlatform</span>
        <div className="header-controls">
          <button className="user-icon-btn" onClick={() => onMenuChange('dashboard')}>
          
          </button>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
      </div>
      
      <div className="dashboard-content">
        {/* Sidebar Menu */}
        <div className="dashboard-sidebar">
          <div className="sidebar-header">
            <div>Research department</div>
            <div className="date-info">Current date: {currentDate}</div>
          </div>        
          <div className="sidebar-item active">
           SVM Data Analysis
          </div>
          
          <div className="sidebar-item" onClick={() => onMenuChange('import')}>
            Research Data Import
          </div>
        </div>
        
        {/* Main Content */}
        <div className="dashboard-main">
          <div className="report-container">
            <div className="report-header">
              <h2 className="report-title">Data SVM Analysis</h2>
              
              <div className="report-dates">
                <div>Analysis date: <strong>{latestAnalysis ? latestAnalysis.date : currentDate}</strong></div>
              </div>
            </div>
            
            {/* Analysis Controls */}
            <div className="beta-calculation-container">
              <div className="calculation-section">
                <h3 className="section-title">Phân tích dự đoán dữ liệu với SVM</h3>
                
                <div className="calculation-options">
                  <div className="option-group">
                    <select 
                      value={selectedStock} 
                      onChange={(e) => setSelectStock(e.target.value)}
                      className="stock-select"
                    >
                      <option value="">-- Chọn market code * --</option>
                      {stocks.map(stock => (
                        <option key={stock} value={stock}>{stock}</option>
                      ))}
                    </select>
                    
                    <select 
                      value={selectedTicker} 
                      onChange={(e) => setSelectedTicker(e.target.value)}
                      className="ticker-select"
                      disabled={!selectedStock}
                    >
                      <option value="">-- Chọn ticker * --</option>
                      {filteredTickers.map(ticker => (
                        <option key={ticker} value={ticker}>{ticker}</option>
                      ))}
                    </select>
                  </div> 
                  <button 
                    className="calculate-btn" 
                    onClick={runSVMAnalysis}
                    disabled={loading || !selectedStock || !selectedTicker}
                  >
                    {loading ? 'Đang phân tích...' : 'Bắt đầu phân tích dữ liệu'}
                  </button>
                </div>
                
                {error && (
                  <div className="error-message">
                    <p>{error}</p>
                  </div>
                )}
                
                {loading && (
                  <div className="loading-indicator">
                    <p>Đang thực hiện phân tích SVM dữ liệu...</p>
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
                    
                    <div className="view-options">
                      <div style={{display: 'inline-block'}}>
                        <button
                          onClick={() => window.print()}
                          style={{
                            padding: '8px 15px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          Xuất báo cáo
                        </button>
                      </div>
                    </div>
                    
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
                      <h4>Mô hình SVM cho phân tích dữ liệu nghiên cứu</h4>
                      <p>Support Vector Machine (SVM) được ứng dụng để phân tích dữ liệu nghiên cứu, giúp dự đoán xu hướng giá cổ phiếu dựa trên dữ liệu và các chỉ báo kỹ thuật cùng đặc điểm riêng của từng mã chứng khoán.</p>
                      
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
                    <p>Chưa có dữ liệu phân tích. Vui lòng chọn Market Code và Ticker sau đó chạy phân tích SVM để bắt đầu.</p>
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

export default SVMDataAnalysis; 