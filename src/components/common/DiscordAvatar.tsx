import { ImageWithFallback } from '.'

export interface DiscordAvatarProps {
    discordUserId: string | undefined
    imageId: string | undefined
    size: number
    loading?: boolean
    className?: string
}

export function DiscordAvatar({
    discordUserId,
    imageId,
    size,
    loading = false,
    className,
}: DiscordAvatarProps) {
    return (
        <ImageWithFallback
            pending={loading}
            useFallback={!discordUserId?.trim() || !imageId?.trim()}
            src={`https://cdn.discordapp.com/avatars/${discordUserId}/${imageId}`}
            alt="user profile picture"
            width={size}
            height={size}
            className={className}
        />
    )
}
