from itertools import count

import pandas as pd
import numpy as np
import torch
import matplotlib.pyplot as plt

from beta_calculation import get_beta_for_stock, calculate_all_stock_betas
from svm_analysis import analyze_stocks_with_svm

# Function to load and preprocess real stock data
def load_stock_data(csv_file):
    """
    Load and preprocess real stock data from CSV file
    
    Parameters:
    csv_file (str): Path to the stock data CSV file
    sample_size (int): Number of samples to use (for testing)
    
    Returns:
    DataFrame: Preprocessed stock data
    """
    print(f"Loading stock data from {csv_file}...")
    try:
        # Load the stock data
        stock_data = pd.read_csv(csv_file)

        # Convert to DataFrame
        stock_df = pd.DataFrame(stock_data)
        
        print(f"Loaded {len(stock_data)} records for {len(stock_data['Ticker'].unique())} tickers")
        return stock_df
    
    except Exception as e:
        print(f"Error loading stock data: {str(e)}")


# Function to load and preprocess real stock data
def load_market_data(csv_file):
    """
    Load and preprocess real stock data from CSV file

    Parameters:
    csv_file (str): Path to the stock data CSV file
    sample_size (int): Number of samples to use (for testing)

    Returns:
    DataFrame: Preprocessed stock data
    """
    print(f"Loading stock data from {csv_file}...")
    try:
        # Load the stock data
        stock_data = pd.read_csv(csv_file)

        # Convert to DataFrame
        stock_df = pd.DataFrame(stock_data)

        print(f"Loaded {len(stock_data)} records for {len(stock_data['Ticker'].unique())} tickers")
        return stock_df

    except Exception as e:
        print(f"Error loading stock data: {str(e)}")


# Plot confusion matrix
def plot_confusion_matrix(cm, class_names=['Giảm', 'Đi ngang', 'Tăng']):
    plt.figure(figsize=(8, 6))
    plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    plt.title('Ma trận nhầm lẫn')
    plt.colorbar()
    
    tick_marks = np.arange(len(class_names))
    plt.xticks(tick_marks, class_names, rotation=45)
    plt.yticks(tick_marks, class_names)
    
    # Add text annotations in each cell
    thresh = cm.max() / 2
    for i in range(len(class_names)):
        for j in range(len(class_names)):
            plt.text(j, i, format(cm[i, j], 'd'),
                    ha="center", va="center",
                    color="white" if cm[i, j] > thresh else "black")
    
    plt.tight_layout()
    plt.ylabel('Nhãn thực tế')
    plt.xlabel('Nhãn dự đoán')
    plt.savefig('confusion_matrix.png')
    plt.close()

# Plot confidence distribution
def plot_confidence_distribution(predictions):
    confidences = [pred['confidence'] for pred in predictions]
    labels = [int(pred['prediction']) + 1 for pred in predictions]  # Convert -1,0,1 to 0,1,2
    
    plt.figure(figsize=(10, 6))
    
    # Plot confidence distribution for each class
    for class_idx, class_name in enumerate(['Giảm', 'Đi ngang', 'Tăng']):
        class_confidences = [conf for conf, label in zip(confidences, labels) if label == class_idx]
        if class_confidences:
            plt.hist(class_confidences, alpha=0.5, bins=20, label=class_name)
    
    plt.xlabel('Điểm tin cậy')
    plt.ylabel('Tần suất')
    plt.title('Phân phối điểm tin cậy theo nhóm dự đoán')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.savefig('confidence_distribution.png')
    plt.close()

if __name__ == "__main__":
    # Check if torch cuda is available
    print(f"CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"CUDA device: {torch.cuda.get_device_name(0)}")
    
    # Load real stock data from CSV
    stock_data = pd.read_csv("marketDB.csv")
    # Convert to DataFrame
    stock_df_all = pd.DataFrame(stock_data)
    stock_df_all['TradeDate'] = pd.to_datetime(stock_df_all['TradeDate']).dt.strftime('%Y-%m-%d')
    stock_df = stock_df_all[(stock_df_all['MarketCode']== 'HOSE') & (stock_df_all['Ticker'].isin(['FCN', 'FCM', 'SHB']))]
    print(f"Loaded {len(stock_data)} records for {len(stock_data['Ticker'].unique())} tickers")

    # Load real stock data from CSV
    market_data = pd.read_csv("marketindex.csv")
    # Normalize index codes - handle different naming conventions
    # Convert to DataFrame
    market_df_all = pd.DataFrame(market_data)
    market_df_all['TradeDate'] = pd.to_datetime(market_df_all['TradeDate']).dt.strftime('%Y-%m-%d')
    market_df = market_df_all[(market_df_all['MarketCode']== 'HSX') & (market_df_all['IndexCode']== 'VNINDEX')]


    # Get unique tickers and market codes
    tickers = stock_data['Ticker'].unique()
    market_codes = stock_data['MarketCode'].unique()
    
    print("Calculating beta values for tickers...")
    # beta_values = generate_beta_values_for_tickers(tickers, market_codes)
    beta_values = calculate_all_stock_betas(stock_df, market_df, days_to_predict=10)
    
    print("Stock data shape:", stock_data.shape)
    print("Beta values shape:", beta_values.shape)
    
    print("\nRunning PyTorch SVM analysis for 5-day prediction horizon...")
    results = analyze_stocks_with_svm(stock_df, beta_values, days_to_predict=5)
    
    if results['success']:
        print("\nPhân tích hoàn tất thành công!")
        print(f"Độ chính xác mô hình: {results['model_metrics']['accuracy']:.4f}")
        print(f"Tổng số dự đoán: {len(results['predictions'])}")
        
        # Display sample predictions with confidence scores
        print("\nMẫu dự đoán:")
        preds = results['predictions']

        # Display predictions for FCN
        count = 0
        for i, pred in enumerate(preds):
            if pred['stock_code'] == 'HOSE:FCN' and count < 5:
                count += 1
                print(f"{count}. {pred['stock_code']} ngày {pred['date']}: {pred['prediction_label']} (Tín hiệu: {pred['signal']})")

        # Display predictions for FCM
        count = 0
        for i, pred in enumerate(preds):
            if pred['stock_code'] == 'HOSE:FCM' and count < 5:
                count += 1
                print(f"{count}. {pred['stock_code']} ngày {pred['date']}: {pred['prediction_label']} (Tín hiệu: {pred['signal']})")

        # Display predictions for SHB
        count = 0
        for i, pred in enumerate(preds):
            if pred['stock_code'] == 'HOSE:SHB' and count < 5:
                count += 1
                print(f"{count}. {pred['stock_code']} ngày {pred['date']}: {pred['prediction_label']} (Tín hiệu: {pred['signal']})")

        # Plot confusion matrix
        cm = np.array(results['model_metrics']['confusion_matrix'])
        plot_confusion_matrix(cm)
        print("Ma trận nhầm lẫn đã được lưu dưới dạng 'confusion_matrix.png'")
        
        # Plot confidence distribution
        plot_confidence_distribution(results['predictions'])
        print("Biểu đồ phân phối điểm tin cậy đã được lưu dưới dạng 'confidence_distribution.png'")
        
        # Display class-wise metrics
        print("\nĐộ đo theo lớp:")
        for class_name, class_label in zip(['-1', '0', '1'], ['Giảm', 'Đi ngang', 'Tăng']):
            if class_name in results['model_metrics']['report']:
                metrics = results['model_metrics']['report'][class_name]
                print(f"Lớp {class_label}: Precision={metrics['precision']:.4f}, Recall={metrics['recall']:.4f}, F1-score={metrics['f1-score']:.4f}")
    else:
        print("Phân tích thất bại:", results['error'])
