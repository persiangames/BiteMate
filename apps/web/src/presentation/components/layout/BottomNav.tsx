import { NavLink, useLocation } from 'react-router-dom';
import { useI18n } from '@/presentation/context/I18nContext';
import {
  NavChatIcon,
  NavFeedIcon,
  NavMeetupsIcon,
  NavNearbyIcon,
  NavProfileIcon,
} from '@/presentation/components/layout/NavIcons';

const TABS = [
  { to: '/feed', match: ['/feed'], icon: NavFeedIcon },
  { to: '/discover', match: ['/discover', '/marketplace'], icon: NavNearbyIcon },
  { to: '/meetups', match: ['/meetups'], icon: NavMeetupsIcon },
  { to: '/chats', match: ['/chats'], icon: NavChatIcon },
  { to: '/profile', match: ['/profile', '/settings', '/wallet', '/notifications', '/rankings', '/premium', '/bookings', '/u/'], icon: NavProfileIcon },
] as const;

function isTabActive(pathname: string, match: readonly string[]) {
  return match.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(prefix));
}

export function BottomNav() {
  const { t, locale } = useI18n();
  const { pathname } = useLocation();
  const labels = {
    '/feed': t('nav.feed'),
    '/discover': t('nav.nearby'),
    '/meetups': t('nav.meetups'),
    '/chats': t('nav.chat'),
    '/profile': t('nav.profile'),
  } as const;

  return (
    <nav className="bottom-nav" aria-label={t('nav.main')} lang={locale}>
      {TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={`bottom-nav__item${isTabActive(pathname, tab.match) ? ' active' : ''}`}
          >
            <span className="bottom-nav__icon" aria-hidden>
              <Icon />
            </span>
            <span>{labels[tab.to]}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
