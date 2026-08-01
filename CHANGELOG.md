# Changelog

本项目的所有重要变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Fixed
- 修复流式、Anthropic、Responses 请求未被记录到管理面板请求日志的问题，现在所有 `/v1/*` 请求（含 SSE 流式）都会正确计入统计与日志。
- 修复环境配置页 `usePolling(…, 0)` 导致无限紧密轮询 `/admin/api/env` 的问题，`intervalMs=0` 现在表示"仅首次加载 + 手动刷新"。
- 修复管理面板静态资源路径校验使用字符串前缀比较可能导致的目录穿越风险，改用 `Path.is_relative_to`。
- 修复 CORS `Access-Control-Allow-Headers` 缺少 `x-admin-session`，跨域部署时管理面板请求被预检拦截。
- 修复并发请求记录 ID 可能重复的问题，改用原子递增计数器。

### Changed
- 统一版本号到 `0.4.0`（`__version__` 单一来源），`Server` 响应头与管理面板统计中的版本号不再硬编码。
- 移除 `translator.py` 中 138 行从未被调用的旧版工具调用指令死代码。
- 合并 `/admin/api/logs` 与 `/admin/api/app-logs` 的重复实现，旧路由委托给新路由。

## 0.4.0 - 2026-07-30

### Added
- 管理面板全面重构为 React 19 + Vite 8 + TypeScript + Tailwind CSS 4 + shadcn/ui。
- 新增系统设置页面（修改管理员密钥）。
- 新增环境配置页面（查看脱敏后的 `.env` 内容）。
- 请求日志详情页新增一键复制 curl 模板。
- 账号列表添加分页，每页 10 条。
- 新增对话测试页面，支持动态加载模型列表在线测试。
- 新增应用日志页面（增量轮询、级别过滤、自动刷新）。
- 新增请求日志六维筛选与分页。
- 主题切换（system / light / dark 三模式）。

### Fixed
- 修复登录失败问题，新增 `.well-known` 探测请求的静默处理。
- 修复 Vite 构建产物 base 路径，管理面板静态资源可正确加载。
- 修复 SSL 证书验证失败，对话测试可正常运行。
- 修复应用日志字段不匹配与默认刷新行为。
