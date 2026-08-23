'use client';

import { useEffect, useState } from 'react';
import type { AdminUserDto, AdminUsersResponseDto } from '@bitemate/shared';
import { USER_ROLE_LABELS } from '@bitemate/shared';
import { AdminShell } from '@/components/AdminShell';
import { StatusPill } from '@/components/ui';
import { useAdminAuth } from '@/lib/auth';

export default function UsersPage() {
  const { request } = useAdminAuth();
  const [search, setSearch] = useState('');
  const [data, setData] = useState<AdminUsersResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load(nextSearch = search) {
    const params = new URLSearchParams({ page: '1', limit: '30' });
    if (nextSearch) params.set('search', nextSearch);
    const response = await request<AdminUsersResponseDto>(`/admin/users?${params.toString()}`);
    setData(response);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Failed to load users'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function ban(user: AdminUserDto, banned: boolean) {
    await request(`/admin/users/${user.id}/ban`, {
      method: 'PATCH',
      body: JSON.stringify({ banned }),
    });
    await load();
  }

  async function verify(user: AdminUserDto, verified: boolean) {
    await request(`/admin/users/${user.id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ verified }),
    });
    await load();
  }

  return (
    <AdminShell>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="mt-1 text-sm text-slate-500">Ban, unban, and verify accounts.</p>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void load(search).catch((err) => setError(err instanceof Error ? err.message : 'Search failed'));
          }}
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search email, name, phone"
            className="w-72 rounded-xl border border-slate-200 px-3 py-2"
          />
        </form>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-3">
                  <p className="font-medium">{user.fullName ?? user.username ?? 'Unnamed'}</p>
                  <p className="text-xs text-slate-500">{user.email ?? user.phoneNumber}</p>
                </td>
                <td className="px-4 py-3">{user.role ? USER_ROLE_LABELS[user.role] : '—'}</td>
                <td className="px-4 py-3 space-x-1">
                  <StatusPill value={user.isActive ? 'Active' : 'Banned'} tone={user.isActive ? 'ok' : 'danger'} />
                  {user.adminVerified ? <StatusPill value="Verified" tone="ok" /> : null}
                  {user.isPremium ? <StatusPill value="Premium" tone="warn" /> : null}
                </td>
                <td className="px-4 py-3">{user.level}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    type="button"
                    className="text-brand hover:underline"
                    onClick={() => void verify(user, !user.adminVerified)}
                  >
                    {user.adminVerified ? 'Unverify' : 'Verify'}
                  </button>
                  <button
                    type="button"
                    className="text-rose-600 hover:underline"
                    onClick={() => void ban(user, user.isActive)}
                  >
                    {user.isActive ? 'Ban' : 'Unban'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data?.items.length ? <p className="px-4 py-8 text-center text-slate-500">No users found.</p> : null}
      </div>
    </AdminShell>
  );
}
