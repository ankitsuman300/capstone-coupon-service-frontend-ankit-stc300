import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useRedeemMutation } from '@/hooks/useRedemptions';
import { extractApiErrors, extractApiErrorMessage } from '@/utils/apiError';

// Mirrors the backend's redeemCouponSchema (Joi) in
// utils/validationSchemas/redemptionSchema.js.
const redeemSchema = Yup.object({
  code: Yup.string().trim().required('Coupon code is required'),
  orderId: Yup.string().required('Order id is required'),
  orderAmount: Yup.number()
    .typeError('Enter a number')
    .min(0, 'Must be 0 or more')
    .required('Order amount is required'),
});

const initialValues = { code: '', orderId: '', orderAmount: '' };

export const RedeemPage = () => {
  const mutation = useRedeemMutation();
  // Same shape as login's success handling, but redemption has a genuine
  // success PAYLOAD worth rendering in place (per the Forms doc: "Login
  // redirects and you're done. Redemption gives you back a discount amount
  // and a finalAmount — the mutation's onSuccess updates the UI in place
  // instead of navigating away").
  const [result, setResult] = useState(null);

  const handleSubmit = (values, { setErrors, setSubmitting, resetForm }) => {
    mutation.mutate(
      { ...values, orderAmount: Number(values.orderAmount) },
      {
        onSuccess: (redemption) => {
          setResult(redemption);
          toast.success('Coupon redeemed!');
          resetForm();
        },
        onError: (error) => {
          // Redemption has several distinct failure modes (expired, already
          // used, per-user cap, invalid) — all arrive in the same
          // AppError.errors[] shape, so the same extractApiErrors handles
          // them uniformly. None of them map to a specific FORM FIELD on
          // this schema (they're about the coupon's state, not a typo in
          // what the user typed), so this shows as a toast rather than an
          // inline field error.
          toast.error(extractApiErrorMessage(error));
          setErrors(extractApiErrors(error));
          setSubmitting(false);
        },
      }
    );
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-xl font-semibold">Redeem a coupon</h1>

      <Formik
        initialValues={initialValues}
        validationSchema={redeemSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, isValid, dirty }) => (
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
                className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm uppercase outline-none focus:border-[var(--color-primary)]"
              />
              <ErrorMessage name="code" component="p" className="mt-1 text-xs text-[var(--color-danger)]" />
            </div>

            <div>
              <label htmlFor="orderId" className="mb-1 block text-sm font-medium">
                Order id
              </label>
              <Field
                id="orderId"
                name="orderId"
                type="text"
                placeholder="A stable id — reuse it if you retry"
                className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
              />
              <ErrorMessage name="orderId" component="p" className="mt-1 text-xs text-[var(--color-danger)]" />
            </div>

            <div>
              <label htmlFor="orderAmount" className="mb-1 block text-sm font-medium">
                Order amount
              </label>
              <Field
                id="orderAmount"
                name="orderAmount"
                type="number"
                step="0.01"
                className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
              />
              <ErrorMessage name="orderAmount" component="p" className="mt-1 text-xs text-[var(--color-danger)]" />
            </div>

            <button
              type="submit"
              disabled={!isValid || !dirty || isSubmitting}
              className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isSubmitting ? 'Redeeming…' : 'Redeem'}
            </button>
          </Form>
        )}
      </Formik>

      {result && (
        <div className="mt-4 rounded-lg border border-[var(--color-success)]/30 bg-[var(--color-success-bg)] p-4">
          <p className="font-medium text-[var(--color-success)]">Discount applied</p>
          <dl className="mt-2 grid grid-cols-2 gap-y-1 text-sm">
            <dt className="text-[var(--color-text-muted)]">Order amount</dt>
            <dd className="text-right">₹{result.orderAmount}</dd>
            <dt className="text-[var(--color-text-muted)]">Discount</dt>
            <dd className="text-right">−₹{result.discountAmount}</dd>
            <dt className="font-medium">You pay</dt>
            <dd className="text-right font-medium">₹{result.finalAmount}</dd>
          </dl>
        </div>
      )}
    </div>
  );
};
