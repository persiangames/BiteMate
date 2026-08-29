import { ageFromDateOfBirth } from '../types/dining.types';

export interface MeetupPreferenceTarget {
  preferredGender?: string | null;
  ageMin?: number | null;
  ageMax?: number | null;
  preferredEducation?: string | null;
  preferredInterests?: string[] | null;
}

export interface MeetupParticipantProfile {
  gender?: string | null;
  dateOfBirth?: string | Date | null;
  education?: string | null;
  interests?: string[] | null;
}

export function userMatchesMeetupPreferences(
  profile: MeetupParticipantProfile,
  prefs: MeetupPreferenceTarget,
): boolean {
  if (prefs.preferredGender && profile.gender && prefs.preferredGender !== profile.gender) {
    return false;
  }

  const age = ageFromDateOfBirth(profile.dateOfBirth ?? null);
  if (age != null) {
    if (prefs.ageMin != null && age < prefs.ageMin) {
      return false;
    }
    if (prefs.ageMax != null && age > prefs.ageMax) {
      return false;
    }
  }

  if (prefs.preferredEducation && profile.education && prefs.preferredEducation !== profile.education) {
    return false;
  }

  const requiredInterests = prefs.preferredInterests?.filter(Boolean) ?? [];
  if (requiredInterests.length > 0) {
    const userInterests = profile.interests ?? [];
    const overlap = requiredInterests.some((interest) => userInterests.includes(interest));
    if (!overlap) {
      return false;
    }
  }

  return true;
}

export function interestOverlapScore(required: string[], userInterests: string[]): number {
  if (!required.length) {
    return 0.5;
  }
  if (!userInterests.length) {
    return 0;
  }

  const overlap = required.filter((interest) => userInterests.includes(interest)).length;
  return overlap / required.length;
}
