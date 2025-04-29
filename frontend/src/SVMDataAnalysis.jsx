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
  const [selectedTickers, setSelectedTickers] = useState([]);
  const [confusionMatrix, setConfusionMatrix] = useState(null);
  const [confidenceDistribution, setConfidenceDistribution] = useState(null);

  // Fetch stocks and tickers on component load
  useEffect(() => {
    fetchStocksAndTickers();
  }, []);

  function setSelectStock(value) {
    setSelectedStock(value)
    try {
      setLoading(true);
      setError('');
      // Use new API endpoint with data-analysis prefix
      fetch('http://localhost:5001/api/ticker?market_code=' + value)
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

      setSelectedTickers([]); // Reset ticker selections when MarketCode changes
    } catch (err) {
      setError(`Lỗi khi tải dữ liệu: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Handle multiple ticker selection
  const handleTickerSelection = (ticker) => {
    setSelectedTickers(prevSelected => {
      if (prevSelected.includes(ticker)) {
        return prevSelected.filter(t => t !== ticker);
      } else {
        return [...prevSelected, ticker];
      }
    });
  };

  // Fetch available stocks and tickers - Updated with new API endpoint
  const fetchStocksAndTickers = async () => {
    try {
      setLoading(true);
      setError('');
      fetch('http://localhost:5001/api/market-code')
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

  // Perform SVM analysis - Updated with new API endpoint
  const runSVMAnalysis = async () => {
    if (!selectedStock || selectedTickers.length === 0) {
      setError('Vui lòng chọn cả Market Code và ít nhất một Ticker để thực hiện phân tích');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const requestBody = {
        days_to_predict: parseInt(daysToPrediction),
        use_beta: useBeta,
        market_code: selectedStock,
        ticker: selectedTickers
      };
      
      // Updated API endpoint
      const response = await fetch('http://localhost:5001/api/data-analysis', {
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
          accuracy: data.data.model_metrics.accuracy,
          predictions: data.data.predictions,
          use_beta: data.data.beta_used,
          market_code: selectedStock,
          ticker: selectedTickers
        });
        
      
        if (data.confusion_matrix) {
          setConfusionMatrix(data.confusion_matrix);
        }
        if (data.confidence_distribution) {
          setConfidenceDistribution(data.confidence_distribution);
        }
        
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
            
            {/* Split Layout: Left for Inputs, Right for Results */}
            <div className="split-layout-container">
              {/* Left Panel: Inputs */}
              <div className="left-panel">
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
                      
                      <div className="ticker-selection">
                        <div className="ticker-header">
                          <span>Chọn ticker:</span>
                          {filteredTickers.length > 0 && (
                            <span className="ticker-counter">
                              Đã chọn: {selectedTickers.length}/{filteredTickers.length}
                            </span>
                          )}
                        </div>
                        <div className="ticker-checkbox-list">
                          {filteredTickers.length > 0 ? (
                            filteredTickers.map(ticker => (
                              <label key={ticker} className="ticker-checkbox">
                                <input
                                  type="checkbox"
                                  checked={selectedTickers.includes(ticker)}
                                  onChange={() => handleTickerSelection(ticker)}
                                />
                                <span>{ticker}</span>
                              </label>
                            ))
                          ) : (
                            <div className="no-tickers">Vui lòng chọn Market Code trước</div>
                          )}
                        </div>
                      </div>
                    </div> 
                    <button 
                      className="calculate-btn" 
                      onClick={runSVMAnalysis}
                      disabled={loading || !selectedStock || selectedTickers.length === 0}
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
                </div>
              </div>
              
              {/* Bên phải biểu thị kết quả*/}
              <div className="right-panel">
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
                    
                    {/* Biểu thị cho các ModelModel */}
                    <div className="model-visualization">
                      <h4 className="visualization-title">Phân tích mô hình SVM</h4>
                      
                      <div className="visualization-grid">
                        {confusionMatrix && (
                          <div className="visualization-card">
                            <h5>Ma trận nhầm lẫn (Confusion Matrix)</h5>
                            <div className="image-container">
                              <img 
                                src={`data:image/png;base64,${confusionMatrix}`} 
                                alt="Confusion Matrix" 
                                className="visualization-image"
                              />
                            </div>
                          </div>
                        )}
                        
                        {confidenceDistribution && (
                          <div className="visualization-card">
                            <h5>Phân phối độ tin cậy (Confidence Distribution)</h5>
                            <div className="image-container">
                              <img 
                                src={`data:image/png;base64,${confidenceDistribution}`} 
                                alt="Confidence Distribution" 
                                className="visualization-image"
                              />
                            </div>
                          </div>
                        )}
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
      
      <style jsx="true">{`
        .split-layout-container {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 20px;
          margin-top: 20px;
        }
        
        .left-panel {
          background-color: #2a2a2a;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .right-panel {
          background-color: #2a2a2a;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          overflow-y: auto;
          max-height: 75vh;
        }
        
        /* Ticker selection styling */
        .ticker-selection {
          margin-top: 15px;
          background-color: #333;
          border-radius: 6px;
          padding: 12px;
        }
        
        .ticker-header {
          display: flex;
          justify-content: space-between;
          color: #e0e0e0;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid #444;
          font-weight: bold;
          cursor: pointer;
          position: relative;
        }
        
        .ticker-header:hover {
          background-color: #3a3a3a;
          border-radius: 4px;
          padding-left: 5px;
        }
        
        .ticker-counter {
          color: #90caf9;
          font-size: 0.9em;
        }
        
        .ticker-expand-icon {
          color: #90caf9;
          margin-left: 10px;
          font-size: 12px;
        }
        
        .ticker-checkbox-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 8px;
          max-height: 350px;
          overflow-y: auto;
          padding-right: 5px;
        }
        
        .ticker-checkbox {
          display: flex;
          align-items: center;
          padding: 5px;
          background-color: #2a2a2a;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .ticker-checkbox:hover {
          background-color: #3a3a3a;
        }
        
        .ticker-checkbox input {
          margin-right: 8px;
        }
        
        .no-tickers {
          color: #888;
          font-style: italic;
          padding: 10px 0;
        }
        
        @media (max-width: 1200px) {
          .split-layout-container {
            grid-template-columns: 1fr;
          }
          
          .left-panel, .right-panel {
            margin-bottom: 20px;
          }
          
          .ticker-checkbox-list {
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          }
        }
        
        .model-visualization {
          margin: 20px 0;
          background-color: #2a2a2a;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .visualization-title {
          color: #e0e0e0;
          margin-bottom: 15px;
          font-size: 18px;
          border-bottom: 1px solid #444;
          padding-bottom: 10px;
        }
        
        .visualization-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
        }
        
        .visualization-card {
          background-color: #333;
          border-radius: 6px;
          padding: 15px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        }
        
        .visualization-card h5 {
          color: #bbb;
          margin-top: 0;
          margin-bottom: 12px;
          font-size: 16px;
          font-weight: normal;
        }
        
        .image-container {
          display: flex;
          justify-content: center;
          background-color: #fff;
          border-radius: 4px;
          padding: 10px;
          margin-top: 10px;
        }
        
        .visualization-image {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }
        
        @media print {
          .model-visualization {
            page-break-inside: avoid;
            background-color: white !important;
            box-shadow: none;
          }
          
          .visualization-card {
            background-color: white !important;
            box-shadow: none;
            border: 1px solid #ddd;
          }
          
          .visualization-title, .visualization-card h5 {
            color: black !important;
          }
        }
      `}</style> 
    </div>
  );
}

export default SVMDataAnalysis; 