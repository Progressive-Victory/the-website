import { AccountInfoForm } from '../AccountInfoForm'
import { cleanup, render, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'

const accountInfoFieldNames = [
    'Discord Username:',
    'Discord ID:',
    'First Name:',
    'Last Name:',
    'Email:',
    'Phone Number:',
    'Date Of Birth:',
    'State:',
    'County:',
    'City:',
    'ZIP Code:',
]

const mutableFields = {
    firstName: 'Eric',
    lastName: 'Oseid',
    dateOfBirth: new Date('1994-11-27T03:24:00'),
    county: 'King',
    city: 'Seattle',
    state: 'WA',
    zip: 98102,
    emailAddress: 'ericoseid@gmail.com',
    phoneNumber: '6036678599',
}

const immutableFields = {
    discordUsername: 'discordUsername',
    discordId: 'discordId',
}

const testUserData = {
    ...immutableFields,
    ...mutableFields,
}

describe('AccountInfoForm', () => {
    afterEach(() => {
        cleanup()
    })

    it('displays form title correctly', () => {
        const { getByText } = render(<AccountInfoForm {...testUserData} />)

        expect(getByText('Account Information')).toBeVisible()
    })

    it.each(Object.entries(immutableFields))(
        'immutable fields are disabled: %s',
        (name, value) => {
            const { getByDisplayValue } = render(
                <AccountInfoForm {...testUserData} />
            )

            const field = getByDisplayValue(value)

            expect(field.disabled).toBeTruthy()
        }
    )

    it.each(accountInfoFieldNames)(
        'renders form label correctly: %s',
        (label) => {
            const { getByText, getByDisplayValue } = render(
                <AccountInfoForm {...testUserData} />
            )

            expect(getByText(label)).toBeVisible()
        }
    )

    it.each(Object.entries(testUserData))(
        'renders initial %s value correctly',
        (name, value) => {
            const { getByText, getByDisplayValue } = render(
                <AccountInfoForm {...testUserData} />
            )

            if (name === 'dateOfBirth') {
                expect(
                    getByDisplayValue(value.toISOString().split('T')[0])
                ).toBeVisible()
            } else if (name === 'state') {
                expect(getByDisplayValue('Washington')).toBeVisible()
            } else {
                expect(getByDisplayValue(value)).toBeVisible()
            }
        }
    )

    it.each(Object.entries(mutableFields))(
        'Save Changes button until a field is changed: %s',
        async (name, value) => {
            const user = userEvent.setup()

            const { getByText, getByDisplayValue, getByRole } = render(
                <AccountInfoForm {...testUserData} />
            )

            const button = getByText('Save Changes')

            expect(button).toBeVisible()
            expect(button.disabled).toBeTruthy()

            if (name === 'dateOfBirth') {
                expect(button.disabled).toBeTruthy()
            } else if (name === 'state') {
                expect(button.disabled).toBeTruthy()
            } else {
                const input = getByDisplayValue(value)

                await user.click(input)
                await user.keyboard('hello')

                expect(button.disabled).toBeFalsy()
            }
        }
    )
})
