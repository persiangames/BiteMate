import type { ProfileInterest, PublicUserRole } from '@bitemate/shared';

const VENUE_ROLES: PublicUserRole[] = ['RESTAURANT_OWNER', 'CAFE_OWNER', 'FOOD_TRUCK_OWNER'];

export type MeetupCreatorKind = 'VENUE' | 'HOME_CHEF' | 'REVIEWER' | 'COMPANION' | 'DINER';

export type HomeChefServiceMode = 'DINE_AT_HOME' | 'PICKUP' | 'DELIVERY' | 'PUBLIC_MEETUP';
export type VenueEventStyle = 'GROUP_DINING' | 'TASTING' | 'SPECIAL_MENU' | 'POPUP';
export type ReviewerEventStyle = 'REVIEW_NIGHT' | 'TASTING_TOUR' | 'COLLAB_MEAL';

export function resolveMeetupCreatorKind(role: string | null | undefined): MeetupCreatorKind {
  if (!role) {
    return 'DINER';
  }
  if (VENUE_ROLES.includes(role as PublicUserRole)) {
    return 'VENUE';
  }
  if (role === 'HOME_CHEF') {
    return 'HOME_CHEF';
  }
  if (role === 'FOOD_REVIEWER' || role === 'INFLUENCER') {
    return 'REVIEWER';
  }
  if (role === 'COMPANION_USER') {
    return 'COMPANION';
  }
  return 'DINER';
}

export interface MeetupEventMeta {
  creatorKind: MeetupCreatorKind;
  preferredInterests: ProfileInterest[];
  venueEventStyle?: VenueEventStyle;
  homeChefServiceMode?: HomeChefServiceMode;
  reviewerEventStyle?: ReviewerEventStyle;
  venueSpace?: 'PUBLIC' | 'PRIVATE' | 'HOME';
}

export function buildMeetupNotes(description: string, meta: MeetupEventMeta): string {
  const trimmed = description.trim();
  const payload = {
    v: 1,
    creatorKind: meta.creatorKind,
    preferredInterests: meta.preferredInterests,
    venueEventStyle: meta.venueEventStyle,
    homeChefServiceMode: meta.homeChefServiceMode,
    reviewerEventStyle: meta.reviewerEventStyle,
    venueSpace: meta.venueSpace,
  };

  const metaBlock = `\n---bitemate-meta---\n${JSON.stringify(payload)}`;
  const combined = trimmed ? `${trimmed}${metaBlock}` : metaBlock.trim();
  return combined.slice(0, 900);
}

export function creatorKindLabelKey(kind: MeetupCreatorKind): string {
  return `event.creatorKind.${kind}`;
}
