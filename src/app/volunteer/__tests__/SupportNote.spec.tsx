import { SupportNote } from '../SupportNote'
import { render, screen } from '@testing-library/react'

describe('Support note', () => {
    it('renders message properly', async () => {
        render(<SupportNote />)

        expect(
            await screen.findByText(
                'If the join form is not working for you, please email us at: support@progress.win'
            )
        ).toBeVisible()
    })
})
