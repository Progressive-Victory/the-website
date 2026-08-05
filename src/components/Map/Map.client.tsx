'use client'

import { OPEN_ATTR, OPEN_MAP_URI, US_CENTER } from './constants'
import { StateDataFeatureCollection, statesData } from './stateData'
import { zipToLatLong } from './util'
import { getBrandColor, ShadeIndex } from '@/util/theme'
import L from 'leaflet'
import { ReactElement, useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, GeoJSON } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'

// Types
interface MarkerCluster {
    getChildCount: () => number
}

interface LatLon {
    lat: string | number
    lon: string | number
}

const createClusterCustomIcon = function (cluster: MarkerCluster) {
    return L.divIcon({
        html: `<div><p>${cluster.getChildCount()}</p></div>`,
        className: 'custom-marker-cluster',
        iconSize: L.point(33, 33, true),
    })
}

// Map Layers
export const USMapLayer = ({
    isHeatmap,
    data,
}: {
    isHeatmap?: boolean
    data: StateDataFeatureCollection
}) => {
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
                style={() => {
                    // TODO: pull in data from api instead of using random shades
                    const shade = getBrandColor(
                        'mapBlue',
                        [700, 600, 500, 400, 300, 200, 100][
                            Math.floor(Math.random() * 5)
                        ] as ShadeIndex
                    )

                    const fillColor = isHeatmap
                        ? shade
                        : getBrandColor('mapBlue', 500)

                    return {
                        fillColor,
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

export const OpenStreetMapLayer = () => {
    return <TileLayer attribution={OPEN_ATTR} url={OPEN_MAP_URI} />
}

export const MarkerLayer = ({ markerList }: { markerList: LatLon[] }) => {
    return (
        <MarkerClusterGroup
            iconCreateFunction={createClusterCustomIcon}
            singleMarkerMode
            spiderfyOnMaxZoom={false}
            chunkedLoading
        >
            {markerList.map(({ lat, lon }, index) => (
                <Marker key={index} position={[+lat, +lon]} />
            ))}
        </MarkerClusterGroup>
    )
}

export interface MapProps {
    hideOpenStreetMap?: boolean
    disableInteraction?: boolean
    children?: ReactElement
    zipCodes?: number[]
    variant?: 'heatmap' | 'marker'
}

// Map
export const ClientMap = ({
    hideOpenStreetMap,
    disableInteraction,
    children,
    zipCodes,
    variant,
}: MapProps) => {
    const isHeatmap = !variant || variant === 'heatmap'
    const isMarker = variant === 'marker'

    const [markerList, setMarkerList] = useState<LatLon[]>([])

    useEffect(() => {
        const fetcher = async () => {
            if (!zipCodes) return
            const newList = [] as { lat: string; lon: string }[]
            for (const zipcode of zipCodes) {
                const data = await zipToLatLong(zipcode)
                if (data) newList.push(data)
            }
            setMarkerList(newList)
        }
        if (isMarker) void fetcher()

        return () => {
            setMarkerList([])
        }
    }, [zipCodes, isMarker])

    return (
        <MapContainer
            zoom={4.1}
            center={US_CENTER}
            zoomSnap={0.1}
            zoomControl={false}
            attributionControl={false}
            scrollWheelZoom={!disableInteraction}
            dragging={!disableInteraction}
            doubleClickZoom={!disableInteraction}
            className="z-0 size-full rounded-md"
        >
            {children ?? (
                <>
                    {!hideOpenStreetMap && <OpenStreetMapLayer />}
                    <USMapLayer isHeatmap={isHeatmap} data={statesData} />
                    {isMarker && <MarkerLayer markerList={markerList} />}
                </>
            )}
        </MapContainer>
    )
}

export default ClientMap
