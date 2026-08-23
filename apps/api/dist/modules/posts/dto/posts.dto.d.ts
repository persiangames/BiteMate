import { type MediaType, type PostTagRole } from '@bitemate/shared';
export declare class CreatePostTagDto {
    userId: string;
    role: PostTagRole;
}
export declare class CreatePostDto {
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
export declare class FeedQueryDto {
    cursor?: string;
    limit: number;
}
export declare class CreateCommentDto {
    content: string;
}
export declare class UpdatePostDto {
    caption?: string;
}
export declare class CommentsQueryDto {
    cursor?: string;
    limit: number;
}
export declare class FollowListQueryDto {
    cursor?: string;
    limit: number;
}
