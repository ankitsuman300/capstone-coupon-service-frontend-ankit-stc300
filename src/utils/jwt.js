// Decodes a JWT's payload WITHOUT verifying its signature

export const decodeJwtPayload = (token) => {
  try {
    const [, payload] = token.split('.');
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
};
