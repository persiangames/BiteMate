import { Outlet, useLocation } from 'react-router-dom';
import { DeviceLocationProvider } from '@/presentation/context/DeviceLocationContext';
import { NotificationProvider } from '@/presentation/context/NotificationContext';
import { AppHeader } from '@/presentation/components/layout/AppHeader';
import { AppPageBackdrop } from '@/presentation/components/layout/AppPageBackdrop';
import { isChatThreadPath } from '@/presentation/utils/chatTime';

export function AuthenticatedLayout() {
  const { pathname } = useLocation();
  const immersive = isChatThreadPath(pathname);

  return (
    <NotificationProvider>
      <DeviceLocationProvider>
        <AppPageBackdrop>
          {immersive ? null : <AppHeader />}
          <Outlet />
        </AppPageBackdrop>
      </DeviceLocationProvider>
    </NotificationProvider>
  );
}
