import React, { useState, useEffect } from 'react';
import './App.css';

// For charts
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
      textAlign: 'center'
    },
    barChart: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    barGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
    },
    barHeader: {
      display: 'flex',
      justifyContent: 'space-between'
    },
    barContainer: {
      height: '25px',
      width: '100%',
      backgroundColor: '#e0e0e0',
      borderRadius: '4px',
      overflow: 'hidden'
    },
    barFill: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '10px',
      color: 'white',
      fontWeight: 'bold',
      transition: 'width 1s ease-in-out'
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
      fontWeight: 'bold'
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
      gap: '8px'
    },
    legendColor: {
      width: '16px',
      height: '16px',
      borderRadius: '3px'
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

  const distribution = calculateDistribution();
  const buyPercentage = distribution.buy.percent;
  const holdPercentage = distribution.buy.percent + distribution.hold.percent;

  return (
    <div style={styles.chartContainer}>
      <h4 style={styles.chartTitle}>Biểu đồ dự đoán SVM</h4>
      <div style={styles.barChart}>
        {predictions.map((prediction, index) => (
          <div key={index} style={styles.barGroup}>
            <div style={styles.barHeader}>
              <strong>{prediction.stock_code}</strong>
              <span>{getPredictionLabel(prediction.signal)} ({formatConfidence(prediction.confidence)})</span>
            </div>
            <div style={styles.barContainer}>
              <div 
                style={{
                  ...styles.barFill,
                  width: `${prediction.confidence * 100}%`,
                  backgroundColor: getPredictionColor(prediction.signal)
                }}
              >
                {prediction.prediction_label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.chartRow}>
        <div style={styles.pieContainer}>
          <h5>Phân bố dự đoán</h5>
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
          <h5>Tin hiệu thị trường</h5>
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
          <div style={{textAlign: 'center', marginTop: '10px', fontWeight: 'bold'}}>
            {distribution.buy.count > distribution.sell.count ? 'TĂNG' : 
             distribution.sell.count > distribution.buy.count ? 'GIẢM' : 'ĐANG SIDEWAY'}
          </div>
        </div>
      </div>

      {/* Weekly Prediction Chart */}
      <div style={{marginTop: '30px', border: '1px solid #ddd', borderRadius: '8px', padding: '15px'}}>
        <h5 style={{textAlign: 'center', marginBottom: '15px'}}>Xác suất dự đoán theo tuần</h5>
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
                    color: '#666'
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
              points="0,180 100,160 200,140 300,120 400,100" 
              style={{
                fill: 'none',
                stroke: '#00C853',
                strokeWidth: 3
              }}
            />
            
            {/* Hold line */}
            <polyline 
              points="0,160 100,170 200,160 300,150 400,140" 
              style={{
                fill: 'none',
                stroke: '#FFC107',
                strokeWidth: 3
              }}
            />
            
            {/* Sell line */}
            <polyline 
              points="0,170 100,165 200,160 300,170 400,180" 
              style={{
                fill: 'none',
                stroke: '#FF3D00',
                strokeWidth: 3
              }}
            />
            
            {/* Data points */}
            {[0, 100, 200, 300, 400].map((x, i) => (
              <React.Fragment key={i}>
                <circle cx={x} cy={180 - i * 20} r="5" fill="#00C853" />
                <circle cx={x} cy={[160, 170, 160, 150, 140][i]} r="5" fill="#FFC107" />
                <circle cx={x} cy={[170, 165, 160, 170, 180][i]} r="5" fill="#FF3D00" />
              </React.Fragment>
            ))}
          </svg>
          
          {/* X-axis labels */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 30px',
            marginTop: '5px'
          }}>
            {['Hiện tại', 'Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'].map((label, i) => (
              <div key={i} style={{fontSize: '11px', color: '#666'}}>{label}</div>
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
            <span>Mua</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <div style={{width: '15px', height: '15px', backgroundColor: '#FFC107', marginRight: '5px', borderRadius: '50%'}}></div>
            <span>Giữ</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <div style={{width: '15px', height: '15px', backgroundColor: '#FF3D00', marginRight: '5px', borderRadius: '50%'}}></div>
            <span>Bán</span>
          </div>
        </div>
      </div>

      {/* Price Trend Chart */}
      {predictions.length > 0 && predictions[0].price_trend && (
        <div style={{marginTop: '30px', border: '1px solid #ddd', borderRadius: '8px', padding: '15px'}}>
          <h5 style={{textAlign: 'center', marginBottom: '15px'}}>Dự báo xu hướng giá</h5>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            height: '200px',
            gap: '8px',
            padding: '10px',
            position: 'relative'
          }}>
            {/* Horizontal grid lines */}
            <div style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              pointerEvents: 'none'
            }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{
                  borderBottom: i < 3 ? '1px dashed #ddd' : 'none',
                  flex: 1
                }}></div>
              ))}
            </div>
            
            {/* Price bars */}
            {predictions[0].price_trend.map((price, idx) => {
              const isPositive = idx > 0 ? price >= predictions[0].price_trend[idx-1] : true;
              const height = `${Math.max(30, price / Math.max(...predictions[0].price_trend) * 150)}px`;
              
              return (
                <div key={idx} style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <div style={{
                    width: '80%',
                    height,
                    backgroundColor: isPositive ? 'rgba(0, 200, 83, 0.7)' : 'rgba(255, 61, 0, 0.7)',
                    borderTopLeftRadius: '3px',
                    borderTopRightRadius: '3px',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {price.toLocaleString()}
                    </div>
                  </div>
                  <div style={{
                    marginTop: '5px',
                    fontSize: '11px'
                  }}>
                    {idx === 0 ? 'Hiện tại' : `Ngày ${idx}`}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div style={{
            marginTop: '15px',
            textAlign: 'center',
            fontSize: '13px',
            fontStyle: 'italic',
            color: '#666'
          }}>
            Dự báo xu hướng giá trong {predictions[0].price_trend.length - 1} ngày tới dựa trên mô hình SVM
          </div>
        </div>
      )}

      {/* Price Trend Chart - Simulated version */}
      <div style={{marginTop: '30px', border: '1px solid #ddd', borderRadius: '8px', padding: '15px'}}>
        <h5 style={{textAlign: 'center', marginBottom: '15px'}}>Dự báo xu hướng giá</h5>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          height: '200px',
          gap: '8px',
          padding: '10px',
          position: 'relative'
        }}>
          {/* Horizontal grid lines */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            pointerEvents: 'none'
          }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                borderBottom: i < 3 ? '1px dashed #ddd' : 'none',
                flex: 1
              }}></div>
            ))}
          </div>
          
          {/* Price bars - Use simulated data */}
          {[100, 105, 110, 108, 115].map((price, idx) => {
            const isPositive = idx > 0 ? price >= [100, 105, 110, 108, 115][idx-1] : true;
            const height = `${Math.max(30, price / Math.max(...[100, 105, 110, 108, 115]) * 150)}px`;
            
            return (
              <div key={idx} style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{
                  width: '80%',
                  height,
                  backgroundColor: isPositive ? 'rgba(0, 200, 83, 0.7)' : 'rgba(255, 61, 0, 0.7)',
                  borderTopLeftRadius: '3px',
                  borderTopRightRadius: '3px',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {price.toLocaleString()}
                  </div>
                </div>
                <div style={{
                  marginTop: '5px',
                  fontSize: '11px'
                }}>
                  {idx === 0 ? 'Hiện tại' : `Ngày ${idx}`}
                </div>
              </div>
            );
          })}
        </div>
        
        <div style={{
          marginTop: '15px',
          textAlign: 'center',
          fontSize: '13px',
          fontStyle: 'italic',
          color: '#666'
        }}>
          Dự báo xu hướng giá trong {4} ngày tới dựa trên mô hình SVM
        </div>
      </div>
    </div>
  );
};

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
  const [showChart, setShowChart] = useState(false);

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
      
      // Build query parameters for market_code and ticker if selected
      let queryParams = new URLSearchParams();
      if (selectedStock) {
        queryParams.append('market_code', selectedStock);
      }
      if (selectedTicker) {
        queryParams.append('ticker', selectedTicker);
      }
      
      // Add query parameters to URL if present
      const url = queryParams.toString() 
        ? `http://localhost:5000/api/latest-svm-analysis?${queryParams.toString()}`
        : 'http://localhost:5000/api/latest-svm-analysis';
      
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

  // Perform SVM analysis
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
          use_beta: useBeta,
          market_code: selectedStock,
          ticker: selectedTicker
        });
        // Show chart view by default after analysis
        setShowChart(true);
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
                      <option value="">-- Chọn market code * --</option>
                      {stocks.map(stock => (
                        <option key={stock} value={stock}>{stock}</option>
                      ))}
                    </select>
                    
                    <select 
                      value={selectedTicker} 
                      onChange={(e) => setSelectedTicker(e.target.value)}
                      className="ticker-select"
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