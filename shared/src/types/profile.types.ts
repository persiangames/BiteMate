export const RELATIONSHIP_STATUSES = [
  'SINGLE',
  'IN_RELATIONSHIP',
  'MARRIED',
  'DIVORCED',
  'WIDOWED',
  'PREFER_NOT_TO_SAY',
] as const;

export type RelationshipStatus = (typeof RELATIONSHIP_STATUSES)[number];

export const PROFILE_INTERESTS = [
  'CINEMA',
  'SPORTS',
  'THEATER',
  'READING',
  'MUSIC',
  'TRAVEL',
  'COOKING',
  'FITNESS',
  'ART',
  'GAMING',
  'PHOTOGRAPHY',
  'DANCE',
  'HIKING',
  'YOGA',
  'PETS',
  'TECH',
  'FASHION',
  'FOODIE',
  'NIGHTLIFE',
  'NATURE',
  'FOOTBALL',
  'VOLUNTEERING',
  'WELLNESS',
  'STARTUPS',
] as const;

export type ProfileInterest = (typeof PROFILE_INTERESTS)[number];

export const MIN_PROFILE_COMPLETION_FOR_ACTIONS = 80;
export const MIN_PROFILE_COMPLETION_FOR_EVENTS = 70;
