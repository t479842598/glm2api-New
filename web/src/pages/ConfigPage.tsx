import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api-client"
import type { ConfigData } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Settings2,
  Database,
  Lock,
  ShieldCheck,
  Copy,
  RefreshCw,
  Key,
  Globe,
  Cpu,
  Clock,
  Info,
} from "lucide-react"
import { toast } from "sonner"

function ConfigItem({
  icon,
  label,
  value,
  mono = false,
  badge,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  mono?: boolean
  badge?: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/25 px-3 py-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <div className="flex items-center gap-2">
          <p
            className={`mt-0.5 truncate font-medium ${mono ? "font-mono text-xs" : "text-sm"}`}
          >
            {value}
          </p>
          {badge}
        </div>
      </div>
    </div>
  )
}

export default function ConfigPage() {
  const [config, setConfig] = useState<ConfigData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.config()
      setConfig(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "加载配置失败"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const handleCopyToken = async (token: string, index: number) => {
    try {
      await navigator.clipboard.writeText(token)
      setCopiedIndex(index)
      toast.success("已复制到剪贴板")
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch {
      toast.error("复制失败")
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1320px] space-y-5">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* 基础配置 */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Settings2 className="size-4 text-primary" />
              基础配置
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="h-7"
              onClick={fetchConfig}
              disabled={loading}
            >
              <RefreshCw className="mr-1.5 size-3" />
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : config ? (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <ConfigItem
                icon={<Globe className="size-4" />}
                label="监听地址"
                value={`${config.host}:${config.port}`}
                badge={
                  config.host === "0.0.0.0" ? (
                    <Badge variant="secondary" className="text-[10px]">
                      外部可访问
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      本地
                    </Badge>
                  )
                }
              />
              <ConfigItem
                icon={<Database className="size-4" />}
                label="API 前缀"
                value={config.api_prefix}
                mono
              />
              <ConfigItem
                icon={<Clock className="size-4" />}
                label="日志级别"
                value={config.log_level}
                badge={
                  config.log_level === "DEBUG" ? (
                    <Badge variant="secondary" className="text-[10px]">
                      DEBUG
                    </Badge>
                  ) : null
                }
              />
              <ConfigItem
                icon={<Cpu className="size-4" />}
                label="上游并发上限"
                value={`${config.glm_max_concurrency}`}
              />
              <ConfigItem
                icon={<ShieldCheck className="size-4" />}
                label="GLM 重试次数（忙碌）"
                value={config.glm_busy_max_retries}
              />
              <ConfigItem
                icon={<Info className="size-4" />}
                label="请求超时（秒）"
                value={config.request_timeout}
              />
              <ConfigItem
                icon={<Key className="size-4" />}
                label="管理员密钥"
                value={config.admin_key_masked}
                mono
                badge={
                  config.admin_key_configured ? (
                    <Badge variant="default" className="text-[10px]">
                      已配置
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[10px]">
                      未配置
                    </Badge>
                  )
                }
              />
              <ConfigItem
                icon={<Globe className="size-4" />}
                label="CORS 允许来源"
                value={config.cors_allow_origin}
                mono
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* GLM 账号池 */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Database className="size-4 text-primary" />
            GLM 账号池
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : config ? (
            <>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3 mb-4">
                <ConfigItem
                  icon={<Database className="size-4" />}
                  label="账号总数"
                  value={config.token_count}
                  badge={
                    config.token_guest_mode ? (
                      <Badge variant="secondary" className="text-[10px]">
                        游客模式
                      </Badge>
                    ) : (
                      <Badge variant="default" className="text-[10px]">
                        Token
                      </Badge>
                    )
                  }
                />
                <ConfigItem
                  icon={<Database className="size-4" />}
                  label="Token 来源"
                  value={config.token_source}
                />
                <ConfigItem
                  icon={<ShieldCheck className="size-4" />}
                  label="助手 ID"
                  value={config.glm_assistant_id}
                  mono
                />
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">账号列表</p>
                {config.tokens.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                    暂无账号
                  </div>
                ) : (
                  <div className="rounded-lg border border-border/60 bg-card p-2">
                    {config.tokens.map((token, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 px-2 py-2 first:pt-1 last:pb-1 hover:bg-muted/30 rounded"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="text-[11px] text-muted-foreground">
                            #{token.index}
                          </span>
                          <span className="text-xs text-muted-foreground/60">
                            ·
                          </span>
                          <code className="truncate font-mono text-xs text-muted-foreground">
                            {token.masked}
                          </code>
                          {token.prefix && (
                            <>
                              <span className="text-[11px] text-muted-foreground/60">
                                ·
                              </span>
                              <code className="truncate font-mono text-[11px] text-foreground">
                                {token.prefix}
                              </code>
                            </>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 shrink-0"
                          onClick={() => handleCopyToken(token.masked, idx)}
                          title="复制"
                        >
                          <Copy
                            className={`size-3.5 ${copiedIndex === idx ? "text-success" : "text-muted-foreground"}`}
                          />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* 模型列表 */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Settings2 className="size-4 text-primary" />
            模型列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : config ? (
            <>
              <div className="mb-3 text-xs text-muted-foreground">
                共 {config.model_count} 个模型（显示前 20 个）
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-2">
                {config.models.slice(0, 20).map((model, idx) => (
                  <div
                    key={idx}
                    className="px-2 py-1.5 text-xs font-mono text-muted-foreground first:pt-1 last:pb-1 hover:bg-muted/30 rounded"
                  >
                    {model}
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* 认证配置 */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="size-4 text-primary" />
            认证配置
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : config ? (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <ConfigItem
                icon={<Lock className="size-4" />}
                label="API Key 管理"
                value={
                  config.auth_enabled ? (
                    <Badge variant="default" className="text-[10px]">
                      已启用
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">
                      未启用
                    </Badge>
                  )
                }
                badge={
                  <Badge variant="outline" className="text-[10px]">
                    {config.api_key_count} 个 Key
                  </Badge>
                }
              />
              <ConfigItem
                icon={<Key className="size-4" />}
                label="Server API Keys"
                value={config.server_api_keys_configured ? "已配置" : "未配置"}
                badge={
                  config.server_api_keys_configured ? (
                    <Badge variant="outline" className="text-[10px]">
                      {config.server_api_keys_count} 个
                    </Badge>
                  ) : null
                }
              />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
