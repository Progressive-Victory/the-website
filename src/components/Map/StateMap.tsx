import { ResponsiveFit } from './ResponsiveFit'
import styles from './StateMap.module.css'
import { OPEN_ATTR, OPEN_MAP_URI } from './constants'
import { StateDataFeatureCollection, statesData } from './stateData'
import { MapView, StateMapInteractionProps } from './types'
import { getMemberCountColor } from './util'
import { getBrandColor } from '@/util/theme'
import { Feature, Geometry } from 'geojson'
import { useCallback, useMemo } from 'react'
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet'

export default function StateMap(
    props: StateMapInteractionProps & {
        enableInteraction?: boolean
        showOpenStreetMap?: boolean
        mapView: MapView
    }
) {
    const { enableInteraction, showOpenStreetMap, mapView, stateMemberCount } =
        props

    // Map Props - Zoom and Center
    const _mapView: MapView = mapView ?? {
        zoom: 4.1,
        center: { lat: 36.2, lng: -96.5 },
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
            className={styles.mapContainer}
        >
            <>
                {'bounds' in _mapView && (
                    <ResponsiveFit bounds={_mapView.bounds} />
                )}

                {showOpenStreetMap && (
                    <TileLayer attribution={OPEN_ATTR} url={OPEN_MAP_URI} />
                )}
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
function USMapLayer({
    data,
    hoveredState,
    stateMemberCount,
    onFeatureClick,
    onFeatureHover,
    selectedState,
}: StateMapInteractionProps & {
    data: StateDataFeatureCollection
}) {
    const getFillColor = useCallback(
        (stateName: string) => {
            if (!stateMemberCount) return undefined
            return getMemberCountColor(stateMemberCount[stateName])
        },
        [stateMemberCount]
    )

    const baseStateColors = useMemo(() => {
        const newObj: Record<string, string | undefined> = {}
        if (stateMemberCount) {
            Object.keys(stateMemberCount).forEach((k) => {
                newObj[k] = getFillColor(k)
            })
        }
        return newObj
    }, [stateMemberCount, getFillColor])

    function onEachFeature(
        f: Feature<Geometry, { name: string }>,
        layer: L.Layer
    ) {
        layer.on({
            mouseover: (e) =>
                onFeatureHover(
                    (e.target as { feature: { properties: { name: string } } })
                        .feature.properties.name
                ),
            mouseout: () => onFeatureHover(null),
            click: (e) =>
                onFeatureClick(
                    (e.target as { feature: { properties: { name: string } } })
                        .feature.properties.name
                ),
        })
    }

    return (
        <>
            <GeoJSON
                data={data}
                style={() => {
                    const strokeColor = getBrandColor('mapBlue', 300)
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
                    const properties = feature?.properties as
                        { name: string } | undefined

                    const baseColor = properties?.name
                        ? baseStateColors?.[properties.name]
                        : undefined

                    return {
                        fillColor:
                            selectedState === properties?.name
                                ? '#CE3728'
                                : hoveredState === properties?.name
                                  ? '#EBAFA9'
                                  : (baseColor ??
                                    getBrandColor('mapBlue', 100)),
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
