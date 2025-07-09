'use client'
import { Link, Message, TiltMessage } from '@/components/common'
import { StateMap } from '@/components/Map'
import { Volunteer } from './Volunteer'
import { useEffect, useState } from 'react'
import { MapView, StateMapInteractionProps } from '@/components/Map/types'
import { US_STATES } from '@/components/Map/constants'

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
        <div className="flex w-full flex-col items-center gap-6 bg-black-pearl-light py-10">
            <h1 className="text-center text-4xl font-bold text-white">
                Thousands of <span className="text-valencia">Volunteers</span>
                <br /> Across the US
            </h1>

            <div className="grid w-full grid-cols-1 justify-center px-20 xl:grid-cols-2">
                <div className="flex justify-center">
                    <TiltMessage>
                        <Message
                            avatar="/images/pv_pride.png"
                            avatarRounded={false}
                            nameColor="red"
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

                <div className="flex justify-center">
                    <Volunteer />
                </div>
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
            h: 140,
            w: 170,
            mapView: { zoom: 2, center: { lat: 63, lng: -154 } }
        },
        "HI": {
            left: 174,
            h: 90,
            w: 120,
            mapView: { zoom: 4.8, center: { lat: 20.5, lng: -157.3 } }
        },
        "PR": {
            left: 298,
            h: 60,
            w: 90,
            mapView: { zoom: 5.5, center: { lat: 18.3, lng: -66.4 } }
        }
    }

    return (
        <div className="relative h-[450px] w-[750px]">
            <StateMap
                mapView={{
                    zoom: 4.1,
                    center: { lat: 36.2, lng: -96.5 }
                }}
                stateMemberCount={props.stateMemberCount}
                selectedState={props.selectedState}
                onFeatureClick={props.onFeatureClick}
                onFeatureHover={props.onFeatureHover}
                hoveredState={props.hoveredState}
            />

            {Object.entries(extraMaps).map(([, map], i) => (
                <div
                    key={i}
                    className={`absolute bottom-0 rounded-md border`}
                    style={{
                        left: map.left,
                        height: map.h,
                        width: map.w
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
    )
}
