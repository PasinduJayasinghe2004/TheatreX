# How to Restore Testing Dependencies

> [!IMPORTANT]
> The testing dependencies were removed from `package.json` files to fix CI failures, as `npm install` could not be run in the current environment to update `package-lock.json`.

Once you have installed Node.js and have access to `npm`, follow these steps to restore the testing infrastructure:

## 1. Backend Dependencies

```bash
cd backend
npm install jest supertest --save-dev

# Add scripts to package.json:
# "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js",
# "test:watch": "node --experimental-vm-modules node_modules/jest/bin/jest.js --watch",
# "test:coverage": "node --experimental-vm-modules node_modules/jest/bin/jest.js --coverage"
```

## 2. Frontend Dependencies

```bash
cd frontend
npm install vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom --save-dev

# Add scripts to package.json:
# "test": "vitest",
# "test:ui": "vitest --ui",
# "test:coverage": "vitest --coverage"
```

After running these commands, your `package.json` and `package-lock.json` will be in sync, and the CI pipeline will pass with the tests enabled.
