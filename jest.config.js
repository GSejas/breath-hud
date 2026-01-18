module.exports = {
  preset: 'ts-jest',
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