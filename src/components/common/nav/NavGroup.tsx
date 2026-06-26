'use client'

/*
 * Nav.Group — accordion group (replaces NavigationButton buttonType="group").
 *
 * Owns its own open/animation state so the grouped-accordion math lives in ONE
 * focused component instead of the old 400-line god-component. The expand/
 * collapse is height-animated: children are measured (scrollHeight, kept fresh
 * with a ResizeObserver) and the clip wrapper animates to that height.
 *
 * Gotcha (repo memory): `.groupChildren > .item { flex: 0 0 auto }` keeps child
 * offsetTop stable while clipped so the sidebar selection indicator lands on
 * the right row when the group opens.
 */
import styles from './nav.module.css'
import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
} from 'react'
import type { ReactElement, ReactNode } from 'react'
import { FiChevronRight } from 'react-icons/fi'
import type { IconType } from 'react-icons/lib'

const GROUP_ANIMATION_MS = 220

export interface NavGroupProps {
    label: string
    icon?: IconType
    count?: number
    defaultOpen?: boolean
    hasActiveChild?: boolean
    children?: ReactNode
}

export function NavGroup({
    label,
    icon: Icon,
    count,
    defaultOpen = false,
    hasActiveChild = false,
    children,
}: NavGroupProps): ReactElement {
    const initialOpen = defaultOpen || hasActiveChild
    const [open, setOpen] = useState(initialOpen)
    const [shouldRender, setShouldRender] = useState(initialOpen)
    const [childrenHeight, setChildrenHeight] = useState(0)
    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const childrenRef = useRef<HTMLDivElement | null>(null)

    useLayoutEffect(() => {
        if (!shouldRender) {
            setChildrenHeight(0)
            return
        }

        function measure() {
            setChildrenHeight(childrenRef.current?.scrollHeight ?? 0)
        }

        measure()

        const element = childrenRef.current
        const resizeObserver =
            typeof ResizeObserver === 'undefined' || element === null
                ? null
                : new ResizeObserver(measure)

        if (resizeObserver && element) {
            resizeObserver.observe(element)
        }

        return () => {
            resizeObserver?.disconnect()
        }
    }, [children, shouldRender])

    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current !== null) {
                clearTimeout(closeTimeoutRef.current)
            }
        }
    }, [])

    function toggle() {
        if (closeTimeoutRef.current !== null) {
            clearTimeout(closeTimeoutRef.current)
            closeTimeoutRef.current = null
        }

        if (open) {
            setOpen(false)
            closeTimeoutRef.current = setTimeout(() => {
                setShouldRender(false)
                closeTimeoutRef.current = null
            }, GROUP_ANIMATION_MS)
            return
        }

        setShouldRender(true)
        requestAnimationFrame(() => setOpen(true))
    }

    return (
        <div className={styles.group} data-open={open}>
            <button
                type="button"
                className={styles.groupHeader}
                onClick={toggle}
                aria-expanded={open}
            >
                {Icon ? <Icon /> : null}
                <span className={styles.label}>{label}</span>
                {typeof count === 'number' ? (
                    <span className={styles.count}>
                        {count.toLocaleString()}
                    </span>
                ) : null}
                <FiChevronRight
                    className={styles.groupChevron}
                    data-open={open}
                    size={14}
                />
            </button>
            {shouldRender ? (
                <div
                    className={styles.groupChildrenClip}
                    data-open={open}
                    style={
                        {
                            '--group-children-open-height': `${childrenHeight}px`,
                        } as CSSProperties
                    }
                >
                    <div className={styles.groupChildren} ref={childrenRef}>
                        {children}
                    </div>
                </div>
            ) : null}
        </div>
    )
}
