import type { CommentDto, CommentsResponseDto, CreatePostRequestDto, FeedResponseDto, LikeResponseDto, PostDto, ShareResponseDto } from '@bitemate/shared';
import { PrismaService } from '../database/prisma.service';
import { GamificationService } from '../growth/gamification.service';
import { GeoLocationService } from '../location/geo-location.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PaginationHelper } from './pagination.helper';
export declare class FeedService {
    private readonly prisma;
    private readonly geoLocationService;
    private readonly paginationHelper;
    constructor(prisma: PrismaService, geoLocationService: GeoLocationService, paginationHelper: PaginationHelper);
    getFeed(userId: string, cursorRaw?: string, limit?: number): Promise<FeedResponseDto>;
    private mergeCandidates;
    private toCandidate;
}
export declare class PostsService {
    private readonly prisma;
    private readonly paginationHelper;
    private readonly gamificationService;
    private readonly notificationsService;
    constructor(prisma: PrismaService, paginationHelper: PaginationHelper, gamificationService: GamificationService, notificationsService: NotificationsService);
    createPost(userId: string, dto: CreatePostRequestDto): Promise<PostDto>;
    private normalizeTags;
    updatePost(userId: string, postId: string, dto: {
        caption?: string;
    }): Promise<PostDto>;
    toggleLike(userId: string, postId: string): Promise<LikeResponseDto>;
    addComment(userId: string, postId: string, content: string): Promise<CommentDto>;
    getComments(postId: string, cursorRaw?: string, limit?: number): Promise<CommentsResponseDto>;
    listUserPosts(viewerId: string, userId: string, limit?: number): Promise<FeedResponseDto>;
    sharePost(userId: string, postId: string): Promise<ShareResponseDto>;
}
export declare class SocialService {
    private readonly prisma;
    private readonly notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    toggleFollow(followerId: string, followingId: string): Promise<{
        following: boolean;
        followerCount: number;
    }>;
    getFollowers(userId: string, viewerId: string, cursorRaw?: string, limit?: number): Promise<{
        items: {
            id: string;
            username: string | null;
            fullName: string | null;
            profileImage: string | null;
            isFollowing: boolean;
        }[];
        nextCursor: string | null;
        hasMore: boolean;
    }>;
    getFollowing(userId: string, viewerId: string, cursorRaw?: string, limit?: number): Promise<{
        items: {
            id: string;
            username: string | null;
            fullName: string | null;
            profileImage: string | null;
            isFollowing: boolean;
        }[];
        nextCursor: string | null;
        hasMore: boolean;
    }>;
    private getFollowList;
}
