import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def calculate_daily_returns(prices):
    """Calculate daily returns from a series of prices"""
    return (prices / prices.shift(1) - 1).dropna()

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

def get_beta_for_stock(stock_data, market_data, stock_code, date=None):
    """
    Calculate Beta for a specific stock on a given date (or latest available)
    
    Parameters:
    stock_data (DataFrame): Stock price data with columns for Date, Code, Price
    market_data (DataFrame): Market index data with Date and Index value
    stock_code (str): The stock code to calculate Beta for
    date (str, optional): Date in format 'YYYY-MM-DD', defaults to latest
    
    Returns:
    dict: Beta coefficient and related metrics
    """
    if date is None:
        # Use the latest date in the dataset
        date = stock_data['TradeDate'].max()
    else:
        # Convert string date to datetime if needed
        if isinstance(date, str):
            date = datetime.strptime(date, '%Y-%m-%d').date()
    
    # Filter data for the specific stock
    stock_df = stock_data[stock_data['MarketCode'] == stock_code].copy()
    
    # Ensure data is sorted by date
    stock_df = stock_df.sort_values('TradeDate')
    market_data = market_data.sort_values('TradeDate')
    
    # Calculate daily returns
    stock_df['Returns'] = calculate_daily_returns(stock_df['CurrentIndex'])
    market_data['Returns'] = calculate_daily_returns(market_data['BasicIndex'])
    
    # Get data for the last 30 days from the given date for more stable beta
    end_date = date
    start_date = (datetime.strptime(end_date, '%Y-%m-%d') - timedelta(days=30)).strftime('%Y-%m-%d')
    
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
    
    # Get unique stock codes
    stock_codes = stock_data['MarketCode'].unique()
    
    # Calculate beta for each stock
    results = []
    for code in stock_codes:
        beta_result = get_beta_for_stock(stock_data, market_data, code, date)
        results.append(beta_result)
    
    return pd.DataFrame(results)

def get_beta_portfolio(stock_data, market_data, portfolio, date=None):
    """
    Calculate the Beta for a portfolio of stocks
    
    Parameters:
    stock_data (DataFrame): Stock price data
    market_data (DataFrame): Market index data
    portfolio (dict): Dictionary with stock codes as keys and weights as values
    date (str, optional): Date to calculate Beta for, defaults to latest
    
    Returns:
    dict: Portfolio Beta and component Betas
    """
    betas = []
    weights = []
    component_betas = []
    
    for stock_code, weight in portfolio.items():
        beta_result = get_beta_for_stock(stock_data, market_data, stock_code, date)
        if beta_result['beta'] is not None:
            betas.append(beta_result['beta'])
            weights.append(weight)
            component_betas.append({
                'stock_code': stock_code,
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
        'interpretation': interpret_beta(portfolio_beta)
    } 