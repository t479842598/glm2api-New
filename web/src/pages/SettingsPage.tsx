import { useState, useCallback } from "react"
import { api } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePolling } from "@/hooks/use-polling"
import {
  ShieldCheck,
  Info,
  Check,
  AlertTriangle,
  Key,
} from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { data: config, refresh } = usePolling(() => api.config(), 30000)
  const [adminKey, setAdminKey] = useState("")
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpdate = useCallback(async () => {
    if (!adminKey.trim() || adminKey.trim().length < 4) {
      setError("密钥至少需要 4 个字符")
      return
    }
    setBusy(true)
    setError(null)
    setSuccess(false)
    try {
      await api.updateSettings(adminKey.trim())
      setSuccess(true)
      setAdminKey("")
      toast.success("管理员密钥已更新，请重新登录")
      refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "修改失败"
      setError(msg)
    } finally {
      setBusy(false)
    }
  }, [adminKey, refresh])

  return (
    <div className="mx-auto w-full max-w-[960px] space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">设置</h1>
        <p className="text-sm text-muted-foreground">修改管理员密钥与查看运行参数</p>
      </div>

      {/* 修改管理员密钥 */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="size-4 text-primary" />
            修改管理员密钥
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="flex items-center gap-2">
              修改后需要重新登录。当前状态：
              {config ? (
                <Badge>{config.admin_key_configured ? "已自定义" : "使用默认密钥"}</Badge>
              ) : null}
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Input
              type="password"
              placeholder="新的管理员密钥（至少4位）"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="max-w-md"
            />
            <Button onClick={handleUpdate} disabled={busy}>
              {busy ? "保存中..." : "保存"}
            </Button>
          </div>

          {success && (
            <div className="flex items-center gap-2 text-sm text-success">
              <Check className="size-4" />
              修改成功，请重新登录
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="size-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 当前密钥信息 */}
      {config && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Key className="size-4 text-primary" />
              当前密钥信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-muted/25 px-3 py-2.5">
                <p className="text-[11px] text-muted-foreground">管理员密钥</p>
                <code className="mt-1 block text-sm font-mono">{config.admin_key_masked || "-"}</code>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/25 px-3 py-2.5">
                <p className="text-[11px] text-muted-foreground">API 认证</p>
                <Badge variant={config.auth_enabled ? "default" : "secondary"} className="mt-1">
                  {config.auth_enabled ? "已启用" : "未启用"}
                </Badge>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/25 px-3 py-2.5">
                <p className="text-[11px] text-muted-foreground">Server API Keys</p>
                <p className="mt-1 text-sm font-semibold">
                  {config.server_api_keys_configured ? `${config.server_api_keys_count} 个` : "未配置"}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/25 px-3 py-2.5">
                <p className="text-[11px] text-muted-foreground">CORS 来源</p>
                <code className="mt-1 block text-xs font-mono truncate">{config.cors_allow_origin}</code>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
