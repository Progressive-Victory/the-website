/*
 * list — composable controls for a sidebar list (search, filters, pagination).
 *
 * These drop into the Sidebar composition:
 *   <Sidebar.Search><List.Search … /></Sidebar.Search>
 *   <Sidebar.FilterButton><List.Filters … /></Sidebar.FilterButton>
 *   <Sidebar.Footer><List.Footer … /></Sidebar.Footer>
 */
import { ListFilters } from './ListFilters'
import { ListFooter } from './ListFooter'
import { ListSearch } from './ListSearch'

export const List = {
    Search: ListSearch,
    Filters: ListFilters,
    Footer: ListFooter,
}

export { ListSearch, ListFilters, ListFooter }
export type { ListSearchProps } from './ListSearch'
export type {
    ListFiltersProps,
    ListFilterOption,
    ListFieldOption,
} from './ListFilters'
export type { ListFooterProps } from './ListFooter'
