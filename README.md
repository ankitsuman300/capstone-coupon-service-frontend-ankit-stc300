# Coupon Redemption Service — Frontend

React (Vite) frontend for the S7C capstone Coupon Redemption Service. Talks to the
Node/Express/Mongoose backend via a JSON REST API.

## Stack

- React 19 + Vite (JavaScript, no TypeScript)
- React Router v7 for routing, with a `ProtectedRoute` wrapper for auth + admin role gating
- TanStack Query (React Query) for all server state — every list/detail page is a `useQuery`,
  every create/update/delete is a `useMutation` that invalidates the relevant query keys
- Axios (single instance in `src/services/api.js`) with an interceptor that silently refreshes
  the access token on a 401 and retries the original request once
- Formik + Yup for every form, mirroring the backend's Joi validation schemas
- React Context (`AuthContext`) for the logged-in user / role — the only piece of truly global
  client state in the app
- Tailwind CSS v4 with a small CSS-custom-property design-token system (`src/index.css`) for
  light/dark theming
- `react-hot-toast` for success/error toasts, `recharts` for the analytics bar chart

## Folder structure

```
src/
  components/   shared, presentational components (LoadingState, ErrorState, EmptyState,
                Pagination, ConfirmDialog, ProtectedRoute, AppShell)
  context/      AuthContext (current user, login/logout, silent session restore)
  hooks/        one file per resource, wrapping React Query around services/
  pages/        one folder per page, split into pages/admin and pages/customer
  routes/       AppRoutes.jsx — the single route tree
  services/     one file per resource — thin wrappers around the shared Axios instance
  utils/        routes.js (route constants), roles.js, apiError.js, jwt.js
```

Every list/detail page renders four states: loading, error (with a retry button), empty, and
populated — there is no page that just silently renders nothing.

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:5173`. It expects the backend to be running and
reachable at the URL in `.env.local` (defaults to `http://localhost:1234/api`).

```bash
npm run build     # production build to dist/
npm run lint      # eslint
```

Both `npm run build` and `npm run lint` were run against this exact codebase before delivery
and pass clean.

## Backend requirements

- The backend must be running with MongoDB as a **replica set**, not a standalone `mongod` —
  the redemption endpoint uses a multi-document transaction (`mongoose.startSession()` +
  `session.withTransaction()`), which MongoDB only supports on a replica set.
- CORS on the backend must allow credentials (`credentials: true`) and this frontend's origin,
  since the refresh flow relies on an httpOnly cookie sent cross-origin (`withCredentials: true`
  in `src/services/api.js`).

## ⚠️ Known backend bug affecting login persistence

`config/constants.js` on the backend defines:

```js
userRefreshTokenPath = "/api/users/auth/update-refresh-access"
```

...which is used as the `path` option on the refresh-token cookie. The route is actually
mounted at `/api/users/update-refresh-access` (no `/auth/` segment). Because the cookie's
`path` doesn't match the real route, the browser may not send the refresh cookie back to it,
which can silently break "stay logged in after a page refresh."

This frontend already calls the *real* route (`PUT /users/update-refresh-access`, see
`AuthContext.jsx` and `services/api.js`) as a workaround, so the app works correctly as long as
the access token is still in memory. But a hard refresh relies on that cookie's path matching,
so it's worth fixing on the backend by changing `constants.js` to
`"/api/users/update-refresh-access"` before the cookie is set.

## Not implemented

The backend capstone did not include a bulk CSV coupon import endpoint, so there is no bulk
import UI here either — coupons are created one at a time via the "New coupon" form.
