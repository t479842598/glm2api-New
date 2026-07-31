# glm2api

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ft479842598%2Fglm2api-New&env=ADMIN_KEY&envDescription=%E7%AE%A1%E7%90%86%E9%9D%A2%E6%9D%BF%E7%99%BB%E5%BD%95%E5%AF%86%E9%92%A5%EF%BC%8C%E9%BB%98%E8%AE%A4%E4%B8%BA%20glm2api-admin)

> **ChatGLM → OpenAI / Anthropic 兼容 API 代理** — 零外部 Python 依赖，内置现代化 React 管理面板

---

## 📑 目录

- [特性亮点](#-特性亮点)
- [支持接口](#-支持接口)
- [管理面板](#-管理面板)
- [快速开始](#-快速开始)
- [部署指南](#-部署指南)
  - [本地运行](#本地运行)
  - [Docker 部署](#docker-部署)
  - [VPS / Systemd 部署](#vps--systemd-部署)
  - [Vercel 部署](#vercel-部署)
- [配置说明](#-配置说明)
- [API Key 认证](#-api-key-认证)
- [多账号负载均衡](#-多账号负载均衡)
- [游客模式](#-游客模式)
- [使用示例](#-使用示例)
- [技术栈](#-技术栈)
- [项目架构](#-项目架构)
- [开发指南](#-开发指南)
- [常见问题](#-常见问题)
- [更新日志](#-更新日志)
- [许可证](#-许可证)

---

## ✨ 特性亮点

### 核心代理能力

- 🔄 **多协议兼容** — 同时支持 OpenAI Chat Completions / Responses API、Anthropic Messages API
- 🌊 **流式 & 非流式** — 完整支持 SSE（Server-Sent Events）流式输出与普通 JSON 响应
- 🖼️ **图片生成** — 支持 GLM 图片生成接口，兼容 OpenAI Images API
- 🛠️ **工具调用** — 支持 Function Calling / Tool Use，含流式 tool call 增量解析
- 📊 **Token 计数** — 内置近似 token 计数器，估算请求/响应 token 用量
- 🛡️ **device_id 防风控** — 自动轮换设备 ID，避免触发智谱频控

### 账号管理

- 🌐 **多账号负载均衡** — 支持多个 GLM refresh_token 组成账号池，按健康状态和轮询策略自动调度
- 🎭 **游客模式** — 无需任何 token，自动使用游客身份，开箱即用
- 🔄 **自动刷新** — refresh_token 自动换取 access_token，token 过期自动重试
- ⚖️ **并发控制** — 可配置上游并发槽位数，避免触发限流

### 管理面板（7 个功能模块）

- 📊 **概览仪表盘** — 服务运行时间、账号池状态、API Key 数量、请求统计、异常日志、快捷操作
- ⚙️ **配置与 Token** — 查看所有运行配置（监听地址、日志级别、模型列表、认证状态等），以及 GLM 账号池
- 🗂️ **账号管理** — 独立的 GLM 账号池管理页面，支持查看账号列表、游客/Token 类型区分、一键复制
- 🔑 **API Keys** — 创建 / 删除 / 启用 / 禁用对外 API 密钥，支持一键复制，自动持久化到 `.env`
- 📋 **请求日志** — 多维度筛选（状态 / 模型 / Key / 路径 / 流式类型）、分页、请求详情、**默认 5 秒自动刷新，最新日志在上**
- 📝 **应用日志** — 实时日志流、级别过滤（DEBUG / INFO / WARNING / ERROR）、**默认自动刷新，最新日志在上**
- 💬 **对话测试** — 在线测试 GLM 接口，支持全部 78+ 模型，即时查看回复

### 安全与运维

- 🔐 **HMAC 会话认证** — 管理面板使用签名 Cookie + x-admin-session 头双重认证，支持反向代理
- 🚦 **登录限速** — 管理面板登录失败限速保护
- 📦 **零外部 Python 依赖** — 仅依赖 Python 标准库 + certifi（SSL 证书），无需安装第三方包
- 🐳 **Docker / Docker Compose** — 一键容器化部署
- ☁️ **Vercel 支持** — 可通过 Vercel Serverless 部署

---

## 📋 支持接口

### OpenAI 兼容接口

| 方法 | 端点 | 说明 |
|------|------|------|
| `POST` | `/v1/chat/completions` | Chat Completions API（流式 + 非流式） |
| `POST` | `/v1/responses` | Responses API |
| `POST` | `/v1/images/generations` | 图片生成 |
| `GET` | `/v1/models` | 模型列表 |

### Anthropic 兼容接口

| 方法 | 端点 | 说明 |
|------|------|------|
| `POST` | `/v1/messages` | Anthropic Messages API |

### 管理与健康检查

| 方法 | 端点 | 说明 |
|------|------|------|
| `GET` | `/health` | 健康检查 |
| `GET` | `/admin` | 管理面板入口 |

> **注意**：根路径 `/` 不返回服务信息，避免公网部署时暴露服务指纹。

---

## 🎨 管理面板

内置现代化 React 管理面板，访问 `http://127.0.0.1:8000/admin`，默认管理员密码：`glm2api-admin`。

### 全部功能模块

| # | 模块 | 路由 | 功能说明 |
|---|------|------|---------|
| 1 | 📊 **概览** | `/admin/dashboard` | 服务运行时间、账号池状态（总数 / 游客 / Token）、API Key 启用数、总请求数、近期请求成功率分布图、最近异常请求列表（可点击跳转详情）、运行状态面板（日志保留 / 并发槽位 / 时区）、快捷操作入口、模型数量统计 |
| 2 | ⚙️ **配置与 Token** | `/admin/config` | 基础配置：监听地址、API 前缀、日志级别、并发上限、请求超时、管理员密钥、CORS 来源；GLM 账号池：账号总数、Token 来源、助手 ID、账号列表（分页、可复制）；模型列表（前 20 个）；认证配置状态 |
| 3 | 🗂️ **账号管理** | `/admin/token` | 账号池概览（总数、模式、来源、并发上限、GLM Base URL）；账号卡片列表（编号、脱敏 Token、游客/Token 标签、一键复制）；运行配置详情（助手 ID、图像助手 ID、重试次数、超时、Debug Dump 开关、日志级别）；支持分页、刷新 |
| 4 | 🔑 **API Keys** | `/admin/keys` | 创建 API Key（自定义名称和密钥）、删除 Key、启用/禁用切换、一键复制 Key、查看创建时间；API Key 在管理面板中增删改会自动持久化到 `.env` 文件 |
| 5 | 📋 **请求日志** | `/admin/logs` | 六维筛选器（关键词搜索、状态、流式类型、模型、Key 名称、路径）；分页浏览；表格展示（时间、Request ID、Key、GLM 账号、请求路径+错误信息、模型、状态码、流式标签、耗时）；点击跳转详情；**默认 5 秒自动刷新，最新日志显示在最上面；支持清空筛选、手动刷新** |
| 6 | 📄 **日志详情** | `/admin/logs/:id` | 请求基本信息、请求头、请求体（JSON 高亮 / 原始文本）、响应头、响应体、流式 SSE 原始数据、curl 命令模板 |
| 7 | 📝 **应用日志** | `/admin/app-logs` | 实时日志流（2 秒轮询增量追加）；级别过滤（DEBUG / INFO / WARNING / ERROR）；彩色级别标签；logger 来源显示；**默认自动刷新，最新日志在上；可暂停/恢复自动刷新；支持手动刷新和清空** |
| 8 | 💬 **对话测试** | `/admin/chat-test` | 选择任意 GLM 模型（78+ 个）、输入测试 prompt、即时发送并查看回复（支持多轮） |

### 主题切换

管理面板内建三种主题模式，通过右上角用户菜单切换：

| 模式 | 说明 |
|------|------|
| 🌙 **跟随系统** | 自动匹配 macOS / Windows 深色/浅色偏好 |
| 🌿 **Porcelain Moss** | 浅色主题（瓷白灰绿配色） |
| 🌑 **Tungsten Night** | 深色主题（深石墨配色） |

### 响应式设计

- 🖥️ **桌面端** — 左侧固定导航栏，右侧内容区
- 📱 **移动端** — 底部固定 Tab 导航栏，适配 6 个核心模块入口

---

## 🚀 快速开始

### 前置条件

- Python ≥ 3.12
- （可选）智谱清言账号的 `refresh_token`
- **如果不填任何 token，自动走游客模式，开箱即用！**

### 本地运行

```bash
# 1. 克隆项目
git clone https://github.com/t479842598/glm2api-New.git
cd glm2api

# 2. （可选）创建虚拟环境
python3 -m venv .venv
source .venv/bin/activate

# 3. 安装
pip install -e .

# 4. （可选）配置环境变量
cp .env.example .env
# 编辑 .env 填写 GLM_REFRESH_TOKEN 或修改 ADMIN_KEY

# 5. 启动
python -m glm2api
```

启动后访问：

| 地址 | 用途 |
|------|------|
| `http://127.0.0.1:8000/v1/chat/completions` | API 端点 |
| `http://127.0.0.1:8000/v1/models` | 模型列表 |
| `http://127.0.0.1:8000/admin` | 管理面板 |
| `http://127.0.0.1:8000/health` | 健康检查 |
| `glm2api-admin` | 默认管理员密钥 |

### 验证服务

```bash
# 健康检查
curl http://127.0.0.1:8000/health
# → {"status":"ok"}

# 查看模型列表
curl http://127.0.0.1:8000/v1/models
# → 返回 78+ 个可用模型

# 测试聊天（游客模式，无需 API Key）
curl http://127.0.0.1:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-4-flash","messages":[{"role":"user","content":"你好"}]}'

# 流式输出
curl http://127.0.0.1:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-4-flash","stream":true,"messages":[{"role":"user","content":"写一首诗"}]}'
```

---

## 📦 部署指南

### Docker 部署

```bash
# 克隆并构建
git clone https://github.com/t479842598/glm2api-New.git
cd glm2api

# 复制配置
cp .env.example .env
# 编辑 .env 设置 ADMIN_KEY 和 GLM_REFRESH_TOKEN

# 构建镜像
docker build -t glm2api .

# 运行（使用 .env 文件）
docker run -d -p 8000:8000 \
  --env-file .env \
  --name glm2api \
  --restart unless-stopped \
  glm2api
```

### Docker Compose 部署（推荐）

```bash
# 克隆并启动
git clone https://github.com/t479842598/glm2api-New.git
cd glm2api
cp .env.example .env
# 编辑 .env 后启动

docker compose up -d
```

`docker-compose.yml` 配置说明：

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
      - ./.env:/app/.env  # 持久化配置和 API Keys
```

### VPS / Systemd 部署

适用于 Ubuntu / Debian / CentOS 等 Linux 发行版。

```bash
# 1. 上传项目到服务器
rsync -avz --exclude='.git' --exclude='__pycache__' --exclude='.venv' \
  -e 'ssh -p 22' ./ root@你的服务器IP:/opt/glm2api/

# 2. SSH 登录服务器
ssh root@你的服务器IP

# 3. 安装
cd /opt/glm2api
pip install -e .

# 4. 创建 systemd 服务
cat > /etc/systemd/system/glm2api.service << 'EOF'
[Unit]
Description=glm2api - GLM to OpenAI API Proxy
After=network.target

[Service]
Type=simple
User=nobody
WorkingDirectory=/opt/glm2api
ExecStart=/usr/bin/python3 -m glm2api
Restart=on-failure
RestartSec=5
EnvironmentFile=/opt/glm2api/.env

[Install]
WantedBy=multi-user.target
EOF

# 5. 启动并设置开机自启
systemctl daemon-reload
systemctl enable --now glm2api

# 6. 查看日志
journalctl -u glm2api -f
```

### Vercel 部署

点击下方按钮一键部署到 Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ft479842598%2Fglm2api-New&env=ADMIN_KEY&envDescription=%E7%AE%A1%E7%90%86%E9%9D%A2%E6%9D%BF%E7%99%BB%E5%BD%95%E5%AF%86%E9%92%A5%EF%BC%8C%E9%BB%98%E8%AE%A4%E4%B8%BA%20glm2api-admin)

部署时设置环境变量 `ADMIN_KEY`，其他配置按需添加。Vercel 使用 `api/` 目录下的 Serverless Function。

---

## ⚙️ 配置说明

### 获取 GLM Refresh Token

1. 打开 [chatglm.cn](https://chatglm.cn) 并登录智谱清言账号
2. 按 `F12` → `Application` → `Local Storage`
3. 找到 `chatglm_refresh_token`
4. 将其值填入 `.env` 文件中的 `GLM_REFRESH_TOKEN=`
5. **如果不填** — 自动启用游客模式，零配置即可使用

### 完整配置项

| 变量 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `HOST` | str | `127.0.0.1` | 监听地址。局域网共享设为 `0.0.0.0` |
| `PORT` | int | `8000` | 监听端口 |
| `API_PREFIX` | str | `/v1` | API 路径前缀，一般保持 `/v1` |
| `LOG_LEVEL` | str | `INFO` | 日志级别：`DEBUG` / `INFO` / `WARNING` / `ERROR` |
| `DEBUG_DUMP_ALL` | bool | `false` | 调试模式：输出所有入站/上游请求响应详情 |
| `REQUEST_TIMEOUT_SECONDS` | int | `120` | 上游请求超时，单位秒 |
| `CORS_ALLOW_ORIGIN` | str | `*` | CORS 允许来源 |

| 变量 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `ADMIN_KEY` | str | `glm2api-admin` | 管理面板登录密码 |
| `SERVER_API_KEYS` | str | — | 逗号分隔的静态 API Key 列表 |
| `GLM2API_API_KEYS` | str | — | 结构化 API Key（JSON 数组，管理面板自动管理） |

| 变量 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `GLM_REFRESH_TOKEN` | str | — | 单账号 refresh_token（兜底配置） |
| `GLM_TOKEN_FILE` | str | `token.txt` | 多账号 token 文件路径 |
| `GLM_USE_GUEST_REFRESH_TOKEN` | bool | `false` | 强制启用游客模式 |
| `GLM_BASE_URL` | str | `https://chatglm.cn/chatglm` | GLM Web 端基础地址 |
| `GLM_ASSISTANT_ID` | str | `65940acff94777010aa6b796` | 默认聊天助手 ID |
| `GLM_IMAGE_ASSISTANT_ID` | str | `65a232c082ff90a2ad2f15e2` | 图片生成助手 ID |
| `GLM_MAX_CONCURRENCY` | int | `100` | 上游并发槽位数量 |
| `GLM_QUEUE_WAIT_TIMEOUT_SECONDS` | int | `600` | 排队等待超时 |
| `GLM_BUSY_MAX_RETRIES` | int | `30` | 上游忙碌时重试次数 |
| `GLM_BUSY_RETRY_INTERVAL_SECONDS` | int | `2` | 忙碌重试间隔 |
| `GLM_GUEST_MAX_RETRIES` | int | `3` | 游客 token 获取失败重试次数 |
| `GLM_DELETE_CONVERSATION` | bool | `true` | 完成后是否删除 GLM 会话 |
| `BLOCKED_TOOL_NAMES` | str | `open_url,open_ul,...` | 工具黑名单（逗号分隔） |
| `GLM_USER_AGENT` | str | Chrome UA | 自定义 User-Agent |

---

## 🔐 API Key 认证

### 概述

glm2api 提供两种 API Key 管理方式：

1. **静态 Key** — 在 `.env` 的 `SERVER_API_KEYS` 中逗号分隔设置，不支持管理面板操作
2. **结构化 Key** — 在管理面板的 **API Keys** 页面中增删改查，自动持久化到 `.env` 的 `GLM2API_API_KEYS`

### 工作原理

| 状态 | 行为 |
|------|------|
| **未配置任何 Key** | 所有 `/v1/*` 接口免认证，向后兼容 |
| **至少有一个启用的 Key** | `/v1/chat/completions` 等接口需要 `Authorization: Bearer <key>` |
| **禁用或删除所有 Key** | 恢复免认证模式 |

### 使用方式

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://127.0.0.1:8000/v1",
    api_key="你在管理面板中创建的-key",  # 通过管理面板创建的 API Key
)

# 非流式
response = client.chat.completions.create(
    model="glm-4-flash",
    messages=[{"role": "user", "content": "你好"}],
)
print(response.choices[0].message.content)

# 流式
stream = client.chat.completions.create(
    model="glm-4-flash",
    messages=[{"role": "user", "content": "写一首诗"}],
    stream=True,
)
for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### cURL 方式

```bash
curl http://127.0.0.1:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 你的-api-key" \
  -d '{"model":"glm-4-flash","messages":[{"role":"user","content":"你好"}]}'
```

---

## 🌐 多账号负载均衡

### token.txt 格式

创建 `token.txt`，每行一个 `refresh_token`：

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx...
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.yyy...
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.zzz...
```

### 调度策略

1. 只选择**启用**、**健康**、**未冷却**、**未超过并发上限**的账号
2. 优先选择当前占用请求数（`in_flight`）最少的账号
3. 同分时按轮询顺序分配

### 失败处理

| 错误类型 | 处理方式 |
|---------|---------|
| `429 Too Many Requests` | 按 `Retry-After` 冷却，无该头则默认 60 秒 |
| `5xx / 网络错误 / 流中断` | 默认冷却 30 秒 |
| `401 / 403 / token 刷新失败` | 标记为异常，等待手动刷新或替换 |
| 非流式请求 | 未返回响应前可切换其他健康账号重试 |
| 流式请求 | 仅在未输出任何 chunk 前可换号 |

---

## 🎭 游客模式

当未配置 `GLM_REFRESH_TOKEN` 且 `token.txt` 无有效账号时，系统自动进入游客模式。

- 自动按 `GLM_MAX_CONCURRENCY` 创建同等数量的游客账号槽位
- 游客 token 请求失败时自动重试（`GLM_GUEST_MAX_RETRIES` 次）
- 适合快速测试、开发环境、低频使用场景
- 可设置 `GLM_USE_GUEST_REFRESH_TOKEN=true` 强制使用游客模式

---

## 📖 使用示例

### OpenAI SDK (Python)

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://127.0.0.1:8000/v1",
    api_key="dummy",  # 未配置 API Key 时可任意填写
)

# 非流式对话
resp = client.chat.completions.create(
    model="glm-4-flash",
    messages=[{"role": "user", "content": "你好"}],
)
print(resp.choices[0].message.content)

# 流式对话
stream = client.chat.completions.create(
    model="glm-4-flash",
    messages=[{"role": "user", "content": "写一首诗"}],
    stream=True,
)
for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### Anthropic SDK (Python)

```python
import anthropic

client = anthropic.Anthropic(
    base_url="http://127.0.0.1:8000",
    api_key="dummy",
)

message = client.messages.create(
    model="glm-4-flash",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello, how are you?"}],
)
print(message.content[0].text)
```

### 图片生成

```bash
curl http://127.0.0.1:8000/v1/images/generations \
  -H "Content-Type: application/json" \
  -d '{
    "model": "cogview-3-plus",
    "prompt": "画一只在枫叶上休息的小猫",
    "size": "1024x1024"
  }'
```

### 接入 LobeChat / NextChat

1. 在 LobeChat / NextChat 中添加自定义模型提供商
2. API 地址填写：`http://127.0.0.1:8000/v1`
3. API Key 填写你创建的 Key（或任意值）
4. 模型列表会自动从 `/v1/models` 获取

---

## 🛠️ 技术栈

### 后端

| 组件 | 技术 | 说明 |
|------|------|------|
| 语言 | Python 3.12+ | 纯标准库实现，零第三方依赖 |
| HTTP 服务器 | `http.server` (stdlib) | Python 内置 HTTP 服务器 |
| SSL/TLS | `ssl` + certifi | 自动配置证书验证 |
| 并发 | `threading` | 多线程处理并发请求 |
| 日志 | `logging` (stdlib) | 彩色终端输出 + 内存缓冲（供面板读取） |
| 认证 | HMAC-SHA256 | 管理面板会话签名 + Cookie |
| 数据持久化 | `.env` 文件 | API Key 自动回写 `.env` |

### 前端（管理面板）

| 组件 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | React | 19.x | 最新 React 19 |
| 语言 | TypeScript | 6.x | 全类型覆盖 |
| 构建工具 | Vite | 8.x | 极速 HMR |
| CSS 框架 | Tailwind CSS | 4.x | 原子化 CSS |
| UI 组件库 | shadcn/ui | 4.x | 可定制组件库 |
| 路由 | React Router | 6.x | SPA 客户端路由 |
| 图标 | Lucide React | 1.x | 开源图标集 |
| 主题 | next-themes | 0.x | 深色/浅色/系统跟随 |
| Toast | Sonner | 2.x | 轻量通知组件 |
| 动画 | tw-animate-css | 1.x | Tailwind 动画预设 |

---

## 🏗️ 项目架构

```
glm2api-manage/
├── src/glm2api/                   # Python 后端源码
│   ├── __init__.py                # 版本声明 (v0.3.0)
│   ├── __main__.py                # CLI 入口 (python -m glm2api)
│   ├── app.py                     # 应用生命周期 + SSL 上下文
│   ├── config.py                  # 配置加载、校验、环境变量解析
│   ├── logging_utils.py           # 彩色日志输出 + 内存日志缓冲
│   ├── server.py                  # HTTP 路由分发 + SSE 流式 + 请求日志记录
│   ├── admin.py                   # 管理面板 API — 全部 7 模块后端
│   │                              #   stats / config / api-keys / request-logs /
│   │                              #   app-logs / chat-test / session
│   ├── model_profiles.py          # 78+ 模型定义与配置
│   ├── model_variants.py          # 模型变体生成逻辑
│   ├── core/
│   │   ├── openai_compat.py       # OpenAI 标准响应结构构造
│   │   └── tokenizer.py           # 近似 token 计数
│   ├── services/
│   │   ├── glm_client.py          # GLM Web API 客户端（HTTP / SSE 解析）
│   │   ├── glm_auth.py            # 认证管理（refresh → access token）
│   │   ├── translator.py          # GLM 响应 → OpenAI 格式转换
│   │   ├── anthropic_adapter.py   # Anthropic Messages API 适配
│   │   └── responses_adapter.py   # Responses API 适配
│   └── utils/
│       ├── tool_parser.py         # 工具调用流式增量解析器
│       └── tool_protocol.py       # 工具协议常量定义
│
├── web/                           # React 管理面板前端源码
│   ├── package.json               # 前端依赖声明
│   ├── vite.config.ts             # Vite 构建配置（代理 + 输出路径）
│   ├── index.html                 # SPA 入口 HTML
│   └── src/
│       ├── main.tsx               # React 应用入口
│       ├── App.tsx                 # 路由配置（8 个页面路由）
│       ├── index.css               # Tailwind + 全局样式 + 主题变量
│       ├── pages/                  # 页面组件
│       │   ├── LoginPage.tsx       # 登录页
│       │   ├── DashboardPage.tsx   # 概览仪表盘
│       │   ├── ConfigPage.tsx      # 配置与 Token
│       │   ├── TokenPage.tsx       # 🆕 账号管理
│       │   ├── KeysPage.tsx        # API Keys 管理
│       │   ├── LogsPage.tsx        # 请求日志列表
│       │   ├── LogDetailPage.tsx   # 请求日志详情
│       │   ├── AppLogsPage.tsx     # 应用日志实时流
│       │   └── ChatTestPage.tsx    # 在线对话测试
│       ├── components/             # 可复用组件
│       │   ├── layout/
│       │   │   └── AppLayout.tsx   # 管理面板布局（侧栏+顶栏+移动导航）
│       │   ├── shared/             # 通用组件
│       │   │   ├── LogoMark.tsx
│       │   │   ├── CopyButton.tsx
│       │   │   ├── LoadingSpinner.tsx
│       │   │   ├── PaginationControls.tsx
│       │   │   └── PageSkeletons.tsx
│       │   ├── logs/
│       │   │   └── JsonTreeView.tsx
│       │   ├── theme/              # 主题系统
│       │   │   ├── theme-provider.tsx
│       │   │   └── theme-context.ts
│       │   └── ui/                 # shadcn/ui 组件
│       │       ├── button.tsx, badge.tsx, card.tsx, dialog.tsx,
│       │       ├── input.tsx, select.tsx, table.tsx, textarea.tsx,
│       │       ├── separator.tsx, skeleton.tsx, alert.tsx, sonner.tsx
│       ├── hooks/
│       │   ├── use-auth.tsx        # 认证 hook（登录/登出/会话）
│       │   └── use-polling.ts      # 轮询 hook（带竞态保护）
│       ├── lib/
│       │   ├── api-client.ts       # API 客户端（统一请求 + Session Token 管理）
│       │   └── utils.ts            # 通用工具函数
│       └── types/
│           └── index.ts            # TypeScript 类型定义（完整后端接口类型）
│
├── api/                            # Vercel Serverless Function 入口
├── tests/                          # 测试用例 (pytest)
├── scripts/                        # 运维脚本
├── main.py                         # 应用入口（含公告信息）
├── Dockerfile                      # Docker 镜像构建
├── docker-compose.yml              # Docker Compose 编排
├── vercel.json                     # Vercel 部署配置
├── .env.example                    # 环境变量模板（含完整注释）
├── pyproject.toml                  # Python 项目元数据
└── README.md                       # 本文件
```

---

## 🛠️ 开发指南

### 环境准备

```bash
# Python 后端
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"

# 前端
cd web
npm install
```

### 本地开发

**后端**：

```bash
# 启动后端（默认 8000 端口）
python -m glm2api
```

**前端（开发模式）**：

```bash
cd web
npm run dev
# 前端开发服务器默认 http://localhost:5173
# vite.config.ts 自动代理 /admin/api → http://localhost:8000
```

**构建前端**：

```bash
cd web
npm run build
# 产物输出到 src/glm2api/admin_web/
# 之后启动后端即可通过 /admin 访问最新面板
```

### 代码检查

```bash
# Python 测试
pytest tests/ -v

# 前端 Lint
cd web
npm run lint
```

---

## ❓ 常见问题

<details>
<summary><strong>Q: 启动后访问 /admin 显示空白页？</strong></summary>

A: 需要先构建前端产物：
```bash
cd web && npm install && npm run build
```
然后重新启动后端。
</details>

<details>
<summary><strong>Q: 如何获取 GLM Refresh Token？</strong></summary>

A: 
1. 用浏览器打开 [chatglm.cn](https://chatglm.cn) 并登录
2. F12 → Application → Local Storage → `chatglm_refresh_token`
3. 复制值填入 `.env` 的 `GLM_REFRESH_TOKEN`
</details>

<details>
<summary><strong>Q: 游客模式能正常使用吗？</strong></summary>

A: 可以。系统默认为游客模式，无需配置任何 token。游客模式有频率限制，适合轻量使用。生产环境建议配置真实 refresh_token。
</details>

<details>
<summary><strong>Q: 如何添加多个 GLM 账号？</strong></summary>

A: 创建 `token.txt`，每行一个 `refresh_token`，程序会自动轮换使用。也可在 `.env` 中配置 `GLM_TOKEN_FILE` 指定路径。
</details>

<details>
<summary><strong>Q: 管理面板忘记密码怎么办？</strong></summary>

A: 查看 `.env` 中的 `ADMIN_KEY` 值即为密码。默认值为 `glm2api-admin`。
</details>

<details>
<summary><strong>Q: 支持哪些模型？</strong></summary>

A: 支持智谱清言全部 78+ 个模型，包括：
- GLM-4 系列：`glm-4-flash`, `glm-4-plus`, `glm-4-air`, `glm-4-long` 等
- GLM-4V 系列：多模态视觉模型
- CogView 系列：`cogview-3-plus`, `cogview-3-flash` 等图片生成模型
- CodeGeeX 系列：代码生成模型
- 以及所有衍生变体（thinking、search、agent 等）

完整列表可通过 `GET /v1/models` 查看。
</details>

<details>
<summary><strong>Q: 如何配置 HTTPS / SSL？</strong></summary>

A: 建议使用 Nginx / Caddy 反向代理，在反向代理层配置 SSL 证书，后端保持 HTTP 即可。
</details>

---

## 📄 更新日志

### v0.4.0 — 管理面板 React 重构 + 功能完善

- 🎨 **管理面板全面重构** — Vue 3 → React 19 + Tailwind CSS 4 + shadcn/ui
- 🌙 **主题系统** — Porcelain Moss（浅色）、Tungsten Night（深色）、自动跟随系统
- 📱 **响应式设计** — 桌面端侧边栏 + 移动端底部 Tab 导航
- 📊 **概览仪表盘** — 服务运行时间、账号池、API Keys、请求统计、异常日志、成功率分布图
- ⚙️ **配置与 Token** — 全部运行参数可视化管理、GLM 账号池、模型列表
- 🗂️ **账号管理** — 独立的 GLM 账号池管理页面，游客/Token 类型区分
- 🔑 **API Key 管理** — 创建/删除/启用/禁用，自动持久化到 `.env`
- 📋 **请求日志** — 六维筛选、分页、详情、**5 秒自动刷新、最新日志在上**
- 📝 **应用日志** — 实时流、级别过滤、**默认自动刷新、最新日志在上**
- 💬 **对话测试** — 在线测试 78+ 模型，即时回复
- 🔐 **认证增强** — x-admin-session + Cookie 双重认证，支持反向代理
- 🔧 **后端增强** — stats / request-logs / app-logs / chat-test 等新 API
- 🛡️ **SSL 修复** — 自动配置 certifi 证书包

### v0.3.0 — OpenAI 兼容性提升

- 🆕 协议无关的核心层重构
- 🛡️ device_id 自动轮换防风控
- 📊 标准响应 ID、fingerprint、created 字段
- 🔧 工具调用流式解析优化

### v0.2.x — 稳定性修复

- 修复推理模型流式超时问题
- 修复工具调用流式中断
- keepalive 心跳机制
- 管理面板升级

---

## 📄 许可证

本项目使用 [AGPL-3.0](LICENSE) 许可证。

---

## ⭐ 支持与反馈

- 🐛 遇到 Bug？欢迎提交 [GitHub Issue](https://github.com/t479842598/glm2api-New/issues)
- 💡 有功能建议？欢迎提交 PR 或 Issue
- 🌟 如果这个项目对你有帮助，欢迎给个 Star！

---

## 📢 免责声明

本项目为非官方开源项目，与智谱 AI / 智谱清言及其关联方无任何从属、授权或合作关系。相关名称仅用于说明兼容对象，商标及权益归其权利人所有。

使用者应自行遵守相关服务协议及法律法规，并仅使用合法持有的账号、Token 或 API Key。本项目不鼓励也不支持绕过官方限制、批量滥用、账号/Token 共享、转售、出租或向第三方提供代理服务。

本项目按"现状"提供，维护者不对因使用本项目导致的账号限制、服务不可用、数据或费用损失、法律纠纷等后果承担责任。
