import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { PostDto } from '@bitemate/shared';
import { fetchFeed } from '@/data/repositories/feedRepository';
import { isDemoAccessToken } from '@/data/demo/demoSession';
import { PostCard } from '@/presentation/components/PostCard';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';

const DEMO_POSTS: PostDto[] = [
  {
    id: 'demo-1',
    caption: 'Lunch meetup in Tehran — who is joining?',
    mediaType: 'IMAGE',
    mediaUrl: '/brand/lockup-512.png',
    thumbnailUrl: null,
    restaurantTag: 'Cafe Nili',
    locationLabel: 'Tehran',
    locationLat: null,
    locationLng: null,
    likeCount: 128,
    commentCount: 14,
    shareCount: 9,
    feedSource: 'TRENDING',
    isLiked: false,
    isFollowingAuthor: true,
    tags: [],
    author: { id: 'u1', username: 'nili.eats', fullName: 'Nili', profileImage: '/brand/icon-64.png' },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    caption: 'Street food tour this Friday.',
    mediaType: 'IMAGE',
    mediaUrl: '/brand/icon-512.png',
    thumbnailUrl: null,
    restaurantTag: 'Bite Cart',
    locationLabel: 'Dubai',
    locationLat: null,
    locationLng: null,
    likeCount: 86,
    commentCount: 7,
    shareCount: 4,
    feedSource: 'NEARBY',
    isLiked: true,
    isFollowingAuthor: false,
    tags: [],
    author: { id: 'u2', username: 'admin', fullName: 'BiteMate Admin', profileImage: '/brand/icon-64.png' },
    createdAt: new Date().toISOString(),
  },
];

export function FeedPage() {
  const { accessToken } = useAuth();
  const { t } = useI18n();
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(
    async (nextCursor?: string | null, append = false) => {
      if (!accessToken) {
        return;
      }

      if (isDemoAccessToken(accessToken)) {
        setPosts(DEMO_POSTS);
        setHasMore(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetchFeed(accessToken, nextCursor ?? undefined);
        setPosts((current) => (append ? [...current, ...response.items] : response.items));
        setCursor(response.nextCursor);
        setHasMore(response.hasMore);
      } catch (err) {
        setError(err instanceof Error ? t('error.loadFailed') : t('error.loadFailed'));
      } finally {
        setLoading(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  function updatePost(updated: PostDto) {
    setPosts((current) => current.map((post) => (post.id === updated.id ? updated : post)));
  }

  return (
    <div className="app-screen feed-page">
      <header className="screen-header">
        <h1>{t('feed.title')}</h1>
        <Link to="/feed/create" className="btn-secondary">
          + {t('feed.post')}
        </Link>
      </header>

      {loading && posts.length === 0 && <p className="hint">{t('feed.loading')}</p>}
      {error && <p className="error">{error}</p>}

      <div className="feed-list">
        {posts.map((post) =>
          isDemoAccessToken(accessToken) ? (
            <article className="card" key={post.id}>
              <strong>{post.author.fullName ?? post.author.username}</strong>
              <p>{post.caption}</p>
              <p className="hint">
                {post.locationLabel} · {t('post.likes', { count: post.likeCount })}
              </p>
            </article>
          ) : (
            <PostCard
              key={post.id}
              post={post}
              accessToken={accessToken!}
              onUpdate={updatePost}
            />
          ),
        )}
      </div>
      {!loading && posts.length === 0 ? <p className="hint">{t('feed.empty')}</p> : null}

      {hasMore && (
        <button type="button" className="btn-secondary" disabled={loading} onClick={() => loadFeed(cursor, true)}>
          {loading ? t('common.loading') : t('feed.more')}
        </button>
      )}

      <Link to="/feed/create" className="fab" aria-label={t('post.new')}>
        +
      </Link>
    </div>
  );
}
