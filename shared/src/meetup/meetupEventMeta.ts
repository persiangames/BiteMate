import type { ProfileInterest } from '../types/profile.types';

export type MeetupCreatorKind = 'VENUE' | 'HOME_CHEF' | 'REVIEWER' | 'COMPANION' | 'DINER';

export interface MeetupEventMeta {
  v?: number;
  creatorKind?: MeetupCreatorKind;
  preferredInterests?: ProfileInterest[];
  venueEventStyle?: string;
  homeChefServiceMode?: string;
  reviewerEventStyle?: string;
  venueSpace?: string;
}

const META_MARKER = '---bitemate-meta---';

export function parseMeetupNotes(notes: string | null | undefined): {
  description: string;
  meta: MeetupEventMeta;
} {
  if (!notes?.trim()) {
    return { description: '', meta: {} };
  }

  const markerIndex = notes.indexOf(META_MARKER);
  if (markerIndex < 0) {
    return { description: notes.trim(), meta: {} };
  }

  const description = notes.slice(0, markerIndex).trim();
  const rawMeta = notes.slice(markerIndex + META_MARKER.length).trim();

  try {
    const parsed = JSON.parse(rawMeta) as MeetupEventMeta;
    return { description, meta: parsed ?? {} };
  } catch {
    return { description: notes.trim(), meta: {} };
  }
}

export function buildMeetupNotes(description: string, meta: Omit<MeetupEventMeta, 'v'>): string {
  const trimmed = description.trim();
  const payload: MeetupEventMeta = {
    v: 1,
    ...meta,
  };

  const hasMeta = Object.keys(payload).some((key) => key !== 'v' && payload[key as keyof MeetupEventMeta] != null);
  if (!hasMeta) {
    return trimmed.slice(0, 900);
  }

  const metaBlock = `\n${META_MARKER}\n${JSON.stringify(payload)}`;
  const combined = trimmed ? `${trimmed}${metaBlock}` : metaBlock.trim();
  return combined.slice(0, 900);
}
