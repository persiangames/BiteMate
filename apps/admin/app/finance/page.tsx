'use client';

import { useEffect, useState } from 'react';
import type {
  AdminCommissionDto,
  AdminCommissionsResponseDto,
  AdminTransactionsResponseDto,
} from '@bitemate/shared';
import { AdminShell } from '@/components/AdminShell';
import { StatusPill } from '@/components/ui';
import { useAdminAuth } from '@/lib/auth';

type Tab = 'transactions' | 'payouts' | 'commissions';

export default function FinancePage() {
  const { request, hasPermission } = useAdminAuth();
  const [tab, setTab] = useState<Tab>('transactions');
  const [transactions, setTransactions] = useState<AdminTransactionsResponseDto | null>(null);
  const [commissions, setCommissions] = useState<AdminCommissionsResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load(nextTab = tab) {
    if (nextTab === 'commissions') {
      setCommissions(await request<AdminCommissionsResponseDto>('/admin/finance/commissions?limit=40'));
      return;
    }
    const path =
      nextTab === 'payouts'
        ? '/admin/finance/payouts?limit=40'
        : '/admin/finance/transactions?limit=40';
    setTransactions(await request<AdminTransactionsResponseDto>(path));
  }

  useEffect(() => {
    if (!hasPermission('finance')) {
      setError('Finance access is limited to platform admins');
      return;
    }
    load().catch((err) => setError(err instanceof Error ? err.message : 'Failed to load finance data'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateCommission(item: AdminCommissionDto, status: 'APPROVED' | 'PAID' | 'REJECTED') {
    await request(`/admin/finance/commissions/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    await load('commissions');
  }

  return (
    <AdminShell>
      <h1 className="text-2xl font-semibold">Finance</h1>
      <p className="mt-1 text-sm text-slate-500">Wallet transactions, commissions, and payouts.</p>

      <div className="mt-6 flex gap-2">
        {(['transactions', 'payouts', 'commissions'] as Tab[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setTab(item);
              void load(item);
            }}
            className={`rounded-full px-4 py-1.5 text-sm capitalize ${
              tab === item ? 'bg-brand text-white' : 'bg-white text-slate-600'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      {tab !== 'commissions' && (
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Fee</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {transactions?.items.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-4 py-3">
                    {row.userName ?? row.userEmail}
                    <p className="text-xs text-slate-500">{row.description ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3">{row.type}</td>
                  <td className="px-4 py-3">${row.amount.toFixed(2)}</td>
                  <td className="px-4 py-3">${row.fee.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <StatusPill value={row.status} tone={row.status === 'COMPLETED' ? 'ok' : 'warn'} />
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(row.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'commissions' && (
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">Referrer</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {commissions?.items.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-4 py-3">{row.referrerName ?? row.referrerEmail}</td>
                  <td className="px-4 py-3">{row.sourceType}</td>
                  <td className="px-4 py-3">${row.amount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <StatusPill value={row.status} tone={row.status === 'PAID' ? 'ok' : 'warn'} />
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {row.status === 'PENDING' && (
                      <button type="button" className="text-emerald-600 hover:underline" onClick={() => void updateCommission(row, 'APPROVED')}>
                        Approve
                      </button>
                    )}
                    {row.status !== 'PAID' && row.status !== 'REJECTED' && (
                      <button type="button" className="text-brand hover:underline" onClick={() => void updateCommission(row, 'PAID')}>
                        Mark paid
                      </button>
                    )}
                    {row.status !== 'REJECTED' && (
                      <button type="button" className="text-rose-600 hover:underline" onClick={() => void updateCommission(row, 'REJECTED')}>
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
