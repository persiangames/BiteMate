import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type {
  BankAccountDto,
  CryptoAddressDto,
  CryptoAsset,
  WalletTransactionDto,
} from '@bitemate/shared';
import {
  addBankAccount,
  cryptoWithdraw,
  depositWallet,
  fetchBankAccounts,
  fetchCryptoAddresses,
  fetchWalletBalance,
  fetchWalletTransactions,
  setDefaultBankAccount,
  transferWallet,
  verifyBankAccount,
  withdrawWallet,
} from '@/data/repositories/walletRepository';
import { countrySelectOptions } from '@/data/localize';
import { SearchableSelect } from '@/presentation/components/SearchableSelect';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';

const API_CRYPTO: CryptoAsset[] = ['BTC', 'ETH', 'USDT', 'USDC', 'DOGE', 'SOL'];

const CRYPTO_UI = [
  { id: 'BTC', name: 'Bitcoin', color: '#F7931A' },
  { id: 'ETH', name: 'Ethereum', color: '#627EEA' },
  { id: 'DOGE', name: 'Dogecoin', color: '#C2A633' },
  { id: 'XRP', name: 'Ripple', color: '#23292F' },
  { id: 'USDT', name: 'Tether', color: '#26A17B' },
  { id: 'USDC', name: 'USD Coin', color: '#2775CA' },
  { id: 'SOL', name: 'Solana', color: '#9945FF' },
] as const;

type WalletTab = 'overview' | 'cards' | 'crypto';

export function WalletPage() {
  const { accessToken, user } = useAuth();
  const { t, locale } = useI18n();
  const [tab, setTab] = useState<WalletTab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [available, setAvailable] = useState(0);
  const [pending, setPending] = useState(0);
  const [escrowHeld, setEscrowHeld] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [transactions, setTransactions] = useState<WalletTransactionDto[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccountDto[]>([]);
  const [cryptoAddresses, setCryptoAddresses] = useState<CryptoAddressDto[]>([]);
  const [depositAmount, setDepositAmount] = useState('25');
  const [withdrawAmount, setWithdrawAmount] = useState('10');
  const [withdrawBankId, setWithdrawBankId] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('5');
  const [cryptoAsset, setCryptoAsset] = useState<CryptoAsset>('BTC');
  const [cryptoAmount, setCryptoAmount] = useState('0.001');
  const [cryptoDestination, setCryptoDestination] = useState('');
  const [cardBrand, setCardBrand] = useState<'VISA' | 'MASTERCARD' | 'LOCAL'>('VISA');
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountHolderName: user?.fullName ?? '',
    country: user?.country ?? '',
    accountNumber: '',
    routingNumber: '',
  });
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyAccountId, setVerifyAccountId] = useState('');
  const [pendingVerifyCode, setPendingVerifyCode] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const countryOptions = countrySelectOptions(locale);

  const reload = useCallback(async () => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);
    try {
      const [balance, txResponse, accounts, addresses] = await Promise.all([
        fetchWalletBalance(accessToken),
        fetchWalletTransactions(accessToken),
        fetchBankAccounts(accessToken),
        fetchCryptoAddresses(accessToken),
      ]);

      setAvailable(balance.fiat.available);
      setPending(balance.fiat.pending);
      setEscrowHeld(balance.escrowHeld);
      setCurrency(balance.fiat.currency);
      setTransactions(txResponse.items);
      setBankAccounts(accounts);
      setCryptoAddresses(addresses);
      if (!withdrawBankId && accounts.length > 0) {
        const defaultAccount = accounts.find((a) => a.isDefault) ?? accounts[0];
        setWithdrawBankId(defaultAccount.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('wallet.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [accessToken, t, withdrawBankId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function handleDeposit() {
    if (!accessToken) return;
    setActionMessage(null);
    try {
      const response = await depositWallet(accessToken, { amount: Number(depositAmount) });
      setActionMessage(
        response.clientSecret
          ? t('wallet.deposit.stripePending')
          : t('wallet.deposit.success', { amount: response.transaction.netAmount, currency: response.transaction.currency }),
      );
      await reload();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : t('wallet.deposit.failed'));
    }
  }

  async function handleWithdraw() {
    if (!accessToken || !withdrawBankId) return;
    setActionMessage(null);
    try {
      await withdrawWallet(accessToken, { amount: Number(withdrawAmount), bankAccountId: withdrawBankId });
      setActionMessage(t('wallet.withdraw.submitted'));
      await reload();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : t('wallet.withdraw.failed'));
    }
  }

  async function handleTransfer() {
    if (!accessToken) return;
    setActionMessage(null);
    try {
      await transferWallet(accessToken, { recipientUserId: transferRecipient, amount: Number(transferAmount) });
      setActionMessage(t('wallet.transfer.success'));
      await reload();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : t('wallet.transfer.failed'));
    }
  }

  async function handleAddBank() {
    if (!accessToken) return;
    setActionMessage(null);
    try {
      const label =
        cardBrand === 'VISA'
          ? 'Visa'
          : cardBrand === 'MASTERCARD'
            ? 'Mastercard'
            : bankForm.bankName;
      const created = await addBankAccount(accessToken, {
        ...bankForm,
        bankName: label || bankForm.bankName,
        setAsDefault: bankAccounts.length === 0,
      });
      if (created.verificationCode) {
        setPendingVerifyCode(created.verificationCode);
        setVerifyAccountId(created.id);
      }
      setActionMessage(t('wallet.card.added'));
      setBankForm((current) => ({
        ...current,
        bankName: '',
        accountNumber: '',
        routingNumber: '',
      }));
      await reload();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : t('wallet.card.failed'));
    }
  }

  async function handleVerifyBank() {
    if (!accessToken || !verifyAccountId) return;
    setActionMessage(null);
    try {
      await verifyBankAccount(accessToken, verifyAccountId, { verificationCode: verifyCode });
      setPendingVerifyCode(null);
      setVerifyCode('');
      setActionMessage(t('wallet.card.verified'));
      await reload();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : t('wallet.card.verifyFailed'));
    }
  }

  async function handleCryptoWithdraw() {
    if (!accessToken || !API_CRYPTO.includes(cryptoAsset)) return;
    setActionMessage(null);
    try {
      await cryptoWithdraw(accessToken, {
        asset: cryptoAsset,
        amount: Number(cryptoAmount),
        destinationAddress: cryptoDestination,
      });
      setActionMessage(t('wallet.crypto.withdrawSubmitted'));
      await reload();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : t('wallet.crypto.withdrawFailed'));
    }
  }

  const selectedCrypto = cryptoAddresses.find((entry) => entry.asset === cryptoAsset);
  const linkedCards = bankAccounts.length;

  return (
    <main className="page wallet-page">
      <section className="wallet-hero">
        <div className="wallet-hero__top">
          <div>
            <p className="wallet-hero__eyebrow">{t('wallet.title')}</p>
            <h1>
              {loading ? '—' : `${available.toFixed(2)}`} <span>{currency}</span>
            </h1>
            <p className="hint">
              {t('wallet.pending')}: {pending.toFixed(2)} · {t('wallet.escrow')}: {escrowHeld.toFixed(2)}
            </p>
          </div>
          <Link to="/profile" className="wallet-hero__profile">
            @{user?.username ?? 'profile'}
          </Link>
        </div>
        <div className="wallet-tabs">
          {(['overview', 'cards', 'crypto'] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={`wallet-tabs__btn${tab === item ? ' is-active' : ''}`}
              onClick={() => setTab(item)}
            >
              {t(`wallet.tab.${item}`)}
            </button>
          ))}
        </div>
      </section>

      {error ? <p className="error wallet-page__message">{error}</p> : null}
      {actionMessage ? <p className="hint wallet-page__message">{actionMessage}</p> : null}

      {tab === 'overview' ? (
        <section className="wallet-grid">
          <article className="wallet-panel flow">
            <h2>{t('wallet.topUp.title')}</h2>
            <p className="hint">{t('wallet.topUp.hint')}</p>
            <label className="field">
              <span>{t('wallet.amount')}</span>
              <input type="number" min="1" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
            </label>
            <button type="button" className="btn-primary" onClick={() => void handleDeposit()}>
              {t('wallet.topUp.action')}
            </button>
          </article>

          <article className="wallet-panel flow">
            <h2>{t('wallet.transfer.title')}</h2>
            <label className="field">
              <span>{t('wallet.transfer.recipient')}</span>
              <input value={transferRecipient} onChange={(e) => setTransferRecipient(e.target.value)} placeholder="@username" />
            </label>
            <label className="field">
              <span>{t('wallet.amount')}</span>
              <input type="number" min="0.01" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} />
            </label>
            <button type="button" className="btn-secondary" onClick={() => void handleTransfer()}>
              {t('wallet.transfer.action')}
            </button>
          </article>

          <article className="wallet-panel flow">
            <h2>{t('wallet.withdraw.title')}</h2>
            <label className="field">
              <span>{t('wallet.amount')}</span>
              <input type="number" min="1" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
            </label>
            <label className="field">
              <span>{t('wallet.withdraw.account')}</span>
              <select value={withdrawBankId} onChange={(e) => setWithdrawBankId(e.target.value)}>
                <option value="">{t('wallet.withdraw.selectAccount')}</option>
                {bankAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.bankName} •••• {account.last4} ({account.status})
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="btn-secondary" onClick={() => void handleWithdraw()}>
              {t('wallet.withdraw.action')}
            </button>
          </article>

          <article className="wallet-panel wallet-panel--wide">
            <h2>{t('wallet.history')}</h2>
            {transactions.length === 0 ? <p className="hint">{t('wallet.historyEmpty')}</p> : null}
            <ul className="wallet-tx-list">
              {transactions.map((tx) => (
                <li key={tx.id} className="wallet-tx">
                  <div>
                    <strong>{tx.type}</strong>
                    <span className="hint">{new Date(tx.createdAt).toLocaleString(locale)}</span>
                  </div>
                  <div className="wallet-tx__amount">
                    {tx.cryptoAsset
                      ? `${tx.cryptoAmount} ${tx.cryptoAsset}`
                      : `${tx.amount} ${tx.currency}`}
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </section>
      ) : null}

      {tab === 'cards' ? (
        <section className="wallet-grid">
          <article className="wallet-panel wallet-panel--wide flow">
            <h2>{t('wallet.cards.title')}</h2>
            <p className="hint">{t('wallet.cards.hint')}</p>
            <div className="wallet-card-grid">
              {bankAccounts.map((account) => (
                <div
                  key={account.id}
                  className={`wallet-card wallet-card--${account.bankName.toLowerCase().includes('visa') ? 'visa' : account.bankName.toLowerCase().includes('master') ? 'mastercard' : 'bank'}${account.isDefault ? ' is-default' : ''}`}
                >
                  <span className="wallet-card__brand">{account.bankName}</span>
                  <span className="wallet-card__number">•••• •••• •••• {account.last4}</span>
                  <span className="wallet-card__meta">{account.status}{account.isDefault ? ` · ${t('wallet.cards.default')}` : ''}</span>
                  {account.status === 'VERIFIED' && !account.isDefault ? (
                    <button type="button" className="wallet-card__action" onClick={() => void setDefaultBankAccount(accessToken!, account.id).then(() => reload())}>
                      {t('wallet.cards.makeDefault')}
                    </button>
                  ) : null}
                </div>
              ))}
              {linkedCards === 0 ? (
                <div className="wallet-card wallet-card--empty">
                  <p>{t('wallet.cards.empty')}</p>
                </div>
              ) : null}
            </div>
          </article>

          <article className="wallet-panel flow">
            <h2>{t('wallet.cards.add')}</h2>
            <div className="filter-row">
              {(['VISA', 'MASTERCARD', 'LOCAL'] as const).map((brand) => (
                <button
                  key={brand}
                  type="button"
                  className={`filter-chip${cardBrand === brand ? ' active' : ''}`}
                  onClick={() => setCardBrand(brand)}
                >
                  {t(`wallet.cards.brand.${brand}`)}
                </button>
              ))}
            </div>
            {cardBrand === 'LOCAL' ? (
              <label className="field">
                <span>{t('wallet.cards.bankName')}</span>
                <input value={bankForm.bankName} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} />
              </label>
            ) : null}
            <label className="field">
              <span>{t('wallet.cards.holder')}</span>
              <input value={bankForm.accountHolderName} onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })} />
            </label>
            <SearchableSelect
              label={t('profile.country')}
              value={bankForm.country}
              options={countryOptions}
              placeholder={t('auth.searchHint')}
              onChange={(country) => setBankForm({ ...bankForm, country })}
            />
            <label className="field">
              <span>{t('wallet.cards.number')}</span>
              <input value={bankForm.accountNumber} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })} inputMode="numeric" />
            </label>
            <label className="field">
              <span>{t('wallet.cards.routing')}</span>
              <input value={bankForm.routingNumber} onChange={(e) => setBankForm({ ...bankForm, routingNumber: e.target.value })} />
            </label>
            <button type="button" className="btn-primary" onClick={() => void handleAddBank()}>
              {t('wallet.cards.link')}
            </button>
            {(pendingVerifyCode || verifyAccountId) ? (
              <div className="flow">
                {pendingVerifyCode ? <p className="hint">{t('wallet.cards.devCode', { code: pendingVerifyCode })}</p> : null}
                <label className="field">
                  <span>{t('otp.code')}</span>
                  <input value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} />
                </label>
                <button type="button" className="btn-secondary" onClick={() => void handleVerifyBank()}>
                  {t('wallet.cards.verify')}
                </button>
              </div>
            ) : null}
          </article>
        </section>
      ) : null}

      {tab === 'crypto' ? (
        <section className="wallet-grid">
          <article className="wallet-panel wallet-panel--wide">
            <h2>{t('wallet.crypto.title')}</h2>
            <p className="hint">{t('wallet.crypto.hint')}</p>
            <div className="wallet-crypto-grid">
              {CRYPTO_UI.map((coin) => {
                const linked = cryptoAddresses.some((entry) => entry.asset === coin.id);
                const supported = API_CRYPTO.includes(coin.id as CryptoAsset);
                return (
                  <button
                    key={coin.id}
                    type="button"
                    className={`wallet-crypto-chip${cryptoAsset === coin.id ? ' is-active' : ''}${linked ? ' is-linked' : ''}`}
                    style={{ '--coin-color': coin.color } as CSSProperties}
                    onClick={() => {
                      if (supported) setCryptoAsset(coin.id as CryptoAsset);
                    }}
                  >
                    <strong>{coin.id}</strong>
                    <span>{coin.name}</span>
                    <span className="hint">{linked ? t('wallet.crypto.linked') : supported ? t('wallet.crypto.available') : t('wallet.crypto.soon')}</span>
                  </button>
                );
              })}
            </div>
          </article>

          {selectedCrypto && API_CRYPTO.includes(cryptoAsset) ? (
            <article className="wallet-panel flow">
              <h2>{t('wallet.crypto.deposit', { asset: cryptoAsset })}</h2>
              <p className="wallet-crypto-address"><code>{selectedCrypto.address}</code></p>
              <img src={selectedCrypto.qrCodeDataUrl} alt="" width={180} height={180} className="wallet-crypto-qr" />
            </article>
          ) : null}

          <article className="wallet-panel flow">
            <h2>{t('wallet.crypto.withdrawTitle')}</h2>
            {!API_CRYPTO.includes(cryptoAsset) ? (
              <p className="hint">{t('wallet.crypto.soon')}</p>
            ) : (
              <>
                <label className="field">
                  <span>{t('wallet.amount')}</span>
                  <input type="number" min="0.00001" step="any" value={cryptoAmount} onChange={(e) => setCryptoAmount(e.target.value)} />
                </label>
                <label className="field">
                  <span>{t('wallet.crypto.destination')}</span>
                  <input value={cryptoDestination} onChange={(e) => setCryptoDestination(e.target.value)} />
                </label>
                <button type="button" className="btn-secondary" onClick={() => void handleCryptoWithdraw()}>
                  {t('wallet.crypto.withdrawAction')}
                </button>
              </>
            )}
          </article>
        </section>
      ) : null}
    </main>
  );
}
