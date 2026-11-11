import { getBrandColor } from '@/util/theme'

const gradientShades = [100, 200, 300, 400, 500, 600, 700] as const

/** Hand-picked buckets rather than a normalized scale - requested quick fix. */
export function getMemberCountColor(memberCount: number | undefined) {
    let index = 0
    if (!memberCount) index = 0
    else if (memberCount > 500) index = 6
    else if (memberCount > 340) index = 5
    else if (memberCount > 220) index = 4
    else if (memberCount > 110) index = 3
    else if (memberCount > 40) index = 2
    else if (memberCount > 20) index = 1

    return getBrandColor('mapBlue', gradientShades[index])
}

interface NominatimResponse {
    place_id: number
    licence: string
    lat: string
    lon: string
    class: string
    type: string
    place_rank: number
    importance: number
    addresstype: string
    name: string
    display_name: string
    boundingbox: string[]
}

export const zipToLatLong = async (zipcode: number) => {
    try {
        const url = `https://nominatim.openstreetmap.org/search?postalcode=${zipcode}&country=us&format=json`
        const response = await fetch(url)
        const data = (await response.json()) as NominatimResponse[]
        const { lat, lon } = data[0]
        return { lat, lon }
    } catch (error) {
        console.error('Error fetching location data:', error)
        return null
    }
}
