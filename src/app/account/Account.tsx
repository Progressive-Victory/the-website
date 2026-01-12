'use client'

import { MainLayout } from '@/components/layout'

interface AccountProps {
    firstName: string
    lastName: string
    state: string
    city: string
    zip: number
    addressLine1: string
    addressLine2: string
    emailAddress: string
    phoneNumber: string
}

// What is the name field on the user?
const Account = ({
    firstName,
    lastName,
    city,
    state,
    zip,
    addressLine1,
    addressLine2,
    emailAddress,
    phoneNumber,
}: AccountProps) => {
    return (
        <MainLayout>
            <div>
                <p>{firstName}</p>
                <p>{lastName}</p>
                <p>{city}</p>
                <p>{state}</p>
                <p>{zip}</p>
                <p>{addressLine1}</p>
                <p>{addressLine2}</p>
                <p>{emailAddress}</p>
                <p>{phoneNumber}</p>
            </div>
        </MainLayout>
    )
}

export default Account
