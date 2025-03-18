'use client'
import L from 'leaflet'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, GeoJSON } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { zipToLatLong } from './util'
import { statesData } from './stateData'
import { OPEN_ATTR, OPEN_MAP_URI, US_CENTER } from './constants'
import { getBrandColor, ShadeIndex } from '@/util/theme'

// Types
type MarkerCluster = {
    getChildCount: () => number
}

type LatLon = { lat: string | number; lon: string | number }

const createClusterCustomIcon = function (cluster: MarkerCluster) {
    return L.divIcon({
        html: `<div><p>${cluster.getChildCount()}</p></div>`,
        className: 'custom-marker-cluster',
        iconSize: L.point(33, 33, true),
    })
}

export interface MapProps {
    disableInteraction?: boolean
    hideOpenStreetMap?: boolean
    zipCodes?: number[]
    variant?: 'heatmap' | 'marker'
}

// Map Layers
const USMapLayer = ({ isHeatmap }: { isHeatmap?: boolean }) => {
    return (
        <GeoJSON
            data={statesData}
            style={() => {
                // TODO: pull in data from api instead of using random shades
                const shade = getBrandColor(
                    'blue',
                    [500, 400, 300, 200, 100][
                        Math.floor(Math.random() * 5)
                    ] as ShadeIndex
                )
                return {
                    fillColor: isHeatmap ? shade : getBrandColor('blue', 300),
                    weight: 2,
                    opacity: 1,
                    color: '#fff',
                    dashArray: '3',
                    fillOpacity: 0.9,
                }
            }}
        />
    )
}

const OpenStreetMapLayer = () => {
    return <TileLayer attribution={OPEN_ATTR} url={OPEN_MAP_URI} />
}

const MarkerLayer = ({ markerList }: { markerList: LatLon[] }) => {
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

// Map
export default function ClientMap({
    disableInteraction,
    hideOpenStreetMap,
    zipCodes,
    variant,
}: MapProps) {
    const isHeatmap = !variant || variant === 'heatmap'
    const isMarker = variant === 'marker'

    const [markerList, setMarkerList] = useState<LatLon[]>([])

    useEffect(() => {
        const fetcher = async () => {
            if (!zipCodes) return
            const newList = []
            for (const zipcode of zipCodes) {
                const data = await zipToLatLong(zipcode)
                if (data) newList.push(data)
            }
            setMarkerList(newList)
        }
        if (isMarker) fetcher()

        return () => {
            setMarkerList([])
        }
    }, [zipCodes, isMarker])

    return (
        <MapContainer
            zoom={3}
            minZoom={3}
            maxZoom={9}
            center={US_CENTER}
            zoomControl={false}
            attributionControl={false}
            scrollWheelZoom={!disableInteraction}
            dragging={!disableInteraction}
            className="z-0 size-full"
        >
            {!hideOpenStreetMap && <OpenStreetMapLayer />}
            <USMapLayer isHeatmap={isHeatmap} />
            {isMarker && <MarkerLayer markerList={markerList} />}
        </MapContainer>
    )
}
