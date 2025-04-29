import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import SVMDataAnalysis from './SVMDataAnalysis';
import './App.css';

function ResearchDataImport({ onClose }) {
  const currentDate = "2025-04-29";
  const [importedData, setImportedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [activeMenu, setActiveMenu] = useState('import');
  
  const handleMenuChange = (menuItem) => {
    setActiveMenu(menuItem);
  };
  
  if (activeMenu === 'analysis') {
    return <SVMDataAnalysis onClose={onClose} onMenuChange={handleMenuChange} />;
  }

  // Xử lý import file CSV
  const handleCsvImport = (e) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    
    const file = e.target.files[0];
    if (!file) {
      setLoading(false);
      return;
    }
    
    setFileName(file.name);
    
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setImportedData(results.data);
          sendDataToBackend(results.data);
        } else {
          setError("Không thể đọc dữ liệu từ file CSV.");
        }
        setLoading(false);
      },
      error: (error) => {
        setError(`Lỗi khi xử lý file CSV: ${error.message}`);
        setLoading(false);
      }
    });
  };

  // Xử lý import file Excel
  const handleExcelImport = (e) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    
    const file = e.target.files[0];
    if (!file) {
      setLoading(false);
      return;
    }
    
    setFileName(file.name);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData && jsonData.length > 0) {
          setImportedData(jsonData);
          sendDataToBackend(jsonData);
        } else {
          setError("Không thể đọc dữ liệu từ file Excel.");
        }
      } catch (err) {
        setError(`Lỗi khi xử lý file Excel: ${err.message}`);
      }
      setLoading(false);
    };
    
    reader.onerror = () => {
      setError("Lỗi khi đọc file");
      setLoading(false);
    };
    
    reader.readAsBinaryString(file);
  };

  // Xử lý import file chỉ số thị trường (Market Index)
  const handleMarketIndexImport = (e) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    
    const file = e.target.files[0];
    if (!file) {
      setLoading(false);
      return;
    }
    
    setFileName(file.name);
    
    // Xác định loại file (CSV hay Excel) và xử lý phù hợp
    if (file.name.endsWith('.csv')) {
      // Xử lý CSV cho market index
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setImportedData(results.data);
            sendMarketIndexToBackend(results.data);
          } else {
            setError("Không thể đọc dữ liệu từ file CSV VNIndex.");
          }
          setLoading(false);
        },
        error: (error) => {
          setError(`Lỗi khi xử lý file CSV VNIndex: ${error.message}`);
          setLoading(false);
        }
      });
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      // Xử lý Excel cho market index
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          if (jsonData && jsonData.length > 0) {
            setImportedData(jsonData);
            sendMarketIndexToBackend(jsonData);
          } else {
            setError("Không thể đọc dữ liệu từ file Excel VNIndex.");
          }
        } catch (err) {
          setError(`Lỗi khi xử lý file Excel VNIndex: ${err.message}`);
        }
        setLoading(false);
      };
      
      reader.onerror = () => {
        setError("Lỗi khi đọc file VNIndex");
        setLoading(false);
      };
      
      reader.readAsBinaryString(file);
    } else {
      setError("Định dạng file không được hỗ trợ. Vui lòng chọn file CSV hoặc Excel.");
      setLoading(false);
    }
  };

  // Gửi dữ liệu đến backend
  const sendDataToBackend = async (data) => {
    try {
      setLoading(true);

      const response = await fetch('http://localhost:5001/api/research-import-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data })
      });
      
      const result = await response.json();
      if (response.ok) {
        setSuccess(true);
        alert(`Dữ liệu nghiên cứu đã được import thành công: ${result.message}`);
      } else {
        setError(result.error || "Lỗi khi lưu dữ liệu nghiên cứu");
      }
      
    } catch (err) {
      setError(`Lỗi khi gửi dữ liệu nghiên cứu: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Gửi dữ liệu chỉ số thị trường đến backend
  const sendMarketIndexToBackend = async (data) => {
    try {
      setLoading(true);

      const response = await fetch('http://localhost:5001/api/research-import-market-index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data })
      });
      
      const result = await response.json();
      if (response.ok) {
        setSuccess(true);
        alert(`Dữ liệu VNIndex nghiên cứu đã được import thành công: ${result.message}`);
      } else {
        setError(result.error || "Lỗi khi lưu dữ liệu VNIndex nghiên cứu");
      }
      
    } catch (err) {
      setError(`Lỗi khi gửi dữ liệu VNIndex nghiên cứu: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy dữ liệu đã import từ backend
  const fetchDataFromBackend = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch('http://localhost:5001/api/research-stock-data');
      const data = await response.json();
      
      if (response.ok && data.length > 0) {
        setImportedData(data);
        alert(`Đã tải ${data.length} bản ghi nghiên cứu từ MongoDB`);
      } else {
        setError("Không có dữ liệu nghiên cứu hoặc lỗi khi lấy dữ liệu");
      }
    } catch (err) {
      setError(`Lỗi khi tải dữ liệu nghiên cứu: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Tính toán và phân tích dữ liệu nghiên cứu
  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch('http://localhost:5001/api/research-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        alert(`Phân tích dữ liệu nghiên cứu thành công!`);
      } else {
        setError(result.error || "Lỗi khi phân tích dữ liệu nghiên cứu");
      }
    } catch (err) {
      setError(`Lỗi khi phân tích: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <span>Research iPlatform</span>
        <div className="header-controls">
          <button className="user-icon-btn" onClick={() => {}}>
         
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
          

          <div className="sidebar-item" onClick={() => handleMenuChange('analysis')}>
           SVM Data Analysis
          </div>
          
          <div className="sidebar-item active">
            Research Data Import
          </div>
        </div>
        
        {/* Main Content */}
        <div className="dashboard-main">
          <div className="report-container">
            <div className="report-header">
              <h2 className="report-title">Research Data Import</h2>
              
              <div className="report-dates">
                <div>Import date: <strong>{currentDate}</strong></div>
              </div>
            </div>
            
            {/* Import Form */}
            <div className="import-form-container">
              <div className="import-section">
                <h3 className="import-title">Nhập dữ liệu nghiên cứu</h3>
                
                <div className="import-description">
                  <p>Hãy chọn tệp dữ liệu dạng CSV hoặc Excel để nhập vào hệ thống nghiên cứu.</p>
                  <p>Dữ liệu sẽ được lưu vào cơ sở dữ liệu và sử dụng để phân tích thị trường và tạo báo cáo nghiên cứu.</p>
                </div>
                
                <div className="import-options">
                  <div className="import-option">
                    <h4>Nhập file CSV</h4>
                    <input 
                      type="file" 
                      accept=".csv" 
                      onChange={handleCsvImport}
                      className="file-input"
                      id="csv-input"
                    />
                    <label htmlFor="csv-input" className="file-label">Chọn file CSV</label>
                  </div>              
                  <div className="import-option">
                    <h4>Nhập dữ liệu VNIndex</h4>
                    <input 
                      type="file" 
                      accept=".csv, .xlsx, .xls" 
                      onChange={handleMarketIndexImport}
                      className="file-input"
                      id="market-index-input"
                    />
                    <label htmlFor="market-index-input" className="file-label">Chọn file VNIndex</label>
                  </div>
                </div>

                <div className="import-actions">
                  <button className="view-data-btn" onClick={fetchDataFromBackend}>
                    Xem dữ liệu nghiên cứu đã lưu trong MongoDB
                  </button>
                </div>
                
                {loading && (
                  <div className="loading-indicator">
                    <p>Đang xử lý dữ liệu nghiên cứu...</p>
                  </div>
                )}
                
                {error && (
                  <div className="error-message">
                    <p>{error}</p>
                  </div>
                )}
                
                {success && (
                  <div className="success-message">
                    <p>Dữ liệu nghiên cứu đã được nhập thành công từ file: {fileName}</p>
                  </div>
                )}
                
                {importedData.length > 0 && (
                  <div className="data-preview">
                    <h4>Dữ liệu nghiên cứu đã nhập ({importedData.length} dòng):</h4>
                    <div className="preview-table-container">
                      <table className="preview-table">
                        <thead>
                          <tr>
                            {Object.keys(importedData[0]).map((header, index) => (
                              <th key={index}>{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {importedData.slice(0, 5).map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {Object.values(row).map((cell, cellIndex) => (
                                <td key={cellIndex}>{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {importedData.length > 5 && (
                        <div className="more-data-note">
                          <p>Hiển thị 5/{importedData.length} dòng dữ liệu nghiên cứu</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {importedData.length > 0 && (
                  <div className="calculate-section">
                    <h4>Phân tích dữ liệu nghiên cứu</h4>
                    <button 
                      className="calculate-btn" 
                      onClick={handleAnalyze} 
                      disabled={loading}
                    >
                      Phân tích dữ liệu
                    </button>
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

export default ResearchDataImport; 