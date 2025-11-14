import nextJest from 'next/jest.js'

export default nextJest({ dir: './' })({
    testEnvironment: 'jsdom',
    testPathIgnorePatterns: ['/api/', '/tests/'],
})
