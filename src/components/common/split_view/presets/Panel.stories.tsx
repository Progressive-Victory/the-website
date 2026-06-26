import { Panel } from './Panel'
import { Nav } from '@/components/common/nav'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

/*
 * Panel preset stories — SKELETON.
 *
 * The high-level convenience wrapper. Boolean props here translate into the
 * right primitive composition.
 */

const meta = {
    title: 'SplitView/Presets/Panel',
    component: Panel,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Panel>

export default meta
type Story = StoryObj<typeof meta>

const rows = (
    <>
        <Nav.Item href="#" label="Members" active />
        <Nav.Item href="#" label="Donors" />
    </>
)

export const FullPanel: Story = {
    args: {
        label: 'Members',
        includeSidebar: true,
        includeHeader: true,
        largeTitle: true,
        sidebarBody: rows,
        children: <div style={{ padding: 16 }}>Panel detail content</div>,
    },
}

export const NoSidebar: Story = {
    args: {
        label: 'Standalone',
        includeSidebar: false,
        includeHeader: true,
        children: <div style={{ padding: 16 }}>Content without a sidebar</div>,
    },
}
