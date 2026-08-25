import type {
  AuthResponseDto,
  AuthUserDto,
  FirebaseAuthRequestDto,
  OtpRequestResponseDto,
  RegisterRequestDto,
  SupportedLocale,
  UpdateProfileRequestDto,
  VerifyOtpRequestDto,
} from '@bitemate/shared';
import { apiFetch, authHeaders } from '@/data/api/client';

export async function registerUser(
  payload: RegisterRequestDto,
): Promise<AuthResponseDto> {
  return apiFetch<AuthResponseDto>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginUser(
  payload: { identifier: string; password: string; locale?: SupportedLocale },
): Promise<AuthResponseDto> {
  return apiFetch<AuthResponseDto>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyTwoFactorLogin(
  payload: { challengeToken: string; code: string },
): Promise<AuthResponseDto> {
  return apiFetch<AuthResponseDto>('/auth/2fa/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function firebaseLogin(
  payload: FirebaseAuthRequestDto,
): Promise<AuthResponseDto> {
  return apiFetch<AuthResponseDto>('/auth/firebase', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function requestOtp(
  accessToken: string,
  destination: string,
): Promise<OtpRequestResponseDto> {
  const body = destination.includes('@')
    ? { email: destination }
    : { phoneNumber: destination };
  return apiFetch<OtpRequestResponseDto>('/auth/otp/request', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(body),
  });
}

export async function verifyOtp(
  accessToken: string,
  payload: VerifyOtpRequestDto,
): Promise<AuthResponseDto> {
  return apiFetch<AuthResponseDto>('/auth/otp/verify', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function getProfile(accessToken: string) {
  return apiFetch('/users/me', {
    headers: authHeaders(accessToken),
  });
}

export async function updateProfile(
  accessToken: string,
  payload: UpdateProfileRequestDto,
) {
  return apiFetch('/users/me', {
    method: 'PATCH',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function updateLocale(
  accessToken: string,
  locale: SupportedLocale,
): Promise<AuthUserDto> {
  return apiFetch<AuthUserDto>('/users/me/locale', {
    method: 'PATCH',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ locale }),
  });
}

export async function logoutUser(refreshToken: string) {
  return apiFetch('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export async function forgotPassword(identifier: string) {
  return apiFetch<{ message: string }>('/auth/password/forgot', {
    method: 'POST',
    body: JSON.stringify({ identifier }),
  });
}

export async function resetPassword(payload: {
  identifier: string;
  code: string;
  newPassword: string;
}) {
  return apiFetch<{ message: string }>('/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function requestLoginOtp(destination: string) {
  return apiFetch<OtpRequestResponseDto>('/auth/otp/login/request', {
    method: 'POST',
    body: JSON.stringify({ destination }),
  });
}

export async function verifyLoginOtp(payload: {
  destination: string;
  code: string;
  locale?: SupportedLocale;
}) {
  return apiFetch<AuthResponseDto>('/auth/otp/login/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function checkUsernameAvailablePublic(username: string) {
  const search = new URLSearchParams({ username });
  return apiFetch<{ username: string; available: boolean }>(
    `/auth/username-available?${search.toString()}`,
  );
}
