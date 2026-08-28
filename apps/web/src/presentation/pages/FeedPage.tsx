import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { PostDto } from '@bitemate/shared';
import { ApiError } from '@/data/api/client';
import { fetchFeed, fetchUserPosts } from '@/data/repositories/feedRepository';
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

type FeedLocationState = {
  newPost?: PostDto;
};

async function loadOwnPosts(accessToken: string, userId: string): Promise<PostDto[]> {
  const response = await fetchUserPosts(accessToken, userId);
  return response.items ?? [];
}

function mergePosts(current: PostDto[], incoming: PostDto[]): PostDto[] {
  const seen = new Set<string>();
  const merged: PostDto[] = [];

  for (const post of [...incoming, ...current]) {
    if (seen.has(post.id)) {
      continue;
    }
    seen.add(post.id);
    merged.push(post);
  }

  return merged;
}

export function FeedPage() {
  const { accessToken, user } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as FeedLocationState | null;
    const newPost = state?.newPost;
    if (!newPost) {
      return;
    }

    setPosts((current) => mergePosts(current, [newPost]));
    setError(null);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const loadFeed = useCallback(
    async (nextCursor?: string | null, append = false) => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      if (isDemoAccessToken(accessToken)) {
        setPosts(DEMO_POSTS);
        setHasMore(false);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetchFeed(accessToken, nextCursor ?? undefined);
        const items = response.items ?? [];

        if (!append && items.length === 0 && user?.id && !nextCursor) {
          const ownPosts = await loadOwnPosts(accessToken, user.id);
          if (ownPosts.length > 0) {
            setPosts((current) => mergePosts(current, ownPosts));
            setCursor(null);
            setHasMore(false);
            return;
          }
        }

        setPosts((current) => (append ? [...current, ...items.filter((p) => !current.some((c) => c.id === p.id))] : mergePosts(items, current)));
        setCursor(response.nextCursor);
        setHasMore(response.hasMore);
      } catch (err) {
        if (!append && user?.id) {
          try {
            const ownPosts = await loadOwnPosts(accessToken, user.id);
            if (ownPosts.length > 0) {
              setPosts((current) => mergePosts(current, ownPosts));
              setCursor(null);
              setHasMore(false);
              setError(null);
              return;
            }
          } catch {
            // Keep the feed error below.
          }
        }

        if (err instanceof ApiError && err.status === 401) {
          setError(t('error.sessionExpired'));
        } else if (err instanceof ApiError && err.message) {
          setError(err.message);
        } else {
          setError(t('error.loadFailed'));
        }

        if (!append) {
          setPosts((current) => (current.length ? current : []));
        }
      } finally {
        setLoading(false);
      }
    },
    [accessToken, t, user?.id],
  );

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  function updatePost(updated: PostDto) {
    setPosts((current) => current.map((post) => (post.id === updated.id ? updated : post)));
  }

  function removePost(postId: string) {
    setPosts((current) => current.filter((post) => post.id !== postId));
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
      {error ? (
        <div className="feed-page__error">
          <p className="error">{error}</p>
          <button type="button" className="btn-secondary" disabled={loading} onClick={() => void loadFeed()}>
            {t('feed.retry')}
          </button>
        </div>
      ) : null}

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
              onDelete={removePost}
            />
          ),
        )}
      </div>
      {!loading && !error && posts.length === 0 ? <p className="hint">{t('feed.empty')}</p> : null}

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
