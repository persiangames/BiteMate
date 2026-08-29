import type {
  FeedSourceType,
  PostDto,
  PostMeetupSummaryDto,
  PostTagDto,
  PostTagRole,
} from '@bitemate/shared';
import { parseMeetupNotes } from '@bitemate/shared';
import type { FoodMeetup, Post, PostTag, User } from '@prisma/client';
import { meetupCapacity } from '../../common/dining';
import { normalizeStoredMediaPath } from '../../common/media-url';

const AUTHOR_SELECT = {
  id: true,
  username: true,
  fullName: true,
  profileImage: true,
} as const;

export const POST_INCLUDE = {
  author: { select: AUTHOR_SELECT },
  tags: {
    include: {
      user: { select: AUTHOR_SELECT },
    },
  },
  meetup: true,
};

type TaggedUser = Pick<User, 'id' | 'username' | 'fullName' | 'profileImage'>;

type PostWithRelations = Post & {
  author: TaggedUser;
  tags?: Array<PostTag & { user: TaggedUser }>;
  meetup?: FoodMeetup | null;
};

export function mapPostTags(tags: Array<PostTag & { user: TaggedUser }> | undefined): PostTagDto[] {
  return (tags ?? []).map((tag) => ({
    userId: tag.user.id,
    username: tag.user.username,
    fullName: tag.user.fullName,
    profileImage: tag.user.profileImage,
    role: tag.role as PostTagRole,
  }));
}

function resolvePreferredInterests(meetup: FoodMeetup): string[] {
  if (meetup.preferredInterests.length > 0) {
    return meetup.preferredInterests;
  }

  return parseMeetupNotes(meetup.notes).meta.preferredInterests ?? [];
}

export function mapPostMeetupSummary(
  meetup: FoodMeetup,
  acceptedCount = 0,
): PostMeetupSummaryDto {
  const capacity = meetupCapacity(meetup.desiredPeople, acceptedCount);
  const isFull = meetup.status === 'FULL' || capacity.isFull;

  return {
    id: meetup.id,
    foodType: meetup.foodType,
    foodName: meetup.foodName,
    scheduledAt: meetup.scheduledAt.toISOString(),
    locationLabel: meetup.locationLabel,
    city: meetup.city,
    country: meetup.country,
    mealSlot: meetup.mealSlot,
    desiredPeople: meetup.desiredPeople,
    seatsLeft: isFull ? 0 : capacity.seatsLeft,
    isFull,
    status: isFull ? 'FULL' : meetup.status,
    preferredInterests: resolvePreferredInterests(meetup),
  };
}

export function buildMeetupFeedCaption(meetup: Pick<FoodMeetup, 'foodType' | 'foodName' | 'notes'>): string {
  const { description } = parseMeetupNotes(meetup.notes);
  const headline = meetup.foodName?.trim() || meetup.foodType.trim();
  if (description) {
    return `${headline} — ${description}`.slice(0, 500);
  }
  return headline.slice(0, 500);
}

export function mapPostToDto(
  post: PostWithRelations,
  options: {
    feedSource: FeedSourceType;
    isLiked: boolean;
    isFollowingAuthor: boolean;
    meetupAcceptedCount?: number;
  },
): PostDto {
  return {
    id: post.id,
    caption: post.caption,
    mediaType: post.mediaType,
    mediaUrl: normalizeStoredMediaPath(post.mediaUrl) ?? post.mediaUrl,
    thumbnailUrl: normalizeStoredMediaPath(post.thumbnailUrl),
    restaurantTag: post.restaurantTag,
    tags: mapPostTags(post.tags),
    locationLabel: post.locationLabel,
    locationLat: post.locationLat,
    locationLng: post.locationLng,
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    shareCount: post.shareCount,
    feedSource: options.feedSource,
    isLiked: options.isLiked,
    isFollowingAuthor: options.isFollowingAuthor,
    meetup: post.meetup
      ? mapPostMeetupSummary(post.meetup, options.meetupAcceptedCount ?? 0)
      : null,
    author: {
      id: post.author.id,
      username: post.author.username,
      fullName: post.author.fullName,
      profileImage: post.author.profileImage,
    },
    createdAt: post.createdAt.toISOString(),
  };
}

export async function loadMeetupAcceptedCounts(
  prisma: {
    meetupInvite: {
      groupBy: (args: {
        by: ['meetupId'];
        where: { meetupId: { in: string[] }; status: 'ACCEPTED' };
        _count: { _all: true };
      }) => Promise<Array<{ meetupId: string; _count: { _all: number } }>>;
    };
  },
  meetupIds: string[],
): Promise<Map<string, number>> {
  if (!meetupIds.length) {
    return new Map();
  }

  const rows = await prisma.meetupInvite.groupBy({
    by: ['meetupId'],
    where: { meetupId: { in: meetupIds }, status: 'ACCEPTED' },
    _count: { _all: true },
  });

  return new Map(rows.map((row) => [row.meetupId, row._count._all]));
}
