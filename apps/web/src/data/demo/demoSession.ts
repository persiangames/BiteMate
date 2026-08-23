import type { AuthResponseDto, AuthUserDto } from '@bitemate/shared';

export const DEMO_ACCESS_TOKEN = 'demo.admin.access';
export const DEMO_REFRESH_TOKEN = 'demo.admin.refresh';

export function isDemoAdminLogin(identifier: string, password: string): boolean {
  const value = identifier.trim().toLowerCase();
  return (
    password === 'admin' &&
    (value === 'admin' || value === 'admin@bitemate.app' || value === '+00000000000')
  );
}

export function isDemoAccessToken(token: string | null | undefined): boolean {
  return token === DEMO_ACCESS_TOKEN;
}

export function createDemoAdminSession(locale: AuthUserDto['locale']): AuthResponseDto {
  const user: AuthUserDto = {
    id: 'demo-admin',
    email: 'admin@bitemate.app',
    phoneNumber: '+00000000000',
    fullName: 'BiteMate Admin',
    username: 'admin',
    bio: 'Platform administrator',
    country: null,
    city: null,
    dateOfBirth: null,
    role: 'PLATFORM_ADMIN',
    profileImage: '/brand/icon-64.png',
    coverImage: null,
    locale,
    authProvider: 'EMAIL',
    emailVerified: true,
    phoneVerified: true,
    otpVerified: true,
    liveLocationEnabled: false,
    invisibleMode: false,
    availabilityStatus: 'AVAILABLE',
    liveLatitude: null,
    liveLongitude: null,
    lastLiveLocationAt: null,
    totpEnabled: false,
    themePreference: 'light',
    followerCount: 0,
    followingCount: 0,
    gender: null,
    education: null,
    preferredMeals: [],
    favoriteCuisines: [],
    favoriteFoods: [],
    lookingToEat: false,
  };

  return {
    user,
    tokens: {
      accessToken: DEMO_ACCESS_TOKEN,
      refreshToken: DEMO_REFRESH_TOKEN,
      expiresIn: 60 * 60 * 24,
    },
  };
}
