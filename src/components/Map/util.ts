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

export const zipToLatLong = async (
    zipcode: number
): Promise<NominatimResponse[]> => {
    try {
        const url = `https://nominatim.openstreetmap.org/search?postalcode=${zipcode}&country=us&format=json`
        const response = await fetch(url)
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error fetching location data:', error)
        return []
    }
}
