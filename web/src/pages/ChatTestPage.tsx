import { useState, useCallback, useEffect } from "react"
import { api } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  MessageSquare,
  PlayCircle,
  StopCircle,
  CheckCircle2,
  XCircle,
  Search,
  Clock,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"

export default function ChatTestPage() {
  const [models, setModels] = useState<string[]>([])
  const [modelCount, setModelCount] = useState(0)
  const [model, setModel] = useState("glm-4-flash")
  const [modelSearch, setModelSearch] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [userPrompt, setUserPrompt] = useState("你好，介绍一下你自己")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingModels, setLoadingModels] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)

  // 从后端加载模型列表
  useEffect(() => {
    let cancelled = false
    setLoadingModels(true)
    api.config()
      .then((cfg) => {
        if (cancelled) return
        setModels(cfg.models)
        setModelCount(cfg.model_count)
        // 默认选中第一个非图片模型
        const first = cfg.models.find(m => !m.startsWith("glm-image") && !m.startsWith("cogView"))
        if (first) setModel(first)
      })
      .catch(() => toast.error("加载模型列表失败"))
      .finally(() => { if (!cancelled) setLoadingModels(false) })
    return () => { cancelled = true }
  }, [])

  // 模型搜索过滤
  const filteredModels = modelSearch
    ? models.filter(m => m.toLowerCase().includes(modelSearch.toLowerCase()))
    : models

  const handleTest = useCallback(async () => {
    if (!userPrompt.trim()) {
      toast.error("请输入提示词")
      return
    }
    setLoading(true)
    setError(null)
    setResponse("")
    setElapsed(0)
    const startTime = Date.now()
    const timer = setInterval(() => setElapsed(Date.now() - startTime), 100)
    try {
      const result = await api.chatTest(model, userPrompt)
      clearInterval(timer)
      setElapsed(Date.now() - startTime)
      if (result.ok) {
        setResponse(result.reply || "")
        toast.success("对话成功")
      } else {
        setError(result.info || "对话失败")
      }
    } catch {
      clearInterval(timer)
      setError("对话请求失败")
    } finally {
      setLoading(false)
    }
  }, [model, userPrompt])

  return (
    <div className="mx-auto w-full max-w-[1320px] space-y-5">
      {/* 输入区 */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="size-4 text-primary" />
            对话测试
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* 模型选择 */}
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">
                模型
                <span className="ml-1.5 text-muted-foreground/50">
                  ({modelCount} 个可用)
                </span>
              </label>
              {loadingModels ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={model} onValueChange={(v) => { setModel(v ?? "glm-4-flash"); setModelSearch("") }}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[360px]">
                    {/* 搜索框 */}
                    <div className="sticky top-0 z-10 bg-popover px-2 pb-1 pt-1">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="搜索模型..."
                          value={modelSearch}
                          onChange={(e) => setModelSearch(e.target.value)}
                          className="h-8 pl-7 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    {filteredModels.length === 0 ? (
                      <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                        无匹配模型
                      </div>
                    ) : (
                      filteredModels.map((m) => (
                        <SelectItem key={m} value={m}>
                          <span className="font-mono text-xs">{m}</span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* 系统提示 */}
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">
                系统提示（可选）
              </label>
              <Textarea
                placeholder="可选的系统提示词"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={3}
                className="resize-none text-xs min-h-[2.5rem]"
              />
            </div>
          </div>

          {/* 用户提示 */}
          <div className="grid gap-2">
            <label className="text-xs text-muted-foreground">用户提示</label>
            <Textarea
              placeholder="输入测试提示词"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              rows={3}
              className="resize-none text-xs"
            />
          </div>

          {/* 操作栏 */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MessageSquare className="size-3.5" />
              <span>会话将使用游客模式发送</span>
            </div>
            <Button
              size="sm"
              className="h-9 w-full md:w-auto gap-2"
              onClick={handleTest}
              disabled={loading || loadingModels}
            >
              {loading ? (
                <>
                  <StopCircle className="mr-1.5 size-3.5 animate-spin" />
                  请求中 ({(elapsed / 1000).toFixed(1)}s)
                </>
              ) : (
                <>
                  <PlayCircle className="mr-1.5 size-3.5" />
                  发送
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 结果区 */}
      {loading ? (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <RefreshCw className="size-4 text-primary animate-spin" />
              等待响应...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="size-3" />
              已等待 {(elapsed / 1000).toFixed(1)}s
            </div>
          </CardContent>
        </Card>
      ) : response || error ? (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                {error ? (
                  <XCircle className="size-4 text-destructive" />
                ) : (
                  <CheckCircle2 className="size-4 text-success" />
                )}
                {error ? "请求失败" : "响应结果"}
              </CardTitle>
              {elapsed > 0 && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  耗时 {(elapsed / 1000).toFixed(1)}s
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* 模型信息 */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MessageSquare className="size-3.5" />
              <span>{model}</span>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}

            {/* 成功状态 */}
            {!error && (
              <div className="rounded-lg border border-success/35 bg-success-muted/25 px-3 py-2 text-xs text-success">
                测试成功
              </div>
            )}

            {/* 响应正文 */}
            {response && (
              <div className="rounded-lg border border-border/60 bg-muted/50">
                <div className="flex items-center justify-between border-b border-border/60 px-3 py-1.5">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    回复内容
                  </span>
                  <span className="text-[10px] text-muted-foreground/50">
                    {response.length} 字符
                  </span>
                </div>
                <div className="overflow-auto max-h-[500px] p-3">
                  <pre className="whitespace-pre-wrap break-all text-xs text-foreground font-sans leading-relaxed">
                    {response}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
