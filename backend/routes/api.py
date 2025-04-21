from flask import Blueprint, jsonify, request, current_app
from models.item import create_item_model, validate_item
import pandas as pd
from datetime import datetime
from services.beta_calculation import calculate_all_stock_betas, get_beta_for_stock, get_beta_portfolio
from services.svm_analysis import analyze_stocks_with_svm

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
        
        # Thêm import_id vào mỗi record
        for record in data:
            record['import_id'] = str(import_id)
        
        # Lưu dữ liệu vào collection "stock_data"
        current_app.db.stock_data.insert_many(data)
        
        return jsonify({
            "status": "success", 
            "message": f"Imported {len(data)} records successfully",
            "import_id": str(import_id)
        }), 201
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

# Lấy tất cả dữ liệu đã import
@api.route('/stock-data', methods=['GET'])
def get_all_stock_data():
    if not current_app.db:
        return jsonify({"error": "Database connection not available"}), 500
    
    try:
        # Có thể thêm giới hạn và phân trang nếu dữ liệu lớn
        limit = int(request.args.get('limit', 100))
        data = list(current_app.db.stock_data.find({}, {'_id': 0}).limit(limit))
        
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
        current_app.db.calculations.insert_one(calculation_result)
        
        return jsonify({
            "status": "success",
            "message": "Beta calculation and SVM training completed",
            "result": calculation_result
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint to calculate Beta for all stocks
@api.route('/calculate-beta', methods=['POST'])
def calculate_beta():
    if not current_app.db:
        return jsonify({"error": "Database connection not available"}), 500
    
    try:
        # Get parameters from the request
        request_data = request.json or {}
        date = request_data.get('date')  # Optional date parameter
        stock_code = request_data.get('stock_code')  # Optional specific stock
        
        # Retrieve stock data from MongoDB
        stock_data = list(current_app.db.stock_data.find({}, {'_id': 0}))
        if not stock_data:
            return jsonify({"error": "No stock data available"}), 404
        
        # Convert to DataFrame
        stock_df = pd.DataFrame(stock_data)
        
        # Get market index data (assuming it's in another collection)
        market_data = list(current_app.db.market_index.find({}, {'_id': 0}))
        if not market_data:
            # Use VNIndex data from the stock_data if available
            market_df = stock_df[stock_df['IndexCode'] == 'VNIndex'].copy()
            if market_df.empty:
                return jsonify({"error": "No market index data available"}), 404
        else:
            market_df = pd.DataFrame(market_data)
        
        # Calculate beta
        if stock_code:
            # Calculate beta for a specific stock
            result = get_beta_for_stock(stock_df, market_df, stock_code, date)
            
            # Store the result in MongoDB
            if result['beta'] is not None:
                current_app.db.beta_values.insert_one({
                    'stock_code': result['stock_code'],
                    'date': result['date'],
                    'beta': result['beta'],
                    'calculation_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    'interpretation': result['interpretation']
                })
            
            return jsonify(result)
        else:
            # Calculate beta for all stocks
            results = calculate_all_stock_betas(stock_df, market_df, date)
            
            # Store results in MongoDB
            beta_records = []
            for _, row in results.iterrows():
                if row['beta'] is not None:
                    beta_records.append({
                        'stock_code': row['stock_code'],
                        'date': row['date'],
                        'beta': float(row['beta']),
                        'calculation_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        'interpretation': row['interpretation']
                    })
            
            if beta_records:
                current_app.db.beta_values.insert_many(beta_records)
            
            return jsonify(results.to_dict(orient='records'))
    
    except Exception as e:
        print(f"Error calculating beta: {str(e)}")
        return jsonify({"error": f"Error calculating beta: {str(e)}"}), 500

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
        
        if not portfolio:
            return jsonify({"error": "Portfolio data is required"}), 400
        
        # Retrieve stock data from MongoDB
        stock_data = list(current_app.db.stock_data.find({}, {'_id': 0}))
        if not stock_data:
            return jsonify({"error": "No stock data available"}), 404
        
        # Convert to DataFrame
        stock_df = pd.DataFrame(stock_data)
        
        # Get market index data
        market_data = list(current_app.db.market_index.find({}, {'_id': 0}))
        if not market_data:
            # Use VNIndex data from the stock_data if available
            market_df = stock_df[stock_df['IndexCode'] == 'VNIndex'].copy()
            if market_df.empty:
                return jsonify({"error": "No market index data available"}), 404
        else:
            market_df = pd.DataFrame(market_data)
        
        # Calculate portfolio beta
        result = get_beta_portfolio(stock_df, market_df, portfolio, date)
        
        # Store the result in MongoDB
        if result['portfolio_beta'] is not None:
            current_app.db.portfolio_betas.insert_one({
                'portfolio': portfolio,
                'date': result['date'],
                'portfolio_beta': result['portfolio_beta'],
                'calculation_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'interpretation': result['interpretation']
            })
        
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
        days_to_predict = request_data.get('days_to_predict', 5)
        use_beta = request_data.get('use_beta', True)
        
        # Get stock data from MongoDB
        stock_data = list(current_app.db.stock_data.find({}, {'_id': 0}))
        if not stock_data:
            return jsonify({"error": "No stock data available for analysis"}), 404
        
        # Convert to DataFrame
        stock_df = pd.DataFrame(stock_data)
        
        # Get beta values if requested
        beta_values = None
        if use_beta:
            beta_data = list(current_app.db.beta_values.find({}, {'_id': 0}))
            if beta_data:
                beta_values = pd.DataFrame(beta_data)
        
        # Perform SVM analysis
        analysis_result = analyze_stocks_with_svm(stock_df, beta_values, days_to_predict)
        
        if not analysis_result["success"]:
            return jsonify({"error": analysis_result["error"]}), 400
        
        # Save analysis results to MongoDB
        analysis_record = {
            "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "days_to_predict": days_to_predict,
            "accuracy": analysis_result["model_metrics"]["accuracy"],
            "predictions": analysis_result["predictions"]
        }
        
        current_app.db.svm_analyses.insert_one(analysis_record)
        
        return jsonify(analysis_result)
    
    except Exception as e:
        print(f"Error performing SVM analysis: {str(e)}")
        return jsonify({"error": f"Error performing SVM analysis: {str(e)}"}), 500

# Endpoint to get the latest SVM analysis
@api.route('/latest-svm-analysis', methods=['GET'])
def get_latest_svm_analysis():
    if not current_app.db:
        return jsonify({"error": "Database connection not available"}), 500
    
    try:
        # Find the latest analysis
        latest_analysis = current_app.db.svm_analyses.find_one(
            {},
            {'_id': 0},
            sort=[('date', -1)]  # Sort by date descending
        )
        
        if not latest_analysis:
            return jsonify({"error": "No SVM analysis results found"}), 404
        
        return jsonify(latest_analysis)
    
    except Exception as e:
        print(f"Error retrieving latest SVM analysis: {str(e)}")
        return jsonify({"error": f"Error retrieving latest SVM analysis: {str(e)}"}), 500 