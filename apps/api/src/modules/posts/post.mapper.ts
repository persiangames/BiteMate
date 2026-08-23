import type { FeedSourceType, PostDto, PostTagDto, PostTagRole } from '@bitemate/shared';
import type { Post, PostTag, User } from '@prisma/client';

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
};

type TaggedUser = Pick<User, 'id' | 'username' | 'fullName' | 'profileImage'>;

type PostWithRelations = Post & {
  author: TaggedUser;
  tags?: Array<PostTag & { user: TaggedUser }>;
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

export function mapPostToDto(
  post: PostWithRelations,
  options: {
    feedSource: FeedSourceType;
    isLiked: boolean;
    isFollowingAuthor: boolean;
  },
): PostDto {
  return {
    id: post.id,
    caption: post.caption,
    mediaType: post.mediaType,
    mediaUrl: post.mediaUrl,
    thumbnailUrl: post.thumbnailUrl,
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
    author: {
      id: post.author.id,
      username: post.author.username,
      fullName: post.author.fullName,
      profileImage: post.author.profileImage,
    },
    createdAt: post.createdAt.toISOString(),
  };
}
