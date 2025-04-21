import pandas as pd
import numpy as np
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

def prepare_features(stock_data, beta_values, days_to_predict=5):
    """
    Prepare features for SVM analysis from stock data and beta values
    
    Parameters:
    stock_data (DataFrame): Historical stock data
    beta_values (DataFrame): Beta values for the stocks
    days_to_predict (int): Number of days to use for prediction horizon
    
    Returns:
    DataFrame: Features and target variables for SVM
    """
    # Create a copy of the data
    df = stock_data.copy()
    
    # Convert date strings to datetime
    df['TradeDate'] = pd.to_datetime(df['TradeDate'])
    
    # Sort by date
    df = df.sort_values(['MarketCode', 'TradeDate'])
    
    # Group by stock code to process each stock individually
    grouped = df.groupby('MarketCode')
    
    # Initialize lists to store results
    all_features = []
    all_targets = []
    all_stock_codes = []
    all_dates = []
    
    for stock_code, group in grouped:
        # Skip if less than 10 data points
        if len(group) < 10:
            continue
        
        # Get beta value for this stock
        beta_value = None
        if beta_values is not None:
            beta_row = beta_values[beta_values['stock_code'] == stock_code]
            if not beta_row.empty:
                beta_value = beta_row.iloc[0]['beta']
        
        # Calculate technical indicators
        group = calculate_technical_indicators(group)
        
        # Drop rows with NaN (due to rolling calculations)
        group = group.dropna()
        
        # Prepare features
        for i in range(len(group) - days_to_predict):
            # Current data point
            current_data = group.iloc[i]
            
            # Features
            features = [
                current_data['CurrentIndex'],         # Current price
                current_data['rsi_14'],               # RSI
                current_data['macd'],                 # MACD
                current_data['macd_signal'],          # MACD Signal
                current_data['upper_band'],           # Bollinger Upper
                current_data['lower_band'],           # Bollinger Lower
                current_data['obv'],                  # On-Balance Volume
                current_data['atr_14'],               # Average True Range
                current_data['volatility_20'],        # Volatility
            ]
            
            # Add beta as a feature if available
            if beta_value is not None:
                features.append(beta_value)
            
            # Target: Will the price go up in the next 'days_to_predict' days?
            future_price = group.iloc[i + days_to_predict]['CurrentIndex']
            current_price = current_data['CurrentIndex']
            
            # Classify as 1 (up), 0 (neutral), -1 (down)
            percent_change = (future_price - current_price) / current_price * 100
            
            if percent_change > 1.0:  # Up more than 1%
                target = 1
            elif percent_change < -1.0:  # Down more than 1%
                target = -1
            else:  # Between -1% and 1%
                target = 0
            
            all_features.append(features)
            all_targets.append(target)
            all_stock_codes.append(stock_code)
            all_dates.append(current_data['TradeDate'])
    
    # Convert lists to arrays
    X = np.array(all_features)
    y = np.array(all_targets)
    
    return X, y, all_stock_codes, all_dates

def calculate_technical_indicators(df):
    """Calculate various technical indicators for the dataframe"""
    # Price and volume data
    df = df.copy()
    
    # RSI (Relative Strength Index)
    delta = df['CurrentIndex'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['rsi_14'] = 100 - (100 / (1 + rs))
    
    # MACD (Moving Average Convergence Divergence)
    exp1 = df['CurrentIndex'].ewm(span=12, adjust=False).mean()
    exp2 = df['CurrentIndex'].ewm(span=26, adjust=False).mean()
    df['macd'] = exp1 - exp2
    df['macd_signal'] = df['macd'].ewm(span=9, adjust=False).mean()
    
    # Bollinger Bands
    df['20sma'] = df['CurrentIndex'].rolling(window=20).mean()
    df['volatility_20'] = df['CurrentIndex'].rolling(window=20).std()
    df['upper_band'] = df['20sma'] + (df['volatility_20'] * 2)
    df['lower_band'] = df['20sma'] - (df['volatility_20'] * 2)
    
    # OBV (On-Balance Volume)
    df['daily_ret'] = df['CurrentIndex'].pct_change()
    df['direction'] = np.where(df['daily_ret'] > 0, 1, -1)
    df['direction'][df['daily_ret'] == 0] = 0
    df['obv'] = (df['TradingVolume'] * df['direction']).cumsum()
    
    # ATR (Average True Range)
    df['high_low'] = df['HighestIndex'] - df['LowestIndex']
    df['high_close'] = abs(df['HighestIndex'] - df['CurrentIndex'].shift())
    df['low_close'] = abs(df['LowestIndex'] - df['CurrentIndex'].shift())
    df['tr'] = df[['high_low', 'high_close', 'low_close']].max(axis=1)
    df['atr_14'] = df['tr'].rolling(window=14).mean()
    
    return df

def train_svm_model(X, y):
    """
    Train an SVM model for stock prediction
    
    Parameters:
    X (array): Feature matrix
    y (array): Target vector
    
    Returns:
    tuple: (model, scaler, accuracy, report)
    """
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale the features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train SVM with different kernels
    kernels = ['linear', 'rbf', 'poly']
    best_accuracy = 0
    best_model = None
    best_report = None
    
    for kernel in kernels:
        model = SVC(kernel=kernel, C=1.0, gamma='scale', random_state=42)
        model.fit(X_train_scaled, y_train)
        
        # Predict on test set
        y_pred = model.predict(X_test_scaled)
        
        # Calculate accuracy
        accuracy = accuracy_score(y_test, y_pred)
        report = classification_report(y_test, y_pred, output_dict=True)
        
        # Save the best model
        if accuracy > best_accuracy:
            best_accuracy = accuracy
            best_model = model
            best_report = report
    
    # Get confusion matrix
    y_pred = best_model.predict(X_test_scaled)
    cm = confusion_matrix(y_test, y_pred)
    
    return best_model, scaler, best_accuracy, best_report, cm

def predict_stock_movement(model, scaler, features):
    """
    Predict stock movement using trained SVM model
    
    Parameters:
    model: Trained SVM model
    scaler: Feature scaler
    features (array): Features for prediction
    
    Returns:
    int: Predicted movement class (-1, 0, 1)
    """
    # Scale features
    features_scaled = scaler.transform([features])
    
    # Predict
    prediction = model.predict(features_scaled)[0]
    
    return prediction

def get_prediction_label(prediction):
    """Convert prediction class to label"""
    if prediction == 1:
        return "Tăng giá", "strong_buy"
    elif prediction == 0:
        return "Đi ngang", "hold"
    else:
        return "Giảm giá", "strong_sell"

def analyze_stocks_with_svm(stock_data, beta_values, days_to_predict=5):
    """
    Analyze stocks using SVM and return predictions and model metrics
    
    Parameters:
    stock_data (DataFrame): Historical stock data
    beta_values (DataFrame): Beta values for the stocks
    days_to_predict (int): Number of days to predict ahead
    
    Returns:
    dict: Analysis results and predictions
    """
    # Prepare features and targets
    X, y, stock_codes, dates = prepare_features(stock_data, beta_values, days_to_predict)
    
    if len(X) == 0:
        return {
            "success": False,
            "error": "Insufficient data for analysis"
        }
    
    # Train SVM model
    model, scaler, accuracy, report, confusion_matrix = train_svm_model(X, y)
    
    # Get unique stock codes
    unique_stocks = list(set(stock_codes))
    
    # Generate predictions for latest data for each stock
    predictions = []
    
    for stock_code in unique_stocks:
        stock_indices = [i for i, code in enumerate(stock_codes) if code == stock_code]
        
        if stock_indices:
            # Get latest data point
            latest_index = max(stock_indices)
            latest_features = X[latest_index]
            
            # Predict
            prediction = predict_stock_movement(model, scaler, latest_features)
            
            # Get prediction label
            label, signal = get_prediction_label(prediction)
            
            # Get beta value
            beta = None
            if beta_values is not None:
                beta_row = beta_values[beta_values['stock_code'] == stock_code]
                if not beta_row.empty:
                    beta = beta_row.iloc[0]['beta']
                    beta_interpretation = beta_row.iloc[0]['interpretation']
            
            # Add to predictions
            predictions.append({
                "stock_code": stock_code,
                "prediction": int(prediction),
                "prediction_label": label,
                "signal": signal,
                "date": dates[latest_index].strftime("%Y-%m-%d"),
                "beta": beta,
                "beta_interpretation": beta_interpretation if beta is not None else None,
                "confidence": float(report[str(prediction)]['precision']) if str(prediction) in report else None
            })
    
    # Sort predictions by confidence
    predictions = sorted(predictions, key=lambda x: x['confidence'] if x['confidence'] else 0, reverse=True)
    
    return {
        "success": True,
        "model_metrics": {
            "accuracy": accuracy,
            "report": report,
            "confusion_matrix": confusion_matrix.tolist()
        },
        "predictions": predictions,
        "days_ahead": days_to_predict
    } 