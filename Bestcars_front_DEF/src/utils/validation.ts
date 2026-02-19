
export function validatePhone(phone: string): boolean {
  if (!phone || phone.trim() === '') {
    return true; // Phone is optional
  }

  // Remove all whitespace, dashes, parentheses, and dots for validation
  const cleaned = phone.replace(/[\s\-().]/g, '');

  // Must start with + (international) or be a digit
  if (!/^\+?\d+$/.test(cleaned)) {
    return false;
  }

  // Must be between 7 and 15 digits (international standard)
  const digitsOnly = cleaned.replace(/^\+/, '');
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return false;
  }

  return true;
}

/**
 * Get phone validation error message
 */
export function getPhoneErrorMessage(phone: string): string | null {
  if (!phone || phone.trim() === '') {
    return null; // Phone is optional
  }

  if (!validatePhone(phone)) {
    return 'Formato de teléfono inválido. Use formato internacional (ej: +34 600 000 000)';
  }

  return null;
}
