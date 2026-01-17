import { dateService } from '@/services'
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'

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

    describe('isValid', () => {
        it('should return true if the date is parsable', () => {
            const date = '2005-06-20'

            const result = dateService.isValid(date)

            expect(result).toBe(true)
        })

        it('should return true if the date is parsable in other formats', () => {
            const date = '6/20/2005'

            const result = dateService.isValid(date)

            expect(result).toBe(true)
        })

        it('should return false if the date is invalid', () => {
            const date = '06a20a05'

            const result = dateService.isValid(date)

            expect(result).toBe(false)
        })

        it('should return false if the date is empty', () => {
            const date = ''

            const result = dateService.isValid(date)

            expect(result).toBe(false)
        })
    })

    describe('toISODateString', () => {
        it('should return null if the date is invalid', () => {
            const date = '06a20a05'

            const result = dateService.toISODateString(date)

            expect(result).toBeNull()
        })

        it('should return yyyy-mm-dd if the date is valid', () => {
            const date = '6/20/05'

            const result = dateService.toISODateString(date)

            expect(result).toBe('2005-06-20')
        })
    })

    describe('getAge', () => {
        const now = new Date('2025-01-01')

        beforeAll(() => {
            vi.spyOn(dateService, 'now').mockReturnValue(now)
        })

        afterAll(() => {
            vi.clearAllMocks()
        })

        it('should return the number of years between input and now', () => {
            const dateOfBirth = new Date('2000-03-20')

            const result = dateService.getAge(dateOfBirth)

            expect(result).toBe(24)
        })

        it('should return the correct value prior to 1970', () => {
            const dateOfBirth = new Date('1965-10-05')

            const result = dateService.getAge(dateOfBirth)

            expect(result).toBe(59)
        })

        it('should return one if exactly one year has passed', () => {
            const dateOfBirth = new Date('2024-01-01')

            const result = dateService.getAge(dateOfBirth)

            expect(result).toBe(1)
        })

        it('should return zero if just under one year has passed', () => {
            const dateOfBirth = new Date('2024-01-02')

            const result = dateService.getAge(dateOfBirth)

            expect(result).toBe(0)
        })

        it('should return null if input is invalid', () => {
            const dateOfBirth = new Date('2024a01a02')

            const result = dateService.getAge(dateOfBirth)

            expect(result).toBe(null)
        })

        it('should return null if input is in the future', () => {
            const dateOfBirth = new Date('2025-01-02')

            const result = dateService.getAge(dateOfBirth)

            expect(result).toBe(null)
        })
    })
})
