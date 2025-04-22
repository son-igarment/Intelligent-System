from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import sys
from pathlib import Path
import json
from bson import ObjectId

# Tạo lớp JSONEncoder tùy chỉnh để xử lý ObjectId
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)

# Load environment variables
load_dotenv()

# Thêm thư mục hiện tại vào sys.path để Python tìm thấy các module
sys.path.append(str(Path(__file__).parent))

# Tạo và cấu hình ứng dụng
def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Cấu hình JSONEncoder tùy chỉnh
    app.json_encoder = CustomJSONEncoder
    
    # Kết nối đến MongoDB
    try:
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        client = MongoClient(mongo_uri)
        app.db = client.intelligent_system_db  # Tên database
        # Add a flag to indicate successful connection
        app.db_connected = True
        print("MongoDB connection successful")
    except Exception as e:
        print(f"MongoDB connection error: {e}")
        app.db = None
        app.db_connected = False
    
    # Import các routes
    from routes.api import api
    
    # Đăng ký blueprint
    app.register_blueprint(api, url_prefix='/api')
    
    @app.route('/api/test', methods=['GET'])
    def test_api():
        return jsonify({"message": "API is working correctly"})
    
    @app.route('/api/items', methods=['GET'])
    def get_items():
        if app.db_connected:
            try:
                items = list(app.db.items.find({}, {'_id': 0}))
                return jsonify(items)
            except Exception as e:
                return jsonify({"error": str(e)}), 500
        return jsonify({"error": "Database connection not available"}), 500
    
    @app.route('/api/items', methods=['POST'])
    def create_item():
        if app.db_connected:
            try:
                new_item = request.json
                app.db.items.insert_one(new_item)
                return jsonify({"status": "success", "item": new_item}), 201
            except Exception as e:
                return jsonify({"error": str(e)}), 500
        return jsonify({"error": "Database connection not available"}), 500
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True,host="0.0.0.0", port=5000)