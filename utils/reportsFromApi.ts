import type { Report } from "@/types/report"

export interface CreateReportPayload {
  tipo: string
  descricao: string
  latitude: number
  longitude: number
  imagem: string[]
  status: string
}

export async function fetchReportsFromApi(): Promise<Report[]> {
  try {
    const apiGet = process.env.NEXT_PUBLIC_API_GET
    if (!apiGet) throw new Error("API_GET não definida")

    const res = await fetch(apiGet)
    if (!res.ok) throw new Error("Erro ao buscar denúncias")

    const rawData = await res.json()

    const adaptedReports: Report[] = rawData.map((item: any) => ({
      id: item.id,
      category: item.tipo,
      latitude: item.latitude,
      longitude: item.longitude,
      likes: item.votos ?? 0,
      description: item.descricao,
      status: item.status,
    }))

    return adaptedReports
  } catch (err) {
    console.error("Erro ao buscar denúncias da API:", err)
    return []
  }
}

export async function createReport(data: CreateReportPayload) {
  const apiPost = process.env.NEXT_PUBLIC_API_POST

  if (!apiPost) {
    throw new Error("API_POST não definida")
  }

  const response = await fetch(apiPost, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Erro ao criar denúncia")
  }

  return response.json()
}

export async function likeReportRequest(id: string) {
  const apiCurtir = process.env.NEXT_PUBLIC_API_CURTIDA

  if (!apiCurtir) {
    throw new Error("API_CURTIDA não definida")
  }

  const res = await fetch(`${apiCurtir}/votar/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || "Erro ao curtir denúncia")
  }

  return res.json()
}