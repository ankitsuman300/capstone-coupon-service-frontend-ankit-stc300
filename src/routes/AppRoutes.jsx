import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell, ProtectedRoute } from '@/components';
import { SitemapRoute } from '@/utils/routes';
import { UserRole } from '@/utils/roles';
import { LoginPage } from '@/pages/Login/LoginPage';
import { RedeemPage } from '@/pages/Redeem/RedeemPage';
import { RedemptionHistoryPage } from '@/pages/customer/RedemptionHistory/RedemptionHistoryPage';
import { CouponListPage } from '@/pages/admin/CouponList/CouponListPage';
import { CouponFormPage } from '@/pages/admin/CouponForm/CouponFormPage';
import { UsersPage } from '@/pages/admin/Users/UsersPage';
import { AnalyticsPage } from '@/pages/admin/Analytics/AnalyticsPage';
import { RedemptionDetailPage } from '@/pages/admin/RedemptionDetail/RedemptionDetailPage';
import { CouponBulkImportPage } from '@/pages/admin/CouponBulkImportPage/CouponBulkImportPage';

// One route tree for the whole app. Everything except /login sits behind
// ProtectedRoute; admin-only pages additionally pass role={UserRole.ADMIN}
// (see ProtectedRoute.jsx — redirects a logged-in customer away rather than
// showing a broken admin page).
export const AppRoutes = () => (
  <Routes>
    <Route path={SitemapRoute.LOGIN} element={<LoginPage />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<AppShell />}>
        <Route path={SitemapRoute.REDEEM} element={<RedeemPage />} />
        <Route path={SitemapRoute.MY_REDEMPTIONS} element={<RedemptionHistoryPage />} />

        <Route element={<ProtectedRoute role={UserRole.ADMIN} />}>
          <Route path={SitemapRoute.ADMIN_COUPONS} element={<CouponListPage />} />
          <Route path={SitemapRoute.ADMIN_COUPON_NEW} element={<CouponFormPage />} />
          <Route path={SitemapRoute.ADMIN_COUPON_EDIT} element={<CouponFormPage />} />
          <Route path={SitemapRoute.ADMIN_USERS} element={<UsersPage />} />
          <Route path={SitemapRoute.ADMIN_ANALYTICS} element={<AnalyticsPage />} />
          <Route path={SitemapRoute.ADMIN_REDEMPTION_DETAIL} element={<RedemptionDetailPage />} />
          <Route path={SitemapRoute.ADMIN_COUPON_BULK_IMPORT} element={<CouponBulkImportPage />} />
        </Route>
      </Route>
    </Route>

    <Route path="/" element={<Navigate to={SitemapRoute.REDEEM} replace />} />
    <Route path="*" element={<Navigate to={SitemapRoute.REDEEM} replace />} />
  </Routes>
);
