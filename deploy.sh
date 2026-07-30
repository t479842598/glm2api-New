#!/bin/bash
# glm2api 部署脚本 - 修复版
set -euo pipefail

# 检查 root 权限
if [ "$(id -u)" -ne 0 ]; then
    echo "请使用 root 运行此脚本"
    exit 1
fi

DOMAIN="glm.tang74.top"
APP_DIR="/opt/glm2api"
LOG_FILE="/var/log/glm2api_deploy.log"

mkdir -p /var/log/glm2api
exec > >(tee -a $LOG_FILE) 2>&1

echo "=== $(date) 开始部署 glm2api ==="

# 1. 安装 Python 3.12
echo "[1/8] 安装 Python 3.12..."
if ! command -v python3.12 &> /dev/null; then
    cd /tmp
    rm -rf Python-3.12* 2>/dev/null || true
    curl -sO https://www.python.org/ftp/python/3.12.4/Python-3.12.4.tgz
    tar xzf Python-3.12.4.tgz
    cd Python-3.12.4
    ./configure --prefix=/usr/local --enable-optimizations 2>&1 | tail -3
    make -j$(nproc) 2>&1 | tail -3
    make altinstall 2>&1 | tail -3
fi
python3.12 --version

# 2. 创建应用目录
echo "[2/8] 创建应用目录..."
mkdir -p "$APP_DIR"
cd "$APP_DIR"

# 3. 克隆代码
echo "[3/8] 获取代码..."
if [ ! -f "pyproject.toml" ]; then
    git clone https://github.com/t479842598/glm2api-manage.git temp_clone
    shopt -s dotglob
    mv temp_clone/* .
    shopt -u dotglob
    rm -rf temp_clone
else
    git pull origin main 2>/dev/null || true
fi

# 4. 安装依赖
echo "[4/8] 安装依赖..."
python3.12 -m pip install --upgrade pip -q 2>/dev/null
python3.12 -m pip install -e . -q 2>/dev/null

# 5. 创建配置
echo "[5/8] 创建配置..."
if [ ! -f ".env" ]; then
    ADMIN_KEY=$(python3.12 -c "import secrets; print(secrets.token_urlsafe(16))")
    cat > .env << EOF
HOST=127.0.0.1
PORT=8000
GLM_USE_GUEST_REFRESH_TOKEN=true
ADMIN_KEY=$ADMIN_KEY
LOG_LEVEL=INFO
EOF
    echo "管理密钥: $ADMIN_KEY"
fi

# 6. 生成自签证书
echo "[6/8] 生成证书..."
mkdir -p /etc/nginx/ssl
if [ ! -f "/etc/nginx/ssl/glm.tang74.top.crt" ]; then
    openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/glm.tang74.top.key \
        -out /etc/nginx/ssl/glm.tang74.top.crt \
        -subj "/C=CN/ST=Beijing/L=Beijing/O=glm2api/CN=glm.tang74.top" 2>/dev/null
    chmod 600 /etc/nginx/ssl/glm.tang74.top.key
    echo "证书已生成"
fi

# 7. 配置 Nginx
echo "[7/8] 配置 Nginx..."
cat > /etc/nginx/conf.d/glm2api.conf << 'NGINXEOF'
server {
    listen 80;
    server_name glm.tang74.top;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name glm.tang74.top;

    ssl_certificate /etc/nginx/ssl/glm.tang74.top.crt;
    ssl_certificate_key /etc/nginx/ssl/glm.tang74.top.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_read_timeout 600s;
    }
}
NGINXEOF

nginx -t && systemctl reload nginx

# 8. 创建 systemd 服务
echo "[8/8] 配置服务..."
cat > /etc/systemd/system/glm2api.service << EOF
[Unit]
Description=glm2api - GLM to OpenAI API Proxy
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR
Environment="PYTHONPATH=$APP_DIR/src"
ExecStart=/usr/local/bin/python3.12 -m glm2api
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable glm2api
systemctl restart glm2api

# 等待服务启动
echo "等待服务启动..."
sleep 3

# 健康检查
if systemctl is-active --quiet glm2api; then
    echo ""
    echo "=== 部署完成 ==="
    echo "状态: active"
    echo "地址: https://glm.tang74.top"
    echo "管理面板: https://glm.tang74.top/admin"
    echo ""
    echo "查看日志: journalctl -u glm2api -f"
else
    echo ""
    echo "=== 部署可能有问题 ==="
    echo "服务状态: $(systemctl is-active glm2api)"
    echo "查看日志: journalctl -u glm2api -n 20"
fi
