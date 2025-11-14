import { dateService } from '@/services'

describe('dateService', () => {
    describe('now', () => {
        it('should return the current date', () => {
            const epsilonMillis = 50
            const expected = new Date()

            const result = dateService.now()
            const deltaTime = result.getTime() - expected.getTime()

            expect(deltaTime).toBeLessThan(epsilonMillis)
        })
    })

    describe('getAge', () => {
        const now = new Date('2025-01-01')

        beforeAll(() => {
            jest.spyOn(dateService, 'now').mockReturnValue(now)
        })

        afterAll(() => {
            jest.clearAllMocks()
        })

        it('should return the number of years between input and now', () => {
            const dateOfBirth = '2000-03-20'

            const result = dateService.getAge(dateOfBirth)

            expect(result).toBe(24)
        })

        it('should return the correct value prior to 1970', () => {
            const dateOfBirth = '1965-10-05'

            const result = dateService.getAge(dateOfBirth)

            expect(result).toBe(59)
        })

        it('should return one if exactly one year has passed', () => {
            const dateOfBirth = '2024-01-01'

            const result = dateService.getAge(dateOfBirth)

            expect(result).toBe(1)
        })

        it('should return zero if just under one year has passed', () => {
            const dateOfBirth = '2024-01-02'

            const result = dateService.getAge(dateOfBirth)

            expect(result).toBe(0)
        })

        it('should return null if input is invalid', () => {
            const dateOfBirth = '2024a01a02'

            const result = dateService.getAge(dateOfBirth)

            expect(result).toBe(null)
        })

        it('should return null if input is in the future', () => {
            const dateOfBirth = '2025-01-02'

            const result = dateService.getAge(dateOfBirth)

            expect(result).toBe(null)
        })
    })
})
