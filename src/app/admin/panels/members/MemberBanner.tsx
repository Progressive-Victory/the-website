import styles from './MemberBanner.module.css'
import { DiscordAvatar } from '@/components/common'
import { TabBar, TabSpec } from '@/components/common/tab_bar/TabBar'
import { User, UserProfile } from '@/contracts/data'

interface MemberBannerProps {
    user: User
    makeTitle: (user: User | UserProfile) => string
    selectedTab: string
    tabs: TabSpec[]
    onTabChange: (key: string) => void
}

export function MemberBanner({
    user,
    makeTitle,
    selectedTab,
    tabs,
    onTabChange,
}: MemberBannerProps) {
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
                {user.roles?.length ? (
                    user.roles.map((role) => (
                        <span key={role.id} className={styles.rolePill}>
                            {role.name}
                        </span>
                    ))
                ) : (
                    <span className={styles.roleEmpty}>No roles assigned</span>
                )}
            </div>
            <TabBar tabs={tabs} value={selectedTab} onChange={onTabChange} />
        </div>
    )
}
