# glm2api

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ft479842598%2Fglm2api-New&env=ADMIN_KEY&envDescription=%E7%AE%A1%E7%90%86%E9%9D%A2%E6%9D%BF%E7%99%BB%E5%BD%95%E5%AF%86%E9%92%A5%EF%BC%8C%E9%BB%98%E8%AE%A4%E4%B8%BA%20glm2api-admin)

> **ChatGLM → OpenAI / Anthropic 兼容 API 代理** — 零外部依赖，内置现代化管理面板

---

## ✨ 特性亮点

- 🔄 **多协议兼容** — 同时支持 OpenAI Chat/Responses API、Anthropic Messages API
- 🎨 **现代化管理面板** — React 19 + Tailwind CSS 4 + shadcn/ui，深色/浅色主题切换
- 🔐 **API Key 认证** — 灵活的密钥管理，支持多密钥、启用/禁用切换
- 📊 **实时监控** — 仪表盘统计、请求日志列表与详情、应用日志实时流
- 💬 **在线对话测试** — 内置对话测试工具，支持全部 78+ 模型
- 🌐 **多账号负载均衡** — 自动轮换多个 GLM 账号，游客模式开箱即用
- 🛡️ **device_id 防风控** — 自动轮换设备 ID，避免触发智谱频控
- 🚀 **零外部依赖** — 纯 Python 标准库，无需安装第三方包

---

## 📋 支持接口

| 端点 | 方法 | 说明 |
|------|------|------|
| `/v1/chat/completions` | POST | OpenAI 聊天补全（流式 + 非流式） |
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

### 快捷入口

| 页面 | 快捷链接 | 功能 |
|------|---------|------|
| 📊 **概览** | `/admin/dashboard` | 服务运行时间、账号池状态、请求统计、异常日志、快捷操作 |
| ⚙️ **配置与 Token** | `/admin/config` | 基础配置、GLM 账号池、模型列表（78+ 个）、认证配置 |
| 🔑 **API Keys** | `/admin/keys` | 创建/删除/启用/禁用 API 密钥，一键复制 |
| 📋 **请求日志** | `/admin/logs` | 多维度筛选（状态/模型/Key/路径）、分页、请求详情 |
| 📝 **应用日志** | `/admin/app-logs` | 实时日志流、级别过滤（DEBUG/INFO/WARNING/ERROR）、自动刷新 |
| 💬 **对话测试** | `/admin/chat-test` | 在线测试 GLM 接口，支持全部 78+ 模型 |

### 管理面板截图

```
┌─────────────────────────────────────────────────────────────┐
│  glm2api 管理控制台                                 [主题] [⚙️] │
├──────────┬──────────────────────────────────────────────────┤
│ 📊 概览   │  服务运行时间   账号池     API Keys   总请求数     │
│ ⚙️ 配置   │  ┌──────────────────────────────────────────────┐│
│ 🔑 Keys  │  │ 近期请求概览                                  ││
│ 📋 日志   │  │ ████████████████████████████████████ 100%   ││
│ 📝 应用   │  │ 请求: 128  成功: 125  异常: 3  平均: 342ms   ││
│ 💬 对话   │  └──────────────────────────────────────────────┘│
│          │  ┌──────────────────────────────────────────────┐│
│          │  │ 最近异常请求           快捷操作               ││
│          │  │ GET /v1/chat/... 500   ├ 配置与 Token ─────── ││
│          │  │ POST /v1/resp... 502   ├ 创建 API Key ─────── ││
│          │  └────────────────────── └ 查看请求日志 ──────── ││
└──────────┴──────────────────────────────────────────────────┘
```

### 主题切换

- **🌙 自动跟随系统** — 自动匹配 macOS/Windows 深色/浅色偏好
- **🌿 Porcelain Moss** — 浅色主题（瓷白灰绿）
- **🌑 Tungsten Night** — 深色主题（深石墨）

---

## 🔐 API Key 认证

在管理面板的 **API Keys** 页面中管理 API 密钥。

### 工作原理

- **默认状态**：没有 API Key 时，所有接口免认证（向后兼容）
- **添加至少一个启用的 Key 后**：访问 `/v1/chat/completions` 等接口需要携带认证
- **禁用或删除所有 Key 后**：恢复免认证

### 使用方式

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://127.0.0.1:8000/v1",
    api_key="你的-api-key",  # 管理面板中创建的 key
)

# 流式对话
stream = client.chat.completions.create(
    model="glm-4-flash",
    messages=[{"role": "user", "content": "你好"}],
    stream=True,
)
for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### 持久化

API Key 自动保存到 `.env` 文件，重启服务后自动恢复。

---

## 🐳 Docker 部署

```bash
# 构建并运行（游客模式）
docker build -t glm2api .
docker run -d -p 8000:8000 \
  -e GLM_USE_GUEST_REFRESH_TOKEN=true \
  -e ADMIN_KEY=your-secret-key \
  --name glm2api glm2api

# 或使用 docker-compose
docker-compose up -d
```

使用真实账号：
```bash
docker run -d -p 8000:8000 \
  -v ./token.txt:/app/token.txt \
  -v ./.env:/app/.env \
  --name glm2api glm2api
```

---

## 🌐 VPS 一键部署

```bash
# 上传项目
rsync -avz --exclude='.git' --exclude='__pycache__' \
  -e 'ssh -p 22' ./ root@你的服务器IP:/opt/glm2api/

# 创建 systemd 服务
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

创建 `token.txt`，每行一个 `refresh_token`，程序自动轮换。

### 完整配置项

| 变量 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `HOST` | str | `127.0.0.1` | 监听地址 |
| `PORT` | int | `8000` | 监听端口 |
| `API_PREFIX` | str | `/v1` | API 路径前缀 |
| `LOG_LEVEL` | str | `INFO` | 日志级别 |
| `GLM_REFRESH_TOKEN` | str | — | 单账号 refresh_token |
| `GLM_TOKEN_FILE` | str | `token.txt` | 多账号 token 文件 |
| `GLM_USE_GUEST_REFRESH_TOKEN` | bool | `false` | 强制游客模式 |
| `GLM_MAX_CONCURRENCY` | int | `3` | 上游并发槽位 |
| `ADMIN_KEY` | str | `glm2api-admin` | 🎨 管理面板登录密钥 |
| `GLM2API_API_KEYS` | str | — | API Key JSON 数组 |
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
    messages=[{"role": "user", "content": "你好"}],
)
print(resp.choices[0].message.content)

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
│   ├── app.py                   # 应用生命周期管理 + SSL 配置
│   ├── config.py                # 配置加载与校验
│   ├── logging_utils.py         # 彩色日志 + 内存缓冲
│   ├── server.py                # HTTP 路由 + SSE 流式 + 请求日志
│   ├── admin.py                 # 管理面板 API（stats/config/keys/logs）
│   ├── admin_web/               # 🆕 React 管理面板构建产物
│   │   ├── index.html
│   │   ├── logo-light.svg
│   │   ├── logo-night.svg
│   │   └── assets/
│   ├── core/
│   │   ├── openai_compat.py     # OpenAI 标准响应构造
│   │   └── tokenizer.py         # token 近似计数
│   ├── services/
│   │   ├── glm_client.py        # GLM Web API 客户端
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
│       ├── components/          # shadcn/ui 组件库
│       ├── pages/               # 6 个功能页面
│       ├── hooks/               # use-auth, use-polling
│       ├── lib/                 # API 客户端
│       └── types/               # TypeScript 类型定义
├── tests/                       # 59 项测试
├── scripts/                     # 运维脚本
├── main.py                      # 入口
├── Dockerfile
├── docker-compose.yml
└── pyproject.toml
```

---

## 🛠️ 开发指南

```bash
# Python 开发
pip install -e ".[dev]"

# 前端开发
cd web && npm install && npm run dev

# 构建前端
cd web && npm run build  # 自动输出到 src/glm2api/admin_web/

# 运行测试
pytest tests/ -v  # 59 项测试
```

---

## 📄 更新日志

### v0.4.0 — 管理面板 React 重构

- 🎨 **管理面板全面重构** — Vue 3 → React 19 + Tailwind CSS 4 + shadcn/ui
- 🌙 **深色/浅色主题** — Porcelain Moss（浅色）+ Tungsten Night（深色）
- 📱 **响应式设计** — 桌面端侧边栏 + 移动端底部导航
- 📊 **仪表盘统计** — 服务运行时间、账号池、请求统计、异常日志
- 📋 **请求日志** — 多维度筛选、分页、详情查看
- 📝 **应用日志** — 实时流、级别过滤、自动刷新
- 💬 **对话测试** — 在线测试，支持全部 78+ 模型
- 🔐 **认证增强** — x-admin-session 头认证，支持反向代理
- 🔧 **后端增强** — 新增 `/stats`、`/request-logs` 等 API
- 🛡️ **SSL 修复** — 自动配置 certifi 证书包

### v0.3.0 — OpenAI 兼容性提升

- 🆕 协议无关的核心层
- 🛡️ device_id 防风控
- 📊 标准响应 ID、fingerprint

### v0.2.x — 稳定性修复

- 修复推理模型流式超时、工具调用流式中断
- keepalive 心跳机制
- 管理面板升级

---

## 📄 许可证

[AGPL-3.0](LICENSE)

---

## ⭐ 支持

如果这个项目对你有帮助，欢迎给个 Star！⭐
