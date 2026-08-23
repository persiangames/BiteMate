import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { PostDto, PublicUserDto, UserRole } from '@bitemate/shared';
import { fetchUserPosts, toggleFollow } from '@/data/repositories/feedRepository';
import { fetchPublicUser } from '@/data/repositories/profileRepository';
import { formatPlace } from '@/data/localize';
import { Avatar } from '@/presentation/components/Avatar';
import { DiningPrefsBlock } from '@/presentation/components/DiningPrefsBlock';
import { ProfileSocialBar } from '@/presentation/components/ProfileSocialBar';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';
import { resolveMediaUrl } from '@/utils/mediaUrl';

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { accessToken, user } = useAuth();
  const { t, locale } = useI18n();
  const [profile, setProfile] = useState<PublicUserDto | null>(null);
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [following, setFollowing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !username) {
      return;
    }
    let cancelled = false;
    fetchPublicUser(accessToken, username)
      .then(async (next) => {
        if (cancelled) return;
        setProfile(next);
        setFollowing(next.isFollowing);
        const feed = await fetchUserPosts(accessToken, next.id);
        if (!cancelled) {
          setPosts(feed.items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(t('error.loadFailed'));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, username, t]);

  if (error) {
    return (
      <main className="page">
        <section className="panel">
          <p className="error">{error}</p>
        </section>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="page">
        <p className="hint">{t('common.loading')}</p>
      </main>
    );
  }

  const isSelf = user?.id === profile.id;
  const name = profile.fullName ?? profile.username ?? t('post.user');

  return (
    <div className="app-screen" lang={locale}>
      <section className="ig-profile">
        <div className="ig-profile__hero">
          <div className="ig-profile__cover">
            {profile.coverImage ? (
              <img src={resolveMediaUrl(profile.coverImage)} alt="" />
            ) : (
              <div className="ig-profile__cover-empty" />
            )}
          </div>
          <Avatar name={name} imageUrl={profile.profileImage} size="lg" />
        </div>
        <div className="ig-profile__identity">
          <div>
            <h1>{name}</h1>
            <p className="hint">
              @{profile.username ?? 'bitemate-user'}
              {' · '}
              {profile.city || profile.country
                ? formatPlace(profile.city, profile.country, locale)
                : t('profile.global')}
            </p>
          </div>
          {profile.role ? (
            <div className="badge-row">
              <span className="badge-pill">{t(`auth.role.${profile.role as UserRole}`)}</span>
            </div>
          ) : null}
          {isSelf ? (
            <Link to="/profile" className="btn-secondary">{t('nav.profile')}</Link>
          ) : null}
          <ProfileSocialBar
            profile={{ ...profile, isFollowing: following }}
            basePath={`/u/${profile.username ?? username}`}
            showFollow={!isSelf}
            onFollow={() => {
              if (!accessToken) return;
              void toggleFollow(accessToken, profile.id).then((result) => {
                setFollowing(result.following);
                setProfile((current) =>
                  current
                    ? {
                        ...current,
                        isFollowing: result.following,
                        followerCount: result.followerCount,
                      }
                    : current,
                );
              });
            }}
          />
        </div>
      </section>

      <section className="glass-card flow">
        <h2>{t('profile.about')}</h2>
        <p>{profile.bio ?? t('profile.bioEmpty')}</p>
        <DiningPrefsBlock prefs={profile} />
      </section>

      <section className="glass-card flow">
        <h2>{t('profile.posts')}</h2>
        {posts.length === 0 ? (
          <p className="hint">{t('profile.posts.empty')}</p>
        ) : (
          <div className="profile-grid">
            {posts.map((post) => {
              const src = resolveMediaUrl(post.thumbnailUrl ?? post.mediaUrl);
              return (
                <Link to="/feed" className="profile-grid__item" key={post.id}>
                  {post.mediaType === 'VIDEO' ? (
                    <>
                      {src ? <img src={src} alt="" /> : <video src={resolveMediaUrl(post.mediaUrl)} muted />}
                      <span className="profile-grid__clip">{t('profile.reel')}</span>
                    </>
                  ) : (
                    <img src={src} alt={post.caption ?? ''} />
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
