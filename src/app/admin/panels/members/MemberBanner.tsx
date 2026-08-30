import styles from './MemberBanner.module.css'
import { DiscordAvatar } from '@/components/common'
import { TabBar, TabSpec } from '@/components/common/tab_bar/TabBar'
import { Position, User, UserProfile } from '@/contracts/data'

interface MemberBannerProps {
    user: User
    makeTitle: (user: User | UserProfile) => string
    selectedTab: string
    tabs: TabSpec[]
    onTabChange: (key: string) => void
    positions?: Position[]
}

export function MemberBanner({
    user,
    makeTitle,
    selectedTab,
    tabs,
    onTabChange,
    positions,
}: MemberBannerProps) {
    const userPositions = (positions ?? []).filter((p) =>
        p.userIds.includes(user.id)
    )

    return (
        <div className={styles.headerTop}>
            <div className={styles.cardStyle}>
                <div className={styles.cardAvatar}>
                    <DiscordAvatar
                        discordUserId={user.discordUsers?.[0]?.id}
                        imageId={user.discordUsers?.[0]?.image}
                        size={64}
                    />
                </div>
                <div className={styles.userInfo}>
                    <h1 className={styles.headerUserName}>{makeTitle(user)}</h1>
                    <h2 className={styles.headerUserUsername}>
                        {user.discordUsers?.[0]?.username
                            ? `@${user.discordUsers[0].username}`
                            : 'NOT FOUND'}
                    </h2>
                </div>
            </div>
            <div className={styles.roleList}>
                {userPositions.length > 0 ? (
                    userPositions.map((pos) => (
                        <span key={pos.id} className={styles.rolePill}>
                            {pos.name}
                        </span>
                    ))
                ) : (
                    <span className={styles.rolePill}>Community Member</span>
                )}
            </div>
            <TabBar tabs={tabs} value={selectedTab} onChange={onTabChange} />
        </div>
    )
}
