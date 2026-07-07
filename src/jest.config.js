const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Forneça o caminho para a sua aplicação Next.js para carregar as configurações do compilador
  dir: './',
});

// Configurações personalizadas do Jest
const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/node_modules/@testing-library/jest-dom'],
};

module.exports = createJestConfig(customJestConfig);