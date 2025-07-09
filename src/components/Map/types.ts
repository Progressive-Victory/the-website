// import { ReactElement } from 'react'

export type MapFocusName = "US" | "Alaska" | "Hawaii" | "PR"
export interface MapView {
  zoom: number,
  center: {
    lat: number;
    lng: number;
  }
}