import styles from './components.module.css'
import { GroupData } from './group'
import { PositionData } from './position'
import React from 'react'

export interface Tag {
    name: string
    tooltip?: string
    graphic?: React.ReactNode
}

export const Tags = ({ data }: { data: PositionData | GroupData }) => {
    if (!data.tags) return
    const pairs: Tag[][] = []
    data.tags.forEach((tag: Tag, index: number) => {
        if (index % 2 == 0) {
            pairs.push([tag])
        } else pairs[Math.floor(index / 2)][1] = tag
    })
    return (
        <div className={styles.tags}>
            {pairs.map((pair) => (
                <div className={styles.tagContainer} key={pair[0].name}>
                    {pair.map((tag) => (
                        <div
                            key={tag.name}
                            className={styles.tag}
                            title={tag.tooltip ?? tag.name}
                        >
                            {tag.graphic}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}
