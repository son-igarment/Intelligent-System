import React, { useState, useEffect } from 'react';
import './App.css';

function BetaCalculation({ onClose, onMenuChange }) {
  const currentDate = "2025-03-28";
  const [stocks, setStocks] = useState([]);
  const [betaResults, setBetaResults] = useState([]);
  const [selectedStock, setSelectedStock] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calculationDate, setCalculationDate] = useState('');
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [portfolio, setPortfolio] = useState({});
  const [portfolioBeta, setPortfolioBeta] = useState(null);

  // Fetch stocks on component load
  useEffect(() => {
    fetchStocks();
  }, []);

  // Fetch available stocks
  const fetchStocks = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/stock-data');
      const data = await response.json();
      
      if (response.ok) {
        // Extract unique stock codes
        const uniqueStocks = [...new Set(data.map(item => item.MarketCode))];
        setStocks(uniqueStocks);
      } else {
        setError('Không thể lấy dữ liệu cổ phiếu');
      }
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
      
      const response = await fetch('/api/calculate-beta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setBetaResults(data);
        setCalculationDate(new Date().toLocaleString());
        alert(`Đã tính toán hệ số Beta cho ${data.length} mã chứng khoán`);
      } else {
        setError(data.error || 'Lỗi khi tính toán Beta');
      }
    } catch (err) {
      setError(`Lỗi khi tính toán: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Beta for a specific stock
  const calculateStockBeta = async () => {
    if (!selectedStock) {
      setError('Vui lòng chọn mã chứng khoán');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/calculate-beta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stock_code: selectedStock
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.beta === null) {
          setError(data.error || 'Không thể tính toán Beta cho mã này');
        } else {
          setBetaResults([data]);
          setCalculationDate(new Date().toLocaleString());
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

  // Add stock to portfolio
  const addToPortfolio = (stockCode) => {
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
      
      const response = await fetch('/api/calculate-portfolio-beta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          portfolio: portfolio
        })
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

          <div className="sidebar-item active">
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
              <h2 className="report-title">Beta Coefficient Calculation</h2>
              
              <div className="report-dates">
                <div>Calculation date: <strong>{calculationDate || currentDate}</strong></div>
              </div>
            </div>
            
            {/* Beta Calculation Form */}
            <div className="beta-calculation-container">
              <div className="calculation-section">
                <h3 className="section-title">Tính toán hệ số Beta (β)</h3>
                
                <div className="calculation-options">
                  <div className="option-group">
                    <select 
                      value={selectedStock} 
                      onChange={(e) => setSelectedStock(e.target.value)}
                      className="stock-select"
                    >
                      <option value="">-- Chọn mã chứng khoán --</option>
                      {stocks.map(stock => (
                        <option key={stock} value={stock}>{stock}</option>
                      ))}
                    </select>
                    
                    <button 
                      className="calculate-btn" 
                      onClick={calculateStockBeta}
                      disabled={loading || !selectedStock}
                    >
                      Tính Beta cho mã đã chọn
                    </button>
                  </div>
                  
                  <div className="option-group">
                    <button 
                      className="calculate-all-btn" 
                      onClick={calculateAllBetas}
                      disabled={loading}
                    >
                      Tính Beta cho tất cả các mã
                    </button>
                  </div>
                  
                  <div className="option-group">
                    <button 
                      className="portfolio-btn" 
                      onClick={() => setShowPortfolio(!showPortfolio)}
                    >
                      {showPortfolio ? 'Ẩn tính toán danh mục' : 'Tính Beta cho danh mục đầu tư'}
                    </button>
                  </div>
                </div>
                
                {showPortfolio && (
                  <div className="portfolio-section">
                    <h4>Tính hệ số Beta cho danh mục đầu tư</h4>
                    <div className="portfolio-builder">
                      <div className="add-to-portfolio">
                        <select 
                          value={selectedStock} 
                          onChange={(e) => setSelectedStock(e.target.value)}
                          className="stock-select"
                        >
                          <option value="">-- Chọn mã để thêm vào danh mục --</option>
                          {stocks.map(stock => (
                            <option key={stock} value={stock}>{stock}</option>
                          ))}
                        </select>
                        
                        <button 
                          onClick={() => selectedStock && addToPortfolio(selectedStock)}
                          disabled={!selectedStock}
                          className="add-btn"
                        >
                          Thêm vào danh mục
                        </button>
                      </div>
                      
                      {Object.keys(portfolio).length > 0 && (
                        <div className="portfolio-items">
                          <h5>Các mã trong danh mục:</h5>
                          <table className="portfolio-table">
                            <thead>
                              <tr>
                                <th>Mã CK</th>
                                <th>Trọng số</th>
                                <th>Hành động</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(portfolio).map(([code, weight]) => (
                                <tr key={code}>
                                  <td>{code}</td>
                                  <td>
                                    <input 
                                      type="number" 
                                      min="0.1" 
                                      step="0.1"
                                      value={weight}
                                      onChange={(e) => updateWeight(code, e.target.value)}
                                      className="weight-input"
                                    />
                                  </td>
                                  <td>
                                    <button 
                                      onClick={() => removeFromPortfolio(code)}
                                      className="remove-btn"
                                    >
                                      Xóa
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          
                          <button 
                            onClick={calculatePortfolioBeta}
                            className="calculate-portfolio-btn"
                            disabled={loading}
                          >
                            Tính Beta cho danh mục
                          </button>
                        </div>
                      )}
                      
                      {portfolioBeta && (
                        <div className="portfolio-result">
                          <h5>Kết quả tính toán Beta cho danh mục:</h5>
                          <div className="beta-result">
                            <div className="beta-value" style={{ color: getBetaColor(portfolioBeta.portfolio_beta) }}>
                              β = {portfolioBeta.portfolio_beta !== null ? portfolioBeta.portfolio_beta.toFixed(4) : 'N/A'}
                            </div>
                            <div className="beta-interpretation">
                              {portfolioBeta.interpretation}
                            </div>
                          </div>
                          
                          {portfolioBeta.component_betas && (
                            <div className="component-betas">
                              <h6>Đóng góp của từng mã:</h6>
                              <table className="component-table">
                                <thead>
                                  <tr>
                                    <th>Mã CK</th>
                                    <th>Beta</th>
                                    <th>Trọng số</th>
                                    <th>Beta × Trọng số</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {portfolioBeta.component_betas.map((item, index) => (
                                    <tr key={index}>
                                      <td>{item.stock_code}</td>
                                      <td style={{ color: getBetaColor(item.beta) }}>
                                        {item.beta.toFixed(4)}
                                      </td>
                                      <td>{item.weight.toFixed(2)}</td>
                                      <td>{item.weighted_beta.toFixed(4)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
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
                              <td>{result.stock_code}</td>
                              <td style={{ color: getBetaColor(result.beta) }}>
                                {result.beta !== null ? result.beta.toFixed(4) : 'N/A'}
                              </td>
                              <td>{result.interpretation}</td>
                              <td>
                                <button 
                                  onClick={() => addToPortfolio(result.stock_code)}
                                  className="add-to-portfolio-btn"
                                  title="Thêm vào danh mục"
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