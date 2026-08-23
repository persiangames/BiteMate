export interface FeedCursor {
    score: number;
    createdAt: string;
    id: string;
}
export declare class PaginationHelper {
    encodeCursor(cursor: FeedCursor): string;
    decodeCursor(raw?: string): FeedCursor | null;
}
export declare function computeTrendingScore(likeCount: number, commentCount: number, shareCount: number): number;
