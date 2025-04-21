import React, { useState, useEffect } from 'react';
import './App.css';

function SVMAnalysis({ onClose, onMenuChange }) {
  const currentDate = "2025-03-28";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [daysToPrediction, setDaysToPrediction] = useState(5);
  const [useBeta, setUseBeta] = useState(true);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [latestAnalysis, setLatestAnalysis] = useState(null);

  // Fetch latest analysis on component load
  useEffect(() => {
    fetchLatestAnalysis();
  }, []);

  // Fetch latest SVM analysis
  const fetchLatestAnalysis = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/latest-svm-analysis');
      
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
      
      const response = await fetch('/api/svm-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          days_to_predict: parseInt(daysToPrediction),
          use_beta: useBeta
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAnalysisResults(data);
        setLatestAnalysis({
          date: new Date().toLocaleString(),
          days_to_predict: parseInt(daysToPrediction),
          accuracy: data.model_metrics.accuracy,
          predictions: data.predictions
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
              <h2 className="report-title">SVM PRICE PREDICTION</h2>
              
              <div className="report-dates">
                <div>Analysis date: <strong>{latestAnalysis ? latestAnalysis.date : currentDate}</strong></div>
              </div>
            </div>
            
            {/* Analysis Controls */}
            <div className="svm-container">
              <div className="svm-controls">
                <h3 className="section-title">Phân tích dự đoán với SVM</h3>
                
                <div className="settings-row">
                  <div className="setting-group">
                    <label>Số ngày dự báo:</label>
                    <select 
                      value={daysToPrediction} 
                      onChange={(e) => setDaysToPrediction(e.target.value)}
                      className="setting-select"
                    >
                      <option value="1">1 ngày</option>
                      <option value="3">3 ngày</option>
                      <option value="5">5 ngày</option>
                      <option value="7">7 ngày</option>
                      <option value="10">10 ngày</option>
                      <option value="30">30 ngày</option>
                    </select>
                  </div>
                  
                  <div className="setting-group">
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
                    className="run-analysis-btn" 
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
                
                {/* Analysis Results */}
                {latestAnalysis && latestAnalysis.predictions && (
                  <div className="svm-results">
                    <div className="results-summary">
                      <div className="accuracy-card">
                        <h4>Độ chính xác</h4>
                        <div className="accuracy-value">{(latestAnalysis.accuracy * 100).toFixed(2)}%</div>
                      </div>
                      
                      <div className="info-card">
                        <h4>Dự báo</h4>
                        <div className="info-value">{latestAnalysis.days_to_predict} ngày</div>
                      </div>
                      
                      <div className="info-card">
                        <h4>Cổ phiếu phân tích</h4>
                        <div className="info-value">{latestAnalysis.predictions.length}</div>
                      </div>
                    </div>
                    
                    <h4 className="results-title">Dự đoán xu hướng giá</h4>
                    
                    <div className="predictions-table-container">
                      <table className="predictions-table">
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