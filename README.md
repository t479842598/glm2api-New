# glm2api

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ft479842598%2Fglm2api-New&env=ADMIN_KEY&envDescription=%E7%AE%A1%E7%90%86%E9%9D%A2%E6%9D%BF%E7%99%BB%E5%BD%95%E5%AF%86%E9%92%A5%EF%BC%8C%E9%BB%98%E8%AE%A4%E4%B8%BA%20glm2api-admin)

> **ChatGLM → OpenAI / Anthropic 兼容 API 代理** — 零外部依赖，内置现代化管理面板

---

## ✨ 特性亮点

- 🔄 **多协议兼容** — 同时支持 OpenAI、Anthropic Messages、OpenAI Responses API
- 🎨 **现代化管理面板** — React 19 + Tailwind CSS 4 + shadcn/ui，支持深色/浅色主题
- 🔐 **API Key 认证** — 灵活的密钥管理，支持多密钥、启用/禁用切换
- 📊 **实时监控** — 仪表盘统计、请求日志、应用日志、对话测试
- 🚀 **零外部依赖** — 纯 Python 标准库，无需安装任何第三方包
- 🌐 **多账号负载均衡** — 自动轮换多个 GLM 账号，游客模式开箱即用
- 🛡️ **device_id 防风控** — 自动轮换设备 ID，避免触发智谱频控
- 💬 **工具调用支持** — 完整支持 GLM 5.2 等推理模型的工具调用流式输出
- 🐳 **Docker 就绪** — 提供 Dockerfile 和 docker-compose.yml

---

## 📋 支持的接口

| 端点 | 方法 | 说明 |
|------|------|------|
| `/v1/chat/completions` | POST | OpenAI 聊天（流式 + 非流式） |
| `/v1/responses` | POST | OpenAI Responses API |
| `/v1/messages` | POST | Anthropic Messages API 兼容 |
| `/v1/images/generations` | POST | 图片生成 |
| `/v1/models` | GET | 模型列表 |
| `/health` | GET | 健康检查 |
| `/admin` | GET | 🎨 现代化管理面板 |

---

## 🚀 快速开始

### 前置条件

- Python ≥ 3.12
- （可选）智谱清言账号的 `refresh_token`
- **如果不填任何 token，自动走游客模式，开箱即用！**

### 安装与启动

```bash
# 1. 克隆项目
git clone https://github.com/t479842598/glm2api-New.git
cd glm2api

# 2. 安装（零外部依赖，仅需要 setuptools）
pip install -e .

# 3. 复制配置文件（可选，不复制也能自动创建）
cp .env.example .env

# 4. 启动
python -m glm2api
```

启动后访问：
- 🌐 **API 端点**：`http://127.0.0.1:8000/v1/chat/completions`
- 🎨 **管理面板**：`http://127.0.0.1:8000/admin`
- 🔑 **默认管理员密钥**：`glm2api-admin`

### 验证服务

```bash
# 健康检查
curl http://127.0.0.1:8000/health
# → {"status":"ok"}

# 查看模型列表
curl http://127.0.0.1:8000/v1/models
# → 返回 78+ 个可用模型

# 测试聊天（游客模式）
curl http://127.0.0.1:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-4-flash","messages":[{"role":"user","content":"你好"}]}'
```

---

## 🎨 管理面板

内置现代化 React 管理面板，访问 `http://127.0.0.1:8000/admin`。

### 登录

使用管理员密钥登录（默认：`glm2api-admin`，可在 `.env` 中通过 `ADMIN_KEY` 修改）。

### 功能模块

| 页面 | 功能 |
|------|------|
| **📊 概览** | 服务运行时间、账号池状态、API Keys 统计、请求统计、异常日志、快捷操作 |
| **⚙️ 配置与 Token** | 基础配置、GLM 账号池、模型列表、认证配置 |
| **🔑 API Keys** | 创建/删除/启用/禁用 API 密钥，一键复制，分页展示 |
| **📋 请求日志** | 多维度筛选（状态/模型/Key/路径）、桌面表格 + 移动端卡片、分页导航 |
| **📝 应用日志** | 实时日志流、级别过滤（DEBUG/INFO/WARNING/ERROR）、自动刷新 |
| **💬 对话测试** | 选择模型、输入提示词、查看返回结果 |

### 主题切换

支持三种主题模式：
- **跟随系统** — 自动匹配系统深色/浅色偏好
- **Porcelain Moss** — 浅色主题（瓷白灰绿）
- **Tungsten Night** — 深色主题（深石墨）

---

## 🔐 API Key 管理

在管理面板的 **API Keys** 页面中管理 API 密钥，保护你的接口。

### 工作原理

- **默认状态**：没有 API Key 时，所有接口免认证（向后兼容）
- **添加至少一个启用的 Key 后**：访问 `/v1/chat/completions` 等接口需要携带认证
- **禁用或删除所有 Key 后**：恢复免认证

### 使用 API Key

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://127.0.0.1:8000/v1",
    api_key="你的-api-key",  # ← 管理面板中创建的 key
)

# 流式响应
stream = client.chat.completions.create(
    model="glm-4-flash",
    messages=[{"role": "user", "content": "你好"}],
    stream=True,
)
for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### 环境变量持久化

API Key 会自动保存到 `.env` 文件的 `GLM2API_API_KEYS` 字段（JSON 格式），重启服务后自动恢复。

---

## 🐳 Docker 部署

### 快速启动

```bash
# 构建镜像
docker build -t glm2api .

# 运行容器（游客模式）
docker run -d -p 8000:8000 \
  -e GLM_USE_GUEST_REFRESH_TOKEN=true \
  -e ADMIN_KEY=your-secret-key \
  --name glm2api \
  glm2api

# 或使用 docker-compose
docker-compose up -d
```

### docker-compose.yml

```yaml
version: "3.8"
services:
  glm2api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - GLM_USE_GUEST_REFRESH_TOKEN=true
      - ADMIN_KEY=glm2api-admin
    restart: unless-stopped
```

### 使用真实账号

```bash
# 挂载 token.txt
docker run -d -p 8000:8000 \
  -v ./token.txt:/app/token.txt \
  -v ./.env:/app/.env \
  --name glm2api \
  glm2api
```

---

## 🌐 VPS 一键部署

适用于 Ubuntu 24.04+ 服务器，自动完成安装、配置 systemd 服务 + Nginx 反向代理：

```bash
# 1. 在本地克隆项目后上传
rsync -avz --exclude='.git' --exclude='__pycache__' \
  -e 'ssh -p 22' ./ root@你的服务器IP:/opt/glm2api/

# 2. 登录服务器，设置环境变量
ssh root@你的服务器IP
cd /opt/glm2api

# 3. 修改监听地址为 0.0.0.0
sed -i 's/^HOST=.*/HOST=0.0.0.0/' .env

# 4. 创建 systemd 服务
cat > /etc/systemd/system/glm2api.service << 'EOF'
[Unit]
Description=glm2api - GLM to OpenAI API Proxy
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/glm2api
ExecStart=/usr/bin/python3 -m glm2api
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload && systemctl enable --now glm2api

# 5. 配置 Nginx 反向代理
cat > /etc/nginx/sites-available/glm2api.conf << 'NGX'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_buffering off;
        proxy_read_timeout 600s;
    }
}
NGX

ln -sf /etc/nginx/sites-available/glm2api.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 6. 可选：配置 HTTPS
certbot --nginx -d your-domain.com
```

---

## 📦 其他部署方式

### Vercel 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ft479842598%2Fglm2api-New)

### Railway / Render / Zeabur

1. Fork 项目到你的 GitHub
2. 在平台中选择 "Deploy from GitHub"
3. Build command：`pip install -e .`
4. Start command：`python -m glm2api`

### Windows 服务

使用 NSSM (Non-Sucking Service Manager)：

```powershell
nssm install glm2api
# Application: C:\Program Files\Python312\python.exe
# Arguments: -m glm2api
# Start directory: C:\path\to\glm2api
nssm start glm2api
```

---

## ⚙️ 配置说明

### 获取 GLM Refresh Token

1. 打开 `https://chatglm.cn` 并登录
2. 按 `F12` → `Application` → `Local Storage`
3. 找到 `chatglm_refresh_token`
4. 填入 `.env`：`GLM_REFRESH_TOKEN=你的token`

**如果不填**：自动启用游客模式，零配置即可使用。

### 多账号负载均衡

创建 `token.txt`，每行一个 `refresh_token`：

```text
token-account-1
token-account-2
token-account-3
```

程序会自动在多个账号间轮换，某个账号失败时自动切换到下一个。

### 完整配置项

| 变量 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `HOST` | str | `127.0.0.1` | 监听地址，局域网用 `0.0.0.0` |
| `PORT` | int | `8000` | 监听端口 |
| `API_PREFIX` | str | `/v1` | OpenAI 兼容路径前缀 |
| `LOG_LEVEL` | str | `INFO` | 日志级别：DEBUG / INFO / WARNING / ERROR |
| `DEBUG_DUMP_ALL` | bool | `false` | 调试狂暴模式 |
| `REQUEST_TIMEOUT_SECONDS` | int | `120` | 上游请求超时 |
| `GLM_REFRESH_TOKEN` | str | — | 单账号 refresh_token |
| `GLM_TOKEN_FILE` | str | `token.txt` | 多账号 token 文件路径 |
| `GLM_USE_GUEST_REFRESH_TOKEN` | bool | `false` | 强制游客模式 |
| `GLM_GUEST_MAX_RETRIES` | int | `3` | 游客 token 获取失败重试次数 |
| `GLM_MAX_CONCURRENCY` | int | `3` | 上游并发槽位数量 |
| `GLM_QUEUE_WAIT_TIMEOUT_SECONDS` | int | `600` | 队列等待超时 |
| `GLM_BUSY_MAX_RETRIES` | int | `30` | 上游忙碌时重试次数 |
| `GLM_DELETE_CONVERSATION` | bool | `true` | 请求结束后删除 GLM 会话 |
| `GLM_ASSISTANT_ID` | str | `65940acff94777010aa6b796` | 对话 assistant id |
| `GLM_IMAGE_ASSISTANT_ID` | str | `65a232c082ff90a2ad2f15e2` | 绘图 assistant id |
| `BLOCKED_TOOL_NAMES` | str | — | 工具黑名单（逗号分隔） |
| `ADMIN_KEY` | str | `glm2api-admin` | 🎨 管理面板登录密钥 |
| `GLM2API_API_KEYS` | str | — | API Key JSON 数组 |
| `SERVER_API_KEYS` | str | — | 旧版 API Key（逗号分隔） |
| `CORS_ALLOW_ORIGIN` | str | `*` | CORS 允许来源 |

---

## 📖 使用示例

### Python (OpenAI SDK)

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://127.0.0.1:8000/v1",
    api_key="dummy",
)

# 非流式
resp = client.chat.completions.create(
    model="glm-4-flash",
    messages=[{"role": "user", "content": "你好，介绍一下你自己"}],
)
print(resp.choices[0].message.content)

# 流式
stream = client.chat.completions.create(
    model="glm-4-flash",
    messages=[{"role": "user", "content": "写一首七言绝句"}],
    stream=True,
)
for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### Python (Anthropic SDK)

```python
import anthropic

client = anthropic.Anthropic(
    base_url="http://127.0.0.1:8000",
    api_key="dummy",
)

message = client.messages.create(
    model="glm-4-flash",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}],
)
print(message.content[0].text)
```

### Python (图片生成)

```python
image = client.images.generate(
    model="glm-image-1",
    prompt="画个枫叶",
    size="1024x1024",
)
print(image.data[0].url)
```

### Curl

```bash
# 聊天
curl http://127.0.0.1:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-4-flash","messages":[{"role":"user","content":"你好"}]}'

# 图片生成
curl http://127.0.0.1:8000/v1/images/generations \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-image-1","prompt":"画个枫叶","size":"1024x1024"}'
```

---

## 🏗️ 项目架构

```
glm2api/
├── src/glm2api/
│   ├── __init__.py              # 版本声明
│   ├── __main__.py              # CLI 入口
│   ├── app.py                   # 应用生命周期管理
│   ├── config.py                # 配置加载与校验
│   ├── logging_utils.py         # 彩色日志 + 内存缓冲
│   ├── model_variants.py        # 模型变体展开
│   ├── model_profiles.py        # 模型配置档
│   ├── server.py                # HTTP 路由 + SSE 流式
│   ├── admin.py                 # 管理面板 API + API Key 存储
│   ├── admin_static/            # 旧版 Vue 管理面板（兼容）
│   │   └── index.html
│   ├── admin_web/               # 🆕 React 管理面板（构建产物）
│   │   ├── index.html
│   │   └── assets/
│   ├── core/                    # 协议无关的纯逻辑模块
│   │   ├── openai_compat.py     # OpenAI 标准响应构造
│   │   └── tokenizer.py         # token 近似计数
│   ├── services/
│   │   ├── glm_client.py        # GLM Web API 客户端 + 并发队列
│   │   ├── glm_auth.py          # 认证管理
│   │   ├── translator.py        # GLM → OpenAI 格式转换
│   │   ├── anthropic_adapter.py # Anthropic 适配器
│   │   └── responses_adapter.py # Responses API 适配器
│   └── utils/
│       ├── tool_parser.py       # 工具调用流式解析器
│       └── tool_protocol.py     # 工具协议常量
├── web/                         # 🆕 React 前端源码
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── components/          # UI 组件（shadcn/ui）
│       ├── pages/               # 页面组件
│       ├── hooks/               # 自定义 Hooks
│       └── lib/                 # API 客户端、工具函数
├── tests/                       # 测试套件
├── scripts/                     # 运维脚本
├── main.py                      # 项目入口
├── Dockerfile
├── docker-compose.yml
└── pyproject.toml
```

---

## 🛠️ 开发指南

### 安装开发依赖

```bash
# Python 开发
pip install -e ".[dev]"

# 前端开发
cd web
npm install
npm run dev
```

### 构建前端

```bash
cd web
npm run build
# 构建产物自动输出到 src/glm2api/admin_web/
```

### 运行测试

```bash
pytest tests/
```

---

## ❓ 常见问题

### 启动报错 `GLM_REFRESH_TOKEN` 缺失

**新版本默认自动退回游客模式**，无需填写。如果你想使用账号，请检查 `.env` 或 `token.txt`。

### 返回「请等待其他对话生成完毕」

GLM 侧存在并发限制，程序内置了串行队列和自动重试（默认重试 30 次）。可通过 `GLM_BUSY_MAX_RETRIES` 调整。

### 返回「请登录后继续使用」

账号 token 已失效，需要重新登录 `https://chatglm.cn` 获取新的 `refresh_token`。

### Windows 下启动报 `UnicodeEncodeError`

```powershell
$env:PYTHONIOENCODING="utf-8"
python -m glm2api
```

### Vercel 部署后流式响应不工作

Vercel Hobby 计划的函数超时限制为 10 秒，长回答可能会被截断。升级到 Pro 计划或使用本地/Docker 部署。

---

## 📄 更新日志

### v0.4.0 — 管理面板 React 重构

- 🎨 **管理面板全面重构** — 从 Vue 3 + Naive UI 迁移到 React 19 + Tailwind CSS 4 + shadcn/ui
- 🌙 **深色/浅色主题** — 支持 Porcelain Moss（浅色）和 Tungsten Night（深色）两种主题
- 📱 **响应式设计** — 桌面端侧边栏 + 移动端底部导航
- 📊 **仪表盘统计** — 实时显示服务状态、请求统计、异常日志
- 📋 **请求日志** — 支持多维度筛选、分页、详情查看
- 💬 **对话测试** — 在线测试 GLM 接口
- 🔧 **后端增强** — 新增 `/stats`、`/request-logs` 等 API 端点

### v0.3.0 — OpenAI 兼容性提升

- 🆕 **核心层抽象** — 协议无关的纯逻辑模块
- 🛡️ **device_id 防风控** — 自动轮换设备 ID
- 📊 **响应结构增强** — 标准响应 ID、system_fingerprint、token 估算
- 🚀 **CI/CD** — GitHub Actions 自动测试
- 🔧 **运维脚本** — 后台启动、停止、状态检查

### v0.2.x — 稳定性修复

- 修复推理模型流式超时
- 修复工具调用流式中断
- keepalive 心跳机制
- 管理面板升级

---

## 📄 许可证

[AGPL-3.0](LICENSE)

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## ⭐ 支持

如果这个项目对你有帮助，请给个 Star 支持一下！
