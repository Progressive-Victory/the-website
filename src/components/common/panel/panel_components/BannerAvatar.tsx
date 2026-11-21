'use client'

import styles from './BannerAvatar.module.css'
import { cn } from '@/util'
import type { ChangeEvent, ReactNode } from 'react'
import { FaCamera } from 'react-icons/fa'

export interface BannerAvatarProps {
    image: ReactNode
    framed?: boolean
    onUpload?: (file: File) => void
    uploading?: boolean
    uploadLabel?: string
    className?: string
}

export function BannerAvatar({
    image,
    framed = false,
    onUpload,
    uploading = false,
    uploadLabel = 'Change image',
    className,
}: BannerAvatarProps) {
    const avatarClassName = cn(
        styles.avatar,
        framed && styles.framed,
        className
    )

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (file) onUpload?.(file)
    }

    if (!onUpload) return <div className={avatarClassName}>{image}</div>

    return (
        <label
            className={cn(avatarClassName, styles.uploadable)}
            title={uploadLabel}
        >
            {image}
            <span className={styles.overlay}>
                <FaCamera />
            </span>
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                hidden
            />
        </label>
    )
}
