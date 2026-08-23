'use client';

import { useEffect, useState } from 'react';
import type { AdminAnalyticsDto, AdminAuditLogDto } from '@bitemate/shared';
import { AdminShell } from '@/components/AdminShell';
import { StatCard } from '@/components/ui';
import { useAdminAuth } from '@/lib/auth';

export default function DashboardPage() {
  const { request } = useAdminAuth();
  const [analytics, setAnalytics] = useState<AdminAnalyticsDto | null>(null);
  const [audit, setAudit] = useState<AdminAuditLogDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      request<AdminAnalyticsDto>('/admin/analytics'),
      request<AdminAuditLogDto[]>('/admin/audit'),
    ])
      .then(([nextAnalytics, nextAudit]) => {
        setAnalytics(nextAnalytics);
        setAudit(nextAudit);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboard'));
  }, [request]);

  return (
    <AdminShell>
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <p className="mt-1 text-sm text-slate-500">Daily activity, meetups, and revenue.</p>
      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      {analytics && (
        <>
          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total users" value={analytics.users.total} hint={`${analytics.users.newToday} new today`} />
            <StatCard label="DAU" value={analytics.users.activeToday} hint={`${analytics.users.premium} premium`} />
            <StatCard label="Meetups today" value={analytics.meetups.createdToday} hint={`${analytics.meetups.completed} completed total`} />
            <StatCard
              label="Revenue (30d)"
              value={`$${analytics.revenue.last30Days.toFixed(2)}`}
              hint={`$${analytics.revenue.today.toFixed(2)} today`}
            />
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <StatCard label="Open meetups" value={analytics.meetups.open} />
            <StatCard label="Pending restaurants" value={analytics.restaurants.pending} />
            <StatCard label="Open abuse reports" value={analytics.reports.openAbuse} hint={`${analytics.reports.highRiskFraud} high-risk fraud events`} />
          </section>
        </>
      )}

      <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Recent admin actions</h2>
        {audit.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No audit events yet.</p>
        ) : (
          <ul className="mt-3 divide-y">
            {audit.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-3 text-sm">
                <span>
                  <strong>{item.action}</strong> · {item.targetType}
                </span>
                <span className="text-slate-400">
                  {item.adminEmail} · {new Date(item.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}
