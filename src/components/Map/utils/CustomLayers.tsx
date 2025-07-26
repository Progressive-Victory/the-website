import { useCallback, useMemo } from "react";
import { GeoJSON } from "react-leaflet";
import { StateMapInteractionProps } from "../types";
import { StateDataFeatureCollection, StateDataFeatureProps } from "./stateData";
import { getBrandColor } from "@/util/theme";
import { Feature, Geometry } from "geojson";
import { STATE_COALITIONS } from "./constants";

// Map Layers
const gradientShades = [100, 200, 300, 400, 500] as const;

export function USMapLayer({
    coalition,
    data,
    hoveredState,
    stateMemberCount,
    onFeatureClick,
    onFeatureHover,
    selectedState
}: StateMapInteractionProps & {
    data: StateDataFeatureCollection;
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
    }, [stateMemberCount, max]);

    const baseStateColors = useMemo(() => {
        const newObj: Record<string, string | undefined> = {}
        if (stateMemberCount) {
            Object.keys(stateMemberCount).forEach(k => {
                newObj[k] = getFillColor(k)
            })
        }
        return newObj
    }, [stateMemberCount, getFillColor])

    function onEachFeature(f: Feature<Geometry, { name: string }>, layer: L.Layer) {
        layer.on({
            mouseover: e => onFeatureHover(e.target.feature.properties.name),
            mouseout: () => onFeatureHover(null),
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
                style={(feature: Feature<Geometry, StateDataFeatureProps> | undefined) => {
                    if (!feature) return {};

                    let fillColor =
                        baseStateColors?.[feature.properties.name]
                        ?? getBrandColor('blue', 100);

                    if (coalition) {
                        fillColor = getCoalitionColor(feature.properties.name)
                    } else if (selectedState === feature.properties.name) {
                        fillColor = "#CE3728"
                    } else if (hoveredState === feature.properties.name) {
                        fillColor = "#EBAFA9"
                    }

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

function getCoalitionColor(name: string): string {
    let res = getBrandColor("blue", 100)

    Object.entries(STATE_COALITIONS).forEach(([key, value]) => {
        if (value.includes(name)) {
            switch (key) {
                case 'Northeastern':
                    res = '#09223A'
                    break;
                case 'Southern':
                    res = '#FDB515'
                    break;
                case 'Midwestern':
                    res = '#2986CC'
                    break;
                case 'Western':
                    res = '#CE3728'
                    break;
            }
        }
    })

    return res
}
