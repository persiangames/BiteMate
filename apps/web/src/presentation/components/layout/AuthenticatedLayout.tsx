import { Outlet, useLocation } from 'react-router-dom';
import { DeviceLocationProvider } from '@/presentation/context/DeviceLocationContext';
import { NotificationProvider } from '@/presentation/context/NotificationContext';
import { AppHeader } from '@/presentation/components/layout/AppHeader';
import { isChatThreadPath } from '@/presentation/utils/chatTime';

export function AuthenticatedLayout() {
  const { pathname } = useLocation();
  const immersive = isChatThreadPath(pathname);

  return (
    <NotificationProvider>
      <DeviceLocationProvider>
        {immersive ? null : <AppHeader />}
        <Outlet />
      </DeviceLocationProvider>
    </NotificationProvider>
  );
}
