export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg|mp4|webm)$': '<rootDir>/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/**/*.test.{js,jsx}',
    '!src/test/**/*',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
    './src/hooks/useSafetyFilter.js': {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    './src/constants/comprehensiveSafety.js': {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/tests/unit/**/*.[jt]s?(x)',
    '**/tests/integration/**/*.[jt]s?(x)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/mobile/',
    '\\.spec\\.js$'
  ],
};
