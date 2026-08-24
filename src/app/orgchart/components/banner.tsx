import styles from './components.module.css'
import { PositionData } from './position'
import { cn } from '@/util'

type RGB = `rgb(${number}, ${number}, ${number})`
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`
type HSL = `hsl(${number}, ${number}, ${number})`
type HSLA = `hsla(${number},${number}%,${number}%,${number})`
type HEX = `#${string}`
type Color = RGB | RGBA | HSL | HSLA | HEX

export enum BannerColor {
    NONE = 0,
    BLUE = 1,
    RED = 2,
}

export const PositionBanner = ({ data }: { data: PositionData }) => {
    return (
        <div
            className={cn(
                styles.banner,
                data.bannerColor === BannerColor.BLUE && styles.blue,
                data.bannerColor === BannerColor.RED && styles.red
            )}
            title={data.bannerTitle}
        ></div>
    )
}

export interface BannerObject {
    color?: Color
    title?: string
}

export const defaultBanners: BannerObject[] = [
    { color: '#60a5fa', title: 'Junior' },
    { color: '#dc2626', title: 'Senior' },
]
