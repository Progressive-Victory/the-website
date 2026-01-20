// import { ReactElement } from 'react'
import { LatLngBoundsExpression } from 'leaflet'

export type MapFocusName = 'US' | 'Alaska' | 'Hawaii' | 'PR'
export type MapView =
    | {
          zoom: number
          center: {
              lat: number
              lng: number
          }
      }
    | {
          bounds: LatLngBoundsExpression
      }

export interface StateMapInteractionProps {
    onFeatureClick: (e: string | null) => void
    onFeatureHover: (e: string | null) => void
    selectedState: string | null
    hoveredState: string | null
    stateMemberCount?: Record<string, number>
}
