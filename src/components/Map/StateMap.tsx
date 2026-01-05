import { ResponsiveFit } from './ResponsiveFit'
import { OPEN_ATTR, OPEN_MAP_URI } from './constants'
import { StateDataFeatureCollection, statesData } from './stateData'
import { MapView, StateMapInteractionProps } from './types'
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
            className="z-0 size-full rounded-md"
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
const gradientShades = [100, 200, 300, 400, 500, 600, 700] as const

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
    // USED FOR OLD LOGIC BELOW
    // const max = useMemo(() => {
    //     if (!stateMemberCount) return undefined
    //     return Math.max(...Object.values(stateMemberCount))
    // }, [stateMemberCount])

    const getFillColor = useCallback(
        (stateName: string) => {
            if (!stateMemberCount) return undefined

            const memberCount = stateMemberCount[stateName]
            if (!memberCount) return getBrandColor('mapBlue', gradientShades[0])

            // OLD LOGIC FOR DETERMINING STATE COLOR DYNAMICALLY
            // // Determine bin index (0–4) from normalized value
            // const normalized = memberCount / max
            // const index = Math.min(
            //     gradientShades.length - 1,
            //     Math.floor(normalized * gradientShades.length)
            // )

            // Custom buckets for member count colors - requested quick fix
            let index = 0
            if (memberCount > 500) {
                index = 6
            } else if (memberCount > 340) {
                index = 5
            } else if (memberCount > 220) {
                index = 4
            } else if (memberCount > 110) {
                index = 3
            } else if (memberCount > 40) {
                index = 2
            } else if (memberCount > 20) {
                index = 1
            }

            const shade = gradientShades[index]
            return getBrandColor('mapBlue', shade)
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
    }, [stateMemberCount])

    function onEachFeature(
        f: Feature<Geometry, { name: string }>,
        layer: L.Layer
    ) {
        layer.on({
            mouseover: (e) => onFeatureHover(e.target.feature.properties.name),
            mouseout: () => onFeatureHover(null),
            click: (e) => onFeatureClick(e.target.feature.properties.name),
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
                    const baseColor =
                        baseStateColors?.[feature?.properties?.name]

                    return {
                        fillColor:
                            selectedState === feature?.properties?.name
                                ? '#CE3728'
                                : hoveredState === feature?.properties?.name
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
