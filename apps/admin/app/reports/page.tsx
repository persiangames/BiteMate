'use client';

import { useEffect, useState } from 'react';
import type {
  AdminAbuseReportDto,
  AdminAbuseReportsResponseDto,
  AdminFraudLogsResponseDto,
} from '@bitemate/shared';
import { AdminShell } from '@/components/AdminShell';
import { StatusPill } from '@/components/ui';
import { useAdminAuth } from '@/lib/auth';

export default function ReportsPage() {
  const { request } = useAdminAuth();
  const [tab, setTab] = useState<'abuse' | 'fraud'>('abuse');
  const [reports, setReports] = useState<AdminAbuseReportsResponseDto | null>(null);
  const [fraud, setFraud] = useState<AdminFraudLogsResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load(nextTab = tab) {
    if (nextTab === 'fraud') {
      setFraud(await request<AdminFraudLogsResponseDto>('/admin/fraud?limit=40&minRiskScore=0'));
      return;
    }
    setReports(await request<AdminAbuseReportsResponseDto>('/admin/reports?limit=40'));
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Failed to load reports'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function resolve(report: AdminAbuseReportDto, status: 'REVIEWING' | 'RESOLVED' | 'DISMISSED') {
    await request(`/admin/reports/${report.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    await load('abuse');
  }

  return (
    <AdminShell>
      <h1 className="text-2xl font-semibold">Reports</h1>
      <p className="mt-1 text-sm text-slate-500">Abuse reports and fraud detection events.</p>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => {
            setTab('abuse');
            void load('abuse');
          }}
          className={`rounded-full px-4 py-1.5 text-sm ${tab === 'abuse' ? 'bg-brand text-white' : 'bg-white text-slate-600'}`}
        >
          Abuse reports
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('fraud');
            void load('fraud');
          }}
          className={`rounded-full px-4 py-1.5 text-sm ${tab === 'fraud' ? 'bg-brand text-white' : 'bg-white text-slate-600'}`}
        >
          Fraud logs {fraud ? `(${fraud.highRiskCount} high risk)` : ''}
        </button>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      {tab === 'abuse' && (
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">Reporter</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports?.items.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-4 py-3">{row.reporterName ?? row.reporterEmail}</td>
                  <td className="px-4 py-3">
                    {row.targetType}
                    <p className="text-xs text-slate-500">{row.targetId}</p>
                  </td>
                  <td className="px-4 py-3">
                    {row.reason}
                    {row.details ? <p className="text-xs text-slate-500">{row.details}</p> : null}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill
                      value={row.status}
                      tone={row.status === 'RESOLVED' ? 'ok' : row.status === 'OPEN' ? 'warn' : 'neutral'}
                    />
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button type="button" className="text-slate-600 hover:underline" onClick={() => void resolve(row, 'REVIEWING')}>
                      Review
                    </button>
                    <button type="button" className="text-emerald-600 hover:underline" onClick={() => void resolve(row, 'RESOLVED')}>
                      Resolve
                    </button>
                    <button type="button" className="text-rose-600 hover:underline" onClick={() => void resolve(row, 'DISMISSED')}>
                      Dismiss
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'fraud' && (
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Risk</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {fraud?.items.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-4 py-3">{row.userName ?? row.userEmail}</td>
                  <td className="px-4 py-3">{row.action}</td>
                  <td className="px-4 py-3">
                    <StatusPill
                      value={String(row.riskScore)}
                      tone={row.riskScore >= 60 ? 'danger' : row.riskScore >= 30 ? 'warn' : 'neutral'}
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-500">{row.ipAddress ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(row.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
