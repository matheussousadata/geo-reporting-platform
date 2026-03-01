"use client"

import { ThumbsUp, Clock, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Report } from "@/types/report"
import { CATEGORIES } from "@/types/report"
import { useReports } from "@/contexts/reports-context"

interface ReportCardProps {
  report: Report
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Hoje"
  if (diffDays === 1) return "Ontem"
  if (diffDays < 7) return `${diffDays} dias atras`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} semana(s) atras`
  return `${Math.floor(diffDays / 30)} mes(es) atras`
}

export function ReportCard({ report }: ReportCardProps) {
  const { likeReport, hasLiked } = useReports()
  const liked = hasLiked(report.id)
  const cat = CATEGORIES[report.category]

  return (
    <div className="flex flex-col gap-2 min-w-[240px] max-w-[280px]">
      <div className="flex items-center gap-2">
        <span
          className="inline-block size-2.5 rounded-full shrink-0"
          style={{ backgroundColor: cat.color }}
        />
        <span className="text-xs font-medium" style={{ color: cat.color }}>
          {cat.label}
        </span>
      </div>

      <h3 className="text-sm font-semibold leading-snug text-foreground">
        {report.title}
      </h3>

      <p className="text-xs leading-relaxed text-muted-foreground">
        {report.description}
      </p>

      <div className="flex items-center justify-between pt-1 border-t border-border/50">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {formatRelativeDate(report.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Tag className="size-3" />
            {report.likes} apoio(s)
          </span>
        </div>

        <Button
          size="sm"
          variant={liked ? "secondary" : "default"}
          disabled={liked}
          onClick={() => likeReport(report.id)}
          className="h-7 gap-1 text-xs"
        >
          <ThumbsUp className="size-3" />
          {liked ? "Apoiado" : "Apoiar"}
        </Button>
      </div>
    </div>
  )
}
