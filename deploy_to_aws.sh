#!/bin/bash

# AWS EC2部署脚本
# 用于部署Mapbox等时圈代理服务器

set -e  # 遇到错误时停止执行

# 配置变量
SERVER_HOST="ec2-18-138-2-177.ap-southeast-1.compute.amazonaws.com"
SSH_KEY="/Users/xinyuan/Desktop/xinyuanblue.github.io-main/macmiyao.pem"
REMOTE_USER="ubuntu"
REMOTE_DIR="/home/ubuntu/mapbox-proxy"
LOCAL_FLASK_DIR="./flask"

echo "🚀 开始部署Mapbox等时圈代理服务器到AWS EC2..."
echo "目标服务器: ${SERVER_HOST}"
echo "="*60

# 1. 检查本地文件
echo "📁 检查本地文件..."
if [ ! -f "${SSH_KEY}" ]; then
    echo "❌ SSH密钥文件不存在: ${SSH_KEY}"
    exit 1
fi

if [ ! -f "${LOCAL_FLASK_DIR}/app.py" ]; then
    echo "❌ Flask应用文件不存在: ${LOCAL_FLASK_DIR}/app.py"
    exit 1
fi

echo "✅ 本地文件检查完成"

# 2. 测试SSH连接
echo "🔗 测试SSH连接..."
ssh -i "${SSH_KEY}" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "${REMOTE_USER}@${SERVER_HOST}" "echo '连接成功'" || {
    echo "❌ SSH连接失败，请检查网络和密钥配置"
    exit 1
}

echo "✅ SSH连接正常"

# 3. 在服务器上创建目录和安装依赖
echo "🛠️  在服务器上准备环境..."
ssh -i "${SSH_KEY}" "${REMOTE_USER}@${SERVER_HOST}" << 'EOF'
    # 更新系统
    sudo apt update -y
    
    # 安装Python3和pip
    sudo apt install -y python3 python3-pip python3-venv
    
    # 创建项目目录
    mkdir -p /home/ubuntu/mapbox-proxy
    cd /home/ubuntu/mapbox-proxy
    
    # 创建虚拟环境
    python3 -m venv venv
    
    echo "环境准备完成"
EOF

echo "✅ 服务器环境准备完成"

# 4. 上传Flask应用文件
echo "📤 上传Flask应用文件..."
scp -i "${SSH_KEY}" "${LOCAL_FLASK_DIR}/app.py" "${REMOTE_USER}@${SERVER_HOST}:${REMOTE_DIR}/"

echo "✅ 文件上传完成"

# 5. 创建requirements.txt
echo "📝 创建requirements.txt..."
cat > /tmp/requirements.txt << 'EOF'
Flask==2.3.3
Flask-CORS==4.0.0
requests==2.31.0
python-dotenv==1.0.0
EOF

scp -i "${SSH_KEY}" /tmp/requirements.txt "${REMOTE_USER}@${SERVER_HOST}:${REMOTE_DIR}/"

# 6. 创建启动脚本
echo "🔧 创建启动脚本..."
cat > /tmp/start_server.sh << 'EOF'
#!/bin/bash

cd /home/ubuntu/mapbox-proxy

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 设置环境变量
export FLASK_RUN_PORT=5002

# 启动服务器
echo "启动Mapbox等时圈代理服务器..."
python3 app.py
EOF

scp -i "${SSH_KEY}" /tmp/start_server.sh "${REMOTE_USER}@${SERVER_HOST}:${REMOTE_DIR}/"

# 7. 创建系统服务文件
echo "⚙️  创建系统服务..."
cat > /tmp/mapbox-proxy.service << 'EOF'
[Unit]
Description=Mapbox Isochrone Proxy Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/mapbox-proxy
Environment=PATH=/home/ubuntu/mapbox-proxy/venv/bin
Environment=FLASK_RUN_PORT=5002
ExecStart=/home/ubuntu/mapbox-proxy/venv/bin/python app.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

scp -i "${SSH_KEY}" /tmp/mapbox-proxy.service "${REMOTE_USER}@${SERVER_HOST}:/tmp/"

# 8. 在服务器上配置和启动服务
echo "🚀 配置和启动服务..."
ssh -i "${SSH_KEY}" "${REMOTE_USER}@${SERVER_HOST}" << 'EOF'
    cd /home/ubuntu/mapbox-proxy
    
    # 设置脚本权限
    chmod +x start_server.sh
    
    # 激活虚拟环境并安装依赖
    source venv/bin/activate
    pip install -r requirements.txt
    
    # 安装系统服务
    sudo cp /tmp/mapbox-proxy.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable mapbox-proxy
    
    # 开放端口5002
    sudo ufw allow 5002/tcp || echo "UFW可能未安装，请手动配置防火墙"
    
    echo "服务配置完成"
EOF

echo "✅ 服务配置完成"

# 9. 启动服务
echo "🎯 启动代理服务..."
ssh -i "${SSH_KEY}" "${REMOTE_USER}@${SERVER_HOST}" << 'EOF'
    sudo systemctl start mapbox-proxy
    sleep 3
    sudo systemctl status mapbox-proxy --no-pager
EOF

# 10. 测试服务
echo "🧪 测试服务..."
sleep 5
curl -s http://18.138.2.177:5002/health | head -3 || echo "服务可能还在启动中，请稍等..."

echo ""
echo "🎉 部署完成！"
echo "="*60
echo "服务访问地址："
echo "  健康检查: http://18.138.2.177:5002/health"
echo "  等时圈API: http://18.138.2.177:5002/api/isochrone"
echo "  服务状态: http://18.138.2.177:5002/status"
echo ""
echo "常用命令："
echo "  查看服务状态: sudo systemctl status mapbox-proxy"
echo "  重启服务: sudo systemctl restart mapbox-proxy"
echo "  查看日志: sudo journalctl -u mapbox-proxy -f"
echo "  停止服务: sudo systemctl stop mapbox-proxy"
echo ""
echo "如需手动启动，SSH到服务器后运行："
echo "  cd /home/ubuntu/mapbox-proxy && ./start_server.sh"

# 清理临时文件
rm -f /tmp/requirements.txt /tmp/start_server.sh /tmp/mapbox-proxy.service 