import React, { useState, useEffect } from 'react';
import './App.css';



function BetaCalculation({ onClose, onMenuChange }) {
  const currentDate = "2025-04-29";
  const [stocks, setMarketCodes] = useState([]); // Initialize with fixed market codes
  const [tickers, setTickers] = useState([]);
  const [filteredTickers, setFilteredTickers] = useState([]);
  const [allData, setAllData] = useState([]);
  const [betaResults, setBetaResults] = useState([]);
  const [selectedMarketCode, setMarketCode] = useState('');
  const [selectedTicker, setSelectedTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calculationDate, setCalculationDate] = useState('');
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [portfolio, setPortfolio] = useState({});
  const [portfolioBeta, setPortfolioBeta] = useState(null);
  const [daysToPrediction, setDaysToPrediction] = useState(5);

  // CSS styles
  const styles = {
    daysPredictionSelector: {
      marginBottom: '15px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    daysSelect: {
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      width: '120px'
    },
    label: {
      fontWeight: 'bold'
    }
  };

  // Fetch stocks and tickers on component load
  useEffect(() => {
    fetchStocksAndTickers();
  }, []);

  function setSelectedMarketCode(value) {
    setMarketCode(value)
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

      setSelectedTicker(''); // Reset ticker selection when MarketCode changes
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
              setMarketCodes(data);
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

  // Calculate Beta for all stocks
  const calculateAllBetas = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('http://localhost:5001/api/calculate-beta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          days_to_predict: parseInt(daysToPrediction)
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Filter out any null beta values and ensure we have valid results
        const validResults = Array.isArray(data) 
          ? data.filter(item => item.beta !== null && item.beta !== undefined)
          : data.beta !== null && data.beta !== undefined ? [data] : [];
        
        if (validResults.length > 0) {
          setBetaResults(validResults);
          setCalculationDate(new Date().toLocaleString());
          alert(`Đã tính toán hệ số Beta cho ${validResults.length} mã chứng khoán`);
        } else {
          setError('Không có kết quả Beta hợp lệ nào được tính toán');
        }
      } else {
        setError(data.error || 'Lỗi khi tính toán Beta');
      }
    } catch (err) {
      setError(`Lỗi khi tính toán: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Beta for a specific stock or ticker
  const calculateStockBeta = async () => {
    if (!selectedMarketCode && !selectedTicker) {
      setError('Vui lòng chọn mã chứng khoán hoặc ticker');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const requestBody = {
        days_to_predict: parseInt(daysToPrediction)
      };
      
      // Add market_code and ticker to the request separately
      if (selectedMarketCode) {
        requestBody.market_code = selectedMarketCode;
      }
      
      if (selectedTicker) {
        requestBody.ticker = selectedTicker; // Use ticker instead of stock_code
      }
      
      const response = await fetch('http://localhost:5001/api/calculate-beta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Check if data is an array (multiple results) or a single object
        if (Array.isArray(data)) {
          // If it's an array, use it directly
          setBetaResults(data);
        } else {
          // If it's a single object, put it in an array
          if (data.beta === null || data.beta === undefined) {
            setError(data.error || 'Không thể tính toán Beta cho mã này');
          } else {
            setBetaResults([data]);
          }
        }
        setCalculationDate(new Date().toLocaleString());
      } else {
        setError(data.error || 'Lỗi khi tính toán Beta');
      }
    } catch (err) {
      setError(`Lỗi khi tính toán: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add stock to portfolio
  const addToPortfolio = (stockCode) => {
    if (!stockCode) {
      setError('Không thể thêm mã này vào danh mục');
      return;
    }
    
    setPortfolio({
      ...portfolio,
      [stockCode]: portfolio[stockCode] ? portfolio[stockCode] : 1
    });
  };

  // Update portfolio weight
  const updateWeight = (stockCode, weight) => {
    const value = parseFloat(weight);
    if (!isNaN(value) && value > 0) {
      setPortfolio({
        ...portfolio,
        [stockCode]: value
      });
    }
  };

  // Remove stock from portfolio
  const removeFromPortfolio = (stockCode) => {
    const updatedPortfolio = { ...portfolio };
    delete updatedPortfolio[stockCode];
    setPortfolio(updatedPortfolio);
  };

  // Calculate portfolio beta
  const calculatePortfolioBeta = async () => {
    if (Object.keys(portfolio).length === 0) {
      setError('Vui lòng thêm ít nhất một mã chứng khoán vào danh mục');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const requestBody = {
        portfolio: portfolio,
        days_to_predict: parseInt(daysToPrediction)
      };
      
      // Add market_code and ticker if selected
      if (selectedMarketCode) {
        requestBody.market_code = selectedMarketCode;
      }
      
      if (selectedTicker) {
        requestBody.ticker = selectedTicker;
      }
      
      const response = await fetch('http://localhost:5001/api/calculate-portfolio-beta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPortfolioBeta(data);
        setCalculationDate(new Date().toLocaleString());
      } else {
        setError(data.error || 'Lỗi khi tính toán Beta cho danh mục');
      }
    } catch (err) {
      setError(`Lỗi khi tính toán: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Get color based on beta value
  const getBetaColor = (beta) => {
    if (beta === null) return 'gray';
    if (beta < 0) return 'purple';
    if (beta < 0.5) return 'blue';
    if (beta < 1) return 'green';
    if (beta === 1) return 'black';
    if (beta < 1.5) return 'orange';
    if (beta < 2) return 'orangered';
    return 'red';
  };

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

          <div className="sidebar-item active">
            Beta Calculation
          </div>
          
          <div className="sidebar-item" onClick={() => onMenuChange('svm')}>
            SVM Analysis
          </div>

        
        </div>
        
        {/* Main Content */}
        <div className="dashboard-main">
          <div className="report-container">
            <div className="report-header">
              <h2 className="report-title">Beta Coefficient Calculation</h2>
              
              <div className="report-dates">
                <div>Calculation date: <strong>{calculationDate || currentDate}</strong></div>
              </div>
            </div>
            
            {/* Beta Calculation Form */}
            <div className="beta-calculation-container">
              <div className="calculation-section">
                <h3 className="section-title">Tính toán hệ số Beta (β)</h3>
                
                <div className="days-prediction-selector" style={styles.daysPredictionSelector}>
   
                 
                </div>
                
                <div className="calculation-options">
                  <div className="option-group">
                    <select 
                      value={selectedMarketCode}
                      onChange={(e) => setSelectedMarketCode(e.target.value)}
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
                      disabled={!selectedMarketCode}
                    >
                      <option value="">-- Chọn ticker --</option>
                      {filteredTickers.map(ticker => (
                        <option key={ticker} value={ticker}>{ticker}</option>
                      ))}
                    </select>
                    
                    <button 
                      className="calculate-btn" 
                      onClick={calculateStockBeta}
                      disabled={loading || (!selectedMarketCode && !selectedTicker)}
                    >
                      Tính Beta cho mã đã chọn
                    </button>
                  </div>
                  
                  <div className="option-group">
                  
                  </div>                    
                </div>
                                     
                {loading && (
                  <div className="loading-indicator">
                    <p>Đang tính toán hệ số Beta...</p>
                  </div>
                )}
                
                {error && (
                  <div className="error-message">
                    <p>{error}</p>
                  </div>
                )}
                
                {betaResults.length > 0 && (
                  <div className="results-section">
                    <h4>Kết quả tính toán hệ số Beta:</h4>
                    <div className="beta-results-container">
                      <table className="beta-table">
                        <thead>
                          <tr>
                            <th>Mã CK</th>
                            <th>Hệ số Beta (β)</th>
                            <th>Đánh giá</th>
                            <th>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {betaResults.map((result, index) => (
                            <tr key={index}>
                              <td>{result.stock_code || `${result.market_code}:${result.ticker}` || 'N/A'}</td>
                              <td style={{ color: getBetaColor(result.beta) }}>
                                {result.beta !== null && result.beta !== undefined ? result.beta.toFixed(4) : 'N/A'}
                              </td>
                              <td>{result.interpretation || 'Không có đánh giá'}</td>
                              <td>
                                <button 
                                  onClick={() => addToPortfolio(result.stock_code || `${result.market_code}:${result.ticker}`)}
                                  className="add-to-portfolio-btn"
                                  title="Thêm vào danh mục"
                                  disabled={!result.stock_code && !(result.market_code && result.ticker)}
                                >
                                  +
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="beta-interpretation-guide">
                      <h5>Ý nghĩa của hệ số Beta (β):</h5>
                      <ul>
                        <li><span style={{ color: 'purple' }}>β &lt; 0</span>: Cổ phiếu thường biến động ngược chiều với thị trường.</li>
                        <li><span style={{ color: 'blue' }}>0 &lt; β &lt; 0.5</span>: Cổ phiếu ít biến động hơn nhiều so với thị trường.</li>
                        <li><span style={{ color: 'green' }}>0.5 &lt; β &lt; 1</span>: Cổ phiếu ít biến động hơn thị trường.</li>
                        <li><span style={{ color: 'black' }}>β = 1</span>: Cổ phiếu biến động cùng mức với thị trường.</li>
                        <li><span style={{ color: 'orange' }}>1 &lt; β &lt; 1.5</span>: Cổ phiếu biến động mạnh hơn thị trường.</li>
                        <li><span style={{ color: 'orangered' }}>1.5 &lt; β &lt; 2</span>: Cổ phiếu biến động mạnh hơn nhiều so với thị trường.</li>
                        <li><span style={{ color: 'red' }}>β &gt; 2</span>: Cổ phiếu biến động rất mạnh so với thị trường, rủi ro cao.</li>
                      </ul>
                    </div>
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

export default BetaCalculation; 