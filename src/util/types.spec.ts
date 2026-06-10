import { zIntParam, zBoolQuery, zIntArrayQuery } from '@/util/types'
import { describe, it, expect } from 'vitest'

describe('util types', () => {
    it('should parse integer route params', () => {
        expect(zIntParam.parse('123')).toBe(123)
    })

    it('should transform boolean query values correctly', () => {
        expect(zBoolQuery.parse('true')).toBe(true)
        expect(zBoolQuery.parse('false')).toBe(false)
        expect(zBoolQuery.parse(undefined)).toBe(false)
    })

    it('should parse comma separated integer arrays', () => {
        expect(zIntArrayQuery.parse('1,2,3')).toEqual([1, 2, 3])
    })

    it('should return a parse error when invalid arrays are provided', () => {
        const result = zIntArrayQuery.safeParse('1,foo,3')
        expect(result.success).toBe(false)
    })
})
