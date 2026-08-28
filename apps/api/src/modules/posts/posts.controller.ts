import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type {
  CommentDto,
  CommentsResponseDto,
  FeedResponseDto,
  LikeResponseDto,
  PostDto,
  ShareResponseDto,
} from '@bitemate/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireOtpVerified } from '../../common/decorators/auth.decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OtpVerifiedGuard } from '../../common/guards/otp-verified.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import {
  CommentsQueryDto,
  CreateCommentDto,
  CreatePostDto,
  FeedQueryDto,
  UpdatePostDto,
} from './dto/posts.dto';
import { FeedService, PostsService } from './posts.service';

@Controller()
@UseGuards(JwtAuthGuard, OtpVerifiedGuard, RolesGuard)
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly feedService: FeedService,
  ) {}

  @Post('posts')
  @RequireOtpVerified()
  createPost(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePostDto,
  ): Promise<PostDto> {
    return this.postsService.createPost(user.sub, dto);
  }

  @Patch('posts/:id')
  @RequireOtpVerified()
  updatePost(
    @CurrentUser() user: JwtPayload,
    @Param('id') postId: string,
    @Body() dto: UpdatePostDto,
  ): Promise<PostDto> {
    return this.postsService.updatePost(user.sub, postId, dto);
  }

  @Delete('posts/:id')
  @RequireOtpVerified()
  deletePost(
    @CurrentUser() user: JwtPayload,
    @Param('id') postId: string,
  ): Promise<{ message: string }> {
    return this.postsService.deletePost(user.sub, postId);
  }

  @Get('feed')
  @RequireOtpVerified()
  getFeed(
    @CurrentUser() user: JwtPayload,
    @Query() query: FeedQueryDto,
  ): Promise<FeedResponseDto> {
    return this.feedService.getFeed(user.sub, query.cursor, query.limit);
  }

  @Get('users/:userId/posts')
  @RequireOtpVerified()
  listUserPosts(
    @CurrentUser() user: JwtPayload,
    @Param('userId') userId: string,
  ): Promise<FeedResponseDto> {
    return this.postsService.listUserPosts(user.sub, userId);
  }

  @Post('posts/:id/like')
  @RequireOtpVerified()
  likePost(
    @CurrentUser() user: JwtPayload,
    @Param('id') postId: string,
  ): Promise<LikeResponseDto> {
    return this.postsService.toggleLike(user.sub, postId);
  }

  @Post('posts/:id/comment')
  @RequireOtpVerified()
  commentOnPost(
    @CurrentUser() user: JwtPayload,
    @Param('id') postId: string,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentDto> {
    return this.postsService.addComment(user.sub, postId, dto.content);
  }

  @Get('posts/:id/comments')
  @RequireOtpVerified()
  getComments(
    @Param('id') postId: string,
    @Query() query: CommentsQueryDto,
  ): Promise<CommentsResponseDto> {
    return this.postsService.getComments(postId, query.cursor, query.limit);
  }

  @Post('posts/:id/share')
  @RequireOtpVerified()
  sharePost(
    @CurrentUser() user: JwtPayload,
    @Param('id') postId: string,
  ): Promise<ShareResponseDto> {
    return this.postsService.sharePost(user.sub, postId);
  }
}
