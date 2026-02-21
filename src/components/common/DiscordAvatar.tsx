import { ImageWithFallback } from '.'

export interface DiscordAvatarProps {
    discordUserId: string | undefined
    imageId: string | undefined
    size: number
    className?: string
}

export function DiscordAvatar({
    discordUserId,
    imageId,
    size,
    className,
}: DiscordAvatarProps) {
    return (
        <ImageWithFallback
            useFallback={!discordUserId?.trim() || !imageId?.trim()}
            src={`https://cdn.discordapp.com/avatars/${discordUserId}/${imageId}`}
            alt="user profile picture"
            width={size}
            height={size}
            className={className}
        />
    )
}
