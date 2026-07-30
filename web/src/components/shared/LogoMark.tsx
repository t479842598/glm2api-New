import { cn } from "@/lib/utils"

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-lg bg-logo-background p-1 shadow-sm", className)}
    >
      <svg viewBox="0 0 64 64" className="size-full">
        <defs>
          <linearGradient
            id="glm-mark"
            x1="10"
            y1="10"
            x2="54"
            y2="54"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="var(--logo-start)" />
            <stop offset="1" stopColor="var(--logo-end)" />
          </linearGradient>
        </defs>
        {/* 圆角方形背景 */}
        <rect
          x="3"
          y="3"
          width="58"
          height="58"
          rx="14"
          ry="14"
          fill="var(--logo-background)"
        />
        {/* G 字母 */}
        <path
          d="M18 22c0-4.8 3.9-8.7 8.7-8.7h10.6c4.8 0 8.7 3.9 8.7 8.7v3.5h-4.4V22c0-2.4-1.9-4.3-4.3-4.3H26.7c-2.4 0-4.3 1.9-4.3 4.3v20c0 2.4 1.9 4.3 4.3 4.3h10.6c2.4 0 4.3-1.9 4.3-4.3v-6.5h-6.5v-4.4H44V42c0 4.8-3.9 8.7-8.7 8.7H26.7c-4.8 0-8.7-3.9-8.7-8.7V22z"
          fill="url(#glm-mark)"
        />
        {/* 装饰光点 */}
        <circle cx="46" cy="18" r="3.5" fill="var(--logo-highlight)" />
      </svg>
    </div>
  )
}
