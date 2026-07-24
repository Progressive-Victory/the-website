'use client'

import styles from './FilterTags.module.css'
import cx from 'classnames'
import {
    ReactNode,
    useRef,
    useLayoutEffect,
    useState as useStateR,
} from 'react'

export interface FilterTag {
    key: string
    label: string
    icon: ReactNode
    color: string
    width?: string
    /** Key of the tag to activate when this tag is clicked while already active */
    activeRedirect: string
    /** Key of the tag to activate when scrolling left on the container */
    scrollLeft: string
    /** Key of the tag to activate when scrolling right on the container */
    scrollRight: string
}

interface FilterTagsProps {
    tags: FilterTag[]
    activeTag: string
    onChange: (key: string) => void
}

function TagButton({
    tag,
    isActive,
    onChange,
}: {
    tag: FilterTag
    isActive: boolean
    onChange: (key: string) => void
}) {
    const labelRef = useRef<HTMLSpanElement>(null)
    const [labelWidth, setLabelWidth] = useStateR(0)

    useLayoutEffect(() => {
        if (labelRef.current) {
            setLabelWidth(
                Math.ceil(labelRef.current.getBoundingClientRect().width) + 1
            )
        }
    }, [tag.label, isActive])

    return (
        <button
            type="button"
            className={cx(styles.tag, isActive && styles.active)}
            style={
                isActive
                    ? {
                          background: tag.color,
                          color: '#fff',
                          width: tag.width,
                      }
                    : undefined
            }
            onClick={() => onChange(isActive ? tag.activeRedirect : tag.key)}
        >
            <span className={styles.icon}>{tag.icon}</span>
            <div
                className={cx(
                    styles.labelWrapper,
                    isActive && styles.labelWrapperActive
                )}
                style={{ width: isActive ? `${labelWidth}px` : 0 }}
            >
                <span
                    ref={labelRef}
                    className={cx(
                        styles.label,
                        isActive ? styles.labelFadeIn : styles.labelFadeOut
                    )}
                >
                    {tag.label}
                </span>
            </div>
        </button>
    )
}

export function FilterTags({ tags, activeTag, onChange }: FilterTagsProps) {
    const activeTagData = tags.find((t) => t.key === activeTag)

    const handleWheel = (e: React.WheelEvent) => {
        if (!activeTagData) return
        const direction = e.deltaX !== 0 ? e.deltaX : e.deltaY
        if (direction > 0 && activeTagData.scrollRight) {
            onChange(activeTagData.scrollRight)
        } else if (direction < 0 && activeTagData.scrollLeft) {
            onChange(activeTagData.scrollLeft)
        }
    }

    return (
        <div className={styles.container} onWheel={handleWheel}>
            {tags.map((tag) => (
                <TagButton
                    key={tag.key}
                    tag={tag}
                    isActive={activeTag === tag.key}
                    onChange={onChange}
                />
            ))}
        </div>
    )
}
