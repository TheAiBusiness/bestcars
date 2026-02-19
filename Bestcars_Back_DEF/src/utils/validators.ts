/**
 * Utilidades de validación reutilizables para formularios y datos de entrada
 * Centraliza las reglas de validación para consistencia en toda la API
 */

/** Regex estándar para validación de email */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Longitud mínima y máxima para teléfono internacional (sin +) */
const PHONE_MIN_DIGITS = 7;
const PHONE_MAX_DIGITS = 15;

/** Regex para validar formato de teléfono (solo dígitos y + facultativo al inicio) */
const PHONE_REGEX = /^\+?\d+$/;

/**
 * Valida que un email tenga formato correcto
 * @param email - Email a validar
 * @returns true si el formato es válido
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Valida formato de teléfono internacional
 * Acepta: +34 600 000 000, 34600000000, 600000000
 * @param phone - Teléfono a validar (puede incluir espacios, guiones, paréntesis)
 * @returns Objeto con isValid y mensaje de error opcional
 */
export function validatePhone(phone: string): { isValid: boolean; error?: string } {
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

  if (!PHONE_REGEX.test(cleaned)) {
    return {
      isValid: false,
      error: 'Formato de teléfono inválido. Use formato internacional (ej: +34 600 000 000)',
    };
  }

  const digitsOnly = cleaned.replace(/^\+/, '');
  if (digitsOnly.length < PHONE_MIN_DIGITS || digitsOnly.length > PHONE_MAX_DIGITS) {
    return {
      isValid: false,
      error: `El teléfono debe tener entre ${PHONE_MIN_DIGITS} y ${PHONE_MAX_DIGITS} dígitos`,
    };
  }

  return { isValid: true };
}

/**
 * Genera un ID único para submissions (placeholder hasta usar DB)
 * Usa timestamp + random para reducir colisiones
 */
export function generateSubmissionId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
