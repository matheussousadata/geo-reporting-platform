"use client"

import { ReportsProvider } from "@/contexts/reports-context"
import { MapContainer } from "@/components/map-container"

export default function Home() {
  return (
    <ReportsProvider>
      <main className="h-dvh w-full overflow-hidden">
        <MapContainer />
      </main>
    </ReportsProvider>
  )
}
