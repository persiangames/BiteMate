export {
  buildMeetupNotes,
  parseMeetupNotes,
  type MeetupCreatorKind,
  type MeetupEventMeta,
} from '@bitemate/shared';

import type { ProfileInterest } from '@bitemate/shared';
import { buildMeetupNotes as buildNotes, type MeetupCreatorKind } from '@bitemate/shared';

export type HomeChefServiceMode = 'DINE_AT_HOME' | 'PICKUP' | 'DELIVERY' | 'PUBLIC_MEETUP';
export type VenueEventStyle = 'GROUP_DINING' | 'TASTING' | 'SPECIAL_MENU' | 'POPUP';
export type ReviewerEventStyle = 'REVIEW_NIGHT' | 'TASTING_TOUR' | 'COLLAB_MEAL';

const VENUE_ROLES = ['RESTAURANT_OWNER', 'CAFE_OWNER', 'FOOD_TRUCK_OWNER'] as const;

export function resolveMeetupCreatorKind(role: string | null | undefined): MeetupCreatorKind {
  if (!role) {
    return 'DINER';
  }
  if (VENUE_ROLES.includes(role as (typeof VENUE_ROLES)[number])) {
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

export interface MeetupComposerMeta {
  creatorKind: MeetupCreatorKind;
  preferredInterests: ProfileInterest[];
  venueEventStyle?: VenueEventStyle;
  homeChefServiceMode?: HomeChefServiceMode;
  reviewerEventStyle?: ReviewerEventStyle;
  venueSpace?: 'PUBLIC' | 'PRIVATE' | 'HOME';
}

export function buildMeetupComposerNotes(description: string, meta: MeetupComposerMeta): string {
  return buildNotes(description, {
    creatorKind: meta.creatorKind,
    venueEventStyle: meta.venueEventStyle,
    homeChefServiceMode: meta.homeChefServiceMode,
    reviewerEventStyle: meta.reviewerEventStyle,
    venueSpace: meta.venueSpace,
  });
}

export function creatorKindLabelKey(kind: MeetupCreatorKind): string {
  return `event.creatorKind.${kind}`;
}
