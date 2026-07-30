#!/bin/bash
# glm2api 快速部署脚本（使用 Miniconda）
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
    echo "请使用 root 运行"
    exit 1
fi

DOMAIN="glm.tang74.top"
APP_DIR="/opt/glm2api"

echo "=== 开始部署 glm2api ==="

# 1. 安装 Miniconda
echo "[1/7] 安装 Miniconda..."
if [ ! -d "/opt/miniconda3" ]; then
    cd /tmp
    curl -sO https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
    bash Miniconda3-latest-Linux-x86_64.sh -b -p /opt/miniconda3
fi
eval "$(/opt/miniconda3/bin/conda shell.bash hook)"

# 2. 创建 Python 3.12 环境
echo "[2/7] 创建 Python 环境..."
conda create -n glm2api python=3.12 -y -q 2>/dev/null
conda activate glm2api
python --version

# 3. 克隆代码
echo "[3/7] 获取代码..."
mkdir -p "$APP_DIR"
cd "$APP_DIR"
if [ ! -f "pyproject.toml" ]; then
    git clone https://github.com/t479842598/glm2api-manage.git temp
    shopt -s dotglob
    mv temp/* .
    shopt -u dotglob
    rm -rf temp
fi

# 4. 安装依赖
echo "[4/7] 安装依赖..."
pip install -e . -q 2>/dev/null

# 5. 创建配置
echo "[5/7] 创建配置..."
if [ ! -f ".env" ]; then
    ADMIN_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(16))")
    cat > .env << EOF
HOST=127.0.0.1
PORT=8000
GLM_USE_GUEST_REFRESH_TOKEN=true
ADMIN_KEY=$ADMIN_KEY
LOG_LEVEL=INFO
EOF
    echo "管理密钥: $ADMIN_KEY"
fi

# 6. 生成证书
echo "[6/7] 生成证书..."
mkdir -p /etc/nginx/ssl
if [ ! -f "/etc/nginx/ssl/glm.tang74.top.crt" ]; then
    openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/glm.tang74.top.key \
        -out /etc/nginx/ssl/glm.tang74.top.crt \
        -subj "/C=CN/ST=Beijing/L=Beijing/O=glm2api/CN=$DOMAIN" 2>/dev/null
    chmod 600 /etc/nginx/ssl/glm.tang74.top.key
fi

# 7. 配置 Nginx 和 systemd
echo "[7/7] 配置服务..."

# Nginx
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

# Systemd
PYTHON_PATH=$(/opt/miniconda3/envs/glm2api/bin/python -c "import sys; print(sys.executable)")
cat > /etc/systemd/system/glm2api.service << EOF
[Unit]
Description=glm2api
After=network.target

[Service]
Type=simple
WorkingDirectory=$APP_DIR
ExecStart=$PYTHON_PATH -m glm2api
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable glm2api
systemctl restart glm2api

sleep 3
echo ""
echo "=== 部署完成 ==="
echo "状态: $(systemctl is-active glm2api)"
echo "地址: https://glm.tang74.top"
echo "管理面板: https://glm.tang74.top/admin"
