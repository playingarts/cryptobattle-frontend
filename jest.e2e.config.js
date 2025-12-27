/**
 * Jest configuration for E2E smoke tests
 * These tests run against the production or staging backend
 */
module.exports = {
  displayName: 'e2e',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/e2e/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.test.json',
      },
    ],
    '^.+\\.jsx?$': [
      'babel-jest',
      { configFile: '<rootDir>/tests/e2e/babel.config.js' },
    ],
  },
  // Allow axios ESM module to be transformed
  transformIgnorePatterns: [
    '/node_modules/(?!(axios)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  // E2E tests need longer timeouts
  testTimeout: 120000,
  // Run tests serially to avoid race conditions
  maxWorkers: 1,
  // Verbose output for debugging
  verbose: true,
  // Fail fast on first error
  bail: true,
};
