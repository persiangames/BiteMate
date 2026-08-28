import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type {
  CommentDto,
  CommentsResponseDto,
  CreatePostRequestDto,
  FeedResponseDto,
  FeedSourceType,
  LikeResponseDto,
  PostDto,
  ShareResponseDto,
} from '@bitemate/shared';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { GamificationService } from '../growth/gamification.service';
import { GeoLocationService } from '../location/geo-location.service';
import { NotificationsService } from '../notifications/notifications.service';
import { mapPostToDto, POST_INCLUDE } from './post.mapper';
import { normalizeStoredMediaPath } from '../../common/media-url';
import {
  computeTrendingScore,
  FeedCursor,
  PaginationHelper,
} from './pagination.helper';

interface RankedCandidate {
  id: string;
  score: number;
  createdAt: Date;
  source: FeedSourceType;
}

@Injectable()
export class FeedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geoLocationService: GeoLocationService,
    private readonly paginationHelper: PaginationHelper,
  ) {}

  async getFeed(
    userId: string,
    cursorRaw?: string,
    limit = 20,
  ): Promise<FeedResponseDto> {
    const viewer = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!viewer) {
      throw new NotFoundException('User not found');
    }

    const cursor = this.paginationHelper.decodeCursor(cursorRaw);
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const followingRows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = followingRows.map((row) => row.followingId);

    let nearbyIds: string[] = [];
    if (viewer.liveLatitude != null && viewer.liveLongitude != null) {
      try {
        const nearbyUsers = await this.geoLocationService.findNearby({
          latitude: viewer.liveLatitude,
          longitude: viewer.liveLongitude,
          radiusKm: 50,
          excludeUserId: userId,
        });
        nearbyIds = nearbyUsers
          .map((user) => user.id)
          .filter((id) => !followingIds.includes(id));
      } catch {
        nearbyIds = [];
      }
    }

    const ownSince = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [ownPosts, followingPosts, nearbyPosts, trendingPosts] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          authorId: userId,
          createdAt: { gte: ownSince },
        },
        select: { id: true, createdAt: true, trendingScore: true },
        orderBy: { createdAt: 'desc' },
        take: 40,
      }),
      followingIds.length
        ? this.prisma.post.findMany({
            where: {
              authorId: { in: followingIds },
              createdAt: { gte: since },
            },
            select: { id: true, createdAt: true, trendingScore: true },
            orderBy: { createdAt: 'desc' },
            take: 80,
          })
        : Promise.resolve([]),
      nearbyIds.length
        ? this.prisma.post.findMany({
            where: {
              authorId: { in: nearbyIds },
              createdAt: { gte: since },
            },
            select: { id: true, createdAt: true, trendingScore: true },
            orderBy: { createdAt: 'desc' },
            take: 80,
          })
        : Promise.resolve([]),
      this.prisma.post.findMany({
        where: {
          createdAt: { gte: since },
          trendingScore: { gt: 0 },
        },
        select: { id: true, createdAt: true, trendingScore: true },
        orderBy: [{ trendingScore: 'desc' }, { createdAt: 'desc' }],
        take: 80,
      }),
    ]);

    let ranked = this.mergeCandidates([
      ...ownPosts.map((post) =>
        this.toCandidate(post.id, post.createdAt, post.trendingScore, 'FOLLOWING', 200),
      ),
      ...followingPosts.map((post) =>
        this.toCandidate(post.id, post.createdAt, post.trendingScore, 'FOLLOWING', 100),
      ),
      ...nearbyPosts.map((post) =>
        this.toCandidate(post.id, post.createdAt, post.trendingScore, 'NEARBY', 50),
      ),
      ...trendingPosts.map((post) =>
        this.toCandidate(post.id, post.createdAt, post.trendingScore, 'TRENDING', 30),
      ),
    ]);

    if (ranked.length === 0) {
      const fallback = await this.prisma.post.findMany({
        where: { authorId: userId },
        select: { id: true, createdAt: true, trendingScore: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      ranked = fallback.map((post) =>
        this.toCandidate(post.id, post.createdAt, post.trendingScore, 'FOLLOWING', 200),
      );
    }

    const filtered = cursor
      ? ranked.filter(
          (item) =>
            item.score < cursor.score ||
            (item.score === cursor.score &&
              (item.createdAt < new Date(cursor.createdAt) ||
                (item.createdAt.toISOString() === cursor.createdAt &&
                  item.id < cursor.id))),
        )
      : ranked;

    const pageCandidates = filtered.slice(0, limit + 1);
    const hasMore = pageCandidates.length > limit;
    const selected = hasMore ? pageCandidates.slice(0, limit) : pageCandidates;
    const postIds = selected.map((item) => item.id);
    const sourceMap = new Map(selected.map((item) => [item.id, item.source]));

    const posts = postIds.length
      ? await this.prisma.post.findMany({
          where: { id: { in: postIds } },
          include: POST_INCLUDE,
        })
      : [];

    const [likedRows, followingAuthorRows] = await Promise.all([
      this.prisma.postLike.findMany({
        where: { userId, postId: { in: postIds } },
        select: { postId: true },
      }),
      this.prisma.follow.findMany({
        where: { followerId: userId, followingId: { in: posts.map((p) => p.authorId) } },
        select: { followingId: true },
      }),
    ]);

    const likedSet = new Set(likedRows.map((row) => row.postId));
    const followingAuthorSet = new Set(followingAuthorRows.map((row) => row.followingId));
    const postMap = new Map(posts.map((post) => [post.id, post]));

    const items: PostDto[] = selected
      .map((candidate) => postMap.get(candidate.id))
      .filter((post): post is NonNullable<typeof post> => Boolean(post))
      .map((post) =>
        mapPostToDto(post, {
          feedSource: sourceMap.get(post.id) ?? 'TRENDING',
          isLiked: likedSet.has(post.id),
          isFollowingAuthor: followingAuthorSet.has(post.authorId),
        }),
      );

    const last = selected.at(-1);
    const nextCursor =
      hasMore && last
        ? this.paginationHelper.encodeCursor({
            score: last.score,
            createdAt: last.createdAt.toISOString(),
            id: last.id,
          })
        : null;

    return { items, nextCursor, hasMore };
  }

  private mergeCandidates(candidates: RankedCandidate[]): RankedCandidate[] {
    const map = new Map<string, RankedCandidate>();

    for (const candidate of candidates) {
      const existing = map.get(candidate.id);
      if (!existing || candidate.score > existing.score) {
        map.set(candidate.id, candidate);
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  private toCandidate(
    id: string,
    createdAt: Date,
    trendingScore: number,
    source: FeedSourceType,
    baseWeight: number,
  ): RankedCandidate {
    const recencyBoost = Math.max(
      0,
      20 - (Date.now() - createdAt.getTime()) / (1000 * 60 * 60),
    );
    return {
      id,
      createdAt,
      source,
      score: baseWeight + trendingScore + recencyBoost,
    };
  }
}

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationHelper: PaginationHelper,
    private readonly gamificationService: GamificationService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createPost(userId: string, dto: CreatePostRequestDto): Promise<PostDto> {
    const uniqueTags = this.normalizeTags(dto.tags);

    if (uniqueTags.length) {
      const found = await this.prisma.user.count({
        where: { id: { in: uniqueTags.map((tag) => tag.userId) }, isActive: true },
      });
      if (found !== uniqueTags.length) {
        throw new NotFoundException('One or more tagged people were not found');
      }
    }

    const post = await this.prisma.post.create({
      data: {
        authorId: userId,
        caption: dto.caption,
        mediaType: dto.mediaType,
        mediaUrl: normalizeStoredMediaPath(dto.mediaUrl) ?? dto.mediaUrl,
        thumbnailUrl: normalizeStoredMediaPath(dto.thumbnailUrl ?? null),
        restaurantTag: dto.restaurantTag,
        locationLabel: dto.locationLabel,
        locationLat: dto.locationLat,
        locationLng: dto.locationLng,
        tags: uniqueTags.length
          ? {
              create: uniqueTags.map((tag) => ({
                userId: tag.userId,
                role: tag.role,
              })),
            }
          : undefined,
      },
      include: POST_INCLUDE,
    });

    void this.gamificationService.recordPostActivity(userId);

    const authorName = post.author.fullName ?? post.author.username ?? 'Someone';
    for (const tag of post.tags ?? []) {
      if (tag.userId === userId) {
        continue;
      }
      void this.notificationsService.notify({
        userId: tag.userId,
        type: 'POST_TAG',
        title: 'You were tagged',
        body: `${authorName} tagged you in a food post`,
        entityId: post.id,
        dedupeKey: `post-tag:${post.id}:${tag.userId}`,
        data: {
          postId: post.id,
          role: tag.role,
          actorId: userId,
          username: post.author.username,
        },
      });
    }

    return mapPostToDto(post, {
      feedSource: 'FOLLOWING',
      isLiked: false,
      isFollowingAuthor: false,
    });
  }

  private normalizeTags(
    tags: CreatePostRequestDto['tags'],
  ): Array<{ userId: string; role: NonNullable<CreatePostRequestDto['tags']>[number]['role'] }> {
    if (!tags?.length) {
      return [];
    }
    const byUser = new Map<string, (typeof tags)[number]>();
    for (const tag of tags) {
      byUser.set(tag.userId, tag);
    }
    return [...byUser.values()];
  }

  async updatePost(
    userId: string,
    postId: string,
    dto: { caption?: string },
  ): Promise<PostDto> {
    const existing = await this.prisma.post.findUnique({
      where: { id: postId },
      include: POST_INCLUDE,
    });
    if (!existing) {
      throw new NotFoundException('Post not found');
    }
    if (existing.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    const post = await this.prisma.post.update({
      where: { id: postId },
      data: {
        caption: dto.caption,
      },
      include: POST_INCLUDE,
    });

    const liked = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
      select: { id: true },
    });

    return mapPostToDto(post, {
      feedSource: 'FOLLOWING',
      isLiked: Boolean(liked),
      isFollowingAuthor: true,
    });
  }

  async deletePost(userId: string, postId: string): Promise<{ message: string }> {
    const existing = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    });
    if (!existing) {
      throw new NotFoundException('Post not found');
    }
    if (existing.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.post.delete({ where: { id: postId } });
    return { message: 'Post deleted' };
  }

  async toggleLike(userId: string, postId: string): Promise<LikeResponseDto> {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existing = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      const updated = await this.prisma.$transaction(async (tx) => {
        await tx.postLike.delete({ where: { id: existing.id } });
        return tx.post.update({
          where: { id: postId },
          data: {
            likeCount: { decrement: 1 },
            trendingScore: computeTrendingScore(
              post.likeCount - 1,
              post.commentCount,
              post.shareCount,
            ),
          },
        });
      });

      return { liked: false, likeCount: updated.likeCount };
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.postLike.create({ data: { postId, userId } });
      return tx.post.update({
        where: { id: postId },
        data: {
          likeCount: { increment: 1 },
          trendingScore: computeTrendingScore(
            post.likeCount + 1,
            post.commentCount,
            post.shareCount,
          ),
        },
      });
    });

    if (post.authorId !== userId) {
      const liker = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { username: true, fullName: true },
      });
      const name = liker?.fullName ?? liker?.username ?? 'Someone';
      void this.notificationsService.notify({
        userId: post.authorId,
        type: 'POST_LIKE',
        title: 'New like',
        body: `${name} liked your post`,
        entityId: postId,
        dedupeKey: `post-like:${postId}:${userId}`,
        data: { postId, actorId: userId, username: liker?.username },
      });
    }

    return { liked: true, likeCount: updated.likeCount };
  }

  async addComment(
    userId: string,
    postId: string,
    content: string,
  ): Promise<CommentDto> {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.comment.create({
        data: { postId, userId, content },
        include: {
          user: {
            select: { id: true, username: true, fullName: true, profileImage: true },
          },
        },
      });

      await tx.post.update({
        where: { id: postId },
        data: {
          commentCount: { increment: 1 },
          trendingScore: computeTrendingScore(
            post.likeCount,
            post.commentCount + 1,
            post.shareCount,
          ),
        },
      });

      return created;
    });

    if (post.authorId !== userId) {
      const name = comment.user.fullName ?? comment.user.username ?? 'Someone';
      void this.notificationsService.notify({
        userId: post.authorId,
        type: 'POST_COMMENT',
        title: 'New comment',
        body: `${name}: ${content.slice(0, 80)}`,
        entityId: postId,
        dedupeKey: `post-comment:${comment.id}`,
        data: {
          postId,
          commentId: comment.id,
          actorId: userId,
          username: comment.user.username,
        },
      });
    }

    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      author: {
        id: comment.user.id,
        username: comment.user.username,
        fullName: comment.user.fullName,
        profileImage: comment.user.profileImage,
      },
    };
  }

  async getComments(
    postId: string,
    cursorRaw?: string,
    limit = 20,
  ): Promise<CommentsResponseDto> {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const cursor = this.paginationHelper.decodeCursor(cursorRaw);
    const where: Prisma.CommentWhereInput = { postId };

    if (cursor) {
      where.OR = [
        { createdAt: { lt: new Date(cursor.createdAt) } },
        {
          createdAt: new Date(cursor.createdAt),
          id: { lt: cursor.id },
        },
      ];
    }

    const rows = await this.prisma.comment.findMany({
      where,
      include: {
        user: {
          select: { id: true, username: true, fullName: true, profileImage: true },
        },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
    });

    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      author: {
        id: comment.user.id,
        username: comment.user.username,
        fullName: comment.user.fullName,
        profileImage: comment.user.profileImage,
      },
    }));

    const last = items.at(-1);
    const nextCursor =
      hasMore && last
        ? this.paginationHelper.encodeCursor({
            score: 0,
            createdAt: last.createdAt,
            id: last.id,
          })
        : null;

    return { items, nextCursor, hasMore };
  }

  async listUserPosts(
    viewerId: string,
    userId: string,
    limit = 24,
  ): Promise<FeedResponseDto> {
    const author = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!author) {
      throw new NotFoundException('User not found');
    }

    const posts = await this.prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: POST_INCLUDE,
    });

    const liked = new Set(
      (
        await this.prisma.postLike.findMany({
          where: { userId: viewerId, postId: { in: posts.map((post) => post.id) } },
          select: { postId: true },
        })
      ).map((row) => row.postId),
    );

    const following = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: viewerId, followingId: userId } },
      select: { id: true },
    });

    return {
      items: posts.map((post) =>
        mapPostToDto(post, {
          feedSource: 'FOLLOWING',
          isLiked: liked.has(post.id),
          isFollowingAuthor: Boolean(following) || viewerId === userId,
        }),
      ),
      nextCursor: null,
      hasMore: false,
    };
  }

  async sharePost(userId: string, postId: string): Promise<ShareResponseDto> {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.postShare.create({ data: { postId, userId } });
      return tx.post.update({
        where: { id: postId },
        data: {
          shareCount: { increment: 1 },
          trendingScore: computeTrendingScore(
            post.likeCount,
            post.commentCount,
            post.shareCount + 1,
          ),
        },
      });
    });

    return {
      shareCount: updated.shareCount,
      shareUrl: `/posts/${postId}`,
    };
  }
}

@Injectable()
export class SocialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async toggleFollow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new ForbiddenException('You cannot follow yourself');
    }

    const target = await this.prisma.user.findUnique({ where: { id: followingId } });
    if (!target) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.follow.delete({ where: { id: existing.id } }),
        this.prisma.user.update({
          where: { id: followerId },
          data: { followingCount: { decrement: 1 } },
        }),
        this.prisma.user.update({
          where: { id: followingId },
          data: { followerCount: { decrement: 1 } },
        }),
      ]);

      const updatedTarget = await this.prisma.user.findUniqueOrThrow({
        where: { id: followingId },
      });

      return {
        following: false,
        followerCount: updatedTarget.followerCount,
      };
    }

    await this.prisma.$transaction([
      this.prisma.follow.create({ data: { followerId, followingId } }),
      this.prisma.user.update({
        where: { id: followerId },
        data: { followingCount: { increment: 1 } },
      }),
      this.prisma.user.update({
        where: { id: followingId },
        data: { followerCount: { increment: 1 } },
      }),
    ]);

    const updatedTarget = await this.prisma.user.findUniqueOrThrow({
      where: { id: followingId },
    });

    const follower = await this.prisma.user.findUnique({
      where: { id: followerId },
      select: { username: true, fullName: true },
    });
    const name = follower?.fullName ?? follower?.username ?? 'Someone';
    void this.notificationsService.notify({
      userId: followingId,
      type: 'NEW_FOLLOWER',
      title: 'New follower',
      body: `${name} started following you`,
      entityId: followerId,
      dedupeKey: `follow:${followerId}:${followingId}`,
      data: { actorId: followerId, username: follower?.username },
    });

    return {
      following: true,
      followerCount: updatedTarget.followerCount,
    };
  }

  async getFollowers(userId: string, viewerId: string, cursorRaw?: string, limit = 20) {
    return this.getFollowList('followers', userId, viewerId, cursorRaw, limit);
  }

  async getFollowing(userId: string, viewerId: string, cursorRaw?: string, limit = 20) {
    return this.getFollowList('following', userId, viewerId, cursorRaw, limit);
  }

  private async getFollowList(
    mode: 'followers' | 'following',
    userId: string,
    viewerId: string,
    cursorRaw?: string,
    limit = 20,
  ) {
    const cursor = cursorRaw
      ? Buffer.from(cursorRaw, 'base64url').toString('utf8')
      : null;

    const rows =
      mode === 'followers'
        ? await this.prisma.follow.findMany({
            where: {
              followingId: userId,
              ...(cursor ? { id: { lt: cursor } } : {}),
            },
            include: {
              follower: {
                select: {
                  id: true,
                  username: true,
                  fullName: true,
                  profileImage: true,
                },
              },
            },
            orderBy: { id: 'desc' },
            take: limit + 1,
          })
        : await this.prisma.follow.findMany({
            where: {
              followerId: userId,
              ...(cursor ? { id: { lt: cursor } } : {}),
            },
            include: {
              following: {
                select: {
                  id: true,
                  username: true,
                  fullName: true,
                  profileImage: true,
                },
              },
            },
            orderBy: { id: 'desc' },
            take: limit + 1,
          });

    const hasMore = rows.length > limit;
    const slice = rows.slice(0, limit);
    type FollowUser = {
      id: string;
      username: string | null;
      fullName: string | null;
      profileImage: string | null;
    };

    const userRows: FollowUser[] = slice.map((row) =>
      mode === 'followers'
        ? (row as (typeof rows)[number] & { follower: FollowUser }).follower
        : (row as (typeof rows)[number] & { following: FollowUser }).following,
    );

    const followingSet = new Set(
      (
        await this.prisma.follow.findMany({
          where: {
            followerId: viewerId,
            followingId: { in: userRows.map((user) => user.id) },
          },
          select: { followingId: true },
        })
      ).map((row) => row.followingId),
    );

    const items = userRows.map((user) => ({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      profileImage: user.profileImage,
      isFollowing: followingSet.has(user.id),
    }));

    const last = slice.at(-1);
    const nextCursor = hasMore && last ? Buffer.from(last.id).toString('base64url') : null;

    return { items, nextCursor, hasMore };
  }
}
