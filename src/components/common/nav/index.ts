/*
 * nav — general-purpose navigation row primitives.
 *
 * Reusable clickable rows used inside a sidebar list, a menu, a command
 * palette, etc. NOT coupled to split_view; split_view merely consumes these.
 *
 *   import { Nav } from '@/components/common/nav'
 *   <Nav.Item href="…" label="…" />
 *   <Nav.Group label="…">…</Nav.Group>
 *   <Nav.Account href="…" avatar={…} name="…" />
 */
import { NavAccount } from './NavAccount'
import { NavGroup } from './NavGroup'
import { NavItem } from './NavItem'

export const Nav = {
    Item: NavItem,
    Group: NavGroup,
    Account: NavAccount,
}

export { NavItem, NavGroup, NavAccount }
export type { NavItemProps } from './NavItem'
export type { NavGroupProps } from './NavGroup'
export type { NavAccountProps } from './NavAccount'
