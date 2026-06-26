# split_view (SKELETON)

Proposed replacement for `navigation_stack` + `panel`. See the full proposal in
[`docs/admin-split-view-redesign.md`](../../../../docs/admin-split-view-redesign.md).

> **Status:** scaffolding only. Components render minimal placeholders; behavior
> hooks have `TODO(impl)` bodies. Nothing here is imported by the app yet, so it
> is safe to iterate on without touching live panels.

## Locked design decisions

| Decision           | Choice                                                                           |
| ------------------ | -------------------------------------------------------------------------------- |
| Package name       | `split_view`                                                                     |
| Nav rows           | general-purpose primitive at `@/components/common/nav` (NOT owned by split_view) |
| Scroll region name | `Sidebar.List`                                                                   |
| Namespace depth    | **flat** — hierarchy via JSX placement, not the dot-chain                        |
| Token scoping      | `.tokens` class applied at the `SplitView` root (encapsulated)                   |
| Visual testing     | Storybook stories per primitive                                                  |

## Composition rules (the core idea)

Behavior is driven by **which subcomponents you mount**, not by boolean props:

| Mount                               | Effect                                            |
| ----------------------------------- | ------------------------------------------------- |
| `<Sidebar.Header>`                  | header region exists (omit → bare sidebar)        |
| `<Sidebar.Title large>`             | enables iOS large-title scroll collapse           |
| `<Sidebar.Search>`                  | search slot renders                               |
| `<Sidebar.Actions slot="right">`    | header action cluster                             |
| `<Sidebar.FilterButton>`            | filter trigger + overlay (specialized action)     |
| `<Sidebar.Action>`                  | generic header button                             |
| `<Sidebar.Featured>`                | pinned-top region (doesn't scroll)                |
| `<Sidebar.List selectionIndicator>` | scroll body + animated active-row indicator       |
| `<Sidebar.Footer>`                  | pinned footer (omit → collapse toggle auto-fills) |

`variant="minimal" | "prominent"` renders **identical DOM** — only
`data-variant` changes. All visual differences live in `tokens.module.css` +
the module CSS. No variant branches in TSX.

### Flat namespace, hierarchy via placement

The dot-chain stays one level deep. Where a part sits in the JSX expresses the
hierarchy — `Sidebar.FilterButton` is named at one level but placed inside
`Sidebar.Actions` inside `Sidebar.Header`:

```tsx
<Sidebar.Header>
  <Sidebar.Title large>Members</Sidebar.Title>
  <Sidebar.Actions slot="right">
    <Sidebar.FilterButton>{filterControls}</Sidebar.FilterButton>
    <Sidebar.Action icon={…} label="Refresh" />
  </Sidebar.Actions>
</Sidebar.Header>
```

## Layers

- **Foundation:** `context.ts`, `tokens.module.css`, `history/`, `sidebar/hooks/`
- **Primitives:** `SplitView`, `Sidebar.*`, `Detail.*` (+ `Nav.*` from `common/nav`)
- **Presets:** `presets/Panel`, `presets/list/ListPanel`

## Example

```tsx
import { Nav } from '@/components/common/nav'
import { SplitView, Sidebar, Detail } from '@/components/common/split_view'

;<SplitView selected={isPanelSelected}>
    <SplitView.Sidebar>
        <Sidebar variant="prominent" selectionIndicator largeTitle>
            <Sidebar.Header>
                <Sidebar.Title large>Members</Sidebar.Title>
                <Sidebar.Search>{searchInput}</Sidebar.Search>
                <Sidebar.Actions slot="right">
                    <Sidebar.FilterButton>
                        {filterControls}
                    </Sidebar.FilterButton>
                </Sidebar.Actions>
            </Sidebar.Header>

            <Sidebar.Featured>
                <Nav.Account href="/admin" avatar={avatar} name="Admin" />
            </Sidebar.Featured>

            <Sidebar.List selectionIndicator>
                <Nav.Item href="/admin/panels/members" label="Members" active />
                <Nav.Group label="Settings">
                    <Nav.Item href="/admin/panels/roles" label="Roles" />
                </Nav.Group>
            </Sidebar.List>

            <Sidebar.Footer>{pagination}</Sidebar.Footer>
        </Sidebar>
    </SplitView.Sidebar>

    <SplitView.Detail>
        <Detail>
            <Detail.Header>
                <Detail.BackButton />
            </Detail.Header>
            <Detail.Body>{children}</Detail.Body>
        </Detail>
    </SplitView.Detail>
</SplitView>
```
