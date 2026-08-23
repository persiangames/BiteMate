"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST_INCLUDE = void 0;
exports.mapPostTags = mapPostTags;
exports.mapPostToDto = mapPostToDto;
const AUTHOR_SELECT = {
    id: true,
    username: true,
    fullName: true,
    profileImage: true,
};
exports.POST_INCLUDE = {
    author: { select: AUTHOR_SELECT },
    tags: {
        include: {
            user: { select: AUTHOR_SELECT },
        },
    },
};
function mapPostTags(tags) {
    return (tags ?? []).map((tag) => ({
        userId: tag.user.id,
        username: tag.user.username,
        fullName: tag.user.fullName,
        profileImage: tag.user.profileImage,
        role: tag.role,
    }));
}
function mapPostToDto(post, options) {
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
//# sourceMappingURL=post.mapper.js.map