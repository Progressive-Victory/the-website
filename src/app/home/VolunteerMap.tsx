'use client'
import { Link, Message, TiltMessage } from '@/components/common'
import { Map } from '@/components/Map'
import { useState, useEffect, useRef } from 'react'

const mapText = `The PV community is constantly growing! Our members are
                    organizing in their local communities, identifying campaigns
                    in their area, and using the shared resources, tactics, and
                    people power of Progressive Victory!`

export function VolunteerMap() {
    return (
        <div className="flex w-full flex-col items-center gap-5 bg-black-pearl-light py-10">
            <h1 className="text-center text-4xl font-bold text-white">
                Thousands of <span className="text-valencia">Volunteers</span>
                <br /> Across the US
            </h1>

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
                    botLeftContent={<p>Members: xx</p>}
                >
                    <div className="h-[450px] w-[750px] rounded-md">
                        <Map disableInteraction />
                    </div>
                </Message>
            </TiltMessage>
        </div>
    )
}
