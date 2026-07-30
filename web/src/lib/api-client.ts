// glm2api 管理后台 API 客户端。
//
// 后端为 Python stdlib 服务器，认证基于 HMAC 会话：
//   - 登录成功后后端返回 _session_token，前端保存并在后续请求中以
//     `x-admin-session` 头携带（同时后端也接受同名 Cookie，但显式头更稳妥）。
//   - 所有接口统一返回 { code, msg, data }，code !== 0 视为业务错误。
import type {
  ApiEnvelope,
  ApiError,
  ApiKeyItem,
  ApiKeysListResult,
  AppLogsPage,
  ConfigData,
  DashboardStats,
  LogDetailData,
  LogFilters,
  LogsPage,
  LoginResult,
  SessionInfo,
} from "@/types"

const API_BASE = "/admin/api"
const SESSION_STORAGE_KEY = "glm2api.admin.session"

let _sessionToken: string | null = readSessionToken()

function readSessionToken(): string | null {
  try {
    return localStorage.getItem(SESSION_STORAGE_KEY)
  } catch {
    return null
  }
}

function writeSessionToken(token: string | null) {
  _sessionToken = token
  try {
    if (token) localStorage.setItem(SESSION_STORAGE_KEY, token)
    else localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // 忽略存储失败，仅保留内存中的令牌。
  }
}

export function setSessionToken(token: string | null) {
  writeSessionToken(token)
}

export function getSessionToken() {
  return _sessionToken
}

class ApiClientError extends Error {
  status: number
  data: ApiError

  constructor(status: number, data: ApiError) {
    super(data.error || "请求失败")
    this.status = status
    this.data = data
  }
}

export { ApiClientError }

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  }

  if (_sessionToken) {
    headers["x-admin-session"] = _sessionToken
  }

  if (options?.body && typeof options.body === "string") {
    headers["Content-Type"] = "application/json"
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: "same-origin",
    })
  } catch {
    throw new ApiClientError(0, { error: "网络错误：无法连接服务器" })
  }

  // 尝试解析 JSON，兼容空响应。
  let payload: ApiEnvelope<unknown> | null = null
  const text = await res.text()
  if (text) {
    try {
      payload = JSON.parse(text) as ApiEnvelope<unknown>
    } catch {
      // 非 JSON 响应（例如 502 网关错误页）。
      throw new ApiClientError(res.status, { error: `服务器返回非 JSON 响应（HTTP ${res.status}）` })
    }
  }

  if (!res.ok) {
    if (res.status === 401) {
      writeSessionToken(null)
    }
    const msg =
      (payload && typeof payload === "object" && "msg" in payload
        ? String((payload as ApiEnvelope<unknown>).msg)
        : "") || `请求失败（HTTP ${res.status}）`
    throw new ApiClientError(res.status, { error: msg })
  }

  // 信封校验：code !== 0 视为业务错误。
  if (payload && typeof payload === "object" && "code" in payload) {
    const env = payload as ApiEnvelope<unknown>
    if (env.code !== 0) {
      throw new ApiClientError(res.status, { error: env.msg || "操作失败" })
    }
    return env.data as T
  }

  // 没有信封的兜底（理论上不应出现）。
  return (payload as T) ?? ({} as T)
}

/** 供已登录状态下 POST/DELETE 的便捷封装（统一 PUT 风格走 POST，匹配后端）。 */
function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

export const api = {
  // ── 认证 ──────────────────────────────────────────────────────────────
  session: () => request<SessionInfo>("/session"),

  login: (key: string) =>
    post<LoginResult>("/login", { key }).then((result) => {
      if (result.session_token) {
        writeSessionToken(result.session_token)
      }
      return result
    }),

  logout: () =>
    post<unknown>("/logout").then(() => {
      writeSessionToken(null)
    }),

  // ── 仪表盘 ────────────────────────────────────────────────────────────
  stats: () => request<DashboardStats>("/stats"),

  config: () => request<ConfigData>("/config"),

  // ── API Key ───────────────────────────────────────────────────────────
  getKeys: () => request<ApiKeysListResult>("/api-keys"),

  createKey: (name: string, key?: string) =>
    post<{ name: string; key: string; enabled: boolean; created_at: string; raw_key?: string }>("/api-keys", { name, key }).then((item) => {
      return {
        item: {
          name: item.name,
          key: item.key,
          enabled: item.enabled,
          created_at: item.created_at,
        },
        raw_key: item.raw_key,
      }
    }),

  updateKey: (name: string, payload: { key?: string; enabled?: boolean }) =>
    post<ApiKeyItem>(`/api-keys/${encodeURIComponent(name)}`, payload),

  toggleKey: (name: string) =>
    post<ApiKeyItem>(`/api-keys/${encodeURIComponent(name)}/toggle`),

  deleteKey: (name: string) =>
    post<unknown>(`/api-keys/${encodeURIComponent(name)}/delete`),

  // ── 请求日志 ──────────────────────────────────────────────────────────
  getLogs: (filters: LogFilters) => {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(filters)) {
      if (v) params.set(k, v)
    }
    const qs = params.toString()
    return request<LogsPage>(`/request-logs${qs ? `?${qs}` : ""}`)
  },

  getLogDetail: (requestId: string) =>
    request<LogDetailData>(`/request-logs/${encodeURIComponent(requestId)}`),

  clearLogs: () => post<unknown>("/request-logs/clear"),

  // ── 应用日志 ──────────────────────────────────────────────────────────
  getAppLogs: (sinceId = 0, level = "") => {
    const params = new URLSearchParams()
    if (sinceId) params.set("since_id", String(sinceId))
    if (level) params.set("level", level)
    const qs = params.toString()
    return request<AppLogsPage>(`/app-logs${qs ? `?${qs}` : ""}`)
  },

  // ── 对话测试 ──────────────────────────────────────────────────────────
  chatTest: (model: string, prompt: string) =>
    post<{ ok: boolean; model?: string; reply?: string; info?: string }>(
      "/chat-test",
      { model, prompt },
    ),
}
