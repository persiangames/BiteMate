import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchAffiliateCommissions,
  fetchPremiumStatus,
  subscribePremium,
} from '@/data/repositories/growthRepository';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';

export function PremiumPage() {
  const { accessToken } = useAuth();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<Awaited<ReturnType<typeof fetchPremiumStatus>> | null>(
    null,
  );
  const [commissions, setCommissions] = useState<
    Awaited<ReturnType<typeof fetchAffiliateCommissions>> | null
  >(null);

  async function reload() {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const [premiumStatus, affiliateData] = await Promise.all([
        fetchPremiumStatus(accessToken),
        fetchAffiliateCommissions(accessToken),
      ]);
      setStatus(premiumStatus);
      setCommissions(affiliateData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load premium info');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, [accessToken]);

  async function handleSubscribe() {
    if (!accessToken) return;
    setMessage(null);
    try {
      const result = await subscribePremium(accessToken);
      setMessage(
        `Premium active until ${new Date(result.expiresAt).toLocaleDateString()} ($${result.amount})`,
      );
      await reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Subscription failed');
    }
  }

  return (
    <main className="page">
      <section className="panel flow">
        <div className="toolbar">
          <h1>{t('premium.title')}</h1>
          <div className="toolbar-actions flow horizontal">
            <Link to="/rankings">Rankings</Link>
            <Link to="/wallet">Wallet</Link>
          </div>
        </div>

        {loading && <p className="hint">Loading…</p>}
        {error && <p className="error">{error}</p>}
        {message && <p className="hint">{message}</p>}

        {status && (
          <article className="card flow">
            <h2>Premium subscription</h2>
            <p>
              Status: <strong>{status.isPremium ? 'Active' : 'Free'}</strong>
            </p>
            {status.expiresAt && (
              <p>Expires: {new Date(status.expiresAt).toLocaleDateString()}</p>
            )}
            <ul>
              <li>
                {status.benefits.unlimitedInvites
                  ? 'Unlimited meetup invites'
                  : `${status.benefits.dailyInviteLimit} meetup invites per day`}
              </li>
              <li>Removes free-tier limits</li>
              <li>+{status.benefits.visibilityBoost} visibility in matching</li>
              <li>+{status.benefits.priorityRankingBoost} priority ranking boost</li>
              <li>Priority matching boost</li>
            </ul>
            <button type="button" onClick={() => void handleSubscribe()}>
              Subscribe monthly ($9.99 via wallet)
            </button>
          </article>
        )}

        {commissions && (
          <article className="card">
            <h2>Affiliate commissions</h2>
            <p>
              Pending: ${commissions.totalPending.toFixed(2)} · Paid: $
              {commissions.totalPaid.toFixed(2)}
            </p>
            {commissions.items.length === 0 && (
              <p className="hint">No affiliate commissions yet.</p>
            )}
            <ul className="card-list">
              {commissions.items.map((item) => (
                <li key={item.id} className="card">
                  <p>
                    {item.sourceType} · ${item.amount.toFixed(2)} · {item.status}
                  </p>
                  <p className="hint">{new Date(item.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          </article>
        )}
      </section>
    </main>
  );
}
