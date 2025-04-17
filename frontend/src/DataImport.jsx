import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import './App.css';

function DataImport({ onClose, onMenuChange }) {
  const currentDate = "2025-03-28";
  const [importedData, setImportedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

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

  // Gửi dữ liệu đến backend
  const sendDataToBackend = async (data) => {
    try {
      setLoading(true);

      const response = await fetch('http://127.0.0.1:5000/api/import-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data })
      });
      
      const result = await response.json();
      if (response.ok) {
        setSuccess(true);
        alert(`Dữ liệu đã được import thành công: ${result.message}`);
      } else {
        setError(result.error || "Lỗi khi lưu dữ liệu");
      }
      
    } catch (err) {
      setError(`Lỗi khi gửi dữ liệu: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy dữ liệu đã import từ backend
  const fetchDataFromBackend = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch('http://127.0.0.1:5000/api/stock-data');
      const data = await response.json();
      
      if (response.ok && data.length > 0) {
        setImportedData(data);
        alert(`Đã tải ${data.length} bản ghi từ MongoDB`);
      } else {
        setError("Không có dữ liệu hoặc lỗi khi lấy dữ liệu");
      }
    } catch (err) {
      setError(`Lỗi khi tải dữ liệu: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Tính toán Beta và train SVM
  const handleCalculate = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch('http://127.0.0.1:5000/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        alert(`Tính toán thành công! Beta và SVM đã được cập nhật.`);
      } else {
        setError(result.error || "Lỗi khi tính toán");
      }
    } catch (err) {
      setError(`Lỗi khi tính toán: ${err.message}`);
    } finally {
      setLoading(false);
    }
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
          
          <div className="sidebar-item" onClick={() => onMenuChange('analyst')}>
            Analyst report
          </div>
          
          <div className="sidebar-item" onClick={() => onMenuChange('tool')}>
            Analyst tool
          </div>
          
          <div className="sidebar-item active">
            Data Import
          </div>
          
          <div className="sidebar-item" onClick={() => onMenuChange('notification')}>
            Notification center
          </div>
          
          <div className="sidebar-item" onClick={() => onMenuChange('settings')}>
            Settings
          </div>
        </div>
        
        {/* Main Content */}
        <div className="dashboard-main">
          <div className="report-container">
            <div className="report-header">
              <h2 className="report-title">Data Import for Analysis</h2>
              
              <div className="report-dates">
                <div>Import date: <strong>{currentDate}</strong></div>
              </div>
            </div>
            
            {/* Import Form */}
            <div className="import-form-container">
              <div className="import-section">
                <h3 className="import-title">Nhập dữ liệu phân tích</h3>
                
                <div className="import-description">
                  <p>Hãy chọn tệp dữ liệu dạng CSV hoặc Excel để nhập vào hệ thống.</p>
                  <p>Dữ liệu sẽ được lưu vào cơ sở dữ liệu và sử dụng để tính toán chỉ số Beta và huấn luyện mô hình SVM.</p>
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
                    <h4>Nhập file Excel</h4>
                    <input 
                      type="file" 
                      accept=".xlsx, .xls" 
                      onChange={handleExcelImport}
                      className="file-input"
                      id="excel-input"
                    />
                    <label htmlFor="excel-input" className="file-label">Chọn file Excel</label>
                  </div>
                </div>

                <div className="import-actions">
                  <button className="view-data-btn" onClick={fetchDataFromBackend}>
                    Xem dữ liệu đã lưu trong MongoDB
                  </button>
                </div>
                
                {loading && (
                  <div className="loading-indicator">
                    <p>Đang xử lý dữ liệu...</p>
                  </div>
                )}
                
                {error && (
                  <div className="error-message">
                    <p>{error}</p>
                  </div>
                )}
                
                {success && (
                  <div className="success-message">
                    <p>Dữ liệu đã được nhập thành công từ file: {fileName}</p>
                  </div>
                )}
                
                {importedData.length > 0 && (
                  <div className="data-preview">
                    <h4>Dữ liệu đã nhập ({importedData.length} dòng):</h4>
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
                          <p>Hiển thị 5/{importedData.length} dòng dữ liệu</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {importedData.length > 0 && (
                  <div className="calculate-section">
                    <h4>Tính toán chỉ số và huấn luyện mô hình</h4>
                    <button 
                      className="calculate-btn" 
                      onClick={handleCalculate} 
                      disabled={loading}
                    >
                      Tính Beta và Train SVM
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

export default DataImport; 