export interface Report {
  id: string
  title: string
  description: string
  category: ReportCategory
  latitude: number
  longitude: number
  likes: number
  createdAt: string
}

export type ReportCategory =
  | "infraestrutura"
  | "iluminacao"
  | "lixo"
  | "alagamento"
  | "transito"
  | "seguranca"
  | "outros"

export interface CategoryConfig {
  label: string
  color: string
  icon: string
}

export const CATEGORIES: Record<ReportCategory, CategoryConfig> = {
  infraestrutura: { label: "Infraestrutura", color: "#E67E22", icon: "construction" },
  iluminacao: { label: "Iluminacao", color: "#F1C40F", icon: "lightbulb" },
  lixo: { label: "Lixo", color: "#27AE60", icon: "trash" },
  alagamento: { label: "Alagamento", color: "#3498DB", icon: "droplets" },
  transito: { label: "Transito", color: "#E74C3C", icon: "car" },
  seguranca: { label: "Seguranca", color: "#9B59B6", icon: "shield" },
  outros: { label: "Outros", color: "#95A5A6", icon: "circle-alert" },
}
