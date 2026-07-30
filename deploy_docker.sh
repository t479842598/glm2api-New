#!/bin/bash
# Docker 部署脚本
set -euo pipefail

DOMAIN="glm.tang74.top"
APP_DIR="/opt/glm2api"

echo "=== Docker 部署 glm2api ==="

# 1. 创建目录
mkdir -p "$APP_DIR"
cd "$APP_DIR"

# 2. 克隆代码
if [ ! -f "pyproject.toml" ]; then
    git clone https://github.com/t479842598/glm2api-manage.git temp
    shopt -s dotglob
    mv temp/* .
    shopt -u dotglob
    rm -rf temp
fi

# 3. 创建 Dockerfile
cat > Dockerfile << 'DOCKERFILE'
FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml README.md ./
COPY src/ src/
COPY main.py ./
RUN pip install --no-cache-dir -e .
RUN echo "HOST=0.0.0.0\nPORT=8000\nGLM_USE_GUEST_REFRESH_TOKEN=true\nADMIN_KEY=$(openssl rand -hex 16)\nLOG_LEVEL=INFO" > .env
EXPOSE 8000
CMD ["python", "-m", "glm2api"]
DOCKERFILE

# 4. 创建 docker-compose.yml
cat > docker-compose.yml << 'COMPOSE'
version: '3.8'
services:
  glm2api:
    build: .
    container_name: glm2api
    ports:
      - "127.0.0.1:8000:8000"
    environment:
      - HOST=0.0.0.0
      - PORT=8000
      - GLM_USE_GUEST_REFRESH_TOKEN=true
      - LOG_LEVEL=INFO
    restart: unless-stopped
COMPOSE

# 5. 构建并启动
docker compose down 2>/dev/null || true
docker compose up -d --build

# 6. 等待启动
sleep 5

# 7. 生成证书
mkdir -p /etc/nginx/ssl
if [ ! -f "/etc/nginx/ssl/glm.tang74.top.crt" ]; then
    openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/glm.tang74.top.key \
        -out /etc/nginx/ssl/glm.tang74.top.crt \
        -subj "/C=CN/ST=Beijing/L=Beijing/O=glm2api/CN=$DOMAIN" 2>/dev/null
    chmod 600 /etc/nginx/ssl/glm.tang74.top.key
fi

# 8. 配置 Nginx
cat > /etc/nginx/conf.d/glm2api.conf << 'NGINX'
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
NGINX

nginx -t && systemctl reload nginx

# 9. 检查状态
if docker ps | grep -q glm2api; then
    echo ""
    echo "=== 部署完成 ==="
    echo "状态: running"
    echo "地址: https://glm.tang74.top"
    echo "管理面板: https://glm.tang74.top/admin"
    echo ""
    echo "查看日志: docker logs -f glm2api"
else
    echo ""
    echo "=== 部署可能有问题 ==="
    docker logs glm2api 2>&1 | tail -20
fi
