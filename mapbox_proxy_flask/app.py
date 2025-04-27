# app.py
import os
from flask import Flask, request, jsonify, Response
import requests
from dotenv import load_dotenv
from flask_cors import CORS # Import Flask-Cors
import re

load_dotenv() # Load environment variables from .env file

app = Flask(__name__)

# === CORS Configuration ===
# Define allowed origins (replace with your frontend URLs)
allowed_origins = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://heluoshuyuan.cn", # Your production frontend
    "http://192.168.137.178:8000",
    "http://10.7.84.168:8000",
    "http://192.168.31.47:8000"

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

# === 新增：代理 Mapbox 样式请求 ===
@app.route('/api/mapbox/styles/v1/<path:style_path>')
def styles_proxy(style_path):
    """代理 Mapbox 样式请求，例如：mapbox://styles/mapbox/dark-v10"""
    mapbox_url = f"https://api.mapbox.com/styles/v1/{style_path}"
    params = {'access_token': MAPBOX_ACCESS_TOKEN}
    
    print(f"样式代理请求: {style_path}")
    
    try:
        response = requests.get(mapbox_url, params=params, timeout=10)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        print(f"样式代理错误: {e}")
        return jsonify({"error": "无法获取地图样式"}), 500

# === 新增：代理 Mapbox 矢量瓦片数据源请求 ===
@app.route('/api/mapbox/v4/<path:tile_source_path>.json')
def vector_source_proxy(tile_source_path):
    """代理矢量瓦片数据源请求，例如：mapbox://mapbox.mapbox-streets-v8"""
    mapbox_url = f"https://api.mapbox.com/v4/{tile_source_path}.json"
    params = {'access_token': MAPBOX_ACCESS_TOKEN, 'secure': True}
    
    print(f"矢量数据源代理请求: {tile_source_path}")
    
    try:
        response = requests.get(mapbox_url, params=params, timeout=10)
        response.raise_for_status()
        source_json = response.json()
        
        # 替换URL，指向我们的代理
        if 'tiles' in source_json:
            original_tiles = source_json['tiles']
            proxied_tiles = []
            for tile_url in original_tiles:
                # 从原始URL中提取域名后的路径
                tile_path = re.sub(r'^https?://[^/]+', '', tile_url)
                # 指向我们的代理
                proxied_url = f"/api/mapbox/tiles{tile_path}"
                proxied_tiles.append(proxied_url)
            source_json['tiles'] = proxied_tiles
        
        return jsonify(source_json)
    except Exception as e:
        print(f"矢量数据源代理错误: {e}")
        return jsonify({"error": "无法获取矢量数据源"}), 500

# === 新增：代理 Mapbox 瓦片请求 ===
@app.route('/api/mapbox/tiles/<path:tile_path>')
def tiles_proxy(tile_path):
    """代理实际的瓦片请求"""
    mapbox_url = f"https://api.mapbox.com/tiles/{tile_path}"
    # 对于瓦片，我们需要保留所有查询参数
    params = dict(request.args)
    params['access_token'] = MAPBOX_ACCESS_TOKEN
    
    print(f"瓦片代理请求: {tile_path}")
    
    try:
        response = requests.get(mapbox_url, params=params, timeout=10)
        response.raise_for_status()
        
        # 创建响应，保留原始内容类型
        proxied_response = Response(
            response.content, 
            status=response.status_code,
            content_type=response.headers.get('Content-Type')
        )
        return proxied_response
    except Exception as e:
        print(f"瓦片代理错误: {e}")
        return jsonify({"error": "无法获取地图瓦片"}), 500

# === 新增：代理 Mapbox 字体请求 ===
@app.route('/api/mapbox/fonts/v1/<path:font_path>')
def fonts_proxy(font_path):
    """代理字体请求，例如：mapbox://fonts/mapbox/{fontstack}/{range}.pbf"""
    mapbox_url = f"https://api.mapbox.com/fonts/v1/{font_path}"
    params = {'access_token': MAPBOX_ACCESS_TOKEN}
    
    print(f"字体代理请求: {font_path}")
    
    try:
        response = requests.get(mapbox_url, params=params, timeout=10)
        response.raise_for_status()
        
        # 创建响应，保留原始内容类型
        proxied_response = Response(
            response.content, 
            status=response.status_code,
            content_type=response.headers.get('Content-Type', 'application/x-protobuf')
        )
        return proxied_response
    except Exception as e:
        print(f"字体代理错误: {e}")
        return jsonify({"error": "无法获取地图字体"}), 500

# === 新增：代理 Mapbox 精灵图请求 ===
@app.route('/api/mapbox/sprites/v1/<path:sprite_path>')
def sprites_proxy(sprite_path):
    """代理精灵图请求"""
    mapbox_url = f"https://api.mapbox.com/sprites/v1/{sprite_path}"
    params = {'access_token': MAPBOX_ACCESS_TOKEN}
    
    print(f"精灵图代理请求: {sprite_path}")
    
    try:
        response = requests.get(mapbox_url, params=params, timeout=10)
        response.raise_for_status()
        
        # 创建响应，保留原始内容类型
        proxied_response = Response(
            response.content, 
            status=response.status_code,
            content_type=response.headers.get('Content-Type')
        )
        return proxied_response
    except Exception as e:
        print(f"精灵图代理错误: {e}")
        return jsonify({"error": "无法获取地图精灵图"}), 500

# === 新增：通用 Mapbox API 代理 ===
@app.route('/api/mapbox/<path:proxy_path>')
def general_mapbox_proxy(proxy_path):
    """通用 Mapbox API 代理，处理其他类型的请求"""
    mapbox_url = f"https://api.mapbox.com/{proxy_path}"
    params = dict(request.args)
    params['access_token'] = MAPBOX_ACCESS_TOKEN
    
    print(f"通用代理请求: {proxy_path}")
    
    try:
        response = requests.get(mapbox_url, params=params, timeout=10)
        response.raise_for_status()
        
        # 根据响应内容类型返回适当的响应
        content_type = response.headers.get('Content-Type', '')
        if 'application/json' in content_type:
            return jsonify(response.json())
        else:
            proxied_response = Response(
                response.content, 
                status=response.status_code,
                content_type=content_type
            )
            return proxied_response
    except Exception as e:
        print(f"通用代理错误: {e}")
        return jsonify({"error": f"无法代理请求: {proxy_path}"}), 500

@app.route('/')
def index():
    return "Mapbox Isochrone Flask Proxy is running!"

if __name__ == '__main__':
    # Use environment variable for port, default to 5001 if not set
    port = int(os.environ.get('FLASK_RUN_PORT', 5001))
    # Run in debug mode for development (auto-reloads), set debug=False for production
    app.run(host='0.0.0.0', port=port, debug=True)