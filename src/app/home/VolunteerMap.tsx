'use client'

import { StateMap } from '@/components/Map'
import {
    BBOX_AK,
    BBOX_HI,
    BBOX_PR,
    BBOX_US,
    US_STATES,
} from '@/components/Map/constants'
import { MapView, StateMapInteractionProps } from '@/components/Map/types'
import { Link, Message, TiltMessage } from '@/components/common'
import {
    IMapMemberCountResponse,
    zMapMemberCountResponse,
} from '@/contracts/responses'
import { useFetch } from '@/util/hooks'
import { useEffect, useState } from 'react'

export function VolunteerMap() {
    /* States */
    const [hoveredState, setHoveredState] = useState<string | null>(null)
    const [selectedState, setSelectedState] = useState<string | null>(null)
    const [totalMemberCount, setTotalMemberCount] = useState<number>(0)
    const [stateMemberCount, setStateMemberCount] =
        useState<Record<string, number>>()
    const { onGet } = useFetch()

    useEffect(() => {
        void (async () => {
            const statesCount: Record<string, number> = {}
            const { data } = await onGet<IMapMemberCountResponse>(
                '/map/member-count-by-state',
                zMapMemberCountResponse
            )
            let total = 0
            Object.entries(data).forEach(([k, v]) => {
                const state = US_STATES.find(
                    (s) => s.code.toLowerCase() === k
                )?.name
                if (typeof state === 'string') {
                    statesCount[state] = typeof v === 'number' ? v : 0
                    total += statesCount[state]
                }
            })

            setStateMemberCount(statesCount)
            setTotalMemberCount(total)
        })()
    }, [onGet])

    function onFeatureClick(state: string | null) {
        setSelectedState((prev) => (prev === state ? null : state))
    }

    return (
        <div className="relative flex w-full flex-col items-center justify-center gap-[6vw] bg-black-pearl-dark py-10 2xl:grid 2xl:grid-cols-2">
            {/* Text */}
            <div className="z-3 flex max-w-[750px] flex-col items-center text-center text-white 2xl:order-last">
                <h1 className="mb-8 text-4xl font-bold">
                    Thousands of{' '}
                    <span className="text-valencia">Volunteers</span>
                    <br /> Across the US
                </h1>
                <p className="mb-8 px-4 text-lg font-[500] md:px-24">
                    The PV community is constantly growing. Every new voice adds
                    to the movement!
                </p>
                <Link
                    href={'/volunteer'}
                    className="w-fit justify-self-center bg-valencia"
                >
                    Get Involved
                </Link>
            </div>

            {/* Map */}
            <TiltMessage className="flex justify-center px-8 xl:justify-end">
                <Message
                    className="xl:w-[30vw]"
                    avatar="/images/pv_pride.png"
                    avatarRounded={false}
                    nameColor="red"
                    username="Progressive Victory"
                    text={
                        'Our members are organizing in their local communities, identifying campaigns in their area, and using the shared resources, tactics, and people power of Progressive Victory!'
                    }
                    botDivider={true}
                    botLeftContent={
                        <p className="font-medium">
                            {selectedState
                                ? `Members in ${selectedState}: ${stateMemberCount?.[selectedState]}`
                                : `Total Members: ${totalMemberCount}`}
                        </p>
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
    )
}

interface ExtraMap {
    left: number
    h: number
    w: number
    mapView: MapView
}

function CombinedMap(props: StateMapInteractionProps) {
    const extraMaps: Record<string, ExtraMap> = {
        AK: {
            left: 0,
            h: 120,
            w: 140,
            mapView: { bounds: BBOX_AK },
        },
        HI: {
            left: 174,
            h: 75,
            w: 100,
            mapView: { bounds: BBOX_HI },
        },
        PR: {
            left: 298,
            h: 50,
            w: 70,
            mapView: { bounds: BBOX_PR },
        },
    }

    return (
        <div className="relative min-w-[350px] max-w-[750px] rounded-md border">
            <div className="aspect-video md:aspect-[5/3]">
                <StateMap
                    mapView={{ bounds: BBOX_US }}
                    stateMemberCount={props.stateMemberCount}
                    selectedState={props.selectedState}
                    onFeatureClick={props.onFeatureClick}
                    onFeatureHover={props.onFeatureHover}
                    hoveredState={props.hoveredState}
                />
            </div>

            <div className="pointer-events-none relative bottom-0 left-0 m-1 flex w-3/5 items-end gap-1 sm:absolute sm:w-2/5">
                {Object.entries(extraMaps).map(([, map], i) => (
                    <div
                        key={i}
                        // className={`relative w-full rounded-md border`}
                        className={`relative w-full`}
                        style={{
                            aspectRatio: map.w / map.h,
                            maxWidth: map.w,
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
