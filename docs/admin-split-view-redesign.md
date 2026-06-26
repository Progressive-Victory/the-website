# Admin Split-View Redesign — Architecture Proposal

> Status: **PROPOSAL / SKELETON ONLY**. No production behavior is wired yet.
> Scope: replacement for `NavigationStack`, `Sidebar`, `Detail`, `Panel`,
> `SidebarList`, `NavigationButton` and their subcomponents.
> Rollout: built in a new namespace (`src/components/common/split_view/`)
> alongside the existing components; panels migrate incrementally.

---

## 0. Locked decisions

| Decision           | Choice                                                 | Rationale                                                                |
| ------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------ |
| Package name       | `split_view`                                           | Reads clearer than `navigation_stack` for new contributors               |
| Nav rows           | general-purpose primitive at `@/components/common/nav` | Reusable outside the sidebar; split_view only consumes it                |
| Scroll region name | `Sidebar.List`                                         | Precise for the common case; hosts `Nav.*` rows with list semantics      |
| Namespace depth    | **flat** (one level)                                   | Hierarchy via JSX placement, not the dot-chain — keeps parts relocatable |
| Token scoping      | `.tokens` class at the `SplitView` root                | Fully encapsulated, zero global footprint, matches CSS-Modules pattern   |
| Visual testing     | Storybook stories per primitive                        | Composition matrix is hard to eyeball in-app; stories show every state   |

---

## 1. Goals

1. **Composition-driven behavior** — a region's _behavior_ is determined by
   whether its subcomponent is mounted, not by boolean props. Mount
   `<Sidebar.Title large />` and you get iOS large-title scrolling; omit it and
   you don't. Mount `<Sidebar.Footer>` and you get a pinned footer; omit it and
   the collapse toggle auto-fills the slot.
2. **CSS-first variants** — `minimal` vs `prominent` render **identical DOM**.
   The visual difference is expressed entirely through CSS keyed off
   `[data-variant]` and a per-variant **design-token** layer. No more two
   parallel `MinimalSidebar` / `ProminentSidebar` component functions.
3. **Headless, testable hooks** — selection indicator, large-title scroll,
   responsive state, and panel history are standalone hooks with no JSX.
4. **Hybrid API** — low-level compound primitives (`SplitView`, `Sidebar.*`,
   `Detail.*`) plus the general-purpose `Nav.*` rows, and high-level presets
   (`Panel`, `ListPanel`) so common panels stay a few lines.
5. **Single import surface** — one barrel (`@/components/common/split_view`);
   `Nav.*` also importable directly from `@/components/common/nav`.

### Non-goals

- Changing the visual design language (colors, spacing) — tokens are seeded
  from current values.
- Rewriting business/data logic inside panels.

---

## 2. Why the current design needs replacing

| Current pain point                                              | Consequence                                                        |
| --------------------------------------------------------------- | ------------------------------------------------------------------ |
| `MinimalSidebar` + `ProminentSidebar` are separate functions    | Duplicated hook wiring; variant logic in JS; drift between the two |
| `parseHeaderSlots` / `resolveSidebarProps` sniff `child.type`   | Brittle; reorder/wrap a child and slots silently vanish            |
| `NavigationButton` handles 4 `buttonType`s in one 400-line body | Hard to extend; conditional soup                                   |
| `Panel` re-threads ~30 props into Sidebar slots                 | Prop-drilling funnel; every new feature touches `Panel`            |
| Behavior gated by booleans (`largeTitle`, `includeHeader`)      | Combinatorial prop matrix; non-obvious valid combinations          |
| Tokens scattered across module CSS                              | No single theming entry point                                      |

---

## 3. Layered architecture

```
Layer 2  Presets (opinionated, optional)      Panel · ListPanel
            │ composes
Layer 1  Primitives (compound, headless-ish)  SplitView · Sidebar.* · Detail.* · Nav.*
            │ shares state via
Layer 0  Foundation                           context · hooks · tokens.module.css · history
```

A consumer can drop down a layer at any time. `Panel` is just sugar over the
primitives; if a panel needs something bespoke it composes the primitives
directly without fighting `Panel`'s prop surface.

---

## 4. Proposed file tree

```
src/components/common/split_view/
  index.ts                      # public barrel — the ONLY import path consumers use
  README.md                     # composition rules + quick start
  tokens.module.css             # design tokens (CSS vars) + per-variant overrides
  context.ts                    # SplitViewContext (open/collapsed, isDesktop, selection)
  SplitView.tsx                 # root shell  (replaces NavigationStack)
  SplitView.module.css

  sidebar/
    Sidebar.tsx                 # SINGLE shell + FLAT compound parts namespace
    Sidebar.module.css          # all minimal/prominent visuals via [data-variant]
    SidebarContext.ts           # variant, list ref, indicator + large-title state
    parts/
      SidebarHeader.tsx         # presence => header region exists
      SidebarTitle.tsx          # presence + `large` => iOS large-title behavior
      SidebarSearch.tsx         # presence => search slot
      SidebarActions.tsx        # left/right action cluster (slot prop)
      SidebarAction.tsx         # generic header button
      SidebarFilterButton.tsx   # specialized action: filter trigger + overlay
      SidebarFeatured.tsx       # pinned-top region (doesn't scroll with list)
      SidebarList.tsx           # scroll surface; hosts selection indicator
      SidebarFooter.tsx         # presence => pinned footer (else toggle auto-fills)
      SidebarToggle.tsx         # collapse/expand control
    hooks/
      useSidebarState.ts        # open/collapsed/desktop state machine
      useSelectionIndicator.ts  # animated blue active indicator
      useLargeTitle.ts          # scroll-triggered title collapse (hysteresis)

  detail/
    Detail.tsx                  # shell + compound parts (mirrors Sidebar)
    Detail.module.css
    parts/
      DetailHeader.tsx
      DetailBody.tsx
      DetailFooter.tsx
      DetailBackButton.tsx

  history/
    panelHistory.ts             # sessionStorage read/write/clear (kept ~as-is)
    usePanelHistory.ts          # hook wrapping back-navigation logic

  presets/
    Panel.tsx                   # high-level wrapper (replaces Panel)
    Panel.module.css
    list/
      ListPanel.tsx             # search + filters + paginated body (replaces SidebarList wiring)
      ListSearch.tsx
      ListFilters.tsx
      ListPagination.tsx
      ListBody.tsx
      list.module.css

src/components/common/nav/        # GENERAL-PURPOSE primitive (NOT owned by split_view)
  index.ts                        # Nav.* namespace barrel
  NavItem.tsx                     # default + card list row (replaces NavigationButton default/card)
  NavGroup.tsx                    # accordion group (replaces group buttonType)
  NavAccount.tsx                  # avatar/account row (replaces account buttonType)
  nav.module.css
```

---

## 5. Core API sketches

### 5.1 `SplitView` (root shell)

```tsx
<SplitView selected={isPanelSelected}>
    <SplitView.Sidebar>{/* <Sidebar/> */}</SplitView.Sidebar>
    <SplitView.Detail>{/* <Detail/> or placeholder */}</SplitView.Detail>
</SplitView>
```

- Owns the `SplitViewContext`: `{ isDesktop, isOpen, toggle, selected }`.
- Replaces `NavigationStack`'s `sidebar`/`detail`/`unSelected`/`overlay` props
  with named child slots. `unSelected` becomes `<SplitView.Placeholder>`.

### 5.2 `Sidebar` — one shell, variant via data-attr, flat namespace

Namespace is **flat** (one level). Hierarchy is expressed by where a part sits
in the JSX, not by the dot-chain (`Sidebar.FilterButton`, never
`Sidebar.Header.FilterButton`) — so a part stays relocatable.

```tsx
<Sidebar variant="prominent">          {/* or "minimal" — SAME DOM */}
  <Sidebar.Header>
    <Sidebar.Actions slot="left">{back}</Sidebar.Actions>
    <Sidebar.Title large>Members</Sidebar.Title>
    <Sidebar.Search>{searchInput}</Sidebar.Search>
    <Sidebar.Actions slot="right">
      <Sidebar.FilterButton>{filterControls}</Sidebar.FilterButton>
      <Sidebar.Action icon={…} label="Refresh" />
    </Sidebar.Actions>
  </Sidebar.Header>

  <Sidebar.Featured>{accountCard}</Sidebar.Featured>

  <Sidebar.List selectionIndicator>
    <Nav.Item .../>
    <Nav.Group>…</Nav.Group>
  </Sidebar.List>

  <Sidebar.Footer>{pagination}</Sidebar.Footer>
</Sidebar>
```

**How composition drives behavior:**

| Mount this                             | Effect                                                                           |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| `<Sidebar.Header>`                     | Header region renders. Omit → "bare" sidebar (no header chrome)                  |
| `<Sidebar.Title large>`                | Enables `useLargeTitle` scroll collapse; title crossfades into header breadcrumb |
| `<Sidebar.Title>` (no `large`)         | Static title only                                                                |
| `<Sidebar.Search>`                     | Search slot renders (inside title block when `large`, else in header)            |
| `<Sidebar.Actions slot="left\|right">` | Action cluster aligned to that side                                              |
| `<Sidebar.Action>`                     | Generic header button                                                            |
| `<Sidebar.FilterButton>`               | Specialized action: filter trigger + overlay; omit → no filter affordance        |
| `<Sidebar.Featured>`                   | Pinned-top region that doesn't scroll with the list                              |
| `<Sidebar.List selectionIndicator>`    | Scroll body + mounted animated active indicator                                  |
| `<Sidebar.Footer>`                     | Pinned footer; omit → collapse toggle auto-fills footer slot                     |

**Variant handling:** `variant` only sets `data-variant="minimal|prominent"`
on the root `<aside>`. `Sidebar.module.css` and `tokens.module.css` express
every visual difference (width, padding, header height, rail collapse, colors)
off that attribute. The TSX has **no `if (variant === …)` branches**.

**Slot detection:** parts read/write shared state via `SidebarContext` and
render **in place** (Radix-style). No `Children.map` type-sniffing, no parent
re-assembly. Reordering/wrapping a part can't silently break it.

### 5.3 `Detail` — symmetric to Sidebar

```tsx
<Detail>
    <Detail.Header>
        <Detail.BackButton />
        {breadcrumbs}
    </Detail.Header>
    <Detail.Body>{children}</Detail.Body>
    <Detail.Footer>{footer}</Detail.Footer>
</Detail>
```

### 5.4 `Nav` — split the god-component (general-purpose primitive)

Lives at `@/components/common/nav` (not owned by split_view).
`NavigationButton`'s `buttonType` union becomes discrete components:

| Old                    | New                                                       |
| ---------------------- | --------------------------------------------------------- |
| `buttonType="default"` | `<Nav.Item>`                                              |
| `buttonType="group"`   | `<Nav.Group>` (owns accordion + `useLayoutEffect` height) |
| `buttonType="account"` | `<Nav.Account>`                                           |
| `buttonType="card"`    | `<Nav.Item variant="card">` (CSS-only difference)         |

Active-state, panel-history tracking, and the selection-indicator data
attributes (`data-indicator-target`) remain, but per-type logic is isolated.

### 5.5 Presets

```tsx
// Common panel — unchanged ergonomics
<Panel label="Members" includeSidebar includeHeader largeTitle
       sidebarBody={…} footer={…} />

// List-style panel
<ListPanel
  label="Donors"
  search={searchState}
  filters={filterConfig}
  pagination={pageState}
  body={rows}
/>
```

Presets compose Layer-1 primitives. They are **the only place** boolean
convenience props live, and they translate those booleans into the right
subcomponent composition.

---

## 6. Design-token layer (`tokens.module.css`)

Single source of truth for theming. Variants override tokens; consumers theme
by overriding tokens, never by className hacks.

```css
.tokens {
    /* geometry */
    --sv-sidebar-width: 18rem;
    --sv-sidebar-rail-width: 4.5rem;
    --sv-sidebar-collapsed-width: 0rem;
    --sv-header-height: 3.25rem;
    --sv-row-radius: 0.5rem;

    /* motion */
    --sv-collapse-duration: 280ms;
    --sv-collapse-ease: cubic-bezier(0.22, 1, 0.36, 1);
    --sv-slide-duration: 240ms;
    --sv-slide-ease: cubic-bezier(0.32, 0.72, 0, 1);

    /* color (seeded from util/theme.ts brand tokens) */
    --sv-surface: #fff;
    --sv-surface-muted: #f5f7fa;
    --sv-indicator: #2986cc; /* brandLightBlue.400 */
    --sv-text: #09223a; /* brandDarkBlue.200 */
}

/* variant overrides — the ENTIRE minimal/prominent difference */
[data-variant='minimal'] {
    --sv-sidebar-width: var(--sv-sidebar-rail-width);
    --sv-header-height: 0rem;
}
[data-variant='prominent'] {
    /* defaults already prominent */
}
```

Breakpoint: `64rem` desktop boundary kept (matches current `useMediaQuery`).

---

## 7. State & data flow

```
SplitViewContext     → isDesktop, isOpen, toggle, selected
  └─ SidebarContext  → variant, listRef, indicatorState, largeTitleCollapsed
       └─ hooks      → useSidebarState · useSelectionIndicator · useLargeTitle
usePanelHistory      → back target label, navigate-back, history stack (sessionStorage)
```

- Selection indicator: `useSelectionIndicator(enabled)` returns a `listRef` plus
  `{ top, height, visible, syncing }`. Same `MutationObserver` strategy as today
  (excluding `style` from `attributeFilter` to avoid feedback loops — see repo
  memory). `Sidebar.List` attaches the ref and consumes the geometry.
- Large title: `useLargeTitle(scrollRef, enabled)` returns `collapsed: boolean`
  with hysteresis (collapse > 12px, expand ≤ 4px). Only runs when
  `<Sidebar.Title large>` is mounted.

---

## 8. Migration strategy

1. Land this skeleton (isolated, imported nowhere → zero risk to existing UI).
2. Flesh out Layer 0 + Layer 1 primitives with parity behavior + unit tests for
   the hooks.
3. Build `Panel` / `ListPanel` presets to match the current `Panel` prop surface
   so migration is mostly an import swap.
4. Migrate panels one at a time (start with a simple one, e.g. `test`, then
   `permissions`, then data-heavy `members`).
5. Delete `navigation_stack/` + `panel/` once all panels are migrated.

### Old → new mapping

| Old                                     | New                                                        |
| --------------------------------------- | ---------------------------------------------------------- |
| `NavigationStack`                       | `SplitView`                                                |
| `Sidebar` (variant prop + slot parsing) | `Sidebar` (data-attr variant + in-place parts)             |
| `MinimalSidebar` / `ProminentSidebar`   | _removed_ (single shell + CSS)                             |
| `Detail` / `PanelBackButton`            | `Detail` / `Detail.BackButton`                             |
| `NavigationButton`                      | `Nav.Item` / `Nav.Group` / `Nav.Account` (at `common/nav`) |
| `Panel`                                 | `presets/Panel`                                            |
| `SidebarList*`                          | `presets/list/*`                                           |
| `panelHistory.ts`                       | `history/panelHistory.ts` (+ `usePanelHistory`)            |

---

## 9. Resolved decisions (was: open questions)

1. **Naming → `split_view`.** Reads clearer than `navigation_stack`.
2. **`Nav.*` → top-level `@/components/common/nav`.** Treated as a
   general-purpose primitive; split_view consumes (and re-exports) it.
3. **Token scope → `.tokens` class at the `SplitView` root.** Fully
   encapsulated, zero global footprint, matches the CSS-Modules pattern.
4. **Visual testing → Storybook stories per primitive.** Best way to exercise
   the composition matrix (variants, collapsed, large-title, with/without
   footer) in isolation.

Additional structural decisions:

- **Flat namespace** — `Sidebar.FilterButton`, not `Sidebar.Header.FilterButton`;
  hierarchy via JSX placement.
- **`Sidebar.List`** is the scroll region name (with `Sidebar.Body` available as
  a future unstyled escape hatch if non-list content is ever needed).
- **Generic + specialized actions** — ship both `Sidebar.Action` (generic) and
  `Sidebar.FilterButton` (specialized) so header buttons aren't filter-only.

```

```
