import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { api } from "@/lib/api-client"
import type { LogEntry, LogsPage } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  MobileListSkeleton,
  TableSkeleton,
} from "@/components/shared/PageSkeletons"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  SearchIcon,
  RotateCcwIcon,
  RefreshCwIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  FileTextIcon,
} from "lucide-react"

const statusFilterLabels: Record<string, string> = {
  success: "成功",
  error: "错误",
}

const streamFilterLabels: Record<string, string> = {
  true: "流式",
  false: "普通",
}

function formatStatusFilter(value: unknown) {
  if (typeof value !== "string" || !value || value === "__all__") {
    return "状态：全部"
  }
  return statusFilterLabels[value] ?? value
}

function formatStreamFilter(value: unknown) {
  if (typeof value !== "string" || !value || value === "__all__") {
    return "类型：全部"
  }
  return streamFilterLabels[value] ?? value
}

function LogStatusPill({ log }: { log: LogEntry }) {
  const isError = log.status_code >= 400

  return (
    <div className="flex items-center">
      <span
        className={`inline-flex h-6 min-w-11 items-center justify-center gap-1 rounded-full border border-border/55 px-2 text-[11px] font-semibold tabular-nums ${
          isError
            ? "bg-destructive/10 text-destructive"
            : "bg-success-muted/45 text-success"
        }`}
      >
        {log.status_code}
        {log.is_stream && (
          <span className="border-l border-current/20 pl-1 text-[10px] font-medium leading-none opacity-80">
            流
          </span>
        )}
      </span>
    </div>
  )
}

function LogMobileCard({
  log,
  onOpen,
}: {
  log: LogEntry
  onOpen: () => void
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-muted-foreground">
            {log.time_str}
          </p>
          <p className="mt-1 truncate text-sm font-medium">
            <span className="text-muted-foreground">{log.method}</span>{" "}
            {log.path}
          </p>
          <code
            className="mt-1 block truncate text-[11px] text-muted-foreground"
            title={log.request_id}
          >
            {log.request_id_short}
          </code>
        </div>
        <div className="shrink-0 text-right">
          <p
            className={`text-sm font-semibold ${
              log.status_code >= 400 ? "text-destructive" : "text-success"
            }`}
          >
            {log.status_code}
          </p>
          {log.is_stream && (
            <Badge variant="secondary" className="mt-1 text-[10px]">
              流式
            </Badge>
          )}
        </div>
      </div>

      {log.error_message && (
        <div className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-[11px] text-destructive">
          {log.error_message}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-muted/35 px-3 py-2">
          <p className="text-muted-foreground">Key</p>
          <p className="mt-1 truncate font-medium">{log.api_key_name || "-"}</p>
        </div>
        <div className="rounded-lg bg-muted/35 px-3 py-2">
          <p className="text-muted-foreground">GLM 账号</p>
          <p className="mt-1 truncate font-medium">
            {log.glm_account || "-"}
          </p>
        </div>
        <div className="rounded-lg bg-muted/35 px-3 py-2">
          <p className="text-muted-foreground">模型</p>
          <p className="mt-1 truncate font-medium">{log.model || "-"}</p>
        </div>
        <div className="rounded-lg bg-muted/35 px-3 py-2">
          <p className="text-muted-foreground">耗时</p>
          <p className="mt-1 font-medium">{log.duration_display}</p>
        </div>
        <div className="rounded-lg bg-muted/35 px-3 py-2">
          <p className="text-muted-foreground">类型</p>
          <p className="mt-1 font-medium">{log.is_stream ? "流式" : "普通"}</p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onOpen}
        className="mt-4 h-9 w-full text-xs"
      >
        查看详情
      </Button>
    </div>
  )
}

export default function LogsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [pagination, setPagination] = useState<LogsPage["pagination"] | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const autoRefreshRef = useRef(autoRefresh)
  autoRefreshRef.current = autoRefresh

  const q = searchParams.get("q") ?? ""
  const status = searchParams.get("status") ?? ""
  const stream = searchParams.get("stream") ?? ""
  const model = searchParams.get("model") ?? ""
  const api_key_name = searchParams.get("api_key_name") ?? ""
  const path = searchParams.get("path") ?? ""
  const page = searchParams.get("page") ?? "1"

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const filters: Record<string, string> = {}
      if (q) filters.q = q
      if (status) filters.status = status
      if (stream) filters.stream = stream
      if (model) filters.model = model
      if (api_key_name) filters.api_key_name = api_key_name
      if (path) filters.path = path
      filters.page = page
      const data = await api.getLogs(filters)
      setLogs(data.logs)
      setPagination(data.pagination)
    } catch {
      setError("加载日志失败")
    } finally {
      setLoading(false)
    }
  }, [q, status, stream, model, api_key_name, path, page])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // 自动刷新（默认开启，每 5 秒轮询）
  useEffect(() => {
    if (!autoRefresh) return
    const timer = setInterval(() => {
      if (autoRefreshRef.current) {
        fetchLogs()
      }
    }, 5000)
    return () => clearInterval(timer)
  }, [autoRefresh, fetchLogs])

  const updateFilter = (name: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) {
        next.set(name, value)
      } else {
        next.delete(name)
      }
      next.set("page", "1")
      return next
    })
  }

  const handleClear = () => {
    setSearchParams({})
  }

  const goToPage = (p: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("page", String(p))
      return next
    })
  }

  return (
    <div className="mx-auto w-full max-w-[1320px] space-y-4">
      <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(220px,1.4fr)_minmax(132px,0.8fr)_minmax(132px,0.8fr)_minmax(150px,1fr)_minmax(150px,1fr)_minmax(150px,1fr)]">
          <Input
            name="q"
            placeholder="关键词搜索"
            value={q}
            onChange={(e) => updateFilter("q", e.target.value)}
            className="h-10 min-w-0 text-xs md:h-8"
          />
          <Select
            value={status || ""}
            onValueChange={(v) => updateFilter("status", v === "__all__" ? "" : (v ?? ""))}
          >
            <SelectTrigger className="h-10 w-full min-w-0 text-xs md:h-8">
              <SelectValue placeholder="状态：全部">
                {formatStatusFilter}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">全部状态</SelectItem>
              <SelectItem value="success">成功</SelectItem>
              <SelectItem value="error">错误</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={stream || ""}
            onValueChange={(v) => updateFilter("stream", v === "__all__" ? "" : (v ?? ""))}
          >
            <SelectTrigger className="h-10 w-full min-w-0 text-xs md:h-8">
              <SelectValue placeholder="类型：全部">
                {formatStreamFilter}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">全部类型</SelectItem>
              <SelectItem value="true">流式</SelectItem>
              <SelectItem value="false">普通</SelectItem>
            </SelectContent>
          </Select>
          <Input
            name="model"
            placeholder="模型"
            value={model}
            onChange={(e) => updateFilter("model", e.target.value)}
            className="h-10 min-w-0 text-xs md:h-8"
          />
          <Input
            name="api_key_name"
            placeholder="Key 名称"
            value={api_key_name}
            onChange={(e) => updateFilter("api_key_name", e.target.value)}
            className="h-10 min-w-0 text-xs md:h-8"
          />
          <Input
            name="path"
            placeholder="路径"
            value={path}
            onChange={(e) => updateFilter("path", e.target.value)}
            className="h-10 min-w-0 text-xs md:h-8"
          />
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2 md:flex">
          <Button size="sm" className="h-10 text-xs md:h-7" onClick={fetchLogs}>
            <SearchIcon className="mr-1 size-3" />
            筛选
          </Button>
          <Button size="sm" variant="outline" className="h-10 text-xs md:h-7" onClick={handleClear}>
            <RotateCcwIcon className="mr-1 size-3" />
            清空
          </Button>
          <Button
            size="sm"
            variant={autoRefresh ? "default" : "outline"}
            className="h-10 text-xs md:h-7"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCwIcon className={autoRefresh ? "mr-1 size-3 animate-spin" : "mr-1 size-3"} />
            {autoRefresh ? "自动刷新中" : "自动刷新"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <>
          <MobileListSkeleton items={4} className="md:hidden" />
          <TableSkeleton rows={5} columns={9} className="hidden md:block" />
        </>
      ) : logs.length === 0 ? (
        <div className="rounded-lg border border-border/60 bg-card py-16 text-center shadow-sm">
          <FileTextIcon className="mx-auto size-8 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">暂无请求记录</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {logs.map((log) => (
              <LogMobileCard
                key={log.request_id}
                log={log}
                onOpen={() => navigate(`/admin/logs/${log.request_id}`)}
              />
            ))}
          </div>

          <Table
            containerClassName="hidden md:block max-h-[620px]"
            className="min-w-[980px] table-fixed"
          >
            <colgroup>
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[28%]" />
              <col className="w-[12%]" />
              <col className="w-[7%]" />
              <col className="w-[7%]" />
              <col className="w-[8%]" />
            </colgroup>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">时间</TableHead>
                <TableHead className="text-xs">Request ID</TableHead>
                <TableHead className="text-xs">Key</TableHead>
                <TableHead className="text-xs">GLM 账号</TableHead>
                <TableHead className="text-xs">请求</TableHead>
                <TableHead className="text-xs">模型</TableHead>
                <TableHead className="text-xs">状态</TableHead>
                <TableHead className="text-xs">耗时</TableHead>
                <TableHead className="text-left text-xs">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.request_id}>
                  <TableCell className="text-xs text-muted-foreground">
                    {log.time_str}
                  </TableCell>
                  <TableCell>
                    <code
                      className="block truncate text-[11px] text-muted-foreground"
                      title={log.request_id}
                    >
                      {log.request_id_short}
                    </code>
                  </TableCell>
                  <TableCell
                    className="max-w-0 truncate text-xs text-muted-foreground"
                    title={log.api_key_name || "-"}
                  >
                    {log.api_key_name || "-"}
                  </TableCell>
                  <TableCell
                    className="max-w-0 truncate text-xs text-muted-foreground"
                    title={log.glm_account || "-"}
                  >
                    {log.glm_account || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="truncate text-xs">
                      <span className="font-medium text-muted-foreground">
                        {log.method}
                      </span>{" "}
                      {log.path}
                    </div>
                    {log.error_message && (
                      <div className="mt-0.5 text-[11px] text-destructive truncate max-w-48">
                        {log.error_message}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="truncate text-xs text-muted-foreground">
                    {log.model || "-"}
                  </TableCell>
                  <TableCell>
                    <LogStatusPill log={log} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {log.duration_display}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => navigate(`/admin/logs/${log.request_id}`)}
                      title="查看详情"
                      className="h-7 px-2.5 text-[11px]"
                    >
                      详情
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pagination && (
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-muted-foreground">
                第 {pagination.start_index}-{pagination.end_index} 条，共{" "}
                {pagination.total} 条
              </p>
              <div className="flex items-center justify-between gap-1 md:justify-end">
                <Button
                  variant="outline"
                  size="icon-xs"
                  disabled={!pagination.has_prev}
                  onClick={() => goToPage(1)}
                  title="首页"
                >
                  <ChevronsLeftIcon className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-xs"
                  disabled={!pagination.has_prev}
                  onClick={() => goToPage(pagination.page - 1)}
                  title="上一页"
                >
                  <ChevronLeftIcon className="size-3.5" />
                </Button>
                <span className="px-2 text-xs text-muted-foreground">
                  {pagination.page} / {pagination.page_count}
                </span>
                <Button
                  variant="outline"
                  size="icon-xs"
                  disabled={!pagination.has_next}
                  onClick={() => goToPage(pagination.page + 1)}
                  title="下一页"
                >
                  <ChevronRightIcon className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-xs"
                  disabled={!pagination.has_next}
                  onClick={() => goToPage(pagination.page_count)}
                  title="末页"
                >
                  <ChevronsRightIcon className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
