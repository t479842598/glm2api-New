import { api } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/shared/CopyButton"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { usePolling } from "@/hooks/use-polling"
import { Server, Info, RefreshCw } from "lucide-react"

interface EnvData {
  environment: string
  path: string
  exists: boolean
  content: string
  editable: boolean
  message: string
}

export default function EnvPage() {
  const { data, loading, error, refresh } = usePolling(() => api.env(), 0)

  const env: EnvData | null = data as EnvData | null

  if (loading && !env) {
    return (
      <div className="mx-auto w-full max-w-[960px] space-y-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">环境配置</h1>
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center justify-center py-12">
            <LoadingSpinner size={24} />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-[960px] space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">环境配置</h1>
            <p className="text-sm text-muted-foreground">加载失败: {error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="mr-1.5 size-3" />
            重试
          </Button>
        </div>
      </div>
    )
  }

  if (!env) return null

  return (
    <div className="mx-auto w-full max-w-[960px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">环境配置</h1>
          <p className="text-sm text-muted-foreground">查看 .env 文件内容（敏感值已脱敏）</p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} className="h-8">
          <RefreshCw className="mr-1.5 size-3" />
          刷新
        </Button>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>{env.message}</AlertDescription>
      </Alert>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Server className="size-4 text-primary" />
                .env 文件
                <Badge variant="outline" className="text-[10px]">
                  {env.environment}
                </Badge>
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                路径: {env.path} · 状态: {env.exists ? "存在" : "不存在"}
              </p>
            </div>
            {env.content && (
              <CopyButton text={env.content} className="h-7 text-xs" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {env.content ? (
            <pre className="overflow-x-auto rounded-lg border border-border/60 bg-muted/40 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
              {env.content}
            </pre>
          ) : (
            <div className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
              .env 文件不存在或无法读取
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
