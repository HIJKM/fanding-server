# Testing Guide for Fanding Backend

## 📋 Overview

This document provides comprehensive testing guidelines for the Fanding backend, covering unit tests, integration tests, and end-to-end testing.

## 🛠️ Setup

### Prerequisites

- Node.js v22.x or higher
- npm or yarn

### Installation

```bash
cd backend
npm install
npm install --save-dev jest ts-jest @types/jest supertest @types/supertest
```

## 🧪 Test Structure

```
backend/
├── tests/
│   ├── setup.ts                    # Global test setup
│   ├── unit/
│   │   ├── musicianService.test.ts
│   │   └── tokenDeploymentService.test.ts
│   ├── integration/
│   │   └── musicians.api.test.ts
│   └── fixtures/
│       └── testData.ts
```

## 🚀 Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

### Run Unit Tests Only

```bash
npm run test:unit
```

### Run Integration Tests Only

```bash
npm run test:integration
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

## 📝 Test Categories

### Unit Tests

#### MusicianService Tests
**File**: `tests/unit/musicianService.test.ts`

**Coverage**:
- ✅ `createMusician()` - Create new musician profile
- ✅ `getMusicianById()` - Retrieve by MongoDB ID
- ✅ `getMusicianByWallet()` - Query by Ethereum address
- ✅ `updateTokenInfo()` - Update after token deployment
- ✅ `listMusicians()` - Paginated listing
- ✅ `searchByName()` - Search functionality

**Test Cases**: 12 test cases
- Valid input handling
- Error cases (missing fields, invalid addresses)
- Edge cases (empty results, non-existent records)

#### TokenDeploymentService Tests
**File**: `tests/unit/tokenDeploymentService.test.ts`

**Coverage**:
- ✅ `generateSymbol()` - Symbol generation with random suffix
- ✅ `generateBaseSymbol()` - Base symbol without suffix
- ✅ `deployToken()` - Blockchain deployment
- ✅ `verifyTokenDeployment()` - On-chain verification
- ✅ `isNetworkAvailable()` - Network connectivity check

**Test Cases**: 9 test cases
- Symbol generation variants
- Deployment success and failure
- Network availability checks

### Integration Tests

#### Musician API Tests
**File**: `tests/integration/musicians.api.test.ts`

**Endpoints Tested**:
- ✅ `POST /api/musicians/signup` - Musician registration
- ✅ `POST /api/musicians/:id/deploy-token` - Token deployment
- ✅ `GET /api/musicians/:id/token` - Token information
- ✅ `GET /api/musicians/:id/dashboard` - Dashboard data
- ✅ `GET /api/musicians` - List with pagination
- ✅ `GET /api/musicians/search` - Search functionality

**Test Cases**: 15 test cases per endpoint
- Success scenarios (201, 200 status)
- Client errors (400 - validation failures)
- Conflict errors (409 - duplicate wallet)
- Not found errors (404)

## 📊 Test Results

### Expected Coverage

| Category | Target | Current |
|----------|--------|---------|
| Statements | >80% | - |
| Branches | >75% | - |
| Functions | >80% | - |
| Lines | >80% | - |

### Sample Output

```
 PASS  tests/unit/musicianService.test.ts
  MusicianService
    createMusician
      ✓ should create a musician with valid input
      ✓ should throw error when musician name is empty
      ✓ should throw error for invalid wallet address
    ...

Test Suites: 3 passed, 3 total
Tests:       36 passed, 36 total
Coverage:    82.5% Statements, 78.2% Branches, 85.1% Functions
```

## 🔧 Debugging Tests

### Enable Debug Output

```bash
DEBUG=* npm test
```

### Run Single Test File

```bash
npm test -- tests/unit/musicianService.test.ts
```

### Run Specific Test Suite

```bash
npm test -- -t "MusicianService"
```

## 📌 Best Practices

### Writing Tests

1. **Use Descriptive Names**
   ```typescript
   it('should create a musician with valid input', async () => {
     // Test implementation
   });
   ```

2. **Follow Arrange-Act-Assert Pattern**
   ```typescript
   it('should do something', () => {
     // Arrange
     const input = { /* ... */ };

     // Act
     const result = service.method(input);

     // Assert
     expect(result).toBe(expected);
   });
   ```

3. **Mock External Dependencies**
   ```typescript
   jest.mock('../../src/models/musician');
   ```

4. **Clean Up Between Tests**
   ```typescript
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```

### Test Data

Use consistent test data across tests:

```typescript
const mockMusician = {
  _id: new mongoose.Types.ObjectId(),
  userId: 'user_123',
  musicianName: 'Park Jin-ho',
  genre: 'K-pop',
  walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  isTokenDeployed: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

## 🚨 Common Issues

### Issue: "Cannot find module 'mongoose'"

**Solution**: Install missing dependencies
```bash
npm install
```

### Issue: Test timeout

**Solution**: Increase jest timeout in test file
```typescript
jest.setTimeout(10000); // 10 seconds
```

### Issue: Mock not working

**Solution**: Clear mocks in beforeEach
```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

## 📚 References

- [Jest Documentation](https://jestjs.io/)
- [ts-jest Guide](https://kulshekhar.github.io/ts-jest/)
- [Testing Library Docs](https://testing-library.com/)
- [Supertest Usage](https://github.com/visionmedia/supertest)

## 🔄 Continuous Integration

Tests should run automatically on:
- Pull requests
- Commits to main branch
- Before production deployment

Set up in CI/CD pipeline:
```yaml
test:
  script:
    - npm install
    - npm test
  coverage: '/Coverage: \d+\.\d+%/'
```

## 📋 Checklist for Code Review

- [ ] All tests pass locally
- [ ] Coverage meets minimum threshold (80%)
- [ ] New features have corresponding tests
- [ ] Tests are documented with comments
- [ ] No hardcoded test data (use fixtures)
- [ ] Mocks are properly cleared between tests
- [ ] Async operations properly awaited/handled

---

**Last Updated**: 2024-11-29
**Maintainer**: Fanding Development Team
