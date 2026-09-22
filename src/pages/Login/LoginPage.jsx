import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { extractApiErrors, extractApiErrorMessage } from '@/utils/apiError';
import { SitemapRoute } from '@/utils/routes';
import { UserRole } from '@/utils/roles';

// 1. Yup schema — mirrors the backend's login validation (identifier is
// either an email or a 10-digit phone, checked server-side in
// authUserService.js; Yup just needs "required" here for fast UX feedback).
const loginSchema = Yup.object({
  identifier: Yup.string().required('Email or phone is required'),
  password: Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
});

const initialValues = { identifier: '', password: '' };

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 2. Submit handler
  const handleSubmit = async (values, { setErrors, setSubmitting }) => {
    try {
      const loggedInUser = await login(values);
      toast.success(`Welcome back, ${loggedInUser?.name || 'there'}`);
      const redirectTo =
        location.state?.from?.pathname ||
        (loggedInUser?.role === UserRole.ADMIN ? SitemapRoute.ADMIN_COUPONS : SitemapRoute.REDEEM);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      // 3. Map backend field errors onto Formik; fall back to a toast for
      // anything that isn't field-specific (e.g. "no user found").
      const fieldErrors = extractApiErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        toast.error(extractApiErrorMessage(error));
      }
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold">Sign in</h1>
        <p className="mb-6 text-sm text-[var(--color-text-muted)]">
          Coupon Redemption Service
        </p>

        {/* 4. Controlled form, inline errors, submit disabled until valid+dirty */}
        <Formik initialValues={initialValues} validationSchema={loginSchema} onSubmit={handleSubmit}>
          {({ isSubmitting, isValid, dirty }) => (
            <Form className="flex flex-col gap-4">
              <div>
                <label htmlFor="identifier" className="mb-1 block text-sm font-medium">
                  Email or phone
                </label>
                <Field
                  id="identifier"
                  name="identifier"
                  type="text"
                  className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                />
                <ErrorMessage name="identifier" component="p" className="mt-1 text-xs text-[var(--color-danger)]" />
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium">
                  Password
                </label>
                <Field
                  id="password"
                  name="password"
                  type="password"
                  className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                />
                <ErrorMessage name="password" component="p" className="mt-1 text-xs text-[var(--color-danger)]" />
              </div>

              <button
                type="submit"
                disabled={!isValid || !dirty || isSubmitting}
                className="mt-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {isSubmitting ? 'Logging in…' : 'Log in'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
