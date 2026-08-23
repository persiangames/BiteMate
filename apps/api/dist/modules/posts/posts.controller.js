"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const otp_verified_guard_1 = require("../../common/guards/otp-verified.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const posts_dto_1 = require("./dto/posts.dto");
const posts_service_1 = require("./posts.service");
let PostsController = class PostsController {
    postsService;
    feedService;
    constructor(postsService, feedService) {
        this.postsService = postsService;
        this.feedService = feedService;
    }
    createPost(user, dto) {
        return this.postsService.createPost(user.sub, dto);
    }
    updatePost(user, postId, dto) {
        return this.postsService.updatePost(user.sub, postId, dto);
    }
    getFeed(user, query) {
        return this.feedService.getFeed(user.sub, query.cursor, query.limit);
    }
    listUserPosts(user, userId) {
        return this.postsService.listUserPosts(user.sub, userId);
    }
    likePost(user, postId) {
        return this.postsService.toggleLike(user.sub, postId);
    }
    commentOnPost(user, postId, dto) {
        return this.postsService.addComment(user.sub, postId, dto.content);
    }
    getComments(postId, query) {
        return this.postsService.getComments(postId, query.cursor, query.limit);
    }
    sharePost(user, postId) {
        return this.postsService.sharePost(user.sub, postId);
    }
};
exports.PostsController = PostsController;
__decorate([
    (0, common_1.Post)('posts'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, posts_dto_1.CreatePostDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "createPost", null);
__decorate([
    (0, common_1.Patch)('posts/:id'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, posts_dto_1.UpdatePostDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "updatePost", null);
__decorate([
    (0, common_1.Get)('feed'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, posts_dto_1.FeedQueryDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getFeed", null);
__decorate([
    (0, common_1.Get)('users/:userId/posts'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "listUserPosts", null);
__decorate([
    (0, common_1.Post)('posts/:id/like'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "likePost", null);
__decorate([
    (0, common_1.Post)('posts/:id/comment'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, posts_dto_1.CreateCommentDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "commentOnPost", null);
__decorate([
    (0, common_1.Get)('posts/:id/comments'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, posts_dto_1.CommentsQueryDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getComments", null);
__decorate([
    (0, common_1.Post)('posts/:id/share'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "sharePost", null);
exports.PostsController = PostsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, otp_verified_guard_1.OtpVerifiedGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [posts_service_1.PostsService,
        posts_service_1.FeedService])
], PostsController);
//# sourceMappingURL=posts.controller.js.map