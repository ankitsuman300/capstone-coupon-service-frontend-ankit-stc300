// Decodes a JWT's payload WITHOUT verifying its signature. This is safe
// here because it's used only for UI decisions (which nav links to show,
// which route guard to apply) — never as a security boundary. The real
// enforcement always happens server-side (middlewares/auth.js's
// verifyToken + requireRole), which DOES verify the signature. A user
// could hand-edit this decoded payload in devtools and it would change
// nothing about what the backend actually lets them do.
export const decodeJwtPayload = (token) => {
  try {
    const [, payload] = token.split('.');
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
};
