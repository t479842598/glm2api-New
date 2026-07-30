import { useState, useEffect, useCallback, useRef } from "react"
import { api } from "@/lib/api-client"
import type { AppLogEntry } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCwIcon, ScrollText, ArrowDownWideNarrow } from "lucide-react"

const LEVEL_COLORS: Record<string, string> = {
  DEBUG: "text-[#64b5f6]",
  INFO: "text-[#4ade80]",
  WARNING: "text-[#facc15]",
  ERROR: "text-[#f87171]",
}

export default function AppLogsPage() {
  const [logs, setLogs] = useState<AppLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [autoRefresh, setAutoRefresh] = useState(true) // 默认自动刷新
  const [lastId, setLastId] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 获取新日志（增量追加）
  const fetchNewLogs = useCallback(async () => {
    try {
      setError(null)
      const filter = levelFilter === "all" ? "" : levelFilter
      const data = await api.getAppLogs(lastId, filter)
      if (data.items.length > 0) {
        setLogs((prev) => [...prev, ...data.items])
        setLastId(data.items[data.items.length - 1].id)
      }
    } catch {
      setError("加载应用日志失败")
    } finally {
      setLoading(false)
    }
  }, [lastId, levelFilter])

  // 重新加载（切换过滤条件时）
  const reloadLogs = useCallback(async () => {
    setLoading(true)
    setLastId(0)
    try {
      const filter = levelFilter === "all" ? "" : levelFilter
      const data = await api.getAppLogs(0, filter)
      setLogs(data.items)
      if (data.items.length > 0) {
        setLastId(data.items[data.items.length - 1].id)
      }
    } catch {
      setError("加载应用日志失败")
    } finally {
      setLoading(false)
    }
  }, [levelFilter])

  // 首次加载
  useEffect(() => {
    setLogs([])
    setLastId(0)
    reloadLogs()
  }, [reloadLogs])

  // 自动刷新（默认开启）
  useEffect(() => {
    if (!autoRefresh) return
    const timer = setInterval(fetchNewLogs, 2000)
    return () => clearInterval(timer)
  }, [autoRefresh, fetchNewLogs])

  const handleClear = useCallback(() => {
    setLogs([])
    setLastId(0)
  }, [])

  // 最新日志在最上面（反转显示）
  const reversedLogs = [...logs].reverse()

  return (
    <div className="mx-auto w-full max-w-[1320px] space-y-5">
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <ScrollText className="size-4 text-primary" />
              应用日志
              {autoRefresh && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-success-muted/40 px-2 py-0.5 text-[10px] font-normal text-success">
                  <span className="size-1.5 animate-pulse rounded-full bg-success" />
                  实时
                </span>
              )}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={levelFilter}
                onValueChange={(v) => setLevelFilter(v ?? "all")}
              >
                <SelectTrigger className="h-8 w-[120px] text-xs">
                  <SelectValue placeholder="级别：全部" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部级别</SelectItem>
                  <SelectItem value="DEBUG">DEBUG</SelectItem>
                  <SelectItem value="INFO">INFO</SelectItem>
                  <SelectItem value="WARNING">WARNING</SelectItem>
                  <SelectItem value="ERROR">ERROR</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={reloadLogs}
                disabled={loading}
              >
                <RefreshCwIcon className="mr-1.5 size-3" />
                刷新
              </Button>
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                className="h-8"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? "停止刷新" : "自动刷新"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-destructive hover:text-destructive"
                onClick={handleClear}
              >
                清空
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-3 rounded-lg border border-destructive/50 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}
          {loading && logs.length === 0 ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              暂无日志记录
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="rounded-lg border border-border/60 bg-card overflow-auto max-h-[620px] p-2"
            >
              <table className="w-full text-[11px] font-mono">
                <tbody>
                  {reversedLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-border/60 last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-2 py-1.5 whitespace-nowrap text-muted-foreground">
                        {log.time}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <span className={LEVEL_COLORS[log.level] || ""}>
                          {log.level.padEnd(5)}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap text-muted-foreground/60">
                        {log.logger || "-"}
                      </td>
                      <td className="px-2 py-1.5 whitespace-pre-wrap break-all text-foreground">
                        {log.msg}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-center gap-1.5 border-t border-border/60 pt-2 pb-1 text-[10px] text-muted-foreground/50">
                <ArrowDownWideNarrow className="size-3" />
                最新日志在最上方 · 共 {logs.length} 条
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
