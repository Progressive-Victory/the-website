interface StubUserData {
    firstName: string
    lastName: string
    city: string
    state: string
    zip: number
    addressLine1: string
    addressLine2: string
    emailAddress: string
    phoneNumber: string
}

const STUB_GET_USER: () => StubUserData | null = () => {
    return {
        firstName: 'Eric',
        lastName: 'Oseid',
        city: 'Seattle',
        state: 'WA',
        zip: 98102,
        addressLine1: '3100 Fairview Ave E',
        addressLine2: 'Apt 109',
        emailAddress: 'ericoseid@gmail.com',
        phoneNumber: '6036678599',
    }
}

export default STUB_GET_USER
