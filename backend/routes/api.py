import base64

import numpy as np
from flask import Blueprint, jsonify, request, current_app
from models.item import create_item_model, validate_item
import pandas as pd
from datetime import datetime
from services.beta_calculation import calculate_all_stock_betas, get_beta_for_stock, get_beta_portfolio
from services.svm_analysis import analyze_stocks_with_svm, plot_confusion_matrix, plot_confidence_distribution

api = Blueprint('api', __name__)

@api.route('/test-connection', methods=['GET'])
def test_connection():
    """Simple endpoint to test API connectivity without MongoDB"""
    return jsonify({
        "status": "success",
        "message": "API is working correctly",
        "mock_data": [
            {"id": 1, "name": "Test Item 1"},
            {"id": 2, "name": "Test Item 2"}
        ]
    })

@api.route('/items', methods=['GET'])
def get_items():
    if not current_app.db_connected:
        return jsonify({"error": "Database connection not available"}), 500
    
    try:
        items = list(current_app.db.items.find({}, {'_id': 0}))
        return jsonify(items)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/items/<string:name>', methods=['GET'])
def get_item(name):
    if not current_app.db:
        return jsonify({"error": "Database connection not available"}), 500
    
    try:
        item = current_app.db.items.find_one({"name": name}, {'_id': 0})
        if not item:
            return jsonify({"error": "Item not found"}), 404
        return jsonify(item)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/items', methods=['POST'])
def create_item():
    if not current_app.db:
        return jsonify({"error": "Database connection not available"}), 500
    
    try:
        item_data = request.json
        is_valid, errors = validate_item(item_data)
        
        if not is_valid:
            return jsonify({"error": "Validation failed", "details": errors}), 400
        
        new_item = create_item_model(
            name=item_data.get('name'),
            description=item_data.get('description'),
            price=item_data.get('price')
        )
        
        result = current_app.db.items.insert_one(new_item)
        # Remove MongoDB ObjectId before returning
        new_item.pop('_id', None)
        
        return jsonify({"status": "success", "item": new_item}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint mới để nhận dữ liệu import
@api.route('/import-data', methods=['POST'])
def import_data():
    if not current_app.db:
        return jsonify({"error": "Database connection not available"}), 500
    
    try:
        # Nhận dữ liệu từ frontend
        data = request.json.get('data', [])
        
        if not data or not isinstance(data, list):
            return jsonify({"error": "No valid data provided"}), 400
        
        # Thêm metadata
        import_info = {
            "import_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "records_count": len(data)
        }
        
        # Lưu thông tin import
        import_id = current_app.db.imports.insert_one(import_info).inserted_id
        import_id_str = str(import_id)
        
        # Thêm import_id vào mỗi record
        for record in data:
            record['import_id'] = import_id_str

            # Chuyển đổi ngày từ chuỗi sang định dạng ngày nếu cần
            if 'TradeDate' in record and isinstance(record['TradeDate'], str):
                try:
                    # Thử các định dạng ngày tháng phổ biến
                    for date_format in ['%Y-%m-%d', '%Y/%m/%d', '%m/%d/%Y', '%d/%m/%Y']:
                        try:
                            date_obj = datetime.strptime(record['TradeDate'], date_format)
                            record['TradeDate'] = date_obj.strftime('%Y-%m-%d')
                            break
                        except ValueError:
                            continue
                except Exception:
                    # Nếu không thể chuyển đổi, giữ nguyên giá trị
                    pass
        
        # Lưu dữ liệu vào collection "stock_data"
        current_app.db.stock_data.insert_many(data)
        
        return jsonify({
            "status": "success", 
            "message": f"Imported {len(data)} records successfully",
            "import_id": import_id_str
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint mới để nhận dữ liệu chỉ số thị trường (Market Index)
@api.route('/import-market-index', methods=['POST'])
def import_market_index():
    if not current_app.db:
        return jsonify({"error": "Database connection not available"}), 500
    
    try:
        # Nhận dữ liệu từ frontend
        data = request.json.get('data', [])
        
        if not data or not isinstance(data, list):
            return jsonify({"error": "No valid market index data provided"}), 400
        
        # Thêm metadata
        import_info = {
            "import_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "records_count": len(data),
            "type": "market_index"
        }
        
        # Lưu thông tin import
        import_id = current_app.db.market_index_imports.insert_one(import_info).inserted_id
        import_id_str = str(import_id)
        
        # Thêm import_id vào mỗi record và xử lý dữ liệu
        for record in data:
            record['import_id'] = import_id_str
            
            # Chuyển đổi các trường dữ liệu từ chuỗi thành số nếu cần
            for field in ['OpenIndex', 'HighestIndex', 'LowestIndex', 'CloseIndex', 'TotalVolume', 'TotalValue']:
                if field in record and isinstance(record[field], str):
                    try:
                        # Xử lý các chuỗi số có thể có dấu phẩy hoặc các ký tự đặc biệt
                        clean_value = record[field].replace(',', '')
                        record[field] = float(clean_value)
                    except (ValueError, TypeError):
                        # Nếu không thể chuyển đổi, giữ nguyên giá trị
                        pass

            # Chuyển đổi ngày từ chuỗi sang định dạng ngày nếu cần
            if 'TradeDate' in record and isinstance(record['TradeDate'], str):
                try:
                    # Thử các định dạng ngày tháng phổ biến
                    for date_format in ['%Y-%m-%d', '%Y/%m/%d', '%m/%d/%Y', '%d/%m/%Y']:
                        try:
                            date_obj = datetime.strptime(record['TradeDate'], date_format)
                            record['TradeDate'] = date_obj.strftime('%Y-%m-%d')
                            break
                        except ValueError:
                            continue
                except Exception:
                    # Nếu không thể chuyển đổi, giữ nguyên giá trị
                    pass
        
        # Lưu dữ liệu vào collection "market_index_data"
        current_app.db.market_index_data.insert_many(data)
        
        return jsonify({
            "status": "success", 
            "message": f"Imported {len(data)} market index records successfully",
            "import_id": import_id_str
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Lấy danh sách dữ liệu chỉ số thị trường
@api.route('/market-index-data', methods=['GET'])
def get_market_index_data():
    if not current_app.db:
        return jsonify({"error": "Database connection not available"}), 500
    
    try:
        # Có thể thêm tham số để lọc và phân trang
        limit = int(request.args.get('limit', 100))
        data = list(current_app.db.market_index_data.find({}, {'_id': 0}).limit(limit))
        
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Lấy danh sách các lần import
@api.route('/imports', methods=['GET'])
def get_imports():
    if not current_app.db:
        return jsonify({"error": "Database connection not available"}), 500
    
    try:
        imports = list(current_app.db.imports.find({}, {'_id': 1, 'import_date': 1, 'records_count': 1}))
        # Chuyển đổi ObjectId thành string
        for imp in imports:
            imp['_id'] = str(imp['_id'])
        
        return jsonify(imports)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Lấy dữ liệu đã import theo import_id
@api.route('/import-data/<string:import_id>', methods=['GET'])
def get_import_data(import_id):
    if not current_app.db:
        return jsonify({"error": "Database connection not available"}), 500
    
    try:
        data = list(current_app.db.stock_data.find({'import_id': import_id}, {'_id': 0}))
        if not data:
            return jsonify({"error": "No data found for this import ID"}), 404
        
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/market-code', methods=['GET'])
def get_all_market_code():
    if not current_app.db:
        return jsonify({"error": "Database connection not available"}), 500

    try:
        # Có thể thêm giới hạn và phân trang nếu dữ liệu lớn
        # limit = int(request.args.get('limit', 100))

        data = list(current_app.db.stock_data.find({}, {'_id': 0}))

        result = list(set(d.get('MarketCode') for d in data))
        result.sort()

        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/ticker', methods=['GET'])
def get_all_ticker():
    if not current_app.db:
        return jsonify({"error": "Database connection not available"}), 500

    args = request.args
    market_code = args['market_code']  # Market code (HNX, HOSE)

    if not market_code:
        return jsonify({"error": "Market code is required"}), 400

    try:
        # Có thể thêm giới hạn và phân trang nếu dữ liệu lớn
        # limit = int(request.args.get('limit', 100))

        data = list(current_app.db.stock_data.find({'MarketCode': market_code}, {'_id': 0}))

        result = list(set(d.get('Ticker') for d in data))
        result.sort()

        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Lấy tất cả dữ liệu đã import
@api.route('/stock-data', methods=['GET'])
def get_all_stock_data():
    if not current_app.db:
        return jsonify({"error": "Database connection not available"}), 500
    
    try:
        # Có thể thêm giới hạn và phân trang nếu dữ liệu lớn
        limit = int(request.args.get('limit', 100))

        data = list(current_app.db.stock_data.find({}, {'_id': 0}))
        
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint để tính toán Beta và train SVM
@api.route('/calculate', methods=['POST'])
def calculate_beta_and_train_svm():
    if not current_app.db:
        return jsonify({"error": "Database connection not available"}), 500
    
    try:
        import_id = request.json.get('import_id')
        
        # Tìm dữ liệu dựa trên import_id
        if import_id:
            data = list(current_app.db.stock_data.find({'import_id': import_id}, {'_id': 0}))
        else:
            # Hoặc lấy dữ liệu mới nhất nếu không có import_id
            data = list(current_app.db.stock_data.find({}, {'_id': 0}).sort([('_id', -1)]).limit(1000))
        
        if not data:
            return jsonify({"error": "No data found for calculation"}), 404
        
        # Trong thực tế, ở đây sẽ gọi hàm tính Beta và train SVM
        # Mô phỏng kết quả tính toán
        calculation_result = {
            "calculation_id": datetime.now().strftime("%Y%m%d%H%M%S"),
            "calculation_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "data_count": len(data),
            "beta_values": {
                "stock1": 1.25,
                "stock2": 0.85,
                "stock3": 1.05
            },
            "svm_model": {
                "accuracy": 0.92,
                "precision": 0.89,
                "recall": 0.93
            }
        }
        
        # Lưu kết quả tính toán
        result = current_app.db.calculations.insert_one(calculation_result)
        # Chuyển đổi ObjectId thành string
        calculation_result["_id"] = str(result.inserted_id)
        
        return jsonify({
            "status": "success",
            "message": "Beta calculation and SVM training completed",
            "result": calculation_result
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_beta(market_code, ticker, days_to_predict = 5):
    try:
        # Retrieve stock data from MongoDB
        stock_data = list(current_app.db.stock_data.find({'MarketCode': market_code, 'Ticker': ticker}, {'_id': 0}))
        if not stock_data:
            return jsonify({"error": "No stock data available"}), 404

        # Convert to DataFrame
        stock_df = pd.DataFrame(stock_data)

        # Normalize index codes - handle different naming conventions
        # Map HSX or HOSE to VNIndex, HNX to HNXIndex
        code_mapping = {
            'HSX': 'VNINDEX',
            'HOSE': 'VNINDEX',
            'HNX': 'HNXIndex',
            'UPCOM': 'UpcomIndex',
            'Upcom': 'UpcomIndex',
        }

        # Get market index data from market_index_data collection
        mc = "HSX" if market_code == "HOSE" else market_code
        market_data = list(current_app.db.market_index_data.find({'MarketCode': mc, 'IndexCode': code_mapping[mc]}, {'_id': 0}))

        # Convert to DataFrame
        market_df = pd.DataFrame(market_data)

        if 'IndexCode' in market_df.columns:
            market_df['IndexCode'] = market_df['IndexCode'].apply(
                lambda x: code_mapping.get(x, x) if isinstance(x, str) else x
            )

        # Determine what we're calculating beta for
        calculate_for = None
        if ticker and market_code:
            calculate_for = f"{market_code}:{ticker}"

        # Calculate beta for a specific stock with days_to_predict parameter
        result = get_beta_for_stock(stock_df, market_df, calculate_for, days_to_predict)

        # Store the result in MongoDB
        if result['beta'] is not None:
            beta_record = {
                'stock_code': result['stock_code'],
                'market_code': market_code,
                'ticker': ticker,
                'date': result['date'],
                'beta': result['beta'],
                'calculation_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'interpretation': result['interpretation'],
                'prediction_horizon': days_to_predict
            }
            # Remove existing beta record if it exists
            current_app.db.beta_values.delete_one({'stock_code': calculate_for, 'market_code': market_code, 'ticker': ticker})

            # Insert new beta record
            insert_result = current_app.db.beta_values.insert_one(beta_record)
            result['_id'] = str(insert_result.inserted_id)

        return jsonify(result)

    except Exception as e:
        print(f"Error calculating beta: {str(e)}")
        return jsonify({"error": f"Error calculating beta: {str(e)}"}), 500

# Endpoint to calculate Beta for all stocks
@api.route('/calculate-beta', methods=['POST'])
def calculate_beta():
    if not current_app.db:
        return jsonify({"error": "Database connection not available"}), 500

    # Get parameters from the request
    request_data = request.json or {}
    market_code = request_data.get('market_code')  # Market code (HNX, HOSE)
    ticker = request_data.get('ticker')  # Stock ticker (VLA, MCF, etc.)
    days_to_predict = request_data.get('days_to_predict', 5)  # Default to 5 days

    if not market_code or not ticker:
        return jsonify({"error": "Market code and ticker are required"}), 400

    # Retrieve stock data from MongoDB
    return get_beta(market_code, ticker, days_to_predict)

# Endpoint to get Beta for a portfolio
@api.route('/calculate-portfolio-beta', methods=['POST'])
def calculate_portfolio_beta():
    if not current_app.db:
        return jsonify({"error": "Database connection not available"}), 500
    
    try:
        # Get parameters from the request
        request_data = request.json or {}
        portfolio = request_data.get('portfolio', {})  # Dict of stock_code: weight
        date = request_data.get('date')  # Optional date parameter
        market_code = request_data.get('market_code')  # Optional market code parameter
        ticker = request_data.get('ticker')  # Optional ticker parameter
        days_to_predict = request_data.get('days_to_predict', 5)  # Default to 5 days
        
        if not portfolio:
            return jsonify({"error": "Portfolio data is required"}), 400
        
        # Retrieve stock data from MongoDB
        stock_data = list(current_app.db.stock_data.find({}, {'_id': 0}))
        if not stock_data:
            return jsonify({"error": "No stock data available"}), 404
        
        # Convert to DataFrame
        stock_df = pd.DataFrame(stock_data)
        
        # Thêm phần để tính tickerticker
        # Filter stock data if market_code and/or ticker provided
        if market_code and ticker:
            filtered_stock_df = stock_df[(stock_df['MarketCode'] == market_code) & (stock_df['Ticker'] == ticker)]
            if not filtered_stock_df.empty:
                stock_df = filtered_stock_df
        elif market_code:
            filtered_stock_df = stock_df[stock_df['MarketCode'] == market_code]
            if not filtered_stock_df.empty:
                stock_df = filtered_stock_df
        elif ticker:
            filtered_stock_df = stock_df[stock_df['Ticker'] == ticker]
            if not filtered_stock_df.empty:
                stock_df = filtered_stock_df
        
        # Get market index data from market_index_data collection
        market_data = list(current_app.db.market_index_data.find({}, {'_id': 0}))
        
        if market_data:
            # Convert to DataFrame
            market_df = pd.DataFrame(market_data)
            
            # Normalize index codes - handle different naming conventions
            # Map HSX or HOSE to VNIndex, HNX to HNXIndex
            code_mapping = {
                'HSX': 'VNIndex',
                'HOSE': 'VNIndex',
                'HNX': 'HNXIndex'
            }
            
            if 'IndexCode' in market_df.columns:
                market_df['IndexCode'] = market_df['IndexCode'].apply(
                    lambda x: code_mapping.get(x, x) if isinstance(x, str) else x
                )
            
            # Make sure we use the right column names
            # If the market data has different column names, map them to expected names
            if 'TradeDate' in market_df.columns and 'Date' not in market_df.columns:
                market_df['Date'] = market_df['TradeDate']
            
            if 'CloseIndex' in market_df.columns and 'Close' not in market_df.columns:
                market_df['Close'] = market_df['CloseIndex']
                
        else:
            # No market_index_data, try to use VNIndex from stock_data as fallback
            market_df = stock_df[stock_df['IndexCode'] == 'VNIndex'].copy()
            
            if market_df.empty:
                # Also try with alternate names
                for alt_code in ['HOSE', 'HSX']:
                    market_df = stock_df[stock_df['IndexCode'] == alt_code].copy()
                    if not market_df.empty:
                        # Rename the IndexCode to VNIndex for consistency
                        market_df['IndexCode'] = 'VNIndex'
                        break
                        
            if market_df.empty:
                return jsonify({"error": "No market index data available. Please import VNIndex data first."}), 404
        
        # If market_code and ticker are provided, update portfolio keys to use combined format
        if market_code and ticker and len(portfolio) > 0:
            updated_portfolio = {}
            for code, weight in portfolio.items():
                # If the code doesn't already have market_code included, add it
                if ':' not in code:
                    updated_portfolio[f"{market_code}:{code}"] = weight
                else:
                    updated_portfolio[code] = weight
            portfolio = updated_portfolio
        
        # Calculate portfolio beta with days_to_predict parameter
        result = get_beta_portfolio(stock_df, market_df, portfolio, date, days_to_predict)
        
        # Store the result in MongoDB
        if result['portfolio_beta'] is not None:
            portfolio_record = {
                'portfolio': portfolio,
                'date': result['date'],
                'portfolio_beta': result['portfolio_beta'],
                'market_code': market_code,
                'ticker': ticker,
                'calculation_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'interpretation': result['interpretation'],
                'prediction_horizon': days_to_predict
            }
            insert_result = current_app.db.portfolio_betas.insert_one(portfolio_record)
            result['_id'] = str(insert_result.inserted_id)
        
        return jsonify(result)
    
    except Exception as e:
        print(f"Error calculating portfolio beta: {str(e)}")
        return jsonify({"error": f"Error calculating portfolio beta: {str(e)}"}), 500

# Endpoint for SVM analysis
@api.route('/svm-analysis', methods=['POST'])
def svm_analysis():
    if not current_app.db:
        return jsonify({"error": "Database connection not available"}), 500
    
    try:
        # Get parameters from request
        request_data = request.json or {}
        days_to_predict = request_data.get('days_to_predict', 5)  # Default to 5 days
        market_code = request_data.get('market_code')
        ticker = request_data.get('ticker')

        if not market_code or not ticker:
            return jsonify({"error": "Market code and ticker are required"}), 400
        
        # Get stock data from MongoDB
        stock_data = list(current_app.db.stock_data.find({'MarketCode': market_code, 'Ticker': ticker}, {'_id': 0}))
        if not stock_data:
            return jsonify({"error": "No stock data available for analysis"}), 404
        
        # Convert to DataFrame
        stock_df = pd.DataFrame(stock_data)

        # Get beta values if requested
        beta_values = None

        # Lấy giá trị beta phù hợp với khoảng thời gian dự đoán
        beta_data = list(current_app.db.beta_values.find({'market_code': market_code, 'ticker': ticker},{'_id': 0}))

        # Nếu không có beta values phù hợp với khoảng thời gian, tính toán mới
        if not beta_data:
            get_beta(market_code, ticker, days_to_predict)
            beta_data = list(current_app.db.beta_values.find(
                {'prediction_horizon': days_to_predict},
                {'_id': 0}
            ))

        # Chuyển đổi thành DataFrame
        if beta_data:
            beta_values = pd.DataFrame(beta_data)

        # Perform SVM analysis with market_code and ticker
        analysis_result = analyze_stocks_with_svm(stock_df, beta_values, days_to_predict)
        
        if not analysis_result["success"]:
            return jsonify({"error": analysis_result["error"]}), 400
        
        # Save analysis results to MongoDB
        analysis_record = {
            "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "days_to_predict": days_to_predict,
            "accuracy": analysis_result["model_metrics"]["accuracy"],
            "report": analysis_result["model_metrics"]["report"],
            "confusion_matrix": analysis_result["model_metrics"]["confusion_matrix"],
            "predictions": analysis_result["predictions"],
            "market_code": market_code,
            "ticker": ticker
        }

        # Remove existing analysis record if it exists
        current_app.db.svm_analyses.delete_one({'market_code': market_code, 'ticker': ticker})

        # Insert new analysis record
        current_app.db.svm_analyses.insert_one(analysis_record)
        
        return jsonify(analysis_result)
    
    except Exception as e:
        print(f"Error performing SVM analysis: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Error performing SVM analysis: {str(e)}"}), 500

# Endpoint to get the latest SVM analysis
@api.route('/latest-svm-analysis', methods=['GET'])
def get_latest_svm_analysis():
    if not current_app.db:
        return jsonify({"error": "Database connection not available"}), 500
    
    try:
        args = request.args

        # Get filter parameters from query
        market_code = args.get('market_code')
        ticker = args.get('ticker')

        latest_analysis = {}

        if not market_code or not ticker:
            return jsonify(latest_analysis)
        
        # Build filter query
        filter_query = {}
        if market_code:
            filter_query['market_code'] = market_code
        if ticker:
            filter_query['ticker'] = ticker
            
        # Find the latest analysis matching filter criteria
        latest_analysis = current_app.db.svm_analyses.find_one(
            filter_query,
            {'_id': 0},
            sort=[('date', -1)]  # Sort by date descending
        )
        
        if not latest_analysis:
            return jsonify({"error": "No SVM analysis results found"}), 404
        
        return jsonify(latest_analysis)
    
    except Exception as e:
        print(f"Error retrieving latest SVM analysis: {str(e)}")
        return jsonify({"error": f"Error retrieving latest SVM analysis: {str(e)}"}), 500

# Endpoint to get stock data with calculations and beta values
@api.route('/stock-data-with-beta', methods=['GET'])
def get_stock_data_with_beta():
    if not current_app.db:
        return jsonify({"error": "Database connection not available"}), 500
    
    try:

        # Get parameters from the request
        args = request.args
        market_code = args['market_code']  # Market code (HNX, HOSE)

        if not market_code:
            return jsonify({"error": "Market code are required"}), 400

        # Get stock data
        stock_data = list(current_app.db.stock_data.find({'MarketCode': market_code}, {'_id': 0}))
        if not stock_data:
            return jsonify({"error": "No stock data available"}), 404
        
        # Get beta values
        beta_values = list(current_app.db.beta_values.find({'market_code': market_code}, {'_id': 0}))

        stock_df = pd.DataFrame(stock_data)
        date = max(stock_df['TradeDate'].values, key=lambda d: datetime.strptime(d, '%Y-%m-%d'))
        # stock_period = stock_data[stock_data['TradeDate'] == date]

        # Process stock data
        result = []
        for stock in stock_data:
            if 'MarketCode' not in stock or 'Ticker' not in stock:
                continue

            market_code = stock.get('MarketCode')
            ticker = stock.get('Ticker')
            stock_date = stock.get('TradeDate')
            if any(market_code in beta.values() and ticker in beta.values() for beta in beta_values) and stock_date == date:
                # Extract basic fields
                close_price = float(stock.get('ClosePrice', 0))
                total_volume = float(stock.get('TotalVolume', 0))
                open_price = float(stock.get('OpenPrice', 0))

                # Calculate derived fields
                current_price = close_price
                profit_loss = current_price - open_price
                profit_loss_percent = 0
                if open_price > 0:
                    profit_loss_percent = (profit_loss / open_price) * 100

                # Prepare stock entry
                stock_entry = {
                    'MarketCode': market_code,
                    'Ticker': ticker,
                    'ClosePrice': close_price,
                    'TotalVolume': total_volume,
                    'OpenPrice': open_price,
                    'CurrentPrice': current_price,
                    'ProfitLoss': profit_loss,
                    'ProfitLossPercent': profit_loss_percent
                }

                # Add beta and risk information if available
                key = f"{market_code}:{ticker}"
                if any(key in beta.values() for beta in beta_values):
                    for beta in beta_values:
                        if key in beta.values():
                            beta_value = beta.get('beta')
                            stock_entry['beta'] = beta_value

                            # Determine risk based on beta value
                            if beta_value is not None:
                                if beta_value == 1:
                                    stock_entry['risk'] = 'medium'
                                else:  # beta > 1 or beta < 1
                                    stock_entry['risk'] = 'high'
                            else:
                                stock_entry['risk'] = 'unknown'
                else:
                    stock_entry['beta'] = None
                    stock_entry['risk'] = 'unknown'

                result.append(stock_entry)
        
        return jsonify(result)
    
    except Exception as e:
        print(f"Error getting stock data with beta: {str(e)}")
        return jsonify({"error": f"Error getting stock data with beta: {str(e)}"}), 500

# Endpoint to get stock data with calculations
@api.route('/stock-data-asset', methods=['GET'])
def get_stock_data_asset():
    if not current_app.db:
        return jsonify({"error": "Database connection not available"}), 500

    try:

        # Get parameters from the request
        args = request.args
        market_code = args['market_code']  # Market code (HNX, HOSE)

        if not market_code:
            return jsonify({"error": "Market code are required"}), 400

        # Get stock data
        stock_data = list(current_app.db.stock_data.find({'MarketCode': market_code}, {'_id': 0}))
        if not stock_data:
            return jsonify({"error": "No stock data available"}), 404


        stock_df = pd.DataFrame(stock_data)
        date = max(stock_df['TradeDate'].values, key=lambda d: datetime.strptime(d, '%Y-%m-%d'))
        # stock_period = stock_data[stock_data['TradeDate'] == date]

        # Process stock data
        nav_close_price = 0
        nav_total_volume = 0
        nav_open_price = 0
        nav_current_price = 0
        nav_profit_loss = 0
        nav_profit_loss_percent = 0
        nav_weight = 0
        result = []
        for stock in stock_data:
            if 'MarketCode' not in stock or 'Ticker' not in stock:
                continue

            market_code = stock.get('MarketCode')
            ticker = stock.get('Ticker')
            stock_date = stock.get('TradeDate')

            if stock_date != date:
                continue

            # Extract basic fields
            close_price = float(stock.get('ClosePrice', 0))
            nav_close_price += close_price
            total_volume = float(stock.get('TotalVolume', 0))
            nav_total_volume += total_volume
            open_price = float(stock.get('OpenPrice', 0))
            nav_open_price += open_price

            # Calculate derived fields
            current_price = close_price
            nav_current_price += current_price
            profit_loss = current_price - open_price
            nav_profit_loss += profit_loss
            profit_loss_percent = 0
            if open_price > 0:
                profit_loss_percent = (profit_loss / open_price) * 100
            nav_profit_loss_percent += profit_loss_percent


            # Prepare stock entry
            stock_entry = {
                'MarketCode': market_code,
                'Ticker': ticker,
                'ClosePrice': close_price,
                'TotalVolume': total_volume,
                'OpenPrice': open_price,
                'CurrentPrice': current_price,
                'ProfitLoss': profit_loss,
                'ProfitLossPercent': profit_loss_percent
            }

            result.append(stock_entry)

        nav_entry = {
            'MarketCode': market_code,
            'Ticker': 'NAV',
            'ClosePrice': nav_close_price,
            'TotalVolume': nav_total_volume,
            'OpenPrice': nav_open_price,
            'CurrentPrice': nav_current_price,
            'ProfitLoss': nav_profit_loss,
            'ProfitLossPercent': nav_profit_loss_percent
        }
        result.append(nav_entry)

        # Calculate Weight
        for stock in result:
            if stock['Ticker'] == 'NAV':
                stock['Weight'] = 100
            else:
                stock['Weight'] = (stock['CurrentPrice'] / nav_current_price) * 100

        return jsonify(result)

    except Exception as e:
        print(f"Error getting stock data with beta: {str(e)}")
        return jsonify({"error": f"Error getting stock data with beta: {str(e)}"}), 500

@api.route('/data-analysis', methods=['POST'])
def data_analysis():
    if not current_app.db:
        return jsonify({"error": "Database connection not available"}), 500

    try:
        # Get parameters from request
        request_data = request.json or {}
        market_code = request_data.get('market_code')
        tickers = request_data.get('ticker')

        if not market_code or not tickers or len(tickers) == 0:
            return jsonify({"error": "Market code and ticker are required"}), 400

        # Get stock data from MongoDB
        stock_data = list(current_app.db.stock_data.find({'MarketCode': market_code}, {'_id': 0}))
        if not stock_data:
            return jsonify({"error": "No stock data available for analysis"}), 404

        stock_filter = list()
        for ticker in tickers:
            for stock in stock_data:
                if stock['Ticker'] == ticker:
                    stock_filter.append(stock)

        stock_df = pd.DataFrame(stock_filter)

        # Normalize index codes - handle different naming conventions
        # Map HSX or HOSE to VNIndex, HNX to HNXIndex
        code_mapping = {
            'HSX': 'VNINDEX',
            'HOSE': 'VNINDEX',
            'HNX': 'HNXIndex',
            'UPCOM': 'UpcomIndex',
            'Upcom': 'UpcomIndex',
        }

        mc = "HSX" if market_code == "HOSE" else market_code
        market_data = list(current_app.db.market_index_data.find({'MarketCode': mc, 'IndexCode': code_mapping[mc]}, {'_id': 0}))

        # Convert to DataFrame
        market_df = pd.DataFrame(market_data)

        # Lấy giá trị beta phù hợp với khoảng thời gian dự đoán
        beta_values = calculate_all_stock_betas(stock_df, market_df, days_to_predict=10)

        analysis_result = analyze_stocks_with_svm(stock_df, beta_values, days_to_predict=5)

        cm = np.array(analysis_result['model_metrics']['confusion_matrix'])
        plot_confusion_matrix(cm)

        plot_confidence_distribution(analysis_result['predictions'])

        with open("confusion_matrix.png", "rb") as image_file:
            confusion_matrix_encoded_string = base64.b64encode(image_file.read()).decode('utf-8')

        with open("confidence_distribution.png", "rb") as image_file:
            confidence_distribution_encoded_string = base64.b64encode(image_file.read()).decode('utf-8')

        return_result = {
            "confusion_matrix": confusion_matrix_encoded_string,
            "confidence_distribution": confidence_distribution_encoded_string,
            "data": analysis_result
        }

        return jsonify(return_result)

    except Exception as e:
        print(f"Error performing SVM analysis: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Error performing SVM analysis: {str(e)}"}), 500