import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import {
  useCouponQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
} from '@/hooks/useCoupons';
import { LoadingState, ErrorState } from '@/components';
import { extractApiErrors, extractApiErrorMessage } from '@/utils/apiError';
import { SitemapRoute } from '@/utils/routes';

// Mirrors the backend's createCouponSchema/updateCouponSchema (Joi) in
// utils/validationSchemas/couponSchema.js, including the cross-field rule
// that a PERCENT discount can't exceed 100 (the backend's
// `discountValueCheck` validator )

const couponSchema = Yup.object({
  code: Yup.string().trim().uppercase().required('Coupon code is required'),
  discountType: Yup.string().oneOf(['PERCENT', 'FLAT']).required('Discount type is required'),
  discountValue: Yup.number()
    .typeError('Enter a number')
    .positive('Must be greater than 0')
    .when('discountType', {
      is: 'PERCENT',
      then: (schema) => schema.max(100, 'A percent discount cannot exceed 100'),
    })
    .required('Discount value is required'),
  maxUses: Yup.number()
    .typeError('Enter a number')
    .integer('Must be a whole number')
    .min(1, 'Must be at least 1')
    .required('Max uses is required'),
  perUserLimit: Yup.number()
    .typeError('Enter a number')
    .integer('Must be a whole number')
    .min(1, 'Must be at least 1')
    .required('Per-user limit is required'),
  expiresAt: Yup.date().typeError('Enter a valid date').required('Expiry date is required'),
});

const emptyValues = {
  code: '',
  discountType: 'PERCENT',
  discountValue: '',
  maxUses: '',
  perUserLimit: '1',
  expiresAt: '',
};

// One page handles both "new" (no :id param) and "edit" (:id present) —
export const CouponFormPage = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const { data: existingCoupon, isLoading, isError, error, refetch } = useCouponQuery(id);
  const createMutation = useCreateCouponMutation();
  const updateMutation = useUpdateCouponMutation();

  if (isEditMode && isLoading) return <LoadingState label="Loading coupon…" />;
  if (isEditMode && isError) return <ErrorState error={error} onRetry={refetch} />;

  const initialValues = isEditMode
    ? {
        code: existingCoupon.code || '',
        discountType: existingCoupon.discountType || 'PERCENT',
        discountValue: existingCoupon.discountValue ?? '',
        maxUses: existingCoupon.maxUses ?? '',
        perUserLimit: existingCoupon.perUserLimit ?? '1',
        expiresAt: existingCoupon.expiresAt ? existingCoupon.expiresAt.slice(0, 10) : '',
      }
    : emptyValues;

  const handleSubmit = (values, { setErrors, setSubmitting }) => {
    const payload = {
      ...values,
      code: values.code.trim().toUpperCase(),
      discountValue: Number(values.discountValue),
      maxUses: Number(values.maxUses),
      perUserLimit: Number(values.perUserLimit),
      expiresAt: new Date(values.expiresAt).toISOString(),
    };

    const mutation = isEditMode ? updateMutation : createMutation;
    const mutationArgs = isEditMode ? { id, payload } : payload;

    mutation.mutate(mutationArgs, {
      onSuccess: () => {
        toast.success(isEditMode ? 'Coupon updated' : 'Coupon created');
        navigate(SitemapRoute.ADMIN_COUPONS);
      },
      onError: (err) => {
        toast.error(extractApiErrorMessage(err));
        setErrors(extractApiErrors(err));
        setSubmitting(false);
      },
    });
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-xl font-semibold">
        {isEditMode ? `Edit ${initialValues.code}` : 'New coupon'}
      </h1>

      <Formik
        initialValues={initialValues}
        validationSchema={couponSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, isValid, dirty, values }) => (
          <Form className="flex flex-col gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <div>
              <label htmlFor="code" className="mb-1 block text-sm font-medium">
                Coupon code
              </label>
              <Field
                id="code"
                name="code"
                type="text"
                placeholder="SAVE10"
                disabled={isEditMode}
                className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm uppercase outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
              />
              <ErrorMessage name="code" component="p" className="mt-1 text-xs text-[var(--color-danger)]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="discountType" className="mb-1 block text-sm font-medium">
                  Discount type
                </label>
                <Field
                  as="select"
                  id="discountType"
                  name="discountType"
                  className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
                >
                  <option value="PERCENT">Percent</option>
                  <option value="FLAT">Flat</option>
                </Field>
                <ErrorMessage name="discountType" component="p" className="mt-1 text-xs text-[var(--color-danger)]" />
              </div>

              <div>
                <label htmlFor="discountValue" className="mb-1 block text-sm font-medium">
                  {values.discountType === 'PERCENT' ? 'Percent off' : 'Amount off (₹)'}
                </label>
                <Field
                  id="discountValue"
                  name="discountValue"
                  type="number"
                  step="0.01"
                  className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                />
                <ErrorMessage name="discountValue" component="p" className="mt-1 text-xs text-[var(--color-danger)]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="maxUses" className="mb-1 block text-sm font-medium">
                  Max total uses
                </label>
                <Field
                  id="maxUses"
                  name="maxUses"
                  type="number"
                  className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                />
                <ErrorMessage name="maxUses" component="p" className="mt-1 text-xs text-[var(--color-danger)]" />
              </div>

              <div>
                <label htmlFor="perUserLimit" className="mb-1 block text-sm font-medium">
                  Per-user limit
                </label>
                <Field
                  id="perUserLimit"
                  name="perUserLimit"
                  type="number"
                  className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                />
                <ErrorMessage name="perUserLimit" component="p" className="mt-1 text-xs text-[var(--color-danger)]" />
              </div>
            </div>

            <div>
              <label htmlFor="expiresAt" className="mb-1 block text-sm font-medium">
                Expires on
              </label>
              <Field
                id="expiresAt"
                name="expiresAt"
                type="date"
                className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
              />
              <ErrorMessage name="expiresAt" component="p" className="mt-1 text-xs text-[var(--color-danger)]" />
            </div>

            <div className="mt-2 flex gap-3">
              <button
                type="submit"
                disabled={!isValid || !dirty || isSubmitting}
                className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {isSubmitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Create coupon'}
              </button>
              <button
                type="button"
                onClick={() => navigate(SitemapRoute.ADMIN_COUPONS)}
                className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
