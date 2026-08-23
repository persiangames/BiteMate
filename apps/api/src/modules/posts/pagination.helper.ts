import { Injectable } from '@nestjs/common';

export interface FeedCursor {
  score: number;
  createdAt: string;
  id: string;
}

@Injectable()
export class PaginationHelper {
  encodeCursor(cursor: FeedCursor): string {
    return Buffer.from(JSON.stringify(cursor)).toString('base64url');
  }

  decodeCursor(raw?: string): FeedCursor | null {
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as FeedCursor;
    } catch {
      return null;
    }
  }
}

export function computeTrendingScore(
  likeCount: number,
  commentCount: number,
  shareCount: number,
): number {
  return likeCount * 3 + commentCount * 5 + shareCount * 2;
}
