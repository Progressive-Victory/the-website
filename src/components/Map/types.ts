// import { ReactElement } from 'react'

export type MapFocusName = "US" | "Alaska" | "Hawaii" | "PR"
export interface MapView {
  zoom: number,
  center: {
    lat: number;
    lng: number;
  }
}

export interface StateMapInteractionProps {
  onFeatureClick: (e: string | null) => void;
  onFeatureHover: (e: string | null) => void;
  selectedState: string | null;
  hoveredState: string | null;
  stateMemberCount?: Record<string, number>;
}