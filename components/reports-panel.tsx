"use client"

import { useState, useEffect, useMemo } from "react"
import { X, ChevronRight, MapPin, ThumbsUp, List, Loader2 } from "lucide-react" 
import { useReports } from "@/contexts/reports-context"
import { CATEGORIES } from "@/types/report"
import type { Report } from "@/types/report"

interface ReportsPanelProps {
  open: boolean
  onClose: () => void
  onSelectReport: (report: Report) => void
}

interface ReportWithAddress extends Report {
  address?: string
}

export function ReportsPanel({ open, onClose, onSelectReport }: ReportsPanelProps) {
  const { reports, hasLiked, likeReport } = useReports()
  const [reportsWithAddresses, setReportsWithAddresses] = useState<ReportWithAddress[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>("all")

  // Reverse geocoding para obter nomes de rua
  useEffect(() => {
    if (!open || reports.length === 0) return

    let cancelled = false
    setLoadingAddresses(true)

    async function fetchAddresses() {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      const results: ReportWithAddress[] = []

      for (const report of reports) {
        if (cancelled) break
        try {
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${report.longitude},${report.latitude}.json?access_token=${token}&types=address,poi&language=pt&limit=1`
          )
          const data = await res.json()
          const placeName = data.features?.[0]?.place_name || "Endereco desconhecido"
          results.push({ ...report, address: placeName })
        } catch {
          results.push({ ...report, address: "Endereco indisponivel" })
        }
      }

      if (!cancelled) {
        setReportsWithAddresses(results)
        setLoadingAddresses(false)
      }
    }

    fetchAddresses()
    return () => { cancelled = true }
  }, [open, reports])

  const filtered = useMemo(() => {
    if (filterCategory === "all") return reportsWithAddresses
    return reportsWithAddresses.filter((r) => r.category === filterCategory)
  }, [reportsWithAddresses, filterCategory])

  // Agrupar por rua (primeiras 2 partes do endereco)
  const grouped = useMemo(() => {
    const map = new Map<string, ReportWithAddress[]>()
    for (const r of filtered) {
      const parts = r.address?.split(",") || []
      const street = parts[0]?.trim() || "Local desconhecido"
      if (!map.has(street)) map.set(street, [])
      map.get(street)!.push(r)
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length)
  }, [filtered])

  if (!open) return null

  return (
    <div className="absolute inset-y-0 left-0 z-20 w-full max-w-sm animate-in slide-in-from-left duration-300">
      <div className="h-full bg-background/95 backdrop-blur-xl border-r border-border/50 shadow-2xl flex flex-col">
      
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <List className="size-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Denuncias ({reports.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-8 rounded-lg hover:bg-accent transition-colors"
            aria-label="Fechar painel"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        {/* Filtro por categoria */}
        <div className="px-4 py-3 border-b border-border/30 overflow-x-auto">
          <div className="flex gap-1.5">
            <button
              onClick={() => setFilterCategory("all")}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterCategory === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent/60 text-muted-foreground hover:bg-accent"
              }`}
            >
              Todas
            </button>
            {Object.entries(CATEGORIES).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setFilterCategory(key)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterCategory === key
                    ? "text-primary-foreground"
                    : "bg-accent/60 text-muted-foreground hover:bg-accent"
                }`}
                style={filterCategory === key ? { backgroundColor: config.color } : undefined}
              >
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: config.color }}
                />
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de denuncias */}
        <div className="flex-1 overflow-y-auto">
          {loadingAddresses ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="size-6 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground">Carregando enderecos...</p>
            </div>
          ) : grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16">
              <MapPin className="size-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Nenhuma denuncia encontrada</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {grouped.map(([street, streetReports]) => (
                <div key={street}>
                  {/* Header da rua */}
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-accent/30 border-b border-border/20">
                    <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs font-semibold text-muted-foreground truncate">
                      {street}
                    </span>
                    <span className="text-xs text-muted-foreground/60 shrink-0">
                      ({streetReports.length})
                    </span>
                  </div>

                  {/* Reports dessa rua */}
                  {streetReports.map((report) => {
                    const cat = CATEGORIES[report.category]
                    const liked = hasLiked(report.id)

                    return (
                      <div key={report.id} onClick={() => onSelectReport(report)} 
                      className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-accent/40 transition-colors border-b border-border/15">
                        {/* Indicador de cor */}
                        <div className="shrink-0 mt-1">
                          <span
                            className="flex size-3 rounded-full ring-2 ring-background"
                            style={{ backgroundColor: cat.color }}
                          />
                        </div>

                        {/* Conteudo */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-foreground truncate">
                              {report.title}
                            </h3>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {report.description}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs text-muted-foreground/70" style={{ color: cat.color }}>
                              {cat.label}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (!liked) likeReport(report.id)
                              }}
                              className={`flex items-center gap-1 text-xs transition-colors ${
                                liked
                                  ? "text-primary"
                                  : "text-muted-foreground/70 hover:text-primary"
                              }`}
                            >
                              <ThumbsUp className="size-3" />
                              {report.likes}
                            </button>
                          </div>
                        </div>

                        {/* Seta de navegacao */}
                        <div className="shrink-0 flex items-center justify-center mt-2">
                          <ChevronRight className="size-4 text-muted-foreground/50" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
