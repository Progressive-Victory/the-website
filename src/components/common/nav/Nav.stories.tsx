import { Nav } from './index'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

/*
 * Nav stories — SKELETON.
 *
 * General-purpose nav rows. Not coupled to split_view; rendered here standalone.
 */

const meta = {
    title: 'Nav/Nav',
    parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Item: Story = {
    render: () => (
        <>
            <Nav.Item href="#" label="Members" count={1280} />
            <Nav.Item href="#" label="Donors" active />
            <Nav.Item
                href="#"
                label="Card row"
                variant="card"
                subtitle="extra"
            />
        </>
    ),
}

export const Group: Story = {
    render: () => (
        <Nav.Group label="Settings" defaultOpen>
            <Nav.Item href="#" label="Roles" />
            <Nav.Item href="#" label="Permissions" />
        </Nav.Group>
    ),
}

export const Account: Story = {
    render: () => (
        <Nav.Account
            href="#"
            avatar={
                <div
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: '#2986cc',
                    }}
                />
            }
            name="Admin User"
            subtitle="@admin"
        />
    ),
}
