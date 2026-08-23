import type { CommentDto, CommentsResponseDto, FeedResponseDto, LikeResponseDto, PostDto, ShareResponseDto } from '@bitemate/shared';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CommentsQueryDto, CreateCommentDto, CreatePostDto, FeedQueryDto, UpdatePostDto } from './dto/posts.dto';
import { FeedService, PostsService } from './posts.service';
export declare class PostsController {
    private readonly postsService;
    private readonly feedService;
    constructor(postsService: PostsService, feedService: FeedService);
    createPost(user: JwtPayload, dto: CreatePostDto): Promise<PostDto>;
    updatePost(user: JwtPayload, postId: string, dto: UpdatePostDto): Promise<PostDto>;
    getFeed(user: JwtPayload, query: FeedQueryDto): Promise<FeedResponseDto>;
    listUserPosts(user: JwtPayload, userId: string): Promise<FeedResponseDto>;
    likePost(user: JwtPayload, postId: string): Promise<LikeResponseDto>;
    commentOnPost(user: JwtPayload, postId: string, dto: CreateCommentDto): Promise<CommentDto>;
    getComments(postId: string, query: CommentsQueryDto): Promise<CommentsResponseDto>;
    sharePost(user: JwtPayload, postId: string): Promise<ShareResponseDto>;
}
