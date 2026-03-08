"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo  } from "react"
import type { Report, CreateReportPayload, ReportCategory } from "@/types/report"
import { fetchReportsFromApi, likeReportRequest, createReport } from "@/utils/reportsFromApi"
import { haversineDistance, isInsideBounds } from "@/utils/geo"
import { CITY_BOUNDS, MIN_REPORT_DISTANCE } from "@/utils/constants"
import socket from "@/utils/socket";

interface ReportsContextType {
  reports: Report[]
  addReport: (
    data: Omit<CreateReportPayload, "latitude" | "longitude">,
    lat: number,
    lng: number
  ) => Promise<{ success: boolean; error?: string }>
  likeReport: (id: string) => void
  hasLiked: (id: string) => boolean
  totalLikes: number
}

const ReportsContext = createContext<ReportsContextType | null>(null)

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<Report[]>([])
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())

  const totalLikes = useMemo(() => reports.reduce((sum, r) => sum + r.likes, 0), [reports])

  useEffect(() => {
    socket.on("novaDenuncia", (apiReport) => {

      const report: Report = {
        id: apiReport.id,
        title: apiReport.descricao ?? "",
        description: apiReport.descricao,
        category: apiReport.tipo,
        latitude: Number(apiReport.latitude),
        longitude: Number(apiReport.longitude),
        likes: apiReport.votos ?? 0,
        createdAt: apiReport.createdAt ?? new Date().toISOString()
      }
      if (isNaN(report.latitude) || isNaN(report.longitude)) {
        console.warn("Coordenadas inválidas:", apiReport)
        return
      }
      setReports((prev) => {
        if (prev.some(r => r.id === report.id)) return prev
        return [report, ...prev]
      })
    })

    socket.on("denunciaAtualizada", ({ id, votos }) => {
      setReports((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, likes: votos } : r
        )
      )
    })
    return () => {
      socket.off("novaDenuncia")
      socket.off("denunciaAtualizada")
    }
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem("liked-reports")
      if (saved) {
        setLikedIds(new Set(JSON.parse(saved)))
      }
    } catch {
      
    }
  }, [])

  useEffect(() => {
    async function loadReports() {
      const fetchedReports = await fetchReportsFromApi()
      if (fetchedReports.length > 0) {
        setReports(fetchedReports) 
      }
    } 
    loadReports()
  }, [])

  const addReport = useCallback(
    async (
      data: Omit<CreateReportPayload, "latitude" | "longitude">,
      lat: number,
      lng: number
    ) => { 
      if (!isInsideBounds(lat, lng, CITY_BOUNDS)) {
        return {
          success: false,
          error: "Local fora dos limites da cidade."
        }
      } 
      const tooClose = reports.some(
        (r) =>
          haversineDistance(
            r.latitude,
            r.longitude,
            lat,
            lng
          ) < MIN_REPORT_DISTANCE
      )
      if (tooClose) {
        return {
          success: false,
          error: "Já existe uma denúncia muito próxima deste local."
        }
      }
      try {
        await createReport({
            tipo: data.category,
            descricao: data.description,
            latitude: lat,
            longitude: lng,
            imagem: [],
            status: "pendente"
        })
        return { success: true }
      } catch (err) {
        console.error("Erro ao criar denúncia:", err)
        return {
          success: false,
          error: "Erro ao enviar denúncia."
        }
      }
    },
    [reports]
  )

  const likeReport = useCallback(async (id: string) => {
    if (likedIds.has(id)) return

    try {
      await likeReportRequest(id)

      setLikedIds((prev) => {
        const next = new Set(prev)
        next.add(id)
        localStorage.setItem("liked-reports", JSON.stringify([...next]))
        return next
      })

    } catch (err) {
      console.error("Erro ao enviar curtida:", err)
    }
  }, [likedIds])

  const hasLiked = useCallback((id: string) => likedIds.has(id), [likedIds])

  return (
    <ReportsContext.Provider value={{ reports, addReport, likeReport, hasLiked, totalLikes }}>
      {children}
    </ReportsContext.Provider>
  )
}

export function useReports() {
  const ctx = useContext(ReportsContext)
  if (!ctx) throw new Error("useReports deve ser usado dentro de ReportsProvider")
  return ctx
}
