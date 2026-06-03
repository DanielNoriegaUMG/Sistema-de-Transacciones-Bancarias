# Testing Guide - Sistema de Transacciones Bancarias

This document describes the testing setup and execution for both backend and frontend of the banking application.

## Overview

The project includes comprehensive test suites for:
- **Backend**: Unit tests for controllers, services, and middleware using Jest + Supertest
- **Frontend**: Component tests for hooks, components, and pages using React Testing Library

## Backend Testing

### Setup

Dependencies installed:
- `jest`: Testing framework
- `supertest`: HTTP assertion library for testing Express routes
- `prettier`: Code formatting
- `eslint`: Code linting

### Running Backend Tests

```bash
npm test                  # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
```

### Test Structure

Backend tests are located in `src/__tests__/`:

```
src/__tests__/
├── auth.controller.test.js       # 7 tests for authentication
├── cuenta.controller.test.js      # 5 tests for account management
├── transferencia.controller.test.js  # 6 tests for transfers
├── error.middleware.test.js       # 4 tests for error handling
└── setup.js                        # Test configuration
```

### Test Coverage

**Backend Tests: 22 passing tests** across 4 test suites

| Module | Tests | Coverage |
|--------|-------|----------|
| Auth Controller | 7 | login, logout, me endpoints |
| Account Controller | 5 | getAll, getById endpoints |
| Transfer Controller | 6 | getAll, create endpoints |
| Error Middleware | 4 | error handling scenarios |

### Backend Test Examples

**Auth Controller Test:**
```javascript
describe("Auth Controller", () => {
  it("should return success and token on valid credentials", async () => {
    // Mocks authService.login()
    // Verifies response format and HTTP status
  });

  it("should return 401 on invalid credentials", async () => {
    // Tests unauthorized response
  });
});
```

## Frontend Testing

### Setup

Dependencies installed:
- `@testing-library/react`: React component testing utilities
- `@testing-library/jest-dom`: Custom Jest matchers
- `@testing-library/user-event`: User interaction simulation

### Running Frontend Tests

```bash
cd client
npm test                    # Run tests interactively
npm test -- --watchAll=false  # Run once and exit
npm test -- --coverage      # Run with coverage report
```

### Test Structure

Frontend tests are located alongside source files:

```
client/src/
├── setupTests.js                      # Test configuration
├── context/
│   └── AuthContext.test.jsx          # 4 tests for auth state
├── components/
│   └── ErrorBoundary.test.jsx        # 5 tests for error UI
└── pages/
    └── Login.test.jsx                 # 6 tests for login flow
```

### Test Coverage

**Frontend Tests: 15 passing tests** across 3 test suites

| Component | Tests | Coverage |
|-----------|-------|----------|
| AuthContext Hook | 4 | initialization, login, logout, token persistence |
| ErrorBoundary Component | 5 | error rendering, development mode, reload |
| Login Page | 6 | form rendering, input handling, validation, submission |

### Frontend Test Examples

**AuthContext Test:**
```javascript
describe("AuthContext", () => {
  it("should provide initial auth state", () => {
    // Verifies context provides all required functions
  });

  it("should handle login successfully", async () => {
    // Mocks API response
    // Verifies token/user stored in localStorage
  });
});
```

## Test Configuration

### Backend (jest.config.js)

```javascript
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverageFrom: ["src/**/*.js"],
};
```

### Frontend (setupTests.js)

```javascript
import "@testing-library/jest-dom";
// Mock localStorage for testing
// Reset state before each test
```

## Mocking Strategy

### Backend
- **Services**: Mocked using `jest.mock()`
- **Database**: Not accessed during tests
- **Validation**: Tests validate controller behavior with mocked services

### Frontend
- **API Calls**: Mocked using `jest.mock("../api")`
- **localStorage**: Simulated with custom implementation
- **Router**: Components wrapped in `<BrowserRouter>` for testing

## Best Practices

1. **Isolation**: Each test is independent and doesn't affect others
2. **Descriptive Names**: Test names clearly describe what is being tested
3. **Arrange-Act-Assert**: Tests follow AAA pattern
4. **Mocking**: External dependencies are mocked to avoid side effects
5. **Error Handling**: Tests verify both success and failure paths

## Continuous Integration

Tests can be integrated into CI/CD pipeline:

```bash
# Backend
cd /project/root
npm test

# Frontend
cd /project/root/client
npm test -- --watchAll=false
```

## Troubleshooting

### Backend Tests Fail
- Ensure Jest is properly installed: `npm install --save-dev jest`
- Check that test files match pattern `**/__tests__/**/*.test.js`
- Verify `.env` file exists for environment variables

### Frontend Tests Fail
- Clear Jest cache: `npm test -- --clearCache`
- Ensure React Testing Library is installed
- Check setupTests.js is being loaded

## Next Steps

Recommended additions:
1. **Integration Tests**: Test API endpoints with real database
2. **E2E Tests**: Use Playwright/Cypress for user workflows
3. **Coverage Goals**: Aim for >80% code coverage
4. **Performance Tests**: Monitor render times and API response times

## References

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
