import { useState, useCallback } from "react"
import { api } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"
import { toast } from "sonner"

export default function ChatTestPage() {
  const [model, setModel] = useState("glm-4-flash")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [userPrompt, setUserPrompt] = useState("你好，介绍一下你自己")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTest = useCallback(async () => {
    if (!userPrompt.trim()) {
      toast.error("请输入提示词")
      return
    }
    setLoading(true)
    setError(null)
    setResponse("")
    try {
      const result = await api.chatTest(model, userPrompt)
      if (result.ok) {
        setResponse(result.reply || "")
        toast.success("对话成功")
      } else {
        setError(result.info || "对话失败")
      }
    } catch {
      setError("对话请求失败")
    } finally {
      setLoading(false)
    }
  }, [model, userPrompt])

  return (
    <div className="mx-auto w-full max-w-[1320px] space-y-5">
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="size-4 text-primary" />
            对话测试
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">模型</label>
              <Select value={model} onValueChange={(v) => setModel(v ?? "glm-4-flash")}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="glm-4-flash">glm-4-flash</SelectItem>
                  <SelectItem value="glm-4">glm-4</SelectItem>
                  <SelectItem value="glm-4-plus">glm-4-plus</SelectItem>
                  <SelectItem value="glm-4-air">glm-4-air</SelectItem>
                  <SelectItem value="glm-3-turbo">glm-3-turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">
                系统提示（可选）
              </label>
              <Textarea
                placeholder="可选的系统提示词"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={3}
                className="resize-none text-xs"
              />
            </div>
          </div>
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
          <div className="flex items-center justify-end">
            <Button
              size="sm"
              className="h-9 w-full md:w-auto gap-2"
              onClick={handleTest}
              disabled={loading}
            >
              {loading ? (
                <>
                  <StopCircle className="mr-1.5 size-3.5 animate-spin" />
                  测试中
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

      {loading ? (
        <Card className="border-border/60 shadow-sm">
          <CardContent className="pt-4">
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ) : response || error ? (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              {error ? "错误" : "响应"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                <XCircle className="mr-1.5 size-3 inline" />
                {error}
              </div>
            ) : (
              <div className="mb-3 rounded-lg border border-success/35 bg-success-muted/25 px-3 py-2 text-xs text-success">
                <CheckCircle2 className="mr-1.5 size-3 inline" />
                测试成功
              </div>
            )}
            <div className="rounded-lg bg-muted/50 p-4">
              <pre className="whitespace-pre-wrap break-all text-xs text-foreground font-mono max-h-[400px] overflow-auto">
                {response}
              </pre>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
