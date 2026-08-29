const MAIN_TAB_PATHS = new Set(['/feed', '/discover', '/meetups', '/chats', '/people', '/profile']);

export function isMainTabRoute(pathname: string): boolean {
  return MAIN_TAB_PATHS.has(pathname);
}

export function resolvePageTitle(
  pathname: string,
  t: (key: string) => string,
): string | null {
  if (pathname === '/feed' || pathname.startsWith('/feed/')) {
    return pathname === '/feed/create' ? t('post.new') : t('nav.feed');
  }
  if (pathname === '/discover' || pathname.startsWith('/discover')) {
    return t('nav.nearby');
  }
  if (pathname === '/meetups' || pathname.startsWith('/meetups/')) {
    return pathname.includes('/room/') ? t('meetups.room') : t('nav.meetups');
  }
  if (pathname === '/chats') {
    return t('nav.chat');
  }
  if (pathname === '/people' || pathname === '/search') {
    return t('nav.people');
  }
  if (pathname === '/profile' || pathname.startsWith('/profile/')) {
    if (pathname === '/profile/edit') return t('profile.edit');
    if (pathname.includes('/followers')) return t('profile.followers');
    if (pathname.includes('/following')) return t('profile.following');
    if (pathname.includes('/events/')) return t('profile.events');
    return t('nav.profile');
  }
  if (pathname === '/settings') return t('settings.title');
  if (pathname === '/notifications') return t('notifications.title');
  if (pathname === '/wallet') return t('wallet.title');
  if (pathname === '/rankings') return t('rankings.title');
  if (pathname === '/premium') return t('premium.title');
  if (pathname === '/bookings') return t('bookings.title');
  if (pathname.startsWith('/u/')) return t('profile.public');
  if (pathname.startsWith('/marketplace/')) return t('restaurants.title');
  return null;
}

export type NotificationCategory = 'ALL' | 'MESSAGES' | 'SOCIAL' | 'MEETUPS' | 'SYSTEM';

export const NOTIFICATION_CATEGORY_TYPES: Record<
  Exclude<NotificationCategory, 'ALL'>,
  readonly string[]
> = {
  MESSAGES: ['MESSAGE_RECEIVED'],
  SOCIAL: ['POST_LIKE', 'POST_COMMENT', 'POST_TAG', 'NEW_FOLLOWER'],
  MEETUPS: ['MEETUP_INVITATION', 'MEETUP_ACCEPTED', 'MATCH_FOUND'],
  SYSTEM: ['PAYMENT_RECEIVED', 'RANKING_UPDATE'],
};

export function notificationMatchesCategory(
  type: string,
  category: NotificationCategory,
): boolean {
  if (category === 'ALL') {
    return true;
  }
  return NOTIFICATION_CATEGORY_TYPES[category].includes(type);
}
