'use client'

import { BannerAvatar, type BannerAvatarProps } from './BannerAvatar'
import { BannerPill, type BannerPillProps } from './BannerPill'
import styles from './PanelBanner.module.css'
import skeleton from '@/components/common/Skeleton.module.css'
import {
    SidebarHeaderButton,
    type SidebarHeaderButtonConfig,
} from '@/components/common/navigation_stack/sidebar/Sidebar'
import { cn } from '@/util'
import type { ReactNode } from 'react'
import { IoEllipsisVertical } from 'react-icons/io5'

export interface PanelBannerTag extends BannerPillProps {
    key: string
}

interface TitleSectionProps {
    title: ReactNode
    subtitle?: ReactNode
    error?: ReactNode
    menu?: ReactNode
    classNames?: PanelBannerProps['classNames']
}

function TitleSection({
    title,
    subtitle,
    error,
    menu,
    classNames,
}: TitleSectionProps) {
    return (
        <div className={styles.titleSection}>
            <div className={styles.titleLine}>
                <h1 className={cn(styles.title, classNames?.title)}>{title}</h1>
                {menu}
            </div>
            {subtitle && (
                <h2 className={cn(styles.subtitle, classNames?.subtitle)}>
                    {subtitle}
                </h2>
            )}
            {error && (
                <span className={styles.error} role="alert">
                    {error}
                </span>
            )}
        </div>
    )
}

export interface PanelBannerProps {
    title: ReactNode
    subtitle?: ReactNode
    error?: ReactNode
    avatar?: BannerAvatarProps
    statusPill?: BannerPillProps
    menuButton?: SidebarHeaderButtonConfig
    tags?: PanelBannerTag[]
    tabBar?: ReactNode
    cover?: boolean
    loading?: boolean
    className?: string
    classNames?: {
        card?: string
        title?: string
        subtitle?: string
        tags?: string
    }
}

const withSkeleton = (props: PanelBannerProps): PanelBannerProps => ({
    ...props,
    title: <span className={cn(skeleton.bar, styles.skeletonTitle)} />,
    subtitle: props.subtitle && (
        <span className={cn(skeleton.bar, styles.skeletonSubtitle)} />
    ),
    error: undefined,
    statusPill: props.statusPill && {
        label: <span className={cn(skeleton.bar, styles.skeletonPill)} />,
        className: styles.skeletonPillWrapper,
    },
    menuButton: undefined,
    tags: undefined,
    avatar: props.avatar && { ...props.avatar, onUpload: undefined },
})

export function PanelBanner(props: PanelBannerProps) {
    const {
        title,
        subtitle,
        error,
        avatar,
        statusPill,
        menuButton,
        tags,
        tabBar,
        cover = false,
        className,
        classNames,
    } = props.loading ? withSkeleton(props) : props

    const card = (
        <div className={cn(styles.card, !cover && className, classNames?.card)}>
            <div
                className={cn(
                    styles.topRow,
                    menuButton && styles.topRowWithMenu
                )}
            >
                <div className={styles.identity}>
                    {avatar && <BannerAvatar {...avatar} />}
                    <TitleSection
                        title={title}
                        subtitle={subtitle}
                        error={error}
                        menu={
                            menuButton && (
                                <div className={styles.menuButton}>
                                    <SidebarHeaderButton
                                        icon={<IoEllipsisVertical size={20} />}
                                        label="More Options"
                                        {...menuButton}
                                    />
                                </div>
                            )
                        }
                        classNames={classNames}
                    />
                </div>
                {statusPill && (
                    <div className={styles.actions}>
                        <BannerPill {...statusPill} />
                    </div>
                )}
            </div>
            {!!tags?.length && (
                <div className={cn(styles.tagRow, classNames?.tags)}>
                    {tags.map(({ key, ...tag }) => (
                        <BannerPill key={key} {...tag} />
                    ))}
                </div>
            )}
            {tabBar}
        </div>
    )

    if (!cover) return card

    return (
        <div className={cn(styles.container, className)}>
            <div className={styles.cover} />
            {card}
        </div>
    )
}
