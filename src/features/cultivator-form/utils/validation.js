// Validates standard 10-digit Indian mobile numbers starting with 6-9
export const validateIndianPhone = (phone) => {
  const regex = /^[6-9]\d{9}$/;
  return regex.test(phone);
};

// Basic email validation (optional field, but must be valid if typed)
export const validateEmail = (email) => {
  if (!email) return true;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};