'use client'

import styles from './FilterTags.module.css'
import { cn } from '@/util'
import {
    ReactNode,
    useEffect,
    useRef,
    useLayoutEffect,
    useState as useStateR,
} from 'react'
import { FiChevronDown } from 'react-icons/fi'

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
    /**
     * Menu shown when an already-active tag is clicked again. Tags with a menu
     * show a chevron and ignore `activeRedirect`.
     */
    dropdownOverlay?:
        | ReactNode
        | ((controls: { closeDropdown: () => void }) => ReactNode)
}

interface FilterTagsProps {
    tags: FilterTag[]
    activeTag: string
    onChange: (key: string) => void
}

function TagButton({
    tag,
    isActive,
    isOpen,
    onChange,
    onOpenChange,
}: {
    tag: FilterTag
    isActive: boolean
    isOpen: boolean
    onChange: (key: string) => void
    onOpenChange: (open: boolean) => void
}) {
    const labelRef = useRef<HTMLSpanElement>(null)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const [labelWidth, setLabelWidth] = useStateR(0)

    const hasDropdown = !!tag.dropdownOverlay

    useLayoutEffect(() => {
        if (labelRef.current) {
            setLabelWidth(
                Math.ceil(labelRef.current.getBoundingClientRect().width) + 1
            )
        }
    }, [tag.label, isActive, setLabelWidth])

    useEffect(() => {
        if (!isOpen) return

        const onDocumentMouseDown = (event: MouseEvent) => {
            if (
                event.target instanceof Element &&
                event.target.closest('[data-dropdown-overlay-portal]')
            )
                return

            if (!wrapperRef.current?.contains(event.target as Node))
                onOpenChange(false)
        }

        const onDocumentKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onOpenChange(false)
        }

        document.addEventListener('mousedown', onDocumentMouseDown)
        document.addEventListener('keydown', onDocumentKeyDown)

        return () => {
            document.removeEventListener('mousedown', onDocumentMouseDown)
            document.removeEventListener('keydown', onDocumentKeyDown)
        }
    }, [isOpen, onOpenChange])

    const handleClick = () => {
        if (!isActive) return onChange(tag.key)
        if (hasDropdown) return onOpenChange(!isOpen)
        onChange(tag.activeRedirect)
    }

    const menu =
        typeof tag.dropdownOverlay === 'function'
            ? tag.dropdownOverlay({ closeDropdown: () => onOpenChange(false) })
            : tag.dropdownOverlay

    return (
        <div ref={wrapperRef} className={styles.tagWrapper}>
            <button
                type="button"
                className={cn(
                    styles.tag,
                    isActive && styles.active,
                    hasDropdown && styles.hasDropdown
                )}
                style={
                    isActive
                        ? {
                              background: tag.color,
                              color: '#fff',
                              width: tag.width,
                          }
                        : undefined
                }
                aria-haspopup={hasDropdown ? 'menu' : undefined}
                aria-expanded={hasDropdown && isActive ? isOpen : undefined}
                onClick={handleClick}
            >
                <span className={styles.icon}>{tag.icon}</span>
                <div
                    className={cn(
                        styles.labelWrapper,
                        isActive && styles.labelWrapperActive
                    )}
                    style={{ width: isActive ? `${labelWidth}px` : 0 }}
                >
                    <span
                        ref={labelRef}
                        className={cn(
                            styles.label,
                            isActive ? styles.labelFadeIn : styles.labelFadeOut
                        )}
                    >
                        {tag.label}
                    </span>
                </div>
                {hasDropdown && (
                    <div
                        className={styles.chevronWrapper}
                        style={{ width: isActive ? '0.75rem' : 0 }}
                    >
                        <FiChevronDown
                            className={cn(
                                styles.chevron,
                                isOpen && styles.chevronOpen,
                                isActive
                                    ? styles.labelFadeIn
                                    : styles.labelFadeOut
                            )}
                            size={12}
                            aria-hidden="true"
                        />
                    </div>
                )}
            </button>
            {isOpen && menu}
        </div>
    )
}

export function FilterTags({ tags, activeTag, onChange }: FilterTagsProps) {
    const [openTag, setOpenTag] = useStateR<string | null>(null)
    const activeTagData = tags.find((t) => t.key === activeTag)

    const handleChange = (key: string) => {
        setOpenTag(null)
        onChange(key)
    }

    const handleWheel = (e: React.WheelEvent) => {
        if (!activeTagData) return
        const direction = e.deltaX !== 0 ? e.deltaX : e.deltaY
        if (direction > 0 && activeTagData.scrollRight) {
            handleChange(activeTagData.scrollRight)
        } else if (direction < 0 && activeTagData.scrollLeft) {
            handleChange(activeTagData.scrollLeft)
        }
    }

    return (
        <div
            className={cn(
                styles.container,
                openTag && styles.containerMenuOpen
            )}
            onWheel={handleWheel}
        >
            {tags.map((tag) => (
                <TagButton
                    key={tag.key}
                    tag={tag}
                    isActive={activeTag === tag.key}
                    isOpen={openTag === tag.key}
                    onChange={handleChange}
                    onOpenChange={(open) => setOpenTag(open ? tag.key : null)}
                />
            ))}
        </div>
    )
}
