'use client'

import styles from './UpdaterAvatar.module.css'
import { joinName } from '@/app/volunteer_dashboard/panels/membership/membership.helpers'
import { DiscordAvatar } from '@/components/common/DiscordAvatar'
import { useFetch } from '@/util/hooks'
import { skipToken, useQuery } from '@tanstack/react-query'
import { zDiscordUser, zUser } from 'pv-contracts/data'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { FaGear } from 'react-icons/fa6'
import z from 'zod'

export function UpdaterAvatar({
    whoId,
    size = 22,
    showName = false,
}: {
    whoId: number | null
    size?: number
    showName?: boolean
}) {
    const { ready, onGet } = useFetch()
    const [anchor, setAnchor] = useState<DOMRect | null>(null)
    const query = useQuery({
        queryKey: [`/discordUsers/${whoId}`],
        queryFn:
            ready && whoId
                ? ({ signal }) =>
                      onGet(
                          '/discordUsers/:discordUserId',
                          z.array(zDiscordUser),
                          { params: { discordUserId: whoId }, signal }
                      )
                : skipToken,
    })
    const userQuery = useQuery({
        queryKey: ['/users/:userId', whoId],
        queryFn:
            showName && ready && whoId
                ? ({ signal }) =>
                      onGet('/users/:userId', zUser, {
                          params: { userId: whoId },
                          signal,
                      })
                : skipToken,
    })

    const discordUser = query.data?.[0]
    const avatar = whoId ? (
        <DiscordAvatar
            discordUserId={discordUser?.id}
            imageId={discordUser?.image}
            size={size}
            loading={query.isPending}
            className={styles.avatar}
        />
    ) : (
        <span className={styles.system} style={{ width: size, height: size }}>
            <FaGear aria-hidden="true" className={styles.gear} />
        </span>
    )

    if (!showName) return avatar

    const name = whoId
        ? (joinName(userQuery.data?.firstName, userQuery.data?.lastName) ??
          `User #${whoId}`)
        : 'System'

    return (
        <span
            className={styles.named}
            aria-label={name}
            onMouseEnter={(event) =>
                setAnchor(event.currentTarget.getBoundingClientRect())
            }
            onMouseLeave={() => setAnchor(null)}
        >
            {avatar}
            {anchor &&
                createPortal(
                    <span
                        className={styles.tooltip}
                        style={{
                            top: anchor.top + anchor.height / 2,
                            left: anchor.left,
                        }}
                    >
                        {name}
                    </span>,
                    document.body
                )}
        </span>
    )
}
