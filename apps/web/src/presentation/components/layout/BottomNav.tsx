import { NavLink, useLocation } from 'react-router-dom';
import { useI18n } from '@/presentation/context/I18nContext';
import { useRequireAuthNavigate } from '@/presentation/routing/useRequireAuthNavigate';
import {
  NavChatIcon,
  NavFeedIcon,
  NavMeetupsIcon,
  NavNearbyIcon,
  NavPeopleIcon,
  NavProfileIcon,
} from '@/presentation/components/layout/NavIcons';

const TABS = [
  { to: '/feed', match: ['/feed'], icon: NavFeedIcon, labelKey: 'nav.feed' },
  { to: '/discover', match: ['/discover', '/marketplace'], icon: NavNearbyIcon, labelKey: 'nav.nearby' },
  { to: '/meetups', match: ['/meetups'], icon: NavMeetupsIcon, labelKey: 'nav.meetups' },
  { to: '/chats', match: ['/chats'], icon: NavChatIcon, labelKey: 'nav.chat' },
  { to: '/people', match: ['/people', '/search'], icon: NavPeopleIcon, labelKey: 'nav.people' },
  { to: '/profile', match: ['/profile', '/settings', '/wallet', '/notifications', '/rankings', '/premium', '/bookings', '/u/'], icon: NavProfileIcon, labelKey: 'nav.profile' },
] as const;

function isTabActive(pathname: string, match: readonly string[]) {
  return match.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(prefix));
}

export function BottomNav() {
  const { t, locale } = useI18n();
  const { pathname } = useLocation();
  const requireAuth = useRequireAuthNavigate();

  return (
    <nav className="bottom-nav" aria-label={t('nav.main')} lang={locale}>
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = isTabActive(pathname, tab.match);
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            aria-label={t(tab.labelKey)}
            aria-current={active ? 'page' : undefined}
            className={`bottom-nav__item${active ? ' active' : ''}`}
            onClick={(event) => {
              if (!requireAuth(tab.to)) {
                event.preventDefault();
              }
            }}
          >
            <span className="bottom-nav__icon" aria-hidden>
              <Icon />
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
