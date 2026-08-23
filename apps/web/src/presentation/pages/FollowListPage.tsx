import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import type { FollowListItemDto, PublicUserDto } from '@bitemate/shared';
import { fetchFollowList, toggleFollow } from '@/data/repositories/feedRepository';
import { fetchPublicUser, fetchPublicUserById } from '@/data/repositories/profileRepository';
import { Avatar } from '@/presentation/components/Avatar';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';

export function FollowListPage() {
  const { username, userId } = useParams<{
    username?: string;
    userId?: string;
  }>();
  const { pathname } = useLocation();
  const mode = pathname.endsWith('/following') ? 'following' : 'followers';
  const { accessToken, user } = useAuth();
  const { t } = useI18n();
  const [profile, setProfile] = useState<PublicUserDto | null>(null);
  const [items, setItems] = useState<FollowListItemDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !mode) return;
    let cancelled = false;
    const load = username
      ? fetchPublicUser(accessToken, username)
      : userId
        ? fetchPublicUserById(accessToken, userId)
        : user
          ? fetchPublicUserById(accessToken, user.id)
          : Promise.reject(new Error('missing'));

    load
      .then(async (next) => {
        if (cancelled) return;
        setProfile(next);
        const list = await fetchFollowList(accessToken, next.id, mode);
        if (!cancelled) setItems(list.items);
      })
      .catch(() => {
        if (!cancelled) setError(t('error.loadFailed'));
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, username, userId, mode, user, t]);

  if (error) {
    return <p className="error">{error}</p>;
  }
  if (!profile || !mode) {
    return <p className="hint">{t('common.loading')}</p>;
  }

  return (
    <div className="app-screen">
      <header className="screen-header">
        <h1>{mode === 'followers' ? t('profile.followers') : t('profile.following')}</h1>
        <span className="hint">@{profile.username ?? profile.fullName}</span>
      </header>
      <div className="card-list">
        {items.map((item) => (
          <article key={item.id} className="glass-card follow-row">
            <Avatar name={item.fullName ?? item.username} imageUrl={item.profileImage} />
            <div>
              {item.username ? (
                <Link to={`/u/${item.username}`}>
                  <strong>@{item.username}</strong>
                </Link>
              ) : (
                <strong>{item.fullName ?? t('post.user')}</strong>
              )}
              <p className="hint">{item.fullName}</p>
            </div>
            {item.id !== user?.id ? (
              <button
                type="button"
                className={`btn-secondary${item.isFollowing ? ' is-selected' : ''}`}
                onClick={() => {
                  if (!accessToken) return;
                  void toggleFollow(accessToken, item.id).then((result) => {
                    setItems((current) =>
                      current.map((row) =>
                        row.id === item.id ? { ...row, isFollowing: result.following } : row,
                      ),
                    );
                  });
                }}
              >
                {item.isFollowing ? t('profile.unfollow') : t('profile.follow')}
              </button>
            ) : null}
          </article>
        ))}
      </div>
      {!items.length ? <p className="hint">{t('profile.followEmpty')}</p> : null}
    </div>
  );
}
