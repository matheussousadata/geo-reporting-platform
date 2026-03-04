"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useReports } from "@/contexts/reports-context"
import { CATEGORIES } from "@/types/report"
import type { Report } from "@/types/report"
import { CITY_BOUNDS, CITY_CENTER, DEFAULT_ZOOM, MAP_STYLE_SATELLITE, MAP_STYLE_TERRAIN } from "@/utils/constants"
import { isInsideBounds } from "@/utils/geo"
import { SearchBar } from "@/components/search-bar"
import { ReportModal } from "@/components/report-modal"
import { ReportCard } from "@/components/report-card"
import { ReportsPanel } from "@/components/reports-panel"
import { Navigation, Plus, AlertTriangle, X, MapPin, Satellite, Mountain, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchReportsFromApi } from "@/utils/reportsFromApi"

function createPinSvg(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40">
    <defs>
      <filter id="shadow" x="-30%" y="-10%" width="160%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.4)"/>
      </filter>
    </defs>
    <path d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.716 23.284 0 15 0z" fill="${color}" filter="url(#shadow)" stroke="rgba(255,255,255,0.9)" stroke-width="1.5"/>
    <circle cx="15" cy="14" r="6" fill="rgba(255,255,255,0.85)"/>
  </svg>`
}

function add3DBuildings(map: mapboxgl.Map) {
  if (map.getLayer("3d-buildings")) return

  const layers = map.getStyle().layers
  const labelLayerId = layers?.find(
    (layer) => layer.type === "symbol" && layer.layout?.["text-field"]
  )?.id

  map.addLayer(
    {
      id: "3d-buildings",
      source: "composite",
      "source-layer": "building",
      filter: ["==", "extrude", "true"],
      type: "fill-extrusion",
      minzoom: 13,
      paint: {
        "fill-extrusion-color": [
          "interpolate",
          ["linear"],
          ["get", "height"],
          0,
          "#ddd",
          50,
          "#bbb",
          100,
          "#999",
        ],
        "fill-extrusion-height": [
          "interpolate",
          ["linear"],
          ["zoom"],
          13,
          0,
          13.5,
          ["get", "height"],
        ],
        "fill-extrusion-base": [
          "interpolate",
          ["linear"],
          ["zoom"],
          13,
          0,
          13.5,
          ["get", "min_height"],
        ],
        "fill-extrusion-opacity": 0.7,
      },
    },
    labelLayerId
  )
}

function addTerrain(map: mapboxgl.Map) {
  if (!map.getSource("mapbox-dem")) {
    map.addSource("mapbox-dem", {
      type: "raster-dem",
      url: "mapbox://mapbox.mapbox-terrain-dem-v1",
      tileSize: 512,
      maxzoom: 14,
    })
  }
  map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 })
}

function removeTerrain(map: mapboxgl.Map) {
  map.setTerrain(null)
  if (map.getSource("mapbox-dem")) {
    map.removeSource("mapbox-dem")
  }
}

function applyStyleExtras(map: mapboxgl.Map, satellite: boolean) {
  if (satellite) {
    // Satelite: sem terreno, apenas construcoes 3D
    removeTerrain(map)
    add3DBuildings(map)
  } else {
    // Relevo: terreno + construcoes 3D
    addTerrain(map)
    add3DBuildings(map)
  }
}


export function MapContainer() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const ignoreNextClick = useRef(false) 
  const {reports: hookReports } = useReports()
  const [reports, setReports] = useState<Report[]>(hookReports) 
  const [modalOpen, setModalOpen] = useState(false) 
  const [clickCoords, setClickCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [showLocationPrompt, setShowLocationPrompt] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isSatellite, setIsSatellite] = useState(true)
  const [panelOpen, setPanelOpen] = useState(false) 
  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // Inicializar o mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE_SATELLITE,
      center: CITY_CENTER,
      zoom: DEFAULT_ZOOM,
      maxBounds: [
        [CITY_BOUNDS[0][0] - 0.02, CITY_BOUNDS[0][1] - 0.02],
        [CITY_BOUNDS[1][0] + 0.02, CITY_BOUNDS[1][1] + 0.02],
      ],
      minZoom: 11,
      maxZoom: 18,
      attributionControl: false,
      pitch: 45,
      bearing: -10,
    })

    map.addControl(new mapboxgl.NavigationControl(), "bottom-right")
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
        showUserHeading: false,
      }),
      "bottom-right"
    )

    map.on("style.load", () => {
      applyStyleExtras(map, true)
    })

    // Click no mapa para criar denuncia
    map.on("click", (e) => {
      if (ignoreNextClick.current) {
        ignoreNextClick.current = false
        return
      }
      const { lat, lng } = e.lngLat
      if (!isInsideBounds(lat, lng, CITY_BOUNDS)) {
        showToast("Local fora dos limites da cidade.", "error")
        return
      }
      setSelectedReport(null)
      setClickCoords({ lat, lng })
      setModalOpen(true)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [showToast])

  // Trocar estilo do mapa
  const toggleMapStyle = useCallback(() => {
    const map = mapRef.current
    if (!map) return

    const newSatellite = !isSatellite
    setIsSatellite(newSatellite)

    // Guardar estado da camera
    const center = map.getCenter()
    const zoom = map.getZoom()
    const pitch = map.getPitch()
    const bearing = map.getBearing()

    map.setStyle(newSatellite ? MAP_STYLE_SATELLITE : MAP_STYLE_TERRAIN)

    // Restaurar camera e aplicar extras (terreno apenas no relevo) apos troca de estilo
    map.once("style.load", () => {
      map.setCenter(center)
      map.setZoom(zoom)
      map.setPitch(pitch)
      map.setBearing(bearing)
      applyStyleExtras(map, newSatellite)
    })
  }, [isSatellite])

  // Pedir geolocalizacao
  const handleAllowLocation = useCallback(() => {
    setShowLocationPrompt(false)
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        if (mapRef.current && isInsideBounds(latitude, longitude, CITY_BOUNDS)) {
          mapRef.current.flyTo({ center: [longitude, latitude], zoom: 15 })
        }
      },
      () => {}
    )
  }, [])

  const handleDenyLocation = useCallback(() => {
    setShowLocationPrompt(false)
  }, [])

  // Sincronizar markers com reports
  useEffect(() => {
  const map = mapRef.current
  if (!map) return

  const currentIds = new Set(reports.map((r) => r.id))

  // remove markers antigos
  markersRef.current.forEach((marker, id) => {
    if (!currentIds.has(id)) {
      marker.remove()
      markersRef.current.delete(id)
    }
  })

  reports.forEach((report) => {
    if (markersRef.current.has(report.id)) return

    const cat = CATEGORIES[report.category]

    if (!cat) {
      console.warn("Categoria inválida:", report.category)
      return
    }

    const el = document.createElement("div")
    el.className = "report-marker"
    el.style.width = "30px"
    el.style.height = "40px"
    el.style.cursor = "pointer"
    el.innerHTML = createPinSvg(cat.color)

    el.addEventListener("mouseenter", () => {
      el.style.filter =
        "brightness(1.25) drop-shadow(0 0 6px rgba(255,255,255,0.35))"
      el.style.transition = "filter 0.2s ease"
    })

    el.addEventListener("mouseleave", () => {
      el.style.filter = "none"
    })

    el.addEventListener("click", (e) => {
      e.stopPropagation()
      ignoreNextClick.current = true
      setSelectedReport(report)
      setModalOpen(false)
      setPanelOpen(false)

      map.flyTo({
        center: [report.longitude, report.latitude],
        zoom: Math.max(map.getZoom(), 15),
        duration: 800,
      })
    })

    const marker = new mapboxgl.Marker({
      element: el,
      anchor: "bottom",
    })
      .setLngLat([report.longitude, report.latitude])
      .addTo(map)

    markersRef.current.set(report.id, marker)
  })
}, [reports])

  const handleSearchSelect = useCallback((lng: number, lat: number) => {
    setSelectedReport(null)
    setPanelOpen(false)
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 16, duration: 1500 })
  }, [])

  // Selecionar denuncia do pa 
  const handlePanelSelectReport = useCallback((report: Report) => {
    setPanelOpen(false)
    setSelectedReport(report)
    mapRef.current?.flyTo({
      center: [report.longitude, report.latitude],
      zoom: 16,
      duration: 1200,
    })
  }, [])

  // Exibir denuncias no mapa e enviar denuncias
useEffect(() => {
  async function loadReports() {
    try {
      const reports = await fetchReportsFromApi()
      setReports(reports)
    } catch (err) {
      console.error("Erro ao buscar denúncias:", err)
    }
  }

  loadReports()
}, [])

  // Atualizar selectedReport quando reports mudam
  useEffect(() => {
    if (!selectedReport) return
    const updated = reports.find((r) => r.id === selectedReport.id)
    if (updated && updated.likes !== selectedReport.likes) {
      setSelectedReport(updated)
    }
  }, [reports, selectedReport])

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Barra de pesquisa */}
      <SearchBar onSelect={handleSearchSelect} />

      {/* Botoes flutuantes: lista de denuncias e toggle de estilo */}
      <div className="absolute top-72 left-4 z-10 flex flex-col gap-2">
        
        {/* Botao abrir painel de denuncias */}
        <button
          onClick={() => {
            setPanelOpen((v) => !v)
            setSelectedReport(null)
          }}
          className="flex items-center justify-center size-10 rounded-xl bg-background/90 backdrop-blur-md border border-border/50 shadow-lg hover:bg-accent transition-colors"
          aria-label="Ver denuncias"
          title="Ver todas as denuncias"
        >
          <List className="size-18px text-foreground" />
        </button>

        {/* Toggle satelite / relevo */}
        <button
          onClick={toggleMapStyle}
          className="flex items-center justify-center size-10 rounded-xl bg-background/90 backdrop-blur-md border border-border/50 shadow-lg hover:bg-accent transition-colors"
          aria-label={isSatellite ? "Mudar para relevo" : "Mudar para satelite"}
          title={isSatellite ? "Visualizacao em relevo" : "Visualizacao por satelite"}
        >
          {isSatellite ? (
            <Mountain className="size-18px text-foreground" />
          ) : (
            <Satellite className="size-18px text-foreground" />
          )}
        </button>
      </div>

      {/* Painel lateral de denuncias */}
      <ReportsPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onSelectReport={handlePanelSelectReport}
      />

      {/* Modal de localizacao */}
      {showLocationPrompt && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm bg-card text-card-foreground rounded-xl p-6 shadow-2xl border border-border/50">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex items-center justify-center size-14 rounded-full bg-primary/10">
                <Navigation className="size-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Permitir Localizacao</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Deseja compartilhar sua localizacao para centralizar o mapa na sua posicao atual?
              </p>
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={handleDenyLocation}>
                  Nao
                </Button>
                <Button className="flex-1" onClick={handleAllowLocation}>
                  Permitir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de instrucao */}
      {!showLocationPrompt && !modalOpen && !selectedReport && !panelOpen && (
        <div className="absolute bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-2 bg-background/90 backdrop-blur-md text-foreground px-4 py-2.5 rounded-full shadow-lg border border-border/50 text-sm">
            <Plus className="size-4 text-primary" />
            <span>Clique no mapa para criar uma denuncia</span>
          </div>
        </div>
      )}

      {/* Painel flutuante do report selecionado */}
      {selectedReport && (
        <div className="absolute bottom-20 md:bottom-6 left-4 right-4 z-10 mx-auto max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-xl p-4 shadow-2xl">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Fechar"
            >
              <X className="size-4" />
            </button>
            <ReportCard report={selectedReport} />
          </div>
        </div>
      )}

      {/* Modal de criacao de denuncia */}
      <ReportModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        coordinates={clickCoords}
        onSuccess={() => showToast("Denuncia criada com sucesso!", "success")}
        onError={(msg) => showToast(msg, "error")}
      />

      {/* Toast */}
      {toast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-top-2 duration-300">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium ${
              toast.type === "success"
                ? "bg-emerald-950/90 text-emerald-200 border-emerald-800/50"
                : "bg-red-950/90 text-red-200 border-red-800/50"
            }`}
          >
            {toast.type === "success" ? (
              <MapPin className="size-4" />
            ) : (
              <AlertTriangle className="size-4" />
            )}
            {toast.message}
            <button
              onClick={() => setToast(null)}
              className="ml-2 hover:opacity-70 transition-opacity"
              aria-label="Fechar"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Legenda de categorias - reposicionada para nao sobrepor no mobile */}
      <div className="absolute top-95 z-10 right-4 md:top-auto md:bottom-45">
        <div className="bg-background/90 backdrop-blur-md border border-border/50 rounded-xl p-3 shadow-lg">
          <p className="text-xs font-semibold text-foreground mb-2">Categorias</p>
          <div className="flex flex-col gap-1.5">
            {Object.entries(CATEGORIES).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-xs text-muted-foreground">{config.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
