const isTestEnv = process.env.NODE_ENV === 'test' && !process.env.CLERK_SECRET_KEY;

let protect;
let authorize;

if (isTestEnv) {
  // In test mode without Clerk configured, use no-op middlewares so Jest/supertest can run without CLERK_SECRET_KEY.
  protect = function testBypassProtect(req, res, next) {
    if (typeof next === 'function') {
      return next();
    }
  };

  authorize = function testBypassAuthorize() {
    return function (_req, _res, next) {
      if (typeof next === 'function') {
        return next();
      }
    };
  };
} else {
  // In non-test environments, delegate to the real Clerk-backed middleware.
  // This import is placed inside the branch so tests without CLERK_SECRET_KEY don't load Clerk.
  const { clerkProtect, authorize: clerkAuthorize } = await import('./clerkMiddleware.js');
  protect = clerkProtect;
  authorize = clerkAuthorize;
}

export { protect, authorize };
