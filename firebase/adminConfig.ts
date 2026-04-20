export const ADMIN_EMAILS = [
  "admin@admin.com",
  "admin@moversconnect.com",
  "beastkee@example.com",
];

export const isAdminEmail = (email?: string | null) => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(normalized);
};
