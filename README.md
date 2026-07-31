<p align="center">
  <img src="https://img.shields.io/badge/Python-3.12+-blue?logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/stdlib-Only-lightgrey?logo=python&logoColor=white" alt="Zero Dependencies">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4">
  <img src="https://img.shields.io/badge/shadcn/ui-4-000000?logo=shadcnui&logoColor=white" alt="shadcn/ui">
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite 8">
  <img src="https://img.shields.io/badge/Vercel-Deploy-black?logo=vercel&logoColor=white" alt="Vercel">
  <img src="https://img.shields.io/badge/Docker-Supported-2496ED?logo=docker&logoColor=white" alt="Docker">
</p>

<h1 align="center">🚀 glm2api</h1>

<p align="center">
  <strong>将智谱清言 GLM Web 端接口转换为标准 OpenAI / Anthropic 兼容 API 的轻量代理</strong>
</p>

<p align="center">
  <strong>零外部 Python 依赖 · 游客模式开箱即用 · 内置 React 管理面板 · 78+ 模型支持</strong>
</p>

<p align="center">
  <a href="#-功能特性">功能特性</a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-部署方式">部署方式</a> •
  <a href="#-api-文档">API 文档</a> •
  <a href="#-管理面板">管理面板</a> •
  <a href="#-模型列表">模型列表</a> •
  <a href="#-配置说明">配置说明</a> •
  <a href="#-常见问题">常见问题</a>
</p>

---

## 🌟 功能特性

| 功能 | 说明 |
|:---|:---|
| 🔄 **OpenAI 兼容** | 完全兼容 `/v1/chat/completions`、`/v1/responses`、`/v1/models` 接口 |
| 🤖 **Anthropic 兼容** | 支持 `/v1/messages` 接口，兼容 Claude Code 等客户端 |
| 🖼️ **图片生成** | 兼容 `/v1/images/generations`，支持 CogView 系列模型 |
| 🎭 **游客模式** | 无需任何 Token 即可使用，零配置开箱即用 |
| 🌐 **多账号负载均衡** | 支持多个 GLM refresh_token 组成账号池，自动轮换调度 |
| 🛡️ **防风控** | device_id 自动轮换、并发控制、请求间隔管理 |
| 🔑 **API Key 管理** | 灵活的多 Key 认证，启用/禁用切换，自动持久化 |
| 📊 **管理面板** | React 19 现代化管理后台，8 个功能模块 |
| 🌊 **流式输出** | 完整支持 SSE 流式响应，含心跳保活 |
| 🛠️ **工具调用** | 完整支持 Function Calling / Tool Use |
| 🚀 **零外部依赖** | 纯 Python 标准库实现，仅需 certifi |
| 📦 **Docker 支持** | Docker / Docker Compose 一键部署 |
| 📱 **响应式设计** | 管理面板适配桌面端侧栏 + 移动端底部导航 |
| 🌙 **主题切换** | 深色/浅色/自动跟随系统，3 种主题模式 |
| 🔒 **安全认证** | HMAC 签名 Session Cookie + 登录限流 + CSRF 防护 |

---

## 🚀 快速开始

### 环境要求

- Python 3.12+（唯一硬性要求）
- Node.js 18+（仅构建管理面板前端时需要）

> 💡 **如果不想配置任何 Token，直接启动即可自动进入游客模式，开箱即用！**

### 1. 克隆仓库

```bash
git clone https://github.com/t479842598/glm2api-New.git
cd glm2api
```

### 2. 安装

```bash
# 创建虚拟环境（推荐）
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 安装（仅依赖 setuptools + certifi）
pip install -e .
```

### 3. 配置环境变量（可选）

```bash
cp .env.example .env
```

编辑 `.env`，至少填写：

```env
# 🔑 管理员密钥（管理面板登录密码）
ADMIN_KEY=glm2api-admin

# 🎭 游客模式（不填 Token 自动启用，无需任何操作）
# 如需使用真实 Token，填写以下变量：
# GLM_REFRESH_TOKEN=your_refresh_token_here
```

### 4. 启动服务

```bash
python -m glm2api
# 或
python main.py
```

### 5. 验证

```bash
# 健康检查
curl http://localhost:8000/health
# → {"status":"ok"}

# 查看模型列表
curl http://localhost:8000/v1/models
# → 返回 78+ 个可用模型

# 测试对话（游客模式，无需 API Key）
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-4-flash","messages":[{"role":"user","content":"你好"}]}'

# 流式输出
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model":"glm-4-flash",
    "stream":true,
    "messages":[{"role":"user","content":"写一首诗"}]
  }'
```

### 🖥️ 访问管理面板

| 地址 | 用途 |
|------|------|
| `http://localhost:8000/admin` | 🎨 管理面板 |
| `http://localhost:8000/v1/chat/completions` | 📡 API 端点 |
| `http://localhost:8000/v1/models` | 📋 模型列表 |
| `http://localhost:8000/health` | 💚 健康检查 |
| `glm2api-admin` | 🔑 默认管理员密码 |

---

## 🌐 部署方式

### 方式一：Docker Compose 部署（推荐）

```bash
# 1. 克隆仓库
git clone https://github.com/t479842598/glm2api-New.git
cd glm2api

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env

# 3. 启动
docker compose up -d
```

`docker-compose.yml` 已预制：

```yaml
services:
  glm2api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - HOST=0.0.0.0
      - GLM_USE_GUEST_REFRESH_TOKEN=true  # 游客模式
      - ADMIN_KEY=glm2api-admin
    restart: unless-stopped
    volumes:
      - ./.env:/app/.env  # 持久化配置
```

### 方式二：Docker 部署

```bash
# 构建镜像
docker build -t glm2api .

# 游客模式启动
docker run -d -p 8000:8000 \
  -e GLM_USE_GUEST_REFRESH_TOKEN=true \
  -e ADMIN_KEY=your-secret-key \
  --name glm2api \
  --restart unless-stopped \
  glm2api

# 使用真实 Token 启动
docker run -d -p 8000:8000 \
  -v ./token.txt:/app/token.txt \
  -v ./.env:/app/.env \
  --name glm2api \
  --restart unless-stopped \
  glm2api
```

### 方式三：Vercel Serverless 部署

本项目支持部署到 Vercel Serverless 平台。已在 `vercel.json` 中配置好所有路由规则。

> ⚠️ **Vercel 免费版限制**：函数执行时间 ≤ 10s，流式响应可能受 Hobby 计划函数时长限制。适合轻量使用，流量大建议 Docker/服务器部署。

#### 部署步骤

1. **Fork 仓库**：在 GitHub 上 Fork 本仓库到你的账号

2. **连接 Vercel**：
   - 登录 [Vercel](https://vercel.com)
   - 点击 **"New Project"**
   - 选择 Fork 的仓库
   - 框架预设选择 **"Other"**
   - 点击 **"Deploy"**

3. **配置环境变量**：
   在 Vercel 项目设置 → **Environment Variables** 中添加：

   | 变量名 | 必填 | 说明 |
   |:---|:---:|:---|
   | `ADMIN_KEY` | ✅ | 管理面板登录密码 |
   | `GLM_REFRESH_TOKEN` | ❌ | GLM Token（不填则游客模式） |
   | `LOG_LEVEL` | ❌ | 日志级别（默认 INFO） |

4. **重新部署**：添加环境变量后，在 Deployments 页面点击 **"Redeploy"**

### 方式四：VPS / Systemd 部署

适用于 Ubuntu / Debian / CentOS 等 Linux 发行版。

```bash
# 1. 上传项目到服务器
rsync -avz --exclude='.git' --exclude='__pycache__' --exclude='.venv' \
  -e 'ssh -p 22' ./ root@你的服务器IP:/opt/glm2api/

# 2. SSH 登录服务器
ssh root@你的服务器IP

# 3. 安装依赖
cd /opt/glm2api
python3 -m venv .venv
source .venv/bin/activate
pip install -e .

# 4. 配置环境变量
cp .env.example .env
vim .env  # 编辑配置

# 5. 创建 systemd 服务
sudo tee /etc/systemd/system/glm2api.service <<EOF
[Unit]
Description=glm2api - GLM to OpenAI API Proxy
After=network.target

[Service]
Type=simple
User=nobody
WorkingDirectory=/opt/glm2api
ExecStart=/opt/glm2api/.venv/bin/python3 -m glm2api
Restart=on-failure
RestartSec=5
EnvironmentFile=/opt/glm2api/.env

[Install]
WantedBy=multi-user.target
EOF

# 6. 启动并设置开机自启
sudo systemctl daemon-reload
sudo systemctl enable --now glm2api

# 7. 查看日志
sudo journalctl -u glm2api -f
```

### 方式五：Nginx 反向代理（生产环境推荐）

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate     /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # SSE 流式支持
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 300s;
        chunked_transfer_encoding on;
    }
}
```

---

## 📚 API 文档

### OpenAI 兼容接口

#### 获取模型列表

```http
GET /v1/models
```

返回 78+ 个可用模型 ID，包括 GLM-4 系列、CogView 系列、多模态模型等。

#### Chat Completions（非流式）

```http
POST /v1/chat/completions
Content-Type: application/json

{
  "model": "glm-4-flash",
  "messages": [
    {"role": "system", "content": "你是一个有帮助的助手。"},
    {"role": "user", "content": "你好"}
  ],
  "temperature": 0.7,
  "max_tokens": 2048
}
```

**响应示例**：

```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1717344000,
  "model": "glm-4-flash",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "你好！有什么我可以帮助你的吗？"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 15,
    "total_tokens": 35
  }
}
```

#### Chat Completions（流式）

```http
POST /v1/chat/completions
Content-Type: application/json

{
  "model": "glm-4-flash",
  "messages": [
    {"role": "user", "content": "写一首关于秋天的诗"}
  ],
  "stream": true
}
```

#### Responses API

```http
POST /v1/responses
Content-Type: application/json

{
  "model": "glm-4-flash",
  "input": "今天有什么值得关注的新闻？"
}
```

#### 图片生成

```http
POST /v1/images/generations
Content-Type: application/json

{
  "model": "cogview-3-plus",
  "prompt": "画一只在枫叶上休息的小猫",
  "size": "1024x1024"
}
```

### Anthropic 兼容接口

```http
POST /v1/messages
Content-Type: application/json
x-api-key: your-api-key

{
  "model": "glm-4-flash",
  "max_tokens": 2048,
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "stream": true
}
```

### 支持的参数

| 参数 | 支持 | 说明 |
|:---:|:---:|:---|
| `model` | ✅ | 模型 ID（见下方模型列表） |
| `messages` | ✅ | 消息数组（system / user / assistant） |
| `stream` | ✅ | 是否启用 SSE 流式输出 |
| `temperature` | ✅ | 温度参数（0-2） |
| `max_tokens` | ✅ | 最大输出 token 数 |
| `top_p` | ✅ | Top-p 采样 |
| `stop` | ✅ | 停止词（字符串或数组） |
| `tools` | ✅ | 工具调用 / Function Calling |
| `tool_choice` | ✅ | 工具选择策略 |
| `frequency_penalty` | ✅ | 频率惩罚 |
| `presence_penalty` | ✅ | 存在惩罚 |

---

## 🖥️ 管理面板

访问 `/admin` 进入管理面板，默认管理员密钥：`glm2api-admin`。

### 全部功能模块（8 个）

| # | 模块 | 路由 | 功能说明 |
|:---:|:---|:---|:---|
| 1 | 📊 **概览** | `/admin/dashboard` | 服务运行时间、账号池状态（总数/游客/Token）、API Key 启用数、总请求数、近期请求成功率分布图、最近异常请求列表（可点击查看详情）、运行状态面板（日志保留/并发槽位/时区）、快捷操作入口、模型数量统计 |
| 2 | ⚙️ **配置与 Token** | `/admin/config` | 基础配置：监听地址、API 前缀、日志级别、并发上限、请求超时、管理员密钥、CORS；GLM 账号池：账号总数、Token 来源、助手 ID、账号列表（分页/可复制）；模型列表（前 20 个）；认证配置状态 |
| 3 | 🗂️ **账号管理** | `/admin/token` | 账号池概览（总数、模式、来源、并发上限、GLM Base URL）；账号卡片列表（编号、脱敏 Token、游客/Token 标签、一键复制）；运行参数详情（助手 ID、重试次数、超时、Debug 开关等） |
| 4 | 🔑 **API Keys** | `/admin/keys` | 创建/删除/启用/禁用 API Key；一键复制；自动持久化到 `.env`；多 Key 管理 |
| 5 | 📋 **请求日志** | `/admin/logs` | 六维筛选器（关键词/状态/流式类型/模型/Key 名称/路径）；分页浏览；详细表格（时间、Request ID、Key、GLM 账号、请求路径+错误、模型、状态码、耗时）；**默认 5 秒自动刷新、最新日志在上**；支持清空筛选 |
| 6 | 📄 **日志详情** | `/admin/logs/:id` | 完整请求信息：请求头、请求体（JSON 高亮/原始文本）、响应头、响应体、流式 SSE 原始数据、错误摘要、curl 命令模板 |
| 7 | 📝 **应用日志** | `/admin/app-logs` | 实时日志流（2 秒增量轮询）；级别过滤（DEBUG/INFO/WARNING/ERROR）；彩色级别标签；logger 来源显示；**默认自动刷新、最新日志在上**；可暂停/恢复 |
| 8 | 💬 **对话测试** | `/admin/chat-test` | 在线测试全部 78+ 模型；选择模型、输入 prompt、即时查看回复 |

### 主题切换

管理面板右上角用户菜单提供三种主题模式：

| 模式 | 说明 |
|:---|:---|
| 🌙 **跟随系统** | 自动匹配 macOS / Windows 深色/浅色偏好 |
| 🌿 **Porcelain Moss** | 浅色主题（瓷白灰绿配色） |
| 🌑 **Tungsten Night** | 深色主题（深石墨配色） |

### 响应式设计

| 设备 | 导航方式 |
|:---|:---|
| 🖥️ **桌面端** | 左侧固定侧边栏导航 |
| 📱 **移动端** | 底部固定 Tab 导航栏（6 个核心模块） |

---

## 🤖 模型列表

### GLM-4 系列（对话模型）

| 模型 ID | 说明 |
|:---|:---|
| `glm-4-flash` | ⚡ Flash 版本，快速响应，适合日常对话 |
| `glm-4-flashx` | ⚡ FlashX 版本，更快的响应速度 |
| `glm-4-plus` | 💪 Plus 版本，高性能推理 |
| `glm-4-air` | 💨 Air 版本，轻量高效 |
| `glm-4-airx` | 💨 AirX 版本，更强轻量能力 |
| `glm-4-long` | 📝 Long 版本，超长上下文（128K+） |
| `glm-4` | 🎯 标准版本 |

### 联网搜索变体

| 模型 ID | 说明 |
|:---|:---|
| `glm-4-flash-search` | ⚡ Flash + 联网搜索 |
| `glm-4-plus-search` | 💪 Plus + 联网搜索 |
| `glm-4-air-search` | 💨 Air + 联网搜索 |

### 深度思考变体

| 模型 ID | 说明 |
|:---|:---|
| `glm-4-flash-thinking` | ⚡ Flash + 深度思考 |
| `glm-4-plus-thinking` | 💪 Plus + 深度思考 |
| `glm-4-air-thinking` | 💨 Air + 深度思考 |

### CogView 系列（图片生成）

| 模型 ID | 说明 |
|:---|:---|
| `cogview-3-plus` | 🖼️ 高质量图片生成 |
| `cogview-3-flash` | ⚡ 快速图片生成 |
| `cogview-3` | 🎨 标准图片生成 |
| `cogview-4` | 🚀 最新一代图片生成 |

### 多模态模型

| 模型 ID | 说明 |
|:---|:---|
| `glm-4v-flash` | 👁️ Flash 视觉模型 |
| `glm-4v-plus` | 👁️ Plus 视觉模型 |

### CodeGeeX 系列（代码生成）

| 模型 ID | 说明 |
|:---|:---|
| `codegeex-4` | 💻 代码生成模型 |

> 📋 **完整模型列表**（78+ 个）可通过 `GET /v1/models` 获取，包含上述所有模型及其全部变体组合。

---

## 🔑 API Key 认证

glm2api 默认**不需要 API Key**即可访问所有接口。如果你希望对外部调用进行鉴权，有两种方式：

### 方式一：管理面板管理（推荐）

在管理面板的 **API Keys** 页面增删改查，操作自动持久化到 `.env` 文件。

- ✅ 创建 Key 时可自定义名称和密钥值
- ✅ 支持启用/禁用切换
- ✅ 一键复制 Key
- ✅ 支持多 Key 同时管理
- ✅ 重启服务后自动恢复

### 方式二：环境变量配置

在 `.env` 中直接配置：

```env
# 静态 Key（逗号分隔）
SERVER_API_KEYS=sk-key-1,sk-key-2

# 或结构化 Key（JSON 格式，管理面板自动维护）
GLM2API_API_KEYS=[{"name":"my-key","key":"sk-xxx","enabled":true,"created_at":"2026-01-01 00:00:00"}]
```

### 认证行为

| 状态 | `/v1/*` 接口行为 |
|:---|:---|
| **无任何 Key** | 免认证，任何人都可访问 |
| **有至少一个启用的 Key** | 需要 `Authorization: Bearer <key>` |
| **所有 Key 被禁用或删除** | 恢复免认证 |

### 使用示例

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://127.0.0.1:8000/v1",
    api_key="sk-your-api-key",  # 管理面板创建的 Key
)

response = client.chat.completions.create(
    model="glm-4-flash",
    messages=[{"role": "user", "content": "你好"}],
)
print(response.choices[0].message.content)
```

```bash
# cURL
curl http://127.0.0.1:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-your-api-key" \
  -d '{"model":"glm-4-flash","messages":[{"role":"user","content":"你好"}]}'
```

---

## 🌐 多账号负载均衡

### token.txt 格式

创建 `token.txt`（默认路径），每行一个 `refresh_token`：

```
# GLM 账号 1
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx...

# GLM 账号 2
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.yyy...

# GLM 账号 3
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.zzz...
```

也可通过 `GLM_TOKEN_FILE` 环境变量指定其他路径。

### 调度策略

1. 过滤：只选**启用**、**健康**、**未冷却**、**未超并发**的账号
2. 排序：优先选择当前占用请求数（`in_flight`）最少的账号
3. 轮询：同分时按轮询顺序分配

### 失败处理

| 错误类型 | 处理策略 |
|:---|:---|
| `429 Too Many Requests` | 按 `Retry-After` 冷却，默认 60 秒 |
| `5xx / 网络错误 / 流中断` | 冷却 30 秒后重试 |
| `401 / 403 / Token 刷新失败` | 标记异常，需手动刷新或替换 |
| 非流式请求 | 返回响应前可切换其他健康账号 |
| 流式请求 | 仅在未输出任何 chunk 前可换号 |

---

## ⚙️ 配置说明

### 获取 GLM Refresh Token

1. 用浏览器打开 [chatglm.cn](https://chatglm.cn) 并登录
2. 按 `F12` → `Application` → `Local Storage`
3. 找到 `chatglm_refresh_token`
4. 复制值填入 `.env` 的 `GLM_REFRESH_TOKEN`
5. **不填则自动进入游客模式**

### 完整配置项

#### 服务配置

| 变量 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| `HOST` | str | `127.0.0.1` | 监听地址；局域网共享设为 `0.0.0.0` |
| `PORT` | int | `8000` | 监听端口 |
| `API_PREFIX` | str | `/v1` | API 路径前缀 |
| `LOG_LEVEL` | str | `INFO` | 日志级别：DEBUG / INFO / WARNING / ERROR |
| `DEBUG_DUMP_ALL` | bool | `false` | 调试模式：输出全部请求/响应详情 |
| `REQUEST_TIMEOUT_SECONDS` | int | `120` | 上游请求超时（秒） |
| `CORS_ALLOW_ORIGIN` | str | `*` | CORS 允许来源 |

#### 认证配置

| 变量 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| `ADMIN_KEY` | str | `glm2api-admin` | 🔑 管理面板登录密码 |
| `SERVER_API_KEYS` | str | — | 静态 API Key（逗号分隔） |
| `GLM2API_API_KEYS` | str | — | 结构化 API Key（管理面板自动管理） |

#### GLM 上游配置

| 变量 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| `GLM_REFRESH_TOKEN` | str | — | 单账号 refresh_token（兜底配置） |
| `GLM_TOKEN_FILE` | str | `token.txt` | 多账号 Token 文件路径 |
| `GLM_USE_GUEST_REFRESH_TOKEN` | bool | `false` | 强制游客模式 |
| `GLM_BASE_URL` | str | `https://chatglm.cn/chatglm` | GLM Web 端地址 |
| `GLM_ASSISTANT_ID` | str | `65940acff94777010aa6b796` | 默认聊天助手 ID |
| `GLM_IMAGE_ASSISTANT_ID` | str | `65a232c082ff90a2ad2f15e2` | 图片生成助手 ID |
| `GLM_MAX_CONCURRENCY` | int | `100` | 上游并发槽位数 |
| `GLM_QUEUE_WAIT_TIMEOUT_SECONDS` | int | `600` | 排队等待超时 |
| `GLM_BUSY_MAX_RETRIES` | int | `30` | 上游忙碌时重试次数 |
| `GLM_BUSY_RETRY_INTERVAL_SECONDS` | int | `2` | 忙碌重试间隔 |
| `GLM_GUEST_MAX_RETRIES` | int | `3` | 游客 Token 获取失败重试次数 |
| `GLM_DELETE_CONVERSATION` | bool | `true` | 完成后是否删除 GLM 会话 |
| `BLOCKED_TOOL_NAMES` | str | 多个值 | 工具黑名单（逗号分隔） |
| `GLM_USER_AGENT` | str | Chrome UA | 自定义 User-Agent |

---

## 🛡️ 安全建议

1. **修改默认密钥**：生产环境务必修改 `ADMIN_KEY`（默认 `glm2api-admin`）
2. **使用 HTTPS**：生产环境必须配置 SSL/TLS，推荐 Nginx 反向代理
3. **设置 API Key**：公网部署时务必启用 API Key 认证
4. **限制访问**：通过防火墙限制管理面板的访问来源 IP
5. **保护 Token**：`.env` 和 `token.txt` 包含敏感信息，切勿提交到 Git
6. **定期轮换**：定期更换管理员密钥和 API Key

---

## 🛠️ 技术栈

### 后端（Python）

| 组件 | 技术 | 说明 |
|:---|:---|:---|
| 语言 | Python 3.12+ | 纯标准库实现 |
| HTTP 服务器 | `http.server` | Python 内置，零外部依赖 |
| SSL/TLS | `ssl` + certifi | 自动证书验证 |
| 并发模型 | `threading` | 多线程处理 |
| 日志系统 | `logging` | 彩色终端输出 + 内存缓冲 |
| 认证 | HMAC-SHA256 | Session Cookie 签名 |
| 持久化 | `.env` 文件 | API Key 自动回写 |

### 前端（管理面板）

| 组件 | 技术 | 版本 |
|:---|:---|:---|
| 框架 | React | 19.x |
| 语言 | TypeScript | 6.x |
| 构建工具 | Vite | 8.x |
| CSS | Tailwind CSS | 4.x |
| UI 组件 | shadcn/ui | 4.x |
| 路由 | React Router DOM | 6.x |
| 图标 | Lucide React | 1.x |
| 主题 | next-themes | 0.x |
| Toast | Sonner | 2.x |
| 动画 | tw-animate-css | 1.x |

---

## 🏗️ 项目架构

```
glm2api/
├── src/glm2api/                  # 🐍 Python 后端（核心代码）
│   ├── __init__.py               # 版本声明
│   ├── __main__.py               # CLI 入口（python -m glm2api）
│   ├── app.py                    # 应用生命周期 + SSL 上下文管理
│   ├── config.py                 # 配置加载、校验、环境变量解析
│   ├── server.py                 # HTTP 路由分发 + SSE 流式 + 请求记录
│   ├── admin.py                  # 管理面板 API（8 大模块后端支持）
│   ├── logging_utils.py          # 彩色日志 + 内存缓冲（供面板读取）
│   ├── model_profiles.py         # 78+ 模型定义与参数配置
│   ├── model_variants.py         # 模型变体自动生成
│   ├── core/
│   │   ├── openai_compat.py      # OpenAI 标准响应结构构造
│   │   └── tokenizer.py          # 近似 token 计数
│   ├── services/
│   │   ├── glm_client.py         # GLM Web API 客户端（HTTP + SSE 解析）
│   │   ├── glm_auth.py           # 认证管理（refresh → access token）
│   │   ├── translator.py         # GLM → OpenAI 格式转换
│   │   ├── anthropic_adapter.py  # Anthropic Messages API 适配
│   │   └── responses_adapter.py  # Responses API 适配
│   ├── utils/
│   │   ├── tool_parser.py        # 工具调用流式增量解析器
│   │   └── tool_protocol.py      # 工具协议常量定义
│   └── admin_web/                # 🎨 React 前端构建产物（自动生成）
│
├── web/                          # 🎨 React 管理面板前端源码
│   ├── package.json              # 依赖声明
│   ├── vite.config.ts            # Vite 构建配置
│   └── src/
│       ├── App.tsx               # 路由配置（8 个页面）
│       ├── pages/                # 8 个功能页面
│       │   ├── LoginPage.tsx     # 🔐 登录页
│       │   ├── DashboardPage.tsx # 📊 概览仪表盘
│       │   ├── ConfigPage.tsx    # ⚙️ 配置与 Token
│       │   ├── TokenPage.tsx     # 🗂️ 账号管理
│       │   ├── KeysPage.tsx      # 🔑 API Keys
│       │   ├── LogsPage.tsx      # 📋 请求日志
│       │   ├── LogDetailPage.tsx # 📄 日志详情
│       │   ├── AppLogsPage.tsx   # 📝 应用日志
│       │   └── ChatTestPage.tsx  # 💬 对话测试
│       ├── components/           # 可复用组件库
│       │   ├── layout/           # 布局组件
│       │   ├── shared/           # 通用组件（分页/加载/复制/骨架屏）
│       │   ├── logs/             # 日志组件（JSON 树形视图）
│       │   ├── theme/            # 主题系统（provider + context）
│       │   └── ui/               # shadcn/ui 基础组件
│       ├── hooks/                # React Hooks
│       │   ├── use-auth.tsx      # 认证（登录/登出/会话管理）
│       │   └── use-polling.ts    # 轮询（带竞态保护）
│       ├── lib/
│       │   ├── api-client.ts     # API 客户端
│       │   └── utils.ts          # 工具函数
│       └── types/
│           └── index.ts          # TypeScript 类型定义
│
├── api/                          # Vercel Serverless 函数入口
├── tests/                        # pytest 测试用例
├── main.py                       # 🏃 应用入口（含公告信息）
├── Dockerfile                    # 🐳 Docker 镜像构建
├── docker-compose.yml            # 🐳 Docker Compose 编排
├── vercel.json                   # ⚙️ Vercel 部署配置
├── .env.example                  # 📝 环境变量模板（完整注释）
├── pyproject.toml                # 📦 Python 项目元数据
└── README.md                     # 📖 本文件
```

---

## 🔧 开发指南

### 环境准备

```bash
# 1. Python 后端
python3 -m venv .venv
source .venv/bin/activate
pip install -e .

# 2. 前端
cd web
npm install
```

### 本地开发

**后端开发**：

```bash
# 启动后端（默认 8000 端口）
python -m glm2api
```

**前端开发**（热重载）：

```bash
cd web

# 启动开发服务器（默认 localhost:5173）
npm run dev
# vite.config.ts 自动代理 /admin/api → http://localhost:8000
```

**构建前端**：

```bash
cd web

# 生产构建（产物输出到 src/glm2api/admin_web/）
npm run build

# 之后重启后端即可通过 /admin 访问最新面板
```

### 代码质量

```bash
# Python 测试
pytest tests/ -v

# 前端 Lint
cd web && npm run lint
```

---

## ❓ 常见问题

<details>
<summary><strong>Q: 启动后访问 /admin 显示空白页？</strong></summary>

A: 管理面板需要先构建前端产物：

```bash
cd web && npm install && npm run build
```

然后重启后端服务。
</details>

<details>
<summary><strong>Q: 如何获取 GLM Refresh Token？</strong></summary>

A:

1. 用浏览器打开 [chatglm.cn](https://chatglm.cn) 并登录
2. 按 `F12` → `Application` → `Local Storage`
3. 找到键名 `chatglm_refresh_token`，复制其值
4. 填入 `.env`：`GLM_REFRESH_TOKEN=复制的值`
</details>

<details>
<summary><strong>Q: 游客模式有使用限制吗？</strong></summary>

A: 游客模式无需任何配置即可使用，但智谱对游客有频率限制，适合轻量测试。生产环境或高频使用建议配置真实 `refresh_token`。
</details>

<details>
<summary><strong>Q: 如何添加多个 GLM 账号实现负载均衡？</strong></summary>

A: 创建 `token.txt` 文件，每行一个 `refresh_token`：

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token1...
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token2...
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token3...
```

程序会自动轮换使用。也可设置 `GLM_TOKEN_FILE=/custom/path/tokens.txt` 指定其他路径。
</details>

<details>
<summary><strong>Q: 管理面板忘记密码怎么办？</strong></summary>

A: 查看 `.env` 文件中 `ADMIN_KEY` 的值，即为当前密码。默认密码是 `glm2api-admin`。
</details>

<details>
<summary><strong>Q: 支持哪些客户端接入？</strong></summary>

A: 所有支持 OpenAI API 格式的客户端都可以接入，包括：

- **开发框架**：OpenAI Python/Node.js SDK、LangChain、AutoGen
- **聊天客户端**：LobeChat、NextChat（ChatGPT-Next-Web）、ChatBox
- **编程工具**：Cursor、Continue（VS Code）、Cline
- **Claude Code**：通过 `/v1/messages` 接口（Anthropic 兼容）
- **其他**：任何支持自定义 API Base URL 的工具
</details>

<details>
<summary><strong>Q: 支持哪些模型变体？</strong></summary>

A: 每个基础模型支持以下变体组合：

- **联网搜索**：模型 ID 加 `-search` 后缀
- **深度思考**：模型 ID 加 `-thinking` 后缀
- **Agent 模式**：模型 ID 加 `-agent` 后缀

例如 `glm-4-flash` 可衍生出 `glm-4-flash-search`、`glm-4-flash-thinking`、`glm-4-flash-thinking-search` 等。总计 78+ 个可用模型，完整列表通过 `GET /v1/models` 查看。
</details>

<details>
<summary><strong>Q: Vercel 部署流式响应有问题？</strong></summary>

A: Vercel Hobby 计划函数执行时间上限为 10 秒，长流式响应可能超时中断。建议：
- 短期/轻量使用可接受
- 需要长流式输出建议使用 Docker 或 VPS 部署
- 可升级 Vercel Pro 计划解除时长限制
</details>

<details>
<summary><strong>Q: 如何配置 HTTPS？</strong></summary>

A: 推荐使用 Nginx / Caddy 作为反向代理，在代理层配置 SSL 证书。后端保持 HTTP 即可。参考上方"部署方式 → Nginx 反向代理"章节。
</details>

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'feat: Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

---

## 📄 许可证

本项目使用 [AGPL-3.0](LICENSE) 许可证。

---

## 📢 免责声明

本项目为非官方开源项目，与智谱 AI / 智谱清言及其关联方无任何从属、授权或合作关系。相关名称仅用于说明兼容对象，商标及权益归其权利人所有。

使用者应自行遵守相关服务协议及法律法规，并仅使用合法持有的账号、Token 或 API Key。本项目不鼓励也不支持绕过官方限制、批量滥用、账号/Token 共享、转售、出租或向第三方提供代理服务。

本项目按"现状"提供，维护者不对因使用本项目导致的账号限制、服务不可用、数据或费用损失、法律纠纷等后果承担责任。

---

<p align="center">
  <strong>⭐ 如果觉得有用，请给个 Star 支持一下！</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/t479842598/glm2api-New?style=social" alt="Stars">
  <img src="https://img.shields.io/github/forks/t479842598/glm2api-New?style=social" alt="Forks">
</p>

---

<p align="center">
  <sub>Built with ❤️ using Python stdlib + React 19 + Tailwind CSS 4</sub>
</p>
