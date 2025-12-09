import Location from '../../../../../../models/Location'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import _dbConnect from '../../../../../../util/libmongo'
import { POST } from '../route'
import { NextRequest } from 'next/server'

jest.mock('../../../../../../util/libmongo', () => {
    return {
        __esModule: true,
        default: jest.fn(() => {
            return new Promise<void>((resolve) => {
                resolve()
            })
        }),
    }
})

jest.mock('../../../../../../models/Location')

describe('Zip code validation API', () => {
    it('rejects badly shaped requests', async () => {
        const response = await POST(
            new NextRequest('https://url.com', {
                method: 'POST',
                body: JSON.stringify({}),
            })
        )

        expect(response.status).toEqual(400)
    })

    it('returns true if zip was found in database', async () => {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        const mockFindOne = Location.findOne as jest.Mock

        mockFindOne.mockReturnValue({ exec: () => true })

        const postalCode = '98102'

        const response = await POST(
            new NextRequest('https://url.com', {
                method: 'POST',
                body: JSON.stringify({ code: postalCode }),
            })
        )

        expect(response.status).toEqual(200)
        expect(await response.json()).toEqual({ isValidZip: true })
    })

    it('returns false if zip was not found in database', async () => {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        const mockFindOne = Location.findOne as jest.Mock

        mockFindOne.mockReturnValue({ exec: () => null })

        const postalCode = '98102'

        const response = await POST(
            new NextRequest('https://url.com', {
                method: 'POST',
                body: JSON.stringify({ code: postalCode }),
            })
        )

        expect(response.status).toEqual(200)
        expect(await response.json()).toEqual({ isValidZip: false })
    })
})
