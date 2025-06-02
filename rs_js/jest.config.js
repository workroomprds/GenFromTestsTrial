// jest.config.js
export default {
  // Test environment and patterns
  testEnvironment: 'jsdom',
  testMatch: ['**/test/jest/*.test.js'],
  
  // Include both JS and JSON as module file extensions
  moduleFileExtensions: ['js', 'json', 'html'],
  
  // Verbosity for better debugging
  verbose: true,

  // Transform configuration
  transform: {
    // Transform HTML files to text strings
    "^.+\\.html$": "jest-transform-stub"
  },
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover', 'json'],
  collectCoverageFrom: [
    'src/js/**/*.js',
    '!**/node_modules/**'
  ],
  
    // Setup file
  setupFilesAfterEnv: ['./jest.setup.js']
  
  // No transform or moduleNameMapper needed for JSON files
};