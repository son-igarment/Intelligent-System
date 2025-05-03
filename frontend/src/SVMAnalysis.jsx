import React, { useState, useEffect } from 'react';
import './App.css';

const ChartComponent = ({ predictions, formatConfidence }) => {
  if (!predictions || predictions.length === 0) return null;
  
  // Chart styles
  const styles = {
    chartContainer: {
      width: '100%',
      marginTop: '20px',
      marginBottom: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      backgroundColor: '#f8f9fa'
    },
    chartTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '15px',
      textAlign: 'center',
      color: '#000'
    },
    chartRow: {
      display: 'flex',
      gap: '20px',
      marginTop: '30px'
    },
    pieContainer: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    },
    pieChart: {
      width: '200px',
      height: '200px',
      borderRadius: '50%',
      background: 'conic-gradient(#00C853 0% var(--buy-pct), #FFC107 var(--buy-pct) var(--hold-pct), #FF3D00 var(--hold-pct) 100%)',
      position: 'relative'
    },
    pieCenter: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      color: '#000'
    },
    legend: {
      marginTop: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#000'
    },
    legendColor: {
      width: '16px',
      height: '16px',
      borderRadius: '3px'
    },
    chartLabel: {
      color: '#000',
      fontSize: '12px',
      fontWeight: 'bold'
    }
  };

  // Get color for prediction
  const getPredictionColor = (signal) => {
    if (signal === 'strong_buy') return '#00C853';
    if (signal === 'strong_sell') return '#FF3D00';
    return '#FFC107';
  };

  // Get label for prediction
  const getPredictionLabel = (signal) => {
    if (signal === 'strong_buy') return 'MUA';
    if (signal === 'strong_sell') return 'BÁN';
    return 'THEO DÕI';
  };

  // Calculate percentages for pie chart
  const calculateDistribution = () => {
    let buyCount = 0;
    let sellCount = 0;
    let holdCount = 0;

    predictions.forEach(prediction => {
      if (prediction.signal === 'strong_buy') buyCount++;
      else if (prediction.signal === 'strong_sell') sellCount++;
      else holdCount++;
    });

    const total = predictions.length;
    const buyPercent = (buyCount / total) * 100;
    const sellPercent = (sellCount / total) * 100;
    const holdPercent = (holdCount / total) * 100;

    return {
      buy: { count: buyCount, percent: buyPercent },
      sell: { count: sellCount, percent: sellPercent },
      hold: { count: holdCount, percent: holdPercent },
      total
    };
  };

  // Generate prediction trend data for weekly chart
  const generatePredictionTrend = () => {
    // Use real data or create simulated data based on distribution
    // This simulates trend over weeks (current through 4 weeks)
    const distribution = calculateDistribution();
    
    // Start with current distribution
    const buyStart = distribution.buy.percent / 100;
    const holdStart = distribution.hold.percent / 100;
    const sellStart = distribution.sell.percent / 100;
    
    // Generate 5 points (current + 4 weeks) with slight variations
    // but maintaining the trend direction
    const weeks = 5;
    const buyTrend = [];
    const holdTrend = [];
    const sellTrend = [];
    
    const getTrend = (start, isPositive) => {
      const result = [];
      let current = start;
      result.push(current);
      
      for (let i = 1; i < weeks; i++) {
        const change = (Math.random() * 0.05) * (isPositive ? 1 : -1);
        current = Math.max(0, Math.min(1, current + change));
        result.push(current);
      }
      
      return result;
    };
    
    
    const buyPoints = getTrend(buyStart, true);
    const sellPoints = getTrend(sellStart, false);
    
    
    const holdPoints = buyPoints.map((buy, i) => {
      const sell = sellPoints[i];
      return Math.max(0, Math.min(1, 1 - buy - sell));
    });
    
    return {
      buy: buyPoints,
      hold: holdPoints,
      sell: sellPoints,
      weeks: ['Hiện tại', 'Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4']
    };
  };

  
  const generatePriceTrend = () => {
   
    const basePrice = 100;
    
    
    const days = 5;
    const prices = [basePrice];
    
   
    const distribution = calculateDistribution();
    const trendDirection = distribution.buy.percent > distribution.sell.percent ? 1 : -1;
    
    for (let i = 1; i < days; i++) {
      
      const prevPrice = prices[i-1];
      
     
      const changePct = (Math.random() * 0.03 + 0.01) * trendDirection;
      const newPrice = prevPrice * (1 + changePct);
      
      
      const noise = (Math.random() - 0.5) * 2;
      prices.push(Math.round(newPrice + noise));
    }
    
    return prices;
  };

  const distribution = calculateDistribution();
  const buyPercentage = distribution.buy.percent;
  const holdPercentage = distribution.buy.percent + distribution.hold.percent;
  
 
  const weeklyTrend = generatePredictionTrend();
  const priceTrendData = predictions[0]?.price_trend || generatePriceTrend();
  
  const getTrendPoints = (trendData) => {
    return trendData.map((value, index) => {
      const x = (index / (trendData.length - 1)) * 400;
      const y = 180 - (value * 180);
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div style={styles.chartContainer}>
      <h4 style={styles.chartTitle}>Biểu đồ dự đoán SVM</h4>

      <div style={styles.chartRow}>
        <div style={styles.pieContainer}>
          <h5 style={styles.chartLabel}>Phân bố dự đoán</h5>
          <div 
            style={{
              ...styles.pieChart,
              ['--buy-pct']: `${buyPercentage}%`, 
              ['--hold-pct']: `${holdPercentage}%`
            }}
          >
            <div style={styles.pieCenter}>{predictions.length} mã</div>
          </div>
          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <div style={{...styles.legendColor, backgroundColor: '#00C853'}}></div>
              <span>MUA: {distribution.buy.count} ({distribution.buy.percent.toFixed(1)}%)</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{...styles.legendColor, backgroundColor: '#FFC107'}}></div>
              <span>THEO DÕI: {distribution.hold.count} ({distribution.hold.percent.toFixed(1)}%)</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{...styles.legendColor, backgroundColor: '#FF3D00'}}></div>
              <span>BÁN: {distribution.sell.count} ({distribution.sell.percent.toFixed(1)}%)</span>
            </div>
          </div>
        </div>

        <div style={styles.pieContainer}>
          <h5 style={styles.chartLabel}>Tin hiệu thị trường</h5>
          <div style={{
            fontSize: '72px',
            fontWeight: 'bold',
            color: distribution.buy.count > distribution.sell.count ? '#00C853' : 
                  distribution.sell.count > distribution.buy.count ? '#FF3D00' : '#FFC107',
            textAlign: 'center',
            marginTop: '20px'
          }}>
            {distribution.buy.count > distribution.sell.count ? '↑' : 
             distribution.sell.count > distribution.buy.count ? '↓' : '→'}
          </div>
          <div style={{textAlign: 'center', marginTop: '10px', fontWeight: 'bold', color: '#000'}}>
            {distribution.buy.count > distribution.sell.count ? 'TĂNG' : 
             distribution.sell.count > distribution.buy.count ? 'GIẢM' : 'ĐANG SIDEWAY'}
          </div>
        </div>
      </div>

      {/* Weekly Prediction Chart */}
      <div style={{marginTop: '30px', border: '1px solid #ddd', borderRadius: '8px', padding: '15px'}}>
        <h5 style={{textAlign: 'center', marginBottom: '15px', color: '#000'}}>Xác suất dự đoán theo tuần</h5>
        <div style={{
          height: '200px',
          position: 'relative',
          padding: '10px 0'
        }}>
          {/* Horizontal grid lines */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 20,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            pointerEvents: 'none'
          }}>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} style={{
                borderBottom: i < 4 ? '1px dashed #ddd' : 'none',
                height: '20%',
                position: 'relative'
              }}>
                {i < 4 && (
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    fontSize: '11px',
                    color: '#000'
                  }}>
                    {100 - i * 25}%
                  </span>
                )}
              </div>
            ))}
          </div>
          
          {/* Line chart */}
          <svg width="100%" height="100%" style={{paddingLeft: '30px'}}>
            {/* Buy line */}
            <polyline 
              points={getTrendPoints(weeklyTrend.buy)} 
              style={{
                fill: 'none',
                stroke: '#00C853',
                strokeWidth: 3
              }}
            />
            
            {/* Hold line */}
            <polyline 
              points={getTrendPoints(weeklyTrend.hold)}
              style={{
                fill: 'none',
                stroke: '#FFC107',
                strokeWidth: 3
              }}
            />
            
            {/* Sell line */}
            <polyline 
              points={getTrendPoints(weeklyTrend.sell)}
              style={{
                fill: 'none',
                stroke: '#FF3D00',
                strokeWidth: 3
              }}
            />
            
            {/* Data points */}
            {weeklyTrend.buy.map((value, i) => {
              const x = (i / (weeklyTrend.buy.length - 1)) * 400;
              return (
                <React.Fragment key={i}>
                  <circle cx={x} cy={180 - (weeklyTrend.buy[i] * 180)} r="5" fill="#00C853" />
                  <circle cx={x} cy={180 - (weeklyTrend.hold[i] * 180)} r="5" fill="#FFC107" />
                  <circle cx={x} cy={180 - (weeklyTrend.sell[i] * 180)} r="5" fill="#FF3D00" />
                </React.Fragment>
              );
            })}
          </svg>
          
          {/* X-axis labels */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 30px',
            marginTop: '5px'
          }}>
            {weeklyTrend.weeks.map((label, i) => (
              <div key={i} style={{fontSize: '11px', color: '#000'}}>{label}</div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginTop: '15px'
        }}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <div style={{width: '15px', height: '15px', backgroundColor: '#00C853', marginRight: '5px', borderRadius: '50%'}}></div>
            <span style={{color: '#000'}}>Mua</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <div style={{width: '15px', height: '15px', backgroundColor: '#FFC107', marginRight: '5px', borderRadius: '50%'}}></div>
            <span style={{color: '#000'}}>Giữ</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <div style={{width: '15px', height: '15px', backgroundColor: '#FF3D00', marginRight: '5px', borderRadius: '50%'}}></div>
            <span style={{color: '#000'}}>Bán</span>
          </div>
        </div>
      </div>

      {/* Price Trend Chart - Use actual data if available */}
      <div style={{marginTop: '30px', border: '1px solid #ddd', borderRadius: '8px', padding: '15px'}}>
        <h5 style={{textAlign: 'center', marginBottom: '15px', color: '#000'}}>Dự báo xu hướng giá</h5>
        <div style={{
          height: '200px',
          position: 'relative',
          padding: '10px 0'
        }}>
          {/* Horizontal grid lines */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 20,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            pointerEvents: 'none'
          }}>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} style={{
                borderBottom: i < 4 ? '1px dashed #ddd' : 'none',
                height: '20%',
                position: 'relative'
              }}>
                {i < 4 && (
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    fontSize: '11px',
                    color: '#000'
                  }}>
                    {Math.round(Math.max(...priceTrendData) - (i * (Math.max(...priceTrendData) - Math.min(...priceTrendData)) / 4))}
                  </span>
                )}
              </div>
            ))}
          </div>
          
          {/* Line chart */}
          <svg width="100%" height="100%" style={{paddingLeft: '30px'}}>
            {/* Create points for the polyline */}
            {(() => {
              const maxPrice = Math.max(...priceTrendData);
              const minPrice = Math.min(...priceTrendData);
              const range = maxPrice - minPrice;
              const points = priceTrendData.map((price, idx) => {
                const x = (idx / (priceTrendData.length - 1)) * 400;
                const y = 180 - ((price - minPrice) / range) * 160;
                return `${x},${y}`;
              }).join(' ');
              
              return (
                <polyline 
                  points={points}
                  style={{
                    fill: 'none',
                    stroke: '#4a6da7',
                    strokeWidth: 3
                  }}
                />
              );
            })()}
            
            {/* Data points */}
            {priceTrendData.map((price, idx) => {
              const maxPrice = Math.max(...priceTrendData);
              const minPrice = Math.min(...priceTrendData);
              const range = maxPrice - minPrice;
              const x = (idx / (priceTrendData.length - 1)) * 400;
              const y = 180 - ((price - minPrice) / range) * 160;
              
              return (
                <g key={idx}>
                  <circle cx={x} cy={y} r="5" fill="#4a6da7" />
                  <text x={x} y={y-10} fontSize="11" textAnchor="middle" fill="#000">{price.toLocaleString()}</text>
                </g>
              );
            })}
          </svg>
          
          {/* X-axis labels */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 30px',
            marginTop: '5px'
          }}>
            {priceTrendData.map((_, idx) => (
              <div key={idx} style={{fontSize: '11px', color: '#000'}}>
                {idx === 0 ? 'Hiện tại' : `Ngày ${idx}`}
              </div>
            ))}
          </div>
        </div>
        
        <div style={{
          marginTop: '15px',
          textAlign: 'center',
          fontSize: '13px',
          fontStyle: 'italic',
          color: '#000'
        }}>
          Dự báo xu hướng giá trong {priceTrendData.length - 1} ngày tới dựa trên mô hình SVM
        </div>
      </div>
    </div>
  );
};

function SVMAnalysis({ onClose, onMenuChange }) {
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
  const [showChart, setShowChart] = useState(true);

  useEffect(() => {
    fetchStocksAndTickers();
    fetchLatestAnalysis();
  }, []);

  function setSelectStock(value) {
    setSelectedStock(value)
    try {
      setLoading(true);
      setError('');
      // Filter the data by selected market code
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

      setSelectedTicker(''); 
    } catch (err) {
      setError(`Lỗi khi tải dữ liệu: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Fetch available stocks and tickers
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

 
  const fetchLatestAnalysis = async () => {
    try {
      setLoading(true);
      
     
      let queryParams = new URLSearchParams();
      if (selectedStock) {
        queryParams.append('market_code', selectedStock);
      }
      if (selectedTicker) {
        queryParams.append('ticker', selectedTicker);
      }
      
      // Add query parameters to URL if present
      const url = queryParams.toString() 
        ? `http://localhost:5001/api/latest-svm-analysis?${queryParams.toString()}`
        : 'http://localhost:5001/api/latest-svm-analysis';
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setLatestAnalysis(data);
        // Set chart view to true when analysis data is loaded
        if (data && data.predictions && data.predictions.length > 0) {
          setShowChart(true);
        }
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
    if (!selectedStock || !selectedTicker) {
      setError('Vui lòng chọn cả Market Code và Ticker để thực hiện phân tích');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setShowChart(true); // Set chart view to true before making the request
      
      const requestBody = {
        days_to_predict: parseInt(daysToPrediction),
        use_beta: useBeta,
        market_code: selectedStock,
        ticker: selectedTicker
      };
      
      const response = await fetch('http://localhost:5001/api/svm-analysis', {
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

  // Fetch latest analysis when stock or ticker changes
  useEffect(() => {
    if (selectedStock || selectedTicker) {
      fetchLatestAnalysis();
    }
  }, [selectedStock, selectedTicker]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <span>Fund management iPlatform</span>
        <div className="header-controls">
          <button className="user-icon-btn" onClick={() => onMenuChange('dashboard')}>
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
          
          <div className="sidebar-item" onClick={() => onMenuChange('dashboard')}>
            Dashboard
          </div>
          
          <div className="sidebar-item" onClick={() => onMenuChange('assets')}>
            Assets report
          </div>
                    
          <div className="sidebar-item" onClick={() => onMenuChange('beta')}>
            Beta Calculation
          </div>
          
          <div className="sidebar-item active">
            SVM Analysis
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
                    
                    <div className="view-options">
                      <button 
                        className={`view-toggle-btn ${showChart ? 'active' : ''}`} 
                        onClick={() => setShowChart(!showChart)}
                        style={{
                          padding: '8px 15px',
                          margin: '10px 0',
                          background: showChart ? '#4a6da7' : '#f0f0f0',
                          color: showChart ? 'white' : '#333',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        {showChart ? 'Hiển thị dạng bảng' : 'Hiển thị dạng biểu đồ'}
                      </button>
                      
                      {showChart && (
                        <div style={{display: 'inline-block', marginLeft: '10px'}}>
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
                      )}
                    </div>
                    
                    {showChart ? (
                      <ChartComponent 
                        predictions={latestAnalysis.predictions} 
                        formatConfidence={formatConfidence}
                      />
                    ) : (
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
                    )}
                    
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

export default SVMAnalysis;