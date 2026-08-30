import type { User } from '@prisma/client';
import type { AuthUserDto, ProfileInterest } from '@bitemate/shared';
import { computeProfileCompletion } from '@bitemate/shared';
import type { MediaUrlResolver } from '../../../common/media-url';
import { normalizeStoredMediaPath } from '../../../common/media-url';

export interface AuthUserCompletionContext {
  hasRestaurantListing?: boolean;
  hasHomeChefProfile?: boolean;
  hasHomeChefMenu?: boolean;
}

export function mapUserToAuthDto(
  user: User,
  completionContext: AuthUserCompletionContext = {},
  resolveMedia: MediaUrlResolver = (url) => normalizeStoredMediaPath(url),
): AuthUserDto {
  const completion = computeProfileCompletion({
    role: user.role,
    fullName: user.fullName,
    username: user.username,
    bio: user.bio,
    profileImage: user.profileImage,
    coverImage: user.coverImage,
    country: user.country,
    city: user.city,
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().slice(0, 10) : null,
    gender: user.gender,
    education: user.education,
    preferredMeals: (user.preferredMeals ?? []) as AuthUserDto['preferredMeals'],
    favoriteCuisines: user.favoriteCuisines ?? [],
    favoriteFoods: user.favoriteFoods ?? [],
    interests: (user.interests ?? []) as ProfileInterest[],
    relationshipStatus: user.relationshipStatus,
    hasChildren: user.hasChildren,
    liveLocationEnabled: user.liveLocationEnabled,
    liveLatitude: user.liveLatitude,
    liveLongitude: user.liveLongitude,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    otpVerified: user.otpVerified,
    hasRestaurantListing: completionContext.hasRestaurantListing,
    hasHomeChefProfile: completionContext.hasHomeChefProfile,
    hasHomeChefMenu: completionContext.hasHomeChefMenu,
  });

  return {
    id: user.id,
    email: user.email,
    phoneNumber: user.phoneNumber,
    fullName: user.fullName,
    username: user.username,
    bio: user.bio,
    country: user.country,
    city: user.city,
    dateOfBirth: user.dateOfBirth
      ? user.dateOfBirth.toISOString().slice(0, 10)
      : null,
    role: user.role,
    profileImage: resolveMedia(user.profileImage),
    coverImage: resolveMedia(user.coverImage),
    locale: user.locale,
    authProvider: user.authProvider,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    otpVerified: user.otpVerified,
    liveLocationEnabled: user.liveLocationEnabled,
    invisibleMode: user.invisibleMode,
    availabilityStatus: user.availabilityStatus,
    liveLatitude: user.liveLatitude,
    liveLongitude: user.liveLongitude,
    lastLiveLocationAt: user.lastLiveLocationAt
      ? user.lastLiveLocationAt.toISOString()
      : null,
    totpEnabled: user.totpEnabled,
    themePreference: user.themePreference,
    followerCount: user.followerCount,
    followingCount: user.followingCount,
    gender: user.gender,
    education: user.education,
    preferredMeals: (user.preferredMeals ?? []) as AuthUserDto['preferredMeals'],
    favoriteCuisines: user.favoriteCuisines ?? [],
    favoriteFoods: user.favoriteFoods ?? [],
    lookingToEat: user.lookingToEat ?? false,
    interests: (user.interests ?? []) as ProfileInterest[],
    relationshipStatus: user.relationshipStatus,
    hasChildren: user.hasChildren,
    profileCompletionPercent: completion.percent,
  };
}
