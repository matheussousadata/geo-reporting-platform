// Bounding box da cidade - [lng_min, lat_min], [lng_max, lat_max]
// Lagoa do Piauí, PI - CEP 64388-000
export const CITY_BOUNDS: [[number, number], [number, number]] = [
  [-42.7800, -5.5400],
  [-42.5100, -5.3000],
]

// Centro da cidade
export const CITY_CENTER: [number, number] = [-42.6440, -5.4150]

// Zoom padrao
export const DEFAULT_ZOOM = 13

// Raio minimo entre denuncias (em metros)
export const MIN_REPORT_DISTANCE = 20

// Estilos do mapa
export const MAP_STYLE_SATELLITE = "mapbox://styles/mapbox/satellite-streets-v12"
export const MAP_STYLE_TERRAIN = "mapbox://styles/mapbox/outdoors-v12"

// Estilo padrao
export const MAP_STYLE = MAP_STYLE_SATELLITE
