export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse` +
      `?format=jsonv2&zoom=18&addressdetails=1&accept-language=es` +
      `&lat=${lat}&lon=${lng}`

    const res = await fetch(url, {
      headers: { 'Accept-Language': 'es' },
    })

    if (!res.ok) return null

    const data = await res.json()

    if (!data?.address) return null

    const a = data.address
    const street = a.road ?? a.pedestrian ?? a.footway ?? ''
    const number = a.house_number ?? ''
    const part = [street, number].filter(Boolean).join(' ')
    const zone = a.suburb ?? a.quarter ?? a.city_district ?? a.neighbourhood ?? ''
    const city = a.city ?? a.town ?? a.village ?? a.municipality ?? a.state ?? ''

    return [part, zone, city].filter(Boolean).join(', ') || null
  } catch {
    return null
  }
}
