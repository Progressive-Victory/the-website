import styles from './components.module.css'
import { PositionData } from './position'
import { cn } from '@/util'

type RGB = `rgb(${number}, ${number}, ${number})`
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`
type HSL = `hsl(${number}, ${number}, ${number})`
type HSLA = `hsla(${number},${number}%,${number}%,${number})`
type HEX = `#${string}`
type Color = RGB | RGBA | HSL | HSLA | HEX

export enum Banner {
    NONE,
    BLUE,
    RED,
}

export const PositionBanner = ({ data }: { data: PositionData }) => {
    switch (data.banner) {
        case 1:
            return (
                <div
                    className={cn(styles.banner, styles.blue)}
                    title={data.bannerTitle}
                />
            )
        case 2:
            return (
                <div
                    className={cn(styles.banner, styles.red)}
                    title={data.bannerTitle}
                />
            )
        default:
            return <div className={styles.banner} style={{ display: 'none' }} />
    }
}

export interface BannerObject {
    color?: Color
    title?: string
}

export const defaultBanners: BannerObject[] = [
    { color: '#60a5fa', title: 'Junior' },
    { color: '#dc2626', title: 'Senior' },
]
