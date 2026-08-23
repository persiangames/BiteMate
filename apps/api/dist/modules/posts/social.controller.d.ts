import type { FollowListResponseDto, FollowResponseDto } from '@bitemate/shared';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { FollowListQueryDto } from './dto/posts.dto';
import { SocialService } from './posts.service';
export declare class SocialController {
    private readonly socialService;
    constructor(socialService: SocialService);
    toggleFollow(user: JwtPayload, targetUserId: string): Promise<FollowResponseDto>;
    getFollowers(user: JwtPayload, targetUserId: string, query: FollowListQueryDto): Promise<FollowListResponseDto>;
    getFollowing(user: JwtPayload, targetUserId: string, query: FollowListQueryDto): Promise<FollowListResponseDto>;
}
