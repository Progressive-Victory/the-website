'use client'

/*
 * Sidebar.FilterButton — specialized header action.
 *
 * A filter trigger that toggles an overlay holding the filter controls (passed
 * as children). Built on the same visual base as Sidebar.Action. Supports
 * controlled + uncontrolled open state. Presence is what gives a sidebar its
 * filter affordance.
 */
import styles from '../Sidebar.module.css'
import { useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { FiFilter } from 'react-icons/fi'

export interface SidebarFilterButtonProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    children?: ReactNode
}

export function SidebarFilterButton({
    open,
    onOpenChange,
    children,
}: SidebarFilterButtonProps): ReactElement {
    const [uncontrolled, setUncontrolled] = useState(false)
    const isOpen = open ?? uncontrolled

    function toggle() {
        const next = !isOpen
        onOpenChange?.(next)
        if (open === undefined) {
            setUncontrolled(next)
        }
    }

    return (
        <div
            className={styles.filterWrap}
            data-part="filter-button"
            data-open={isOpen}
        >
            <button
                type="button"
                className={styles.filterTrigger}
                onClick={toggle}
                aria-expanded={isOpen}
                aria-label={isOpen ? 'Hide filters' : 'Show filters'}
                title={isOpen ? 'Hide filters' : 'Show filters'}
            >
                <FiFilter size={16} />
            </button>
            {isOpen ? (
                <div
                    className={styles.filterOverlay}
                    data-part="filter-overlay"
                >
                    {children}
                </div>
            ) : null}
        </div>
    )
}
