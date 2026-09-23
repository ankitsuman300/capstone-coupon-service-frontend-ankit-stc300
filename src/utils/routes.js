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
