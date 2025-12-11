module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.m?js$': ['babel-jest', { configFile: './babel.config.cjs' }],
  },
  testMatch: ['**/tests/**/*.test.js'],
  moduleFileExtensions: ['js', 'json', 'node'],
  transformIgnorePatterns: ['/node_modules/'],
  setupFiles: ['<rootDir>/jest.setup.cjs'],
};