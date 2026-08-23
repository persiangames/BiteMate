import { Link } from 'react-router-dom';
import type { PublicUserDto } from '@bitemate/shared';
import { useI18n } from '@/presentation/context/I18nContext';

interface ProfileSocialBarProps {
  profile: PublicUserDto;
  basePath: string;
  showFollow?: boolean;
  onFollow?: () => void;
  followBusy?: boolean;
}

export function ProfileSocialBar({
  profile,
  basePath,
  showFollow,
  onFollow,
  followBusy,
}: ProfileSocialBarProps) {
  const { t } = useI18n();

  return (
    <div className="profile-social">
      <div className="profile-social__counts">
        <Link to={`${basePath}/followers`} className="profile-stat-link">
          <strong>{profile.followerCount}</strong>
          <span>{t('profile.followers')}</span>
        </Link>
        <Link to={`${basePath}/following`} className="profile-stat-link">
          <strong>{profile.followingCount}</strong>
          <span>{t('profile.following')}</span>
        </Link>
        <Link to={`${basePath}/events/hosted`} className="profile-stat-link">
          <strong>{profile.hostedMeetupCount}</strong>
          <span>{t('profile.hostedEvents')}</span>
        </Link>
        <Link to={`${basePath}/events/attended`} className="profile-stat-link">
          <strong>{profile.attendedMeetupCount}</strong>
          <span>{t('profile.attendedEvents')}</span>
        </Link>
      </div>
      {showFollow ? (
        <button
          type="button"
          className={`btn-secondary${profile.isFollowing ? ' is-selected' : ''}`}
          disabled={followBusy}
          onClick={onFollow}
        >
          {profile.isFollowing ? t('profile.unfollow') : t('profile.follow')}
        </button>
      ) : null}
    </div>
  );
}

export function StarRating({ value }: { value: number }) {
  const full = Math.round(Math.min(5, Math.max(0, value)));
  return (
    <span className="star-rating" aria-label={`${value} / 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < full ? 'star-rating__on' : 'star-rating__off'}>
          ★
        </span>
      ))}
      <span className="hint">{value.toFixed(1)}</span>
    </span>
  );
}
