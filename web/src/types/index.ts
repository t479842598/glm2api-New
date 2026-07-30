// glm2api 管理后台前端类型定义。
// 后端返回统一信封：{ code: number, msg: string, data: T }。
// 下面的接口对应 data 内部结构。

/** 后端统一响应信封。 */
export interface ApiEnvelope<T> {
  code: number
  msg: string
  data: T
}

/** 前端 API 错误（由 api-client 抛出）。 */
export interface ApiError {
  error: string
  success?: boolean
}

// ── 认证 ───────────────────────────────────────────────────────────────────

export interface SessionInfo {
  authenticated: boolean
  admin_key_configured?: boolean
}

export interface LoginResult {
  authenticated: boolean
  /** 登录成功时后端返回的会话令牌，前端写入 x-admin-session 头用于后续 API。 */
  session_token?: string
}

// ── 仪表盘统计（/admin/api/stats）────────────────────────────────────────────

export interface DashboardStats {
  uptime: string
  token_total: number
  token_guest_mode: boolean
  token_source: string
  model_count: number
  concurrency: number
  key_count: number
  key_active: number
  auth_enabled: boolean
  total_requests: number
  log_count: number
  recent_total: number
  recent_success: number
  recent_error: number
  recent_avg_ms: number
  recent_errors: RecentError[]
  retention: number
  timezone: string
  version: string
}

export interface RecentError {
  request_id: string
  time_str: string
  method: string
  path: string
  status_code: number
  api_key_name: string
  glm_account: string
  error_message: string
  duration_display: string
}

// ── 配置（/admin/api/config）─────────────────────────────────────────────────

export interface TokenListItem {
  index: number
  masked: string
  prefix: string
}

export interface ConfigData {
  host: string
  port: number
  api_prefix: string
  log_level: string
  debug_dump_all: boolean
  request_timeout: number
  glm_base_url: string
  glm_use_guest_refresh_token: boolean
  token_guest_mode: boolean
  token_source: string
  token_count: number
  tokens: TokenListItem[]
  glm_assistant_id: string
  glm_image_assistant_id: string
  glm_max_concurrency: number
  glm_delete_conversation: boolean
  glm_busy_max_retries: number
  glm_guest_max_retries: number
  model_count: number
  models: string[]
  server_api_keys_configured: boolean
  server_api_keys_count: number
  admin_key_configured: boolean
  admin_key_masked: string
  api_key_count: number
  api_keys: ApiKeyItem[]
  auth_enabled: boolean
  blocked_tool_names: string
  cors_allow_origin: string
}

// ── API Key（/admin/api/api-keys）────────────────────────────────────────────

export interface ApiKeyItem {
  name: string
  /** 脱敏后的 key（用于展示）。 */
  key: string
  /** 创建时一次性返回的完整 key（仅 create 接口）。 */
  raw_key?: string
  enabled: boolean
  created_at: string
}

export interface ApiKeysListResult {
  items: ApiKeyItem[]
  count: number
  active_count: number
}

// ── 请求日志（/admin/api/request-logs）──────────────────────────────────────

export interface LogEntry {
  request_id: string
  request_id_short: string
  time_str: string
  time_iso: string
  method: string
  path: string
  url: string
  api_key_name: string
  glm_account: string
  model: string
  status: string
  status_code: number
  duration_ms: number
  duration_display: string
  is_stream: boolean
  error_message: string
}

export interface Pagination {
  total: number
  page: number
  page_count: number
  page_size: number
  start_index: number
  end_index: number
  has_prev: boolean
  has_next: boolean
}

export interface LogFilters {
  q?: string
  status?: string
  stream?: string
  model?: string
  api_key_name?: string
  path?: string
  page?: string
}

export interface LogsPage {
  logs: LogEntry[]
  pagination: Pagination
}

export interface LogDetailData {
  request_id: string
  time_str: string
  method: string
  path: string
  url: string
  client_ip: string
  user_agent: string
  api_key_name: string
  glm_account: string
  model: string
  status: string
  status_code: number
  duration_ms: number
  duration_display: string
  is_stream: boolean
  error_message: string
  request_headers: string
  request_body: string
  request_body_is_json: boolean
  request_body_json: unknown
  request_body_truncated: boolean
  response_status: number
  response_headers: string
  raw_response_body: string
  parsed_response_text: string
}

// ── 应用日志（/admin/api/app-logs）───────────────────────────────────────────

export interface AppLogEntry {
  id: number
  timestamp: string
  level: string
  name: string
  message: string
}

export interface AppLogsPage {
  items: AppLogEntry[]
  limit: number
}
