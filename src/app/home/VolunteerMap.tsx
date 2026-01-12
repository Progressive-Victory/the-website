'use client'

import styles from './map.module.css'
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
    }, [])

    function onFeatureClick(state: string | null) {
        setSelectedState((prev) => (prev === state ? null : state))
    }

    return (
        <div className={styles.container}>
            <div className={styles.textBlock}>
                <h1 className={styles.title}>
                    Thousands of{' '}
                    <span className={styles.titleAccent}>Volunteers</span>
                    <br /> Across the US
                </h1>
                <p className={styles.subtitle}>
                    The PV community is constantly growing. Every new voice adds
                    to the movement!
                </p>

                <Link href={'/volunteer'} className={styles.ctaLink}>
                    Get Involved
                </Link>
            </div>

            <TiltMessage className={styles.tiltMessage}>
                <Message
                    className={styles.message}
                    avatar="/images/pv_pride.png"
                    avatarRounded={false}
                    nameColor="red"
                    username="Progressive Victory"
                    text={
                        'Our members are organizing in their local communities, identifying campaigns in their area, and using the shared resources, tactics, and people power of Progressive Victory!'
                    }
                    botDivider={true}
                    botLeftContent={
                        <p className={styles.botLeftText}>
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
        <div className={styles.mapShell}>
            <div className={styles.mainMapAspect}>
                <StateMap
                    mapView={{ bounds: BBOX_US }}
                    stateMemberCount={props.stateMemberCount}
                    selectedState={props.selectedState}
                    onFeatureClick={props.onFeatureClick}
                    onFeatureHover={props.onFeatureHover}
                    hoveredState={props.hoveredState}
                />
            </div>

            <div className={styles.extraMaps}>
                {Object.entries(extraMaps).map(([, map], i) => (
                    <div
                        key={i}
                        className={styles.extraMapItem}
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
