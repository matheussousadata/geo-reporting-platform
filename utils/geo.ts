/**
 * Calcula a distancia entre dois pontos usando a formula de Haversine.
 * Retorna a distancia em metros.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000 
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/**
 * Verifica se um ponto esta dentro da bounding box da cidade.
 */
export function isInsideBounds(
  lat: number,
  lng: number,
  bounds: [[number, number], [number, number]]
): boolean {
  const [[lngMin, latMin], [lngMax, latMax]] = bounds
  return lng >= lngMin && lng <= lngMax && lat >= latMin && lat <= latMax
}
