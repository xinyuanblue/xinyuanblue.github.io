# app.py
import os
from flask import Flask, request, jsonify
import requests
from dotenv import load_dotenv
from flask_cors import CORS # Import Flask-Cors

load_dotenv() # Load environment variables from .env file

app = Flask(__name__)

# === CORS Configuration ===
# Define allowed origins (replace with your frontend URLs)
allowed_origins = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://heluoshuyuan.cn", # Your production frontend
    "http://192.168.137.178:8000" 
]
CORS(app, origins=allowed_origins, supports_credentials=True) # Enable CORS for allowed origins

MAPBOX_ACCESS_TOKEN = os.getenv('MAPBOX_ACCESS_TOKEN')

if not MAPBOX_ACCESS_TOKEN:
    print('错误：Mapbox Access Token 未在 .env 文件中设置！')
    exit(1)

@app.route('/api/isochrone', methods=['GET'])
def isochrone_proxy():
    lng = request.args.get('lng')
    lat = request.args.get('lat')
    minutes = request.args.get('minutes', '15') # Default to 15
    profile = request.args.get('profile', 'walking') # Default to walking

    # --- Input Validation ---
    try:
        lng_float = float(lng)
        lat_float = float(lat)
        minutes_int = int(minutes)
        if not (1 <= minutes_int <= 60):
            raise ValueError("Minutes out of range")
        if profile not in ['walking', 'cycling', 'driving']:
             raise ValueError("Invalid profile")
    except (TypeError, ValueError, AttributeError) as e:
         print(f"输入验证错误: {e}")
         return jsonify({"error": "无效的输入参数(lng, lat, minutes, profile)。"}), 400
    # --- End Validation ---

    mapbox_url = f"https://api.mapbox.com/isochrone/v1/mapbox/{profile}/{lng_float},{lat_float}"
    params = {
        'contours_minutes': minutes_int,
        'polygons': 'true',
        'access_token': MAPBOX_ACCESS_TOKEN
    }

    print(f"收到代理请求: {request.url}")
    print(f"转发到 Mapbox: {mapbox_url} (参数: {params})")

    try:
        response = requests.get(mapbox_url, params=params, timeout=10) # 10 second timeout
        response.raise_for_status() # Raises an HTTPError for bad responses (4xx or 5xx)

        print(f"Mapbox 响应状态: {response.status_code}")
        # Forward the successful response (GeoJSON data)
        return jsonify(response.json())

    except requests.exceptions.Timeout:
        print("请求 Mapbox 超时")
        return jsonify({"error": "请求 Mapbox 超时。"}), 504 # Gateway Timeout
    except requests.exceptions.HTTPError as e:
         print(f"Mapbox API HTTP 错误: {e.response.status_code}")
         try:
             error_details = e.response.json().get('message', '无法获取等时圈数据')
         except ValueError: # Handle cases where error response is not JSON
             error_details = e.response.text
         return jsonify({
             "error": f"Mapbox API 错误 (状态码: {e.response.status_code})",
             "details": error_details
             }), e.response.status_code
    except requests.exceptions.RequestException as e:
        # Catch other potential request errors (DNS failure, connection error etc.)
        print(f"请求 Mapbox 时出错: {e}")
        return jsonify({"error": "连接 Mapbox 时出错。"}), 502 # Bad Gateway
    except Exception as e:
        print(f"代理服务器内部错误: {e}")
        return jsonify({"error": "代理服务器内部错误。"}), 500


@app.route('/')
def index():
    return "Mapbox Isochrone Flask Proxy is running!"

if __name__ == '__main__':
    # Use environment variable for port, default to 5001 if not set
    port = int(os.environ.get('FLASK_RUN_PORT', 5001))
    # Run in debug mode for development (auto-reloads), set debug=False for production
    app.run(host='0.0.0.0', port=port, debug=True)