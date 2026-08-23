import type { ReviewDto, ReviewsListResponseDto } from '@bitemate/shared';
import { PrismaService } from '../database/prisma.service';
import { RankingService } from '../growth/ranking.service';
import type { CreateReviewDto, ReviewsQueryDto } from './dto/marketplace.dto';
export declare class ReviewsService {
    private readonly prisma;
    private readonly rankingService;
    constructor(prisma: PrismaService, rankingService: RankingService);
    createReview(reviewerId: string, dto: CreateReviewDto): Promise<ReviewDto>;
    listReviews(query: ReviewsQueryDto): Promise<ReviewsListResponseDto>;
    private toReviewDto;
}
