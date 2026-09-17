const path = require('path');

module.exports = {
  // Ensure <rootDir> points to repository root for paths like <rootDir>/src
  rootDir: path.resolve(__dirname, '..'),
  preset: 'ts-jest',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  projects: [
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/src/shared/**/__tests__/**/*.ts',
        '<rootDir>/src/main/**/__tests__/**/*.ts',
        '<rootDir>/src/renderer/managers/**/__tests__/**/*.ts'
      ],
      transform: {
        '^.+\\.ts$': 'ts-jest',
      },
    },
    {
      displayName: 'jsdom',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/src/renderer/**/__tests__/**/*.ts',
        '!<rootDir>/src/renderer/managers/**/__tests__/**/*.ts'
      ],
      transform: {
        '^.+\\.ts$': 'ts-jest',
      },
      setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts']
    }
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};