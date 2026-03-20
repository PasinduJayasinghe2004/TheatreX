# Day 24 Delivery Checklist

## Backend Performance

- Connection pooling tuned with environment overrides in backend/config/database.js.
- Composite indexes added for high-traffic surgery/theatre queries.
- Short-TTL in-memory caching added for dashboard and theatre polling endpoints.
- Pagination implemented for GET /api/surgeries with metadata.
- Smoke performance test command added: npm run perf:smoke (from backend/).

## Responsive UI Polish

- Dashboard header and spacing optimized for mobile and tablet layouts.
- Surgery listing page now supports server-side pagination + mobile-friendly controls.
- Theatre list filters and header actions improved for narrow screens.
- Staff pages (Surgeons, Nurses, Anaesthetists) updated with mobile-first spacing and action button layout.

## Mobile Test Matrix

- 360x800 (small Android)
- 390x844 (iPhone 13/14)
- 768x1024 (tablet portrait)
- 1024x768 (tablet landscape)

## Cross-Browser Matrix

- Chrome (latest)
- Edge (latest)
- Firefox (latest)
- Safari (latest on macOS/iOS)

## Suggested Validation Flow

1. Start backend and frontend.
2. Verify pagination on Surgeries list.
3. Verify theatre filters and card layout at small widths.
4. Verify staff pages header/action controls at small widths.
5. Run backend perf smoke test and record average + p95.
