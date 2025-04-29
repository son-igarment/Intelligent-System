import React, { useState, useEffect } from 'react';
import './App.css';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Confusion Matrix Component
const ConfusionMatrix = ({ confusionMatrix }) => {
  if (!confusionMatrix || confusionMatrix.length === 0) {
    return <div>Không có dữ liệu ma trận nhầm lẫn.</div>;
  }

  // Prepare data for pie chart
  const data = {
    labels: ['Giảm - Giảm', 'Giảm - Đi ngang', 'Giảm - Tăng', 
             'Đi ngang - Giảm', 'Đi ngang - Đi ngang', 'Đi ngang - Tăng',
             'Tăng - Giảm', 'Tăng - Đi ngang', 'Tăng - Tăng'],
    datasets: [
      {
        label: 'Số lượng dự đoán',
        data: [
          confusionMatrix[0][0], confusionMatrix[0][1], confusionMatrix[0][2],
          confusionMatrix[1][0], confusionMatrix[1][1], confusionMatrix[1][2],
          confusionMatrix[2][0], confusionMatrix[2][1], confusionMatrix[2][2]
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',   // Giảm - Giảm (correctly predicted decrease)
          'rgba(255, 159, 64, 0.8)',   // Giảm - Đi ngang
          'rgba(255, 205, 86, 0.8)',   // Giảm - Tăng
          'rgba(75, 192, 192, 0.8)',   // Đi ngang - Giảm
          'rgba(54, 162, 235, 0.8)',   // Đi ngang - Đi ngang (correctly predicted neutral)
          'rgba(153, 102, 255, 0.8)',  // Đi ngang - Tăng
          'rgba(201, 203, 207, 0.8)',  // Tăng - Giảm
          'rgba(100, 120, 140, 0.8)',  // Tăng - Đi ngang
          'rgba(46, 204, 113, 0.8)'    // Tăng - Tăng (correctly predicted increase)
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
          'rgb(201, 203, 207)',
          'rgb(100, 120, 140)',
          'rgb(46, 204, 113)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Ma trận nhầm lẫn',
        color: '#e8eaed',
        font: {
          size: 16
        }
      },
    },
  };

  return (
    <div style={{ 
      backgroundColor: '#2a2d31', 
      borderRadius: '8px', 
      padding: '15px',
      marginBottom: '20px'
    }}>
      <h4 style={{ marginBottom: '15px', color: '#e8eaed' }}>Ma trận nhầm lẫn</h4>
      <div style={{ height: '300px' }}>
        <Pie data={data} options={options} />
      </div>
      <div style={{ 
        marginTop: '20px', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '10px',
        color: '#e8eaed',
        textAlign: 'center'
      }}>
        <div style={{ backgroundColor: 'rgba(255, 99, 132, 0.2)', padding: '10px', borderRadius: '4px' }}>
          <strong>Giảm → Giảm:</strong> {confusionMatrix[0][0]}
        </div>
        <div style={{ backgroundColor: 'rgba(255, 159, 64, 0.2)', padding: '10px', borderRadius: '4px' }}>
          <strong>Giảm → Đi ngang:</strong> {confusionMatrix[0][1]}
        </div>
        <div style={{ backgroundColor: 'rgba(255, 205, 86, 0.2)', padding: '10px', borderRadius: '4px' }}>
          <strong>Giảm → Tăng:</strong> {confusionMatrix[0][2]}
        </div>
        <div style={{ backgroundColor: 'rgba(75, 192, 192, 0.2)', padding: '10px', borderRadius: '4px' }}>
          <strong>Đi ngang → Giảm:</strong> {confusionMatrix[1][0]}
        </div>
        <div style={{ backgroundColor: 'rgba(54, 162, 235, 0.2)', padding: '10px', borderRadius: '4px' }}>
          <strong>Đi ngang → Đi ngang:</strong> {confusionMatrix[1][1]}
        </div>
        <div style={{ backgroundColor: 'rgba(153, 102, 255, 0.2)', padding: '10px', borderRadius: '4px' }}>
          <strong>Đi ngang → Tăng:</strong> {confusionMatrix[1][2]}
        </div>
        <div style={{ backgroundColor: 'rgba(201, 203, 207, 0.2)', padding: '10px', borderRadius: '4px' }}>
          <strong>Tăng → Giảm:</strong> {confusionMatrix[2][0]}
        </div>
        <div style={{ backgroundColor: 'rgba(100, 120, 140, 0.2)', padding: '10px', borderRadius: '4px' }}>
          <strong>Tăng → Đi ngang:</strong> {confusionMatrix[2][1]}
        </div>
        <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.2)', padding: '10px', borderRadius: '4px' }}>
          <strong>Tăng → Tăng:</strong> {confusionMatrix[2][2]}
        </div>
      </div>
    </div>
  );
};

// Confidence Distribution Component
const ConfidenceDistribution = ({ predictions }) => {
  if (!predictions || predictions.length === 0) {
    return <div>Không có dữ liệu phân phối độ tin cậy.</div>;
  }

  // Group by prediction class
  const decreaseConfidences = predictions
    .filter(pred => pred.prediction === -1 || pred.prediction_label === 'Giảm')
    .map(pred => pred.confidence);
  
  const neutralConfidences = predictions
    .filter(pred => pred.prediction === 0 || pred.prediction_label === 'Đi ngang')
    .map(pred => pred.confidence);
  
  const increaseConfidences = predictions
    .filter(pred => pred.prediction === 1 || pred.prediction_label === 'Tăng')
    .map(pred => pred.confidence);

  // Count confidence in ranges
  const ranges = ['0-0.2', '0.2-0.4', '0.4-0.6', '0.6-0.8', '0.8-1.0'];
  
  const countInRange = (confidences, min, max) => {
    return confidences.filter(conf => conf >= min && conf < max).length;
  };
  
  const decreaseCounts = [
    countInRange(decreaseConfidences, 0, 0.2),
    countInRange(decreaseConfidences, 0.2, 0.4),
    countInRange(decreaseConfidences, 0.4, 0.6),
    countInRange(decreaseConfidences, 0.6, 0.8),
    countInRange(decreaseConfidences, 0.8, 1.01) // Include 1.0 exactly
  ];
  
  const neutralCounts = [
    countInRange(neutralConfidences, 0, 0.2),
    countInRange(neutralConfidences, 0.2, 0.4),
    countInRange(neutralConfidences, 0.4, 0.6),
    countInRange(neutralConfidences, 0.6, 0.8),
    countInRange(neutralConfidences, 0.8, 1.01)
  ];
  
  const increaseCounts = [
    countInRange(increaseConfidences, 0, 0.2),
    countInRange(increaseConfidences, 0.2, 0.4),
    countInRange(increaseConfidences, 0.4, 0.6),
    countInRange(increaseConfidences, 0.6, 0.8),
    countInRange(increaseConfidences, 0.8, 1.01)
  ];

  const data = {
    labels: ranges,
    datasets: [
      {
        label: 'Giảm',
        data: decreaseCounts,
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1
      },
      {
        label: 'Đi ngang',
        data: neutralCounts,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      },
      {
        label: 'Tăng',
        data: increaseCounts,
        backgroundColor: 'rgba(46, 204, 113, 0.7)',
        borderColor: 'rgb(46, 204, 113)',
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Phân phối độ tin cậy theo dự đoán',
        color: '#e8eaed',
        font: {
          size: 16
        }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Khoảng độ tin cậy',
          color: '#e8eaed'
        },
        ticks: {
          color: '#e8eaed'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Số lượng dự đoán',
          color: '#e8eaed'
        },
        ticks: {
          color: '#e8eaed'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#2a2d31', 
      borderRadius: '8px', 
      padding: '15px',
      marginBottom: '20px'
    }}>
      <h4 style={{ marginBottom: '15px', color: '#e8eaed' }}>Phân phối độ tin cậy</h4>
      <div style={{ height: '300px' }}>
        <Bar data={data} options={options} />
      </div>
      <div style={{ 
        marginTop: '10px', 
        fontSize: '14px', 
        color: '#e8eaed',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <div>
          <strong>Dự đoán giảm:</strong> {decreaseConfidences.length} trường hợp
        </div>
        <div>
          <strong>Dự đoán đi ngang:</strong> {neutralConfidences.length} trường hợp
        </div>
        <div>
          <strong>Dự đoán tăng:</strong> {increaseConfidences.length} trường hợp
        </div>
      </div>
    </div>
  );
};

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
  const [activeTab, setActiveTab] = useState('matrix'); 

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
          accuracy: data.model_metrics.accuracy,
          predictions: data.predictions,
          confusion_matrix: data.model_metrics.confusion_matrix,
          report: data.model_metrics.report,
          use_beta: useBeta,
          market_code: selectedStock,
          ticker: selectedTickers
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
              <div className="calculation-section" style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
                <div style={{ flex: 1, borderRight: '1px solid #333' }}>
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
                      
                      <div className="ticker-select-container" style={{
                        marginTop: '15px',
                        border: '1px solid #3c4043',
                        borderRadius: '4px',
                        backgroundColor: '#202124',
                        overflow: 'hidden',
                        maxHeight: '250px',
                        width: '100%'
                      }}>
                        <div style={{
                          padding: '10px',
                          borderBottom: '1px solid #3c4043',
                          backgroundColor: '#2a2d31',
                          color: '#e8eaed',
                          fontWeight: 'bold'
                        }}>
                          Chọn ticker ({selectedTickers.length} mã được chọn)
                        </div>
                        <div style={{
                          maxHeight: '200px', 
                          overflowY: 'auto',
                          padding: '5px 0'
                        }}>
                          {filteredTickers.map(ticker => (
                            <div key={ticker} style={{
                              padding: '8px 12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              backgroundColor: selectedTickers.includes(ticker) ? '#1a73e8' : 'transparent',
                              color: selectedTickers.includes(ticker) ? 'white' : '#e8eaed',
                              transition: 'background-color 0.2s'
                            }} 
                            onClick={() => handleTickerSelection(ticker)}
                            >
                              <input
                                type="checkbox"
                                checked={selectedTickers.includes(ticker)}
                                onChange={() => {}}
                                style={{
                                  marginRight: '10px', 
                                  cursor: 'pointer',
                                  width: '16px',
                                  height: '16px'
                                }}
                              />
                              <span>{ticker}</span>
                            </div>
                          ))}
                          {filteredTickers.length === 0 && (
                            <div style={{padding: '8px 12px', color: '#e8eaed'}}>
                              Chưa có dữ liệu ticker. Hãy chọn Market Code.
                            </div>
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
                
                <div style={{ flex: 1 }}>
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
                      
                      {/* Visualization Tab Navigation */}
                      <div style={{ 
                        marginTop: '20px', 
                        borderBottom: '1px solid #3c4043',
                        display: 'flex',
                        gap: '10px'
                      }}>
                        <button 
                          onClick={() => setActiveTab('matrix')}
                          style={{
                            padding: '10px 15px',
                            background: activeTab === 'matrix' ? '#1a73e8' : 'transparent',
                            color: activeTab === 'matrix' ? 'white' : '#e8eaed',
                            border: 'none',
                            borderRadius: '4px 4px 0 0',
                            cursor: 'pointer',
                            fontWeight: activeTab === 'matrix' ? 'bold' : 'normal'
                          }}
                        >
                          Ma trận nhầm lẫn
                        </button>
                        
                        <button 
                          onClick={() => setActiveTab('confidence')}
                          style={{
                            padding: '10px 15px',
                            background: activeTab === 'confidence' ? '#1a73e8' : 'transparent',
                            color: activeTab === 'confidence' ? 'white' : '#e8eaed',
                            border: 'none',
                            borderRadius: '4px 4px 0 0',
                            cursor: 'pointer',
                            fontWeight: activeTab === 'confidence' ? 'bold' : 'normal'
                          }}
                        >
                          Phân phối độ tin cậy
                        </button>
                      </div>
                      
                      {/* Tabbed Content */}
                      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                        {/* Confusion Matrix */}
                        {activeTab === 'matrix' && latestAnalysis.confusion_matrix && (
                          <ConfusionMatrix confusionMatrix={latestAnalysis.confusion_matrix} />
                        )}
                        
                        {/* Confidence Distribution */}
                        {activeTab === 'confidence' && latestAnalysis.predictions && (
                          <ConfidenceDistribution predictions={latestAnalysis.predictions} />
                        )}
                      </div>
                      
                      {/* Always show Results Table */}
                      <div className="beta-results-table" style={{ marginTop: '20px' }}>
                        <h4 style={{ marginBottom: '15px', color: '#e8eaed' }}>Bảng kết quả dự đoán</h4>
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
    </div>
  );
}

export default SVMDataAnalysis; 