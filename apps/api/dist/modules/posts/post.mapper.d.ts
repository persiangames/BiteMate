import type { FeedSourceType, PostDto, PostTagDto } from '@bitemate/shared';
import type { Post, PostTag, User } from '@prisma/client';
export declare const POST_INCLUDE: {
    author: {
        select: {
            readonly id: true;
            readonly username: true;
            readonly fullName: true;
            readonly profileImage: true;
        };
    };
    tags: {
        include: {
            user: {
                select: {
                    readonly id: true;
                    readonly username: true;
                    readonly fullName: true;
                    readonly profileImage: true;
                };
            };
        };
    };
};
type TaggedUser = Pick<User, 'id' | 'username' | 'fullName' | 'profileImage'>;
type PostWithRelations = Post & {
    author: TaggedUser;
    tags?: Array<PostTag & {
        user: TaggedUser;
    }>;
};
export declare function mapPostTags(tags: Array<PostTag & {
    user: TaggedUser;
}> | undefined): PostTagDto[];
export declare function mapPostToDto(post: PostWithRelations, options: {
    feedSource: FeedSourceType;
    isLiked: boolean;
    isFollowingAuthor: boolean;
}): PostDto;
export {};
