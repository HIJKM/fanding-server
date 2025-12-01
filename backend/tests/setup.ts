// Test setup file
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // error is kept for actual errors
};

// Set test timeout
jest.setTimeout(10000);

// Clean up after all tests
afterAll(async () => {
  // Any cleanup logic
});
