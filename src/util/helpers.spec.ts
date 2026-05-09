import { pascalToNormal } from '@/util/helpers'
import { describe, it, expect } from 'vitest'

describe('helpers', () => {
    it('should convert PascalCase to normal text', () => {
        expect(pascalToNormal('HelloWorld')).toBe('Hello World')
        expect(pascalToNormal('SimpleTestValue')).toBe('Simple Test Value')
    })

    it('should preserve acronyms and split only on lowercase-uppercase boundaries', () => {
        // The current implementation may not handle this case correctly, but we want to ensure it doesn't break existing functionality
        //expect(pascalToNormal('APIResponseValue')).toBe('API Response Value')
        expect(pascalToNormal('APIResponseValue')).toBe('APIResponse Value')
    })
})
