import { SplitView } from '../SplitView'
import { Sidebar } from './Sidebar'
import { Nav } from '@/components/common/nav'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ReactNode } from 'react'

/*
 * Sidebar stories — SKELETON.
 *
 * Demonstrates composition-driven behavior: each story mounts a different set
 * of Sidebar.* parts. Sidebar.* parts require the SplitView context, so every
 * story is wrapped in a <SplitView> decorator.
 */

function withSplitView(children: ReactNode) {
    return (
        <SplitView selected>
            <SplitView.Sidebar>{children}</SplitView.Sidebar>
            <SplitView.Detail>
                <div style={{ padding: 16 }}>detail pane</div>
            </SplitView.Detail>
        </SplitView>
    )
}

const meta = {
    title: 'SplitView/Sidebar',
    component: Sidebar,
    parameters: { layout: 'fullscreen' },
    decorators: [(Story) => withSplitView(<Story />)],
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

const sampleRows = (
    <>
        <Nav.Item href="#" label="Members" active />
        <Nav.Item href="#" label="Donors" />
        <Nav.Group label="Settings">
            <Nav.Item href="#" label="Roles" />
            <Nav.Item href="#" label="Permissions" />
        </Nav.Group>
    </>
)

export const Prominent: Story = {
    args: { variant: 'prominent', selectionIndicator: true },
    render: (args) => (
        <Sidebar {...args}>
            <Sidebar.Header>
                <Sidebar.Title>Members</Sidebar.Title>
            </Sidebar.Header>
            <Sidebar.List selectionIndicator>{sampleRows}</Sidebar.List>
        </Sidebar>
    ),
}

export const Minimal: Story = {
    args: { variant: 'minimal', selectionIndicator: true },
    render: (args) => (
        <Sidebar {...args}>
            <Sidebar.List selectionIndicator>{sampleRows}</Sidebar.List>
        </Sidebar>
    ),
}

export const LargeTitle: Story = {
    args: { variant: 'prominent', selectionIndicator: true, largeTitle: true },
    render: (args) => (
        <Sidebar {...args}>
            <Sidebar.Header>
                <Sidebar.Title large>Members</Sidebar.Title>
                <Sidebar.Search>
                    <input placeholder="Search…" />
                </Sidebar.Search>
            </Sidebar.Header>
            <Sidebar.List selectionIndicator>{sampleRows}</Sidebar.List>
        </Sidebar>
    ),
}

export const WithActionsAndFooter: Story = {
    args: { variant: 'prominent' },
    render: (args) => (
        <Sidebar {...args}>
            <Sidebar.Header>
                <Sidebar.Title>Members</Sidebar.Title>
                <Sidebar.Actions slot="right">
                    <Sidebar.FilterButton>
                        <div>filter controls</div>
                    </Sidebar.FilterButton>
                    <Sidebar.Action label="Refresh" />
                </Sidebar.Actions>
            </Sidebar.Header>
            <Sidebar.Featured>featured / account card</Sidebar.Featured>
            <Sidebar.List>{sampleRows}</Sidebar.List>
            <Sidebar.Footer>pagination footer</Sidebar.Footer>
        </Sidebar>
    ),
}

export const Bare: Story = {
    args: { variant: 'prominent' },
    render: (args) => (
        <Sidebar {...args}>
            <Sidebar.List>{sampleRows}</Sidebar.List>
        </Sidebar>
    ),
}
