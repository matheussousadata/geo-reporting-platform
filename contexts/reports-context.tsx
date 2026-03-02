"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { Report, ReportCategory } from "@/types/report"
import { MOCK_REPORTS } from "@/utils/mock-data"
import { haversineDistance, isInsideBounds } from "@/utils/geo"
import { CITY_BOUNDS, MIN_REPORT_DISTANCE } from "@/utils/constants"

interface ReportsContextType {
  reports: Report[]
  addReport: (
    data: { title: string; description: string; category: ReportCategory },
    lat: number,
    lng: number
  ) => { success: boolean; error?: string }
  likeReport: (id: string) => void
  hasLiked: (id: string) => boolean
}

const ReportsContext = createContext<ReportsContextType | null>(null)

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())

  // Carregar likes salvos do localStorage na montagem
  useEffect(() => {
    try {
      const saved = localStorage.getItem("liked-reports")
      if (saved) {
        setLikedIds(new Set(JSON.parse(saved)))
      }
    } catch {
      // Ignora erros de parsing
    }
  }, [])

  const addReport = useCallback(
    (
      data: { title: string; description: string; category: ReportCategory },
      lat: number,
      lng: number
    ): { success: boolean; error?: string } => {
      // Verificar se esta dentro dos limites
      if (!isInsideBounds(lat, lng, CITY_BOUNDS)) {
        return { success: false, error: "Local fora dos limites da cidade." }
      }

      // Verificar proximidade com outros markers (20m)
      const tooClose = reports.some(
        (r) => haversineDistance(r.latitude, r.longitude, lat, lng) < MIN_REPORT_DISTANCE
      )
      if (tooClose) {
        return {
          success: false,
          error: "Ja existe uma denuncia muito proxima deste local.",
        }
      }

      const newReport: Report = {
        id: crypto.randomUUID(),
        title: data.title,
        description: data.description,
        category: data.category,
        latitude: lat,
        longitude: lng,
        likes: 0,
        createdAt: new Date().toISOString(),
      }

      setReports((prev) => [newReport, ...prev])
      return { success: true }
    },
    [reports]
  )

  const likeReport = useCallback(
    async (id: string) => {
      if (likedIds.has(id)) return

      try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_CURTIDA}/votar/${id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
            }
          )

          if (!res.ok) {
            throw new Error("Erro ao curtir denúncia")
          }

          const { likes } = await res.json()

          // atualiza likes com o valor vindo do backend
          setReports((prev) =>
            prev.map((r) =>
              r.id === id ? { ...r, likes } : r
            )
          )

          // marca como curtido no front (UX)
          setLikedIds((prev) => {
            const next = new Set(prev)
            next.add(id)
            localStorage.setItem("liked-reports", JSON.stringify([...next]))
            return next
          })
        } catch (err) {
          console.error("Erro ao enviar curtida:", err)
        }
      },
    [likedIds]
  )

  const hasLiked = useCallback(
    (id: string) => likedIds.has(id),
    [likedIds]
  )

  return (
    <ReportsContext.Provider value={{ reports, addReport, likeReport, hasLiked }}>
      {children}
    </ReportsContext.Provider>
  )
}

export function useReports() {
  const ctx = useContext(ReportsContext)
  if (!ctx) throw new Error("useReports deve ser usado dentro de ReportsProvider")
  return ctx
}
