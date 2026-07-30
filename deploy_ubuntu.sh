#!/bin/bash
set -euo pipefail

DOMAIN="glm.tang74.top"
APP_DIR="/opt/glm2api"

echo "=== 开始部署 glm2api 到 $DOMAIN ==="

# 创建目录
mkdir -p "$APP_DIR"
cd "$APP_DIR"

# SCP 已上传了代码到 /tmp/glm2api-code/
if [ -d "/tmp/glm2api-code" ]; then
    cp -r /tmp/glm2api-code/* .
    rm -rf /tmp/glm2api-code
fi

# 安装依赖
echo "[1/5] 安装 Python 依赖..."
pip3 install -e . -q 2>/dev/null

# 创建 .env
echo "[2/5] 创建配置..."
if [ ! -f ".env" ]; then
    ADMIN_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(16))")
    cat > .env << EOF
HOST=127.0.0.1
PORT=8000
GLM_USE_GUEST_REFRESH_TOKEN=true
ADMIN_KEY=$ADMIN_KEY
LOG_LEVEL=INFO
EOF
    echo "管理密钥: $ADMIN_KEY"
fi

# 自签证书
echo "[3/5] 生成自签证书..."
mkdir -p /etc/nginx/ssl
if [ ! -f "/etc/nginx/ssl/$DOMAIN.crt" ]; then
    openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
        -keyout "/etc/nginx/ssl/$DOMAIN.key" \
        -out "/etc/nginx/ssl/$DOMAIN.crt" \
        -subj "/C=CN/ST=Beijing/O=glm2api/CN=$DOMAIN" 2>/dev/null
    chmod 600 "/etc/nginx/ssl/$DOMAIN.key"
fi

# Nginx 配置
echo "[4/5] 配置 Nginx..."
cat > /etc/nginx/sites-available/glm2api.conf << NGINXEOF
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl;
    server_name $DOMAIN;

    ssl_certificate /etc/nginx/ssl/$DOMAIN.crt;
    ssl_certificate_key /etc/nginx/ssl/$DOMAIN.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffering off;
        proxy_read_timeout 600s;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/glm2api.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx || service nginx reload

# Systemd 服务
echo "[5/5] 配置 systemd 服务..."
cat > /etc/systemd/system/glm2api.service << EOF
[Unit]
Description=glm2api - GLM to OpenAI API Proxy
After=network.target

[Service]
Type=simple
WorkingDirectory=$APP_DIR
ExecStart=$(which python3) -m glm2api
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
echo "地址: https://$DOMAIN"
echo "管理面板: https://$DOMAIN/admin"
