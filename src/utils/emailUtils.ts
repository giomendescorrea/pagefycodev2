/**
 * Normaliza um email para lowercase e remove espaços
 * Esta função deve ser usada em TODOS os lugares onde emails são processados
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Valida se um email tem formato válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
