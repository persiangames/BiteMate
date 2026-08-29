export const MEDIA_TYPES = ['IMAGE', 'VIDEO'] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const POST_TAG_ROLES = [
  'RESTAURANT',
  'CHEF',
  'HOST',
  'GUEST',
  'COMPANION',
  'INFLUENCER',
  'REVIEWER',
  'OWNER',
  'HOME_CHEF',
] as const;
export type PostTagRole = (typeof POST_TAG_ROLES)[number];

export interface PostTagDto {
  userId: string;
  username: string | null;
  fullName: string | null;
  profileImage: string | null;
  role: PostTagRole;
}

export interface CreatePostTagDto {
  userId: string;
  role: PostTagRole;
}

export const FEED_SOURCE_TYPES = ['FOLLOWING', 'NEARBY', 'TRENDING'] as const;
export type FeedSourceType = (typeof FEED_SOURCE_TYPES)[number];

export interface PostAuthorDto {
  id: string;
  username: string | null;
  fullName: string | null;
  profileImage: string | null;
}

export interface PostMeetupSummaryDto {
  id: string;
  foodType: string;
  foodName: string | null;
  scheduledAt: string;
  locationLabel: string | null;
  city: string | null;
  country: string | null;
  mealSlot: string | null;
  desiredPeople: number;
  seatsLeft: number;
  isFull: boolean;
  status: string;
  preferredInterests: string[];
}

export interface PostDto {
  id: string;
  caption: string | null;
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl: string | null;
  restaurantTag: string | null;
  tags: PostTagDto[];
  locationLabel: string | null;
  locationLat: number | null;
  locationLng: number | null;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  feedSource: FeedSourceType;
  isLiked: boolean;
  isFollowingAuthor: boolean;
  author: PostAuthorDto;
  meetup?: PostMeetupSummaryDto | null;
  createdAt: string;
}

export interface FeedResponseDto {
  items: PostDto[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CreatePostRequestDto {
  caption?: string;
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl?: string;
  restaurantTag?: string;
  tags?: CreatePostTagDto[];
  locationLabel?: string;
  locationLat?: number;
  locationLng?: number;
}

export interface UpdatePostRequestDto {
  caption?: string;
}

export interface CommentDto {
  id: string;
  content: string;
  createdAt: string;
  author: PostAuthorDto;
}

export interface CommentsResponseDto {
  items: CommentDto[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CreateCommentRequestDto {
  content: string;
}

export interface LikeResponseDto {
  liked: boolean;
  likeCount: number;
}

export interface ShareResponseDto {
  shareCount: number;
  shareUrl: string;
}

export interface FollowResponseDto {
  following: boolean;
  followerCount: number;
}

export interface FollowListItemDto {
  id: string;
  username: string | null;
  fullName: string | null;
  profileImage: string | null;
  isFollowing: boolean;
}

export interface FollowListResponseDto {
  items: FollowListItemDto[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface MediaUploadResponseDto {
  mediaUrl: string;
  thumbnailUrl: string | null;
  mediaType: MediaType;
}
