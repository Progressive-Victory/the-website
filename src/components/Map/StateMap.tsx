import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import { getBrandColor } from "@/util/theme"
import { StateDataFeatureCollection, statesData } from "./stateData"
import { OPEN_ATTR, OPEN_MAP_URI, US_STATES } from "./constants";
import { MapView } from "./types";
import { Feature, Geometry } from "geojson";

export default function StateMap(props: {
	enableInteraction?: boolean;
	showOpenStreetMap?: boolean;
	mapView: MapView;
	onFeatureClick: (e: any) => void;
	onFeatureHover: (e: any) => void;
	selectedState: string | null;
	hoveredState: string | null;
	stateMemberCount?: Record<string, number>;
}) {
	const { enableInteraction, showOpenStreetMap, mapView, stateMemberCount } = props;

	// Map Props - Zoom and Center
	const _mapView = mapView ?? {
		zoom: 4.1,
		center: { lat: 36.2, lng: -96.5 }
	}

	// USMapLayer Data state handling
	// const statesDataJSON = useMemo(() => {
	//     if (!stateMemberCount) return statesData



	// }, [])

	return (
		<MapContainer
			{..._mapView}
			zoomSnap={0.1}
			zoomControl={false}
			attributionControl={false}
			scrollWheelZoom={enableInteraction}
			dragging={enableInteraction}
			doubleClickZoom={enableInteraction}
			className="z-0 size-full rounded-md"

		>
			<>
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

// Map Layers
const gradientShades = [100, 200, 300, 400, 500] as const;

function USMapLayer({ data, hoveredState, stateMemberCount, onFeatureClick, onFeatureHover, selectedState }: {
	data: StateDataFeatureCollection;
	stateMemberCount?: Record<string, number>;
	onFeatureClick: (e: any) => void;
	onFeatureHover: (e: any) => void;
	selectedState: string | null;
	hoveredState: string | null;
}) {
	const max = useMemo(() => {
		if (!stateMemberCount) return undefined
		return Math.max(...Object.values(stateMemberCount))
	}, [stateMemberCount])

	const getFillColor = useCallback((stateName: string) => {
		if (!stateMemberCount || !max) return undefined;

		const memberCount = stateMemberCount[stateName];
		if (!memberCount) return getBrandColor('blue', gradientShades[0]);

		// Determine bin index (0–4) from normalized value
		const normalized = memberCount / max;
		const index = Math.min(
			gradientShades.length - 1,
			Math.floor(normalized * gradientShades.length)
		);

		const shade = gradientShades[index];
		return getBrandColor('blue', shade);
	}, [stateMemberCount]);

	const baseStateColors = useMemo(() => {
		let newObj: Record<string, any> = {}
		stateMemberCount && Object.keys(stateMemberCount).forEach(k => {
			newObj[k] = getFillColor(k)
		})
		return newObj
	}, [stateMemberCount])

	function onEachFeature(f: Feature<Geometry, any>, layer: L.Layer) {
		layer.on({
			mouseover: e => onFeatureHover(e.target.feature.properties.name),
			mouseout: e => onFeatureHover(null),
			click: e => onFeatureClick(e.target.feature.properties.name)
		})
	}

	return (
		<>
			<GeoJSON
				data={data}
				style={() => {
					const strokeColor = getBrandColor('blue', 200)
					return {
						weight: 8,
						opacity: 1,
						fillOpacity: 1,
						color: strokeColor,
						fillColor: strokeColor,
					}
				}}
			/>
			<GeoJSON
				data={data}
				onEachFeature={onEachFeature}
				style={(feature) => {
					const baseColor = baseStateColors?.[feature?.properties?.name]

					return {
						fillColor: (selectedState === feature?.properties?.name)
							? "#CE3728"
							: (hoveredState === feature?.properties?.name)
								? "#EBAFA9"
								: baseColor ?? getBrandColor('blue', 100),
						weight: 2,
						opacity: 1,
						color: '#fff',
						dashArray: '3',
						fillOpacity: 0.9,
					}
				}}
			/>
		</>
	)
}

