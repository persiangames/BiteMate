"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapUserToAuthDto = mapUserToAuthDto;
function mapUserToAuthDto(user) {
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
        profileImage: user.profileImage,
        coverImage: user.coverImage,
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
        preferredMeals: (user.preferredMeals ?? []),
        favoriteCuisines: user.favoriteCuisines ?? [],
        favoriteFoods: user.favoriteFoods ?? [],
        lookingToEat: user.lookingToEat ?? false,
    };
}
//# sourceMappingURL=user.mapper.js.map