// ResponsiveFit.tsx
import type { LatLngBoundsExpression } from 'leaflet'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

/**
 * On mount and whenever the window resizes,
 * re‑invalidate the map’s size and re‑fit the given bounds.
 */
export function ResponsiveFit({ bounds }: { bounds: LatLngBoundsExpression }) {
    const map = useMap()
    useEffect(() => {
        const update = () => {
            map.invalidateSize() // tell Leaflet the div size changed
            map.fitBounds(bounds) // recompute center/zoom to your bbox
        }

        // initial fit
        update()
        // listen for resize
        window.addEventListener('resize', update)
        return () => window.removeEventListener('resize', update)
    }, [map, bounds])

    return null
}
