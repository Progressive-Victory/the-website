import { vi } from 'vitest'

/**
 * Mock matchMedia for testing responsive behavior
 * @param queries - Object mapping media queries to their match results
 * @example
 * mockMatchMedia({ '(min-width: 1280px)': true }) // Desktop
 * mockMatchMedia({ '(min-width: 1280px)': false }) // Mobile
 */
export function mockMatchMedia(queries: Record<string, boolean>) {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches: queries[query] ?? false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    })
}

/**
 * Reset matchMedia to the default test polyfill (always returns false)
 */
export function resetMatchMedia() {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    })
}
