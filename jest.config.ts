import nextJest from 'next/jest.js'

export default nextJest({ dir: './' })({
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/tests/'],
})
