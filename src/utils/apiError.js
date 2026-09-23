// The backend's globalErrorHandler always shapes errors as
// { responseCode, status, statusCode, errors: [{ field, message }] }.
//array into { fieldName: message } map 

export const extractApiErrors = (error) => {
  const errors = error?.response?.data?.errors;
  if (!Array.isArray(errors)) return {};
  return errors.reduce((acc, e) => {
    if (e.field) acc[e.field] = e.message;
    return acc;
  }, {});
};

// A single human-readable line for toasts, where there's no form field to
// pin the message next to. Falls back gracefully if the response doesn't
// match the expected shape (network error, unreachable backend, etc).
export const extractApiErrorMessage = (error) => {
  const errors = error?.response?.data?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    return errors.map((e) => e.message).join(', ');
  }
  return error?.response?.data?.message || error?.message || 'Something went wrong';
};
