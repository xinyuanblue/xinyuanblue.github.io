# app.py
import os
from flask import Flask, request, jsonify, Response
import requests
from flask_cors import CORS # Import Flask-Cors
import re
import socket
from datetime import datetime

# 移除对 .env 文件的依赖
# load_dotenv()

app = Flask(__name__)

# === 优化的CORS配置 ===
# 支持外部服务器部署，允许所有域名访问
CORS(app, 
     origins="*",  # 允许所有域名访问
     methods=["GET", "POST", "OPTIONS"],  # 允许的HTTP方法
     allow_headers=["Content-Type", "Authorization"],  # 允许的请求头
     supports_credentials=True)

# === 直接写入Mapbox访问密钥 ===
MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoieGlueXVhbmJsdWUiLCJhIjoiY203cHhybnp3MHYxZzJscHJyYnYwMHMzZyJ9.9Be1af0pb9DVIlt5PJ8COQ"

# 验证密钥是否有效
if not MAPBOX_ACCESS_TOKEN or len(MAPBOX_ACCESS_TOKEN) < 50:
    print('❌ 错误：Mapbox Access Token 无效！')
    exit(1)
else:
    print('✅ Mapbox Access Token 已配置')

# 请求统计
request_stats = {
    'total_requests': 0,
    'successful_requests': 0,
    'failed_requests': 0,
    'start_time': datetime.now()
}

def get_server_info():
    """获取服务器信息"""
    hostname = socket.gethostname()
    try:
        local_ip = socket.gethostbyname(hostname)
    except:
        local_ip = "127.0.0.1"
    return hostname, local_ip

@app.before_request
def before_request():
    """记录请求信息"""
    request_stats['total_requests'] += 1
    client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
    print(f"📍 请求来源: {client_ip} - {request.method} {request.url}")

@app.route('/')
def index():
    """服务器状态页面"""
    hostname, local_ip = get_server_info()
    uptime = datetime.now() - request_stats['start_time']
    
    return jsonify({
        "service": "Mapbox等时圈代理服务器",
        "status": "运行中",
        "version": "2.0.0",
        "server_info": {
            "hostname": hostname,
            "local_ip": local_ip,
            "uptime": str(uptime)
        },
        "statistics": {
            "总请求数": request_stats['total_requests'],
            "成功请求数": request_stats['successful_requests'],
            "失败请求数": request_stats['failed_requests'],
            "成功率": f"{(request_stats['successful_requests'] / max(request_stats['total_requests'], 1) * 100):.1f}%"
        },
        "endpoints": {
            "等时圈API": "/api/isochrone",
            "健康检查": "/health",
            "服务状态": "/status"
        },
        "mapbox_token_configured": bool(MAPBOX_ACCESS_TOKEN)
    })

@app.route('/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({
        "status": "healthy",
        "service": "mapbox-isochrone-proxy",
        "timestamp": datetime.now().isoformat(),
        "mapbox_configured": bool(MAPBOX_ACCESS_TOKEN)
    })

@app.route('/status', methods=['GET'])
def server_status():
    """详细服务器状态"""
    hostname, local_ip = get_server_info()
    uptime = datetime.now() - request_stats['start_time']
    
    return jsonify({
        "server_status": "运行中",
        "hostname": hostname,
        "local_ip": local_ip,
        "uptime_seconds": int(uptime.total_seconds()),
        "uptime_formatted": str(uptime),
        "request_statistics": request_stats,
        "mapbox_token_configured": bool(MAPBOX_ACCESS_TOKEN)
    })

@app.route('/api/isochrone', methods=['GET', 'OPTIONS'])
def isochrone_proxy():
    """
    等时圈API代理
    支持跨域请求，适合外部前端调用
    """
    
    # 处理OPTIONS预检请求
    if request.method == 'OPTIONS':
        return '', 200
    
    # 获取客户端信息
    client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
    
    lng = request.args.get('lng')
    lat = request.args.get('lat')
    minutes = request.args.get('minutes', '15') # Default to 15
    profile = request.args.get('profile', 'walking') # Default to walking

    # --- 增强的输入验证 ---
    try:
        if not lng or not lat:
            raise ValueError("经度(lng)和纬度(lat)参数不能为空")
            
        lng_float = float(lng)
        lat_float = float(lat)
        minutes_int = int(minutes)
        
        # 验证参数范围
        if not (-180 <= lng_float <= 180):
            raise ValueError("经度必须在-180到180之间")
        if not (-90 <= lat_float <= 90):
            raise ValueError("纬度必须在-90到90之间")
        if not (1 <= minutes_int <= 60):
            raise ValueError("分钟数必须在1-60之间")
        if profile not in ['walking', 'cycling', 'driving']:
            raise ValueError("出行方式必须是walking、cycling或driving")
            
    except (TypeError, ValueError) as e:
        print(f"❌ 参数验证失败 - 客户端: {client_ip} - 错误: {str(e)}")
        request_stats['failed_requests'] += 1
        return jsonify({
            "error": f"参数错误: {str(e)}",
            "valid_profiles": ["walking", "cycling", "driving"],
            "valid_minutes_range": "1-60"
        }), 400

    mapbox_url = f"https://api.mapbox.com/isochrone/v1/mapbox/{profile}/{lng_float},{lat_float}"
    params = {
        'contours_minutes': minutes_int,
        'polygons': 'true',
        'access_token': MAPBOX_ACCESS_TOKEN
    }

    print(f"🔄 代理请求 - 客户端: {client_ip} - 坐标: ({lng_float}, {lat_float}) - 时间: {minutes_int}分钟 - 方式: {profile}")

    try:
        response = requests.get(mapbox_url, params=params, timeout=15) # 增加超时时间
        response.raise_for_status()

        print(f"✅ Mapbox响应成功 - 状态码: {response.status_code} - 客户端: {client_ip}")
        request_stats['successful_requests'] += 1
        
        # 返回GeoJSON数据
        return jsonify(response.json())

    except requests.exceptions.Timeout:
        print(f"⏰ Mapbox请求超时 - 客户端: {client_ip}")
        request_stats['failed_requests'] += 1
        return jsonify({
            "error": "Mapbox服务请求超时，请稍后重试",
            "error_code": "TIMEOUT"
        }), 504
        
    except requests.exceptions.HTTPError as e:
        print(f"❌ Mapbox API错误 - 状态码: {e.response.status_code} - 客户端: {client_ip}")
        request_stats['failed_requests'] += 1
        
        try:
            error_details = e.response.json().get('message', '无法获取等时圈数据')
        except ValueError:
            error_details = e.response.text
            
        return jsonify({
            "error": f"Mapbox API错误",
            "error_code": f"MAPBOX_HTTP_{e.response.status_code}",
            "details": error_details,
            "mapbox_status": e.response.status_code
        }), 502
        
    except requests.exceptions.RequestException as e:
        print(f"🌐 网络连接错误 - {str(e)} - 客户端: {client_ip}")
        request_stats['failed_requests'] += 1
        return jsonify({
            "error": "网络连接失败，请检查服务器网络连接",
            "error_code": "NETWORK_ERROR"
        }), 502
        
    except Exception as e:
        print(f"💥 服务器内部错误 - {str(e)} - 客户端: {client_ip}")
        request_stats['failed_requests'] += 1
        return jsonify({
            "error": "服务器内部错误",
            "error_code": "INTERNAL_ERROR"
        }), 500

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

# === 错误处理器 ===
@app.errorhandler(404)
def not_found(error):
    """404错误处理"""
    client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
    print(f"❌ 404错误 - 客户端: {client_ip} - 路径: {request.path}")
    
    return jsonify({
        "error": "接口不存在",
        "message": "请检查API路径是否正确",
        "requested_path": request.path,
        "available_endpoints": {
            "主页": "/",
            "健康检查": "/health", 
            "服务状态": "/status",
            "等时圈API": "/api/isochrone",
            "Mapbox代理": "/api/mapbox/*"
        }
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """500错误处理"""
    client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
    print(f"💥 500错误 - 客户端: {client_ip} - 错误: {str(error)}")
    
    return jsonify({
        "error": "服务器内部错误",
        "message": "请联系管理员或稍后重试",
        "timestamp": datetime.now().isoformat()
    }), 500

@app.errorhandler(403)
def forbidden(error):
    """403错误处理"""
    client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
    print(f"🚫 403错误 - 客户端: {client_ip} - 访问被拒绝")
    
    return jsonify({
        "error": "访问被拒绝",
        "message": "您没有权限访问此资源"
    }), 403

def get_public_ip():
    """获取公网IP地址"""
    try:
        # 尝试多个服务获取公网IP
        services = [
            'https://api.ipify.org?format=text',
            'https://icanhazip.com',
            'https://ident.me',
            'https://ipecho.net/plain'
        ]
        
        for service in services:
            try:
                response = requests.get(service, timeout=5)
                if response.status_code == 200:
                    public_ip = response.text.strip()
                    if public_ip and '.' in public_ip:  # 简单验证IP格式
                        return public_ip
            except:
                continue
        return "无法获取"
    except:
        return "无法获取"

def check_network_connectivity():
    """检查网络连接状态"""
    try:
        # 测试连接到Mapbox API
        response = requests.get('https://api.mapbox.com', timeout=5)
        return True
    except:
        return False

def display_server_info(hostname, local_ip, public_ip, port):
    """显示详细的服务器信息"""
    print("=" * 80)
    print("🚀 Mapbox等时圈代理服务器启动成功！")
    print("=" * 80)
    
    # 服务器基本信息
    print("📋 服务器信息:")
    print(f"   主机名: {hostname}")
    print(f"   操作系统: {os.name}")
    print(f"   Python版本: {os.sys.version.split()[0]}")
    print(f"   启动时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 网络信息
    print("\n🌐 网络信息:")
    print(f"   内网IP: {local_ip}")
    print(f"   公网IP: {public_ip}")
    print(f"   服务端口: {port}")
    
    # 访问地址
    print("\n🔗 访问地址:")
    print(f"   本地访问: http://localhost:{port}")
    print(f"   内网访问: http://{local_ip}:{port}")
    if public_ip != "无法获取":
        print(f"   公网访问: http://{public_ip}:{port}")
    
    # API接口
    print("\n📡 API接口:")
    print(f"   等时圈API: http://{local_ip}:{port}/api/isochrone")
    print(f"   健康检查: http://{local_ip}:{port}/health")
    print(f"   服务状态: http://{local_ip}:{port}/status")
    
    # 前端配置
    print("\n📝 前端配置示例:")
    print(f"   本地开发: const proxyBaseUrl = 'http://localhost:{port}';")
    print(f"   内网部署: const proxyBaseUrl = 'http://{local_ip}:{port}';")
    if public_ip != "无法获取":
        print(f"   公网部署: const proxyBaseUrl = 'http://{public_ip}:{port}';")
    
    # 安全提醒
    print("\n⚠️  安全提醒:")
    if public_ip != "无法获取":
        print("   🔒 检测到公网IP，请确保:")
        print("      - 防火墙已正确配置")
        print("      - 仅开放必要的端口")
        print("      - 考虑使用HTTPS和访问控制")
    
    # 网络连接状态
    network_ok = check_network_connectivity()
    print(f"\n🌍 网络连接状态:")
    if network_ok:
        print("   ✅ 可以正常访问Mapbox API")
    else:
        print("   ❌ 无法访问Mapbox API，请检查网络连接")
    
    print("\n🛑 按 Ctrl+C 停止服务器")
    print("=" * 80)

if __name__ == '__main__':
    # 获取服务器信息
    hostname, local_ip = get_server_info()
    port = int(os.environ.get('FLASK_RUN_PORT', 5002))
    
    print("🔍 正在获取服务器信息...")
    
    # 获取公网IP（可能需要一些时间）
    print("🌐 正在获取公网IP地址...")
    public_ip = get_public_ip()
    
    # 显示详细信息
    display_server_info(hostname, local_ip, public_ip, port)
    
    # 启动Flask服务器
    try:
        app.run(
            host='0.0.0.0',  # 监听所有网络接口
            port=port,       # 使用环境变量PORT或默认5002
            debug=False,     # 生产环境关闭调试模式
            threaded=True    # 启用多线程支持
        )
    except KeyboardInterrupt:
        print("\n\n👋 服务器已停止")
    except Exception as e:
        print(f"\n❌ 服务器启动失败: {e}")
        print("请检查端口是否被占用或权限是否足够")
