'use client'
import { useEffect, useState } from 'react'
import { Link, Message, TiltMessage } from '@/components/common'
import { StateMap } from '@/components/Map'
import { MapView, StateMapInteractionProps } from '@/components/Map/types'
import { BBOX_AK, BBOX_HI, BBOX_PR, BBOX_US, US_STATES } from '@/components/Map/constants'

const mapText = `The PV community is constantly growing! Our members are
                    organizing in their local communities, identifying campaigns
                    in their area, and using the shared resources, tactics, and
                    people power of Progressive Victory!`

export function VolunteerMap() {
    /* States */
    const [hoveredState, setHoveredState] = useState<string | null>(null);
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [totalMemberCount, setTotalMemberCount] = useState<number>(0);
    const [stateMemberCount, setStateMemberCount] = useState<Record<string, number>>();

    useEffect(() => {
        void (async () => {
            const statesCount: Record<string, number> = {}
            const smc = await (await fetch("/api/map/count")).json()
            Object.entries(smc).forEach(([k, v]) => {
                const state = US_STATES.find(s => s.code === k)?.name
                if (typeof state === "string" && typeof v === "number") {
                    statesCount[state] = v
                }
            })
            const total = await (await fetch("/api/map/users-count")).json()
            setStateMemberCount(statesCount)
            setTotalMemberCount(total)
        })()
    }, [])

    function onFeatureClick(state: string | null) {
        setSelectedState(prev => prev === state ? null : state)
    }

    return (
        <div className="w-full flex flex-col justify-center xl:grid xl:grid-cols-2 items-center gap-10 bg-black-pearl-light py-20">
            {/* Text */}
            <div className="text-center text-white max-w-[800px] xl:order-last">
                <h1 className="text-4xl font-bold mb-4">
                    Thousands of <span className="text-valencia">Volunteers</span>
                    <br /> Across the US
                </h1>
                <p className="text-lg px-4 md:px-24">
                    The PV community is constantly growing! Our members are organizing in their local communities, identifying campaigns in their area, and using the shared resources, tactics, and people power of Progressive Victory!
                </p>
            </div>

            {/* Map */}
            <div className="w-full flex justify-center xl:justify-end px-4">
                <TiltMessage>
                    <Message
                        avatar="/images/pv_pride.png"
                        avatarRounded={false}
                        nameColor="red"
                        className="w-full max-w-[800px]"
                        username="Progressive Victory"
                        text={mapText}
                        topRightContent={
                            <Link
                                href={'/volunteer'}
                                className="bg-valencia !px-3 !py-1.5 !text-sm"
                            >
                                Get Involved
                            </Link>
                        }
                        botDivider={true}
                        botLeftContent={
                            <p className="font-medium">{selectedState
                                ? `Members in ${selectedState}: ${stateMemberCount?.[selectedState]}`
                                : `Total Members: ${totalMemberCount}`
                            }</p>
                        }
                    >
                        <CombinedMap
                            stateMemberCount={stateMemberCount}
                            onFeatureClick={onFeatureClick}
                            onFeatureHover={setHoveredState}
                            hoveredState={hoveredState}
                            selectedState={selectedState}
                        />
                    </Message>
                </TiltMessage>
            </div>
        </div >
    )
}

interface ExtraMap {
    left: number;
    h: number;
    w: number;
    mapView: MapView;
}

function CombinedMap(props: StateMapInteractionProps) {
    const extraMaps: Record<string, ExtraMap> = {
        "AK": {
            left: 0,
            h: 120,
            w: 140,
            mapView: { bounds: BBOX_AK }
            // mapView: { zoom: 2, center: { lat: 63, lng: -154 } }
        },
        "HI": {
            left: 174,
            h: 75,
            w: 100,
            mapView: { bounds: BBOX_HI }

            // mapView: { zoom: 4.8, center: { lat: 20.5, lng: -157.3 } }
        },
        "PR": {
            left: 298,
            h: 50,
            w: 70,
            mapView: { bounds: BBOX_PR }
            // mapView: { zoom: 5.5, center: { lat: 18.3, lng: -66.4 } }
        }
    }

    return (
        <div className="relative w-full">
            <div className="max-w-[750px] aspect-video md:aspect-[5/3]">
                <StateMap
                    mapView={{ bounds: BBOX_US }}
                    stateMemberCount={props.stateMemberCount}
                    selectedState={props.selectedState}
                    onFeatureClick={props.onFeatureClick}
                    onFeatureHover={props.onFeatureHover}
                    hoveredState={props.hoveredState}
                />
            </div>

            <div className="relative sm:absolute flex items-end bottom-0 left-0 gap-1 w-4/5">
                {Object.entries(extraMaps).map(([, map], i) => (
                    <div
                        key={i}
                        className={`relative rounded-md border w-full`}
                        style={{
                            aspectRatio: map.w / map.h,
                            maxWidth: map.w
                        }}
                    >
                        <StateMap
                            mapView={map.mapView}
                            stateMemberCount={props.stateMemberCount}
                            selectedState={props.selectedState}
                            onFeatureClick={props.onFeatureClick}
                            onFeatureHover={props.onFeatureHover}
                            hoveredState={props.hoveredState}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
