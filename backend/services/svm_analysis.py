import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_squared_error
from sklearn.model_selection import train_test_split

def calculate_returns(df, price_col='ClosePrice'):
    """
    Calculate daily returns for a given price series
    
    Parameters:
    df (DataFrame): DataFrame containing price data
    price_col (str): Column name for price data
    
    Returns:
    Series: Daily returns
    """
    # Convert to float to ensure proper calculation
    prices = df[price_col].astype(float)
    
    # Calculate returns: Ri = (P1 - P0) / P0
    # Note: In a real implementation, we would add dividends (D1) if available
    returns = prices.pct_change()
    
    return returns

def fit_market_model(stock_returns, market_returns):
    """
    Fit Market Model (Ri = αi + βiRm + ϵi) using linear regression
    
    Parameters:
    stock_returns (Series): Returns of the stock
    market_returns (Series): Returns of the market index
    
    Returns:
    dict: Alpha, Beta, R-squared and other metrics
    """
    # Remove NaN values (usually from the pct_change calculation)
    valid_data = pd.DataFrame({
        'stock': stock_returns,
        'market': market_returns
    }).dropna()
    
    if len(valid_data) < 30:  # Need sufficient data points for meaningful regression
        return None
    
    # Prepare X and y for linear regression
    X = valid_data['market'].values.reshape(-1, 1)
    y = valid_data['stock'].values
    
    # Fit linear regression model
    model = LinearRegression()
    model.fit(X, y)
    
    # Extract parameters
    alpha = model.intercept_  # αi (Alpha)
    beta = model.coef_[0]     # βi (Beta)
    
    # Make predictions
    y_pred = model.predict(X)
    
    # Calculate metrics
    r2 = r2_score(y, y_pred)
    mse = mean_squared_error(y, y_pred)
    
    # Calculate residuals (ϵi = Ri - (αi + βiRm))
    residuals = y - y_pred
    
    # Coefficient of determination
    ss_total = np.sum((y - np.mean(y))**2)
    ss_residual = np.sum(residuals**2)
    r_squared = 1 - (ss_residual / ss_total)
    
    return {
        'alpha': alpha,
        'beta': beta,
        'r_squared': r_squared,
        'mse': mse,
        'residuals': residuals
    }

def interpret_beta(beta):
    """
    Interpret the meaning of Beta value
    
    Parameters:
    beta (float): Beta coefficient from market model
    
    Returns:
    str: Interpretation of Beta
    """
    if beta is None:
        return "Không thể xác định"
    
    if beta < 0:
        return "Biến động ngược chiều với thị trường"
    elif beta < 0.5:
        return "Ít biến động hơn thị trường rất nhiều"
    elif beta < 0.8:
        return "Ít biến động hơn thị trường"
    elif beta < 1.0:
        return "Biến động gần với thị trường (ít hơn)"
    elif beta == 1.0:
        return "Biến động cùng với thị trường"
    elif beta < 1.2:
        return "Biến động gần với thị trường (nhiều hơn)"
    elif beta < 1.5:
        return "Biến động nhiều hơn thị trường"
    else:
        return "Biến động mạnh hơn thị trường rất nhiều"

def interpret_alpha(alpha):
    """
    Interpret the meaning of Alpha value
    
    Parameters:
    alpha (float): Alpha coefficient from market model
    
    Returns:
    str: Interpretation of Alpha
    """
    if alpha is None:
        return "Không thể xác định"
    
    if alpha > 0.01:
        return "Hiệu suất vượt trội so với thị trường"
    elif alpha > 0.001:
        return "Hiệu suất nhỉnh hơn thị trường"
    elif alpha > -0.001:
        return "Hiệu suất tương đương thị trường"
    elif alpha > -0.01:
        return "Hiệu suất kém hơn thị trường một chút"
    else:
        return "Hiệu suất kém hơn thị trường đáng kể"

def predict_future_returns(alpha, beta, future_market_returns):
    """
    Predict future stock returns based on Market Model
    
    Parameters:
    alpha (float): Alpha coefficient from market model
    beta (float): Beta coefficient from market model
    future_market_returns (array): Expected future market returns
    
    Returns:
    array: Predicted future stock returns
    """
    # Ri = αi + βiRm + ϵi
    # For prediction, we ignore the error term (ϵi)
    predicted_returns = alpha + beta * future_market_returns
    
    return predicted_returns

def classify_prediction(returns, threshold=0.01):
    """
    Classify predicted returns into Buy/Hold/Sell signals
    
    Parameters:
    returns (array-like): Predicted returns
    threshold (float): Threshold for significant movement
    
    Returns:
    int: Signal category (1 = Buy, 0 = Hold, -1 = Sell)
    """
    if returns > threshold:
        return 1  # Buy
    elif returns < -threshold:
        return -1  # Sell
    else:
        return 0  # Hold

def estimate_future_market_returns(market_data, days_ahead=5):
    """
    Estimate future market returns based on historical patterns
    
    Parameters:
    market_data (DataFrame): Historical market data
    days_ahead (int): Number of days to forecast
    
    Returns:
    array: Estimated future market returns
    """
    # This is a simplified model
    # In a real implementation, you might use more sophisticated forecasting techniques
    
    # Get recent market returns
    market_returns = calculate_returns(market_data)
    
    # Use average of recent returns as the forecast
    # We use the last 30 days as a simple forecast mechanism
    recent_avg_return = market_returns.tail(30).mean()
    
    # Generate forecast for days_ahead
    forecast = np.array([recent_avg_return] * days_ahead)
    
    return forecast

def analyze_stocks_with_market_model(stock_data, market_data, days_to_predict=5):
    """
    Analyze stocks with Market Model to predict price movements
    
    Parameters:
    stock_data (DataFrame): Historical stock data
    market_data (DataFrame): Market index data (if None, will try to find it in stock_data)
    days_to_predict (int): Number of days to predict ahead
    
    Returns:
    dict: Result of Market Model analysis including predictions and metrics
    """
    try:
        # Create a copy of the data
        stocks_df = stock_data.copy()
        
        # Ensure date column is datetime
        stocks_df['TradeDate'] = pd.to_datetime(stocks_df['TradeDate'])
        
        # Sort by date
        stocks_df = stocks_df.sort_values(['MarketCode', 'Ticker', 'TradeDate'])
        
        # Extract market data if not provided separately
        if market_data is None or market_data.empty:
            print("Market data not provided separately. Trying to find market index in stock data.")
            market_indices = ['VNINDEX', 'VN-INDEX', 'VNIndex', 'HNXIndex', 'HNXINDEX']
            
            # Try to find market index data
            market_df = None
            for idx in market_indices:
                if 'IndexCode' in stocks_df.columns:
                    market_rows = stocks_df[stocks_df['IndexCode'] == idx]
                    if not market_rows.empty:
                        market_df = market_rows.copy()
                        break
                elif 'Ticker' in stocks_df.columns:
                    # Also try to find it in Ticker column
                    market_rows = stocks_df[stocks_df['Ticker'] == idx]
                    if not market_rows.empty:
                        market_df = market_rows.copy()
                        break
            
            if market_df is None:
                return {
                    "success": False,
                    "error": "Could not find market index data. Please provide it separately."
                }
        else:
            market_df = market_data.copy()
            
        # Ensure market data has a date column
        if 'TradeDate' not in market_df.columns and 'Date' in market_df.columns:
            market_df['TradeDate'] = pd.to_datetime(market_df['Date'])
        else:
            market_df['TradeDate'] = pd.to_datetime(market_df['TradeDate'])
            
        # Calculate market returns
        market_returns = calculate_returns(market_df, price_col='CloseIndex' if 'CloseIndex' in market_df.columns else 'ClosePrice')
        market_returns_dict = dict(zip(market_df['TradeDate'], market_returns))
        
        # Estimate future market returns
        future_market_returns = estimate_future_market_returns(market_df, days_ahead=days_to_predict)
        
        # Group by stock to analyze each one
        grouped = stocks_df.groupby(['MarketCode', 'Ticker'])
        
        # Results container
        predictions = []
        overall_metrics = {
            'avg_r_squared': 0,
            'avg_beta': 0,
            'avg_alpha': 0,
            'stocks_analyzed': 0
        }
        
        for (market_code, ticker), group in grouped:
            # Skip if too few data points
            if len(group) < 60:  # Need sufficient historical data
                continue
                
            # Calculate stock returns
            stock_returns = calculate_returns(group)
            
            # Match market returns to stock dates
            aligned_market_returns = []
            for date in group['TradeDate']:
                # Get market return for this date if available
                if date in market_returns_dict:
                    aligned_market_returns.append(market_returns_dict[date])
                else:
                    aligned_market_returns.append(np.nan)
            
            aligned_market_returns = pd.Series(aligned_market_returns, index=group.index)
            
            # Fit Market Model
            model_result = fit_market_model(stock_returns, aligned_market_returns)
            
            if model_result is None:
                # Skip if model fitting failed
                continue
                
            # Extract parameters
            alpha = model_result['alpha']
            beta = model_result['beta']
            r_squared = model_result['r_squared']
            
            # Predict future returns
            predicted_returns = predict_future_returns(alpha, beta, future_market_returns)
            
            # Calculate average predicted return
            avg_predicted_return = np.mean(predicted_returns)
            
            # Classify prediction
            prediction = classify_prediction(avg_predicted_return)
            
            # Convert prediction to signal and label
            signal = "neutral"
            prediction_label = "Đi ngang"
            
            if prediction == 1:  # Buy
                signal = "strong_buy"
                prediction_label = "Tăng"
            elif prediction == -1:  # Sell
                signal = "strong_sell"
                prediction_label = "Giảm"
            
            # Calculate confidence based on R-squared and absolute predicted return
            # Higher R-squared and larger predicted return = higher confidence
            confidence = r_squared * min(1.0, abs(avg_predicted_return) * 10)
            
            # Get interpretations
            beta_interpretation = interpret_beta(beta)
            alpha_interpretation = interpret_alpha(alpha)
            
            # Generate a simulated price trend based on current price and predicted returns
            current_price = float(group['ClosePrice'].iloc[-1])
            price_trend = [current_price]
            
            for i in range(days_to_predict):
                next_price = price_trend[-1] * (1 + predicted_returns[i])
                price_trend.append(next_price)
            
            # Add to predictions
            predictions.append({
                'stock_code': f"{market_code}:{ticker}",
                'prediction': prediction,
                'prediction_label': prediction_label,
                'signal': signal,
                'confidence': float(confidence),
                'beta': float(beta),
                'alpha': float(alpha),
                'beta_interpretation': beta_interpretation,
                'alpha_interpretation': alpha_interpretation,
                'r_squared': float(r_squared),
                'avg_predicted_return': float(avg_predicted_return),
                'price_trend': price_trend
            })
            
            # Update overall metrics
            overall_metrics['avg_r_squared'] += r_squared
            overall_metrics['avg_beta'] += beta
            overall_metrics['avg_alpha'] += alpha
            overall_metrics['stocks_analyzed'] += 1
                
        # Calculate averages
        if overall_metrics['stocks_analyzed'] > 0:
            overall_metrics['avg_r_squared'] /= overall_metrics['stocks_analyzed']
            overall_metrics['avg_beta'] /= overall_metrics['stocks_analyzed']
            overall_metrics['avg_alpha'] /= overall_metrics['stocks_analyzed']
        
        # Sort predictions by confidence
        predictions = sorted(predictions, key=lambda x: x['confidence'], reverse=True)
        
        print(f"Completed Market Model analysis with {len(predictions)} predictions for days_ahead={days_to_predict}")
        
        return {
            "success": True,
            "model_metrics": {
                "avg_r_squared": overall_metrics['avg_r_squared'],
                "avg_beta": overall_metrics['avg_beta'],
                "avg_alpha": overall_metrics['avg_alpha'],
                "stocks_analyzed": overall_metrics['stocks_analyzed']
            },
            "predictions": predictions,
            "days_ahead": days_to_predict
        }
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e)
        }

# For backward compatibility, keep the same function name
analyze_stocks_with_svm = analyze_stocks_with_market_model 