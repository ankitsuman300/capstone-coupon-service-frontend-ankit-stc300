import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import {
  useUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeactivateUserMutation,
} from '@/hooks/useUsers';
import { LoadingState, ErrorState, EmptyState, Pagination, ConfirmDialog } from '@/components';
import { extractApiErrors, extractApiErrorMessage } from '@/utils/apiError';
import { UserRole } from '@/utils/roles';

// Mirrors the backend's createUserSchema/updateUserSchema (Joi) in
// utils/validationSchemas/userSchema.js. Password is only required on
// create — an admin editing a user's role/status shouldn't be forced to
// re-type a password.
const buildUserSchema = (isEditMode) =>
  Yup.object({
    name: Yup.string().trim().required('Name is required'),
    email: Yup.string().email('Enter a valid email').required('Email is required'),
    phone: Yup.string()
      .matches(/^\d{10}$/, 'Enter a 10-digit phone number')
      .required('Phone is required'),
    password: isEditMode
      ? Yup.string().min(6, 'Minimum 6 characters')
      : Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
    role: Yup.string().oneOf([UserRole.ADMIN, UserRole.CUSTOMER]).required('Role is required'),
  });

const emptyValues = { name: '', email: '', phone: '', password: '', role: UserRole.CUSTOMER };

// A single form drawer handles both "create" and "edit" — same reasoning
// as CouponFormPage, just inlined here as a panel instead of a route,
// since the Brief only calls for a list + create/edit, not a dedicated
// per-user page.
const UserFormPanel = ({ editingUser, onDone }) => {
  const isEditMode = !!editingUser;
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();

  const initialValues = isEditMode
    ? {
        name: editingUser.name || '',
        email: editingUser.email || '',
        phone: editingUser.phone || '',
        password: '',
        role: editingUser.role || UserRole.CUSTOMER,
      }
    : emptyValues;

  const handleSubmit = (values, { setErrors, setSubmitting, resetForm }) => {
    const payload = { ...values };
    if (isEditMode && !payload.password) delete payload.password;

    const mutation = isEditMode ? updateMutation : createMutation;
    const mutationArgs = isEditMode ? { id: editingUser._id, payload } : payload;

    mutation.mutate(mutationArgs, {
      onSuccess: () => {
        toast.success(isEditMode ? 'User updated' : 'User created');
        resetForm();
        onDone();
      },
      onError: (err) => {
        toast.error(extractApiErrorMessage(err));
        setErrors(extractApiErrors(err));
        setSubmitting(false);
      },
    });
  };

  return (
    <div className="mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">{isEditMode ? `Edit ${editingUser.name}` : 'New user'}</h2>
        <button type="button" onClick={onDone} className="text-sm text-[var(--color-text-muted)] hover:underline">
          Close
        </button>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={buildUserSchema(isEditMode)}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, isValid, dirty }) => (
          <Form className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">Name</label>
              <Field id="name" name="name" type="text" className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" />
              <ErrorMessage name="name" component="p" className="mt-1 text-xs text-[var(--color-danger)]" />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
              <Field id="email" name="email" type="email" className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" />
              <ErrorMessage name="email" component="p" className="mt-1 text-xs text-[var(--color-danger)]" />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium">Phone</label>
              <Field id="phone" name="phone" type="text" className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" />
              <ErrorMessage name="phone" component="p" className="mt-1 text-xs text-[var(--color-danger)]" />
            </div>
            <div>
              <label htmlFor="role" className="mb-1 block text-sm font-medium">Role</label>
              <Field as="select" id="role" name="role" className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm">
                <option value={UserRole.CUSTOMER}>Customer</option>
                <option value={UserRole.ADMIN}>Admin</option>
              </Field>
              <ErrorMessage name="role" component="p" className="mt-1 text-xs text-[var(--color-danger)]" />
            </div>
            <div className="col-span-2">
              <label htmlFor="password" className="mb-1 block text-sm font-medium">
                {isEditMode ? 'New password (leave blank to keep current)' : 'Password'}
              </label>
              <Field id="password" name="password" type="password" className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" />
              <ErrorMessage name="password" component="p" className="mt-1 text-xs text-[var(--color-danger)]" />
            </div>

            <div className="col-span-2">
              <button
                type="submit"
                disabled={!isValid || !dirty || isSubmitting}
                className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {isSubmitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Create user'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export const UsersPage = () => {
  const [page, setPage] = useState(1);
  const [panelMode, setPanelMode] = useState(null); // null | 'new' | userObject
  const [pendingDeactivateId, setPendingDeactivateId] = useState(null);
  const limit = 10;

  const { data, isLoading, isError, error, refetch } = useUsersQuery({ page, limit });
  const deactivateMutation = useDeactivateUserMutation();

  const handleDeactivateConfirm = () => {
    deactivateMutation.mutate(pendingDeactivateId, {
      onSuccess: () => {
        toast.success('User deactivated');
        setPendingDeactivateId(null);
      },
      onError: (err) => {
        toast.error(extractApiErrorMessage(err));
        setPendingDeactivateId(null);
      },
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Users</h1>
        {!panelMode && (
          <button
            type="button"
            onClick={() => setPanelMode('new')}
            className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white"
          >
            New user
          </button>
        )}
      </div>

      {panelMode === 'new' && <UserFormPanel onDone={() => setPanelMode(null)} />}
      {panelMode && panelMode !== 'new' && (
        <UserFormPanel editingUser={panelMode} onDone={() => setPanelMode(null)} />
      )}

      {isLoading && <LoadingState label="Loading users…" />}
      {isError && <ErrorState error={error} onRetry={refetch} />}

      {!isLoading && !isError && (!data?.users || data.users.length === 0) && (
        <EmptyState title="No users yet" description="Create the first user to get started." />
      )}

      {!isLoading && !isError && data?.users?.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Phone</th>
                <th className="px-4 py-2 font-medium">Role</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((u) => (
                <tr key={u._id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.phone}</td>
                  <td className="px-4 py-2 capitalize">{u.role}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.isActive
                          ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
                          : 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setPanelMode(u)}
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        Edit
                      </button>
                      {u.isActive && (
                        <button
                          type="button"
                          onClick={() => setPendingDeactivateId(u._id)}
                          className="text-[var(--color-danger)] hover:underline"
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            limit={limit}
            totalCount={data.pagination?.totalCount || 0}
            onPageChange={setPage}
          />
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDeactivateId}
        title="Deactivate this user?"
        description="They won't be able to log in until reactivated."
        confirmLabel="Deactivate"
        danger
        onConfirm={handleDeactivateConfirm}
        onCancel={() => setPendingDeactivateId(null)}
      />
    </div>
  );
};
