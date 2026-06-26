import { Detail } from './Detail'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

/*
 * Detail stories — SKELETON. Mirrors the Sidebar compound structure.
 */

const meta = {
    title: 'SplitView/Detail',
    component: Detail,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Detail>

export default meta
type Story = StoryObj<typeof meta>

export const Full: Story = {
    render: () => (
        <Detail>
            <Detail.Header>
                <Detail.BackButton />
                <span>Members</span>
            </Detail.Header>
            <Detail.Body>Detail body content</Detail.Body>
            <Detail.Footer>Detail footer</Detail.Footer>
        </Detail>
    ),
}

export const BodyOnly: Story = {
    render: () => (
        <Detail>
            <Detail.Body>Body only, no header or footer</Detail.Body>
        </Detail>
    ),
}
