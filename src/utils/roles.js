// Mirrors the backend's USER_ROLES (models/userModel.js) so the frontend
// never hardcodes the strings "admin"/"customer" in more than one place.
export const UserRole = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
};
