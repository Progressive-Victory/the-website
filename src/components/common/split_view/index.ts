/*
 * split_view — public API barrel (SKELETON).
 *
 * The ONLY import path consumers should use:
 *   import { SplitView, Sidebar, Detail, Panel } from '@/components/common/split_view'
 *
 * Nav.* is a general-purpose primitive that lives in `@/components/common/nav`.
 * It is re-exported here for convenience (the sidebar list hosts nav rows), but
 * it is NOT owned by split_view and can be imported directly from common/nav.
 */

// Layer 1 — primitives
export { SplitView, type SplitViewProps } from './SplitView'
export { Sidebar, type SidebarProps } from './sidebar/Sidebar'
export { Detail, type DetailBackButtonProps } from './detail/Detail'

// Re-export the general-purpose Nav primitive for convenience.
export { Nav } from '@/components/common/nav'
export type {
    NavItemProps,
    NavGroupProps,
    NavAccountProps,
} from '@/components/common/nav'

// Layer 2 — presets
export { Panel, type PanelProps } from './presets/Panel'
export { ListPanel, type ListPanelProps } from './presets/list/ListPanel'

// Composable list controls (search / filters / pagination)
export { List } from './list'
export type {
    ListSearchProps,
    ListFiltersProps,
    ListFilterOption,
    ListFieldOption,
    ListFooterProps,
} from './list'

// Foundation
export { useSplitView, type SplitViewContextValue } from './context'
export {
    readPanelHistory,
    writePanelHistory,
    clearPanelHistory,
} from './history/panelHistory'
export { usePanelHistory } from './history/usePanelHistory'
