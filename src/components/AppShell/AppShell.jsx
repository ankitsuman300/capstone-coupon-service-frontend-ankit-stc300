import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { SitemapRoute } from '@/utils/routes';
import { UserRole } from '@/utils/roles';

const navLinkClass = ({ isActive }) =>
  `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-[var(--color-primary)] text-white'
      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-border)]/50 hover:text-[var(--color-text)]'
  }`;

export const AppShell = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out');
      navigate(SitemapRoute.LOGIN);
    } catch {
      toast.error('Logout failed — please try again');
    }
  };

  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <div className="flex min-h-svh">
      <aside className="flex w-56 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <p className="mb-6 px-3 text-lg font-semibold">Coupon Service</p>
        <nav className="flex flex-1 flex-col gap-1">
          <NavLink to={SitemapRoute.REDEEM} className={navLinkClass}>
            Redeem a coupon
          </NavLink>
          {!isAdmin && (
            <NavLink to={SitemapRoute.MY_REDEMPTIONS} className={navLinkClass}>
              My redemptions
            </NavLink>
          )}
          {isAdmin && (
            <>
              <p className="mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Admin
              </p>
              <NavLink to={SitemapRoute.ADMIN_COUPONS} className={navLinkClass}>
                Coupons
              </NavLink>
              <NavLink to={SitemapRoute.ADMIN_USERS} className={navLinkClass}>
                Users
              </NavLink>
              <NavLink to={SitemapRoute.ADMIN_ANALYTICS} className={navLinkClass}>
                Analytics
              </NavLink>
            </>
          )}
        </nav>
        <div className="border-t border-[var(--color-border)] pt-3">
          <p className="truncate px-3 text-sm text-[var(--color-text-muted)]">
            {user?.name || user?.email || 'Signed in'}
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 w-full rounded-md px-3 py-2 text-left text-sm font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};
