'use client'
'use client'

// import {
//     ENDORSEMENTS,
//     type Endorsement,
// } from '../endorsements/endorsements.data'
// import styles from '@/app/endorsements/endorsement.module.css'
import { Message, TiltMessage } from '@/components/common'
// import { motion, useTransform, useSpring } from 'motion/react'
import Image from 'next/image'
import type React from 'react'

// import { useState } from 'react'

const avatarImage = '/images/PV_Pride_Logo.png'

export default function EndorsementsAlt() {
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                justifyItems: 'center',
                padding: '2rem',
                gap: '2rem',
                zIndex: 1,
            }}
        >
            <Message
                avatar={avatarImage}
                avatarRounded={false}
                username="Progressive Victory"
                nameColor="red"
                text="It's all fun and games w PV members at the Katie Wilson Watch Party tonight in Seattle! Congratulations to @wilsonformayor and all the volunteers who spent months working to help her win!"
                image="/images/ANALILIA MEJIA.png"
            />

            <TiltMessage>
                <Message
                    avatar={avatarImage}
                    avatarRounded={false}
                    username="Progressive Victory"
                    nameColor="red"
                    text="It's all fun and games w PV members at the Katie Wilson Watch Party tonight in Seattle! Congratulations to @wilsonformayor and all the volunteers who spent months working to help her win!"
                    image="/images/ANALILIA MEJIA.png"
                />
            </TiltMessage>
            <TiltMessage>
                <Message
                    avatar={avatarImage}
                    avatarRounded={false}
                    username="Progressive Victory"
                    nameColor="red"
                    text="It's all fun and games w PV members at the Katie Wilson Watch Party tonight in Seattle! Congratulations to @wilsonformayor and all the volunteers who spent months working to help her win!"
                    image="/images/ANALILIA MEJIA.png"
                />
            </TiltMessage>
            <TiltMessage>
                <Message
                    avatar={avatarImage}
                    avatarRounded={false}
                    username="Progressive Victory"
                    nameColor="red"
                    text="It's all fun and games w PV members at the Katie Wilson Watch Party tonight in Seattle! Congratulations to @wilsonformayor and all the volunteers who spent months working to help her win!"
                    image="/images/ANALILIA MEJIA.png"
                />
            </TiltMessage>
            <TiltMessage>
                <Message
                    avatar={avatarImage}
                    avatarRounded={false}
                    username="Progressive Victory"
                    nameColor="red"
                    text="It's all fun and games w PV members at the Katie Wilson Watch Party tonight in Seattle! Congratulations to @wilsonformayor and all the volunteers who spent months working to help her win!"
                    image="/images/ANALILIA MEJIA.png"
                />
            </TiltMessage>
            <TiltMessage>
                <Message
                    avatar={avatarImage}
                    avatarRounded={false}
                    username="Progressive Victory"
                    nameColor="red"
                    text="It's all fun and games w PV members at the Katie Wilson Watch Party tonight in Seattle! Congratulations to @wilsonformayor and all the volunteers who spent months working to help her win!"
                    image="/images/ANALILIA MEJIA.png"
                />
            </TiltMessage>
            <TiltMessage>
                <Message
                    avatar={avatarImage}
                    avatarRounded={false}
                    username="Progressive Victory"
                    nameColor="red"
                    text="It's all fun and games w PV members at the Katie Wilson Watch Party tonight in Seattle! Congratulations to @wilsonformayor and all the volunteers who spent months working to help her win!"
                    image="/images/ANALILIA MEJIA.png"
                />
            </TiltMessage>
            <TiltMessage>
                <Message
                    avatar={avatarImage}
                    avatarRounded={false}
                    username="Progressive Victory"
                    nameColor="red"
                    text="It's all fun and games w PV members at the Katie Wilson Watch Party tonight in Seattle! Congratulations to @wilsonformayor and all the volunteers who spent months working to help her win!"
                    image="/images/ANALILIA MEJIA.png"
                />
            </TiltMessage>
            <TiltMessage>
                <Message
                    avatar={avatarImage}
                    avatarRounded={false}
                    username="Progressive Victory"
                    nameColor="red"
                    text="It's all fun and games w PV members at the Katie Wilson Watch Party tonight in Seattle! Congratulations to @wilsonformayor and all the volunteers who spent months working to help her win!"
                    image="/images/ANALILIA MEJIA.png"
                />
            </TiltMessage>
        </div>
    )
}
