/** Username: 3–30 chars, letters, digits, underscore. */
export const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,30}$/;

/**
 * Password: 8–128 chars, at least one letter, one digit, one allowed symbol.
 * Matches common requirements for consumer apps (Instagram, WhatsApp, etc.).
 */
export const PASSWORD_PATTERN =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{}|;:'",.<>?/`~\\]).{8,128}$/;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const MIN_SIGNUP_AGE = 13;

export type PasswordIssue =
  | 'too_short'
  | 'too_long'
  | 'missing_letter'
  | 'missing_digit'
  | 'missing_symbol';

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidUsername(value: string): boolean {
  return USERNAME_PATTERN.test(normalizeUsername(value));
}

export function getPasswordIssues(password: string): PasswordIssue[] {
  const issues: PasswordIssue[] = [];
  if (password.length < PASSWORD_MIN_LENGTH) {
    issues.push('too_short');
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    issues.push('too_long');
  }
  if (!/[A-Za-z]/.test(password)) {
    issues.push('missing_letter');
  }
  if (!/\d/.test(password)) {
    issues.push('missing_digit');
  }
  if (!/[!@#$%^&*()_+\-=[\]{}|;:'",.<>?/`~\\]/.test(password)) {
    issues.push('missing_symbol');
  }
  return issues;
}

export function isValidPassword(password: string): boolean {
  return getPasswordIssues(password).length === 0;
}

/** Normalize Iranian/local phone input to E.164 when possible. */
export function normalizePhoneInput(value: string): string {
  const trimmed = value.trim().replace(/[\s\-()]/g, '');
  if (!trimmed) {
    return '';
  }
  if (trimmed.startsWith('+')) {
    return trimmed;
  }
  if (trimmed.startsWith('00')) {
    return `+${trimmed.slice(2)}`;
  }
  if (trimmed.startsWith('0') && trimmed.length >= 10) {
    return `+98${trimmed.slice(1)}`;
  }
  if (/^9\d{9}$/.test(trimmed)) {
    return `+98${trimmed}`;
  }
  return trimmed.startsWith('+') ? trimmed : `+${trimmed}`;
}

export const E164_PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;

export function isValidE164Phone(value: string): boolean {
  return E164_PHONE_PATTERN.test(normalizePhoneInput(value));
}

export function isOldEnough(dateOfBirth: string, minAge = MIN_SIGNUP_AGE): boolean {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) {
    return false;
  }
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age >= minAge;
}

/** Normalize login identifier (email, phone, or username) for consistent lookups. */
export function normalizeLoginIdentifier(identifier: string): string {
  const trimmed = identifier.trim();
  if (!trimmed) {
    return '';
  }
  if (trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }
  const compact = trimmed.replace(/[\s\-()]/g, '');
  if (/^\+?\d/.test(compact)) {
    return normalizePhoneInput(trimmed);
  }
  return trimmed.toLowerCase();
}
