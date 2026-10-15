# Testing System Documentation

The project uses Vitest for automated tests. Test utilities and credentials must not be exposed as production application routes.

## Automated Tests

Run the complete suite with:

```bash
npm test -- --run
```

Generate a coverage report with:

```bash
npm run test:coverage
```

Tests use Vitest, jsdom, and Testing Library. Mock external services in individual test cases; do not use production credentials or expose test accounts through application routes.
