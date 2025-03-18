'use client'
import L from 'leaflet'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, GeoJSON } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { zipToLatLong } from './util'
import { statesData } from './stateData'
import { getBrandColor, ShadeIndex } from '@/util/theme'
import { US_CENTER } from '@/components/Map/constants'

type MarkerCluster = {
    getChildCount: () => number
}

const createClusterCustomIcon = function (cluster: MarkerCluster) {
    return L.divIcon({
        html: `<div><p>${cluster.getChildCount()}</p></div>`,
        className: 'custom-marker-cluster',
        iconSize: L.point(33, 33, true),
    })
}

export interface MapProps {
    zipCodes?: number[]
    variant?: 'heatmap' | 'marker'
}

const USMapLayer = ({ isHeatmap }: { isHeatmap?: boolean }) => {
    return (
        <GeoJSON
            data={statesData}
            style={() => {
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

const MarkerLayer = ({
    markerList,
}: {
    markerList: { lat: string | number; lon: string | number }[]
}) => {
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

export default function ClientMap({ zipCodes, variant }: MapProps) {
    const isHeatmap = !variant || variant === 'heatmap'
    const isMarker = variant === 'marker'

    const [markerList, setMarkerList] = useState<
        { lat: string; lon: string; name: string }[]
    >([])

    useEffect(() => {
        const fetcher = async () => {
            const zipcodes = [28390, 90210, 28201, 10001, 60601, 98101]
            for (const zipcode of zipcodes) {
                const response = await zipToLatLong(zipcode)
                if (response.length) {
                    const { lat, lon, name } = response[0]
                    setMarkerList((prevData) => [
                        ...prevData,
                        ...Array(10)
                            .fill(null)
                            .map(() => ({
                                lat: (Number(lat) + Math.random()).toString(),
                                lon: (Number(lon) + Math.random()).toString(),
                                name,
                            })),
                    ])
                }
                await new Promise((resolve) => setTimeout(resolve, 10))
            }
        }
        if (isMarker) fetcher()
    }, [])

    return (
        <MapContainer
            center={US_CENTER}
            zoom={4}
            maxZoom={9}
            minZoom={3}
            scrollWheelZoom
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <USMapLayer isHeatmap={isHeatmap} />
            {isMarker && <MarkerLayer markerList={markerList} />}
        </MapContainer>
    )
}
