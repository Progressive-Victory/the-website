import { SupportNote } from '../SupportNote'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('Support note', () => {
    it('renders message properly', () => {
        const { getByText } = render(<SupportNote />)

        expect(
            getByText(
                'If the join form is not working for you, please email us at: support@progress.win'
            )
        ).toBeVisible()
    })
})
