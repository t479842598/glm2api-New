import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api-client"
import type { ApiKeyItem } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CopyButton } from "@/components/shared/CopyButton"
import { PaginationControls } from "@/components/shared/PaginationControls"
import {
  MobileListSkeleton,
  TableSkeleton,
} from "@/components/shared/PageSkeletons"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

const KEYS_PAGE_SIZE = 10

function KeyMobileCard({
  item,
  onDelete,
  onToggle,
}: {
  item: ApiKeyItem
  onDelete: () => void
  onToggle: () => void
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="text-[10px] font-bold">AK</span>
            </div>
            <p className="truncate text-sm font-medium">{item.name || "-"}</p>
          </div>
          <code className="mt-2 block truncate text-xs text-muted-foreground">
            {item.key}
          </code>
        </div>
        <CopyButton text={item.key} className="size-9 shrink-0" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-muted/35 px-3 py-2">
          <p className="text-muted-foreground">创建时间</p>
          <p className="mt-1 font-medium">{item.created_at}</p>
        </div>
        <div className="rounded-lg bg-muted/35 px-3 py-2">
          <p className="text-muted-foreground">状态</p>
          <p className="mt-1 font-medium">{item.enabled ? "启用" : "禁用"}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-3">
        <span className="text-xs text-muted-foreground">
          {item.enabled ? "可用于接口认证" : "已禁用，不参与认证"}
        </span>
        <div className="flex gap-2">
          <Button
            variant={item.enabled ? "outline" : "default"}
            size="sm"
            onClick={onToggle}
            className="h-9 px-3 text-xs"
          >
            {item.enabled ? "禁用" : "启用"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="h-9 px-3 text-xs"
          >
            删除
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [keyName, setKeyName] = useState("")
  const [keyValue, setKeyValue] = useState("")
  const [creating, setCreating] = useState(false)
  const [keyPage, setKeyPage] = useState(1)

  const fetchKeys = useCallback(async () => {
    try {
      setLoading(true)
      const result = await api.getKeys()
      setKeys(result.items)
    } catch {
      toast.error("加载 Key 列表失败")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchKeys()
  }, [fetchKeys])

  const handleCreate = async () => {
    try {
      setCreating(true)
      const result = await api.createKey(
        keyName.trim() || "未命名",
        keyValue.trim() || undefined,
      )
      if (result.raw_key) {
        navigator.clipboard.writeText(result.raw_key)
        toast.success("Key 已创建并复制到剪贴板（仅此一次显示）")
      }
      await fetchKeys()
      setKeyPage(
        Math.max(Math.ceil((keys.length + 1) / KEYS_PAGE_SIZE), 1),
      )
      setKeyName("")
      setKeyValue("")
      setDialogOpen(false)
    } catch {
      toast.error("创建 Key 失败")
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (name: string) => {
    if (!window.confirm(`确认删除 Key "${name}"？此操作不可撤销。`)) return
    try {
      await api.deleteKey(name)
      toast.success("已删除")
      await fetchKeys()
    } catch {
      toast.error("删除 Key 失败")
    }
  }

  const handleToggle = async (name: string) => {
    try {
      await api.toggleKey(name)
      toast.success("已切换状态")
      await fetchKeys()
    } catch {
      toast.error("切换状态失败")
    }
  }

  const keyPageCount = Math.max(Math.ceil(keys.length / KEYS_PAGE_SIZE), 1)
  const currentKeyPage = Math.min(Math.max(keyPage, 1), keyPageCount)
  const keyStartOffset = (currentKeyPage - 1) * KEYS_PAGE_SIZE
  const paginatedKeys = keys.slice(
    keyStartOffset,
    keyStartOffset + KEYS_PAGE_SIZE,
  )
  const keyStartIndex = keys.length === 0 ? 0 : keyStartOffset + 1
  const keyEndIndex = Math.min(keyStartOffset + KEYS_PAGE_SIZE, keys.length)

  useEffect(() => {
    setKeyPage((page) => Math.min(Math.max(page, 1), keyPageCount))
  }, [keyPageCount])

  return (
    <div className="mx-auto w-full max-w-[1320px] space-y-5">
      <div className="flex items-center justify-between">
        <div />
        <Button
          size="sm"
          className="h-10 w-full md:h-7 md:w-auto"
          onClick={() => setDialogOpen(true)}
        >
          <PlusIcon className="mr-1.5 size-3.5" />
          创建 Key
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>创建新 Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">
                名称（可选）
              </label>
              <Input
                placeholder="输入 Key 名称"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate()
                }}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">
                Key 值（可选，留空则自动生成）
              </label>
              <Input
                placeholder="留空自动生成 32 位随机值"
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate()
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              取消
            </DialogClose>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "创建中..." : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? (
        <>
          <MobileListSkeleton items={3} className="md:hidden" />
          <TableSkeleton rows={3} columns={5} className="hidden md:block" />
        </>
      ) : keys.length === 0 ? (
        <div className="rounded-lg border border-border/60 bg-card py-16 text-center shadow-sm">
          <div className="mx-auto flex size-8 items-center justify-center rounded-full bg-muted/30 text-muted-foreground">
            <span className="text-[10px] font-bold">AK</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">暂无 API Key</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            点击上方按钮创建
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {paginatedKeys.map((item) => (
              <KeyMobileCard
                key={item.name}
                item={item}
                onDelete={() => handleDelete(item.name)}
                onToggle={() => handleToggle(item.name)}
              />
            ))}
          </div>

          <Table
            containerClassName="hidden md:block max-h-[560px]"
            className="min-w-[860px] table-fixed"
          >
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[32%]" />
              <col className="w-[16%]" />
              <col className="w-[16%]" />
              <col className="w-[10%]" />
              <col className="w-[8%]" />
            </colgroup>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">名称</TableHead>
                <TableHead className="text-xs">Key</TableHead>
                <TableHead className="text-xs">创建时间</TableHead>
                <TableHead className="text-xs">状态</TableHead>
                <TableHead className="text-center text-xs">操作</TableHead>
                <TableHead className="text-left text-xs">删除</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedKeys.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="truncate text-sm font-medium text-foreground">
                    {item.name || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-2">
                      <code className="inline-flex min-w-0 max-w-full items-center rounded-md border border-border/60 bg-muted/25 px-2.5 py-1 font-mono text-[11px] text-muted-foreground shadow-inner shadow-background/30">
                        <span className="truncate">{item.key}</span>
                      </code>
                      <CopyButton text={item.key} />
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.created_at}
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge
                      variant={item.enabled ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {item.enabled ? "启用" : "禁用"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={item.enabled ? "outline" : "default"}
                      size="xs"
                      onClick={() => handleToggle(item.name)}
                      className="h-7 px-2.5 text-[11px]"
                    >
                      {item.enabled ? "禁用" : "启用"}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="xs"
                      onClick={() => handleDelete(item.name)}
                      className="h-7 px-2.5 text-[11px]"
                    >
                      删除
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <PaginationControls
            page={currentKeyPage}
            pageCount={keyPageCount}
            total={keys.length}
            startIndex={keyStartIndex}
            endIndex={keyEndIndex}
            onPageChange={setKeyPage}
          />
        </>
      )}
    </div>
  )
}
