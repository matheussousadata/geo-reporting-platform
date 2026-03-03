import type { Report } from "@/types/report.ts"

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
