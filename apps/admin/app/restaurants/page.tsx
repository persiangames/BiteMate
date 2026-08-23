'use client';

import { useEffect, useState } from 'react';
import type { AdminRestaurantDto, AdminRestaurantsResponseDto } from '@bitemate/shared';
import { AdminShell } from '@/components/AdminShell';
import { StatusPill } from '@/components/ui';
import { useAdminAuth } from '@/lib/auth';

export default function RestaurantsPage() {
  const { request } = useAdminAuth();
  const [data, setData] = useState<AdminRestaurantsResponseDto | null>(null);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function load(approvalStatus = filter) {
    const params = new URLSearchParams({ page: '1', limit: '30' });
    if (approvalStatus) params.set('approvalStatus', approvalStatus);
    setData(await request<AdminRestaurantsResponseDto>(`/admin/restaurants?${params.toString()}`));
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Failed to load restaurants'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function update(restaurant: AdminRestaurantDto, body: Record<string, unknown>) {
    await request(`/admin/restaurants/${restaurant.id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    await load(filter);
  }

  return (
    <AdminShell>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Restaurants</h1>
          <p className="mt-1 text-sm text-slate-500">Approve listings and manage visibility.</p>
        </div>
        <select
          value={filter}
          onChange={(event) => {
            setFilter(event.target.value);
            void load(event.target.value);
          }}
          className="rounded-xl border border-slate-200 px-3 py-2"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Restaurant</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((restaurant) => (
              <tr key={restaurant.id} className="border-t">
                <td className="px-4 py-3">
                  <p className="font-medium">{restaurant.name}</p>
                  <p className="text-xs text-slate-500">
                    {restaurant.city ?? '—'} · {restaurant.cuisineTypes.join(', ') || 'No cuisine'}
                  </p>
                </td>
                <td className="px-4 py-3">
                  {restaurant.ownerName ?? '—'}
                  <p className="text-xs text-slate-500">{restaurant.ownerEmail}</p>
                </td>
                <td className="px-4 py-3 space-x-1">
                  <StatusPill
                    value={restaurant.approvalStatus}
                    tone={
                      restaurant.approvalStatus === 'APPROVED'
                        ? 'ok'
                        : restaurant.approvalStatus === 'REJECTED'
                          ? 'danger'
                          : 'warn'
                    }
                  />
                  <StatusPill value={restaurant.isActive ? 'Listed' : 'Hidden'} tone={restaurant.isActive ? 'ok' : 'neutral'} />
                </td>
                <td className="px-4 py-3">{restaurant.averageRating.toFixed(1)} ({restaurant.reviewCount})</td>
                <td className="px-4 py-3 text-right space-x-2">
                  {restaurant.approvalStatus !== 'APPROVED' && (
                    <button
                      type="button"
                      className="text-emerald-600 hover:underline"
                      onClick={() => void update(restaurant, { approvalStatus: 'APPROVED' })}
                    >
                      Approve
                    </button>
                  )}
                  {restaurant.approvalStatus !== 'REJECTED' && (
                    <button
                      type="button"
                      className="text-rose-600 hover:underline"
                      onClick={() => void update(restaurant, { approvalStatus: 'REJECTED' })}
                    >
                      Reject
                    </button>
                  )}
                  <button
                    type="button"
                    className="text-slate-600 hover:underline"
                    onClick={() => void update(restaurant, { isActive: !restaurant.isActive })}
                  >
                    {restaurant.isActive ? 'Hide' : 'Show'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data?.items.length ? <p className="px-4 py-8 text-center text-slate-500">No restaurants found.</p> : null}
      </div>
    </AdminShell>
  );
}
