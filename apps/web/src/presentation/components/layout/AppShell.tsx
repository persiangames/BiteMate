import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { isChatThreadPath } from '@/presentation/utils/chatTime';

export function AppShell() {
  const { pathname } = useLocation();
  const immersive = isChatThreadPath(pathname);

  return (
    <div className={`app-shell${immersive ? ' app-shell--immersive' : ''}`}>
      <div className="app-shell__content">
        <Outlet />
      </div>
      {immersive ? null : <BottomNav />}
    </div>
  );
}
