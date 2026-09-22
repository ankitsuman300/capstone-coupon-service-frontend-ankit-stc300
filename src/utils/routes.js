// Route paths as a single source of truth (Component Conventions doc:
// "anything a string literal appears more than once, extract it"). A typo
// in `SitemapRoute.COUPONS` is a compile-time/import error; a typo in a
// hand-typed '/admin/coupns' string is a silent 404 at runtime.
export const SitemapRoute = {
  LOGIN: '/login',
  REDEEM: '/redeem',
  MY_REDEMPTIONS: '/my-redemptions',
  ADMIN_COUPONS: '/admin/coupons',
  ADMIN_COUPON_NEW: '/admin/coupons/new',
  ADMIN_COUPON_EDIT: '/admin/coupons/:id/edit',
  ADMIN_USERS: '/admin/users',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_REDEMPTION_DETAIL: '/admin/redemptions/:id',
  ADMIN_COUPON_BULK_IMPORT: '/admin/coupons/bulk-import'
};

export const buildRoute = (pattern, params = {}) =>
  Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, value),
    pattern
  );
