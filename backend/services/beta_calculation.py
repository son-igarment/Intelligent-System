import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def calculate_daily_returns(prices):
    """Calculate daily returns from a series of prices"""
    return (prices.astype(float) / prices.astype(float).shift(1) - 1).dropna()

def calculate_beta(stock_returns, market_returns):
    """
    Calculate the Beta coefficient
    
    Beta = Cov(Re, Rm) / Var(Rm)
    
    Re: Stock returns
    Rm: Market returns
    """
    # Calculate covariance between stock and market returns
    covariance = np.cov(stock_returns, market_returns)[0, 1]
    
    # Calculate variance of market returns
    market_variance = np.var(market_returns)
    
    # Calculate beta
    beta = covariance / market_variance
    
    return beta

def get_beta_for_stock(stock_data, market_data, stock_code, date=None, days_to_predict=5):
    """
    Calculate Beta for a specific stock on a given date (or latest available)
    
    Parameters:
    stock_data (DataFrame): Stock price data with columns for Date, Code, Price
    market_data (DataFrame): Market index data with Date and Index value
    stock_code (str): The stock code to calculate Beta for (can be MarketCode, Ticker, or combined)
    date (str, optional): Date in format 'YYYY-MM-DD', defaults to latest
    days_to_predict (int, optional): Number of days to predict ahead, affects Beta calculation window
    
    Returns:
    dict: Beta coefficient and related metrics
    """
    if date is None:
        # Use the latest date in the dataset
        date = max(stock_data['TradeDate'].values, key=lambda d: datetime.strptime(d, '%m/%d/%Y'))

    else:
        # Convert string date to datetime if needed
        if isinstance(date, str):
            date = datetime.strptime(date, '%Y-%m-%d').date()
    
    # Check if stock_code contains both market code and ticker (format: "HNX:VLA")
    if ':' in stock_code:
        market_code, ticker = stock_code.split(':')
        stock_df = stock_data[(stock_data['MarketCode'] == market_code) & 
                             (stock_data['Ticker'] == ticker)].copy()
    else:
        # Check if the stock_code matches a MarketCode
        market_matches = stock_data[stock_data['MarketCode'] == stock_code]
        ticker_matches = stock_data[stock_data['Ticker'] == stock_code]
        
        if not market_matches.empty:
            stock_df = market_matches.copy()
        elif not ticker_matches.empty:
            stock_df = ticker_matches.copy()
        else:
            # If no matches, assume it's a MarketCode
            stock_df = stock_data[stock_data['MarketCode'] == stock_code].copy()
    
    # If no data found for the stock code, return error
    if stock_df.empty:
        return {
            'stock_code': stock_code,
            'date': date if isinstance(date, str) else date.strftime('%Y-%m-%d'),
            'beta': None,
            'error': f'No data found for stock code: {stock_code}'
        }
    
    # Ensure data is sorted by date
    stock_df = stock_df.sort_values('TradeDate')
    market_data = market_data.sort_values('TradeDate')
    
    # Calculate daily returns
    stock_df['Returns'] = calculate_daily_returns(stock_df['ClosePrice'])
    market_data['Returns'] = calculate_daily_returns(market_data['CurrentIndex'])
    
    # Adjust calculation window based on prediction horizon
    if days_to_predict <= 2:  # For short-term predictions (1-2 days)
        days_window = 15  # Use 15 days of data
    elif days_to_predict <= 5:  # For medium-term predictions (3-5 days)
        days_window = 30  # Use 30 days of data
    else:  # For long-term predictions (> 5 days)
        days_window = 60  # Use 60 days of data
    
    # Get data for the specified window from the given date
    end_date = date
    start_date = (datetime.strptime(end_date, '%m/%d/%Y') - timedelta(days=days_window)).strftime('%m/%d/%Y')
    
    stock_period = stock_df[(stock_df['TradeDate'] >= start_date) & (stock_df['TradeDate'] <= end_date)]
    market_period = market_data[(market_data['TradeDate'] >= start_date) & (market_data['TradeDate'] <= end_date)]
    
    # Ensure we have enough data points
    if len(stock_period) < 5 or len(market_period) < 5:
        return {
            'stock_code': stock_code,
            'date': end_date,
            'beta': None,
            'error': 'Insufficient data points for reliable beta calculation'
        }
    
    # Merge data on date to align the returns
    merged_data = pd.merge(
        stock_period[['TradeDate', 'Returns']],
        market_period[['TradeDate', 'Returns']], 
        on='TradeDate', 
        suffixes=('_stock', '_market')
    )
    
    if merged_data.empty or len(merged_data) < 5:
        return {
            'stock_code': stock_code,
            'date': end_date,
            'beta': None,
            'error': 'No overlapping data between stock and market'
        }
    
    # Calculate beta
    beta = calculate_beta(
        merged_data['Returns_stock'].values,
        merged_data['Returns_market'].values
    )
    
    return {
        'stock_code': stock_code,
        'date': end_date,
        'beta': beta,
        'period_start': start_date,
        'period_end': end_date,
        'data_points': len(merged_data),
        'calculation_window': days_window,
        'prediction_horizon': days_to_predict,
        'avg_stock_return': merged_data['Returns_stock'].mean(),
        'avg_market_return': merged_data['Returns_market'].mean(),
        'interpretation': interpret_beta(beta)
    }

def interpret_beta(beta):
    """Provide interpretation of the Beta value"""
    if beta is None:
        return "Unable to calculate Beta"
    elif beta == 0:
        return "The stock's price movements are independent of the market."
    elif beta < 0:
        return "The stock tends to move in the opposite direction of the market."
    elif beta < 0.5:
        return "The stock is much less volatile than the market."
    elif beta < 1:
        return "The stock is less volatile than the market."
    elif beta == 1:
        return "The stock moves in line with the market."
    elif beta < 1.5:
        return "The stock is somewhat more volatile than the market."
    elif beta < 2:
        return "The stock is significantly more volatile than the market."
    else:
        return "The stock is highly volatile compared to the market."

def calculate_all_stock_betas(stock_data, market_data, date=None):
    """
    Calculate Beta for all stocks on a specific date
    
    Parameters:
    stock_data (DataFrame): Stock price data
    market_data (DataFrame): Market index data
    date (str, optional): Date to calculate Beta for, defaults to latest
    
    Returns:
    DataFrame: Beta coefficients for all stocks
    """
    if date is None:
        date = stock_data['TradeDate'].max()
    
    # Check if we have both MarketCode and Ticker columns
    if 'MarketCode' in stock_data.columns and 'Ticker' in stock_data.columns:
        # Get unique combinations of MarketCode and Ticker
        combined_df = stock_data[['MarketCode', 'Ticker']].drop_duplicates()
        
        # Calculate beta for each unique combination
        results = []
        for _, row in combined_df.iterrows():
            market_code = row['MarketCode']
            ticker = row['Ticker']
            combined_code = f"{market_code}:{ticker}"
            
            beta_result = get_beta_for_stock(stock_data, market_data, combined_code, date)
            beta_result['market_code'] = market_code
            beta_result['ticker'] = ticker
            results.append(beta_result)
    else:
        # Fallback to just using MarketCode
        stock_codes = stock_data['MarketCode'].unique()
        
        # Calculate beta for each stock
        results = []
        for code in stock_codes:
            beta_result = get_beta_for_stock(stock_data, market_data, code, date)
            results.append(beta_result)
    
    return pd.DataFrame(results)

def get_beta_portfolio(stock_data, market_data, portfolio, date=None, days_to_predict=5):
    """
    Calculate the Beta for a portfolio of stocks
    
    Parameters:
    stock_data (DataFrame): Stock price data
    market_data (DataFrame): Market index data
    portfolio (dict): Dictionary with stock codes as keys and weights as values
                     (stock codes can be MarketCode, Ticker, or "MarketCode:Ticker")
    date (str, optional): Date to calculate Beta for, defaults to latest
    days_to_predict (int, optional): Number of days to predict ahead, affects Beta calculation window
    
    Returns:
    dict: Portfolio Beta and component Betas
    """
    betas = []
    weights = []
    component_betas = []
    
    for stock_code, weight in portfolio.items():
        beta_result = get_beta_for_stock(stock_data, market_data, stock_code, date, days_to_predict)
        if beta_result['beta'] is not None:
            betas.append(beta_result['beta'])
            weights.append(weight)
            
            # Extract market_code and ticker if it's a combined code
            market_code = None
            ticker = None
            if ':' in stock_code:
                parts = stock_code.split(':')
                if len(parts) == 2:
                    market_code, ticker = parts
            
            component_betas.append({
                'stock_code': stock_code,
                'market_code': market_code,
                'ticker': ticker,
                'weight': weight,
                'beta': beta_result['beta'],
                'weighted_beta': beta_result['beta'] * weight
            })
    
    if not betas:
        return {
            'portfolio_beta': None,
            'error': 'No valid beta values calculated for portfolio components',
            'date': date
        }
    
    # Calculate weighted average beta
    portfolio_beta = sum(b * w for b, w in zip(betas, weights)) / sum(weights)
    
    return {
        'portfolio_beta': portfolio_beta,
        'date': date,
        'component_betas': component_betas,
        'interpretation': interpret_beta(portfolio_beta),
        'prediction_horizon': days_to_predict
    } 