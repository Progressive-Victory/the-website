'use client'

import { NavItem } from '../types'
import { useAuth, useFetch } from '@/util/hooks'
import { skipToken, useQuery } from '@tanstack/react-query'
import { TokenClaims, zDiscordUser } from 'pv-contracts/data'
import { useEffect, useMemo, useState } from 'react'
import z from 'zod'
import { navitems } from './navItems'

type DiscordUser = z.infer<typeof zDiscordUser>

export interface HeaderNavState {
    session: TokenClaims | null
    onLogin: () => Promise<void>
    isSessionLoading: boolean
    isOpen: boolean
    activeSubnav: NavItem | null
    mobileSubnavItem: NavItem | null
    setMobileSubnavItem: (item: NavItem | null) => void
    discordUsers: DiscordUser[] | undefined
    resolvedNavitems: NavItem[]
    openSubnav: (item: NavItem) => void
    closeSubnav: () => void
    toggleMenu: () => void
    closeMenu: () => void
    isSubnavOpen: boolean
}

export function useHeaderNav(): HeaderNavState {
    const { session, onLogin, isSessionLoading } = useAuth()
    const { ready, onGet } = useFetch()

    const [isOpen, setIsOpen] = useState(false)
    const [activeSubnav, setActiveSubnav] = useState<NavItem | null>(null)
    const [mobileSubnavItem, setMobileSubnavItem] = useState<NavItem | null>(
        null
    )

    const { data: discordUsers } = useQuery({
        queryKey: [`/discordUsers/${session?.userId}`],
        queryFn:
            session?.discordUserId != null && ready
                ? ({ signal }) =>
                      onGet(
                          '/discordUsers/:discordUserId',
                          z.array(zDiscordUser),
                          { params: { discordUserId: session?.userId }, signal }
                      )
                : skipToken,
    })

    const resolvedNavitems = useMemo((): NavItem[] => {
        const discordId = discordUsers?.[0]?.id
        const volunteerHref = session ? '/account?redirect=true' : '/volunteer'

        return navitems.map((item) => {
            if (!item.subnav?.columns) return item

            return {
                ...item,
                href: item.name === 'Volunteer' ? volunteerHref : item.href,
                subnav: {
                    ...item.subnav,
                    columns: item.subnav.columns.map((col) => ({
                        ...col,
                        items: col.items.map((child) => {
                            if (item.name === 'Volunteer') {
                                return {
                                    ...child,
                                    href: volunteerHref,
                                }
                            }

                            if (
                                child.href.startsWith(
                                    'https://secure.actblue.com/donate/pvmember'
                                )
                            ) {
                                return {
                                    ...child,
                                    href: discordId
                                        ? `${child.href}&refcode2=${discordId}`
                                        : child.href,
                                }
                            }
                            return child
                        }),
                    })),
                },
            }
        })
    }, [discordUsers, session])

    useEffect(() => {
        if (!isOpen) return

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false)
        }

        document.addEventListener('keydown', onKeyDown)
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        return () => {
            document.removeEventListener('keydown', onKeyDown)
            document.body.style.overflow = prevOverflow
        }
    }, [isOpen])

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setActiveSubnav(null)
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [])

    useEffect(() => {
        if (!isOpen) setMobileSubnavItem(null)
    }, [isOpen])

    useEffect(() => {
        if (typeof window === 'undefined') return

        const desktopMQ = window.matchMedia('(min-width: 1280px)')

        const syncToBreakpoint = () => {
            if (desktopMQ.matches) {
                setIsOpen(false)
            } else {
                setActiveSubnav(null)
            }
        }

        syncToBreakpoint()

        const onChange = () => syncToBreakpoint()

        if (typeof desktopMQ.addEventListener === 'function') {
            desktopMQ.addEventListener('change', onChange)
            return () => desktopMQ.removeEventListener('change', onChange)
        } else {
            desktopMQ.addListener(onChange)
            return () => desktopMQ.removeListener(onChange)
        }
    }, [])

    const openSubnav = (item: NavItem) => {
        const hasColumns = !!item.subnav?.columns?.length
        if (!hasColumns) {
            setActiveSubnav(null)
            return
        }
        if (typeof window !== 'undefined' && window.innerWidth < 1280) return
        setActiveSubnav(item)
    }

    const closeSubnav = () => setActiveSubnav(null)

    const toggleMenu = () => {
        closeSubnav()
        setIsOpen((prev) => !prev)
    }

    const closeMenu = () => setIsOpen(false)

    return {
        session,
        onLogin,
        isSessionLoading,
        isOpen,
        activeSubnav,
        mobileSubnavItem,
        setMobileSubnavItem,
        discordUsers,
        resolvedNavitems,
        openSubnav,
        closeSubnav,
        toggleMenu,
        closeMenu,
        isSubnavOpen: !!activeSubnav?.subnav?.columns?.length,
    }
}
