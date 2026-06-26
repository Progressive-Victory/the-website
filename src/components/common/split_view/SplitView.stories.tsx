import { SplitView } from './SplitView'
import { Detail } from './detail/Detail'
import { Sidebar } from './sidebar/Sidebar'
import { Nav } from '@/components/common/nav'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

/*
 * SplitView stories — SKELETON.
 *
 * These exercise the full split-view shell. Visuals are placeholder until the
 * components are fleshed out; the value now is verifying composition (which
 * parts mount) and the variant data-attribute wiring.
 */

const meta = {
    title: 'SplitView/SplitView',
    component: SplitView,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SplitView>

export default meta
type Story = StoryObj<typeof meta>

export const ProminentWithDetail: Story = {
    args: { selected: true },
    render: (args) => (
        <SplitView {...args}>
            <SplitView.Sidebar>
                <Sidebar variant="prominent" selectionIndicator largeTitle>
                    <Sidebar.Header>
                        <Sidebar.Title large>Members</Sidebar.Title>
                    </Sidebar.Header>
                    <Sidebar.List selectionIndicator>
                        <Nav.Item href="#" label="Members" active />
                        <Nav.Item href="#" label="Roles" />
                        <Nav.Group label="Settings">
                            <Nav.Item href="#" label="Permissions" />
                        </Nav.Group>
                    </Sidebar.List>
                </Sidebar>
            </SplitView.Sidebar>
            <SplitView.Detail>
                <Detail>
                    <Detail.Header>Detail header</Detail.Header>
                    <Detail.Body>Detail body content</Detail.Body>
                </Detail>
            </SplitView.Detail>
        </SplitView>
    ),
}

export const Unselected: Story = {
    args: { selected: false },
    render: (args) => (
        <SplitView {...args}>
            <SplitView.Sidebar>
                <Sidebar variant="prominent">
                    <Sidebar.List>
                        <Nav.Item href="#" label="Members" />
                    </Sidebar.List>
                </Sidebar>
            </SplitView.Sidebar>
            <SplitView.Placeholder>Select a panel</SplitView.Placeholder>
        </SplitView>
    ),
}
