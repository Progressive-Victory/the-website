import { MapContainer, TileLayer } from "react-leaflet";
import { MapView, StateMapInteractionProps } from "./types";
import { OPEN_ATTR, OPEN_MAP_URI } from "./utils/constants";
import { statesData } from "./utils/stateData"
import { ResponsiveFit } from "./utils/ResponsiveFit";
import { USMapLayer } from "./utils/CustomLayers";

export default function StateMap(props: StateMapInteractionProps & {
  enableInteraction?: boolean;
  showOpenStreetMap?: boolean;
  mapView: MapView;
}) {
  const { enableInteraction, showOpenStreetMap, mapView, stateMemberCount } = props;

  // Map Props - Zoom and Center
  const _mapView: MapView = mapView ?? {
    zoom: 4.1,
    center: { lat: 36.2, lng: -96.5 }
  }

  return (
    <MapContainer
      {..._mapView}
      keyboard={false}
      zoomSnap={0.1}
      zoomControl={false}
      attributionControl={false}
      scrollWheelZoom={enableInteraction}
      dragging={enableInteraction}
      doubleClickZoom={enableInteraction}
      className="z-0 size-full rounded-md"
    >
      <>
        {"bounds" in _mapView && <ResponsiveFit bounds={_mapView.bounds} />}

        {showOpenStreetMap && <TileLayer attribution={OPEN_ATTR} url={OPEN_MAP_URI} />}
        <USMapLayer
          data={statesData}
          stateMemberCount={stateMemberCount}
          onFeatureClick={props.onFeatureClick}
          onFeatureHover={props.onFeatureHover}
          selectedState={props.selectedState}
          hoveredState={props.hoveredState}

        />
      </>
    </MapContainer>
  )
}
