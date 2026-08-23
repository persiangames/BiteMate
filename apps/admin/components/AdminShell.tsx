'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { USER_ROLE_LABELS, type AdminPermission } from '@bitemate/shared';
import { useAdminAuth } from '@/lib/auth';

const NAV: Array<{ href: string; label: string; permission: AdminPermission }> = [
  { href: '/', label: 'Dashboard', permission: 'analytics' },
  { href: '/users', label: 'Users', permission: 'users' },
  { href: '/restaurants', label: 'Restaurants', permission: 'restaurants' },
  { href: '/finance', label: 'Finance', permission: 'finance' },
  { href: '/reports', label: 'Reports', permission: 'reports' },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, loading, logout, hasPermission } = useAdminAuth();

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/login');
    }
  }, [loading, router, session]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading admin console…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 flex w-64 flex-col bg-slate-950 text-white">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <img
              src="/brand/icon-64.png"
              srcSet="/brand/icon-32.png 1x, /brand/icon-64.png 2x"
              alt="BiteMate"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-brand">BiteMate</p>
              <h1 className="mt-0.5 text-lg font-semibold">Admin Console</h1>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.filter((item) => hasPermission(item.permission)).map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm ${
                  active ? 'bg-brand text-white' : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 px-4 py-4 text-sm">
          <p className="truncate font-medium">{session.profile.fullName ?? session.profile.email}</p>
          <p className="text-xs text-slate-400">
            {USER_ROLE_LABELS[session.profile.role] ?? session.profile.role}
          </p>
          <button
            type="button"
            onClick={() => void logout()}
            className="mt-3 text-xs text-slate-400 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
