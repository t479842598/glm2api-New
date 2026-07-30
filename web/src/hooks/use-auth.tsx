import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import { api, getSessionToken, setSessionToken } from "@/lib/api-client"

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  /** 是否已配置管理员密钥（未配置时禁止登录）。 */
  adminKeyConfigured: boolean
  login: (key: string) => Promise<string | null>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getSessionToken())
  const [adminKeyConfigured, setAdminKeyConfigured] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const checkSession = useCallback(async () => {
    // 没有本地令牌时直接视为未登录，避免无谓的网络请求。
    if (!getSessionToken()) {
      setIsAuthenticated(false)
      setIsLoading(false)
      return
    }
    try {
      const session = await api.session()
      setIsAuthenticated(session.authenticated)
      setAdminKeyConfigured(session.admin_key_configured !== false)
      if (!session.authenticated) {
        setSessionToken(null)
      }
    } catch {
      setSessionToken(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  const login = useCallback(async (key: string): Promise<string | null> => {
    try {
      const result = await api.login(key)
      if (result.authenticated) {
        setIsAuthenticated(true)
        return null
      }
      return "登录失败"
    } catch (err: unknown) {
      if (err && typeof err === "object" && "data" in err) {
        return (
          (err as { data: { error?: string } }).data?.error || "登录失败"
        )
      }
      return "网络错误"
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.logout()
    } catch {
      // 忽略登出请求失败，仍清除本地状态。
    } finally {
      setSessionToken(null)
      setIsAuthenticated(false)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        adminKeyConfigured,
        login,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
