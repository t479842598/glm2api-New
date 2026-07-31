import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api-client"
import type { ConfigData, TokenListItem } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { PaginationControls } from "@/components/shared/PaginationControls"
import {
  Database,
  ShieldCheck,
  Copy,
  RefreshCw,
  Globe,
  Users,
  FileText,
  Cpu,
  Clock,
  Info,
} from "lucide-react"
import { toast } from "sonner"

const TOKENS_PAGE_SIZE = 10

function TokenMetric({
  icon,
  label,
  value,
  badge,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  badge?: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/25 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground">
          {icon}
        </div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <p className="text-lg font-semibold">{value}</p>
        {badge}
      </div>
    </div>
  )
}

function TokenCard({
  token,
  copiedIndex,
  onCopy,
}: {
  token: TokenListItem
  copiedIndex: number | null
  onCopy: (masked: string, idx: number) => void
}) {
  const isGuest = token.prefix?.includes("游客")

  return (
    <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-muted-foreground">
              #{token.index}
            </span>
            <Badge
              variant={isGuest ? "secondary" : "default"}
              className="text-[10px]"
            >
              {isGuest ? "游客" : "Token"}
            </Badge>
          </div>
          <code
            className="mt-2 block truncate font-mono text-xs text-muted-foreground"
            title={token.masked}
          >
            {token.masked}
          </code>
          {token.prefix && (
            <p className="mt-1 text-[11px] text-muted-foreground/60">
              {token.prefix}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={() => onCopy(token.masked, token.index)}
          title="复制"
        >
          <Copy
            className={`size-3.5 ${
              copiedIndex === token.index ? "text-success" : "text-muted-foreground"
            }`}
          />
        </Button>
      </div>
    </div>
  )
}

export default function TokenPage() {
  const [config, setConfig] = useState<ConfigData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  const fetchConfig = useCallback(async () => {
    try {
      setError(null)
      const data = await api.config()
      setConfig(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "加载配置失败"
      setError(msg)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchConfig()
    toast.success("已刷新")
  }

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

  const tokens = config?.tokens ?? []
  const pageCount = Math.max(Math.ceil(tokens.length / TOKENS_PAGE_SIZE), 1)
  const validPage = Math.min(Math.max(page, 1), pageCount)
  const start = (validPage - 1) * TOKENS_PAGE_SIZE
  const paginatedTokens = tokens.slice(start, start + TOKENS_PAGE_SIZE)

  return (
    <div className="mx-auto w-full max-w-[1320px] space-y-5">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* 账号池概览 */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Database className="size-4 text-primary" />
              账号池概览
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={handleRefresh}
              disabled={loading || refreshing}
            >
              <RefreshCw
                className={`mr-1.5 size-3 ${refreshing ? "animate-spin" : ""}`}
              />
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : config ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <TokenMetric
                icon={<Users className="size-4" />}
                label="账号总数"
                value={config.token_count}
                badge={
                  <Badge
                    variant={config.token_guest_mode ? "secondary" : "default"}
                    className="text-[10px]"
                  >
                    {config.token_guest_mode ? "游客模式" : "Token"}
                  </Badge>
                }
              />
              <TokenMetric
                icon={<FileText className="size-4" />}
                label="Token 来源"
                value={config.token_source}
              />
              <TokenMetric
                icon={<Cpu className="size-4" />}
                label="并发上限"
                value={config.glm_max_concurrency}
              />
              <TokenMetric
                icon={<Globe className="size-4" />}
                label="GLM Base URL"
                value={
                  <span className="text-xs font-mono truncate block">
                    {config.glm_base_url}
                  </span>
                }
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* 账号详情 */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="size-4 text-primary" />
            账号列表
            {!loading && (
              <Badge variant="outline" className="text-[10px]">
                {tokens.length} 个
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : tokens.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-12 text-center">
              <Database className="mx-auto size-8 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">
                暂无 GLM 账号
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                在 .env 中配置 GLM_REFRESH_TOKEN 或创建 token.txt 文件添加账号
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {paginatedTokens.map((token) => (
                  <TokenCard
                    key={token.index}
                    token={token}
                    copiedIndex={copiedIndex}
                    onCopy={handleCopyToken}
                  />
                ))}
              </div>
              {tokens.length > TOKENS_PAGE_SIZE && (
                <div className="mt-4">
                  <PaginationControls
                    page={validPage}
                    pageCount={pageCount}
                    total={tokens.length}
                    startIndex={tokens.length === 0 ? 0 : start + 1}
                    endIndex={Math.min(start + TOKENS_PAGE_SIZE, tokens.length)}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 运行配置 */}
      {!loading && config && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Info className="size-4 text-primary" />
              运行配置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              <div className="rounded-lg border border-border/60 bg-muted/25 px-3 py-2.5">
                <p className="text-[11px] text-muted-foreground">助手 ID</p>
                <p className="mt-1 text-xs font-mono truncate">
                  {config.glm_assistant_id || "-"}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/25 px-3 py-2.5">
                <p className="text-[11px] text-muted-foreground">图像助手 ID</p>
                <p className="mt-1 text-xs font-mono truncate">
                  {config.glm_image_assistant_id || "-"}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/25 px-3 py-2.5">
                <p className="text-[11px] text-muted-foreground">忙碌重试</p>
                <p className="mt-1 text-sm font-semibold">
                  {config.glm_busy_max_retries} 次
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/25 px-3 py-2.5">
                <p className="text-[11px] text-muted-foreground">游客重试</p>
                <p className="mt-1 text-sm font-semibold">
                  {config.glm_guest_max_retries} 次
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/25 px-3 py-2.5">
                <p className="text-[11px] text-muted-foreground">删除会话</p>
                <Badge
                  variant={config.glm_delete_conversation ? "default" : "secondary"}
                  className="mt-1 text-[10px]"
                >
                  {config.glm_delete_conversation ? "是" : "否"}
                </Badge>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/25 px-3 py-2.5">
                <p className="text-[11px] text-muted-foreground">Debug Dump</p>
                <Badge
                  variant={config.debug_dump_all ? "default" : "secondary"}
                  className="mt-1 text-[10px]"
                >
                  {config.debug_dump_all ? "开启" : "关闭"}
                </Badge>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/25 px-3 py-2.5">
                <p className="text-[11px] text-muted-foreground">请求超时</p>
                <p className="mt-1 text-sm font-semibold">{config.request_timeout}s</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/25 px-3 py-2.5">
                <p className="text-[11px] text-muted-foreground">日志级别</p>
                <p className="mt-1 text-sm font-semibold">{config.log_level}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
