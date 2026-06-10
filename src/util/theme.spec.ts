import { getBrandColor, ShadeIndex } from '@/util/theme'
import { describe, it, expect } from 'vitest'

describe('theme colors', () => {
    it('should return default color when no shade is provided', () => {
        expect(getBrandColor('brandLightBlue')).toBe('#2986CC')
        expect(getBrandColor('mapBlue')).toBe('#09223A')
    })

    it('should return the requested color shade', () => {
        expect(getBrandColor('brandLightBlue', 300)).toBe('#549ED6')
        expect(getBrandColor('brandRed', 100)).toBe('#EBAFA9')
    })

    it('should fall back to default when an unknown shade is requested', () => {
        expect(getBrandColor('brandYellow', 'DEFAULT')).toBe('#FDB515')
        expect(getBrandColor('mapBlue', 'unknown' as ShadeIndex)).toBe(
            '#09223A'
        )
    })
})
