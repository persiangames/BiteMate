import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ageFromDateOfBirth, type UserRole } from '@bitemate/shared';
import { fetchUserRankings, fetchPremiumStatus, fetchUserLevel, fetchUserBadges } from '@/data/repositories/growthRepository';
import { fetchWalletBalance } from '@/data/repositories/walletRepository';
import { fetchUserPosts } from '@/data/repositories/feedRepository';
import { fetchPublicUserById } from '@/data/repositories/profileRepository';
import { Avatar } from '@/presentation/components/Avatar';
import { ProfileCompletionBar } from '@/presentation/components/profile/ProfileCompletionBar';
import { DiningPrefsBlock } from '@/presentation/components/DiningPrefsBlock';
import { ProfileSocialBar } from '@/presentation/components/ProfileSocialBar';
import { formatPlace } from '@/data/localize';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';
import { resolveMediaUrl } from '@/utils/mediaUrl';
import type { PostDto, PublicUserDto } from '@bitemate/shared';

export function ProfilePage() {
  const { user, accessToken, logout } = useAuth();
  const { t, locale } = useI18n();
  const [rankPosition, setRankPosition] = useState<number | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>('—');
  const [isPremium, setIsPremium] = useState(false);
  const [userLevel, setUserLevel] = useState<Awaited<ReturnType<typeof fetchUserLevel>> | null>(null);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [social, setSocial] = useState<PublicUserDto | null>(null);

  useEffect(() => {
    if (!accessToken || !user) return;

    fetchWalletBalance(accessToken)
      .then((response) => setWalletBalance(`${response.fiat.currency} ${response.fiat.available.toFixed(2)}`))
      .catch(() => setWalletBalance(t('error.loadFailed')));

    fetchPremiumStatus(accessToken)
      .then((response) => setIsPremium(response.isPremium))
      .catch(() => undefined);

    fetchUserLevel(accessToken)
      .then(setUserLevel)
      .catch(() => undefined);

    fetchUserBadges(accessToken)
      .then((response) => setEarnedBadges(response.items.map((item) => item.label)))
      .catch(() => undefined);

    fetchUserPosts(accessToken, user.id)
      .then((response) => setPosts(response.items))
      .catch(() => setPosts([]));

    fetchPublicUserById(accessToken, user.id)
      .then(setSocial)
      .catch(() => undefined);

    fetchUserRankings(user.city ?? undefined)
      .then((response) => {
        const index = response.items.findIndex((item) => item.userId === user.id);
        setRankPosition(index >= 0 ? index + 1 : null);
      })
      .catch(() => undefined);
  }, [accessToken, user]);

  if (!user) {
    return null;
  }

  const badges = [
    userLevel ? t('profile.level') + ` ${userLevel.level}` : null,
    ...earnedBadges,
    user.role ? t(`auth.role.${user.role as UserRole}`) : null,
    isPremium ? t('profile.premium') : null,
    user.phoneVerified ? t('profile.verifiedPhone') : null,
    user.emailVerified ? t('profile.verifiedEmail') : null,
    user.liveLocationEnabled ? t('profile.liveOn') : null,
    user.lookingToEat ? t('dining.readyToEat') : null,
  ].filter(Boolean) as string[];

  return (
    <div className="app-screen" lang={locale}>
      <section className="ig-profile">
        <div className="ig-profile__hero">
          <div className="ig-profile__cover">
            {user.coverImage ? (
              <img src={resolveMediaUrl(user.coverImage)} alt="" />
            ) : (
              <div className="ig-profile__cover-empty" />
            )}
          </div>
          <Avatar name={user.fullName} imageUrl={user.profileImage} size="lg" />
        </div>
        <div className="ig-profile__identity">
          <div>
            <h1>{user.fullName ?? user.username ?? t('profile.title')}</h1>
            <p className="hint">
              @{user.username ?? 'bitemate-user'}
              {user.city || user.country ? ` · ${formatPlace(user.city, user.country, locale)}` : ` · ${t('profile.global')}`}
            </p>
          </div>
          <div className="badge-row">
            {badges.map((badge) => (
              <span key={badge} className="badge-pill">{badge}</span>
            ))}
          </div>
          <Link to="/profile/edit" className="btn-secondary">{t('profile.edit')}</Link>
          <ProfileCompletionBar />
          {social ? <ProfileSocialBar profile={social} basePath="/profile" /> : null}
        </div>
      </section>

      <div className="stat-grid">
        <div className="stat-card">
          <strong>{userLevel ? `Lv ${userLevel.level}` : '—'}</strong>
          <span className="hint">{t('profile.level')}</span>
        </div>
        <div className="stat-card">
          <strong>{rankPosition ?? '—'}</strong>
          <span className="hint">{t('profile.rank')}</span>
        </div>
        <div className="stat-card">
          <strong>{walletBalance}</strong>
          <span className="hint">{t('profile.wallet')}</span>
        </div>
      </div>

      {userLevel && (
        <section className="glass-card flow">
          <h2>{t('profile.progress')}</h2>
          <div className="progress-bar" style={{ height: 8, background: 'var(--surface-muted)', borderRadius: 4 }}>
            <div
              style={{
                width: `${userLevel.progressPercent}%`,
                height: '100%',
                background: 'var(--primary)',
                borderRadius: 4,
              }}
            />
          </div>
          <p className="hint">
            {t('profile.xp', { xp: userLevel.experiencePoints, percent: userLevel.progressPercent })}
          </p>
        </section>
      )}

      <section className="glass-card flow">
        <h2>{t('profile.about')}</h2>
        <p>{user.bio ?? t('profile.bioEmpty')}</p>
        <DiningPrefsBlock
          prefs={{
            age: ageFromDateOfBirth(user.dateOfBirth),
            gender: user.gender,
            education: user.education,
            preferredMeals: user.preferredMeals,
            favoriteCuisines: user.favoriteCuisines,
            favoriteFoods: user.favoriteFoods,
            lookingToEat: user.lookingToEat,
            city: user.city,
            country: user.country,
          }}
        />
        <dl className="profile-list">
          <div>
            <dt>{t('auth.email')}</dt>
            <dd>{user.email ?? '-'}</dd>
          </div>
          <div>
            <dt>{t('auth.phone')}</dt>
            <dd>{user.phoneNumber ?? '-'}</dd>
          </div>
          <div>
            <dt>{t('auth.role')}</dt>
            <dd>{user.role ? t(`auth.role.${user.role as UserRole}`) : '-'}</dd>
          </div>
        </dl>
      </section>

      <section className="glass-card flow">
        <div className="screen-header">
          <h2>{t('profile.posts')}</h2>
          <Link to="/feed/create" className="btn-secondary">{t('post.new')}</Link>
        </div>
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

      <div className="quick-links">
        <Link to="/notifications" className="quick-link">{t('profile.notifications')}</Link>
        <Link to="/wallet" className="quick-link">{t('profile.wallet')}</Link>
        <Link to="/rankings" className="quick-link">{t('profile.rankings')}</Link>
        <Link to="/premium" className="quick-link">{t('profile.premium')}</Link>
        <Link to="/settings" className="quick-link">{t('profile.settings')}</Link>
        <Link to="/profile/edit" className="quick-link">{t('profile.edit')}</Link>
        <Link to="/marketplace/restaurants" className="quick-link">{t('profile.marketplace')}</Link>
        <Link to="/bookings" className="quick-link">{t('profile.bookings')}</Link>
        {user.role === 'HOME_CHEF' && (
          <Link to="/marketplace/home-chef/dashboard" className="quick-link">{t('profile.chefDashboard')}</Link>
        )}
        {user.role === 'RESTAURANT_OWNER' && (
          <Link to="/marketplace/restaurants/create" className="quick-link">{t('profile.createRestaurant')}</Link>
        )}
      </div>

      <button
        type="button"
        className="btn-secondary"
        onClick={() => logout().then(() => { window.location.href = '/login'; })}
      >
        {t('profile.logout')}
      </button>
    </div>
  );
}
